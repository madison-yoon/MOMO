package com.momo.backend.rag.service;

import com.momo.backend.rag.event.ReviewIndexEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Durable, per-review ordered queue.
 *
 * Claim uses a conditional UPDATE rather than relying on process-local locks. Competing
 * instances may read the same candidate, but only one can transition it to a live lease.
 */
@Repository
@RequiredArgsConstructor
@ConditionalOnProperty(name = "RAG_ENABLED", havingValue = "true")
public class ReviewIndexOutboxStore {
    private static final String NEXT_SQL = """
            SELECT current.id, current.review_id, current.operation, current.attempt_count
              FROM review_index_outbox current
             WHERE (
                    (current.status = 'PENDING' AND current.available_at <= CURRENT_TIMESTAMP(6))
                 OR (current.status = 'PROCESSING' AND current.locked_until <= CURRENT_TIMESTAMP(6))
             )
               AND NOT EXISTS (
                    SELECT 1
                      FROM review_index_outbox earlier
                     WHERE earlier.review_id = current.review_id
                       AND earlier.id < current.id
                       AND earlier.status IN ('PENDING', 'PROCESSING')
               )
             ORDER BY current.id
             LIMIT 1
            """;

    private final JdbcTemplate jdbcTemplate;
    @Value("${momo.rag.outbox.lease-ms:30000}")
    private long leaseMillis;

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
    public Optional<ClaimedEvent> claimNext() {
        if (leaseMillis < 5000) {
            throw new IllegalStateException("RAG outbox lease must be at least 5000 ms");
        }

        List<Candidate> candidates = jdbcTemplate.query(
                NEXT_SQL,
                (rs, rowNumber) -> new Candidate(
                        rs.getLong("id"),
                        rs.getLong("review_id"),
                        rs.getString("operation"),
                        rs.getInt("attempt_count")
                )
        );
        if (candidates.isEmpty()) {
            return Optional.empty();
        }

        Candidate candidate = candidates.getFirst();
        String claimToken = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        int claimed = jdbcTemplate.update("""
                UPDATE review_index_outbox
                   SET status = 'PROCESSING',
                       attempt_count = attempt_count + 1,
                       locked_until = ?,
                       claim_token = ?,
                       last_error = NULL
                 WHERE id = ?
                   AND (
                        (status = 'PENDING' AND available_at <= ?)
                     OR (status = 'PROCESSING' AND locked_until <= ?)
                   )
                """,
                now.plusMilliseconds(leaseMillis),
                claimToken,
                candidate.id(),
                now,
                now
        );
        if (claimed != 1) {
            // Another process claimed this row after our candidate read. The next poll retries.
            return Optional.empty();
        }

        ReviewIndexEvent.Operation operation;
        try {
            operation = ReviewIndexEvent.Operation.valueOf(candidate.operation());
        } catch (IllegalArgumentException invalidOperation) {
            // Preserve the queue row for diagnosis; the worker will record a safe retry classification.
            retryClaim(candidate.id(), claimToken, now.plusSeconds(30), "OUTBOX_INVALID_OPERATION");
            return Optional.empty();
        }

        return Optional.of(new ClaimedEvent(
                candidate.id(),
                candidate.reviewId(),
                operation,
                candidate.attemptCount() + 1,
                claimToken
        ));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
    public boolean complete(ClaimedEvent event) {
        return jdbcTemplate.update("""
                UPDATE review_index_outbox
                   SET status = 'DONE',
                       completed_at = CURRENT_TIMESTAMP(6),
                       locked_until = NULL,
                       claim_token = NULL,
                       last_error = NULL
                 WHERE id = ?
                   AND status = 'PROCESSING'
                   AND claim_token = ?
                """, event.id(), event.claimToken()) == 1;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
    public boolean retry(ClaimedEvent event, long delayMillis, String errorCode) {
        if (delayMillis < 0) {
            throw new IllegalArgumentException("RAG outbox retry delay cannot be negative");
        }
        LocalDateTime availableAt = LocalDateTime.now().plusMilliseconds(delayMillis);
        String safeError = errorCode == null ? "OUTBOX_FAILED"
                : errorCode.replaceAll("[^A-Za-z0-9_-]", "_");
        if (safeError.length() > 100) safeError = safeError.substring(0, 100);
        return retryClaim(event.id(), event.claimToken(), availableAt, safeError);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 10)
    public int deleteCompletedBefore(LocalDateTime cutoff) {
        return jdbcTemplate.update("""
                DELETE FROM review_index_outbox
                 WHERE status = 'DONE'
                   AND completed_at < ?
                """, cutoff);
    }

    private boolean retryClaim(long id, String claimToken, LocalDateTime availableAt, String errorCode) {
        return jdbcTemplate.update("""
                UPDATE review_index_outbox
                   SET status = 'PENDING',
                       available_at = ?,
                       locked_until = NULL,
                       claim_token = NULL,
                       last_error = ?
                 WHERE id = ?
                   AND status = 'PROCESSING'
                   AND claim_token = ?
                """, availableAt, errorCode, id, claimToken) == 1;
    }

    private record Candidate(long id, long reviewId, String operation, int attemptCount) { }

    public record ClaimedEvent(
            long id,
            long reviewId,
            ReviewIndexEvent.Operation operation,
            int attemptCount,
            String claimToken
    ) { }
}
