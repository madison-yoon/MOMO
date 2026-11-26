package com.momo.backend.rag.service;

import com.momo.backend.entity.Review;
import com.momo.backend.entity.User;
import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.enums.IndexStatus;
import com.momo.backend.rag.event.ReviewIndexEvent;
import com.momo.backend.rag.event.ReviewIndexListener;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.aop.support.AopUtils;
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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * 별도 datadir로 기동한 임시 MySQL의 폐기 가능한 이름 패턴만 허용한다. 공유 DB에서는 활성화하지 않는다.
 * 실제 AFTER_COMMIT/REQUIRES_NEW/Hikari를 사용하고 HTTP만 제어 가능한 mock으로 대체한다.
 * 운영의 기본 30초 연결 획득 대기는 실행하지 않고 동일한 풀 고갈 메커니즘을 1초 설정으로 재현한다.
 */
@EnabledIfEnvironmentVariable(named = "MOMO_RAG5_MYSQL_ISOLATED", matches = "^true$")
@EnabledIfEnvironmentVariable(named = "MOMO_RAG5_POOL_MYSQL_URL", matches = "^jdbc:mysql://127[.]0[.]0[.]1:[1-9][0-9]{0,4}/momo_rag5_pool_[a-f0-9]{12}[?]useSSL=false&allowPublicKeyRetrieval=true$")
@DataJpaTest(showSql = false, properties = {
        "spring.datasource.url=${MOMO_RAG5_POOL_MYSQL_URL}",
        "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",
        "spring.datasource.username=root", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.jpa.open-in-view=false",
        "spring.datasource.hikari.maximum-pool-size=10",
        "spring.datasource.hikari.minimum-idle=10",
        "spring.datasource.hikari.connection-timeout=1000",
        "spring.datasource.hikari.pool-name=rag5-isolated-pool"})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({ReviewIndexTransactions.class, ReviewIndexService.class, ReviewLocks.class,
        ReviewIndexListener.class, RagMySqlPoolTest.Config.class})
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class RagMySqlPoolTest {
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager manager;
    @Autowired ApplicationEventPublisher publisher;
    @Autowired ReviewIndexTransactions transactions;
    @Autowired ReviewIndexService indexing;
    @Autowired ReviewLocks locks;
    @Autowired RagClient client;
    @Autowired DataSource dataSource;
    private final AtomicInteger httpCalls = new AtomicInteger();

    @TestConfiguration
    static class Config {
        @Bean RagClient client() { return mock(RagClient.class); }
        @Bean ReindexAccessGuard reindexAccessGuard() { return mock(ReindexAccessGuard.class); }
        @Bean("ragPurgeExecutor") Executor purgeExecutor() { return Runnable::run; }
        @Bean("ragIndexExecutor") Executor indexExecutor() { return Runnable::run; }
    }

    @BeforeEach
    void configureControlledHttp() {
        reset(client);
        httpCalls.set(0);
        when(client.isEnabled()).thenReturn(true);
        when(client.index(any())).thenAnswer(invocation -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            httpCalls.incrementAndGet();
            // 읽기 트랜잭션을 끝낸 뒤 원격 요청이 진행되는 구간을 짧게 유지한다.
            TimeUnit.MILLISECONDS.sleep(25);
            return 1;
        });
        assertThat(AopUtils.isAopProxy(transactions)).isTrue();
        assertThat(AopUtils.isAopProxy(indexing)).isTrue();
    }

    @Test
    void eightOriginalConnectionsLeaveRoomForRequiresNewReadsAndResultWrites() throws Exception {
        Run run = concurrentCommits(8);
        assertThat(run.states()).containsOnly(IndexStatus.READY);
        assertThat(httpCalls.get()).isEqualTo(8);
        assertThat(run.elapsedMillis()).isLessThan(10_000);
        assertThat(run.peakActive()).isLessThanOrEqualTo(10);
        report("spare-connections", run, 8, 0, false);
    }

    @Test
    void tenRetainedOriginalConnectionsTimeOutInnerReadsWithoutFailingCommittedCrud() throws Exception {
        Run run = concurrentCommits(10);
        // 모든 원본 커밋은 정상 반환한다. 새 연결을 얻지 못한 후속 색인만 INDEXING으로 남는다.
        assertThat(run.states()).containsOnly(IndexStatus.INDEXING);
        assertThat(httpCalls.get()).isZero();
        assertThat(run.peakActive()).isEqualTo(10);
        assertThat(run.peakPending()).isGreaterThan(0);
        assertThat(run.elapsedMillis()).isGreaterThanOrEqualTo(900).isLessThan(10_000);
        Long recoverable = run.ids().getFirst();
        assertThat(indexing.reindex(recoverable, 1L)).isEqualTo(ReviewIndexService.Outcome.READY);
        assertThat(state(recoverable)).isEqualTo(IndexStatus.READY);
        report("connection-starvation", run, 0, 10, true);
    }

    @Test
    void actualMysqlInvalidationFinishesWhileOldHttpIsHeldAndRejectsItsResult() throws Exception {
        Long id = new TransactionTemplate(manager).execute(status -> {
            String unique = UUID.randomUUID().toString().substring(0, 8);
            User user = new User("g" + unique, "hash", "g" + unique, unique + "@example.test");
            em.persist(user);
            Review review = new Review(user, "generation-fixture", "Generation Title", "Generation Body");
            em.persist(review);
            em.flush();
            return review.getReviewId();
        });
        var original = transactions.readLatest(id).orElseThrow();
        assertThat(transactions.recordResult(original, IndexStatus.READY, null)).isTrue();
        CountDownLatch oldHttpEntered = new CountDownLatch(1), releaseOldHttp = new CountDownLatch(1);
        AtomicInteger attempts = new AtomicInteger();
        when(client.index(any())).thenAnswer(invocation -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            httpCalls.incrementAndGet();
            if (attempts.incrementAndGet() == 1) {
                oldHttpEntered.countDown();
                assertThat(releaseOldHttp.await(5, TimeUnit.SECONDS)).isTrue();
            }
            return 1;
        });
        long started = System.nanoTime();
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<ReviewIndexService.Outcome> old = executor.submit(() -> indexing.index(id));
            assertThat(oldHttpEntered.await(2, TimeUnit.SECONDS)).isTrue();
            // 실제 전체 READY 벌크 무효화를 실행하되 기존 fixture ID들을 재색인 대상으로 삼지 않는다.
            // 이전 색인이 stripe를 쥐고 HTTP에서 대기하는 동안에도 무효화 커밋이 완료되어야 한다.
            Future<?> invalidation = executor.submit(() -> locks.invalidate(transactions::invalidateReady));
            invalidation.get(2, TimeUnit.SECONDS);
            assertThat(old.isDone()).isFalse();
            assertThat(state(id)).isEqualTo(IndexStatus.INDEXING);
            assertThat(transactions.readLatest(id).orElseThrow()).isEqualTo(original);
            releaseOldHttp.countDown();
            assertThat(old.get(2, TimeUnit.SECONDS)).isEqualTo(ReviewIndexService.Outcome.SKIPPED);
            assertThat(state(id)).isEqualTo(IndexStatus.INDEXING);
            Future<ReviewIndexService.Outcome> fresh = executor.submit(() -> indexing.index(id));
            assertThat(fresh.get(2, TimeUnit.SECONDS)).isEqualTo(ReviewIndexService.Outcome.READY);
            assertThat(state(id)).isEqualTo(IndexStatus.READY);
            assertThat(transactions.readLatest(id).orElseThrow()).isEqualTo(original);
            assertThat(attempts.get()).isEqualTo(2);
            long elapsed = Duration.ofNanos(System.nanoTime() - started).toMillis();
            assertThat(elapsed).isLessThan(5_000);
            System.out.printf("RAG5_MYSQL_GENERATION reviewId=%d old=SKIPPED afterInvalidation=INDEXING "
                    + "fresh=READY httpCalls=%d elapsedMs=%d boundedCompletion=true%n", id, attempts.get(), elapsed);
        } finally {
            releaseOldHttp.countDown();
            executor.shutdownNow();
            assertThat(executor.awaitTermination(7, TimeUnit.SECONDS)).isTrue();
        }
    }

    private Run concurrentCommits(int workers) throws Exception {
        HikariDataSource hikari = hikari();
        assertThat(hikari.getMaximumPoolSize()).isEqualTo(10);
        assertThat(hikari.getConnectionTimeout()).isEqualTo(1000);
        CountDownLatch outerRowsFlushed = new CountDownLatch(workers);
        CountDownLatch startCommit = new CountDownLatch(1);
        CountDownLatch committed = new CountDownLatch(workers);
        CountDownLatch listenersFinished = new CountDownLatch(workers);
        AtomicReference<Throwable> coordinationFailure = new AtomicReference<>();
        AtomicInteger peakActive = new AtomicInteger(), peakPending = new AtomicInteger();
        List<Future<Long>> futures = new ArrayList<>();
        List<Long> ids = new ArrayList<>();
        long started = System.nanoTime();
        ScheduledExecutorService sampler = Executors.newSingleThreadScheduledExecutor();
        ExecutorService executor = Executors.newFixedThreadPool(workers);
        sampler.scheduleAtFixedRate(() -> {
            peakActive.accumulateAndGet(hikari.getHikariPoolMXBean().getActiveConnections(), Math::max);
            peakPending.accumulateAndGet(hikari.getHikariPoolMXBean().getThreadsAwaitingConnection(), Math::max);
        }, 0, 2, TimeUnit.MILLISECONDS);
        try {
            for (int i = 0; i < workers; i++) {
                futures.add(executor.submit(() -> new TransactionTemplate(manager).execute(status -> {
                    String unique = UUID.randomUUID().toString().substring(0, 8);
                    User user = new User("p" + unique, "hash", "p" + unique, unique + "@example.test");
                    em.persist(user);
                    Review review = new Review(user, "pool-fixture", "Pool Title", "Pool Body");
                    em.persist(review);
                    em.flush();
                    Long id = review.getReviewId();
                    // 이 동기화는 커밋 후 리스너 이전에 모든 원본 커넥션이 점유되도록 한다.
                    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                        @Override public void afterCommit() {
                            committed.countDown();
                            await(committed, coordinationFailure, "원본 커밋 barrier");
                        }
                    });
                    publisher.publishEvent(new ReviewIndexEvent(id, ReviewIndexEvent.Operation.UPSERT));
                    // 같은 최하위 순서의 리스너보다 나중에 등록하여 시도 완료까지 원본 자원을 보유한다.
                    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                        @Override public void afterCompletion(int completion) {
                            listenersFinished.countDown();
                            await(listenersFinished, coordinationFailure, "리스너 완료 barrier");
                        }
                    });
                    outerRowsFlushed.countDown();
                    await(startCommit, coordinationFailure, "커밋 시작 barrier");
                    return id;
                })));
            }
            assertThat(outerRowsFlushed.await(5, TimeUnit.SECONDS)).isTrue();
            assertThat(hikari.getHikariPoolMXBean().getActiveConnections()).isEqualTo(workers);
            startCommit.countDown();
            // 각 Future는 CRUD 원본 커밋과 동기 리스너가 모두 반환한 후 완료한다.
            long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
            for (Future<Long> future : futures)
                ids.add(future.get(Math.max(1, deadline - System.nanoTime()), TimeUnit.NANOSECONDS));
            assertThat(coordinationFailure.get()).isNull();
            long elapsed = Duration.ofNanos(System.nanoTime() - started).toMillis();
            List<IndexStatus> states = ids.stream().map(this::state).toList();
            return new Run(ids, states, elapsed, peakActive.get(), peakPending.get());
        } finally {
            startCommit.countDown();
            executor.shutdownNow();
            sampler.shutdownNow();
            assertThat(executor.awaitTermination(7, TimeUnit.SECONDS)).isTrue();
            assertThat(sampler.awaitTermination(1, TimeUnit.SECONDS)).isTrue();
        }
    }

    private static void await(CountDownLatch latch, AtomicReference<Throwable> failure, String label) {
        try {
            if (!latch.await(5, TimeUnit.SECONDS)) {
                IllegalStateException error = new IllegalStateException(label + " 시간 초과");
                failure.compareAndSet(null, error);
                throw error;
            }
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            failure.compareAndSet(null, interrupted);
            throw new IllegalStateException(label + " 인터럽트", interrupted);
        }
    }

    private HikariDataSource hikari() throws SQLException { return dataSource.unwrap(HikariDataSource.class); }

    private IndexStatus state(Long id) {
        return new TransactionTemplate(manager).execute(status -> em.find(Review.class, id).getIndexStatus());
    }

    private void report(String scenario, Run run, int ready, int indexingCount, boolean recovered) {
        System.out.printf("RAG5_POOL scenario=%s workers=%d pool=10 acquisitionTimeoutMs=1000 elapsedMs=%d "
                        + "committed=%d ready=%d indexing=%d peakActive=%d peakPending=%d manualRecovery=%s%n",
                scenario, run.ids().size(), run.elapsedMillis(), run.ids().size(), ready, indexingCount,
                run.peakActive(), run.peakPending(), recovered);
    }

    private record Run(List<Long> ids, List<IndexStatus> states, long elapsedMillis, int peakActive, int peakPending) { }
}
