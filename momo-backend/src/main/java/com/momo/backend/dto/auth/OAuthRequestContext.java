package com.momo.backend.dto.auth;
// 일회용 인증 컨텍스트는 서버 메모리에만 보관한다. PKCE 검증값을 로그에 노출하지 않는다.
public record OAuthRequestContext(String state, String nonce, String codeVerifier) {
    @Override public String toString() { return "OAuthRequestContext[redacted]"; }
}
