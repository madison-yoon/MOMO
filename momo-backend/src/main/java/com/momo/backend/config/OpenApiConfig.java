package com.momo.backend.config;

import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

// SecurityConfig의 실제 공개·인증 경로와 Swagger 표시를 일치시킨다.
@Configuration
@SecurityScheme(
        name = OpenApiConfig.BEARER_AUTH,
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenApiCustomizer securityPerOperationCustomizer() {
        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }

            openApi.getPaths().forEach((path, pathItem) ->
                    pathItem.readOperationsMap().forEach((method, operation) -> {
                        if (requiresAuthentication(path, method.name())) {
                            operation.setSecurity(List.of(new SecurityRequirement().addList(BEARER_AUTH)));
                        } else {
                            // 빈 배열을 명시해 공개 API가 보안 요구사항을 상속하지 않게 한다.
                            operation.setSecurity(List.of());
                        }
                    })
            );
        };
    }

    /*
     * SecurityConfig의 requestMatchers 규칙을 OpenAPI의 {pathVariable} 형식으로 옮겼다.
     * GET /reviews/{id}/reaction은 회원 개인 반응이므로 공개하지 않고,
     * GET /reviews/{id}/reactions는 집계 수치이므로 공개한다.
     */
    boolean requiresAuthentication(String path, String method) {
        if ("GET".equals(method)) {
            // 개인 데이터는 넓은 공개 조회 규칙보다 먼저 판별한다.
            if ("/api/movies/my/liked".equals(path)
                    || "/api/reviews/me".equals(path)
                    || path.startsWith("/api/reviews/me/")
                    || "/api/auth/me".equals(path)
                    || path.startsWith("/api/auth/me/")) {
                return true;
            }

            if (path.startsWith("/api/movies/")
                    || path.startsWith("/api/boxoffice/")
                    || path.startsWith("/posters/")
                    || path.startsWith("/api/persons/")) {
                return false;
            }

            if ("/api/reviews".equals(path)
                    || "/api/reviews/summaries".equals(path)
                    || path.matches("^/api/reviews/[^/]+$")
                    || path.matches("^/api/reviews/[^/]+/(comments|reactions)$")
                    || path.matches("^/api/reviews/movie/[^/]+$")
                    || path.matches("^/api/reviews/movie/[^/]+/rating$")
                    || path.matches("^/api/comments/[^/]+/reactions$")) {
                return false;
            }

            if (path.startsWith("/api/auth/exists/id/")
                    || path.matches("^/api/auth/users/[^/]+/profile-image$")
                    || path.matches("^/api/auth/(kakao|naver|google)/authorize$")
                    || "/api/auth/{provider}/authorize".equals(path)) {
                return false;
            }
        }

        if ("POST".equals(method)) {
            if (List.of(
                    "/api/auth/signup",
                    "/api/auth/login",
                    "/api/auth/reissue",
                    "/api/auth/kakao",
                    "/api/auth/naver",
                    "/api/auth/google",
                    "/api/auth/{provider}",
                    "/api/movies/posters/status",
                    "/api/movies/posters/ensure"
            ).contains(path)) {
                return false;
            }
        }

        return true;
    }
}
