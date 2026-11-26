package com.momo.backend.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiRequestTraceFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(ApiRequestTraceFilter.class);
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String path = request.getServletPath();
        if (path == null || path.isEmpty()) path = request.getRequestURI().substring(request.getContextPath().length());
        // 임의 URL·쿼리가 로그에 남지 않도록 정해진 경로 이름만 기록한다.
        String route = "GET".equals(request.getMethod()) &&
                ("/api/movies/genre".equals(path) || "/api/movies/recommendations".equals(path)) ? path : null;
        try (var scope = ApiCallTrace.open(ApiCallTrace.Source.HTTP)) {
            response.setHeader("X-Request-Id", scope.context().requestId());
            boolean completed = false;
            try {
                chain.doFilter(request, response);
                completed = true;
            }
            finally {
                if (route != null) {
                    log.info("REQUEST_API_SUMMARY source=HTTP requestId={} route={} status={} catalogHttpAttempts={}",
                            scope.context().requestId(), route, completed ? Integer.toString(response.getStatus()) : "UNRESOLVED",
                            scope.context().catalogAttempts());
                }
            }
        }
    }
}
