package com.momo.backend.rag.event;

import com.momo.backend.rag.client.RagClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Writes RAG work in the same transaction as the review mutation.
 * The worker performs network I/O only after these rows have committed.
 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "RAG_ENABLED", havingValue = "true")
public class ReviewIndexOutboxWriter {
    private static final String INSERT_SQL = """
            INSERT INTO review_index_outbox (
                review_id, operation, status, attempt_count, available_at, created_at
            ) VALUES (?, ?, 'PENDING', 0, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))
            """;

    private final JdbcTemplate jdbcTemplate;
    private final RagClient ragClient;

    @EventListener
    @Transactional(propagation = Propagation.MANDATORY)
    public void enqueue(ReviewIndexEvent event) {
        if (!ragClient.isEnabled() || event.reviewId() == null || event.reviewId() <= 0) {
            return;
        }
        insert(event.reviewId(), event.operation().name());
    }

    @EventListener
    @Transactional(propagation = Propagation.MANDATORY)
    public void enqueuePurge(ReviewPurgeEvent event) {
        if (!ragClient.isEnabled() || event.reviewIds().isEmpty()) {
            return;
        }

        List<Long> reviewIds = event.reviewIds().stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();
        if (reviewIds.isEmpty()) {
            return;
        }

        jdbcTemplate.batchUpdate(INSERT_SQL, reviewIds, 500, (statement, reviewId) -> {
            statement.setLong(1, reviewId);
            statement.setString(2, ReviewIndexEvent.Operation.DELETE.name());
        });
    }

    private void insert(Long reviewId, String operation) {
        jdbcTemplate.update(INSERT_SQL, reviewId, operation);
    }
}
