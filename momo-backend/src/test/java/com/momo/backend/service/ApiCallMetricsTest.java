package com.momo.backend.service;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ApiCallMetricsTest {

    @Test
    void recordsSuccessAndFailureCountsPerProviderAndEndpoint() {
        ApiCallMetrics metrics = new ApiCallMetrics();

        assertEquals("ok", metrics.record("KOBIS", "search", () -> "ok"));
        assertThrows(IllegalStateException.class,
                () -> metrics.record("KOBIS", "search", () -> {
                    throw new IllegalStateException("simulated outage");
                }));
        metrics.record("TMDB", "search", () -> "result");

        Map<String, ApiCallMetrics.Snapshot> snapshot = metrics.snapshot();
        assertEquals(2, snapshot.get("KOBIS.search").calls());
        assertEquals(1, snapshot.get("KOBIS.search").successes());
        assertEquals(1, snapshot.get("KOBIS.search").failures());
        assertEquals(1, snapshot.get("TMDB.search").calls());
        assertEquals(1, snapshot.get("TMDB.search").successes());
        assertEquals(0, snapshot.get("TMDB.search").failures());
    }
}
