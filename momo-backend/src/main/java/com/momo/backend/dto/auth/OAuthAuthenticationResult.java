package com.momo.backend.dto.auth;

/** 탈퇴 처리 동안만 유지하는 외부 신원·토큰이며 JSON 응답으로 직렬화하지 않는다. */
public record OAuthAuthenticationResult(SocialUserInfo identity, @com.fasterxml.jackson.annotation.JsonIgnore String accessToken) {
    @Override public String toString() { return "OAuthAuthenticationResult[redacted]"; }
}
