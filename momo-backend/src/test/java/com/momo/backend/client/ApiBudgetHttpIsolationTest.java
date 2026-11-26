package com.momo.backend.client;

import com.momo.backend.repository.ApiCallBudgetStateRepository;
import com.momo.backend.service.ApiCallBudgetService;
import com.momo.backend.service.ApiCallMetrics;
import org.junit.jupiter.api.Test;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.web.client.RestClient;
import java.sql.SQLException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.anything;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

/** 실제 예산 서비스의 DB 재시도와 공급자 HTTP 재시도의 경계를 검증한다. */
class ApiBudgetHttpIsolationTest {
    ApiCallBudgetStateRepository rows = mock(ApiCallBudgetStateRepository.class);
    PlatformTransactionManager transactions = mock(PlatformTransactionManager.class);

    @Test void exhaustedDatabaseRetriesNeverReachHttp() {
        when(transactions.getTransaction(any())).thenAnswer(call -> new SimpleTransactionStatus());
        when(rows.incrementPrefetchIfAvailable(anyString(), anyLong())).thenThrow(deadlock());
        var builder = RestClient.builder().baseUrl("https://kobis.invalid");
        var server = MockRestServiceServer.bindTo(builder).build();
        var client = new KobisApiClient(builder, "test-only", new ApiCallMetrics(),
                new ApiCallBudgetService(rows, transactions));
        assertThrows(CannotAcquireLockException.class, () -> client.searchCatalogMovies(1, 100, null, null));
        verify(transactions, times(3)).rollback(any());
        verify(transactions, never()).commit(any());
        server.verify();
    }

    @Test void databaseRetryDoesNotRepeatHttpAndEachHttpRetryReservesAgain() {
        when(transactions.getTransaction(any())).thenAnswer(call -> new SimpleTransactionStatus());
        when(rows.incrementPrefetchIfAvailable(anyString(), anyLong()))
                .thenThrow(deadlock()).thenReturn(1);
        var builder = RestClient.builder().baseUrl("https://kobis.invalid");
        var server = MockRestServiceServer.bindTo(builder).build();
        server.expect(anything()).andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE).header("Retry-After", "0"));
        server.expect(anything()).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        var client = new KobisApiClient(builder, "test-only", new ApiCallMetrics(),
                new ApiCallBudgetService(rows, transactions));
        assertEquals("{}", client.searchCatalogMovies(1, 100, null, null));
        verify(rows, times(3)).incrementPrefetchIfAvailable(anyString(), anyLong());
        verify(transactions).rollback(any());
        verify(transactions, times(2)).commit(any());
        server.verify();
    }

    private CannotAcquireLockException deadlock() {
        return new CannotAcquireLockException("test", new SQLException("test", "40001", 1213));
    }
}
