package com.momo.backend.filter;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ExternalApiRateLimitFilterTest {

    @Test
    void limitsHighCostPublicRequestsByRemoteAddress() throws Exception {
        ExternalApiRateLimitFilter filter = new ExternalApiRateLimitFilter(2, 1);
        AtomicInteger passed = new AtomicInteger();

        MockHttpServletResponse first = invoke(filter, "/api/movies/search", "203.0.113.10", passed);
        MockHttpServletResponse second = invoke(filter, "/api/movies/genre", "203.0.113.10", passed);
        MockHttpServletResponse third = invoke(filter, "/api/movies/search", "203.0.113.10", passed);

        assertEquals(2, passed.get());
        assertEquals(200, first.getStatus());
        assertEquals(200, second.getStatus());
        assertEquals(429, third.getStatus());
        assertEquals("60", third.getHeader("Retry-After"));
        assertEquals("0", third.getHeader("X-RateLimit-Remaining"));
        assertTrue(third.getContentAsString().contains("RATE_LIMITED"));
    }

    @Test
    void doesNotCountOrdinaryReadEndpointsOrOtherClientAddresses() throws Exception {
        ExternalApiRateLimitFilter filter = new ExternalApiRateLimitFilter(1, 1);
        AtomicInteger passed = new AtomicInteger();

        MockHttpServletResponse ordinary = invoke(filter, "/api/reviews", "203.0.113.10", passed);
        MockHttpServletResponse otherClient = invoke(filter, "/api/movies/search", "203.0.113.11", passed);

        assertEquals(2, passed.get());
        assertEquals(200, ordinary.getStatus());
        assertEquals(200, otherClient.getStatus());
    }

    @Test
    void posterCollectionHasItsOwnSmallerRequestBudget() throws Exception {
        ExternalApiRateLimitFilter filter = new ExternalApiRateLimitFilter(30, 1);
        AtomicInteger passed = new AtomicInteger();

        MockHttpServletResponse first = invokePost(filter, "/api/movies/posters/ensure", "203.0.113.12", passed);
        MockHttpServletResponse second = invokePost(filter, "/api/movies/posters/ensure", "203.0.113.12", passed);

        assertEquals(1, passed.get());
        assertEquals(200, first.getStatus());
        assertEquals(429, second.getStatus());
    }

    private MockHttpServletResponse invoke(
            ExternalApiRateLimitFilter filter, String path, String remoteAddress,
            AtomicInteger passed) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
        request.setRemoteAddr(remoteAddress);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> passed.incrementAndGet());
        return response;
    }

    private MockHttpServletResponse invokePost(
            ExternalApiRateLimitFilter filter, String path, String remoteAddress,
            AtomicInteger passed) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.setRemoteAddr(remoteAddress);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> passed.incrementAndGet());
        return response;
    }
}
