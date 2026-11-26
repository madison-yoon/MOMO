package com.momo.backend.dto.auth;
// 일회용 인증 컨텍스트는 서버 메모리에만 보관한다. PKCE 검증값을 로그에 노출하지 않는다.
public record OAuthRequestContext(String state, String nonce, String codeVerifier,
                                  OAuthPurpose purpose, com.momo.backend.entity.AuthProvider provider, Long targetUserId) {
    // 기존 인증 통신 테스트와 로그인 코드의 3개 보안값 생성 계약을 유지한다.
    public OAuthRequestContext(String state, String nonce, String codeVerifier) {
        this(state, nonce, codeVerifier, OAuthPurpose.LOGIN, null, null);
    }
    @Override public String toString() { return "OAuthRequestContext[redacted]"; }
}
