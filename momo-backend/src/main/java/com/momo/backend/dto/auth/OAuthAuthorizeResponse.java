package com.momo.backend.dto.auth;

// 프론트는 이 URL로 이동하며 브라우저 바인딩 쿠키는 응답 헤더로만 전달한다.
public record OAuthAuthorizeResponse(String authorizationUrl, long expiresIn) {
}
