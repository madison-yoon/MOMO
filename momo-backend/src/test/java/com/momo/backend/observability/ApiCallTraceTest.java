package com.momo.backend.observability;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.momo.backend.service.ApiCallMetrics;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

class ApiCallTraceTest {
    private void simulateTransportAttempt() throws Exception {
        try (var operation = ApiCallTrace.operation("KOBIS", "searchCatalogMovies")) {
            ApiCallTrace.interceptor().intercept(null, new byte[0], (request, body) -> null);
        }
    }

    @Test void concurrentRequestsHaveIndependentIdsAndCountsAndCleanUpWorkers() throws Exception {
        try (var executor = Executors.newFixedThreadPool(2)) {
            var barrier = new CyclicBarrier(2);
            var first = executor.submit(() -> filterRequestWithAttempts(1, barrier));
            var second = executor.submit(() -> filterRequestWithAttempts(2, barrier));
            assertNotEquals(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS));
        }
    }

    private String filterRequestWithAttempts(int count, CyclicBarrier barrier) throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/movies/genre");
        var response = new MockHttpServletResponse();
        new ApiRequestTraceFilter().doFilter(request, response, (req, res) -> {
            try {
                barrier.await(5, TimeUnit.SECONDS);
                for (int i = 0; i < count; i++) simulateTransportAttempt();
                assertEquals(count, ApiCallTrace.current().catalogAttempts());
            } catch (Exception e) { throw new jakarta.servlet.ServletException(e); }
        });
        assertNull(ApiCallTrace.current());
        return response.getHeader("X-Request-Id");
    }

    @Test void asyncKeepsRequestIdButDoesNotMutateHttpSummaryEvenWithCallerRuns() {
        try (var http = ApiCallTrace.open(ApiCallTrace.Source.HTTP)) {
            String id = http.context().requestId();
            ApiCallTrace.decorateAsync(() -> {
                assertEquals(ApiCallTrace.Source.ASYNC, ApiCallTrace.current().source());
                assertEquals(id, ApiCallTrace.requestId());
                try { simulateTransportAttempt(); } catch (Exception e) { throw new RuntimeException(e); }
            }).run();
            assertEquals(0, http.context().catalogAttempts());
            assertSame(http.context(), ApiCallTrace.current());
        }
        assertNull(ApiCallTrace.current());
    }

    @Test void summariesAndFailureMetricsNeverLogTokensKeysQueryStringsOrExceptionMessages() throws Exception {
        var logger = (Logger) LoggerFactory.getLogger(ApiRequestTraceFilter.class);
        var metricLogger = (Logger) LoggerFactory.getLogger(ApiCallMetrics.class);
        var appender = new ListAppender<ILoggingEvent>(); appender.start();
        logger.addAppender(appender); metricLogger.addAppender(appender);
        try {
            var request = new MockHttpServletRequest("GET", "/api/movies/genre");
            request.setQueryString("genre=private-person-value&key=private-key-value");
            request.addHeader("Authorization", "Bearer private-token-value");
            request.addHeader("X-Request-Id", "untrusted-client-value");
            var response = new MockHttpServletResponse();
            new ApiRequestTraceFilter().doFilter(request, response, (req, res) -> {
                assertEquals(ApiCallTrace.Source.HTTP, ApiCallTrace.current().source());
                assertNotEquals("untrusted-client-value", ApiCallTrace.requestId());
                assertThrows(IllegalStateException.class, () -> new ApiCallMetrics().record("KOBIS", "searchCatalogMovies", () -> {
                    throw new IllegalStateException("private-key-value");
                }));
            });
            String output = appender.list.stream().map(ILoggingEvent::getFormattedMessage).collect(java.util.stream.Collectors.joining("\n"));
            assertTrue(output.contains("catalogHttpAttempts=0"));
            assertTrue(output.contains(response.getHeader("X-Request-Id")));
            for (String secret : java.util.List.of("private-person-value", "private-key-value", "private-token-value", "untrusted-client-value")) assertFalse(output.contains(secret));
            assertTrue(appender.list.stream().allMatch(event -> event.getThrowableProxy() == null));
        } finally { logger.detachAppender(appender); metricLogger.detachAppender(appender); appender.stop(); }
        assertNull(ApiCallTrace.current());
    }

    @Test void filterRestoresContextAndLogsSummaryWhenChainThrows() {
        var request = new MockHttpServletRequest("GET", "/api/movies/recommendations");
        assertThrows(jakarta.servlet.ServletException.class, () -> new ApiRequestTraceFilter().doFilter(request,
                new MockHttpServletResponse(), (req, res) -> { throw new jakarta.servlet.ServletException("test"); }));
        assertNull(ApiCallTrace.current());
    }

    @Test void configuredAsyncExecutorPropagatesOnlyRequestIdentity() throws Exception {
        var executor = (org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor)
                new com.momo.backend.config.AsyncConfig().posterEnsureTaskExecutor();
        try (var http = ApiCallTrace.open(ApiCallTrace.Source.HTTP)) {
            String id = http.context().requestId();
            String child = executor.submit(() -> {
                assertEquals(ApiCallTrace.Source.ASYNC, ApiCallTrace.current().source());
                return ApiCallTrace.requestId();
            }).get(5, TimeUnit.SECONDS);
            assertEquals(id, child);
            assertEquals(0, http.context().catalogAttempts());
        } finally { executor.shutdown(); }
    }

    @Test void actualSchedulerEntryOverridesHttpContextAndRestoresIt() {
        var service = org.mockito.Mockito.mock(com.momo.backend.service.MovieCatalogSyncService.class);
        org.mockito.Mockito.doAnswer(invocation -> {
            assertEquals(ApiCallTrace.Source.SCHEDULER, ApiCallTrace.current().source());
            simulateTransportAttempt();
            assertEquals(1, ApiCallTrace.current().catalogAttempts());
            return null;
        }).when(service).syncNextPage();
        try (var http = ApiCallTrace.open(ApiCallTrace.Source.HTTP)) {
            new com.momo.backend.scheduler.MovieCatalogSyncScheduler(service).collectNextCatalogPage();
            assertSame(http.context(), ApiCallTrace.current());
            assertEquals(0, http.context().catalogAttempts());
        }
    }
}
