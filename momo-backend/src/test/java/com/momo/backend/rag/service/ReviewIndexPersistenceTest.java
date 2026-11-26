package com.momo.backend.rag.service;

import com.momo.backend.entity.Review;
import com.momo.backend.entity.User;
import com.momo.backend.rag.enums.IndexStatus;
import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.event.ReviewIndexEvent;
import com.momo.backend.rag.event.ReviewPurgeEvent;
import com.momo.backend.rag.event.ReviewIndexListener;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executor;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** 메모리 H2만 사용하여 실제 프록시 트랜잭션·생명주기 콜백·커밋 이벤트를 검증한다. */
@DataJpaTest(showSql = false, properties = {
        "spring.datasource.url=jdbc:h2:mem:rag-index-state;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
        "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({ReviewIndexTransactions.class, ReviewIndexListener.class, ReviewIndexPersistenceTest.Config.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ReviewIndexPersistenceTest {
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager manager;
    @Autowired ReviewIndexTransactions transactions;
    @Autowired ApplicationEventPublisher publisher;
    @Autowired ReviewIndexService service;

    @TestConfiguration static class Config {
        @Bean ReviewIndexService indexService() { return mock(ReviewIndexService.class); }
        @Bean("ragPurgeExecutor") Executor purgeExecutor() { return Runnable::run; }
        @Bean("ragIndexExecutor") Executor indexExecutor() { return Runnable::run; }
    }

    @Test void statusOnlyUpdatesPreserveOriginalTimestampAndNewRowsStartIndexing() {
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

    @Test void exactComparisonRejectsChangesAtIdenticalTimestamp() {
        Long id = fixture();
        var original = transactions.readLatest(id).orElseThrow();
        tx(() -> em.createNativeQuery("update reviews set title='TITLE ', content='BODY' where review_id=:id")
                .setParameter("id", id).executeUpdate());
        assertThat(transactions.recordResult(original, IndexStatus.READY, null)).isFalse();
        assertThat(transactions.readLatest(id).orElseThrow().updatedAt()).isEqualTo(original.updatedAt());
    }

    @Test void requiresNewResultSurvivesCallerRollbackAndErrorIsBounded() {
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

    @Test void commitRunsUpsertDeleteAndPurgeButRollbackRunsNone() {
        reset(service);
        for (var operation : ReviewIndexEvent.Operation.values()) {
            new TransactionTemplate(manager).executeWithoutResult(status -> {
                publisher.publishEvent(new ReviewIndexEvent(900L, operation));
                verifyNoInteractions(service);
                status.setRollbackOnly();
            });
        }
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            publisher.publishEvent(new ReviewPurgeEvent(List.of(900L)));
            status.setRollbackOnly();
        });
        verifyNoInteractions(service);
        tx(() -> {
            publisher.publishEvent(new ReviewIndexEvent(900L, ReviewIndexEvent.Operation.UPSERT));
            publisher.publishEvent(new ReviewIndexEvent(901L, ReviewIndexEvent.Operation.DELETE));
            publisher.publishEvent(new ReviewPurgeEvent(List.of(902L)));
            verifyNoInteractions(service);
        });
        verify(service).index(900L);
        verify(service).remove(901L);
        verify(service).remove(902L);
    }

    @Test void indexHttpRunsOutsideDatabaseTransactionAndConcurrentEditCannotBecomeReady() {
        Long id = fixture();
        RagClient client = mock(RagClient.class);
        when(client.isEnabled()).thenReturn(true);
        when(client.index(any())).thenAnswer(invocation -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            tx(() -> em.createNativeQuery("update reviews set content='edited during HTTP' where review_id=:id")
                    .setParameter("id", id).executeUpdate());
            return 1;
        });
        ReviewIndexService actual = new ReviewIndexService(client, transactions, new ReviewLocks(100), mock(ReindexAccessGuard.class));
        assertThat(actual.index(id)).isEqualTo(ReviewIndexService.Outcome.SKIPPED);
        tx(() -> assertThat(em.find(Review.class, id).getIndexStatus()).isEqualTo(IndexStatus.INDEXING));
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
    private void tx(Runnable work) { new TransactionTemplate(manager).executeWithoutResult(status -> work.run()); }
}
