package com.momo.backend.service;

import com.momo.backend.repository.ApiCallBudgetStateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.ZoneId;
import java.sql.SQLException;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.SimpleTransactionStatus;
import static org.junit.jupiter.api.Assertions.*;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiCallBudgetServiceTest {

    @Mock
    private ApiCallBudgetStateRepository repository;

    private ApiCallBudgetService service;
    private PlatformTransactionManager transactions;
    private long prefetchUsed;
    private long demandUsed;

    @BeforeEach
    void setUp() {
        transactions = mock(PlatformTransactionManager.class);
        when(transactions.getTransaction(any())).thenAnswer(call -> {
            TransactionDefinition definition = call.getArgument(0);
            assertEquals(TransactionDefinition.PROPAGATION_REQUIRES_NEW, definition.getPropagationBehavior());
            return new SimpleTransactionStatus();
        });
        service = new ApiCallBudgetService(repository, transactions);
        ReflectionTestUtils.setField(service, "kobisDailyLimit", 1_000L);
        ReflectionTestUtils.setField(service, "kmdbDailyLimit", 1_000L);
        ReflectionTestUtils.setField(service, "tmdbDailyLimit", 1_000L);
        when(repository.insertIfAbsent(anyString(), anyString(), any(LocalDate.class))).thenReturn(1);
        lenient().when(repository.incrementPrefetchIfAvailable(anyString(), anyLong())).thenAnswer(invocation -> {
            long limit = invocation.getArgument(1);
            if (prefetchUsed >= limit) return 0;
            prefetchUsed++;
            return 1;
        });
        lenient().when(repository.incrementDemandIfAvailable(anyString(), anyLong())).thenAnswer(invocation -> {
            long limit = invocation.getArgument(1);
            if (demandUsed >= limit) return 0;
            demandUsed++;
            return 1;
        });
    }

    @Test
    void insertsRowThenUsesAtomicCounterUpdate() {
        service.acquire("KOBIS", ApiCallBudgetService.TrafficType.PREFETCH);
        InOrder order = inOrder(repository);
        order.verify(repository).insertIfAbsent(startsWith("KOBIS_"), eq("KOBIS"), any(LocalDate.class));
        order.verify(repository).incrementPrefetchIfAvailable(startsWith("KOBIS_"), eq(900L));
    }

    @Test
    void prefetchCannotConsumeReservedUserSearchBudget() {
        for (int i = 0; i < 900; i++) {
            service.acquire("KOBIS", ApiCallBudgetService.TrafficType.PREFETCH);
        }
        assertThrows(ApiCallBudgetService.ApiBudgetExceededException.class,
                () -> service.acquire("KOBIS", ApiCallBudgetService.TrafficType.PREFETCH));
        service.acquire("KOBIS", ApiCallBudgetService.TrafficType.USER_SEARCH);
    }

    @Test
    void userSearchCannotConsumeReservedPrefetchBudget() {
        for (int i = 0; i < 100; i++) {
            service.acquire("KOBIS", ApiCallBudgetService.TrafficType.USER_SEARCH);
        }
        assertThrows(ApiCallBudgetService.ApiBudgetExceededException.class,
                () -> service.acquire("KOBIS", ApiCallBudgetService.TrafficType.USER_SEARCH));
        service.acquire("KOBIS", ApiCallBudgetService.TrafficType.PREFETCH);
    }

    @Test
    void unknownDailyLimitStillCountsWithoutInventingACap() {
        ReflectionTestUtils.setField(service, "kmdbDailyLimit", 0L);
        service.acquire("KMDB", ApiCallBudgetService.TrafficType.PREFETCH);
        verify(repository).incrementPrefetchIfAvailable(startsWith("KMDB_"), eq(Long.MAX_VALUE));
    }

    @Test void deadlockRollsBackBeforeRetryingInNewTransaction() {
        when(repository.incrementPrefetchIfAvailable(anyString(), anyLong()))
                .thenThrow(lockFailure(1213, "40001")).thenReturn(1);
        service.acquire("KMDB", ApiCallBudgetService.TrafficType.PREFETCH);
        InOrder order = inOrder(transactions, repository);
        order.verify(transactions).getTransaction(any());
        order.verify(repository).insertIfAbsent(anyString(), eq("KMDB"), any());
        order.verify(repository).incrementPrefetchIfAvailable(anyString(), anyLong());
        order.verify(transactions).rollback(any());
        order.verify(transactions).getTransaction(any());
        order.verify(repository).insertIfAbsent(anyString(), eq("KMDB"), any());
        order.verify(repository).incrementPrefetchIfAvailable(anyString(), anyLong());
        order.verify(transactions).commit(any());
    }

    @Test void lockTimeoutRetriesButStopsAfterThreeRollbacks() {
        when(repository.incrementPrefetchIfAvailable(anyString(), anyLong()))
                .thenThrow(lockFailure(1205, "HY000"));
        assertThrows(CannotAcquireLockException.class,
                () -> service.acquire("TMDB", ApiCallBudgetService.TrafficType.PREFETCH));
        verify(transactions, times(3)).rollback(any());
        verify(transactions, never()).commit(any());
    }

    @Test void mysqlDriverLockTimeoutWithState40001IsRetried() {
        when(repository.incrementPrefetchIfAvailable(anyString(), anyLong()))
                .thenThrow(lockFailure(1205, "40001")).thenReturn(1);
        service.acquire("KMDB", ApiCallBudgetService.TrafficType.PREFETCH);
        verify(transactions, times(2)).getTransaction(any());
        verify(transactions).rollback(any());
        verify(transactions).commit(any());
    }

    @Test void quotaExhaustionIsNotRetried() {
        when(repository.incrementPrefetchIfAvailable(anyString(), anyLong())).thenReturn(0);
        assertThrows(ApiCallBudgetService.ApiBudgetExceededException.class,
                () -> service.acquire("KOBIS", ApiCallBudgetService.TrafficType.PREFETCH));
        verify(transactions).getTransaction(any());
        verify(transactions).rollback(any());
    }

    @Test void connectionAndUnknownCommitFailuresAreNotRetried() {
        when(repository.incrementPrefetchIfAvailable(anyString(), anyLong()))
                .thenThrow(new DataAccessResourceFailureException("connection lost"));
        assertThrows(DataAccessResourceFailureException.class,
                () -> service.acquire("KOBIS", ApiCallBudgetService.TrafficType.PREFETCH));
        verify(transactions).getTransaction(any());
    }

    @Test void commitOutcomeUnknownDoesNotRepeatReservation() {
        doThrow(new org.springframework.transaction.TransactionSystemException("commit outcome unknown"))
                .when(transactions).commit(any());
        assertThrows(org.springframework.transaction.TransactionSystemException.class,
                () -> service.acquire("KOBIS", ApiCallBudgetService.TrafficType.PREFETCH));
        verify(transactions).getTransaction(any());
        verify(repository).incrementPrefetchIfAvailable(anyString(), anyLong());
    }

    @Test void providerNormalizationAndKoreanDateArePreserved() {
        service.acquire("kmdb", ApiCallBudgetService.TrafficType.PREFETCH);
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
        verify(repository).insertIfAbsent("KMDB_" + today, "KMDB", today);
    }

    private CannotAcquireLockException lockFailure(int code, String state) {
        return new CannotAcquireLockException("test lock conflict", new SQLException("test", state, code));
    }
}
