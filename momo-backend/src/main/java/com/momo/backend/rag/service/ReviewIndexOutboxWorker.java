package com.momo.backend.rag.service;

import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.event.ReviewIndexEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Executes committed outbox work outside the review transaction.
 * Failed work is retried with capped exponential backoff; later events for that review
 * remain blocked until the earlier event completes.
 */
@Component
@Slf4j
@ConditionalOnProperty(name = "RAG_ENABLED", havingValue = "true")
public class ReviewIndexOutboxWorker {
    private final RagClient client;
    private final ReviewIndexService indexService;
    private final ReviewIndexOutboxStore store;
    private final long retryBaseMillis;
    private final long retryMaxMillis;
    private final int retentionDays;

    public ReviewIndexOutboxWorker(
            RagClient client,
            ReviewIndexService indexService,
            ReviewIndexOutboxStore store,
            @Value("${momo.rag.outbox.retry-base-ms:1000}") long retryBaseMillis,
            @Value("${momo.rag.outbox.retry-max-ms:300000}") long retryMaxMillis,
            @Value("${momo.rag.outbox.retention-days:30}") int retentionDays
    ) {
        if (retryBaseMillis < 1 || retryMaxMillis < retryBaseMillis || retentionDays < 1) {
            throw new IllegalArgumentException("Invalid RAG outbox retry or retention settings");
        }
        this.client = client;
        this.indexService = indexService;
        this.store = store;
        this.retryBaseMillis = retryBaseMillis;
        this.retryMaxMillis = retryMaxMillis;
        this.retentionDays = retentionDays;
    }

    @Scheduled(fixedDelayString = "${momo.rag.outbox.poll-delay-ms:1000}")
    public void poll() {
        processNext();
    }

    /** Public for deterministic worker tests; each call claims at most one record. */
    public boolean processNext() {
        if (!client.isEnabled()) {
            return false;
        }

        final Optional<ReviewIndexOutboxStore.ClaimedEvent> next;
        try {
            next = store.claimNext();
        } catch (RuntimeException failure) {
            log.warn("RAG outbox claim failed type={}", failure.getClass().getSimpleName());
            return false;
        }
        if (next.isEmpty()) {
            return false;
        }

        ReviewIndexOutboxStore.ClaimedEvent event = next.get();
        try {
            if (event.operation() == ReviewIndexEvent.Operation.UPSERT) {
                ReviewIndexService.Outcome outcome = indexService.indexQueued(event.reviewId());
                if (outcome == ReviewIndexService.Outcome.RETRYABLE) {
                    retry(event, "INDEX_RETRYABLE");
                    return true;
                }
                // FAILED is permanent (for example, provider 4xx) and remains visible in reviews.index_status.
                // SKIPPED means the latest review no longer exists or a newer index generation won.
            } else {
                // DELETE is idempotent; a missing remote chunk is a successful completion.
                indexService.remove(event.reviewId());
            }

            if (!store.complete(event)) {
                log.warn("RAG outbox lease lost before completion id={} reviewId={}", event.id(), event.reviewId());
            }
        } catch (RuntimeException failure) {
            retry(event, "OUTBOX_" + failure.getClass().getSimpleName());
        }
        return true;
    }

    @Scheduled(cron = "${momo.rag.outbox.cleanup-cron:0 0 4 * * *}")
    public void cleanupCompleted() {
        if (!client.isEnabled()) {
            return;
        }
        try {
            int deleted = store.deleteCompletedBeforeDays(retentionDays);
            if (deleted > 0) {
                log.info("RAG outbox completed records cleaned count={}", deleted);
            }
        } catch (RuntimeException failure) {
            log.warn("RAG outbox cleanup failed type={}", failure.getClass().getSimpleName());
        }
    }

    private void retry(ReviewIndexOutboxStore.ClaimedEvent event, String errorCode) {
        long shift = Math.min(Math.max(0, event.attemptCount() - 1), 30);
        long multiplier = 1L << shift;
        long delay;
        try {
            delay = Math.multiplyExact(retryBaseMillis, multiplier);
        } catch (ArithmeticException overflow) {
            delay = retryMaxMillis;
        }
        delay = Math.min(delay, retryMaxMillis);

        try {
            if (store.retry(event, delay, errorCode)) {
                log.warn("RAG outbox scheduled for retry id={} reviewId={} attempt={} delayMs={} code={}",
                        event.id(), event.reviewId(), event.attemptCount(), delay, errorCode);
            } else {
                log.warn("RAG outbox retry lease was lost id={} reviewId={}", event.id(), event.reviewId());
            }
        } catch (RuntimeException retryFailure) {
            // The lease expiry allows another worker to recover this row after a process/DB interruption.
            log.error("RAG outbox retry state write failed id={} type={}",
                    event.id(), retryFailure.getClass().getSimpleName());
        }
    }
}
