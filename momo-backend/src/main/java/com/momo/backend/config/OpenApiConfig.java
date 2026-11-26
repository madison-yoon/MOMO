package com.momo.backend.config;

import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

// 실제 SecurityConfig의 공개·인증 경로를 Swagger에도 동일하게 표시한다.
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
                            // 빈 보안 배열은 공개 API가 전역 인증 요구사항을 상속하지 않도록 한다.
                            operation.setSecurity(List.of());
                        }
                    })
            );
        };
    }

    private boolean requiresAuthentication(String path, String method) {
        if ("GET".equals(method)) {
            if ("/api/movies/my/liked".equals(path)
                    || "/api/reviews/me".equals(path)
                    || path.startsWith("/api/reviews/me/")) {
                return true;
            }

            if (path.equals("/api/movies") || path.startsWith("/api/movies/")
                    || path.startsWith("/api/persons/")
                    || path.startsWith("/api/boxoffice/")
                    || path.startsWith("/posters/")) {
                return false;
            }

            if (path.equals("/api/reviews") || path.startsWith("/api/reviews/")) {
                return false;
            }

            if (path.startsWith("/api/comments/") && path.endsWith("/reactions")) {
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
