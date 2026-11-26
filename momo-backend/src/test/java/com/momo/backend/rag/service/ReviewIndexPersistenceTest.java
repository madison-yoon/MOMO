package com.momo.backend.rag.service;

import com.momo.backend.entity.Review;
import com.momo.backend.entity.User;
import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.enums.IndexStatus;
import com.momo.backend.rag.event.ReviewIndexEvent;
import com.momo.backend.rag.event.ReviewPurgeEvent;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@DataJpaTest(showSql = false, properties = {
        "spring.datasource.url=jdbc:h2:mem:rag-index-state;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.open-in-view=false",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:rag-index-outbox-test-schema.sql",
        "RAG_ENABLED=true"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({
        ReviewIndexTransactions.class,
        ReviewIndexOutboxWriter.class,
        ReviewIndexOutboxStore.class,
        ReviewIndexPersistenceTest.Config.class
})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ReviewIndexPersistenceTest {
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager manager;
    @Autowired ReviewIndexTransactions transactions;
    @Autowired ApplicationEventPublisher publisher;
    @Autowired ReviewIndexOutboxStore outbox;
    @Autowired JdbcTemplate jdbc;

    @TestConfiguration
    static class Config {
        @Bean
        RagClient ragClient() {
            RagClient client = mock(RagClient.class);
            when(client.isEnabled()).thenReturn(true);
            return client;
        }
    }

    @BeforeEach
    void clearOutbox() {
        jdbc.update("DELETE FROM review_index_outbox");
    }

    @Test
    void statusOnlyUpdatesPreserveOriginalTimestampAndNewRowsStartIndexing() {
        Long id = fixture();
        var original = transactions.readLatest(id).orElseThrow();
        assertThat(transactions.recordResult(original, IndexStatus.READY, null)).isTrue();
        tx(() -> {
            Review saved = em.find(Review.class, id);
            assertThat(saved.getIndexStatus()).isEqualTo(IndexStatus.READY);
            assertThat(saved.getIndexedAt()).isNotNull();
            assertThat(saved.getUpdatedAt()).isEqualTo(original.updatedAt());
        });
        transactions.invalidateReady();
        transactions.beginManual(id);
        tx(() -> {
            Review saved = em.find(Review.class, id);
            assertThat(saved.getIndexStatus()).isEqualTo(IndexStatus.INDEXING);
            assertThat(saved.getUpdatedAt()).isEqualTo(original.updatedAt());
            assertThat(saved.getIndexedAt()).isNull();
        });
    }

    @Test
    void exactComparisonRejectsChangesAtIdenticalTimestamp() {
        Long id = fixture();
        var original = transactions.readLatest(id).orElseThrow();
        tx(() -> em.createNativeQuery("update reviews set title='TITLE ', content='BODY' where review_id=:id")
                .setParameter("id", id).executeUpdate());
        assertThat(transactions.recordResult(original, IndexStatus.READY, null)).isFalse();
        assertThat(transactions.readLatest(id).orElseThrow().updatedAt()).isEqualTo(original.updatedAt());
    }

    @Test
    void requiresNewResultSurvivesCallerRollbackAndErrorIsBounded() {
        Long id = fixture();
        var snapshot = transactions.readLatest(id).orElseThrow();
        new TransactionTemplate(manager).executeWithoutResult(outer -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isTrue();
            assertThat(transactions.recordResult(snapshot, IndexStatus.FAILED, "E".repeat(600))).isTrue();
            outer.setRollbackOnly();
        });
        tx(() -> {
            Review saved = em.find(Review.class, id);
            assertThat(saved.getIndexStatus()).isEqualTo(IndexStatus.FAILED);
            assertThat(saved.getIndexError()).hasSize(500);
            assertThat(saved.getIndexedAt()).isNull();
        });
    }

    @Test
    void outboxRowsCommitAndRollbackWithTheOriginalReviewTransaction() {
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            publisher.publishEvent(new ReviewIndexEvent(900L, ReviewIndexEvent.Operation.UPSERT));
            assertThat(outboxCount()).isEqualTo(1);
            status.setRollbackOnly();
        });
        assertThat(outboxCount()).isZero();

        tx(() -> {
            publisher.publishEvent(new ReviewIndexEvent(900L, ReviewIndexEvent.Operation.UPSERT));
            publisher.publishEvent(new ReviewIndexEvent(901L, ReviewIndexEvent.Operation.DELETE));
            publisher.publishEvent(new ReviewPurgeEvent(List.of(902L, 903L, 902L)));
        });

        assertThat(outboxCount()).isEqualTo(4);
        assertThat(jdbc.query(
                "SELECT CONCAT(review_id, ':', operation) FROM review_index_outbox ORDER BY id",
                (rs, rowNumber) -> rs.getString(1)
        )).containsExactly("900:UPSERT", "901:DELETE", "902:DELETE", "903:DELETE");
    }

    @Test
    void claimKeepsSameReviewEventsOrderedButAllowsOtherReviewsToProgress() {
        tx(() -> {
            publisher.publishEvent(new ReviewIndexEvent(900L, ReviewIndexEvent.Operation.UPSERT));
            publisher.publishEvent(new ReviewIndexEvent(900L, ReviewIndexEvent.Operation.DELETE));
            publisher.publishEvent(new ReviewIndexEvent(901L, ReviewIndexEvent.Operation.UPSERT));
        });

        var first = outbox.claimNext().orElseThrow();
        assertThat(first.reviewId()).isEqualTo(900L);
        assertThat(first.operation()).isEqualTo(ReviewIndexEvent.Operation.UPSERT);

        var otherReview = outbox.claimNext().orElseThrow();
        assertThat(otherReview.reviewId()).isEqualTo(901L);
        assertThat(otherReview.operation()).isEqualTo(ReviewIndexEvent.Operation.UPSERT);

        assertThat(outbox.complete(otherReview)).isTrue();
        // The second event for review 900 cannot overtake its still-processing UPSERT.
        assertThat(outbox.claimNext()).isEmpty();

        assertThat(outbox.complete(first)).isTrue();
        var deletion = outbox.claimNext().orElseThrow();
        assertThat(deletion.reviewId()).isEqualTo(900L);
        assertThat(deletion.operation()).isEqualTo(ReviewIndexEvent.Operation.DELETE);
        assertThat(outbox.complete(deletion)).isTrue();
        assertThat(outbox.claimNext()).isEmpty();
    }

    @Test
    void reclaimedLeaseFencesCompletionFromAnOlderWorker() {
        tx(() -> publisher.publishEvent(new ReviewIndexEvent(911L, ReviewIndexEvent.Operation.UPSERT)));
        var first = outbox.claimNext().orElseThrow();

        // Simulate an expired worker lease; a second worker receives a new claim token.
        jdbc.update("UPDATE review_index_outbox SET locked_until = ? WHERE id = ?",
                LocalDateTime.now().minusSeconds(1), first.id());
        var second = outbox.claimNext().orElseThrow();

        assertThat(second.id()).isEqualTo(first.id());
        assertThat(second.claimToken()).isNotEqualTo(first.claimToken());
        assertThat(second.attemptCount()).isEqualTo(first.attemptCount() + 1);
        assertThat(outbox.complete(first)).isFalse();
        assertThat(outbox.complete(second)).isTrue();
    }

    private int outboxCount() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM review_index_outbox", Integer.class);
    }

    private Long fixture() {
        return new TransactionTemplate(manager).execute(status -> {
            String suffix = UUID.randomUUID().toString().substring(0, 8);
            User user = new User("i" + suffix, "hash", "n" + suffix, suffix + "@example.test");
            em.persist(user);
            Review review = new Review(user, "movie", "Title", "Body");
            em.persist(review);
            em.flush();
            assertThat(review.getIndexStatus()).isEqualTo(IndexStatus.INDEXING);
            return review.getReviewId();
        });
    }

    private void tx(Runnable work) {
        new TransactionTemplate(manager).executeWithoutResult(status -> work.run());
    }
}
