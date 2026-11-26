package com.momo.backend.client;

import com.momo.backend.observability.ApiCallTrace;
import com.momo.backend.service.ApiCallBudgetService;
import com.momo.backend.service.ApiCallMetrics;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.anything;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class KobisHttpAttemptTraceTest {
    @Test void retryCountsEachActualTransportAttemptAndPreservesLogicalCounter() {
        var builder = RestClient.builder().baseUrl("https://kobis.invalid");
        var server = MockRestServiceServer.bindTo(builder).build();
        var budget = mock(ApiCallBudgetService.class);
        var metrics = new ApiCallMetrics();
        var client = new KobisApiClient(builder, "test-only-key", metrics, budget);
        server.expect(anything()).andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE).header("Retry-After", "0"));
        server.expect(anything()).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        try (var scope = ApiCallTrace.open(ApiCallTrace.Source.HTTP)) {
            assertEquals("{}", client.searchCatalogMovies(1, 100, null, null));
            assertEquals(2, scope.context().catalogAttempts());
            assertEquals(1, metrics.snapshot().get("KOBIS.searchCatalogMovies").calls());
        }
        verify(budget, times(2)).acquire("KOBIS", ApiCallBudgetService.TrafficType.PREFETCH);
        server.verify();
        assertNull(ApiCallTrace.current());
    }

    @Test void schedulerAttemptsAreNotAddedToSurroundingHttpRequest() {
        var builder = RestClient.builder().baseUrl("https://kobis.invalid");
        var server = MockRestServiceServer.bindTo(builder).build();
        var client = new KobisApiClient(builder, "test-only-key", new ApiCallMetrics(), mock(ApiCallBudgetService.class));
        server.expect(anything()).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        try (var http = ApiCallTrace.open(ApiCallTrace.Source.HTTP)) {
            try (var scheduler = ApiCallTrace.open(ApiCallTrace.Source.SCHEDULER)) {
                client.searchCatalogMovies(1, 100, null, null);
                assertEquals(1, scheduler.context().catalogAttempts());
                assertNotEquals(http.context().requestId(), scheduler.context().requestId());
            }
            assertEquals(0, http.context().catalogAttempts());
            assertEquals(ApiCallTrace.Source.HTTP, ApiCallTrace.current().source());
        }
        server.verify();
    }

    @Test void budgetRejectionBeforeTransportDoesNotCountAsHttpAttempt() {
        var builder = RestClient.builder().baseUrl("https://kobis.invalid");
        var server = MockRestServiceServer.bindTo(builder).build();
        var budget = mock(ApiCallBudgetService.class);
        doThrow(new IllegalStateException("budget blocked")).when(budget).acquire(anyString(), any());
        var client = new KobisApiClient(builder, "test-only-key", new ApiCallMetrics(), budget);
        try (var scope = ApiCallTrace.open(ApiCallTrace.Source.HTTP)) {
            assertThrows(IllegalStateException.class, () -> client.searchCatalogMovies(1, 100, null, null));
            assertEquals(0, scope.context().catalogAttempts());
        }
        server.verify();
    }
}
