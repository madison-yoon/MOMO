package com.momo.backend.service;

import com.momo.backend.repository.ApiCallBudgetStateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.ArrayList;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static com.momo.backend.service.ApiCallBudgetService.TrafficType.*;

/** 명시적으로 만든 격리 DB에서만 실행한다. 개발 DB URL은 허용하지 않는다. */
@EnabledIfEnvironmentVariable(named = "MOMO_BUDGET_MYSQL_ISOLATED", matches = "true")
@DataJpaTest(showSql = false, properties = {
    "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop", "spring.datasource.hikari.maximum-pool-size=12"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(ApiCallBudgetService.class)
@ActiveProfiles("test")
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ApiCallBudgetMySqlTest {
    @Autowired ApiCallBudgetService budget;
    @Autowired ApiCallBudgetStateRepository rows;
    @Autowired PlatformTransactionManager transactions;

    @DynamicPropertySource static void isolatedDatabaseOnly(DynamicPropertyRegistry properties) {
        String url = System.getenv("MOMO_BUDGET_MYSQL_URL");
        if (url == null || !url.matches("jdbc:mysql://127[.]0[.]0[.]1:[0-9]+/momo_budget_test_[a-f0-9]{12}[?]useSSL=false&allowPublicKeyRetrieval=true")) {
            throw new IllegalStateException("명시적으로 생성한 momo_budget_test_* 격리 DB만 허용합니다.");
        }
        properties.add("spring.datasource.url", () -> url);
        properties.add("spring.datasource.username", () -> System.getenv("MOMO_BUDGET_MYSQL_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("MOMO_BUDGET_MYSQL_PASSWORD"));
    }

    @BeforeEach void resetOnlyIsolatedBudgetRows() {
        rows.deleteAllInBatch();
        for (String provider : new String[]{"kobis", "kmdb", "tmdb"})
            ReflectionTestUtils.setField(budget, provider + "DailyLimit", 0L);
    }

    @Test void concurrentFirstCreationAndExistingRowIncrementsAreNotLost() throws Exception {
        assertEquals(50, concurrent(50, 0));
        assertEquals(50, budget.getTodayStatus().get("KOBIS").prefetchUsed());
        assertEquals(50, concurrent(50, 0));
        assertEquals(100, budget.getTodayStatus().get("KOBIS").prefetchUsed());
        assertEquals(1, rows.count());
    }

    @Test void concurrentQuotaBoundaryKeepsNinetyTenSplit() throws Exception {
        ReflectionTestUtils.setField(budget, "kobisDailyLimit", 100L);
        assertEquals(100, concurrent(120, 20));
        var result = budget.getTodayStatus().get("KOBIS");
        assertEquals(90, result.prefetchUsed());
        assertEquals(10, result.userSearchUsed());
        assertThrows(ApiCallBudgetService.ApiBudgetExceededException.class, () -> budget.acquire("KOBIS", PREFETCH));
        assertThrows(ApiCallBudgetService.ApiBudgetExceededException.class, () -> budget.acquire("KOBIS", USER_SEARCH));
    }

    @Test void outerRollbackCannotUndoCommittedReservation() {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            budget.acquire("KMDB", PREFETCH);
            status.setRollbackOnly();
        });
        assertEquals(1, budget.getTodayStatus().get("KMDB").prefetchUsed());
    }

    @Test void reservationReturnsWithNoTransactionBeforeExternalWork() {
        budget.acquire("TMDB", PREFETCH);
        assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
        assertEquals(1, budget.getTodayStatus().get("TMDB").prefetchUsed());
    }

    private int concurrent(int prefetch, int demand) throws Exception {
        // 대기 중인 외부 트랜잭션까지 고려해 작업 스레드보다 넉넉한 커넥션 풀을 사용한다.
        try (var executor = Executors.newFixedThreadPool(8)) {
            CountDownLatch start = new CountDownLatch(1);
            var tasks = new ArrayList<Future<Boolean>>();
            for (int i = 0; i < prefetch + demand; i++) {
                var type = i < prefetch ? PREFETCH : USER_SEARCH;
                tasks.add(executor.submit(() -> {
                    if (!start.await(5, TimeUnit.SECONDS)) throw new IllegalStateException("시작 대기 초과");
                    try { budget.acquire("KOBIS", type); return true; }
                    catch (ApiCallBudgetService.ApiBudgetExceededException expected) { return false; }
                }));
            }
            start.countDown();
            int accepted = 0;
            for (var task : tasks) if (task.get(20, TimeUnit.SECONDS)) accepted++;
            return accepted;
        }
    }
}
