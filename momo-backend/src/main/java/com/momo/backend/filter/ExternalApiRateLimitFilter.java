package com.momo.backend.filter;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 외부 영화 API 호출 또는 대량 작업을 시작할 수 있는 공개 HTTP 진입점을 IP별로 제한한다.
 * X-Forwarded-For는 신뢰 프록시 구성이 명시되지 않았으므로 사용하지 않는다.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE - 10)
public class ExternalApiRateLimitFilter extends OncePerRequestFilter {

    private static final String RATE_LIMITED_BODY =
            "{\"code\":\"RATE_LIMITED\",\"message\":\"외부 영화 정보 요청이 많습니다. 잠시 후 다시 시도해 주세요.\"}";

    private final int requestsPerMinute;
    private final int posterEnsurePerMinute;
    private final Cache<String, AtomicInteger> counters = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .maximumSize(100_000)
            .build();

    public ExternalApiRateLimitFilter(
            @Value("${momo.external-api-rate-limit.per-minute:60}") int requestsPerMinute,
            @Value("${momo.external-api-rate-limit.poster-ensure-per-minute:5}") int posterEnsurePerMinute) {
        if (requestsPerMinute < 1 || posterEnsurePerMinute < 1) {
            throw new IllegalArgumentException("외부 API 요청 제한은 1 이상이어야 합니다.");
        }
        this.requestsPerMinute = requestsPerMinute;
        this.posterEnsurePerMinute = posterEnsurePerMinute;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod();
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }

        if ("OPTIONS".equalsIgnoreCase(method) || !isExternalApiEntryPoint(method, path)) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean posterEnsure = "POST".equalsIgnoreCase(method)
                && "/api/movies/posters/ensure".equals(path);
        int limit = posterEnsure ? posterEnsurePerMinute : requestsPerMinute;
        String remoteAddress = request.getRemoteAddr() == null
                ? "unknown"
                : request.getRemoteAddr();
        String bucket = posterEnsure ? "poster-ensure" : "external-api";
        AtomicInteger counter = counters.get(
                remoteAddress + ":" + bucket,
                ignored -> new AtomicInteger());
        int used = counter.incrementAndGet();
        int remaining = Math.max(0, limit - used);

        response.setHeader("X-RateLimit-Limit", Integer.toString(limit));
        response.setHeader("X-RateLimit-Remaining", Integer.toString(remaining));

        if (used > limit) {
            response.setStatus(HttpServletResponse.SC_TOO_MANY_REQUESTS);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(RATE_LIMITED_BODY);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isExternalApiEntryPoint(String method, String path) {
        if ("POST".equalsIgnoreCase(method)) {
            return "/api/movies/posters/ensure".equals(path);
        }
        if (!"GET".equalsIgnoreCase(method)) {
            return false;
        }

        return "/api/movies/search".equals(path)
                || "/api/movies/genre".equals(path)
                || "/api/movies/recommendations".equals(path)
                || path.startsWith("/api/movies/resolve/")
                || path.startsWith("/api/movies/tmdb/")
                || path.startsWith("/api/persons/")
                || path.startsWith("/api/boxoffice/")
                || path.matches("^/api/movies/[A-Za-z0-9]{8}(/rating|/poster|/people)?$");
    }
}
