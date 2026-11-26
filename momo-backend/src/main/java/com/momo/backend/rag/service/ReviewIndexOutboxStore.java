package com.momo.backend.rag.service;

import com.momo.backend.rag.event.ReviewIndexEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Durable, per-review ordered queue.
 *
 * Candidate reads are intentionally unlocked. A conditional UPDATE grants one worker
 * a time-limited lease; the claim token fences a worker whose lease has expired.
 * Queue timestamps are calculated by MySQL to avoid JVM/database timezone drift.
 */
@Repository
@RequiredArgsConstructor
@ConditionalOnProperty(name = "RAG_ENABLED", havingValue = "true")
public class ReviewIndexOutboxStore {
    private static final String NEXT_SQL = """
            SELECT candidate.id, candidate.review_id, candidate.operation, candidate.attempt_count
              FROM review_index_outbox candidate
             WHERE (
                    (candidate.status = 'PENDING' AND candidate.available_at <= CURRENT_TIMESTAMP(6))
                 OR (candidate.status = 'PROCESSING' AND candidate.locked_until <= CURRENT_TIMESTAMP(6))
             )
               AND NOT EXISTS (
                    SELECT 1
                      FROM review_index_outbox earlier
                     WHERE earlier.review_id = candidate.review_id
                       AND earlier.id < candidate.id
                       AND earlier.status IN ('PENDING', 'PROCESSING')
               )
             ORDER BY candidate.id
             LIMIT 1
            """;

    private final JdbcTemplate jdbcTemplate;

    @Value("${momo.rag.outbox.lease-ms:30000}")
    private long leaseMillis;

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
    public Optional<ClaimedEvent> claimNext() {
        if (leaseMillis < 5000 || leaseMillis > 86_400_000) {
            throw new IllegalStateException("RAG outbox lease must be between 5000 and 86400000 ms");
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
        int claimed = jdbcTemplate.update("""
                UPDATE review_index_outbox
                   SET status = 'PROCESSING',
                       attempt_count = attempt_count + 1,
                       locked_until = TIMESTAMPADD(MICROSECOND, ?, CURRENT_TIMESTAMP(6)),
                       claim_token = ?,
                       last_error = NULL
                 WHERE id = ?
                   AND (
                        (status = 'PENDING' AND available_at <= CURRENT_TIMESTAMP(6))
                     OR (status = 'PROCESSING' AND locked_until <= CURRENT_TIMESTAMP(6))
                   )
                """,
                Math.multiplyExact(leaseMillis, 1000L),
                claimToken,
                candidate.id()
        );
        if (claimed != 1) {
            // A competing process claimed the candidate after our read; retry next poll.
            return Optional.empty();
        }

        ReviewIndexEvent.Operation operation;
        try {
            operation = ReviewIndexEvent.Operation.valueOf(candidate.operation());
        } catch (IllegalArgumentException invalidOperation) {
            // Keep malformed rows diagnosable without blocking all work for this review forever.
            jdbcTemplate.update("""
                    UPDATE review_index_outbox
                       SET status = 'DONE',
                           completed_at = CURRENT_TIMESTAMP(6),
                           locked_until = NULL,
                           claim_token = NULL,
                           last_error = 'OUTBOX_INVALID_OPERATION'
                     WHERE id = ? AND status = 'PROCESSING' AND claim_token = ?
                    """, candidate.id(), claimToken);
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
        if (delayMillis < 0 || delayMillis > 86_400_000) {
            throw new IllegalArgumentException("RAG outbox retry delay must be between 0 and 86400000 ms");
        }
        String safeError = errorCode == null ? "OUTBOX_FAILED"
                : errorCode.replaceAll("[^A-Za-z0-9_-]", "_");
        if (safeError.length() > 100) safeError = safeError.substring(0, 100);

        return jdbcTemplate.update("""
                UPDATE review_index_outbox
                   SET status = 'PENDING',
                       available_at = TIMESTAMPADD(MICROSECOND, ?, CURRENT_TIMESTAMP(6)),
                       locked_until = NULL,
                       claim_token = NULL,
                       last_error = ?
                 WHERE id = ?
                   AND status = 'PROCESSING'
                   AND claim_token = ?
                """, Math.multiplyExact(delayMillis, 1000L), safeError,
                event.id(), event.claimToken()) == 1;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 10)
    public int deleteCompletedBeforeDays(int retentionDays) {
        if (retentionDays < 1 || retentionDays > 3650) {
            throw new IllegalArgumentException("RAG outbox retention must be between 1 and 3650 days");
        }
        return jdbcTemplate.update("""
                DELETE FROM review_index_outbox
                 WHERE status = 'DONE'
                   AND completed_at < TIMESTAMPADD(DAY, ?, CURRENT_TIMESTAMP(6))
                """, -retentionDays);
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
