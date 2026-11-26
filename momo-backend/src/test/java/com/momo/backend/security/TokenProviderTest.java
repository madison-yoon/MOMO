package com.momo.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TokenProviderTest {

    private TokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new TokenProvider(
                "TW9tb1Rlc3RPbmx5U2VjcmV0S2V5Rm9ySlZUVGVzdHMxMjM0NQ==",
                1_800_000L,
                604_800_000L);
    }

    @Test
    void accessTokenIsAcceptedOnlyAsAccessToken() {
        String accessToken = tokenProvider.createToken(1L);

        assertTrue(tokenProvider.validateToken(accessToken));
        assertFalse(tokenProvider.validateRefreshToken(accessToken));
    }

    @Test
    void refreshTokenIsAcceptedOnlyAsRefreshToken() {
        String refreshToken = tokenProvider.createRefreshToken(1L);

        assertTrue(tokenProvider.validateRefreshToken(refreshToken));
        assertFalse(tokenProvider.validateToken(refreshToken));
    }

    @Test
    void expiredAndMalformedRefreshTokensAreRejected() {
        TokenProvider expiredTokenProvider = new TokenProvider(
                "TW9tb1Rlc3RPbmx5U2VjcmV0S2V5Rm9ySlZUVGVzdHMxMjM0NQ==",
                1_800_000L,
                -1L);

        assertFalse(expiredTokenProvider.validateRefreshToken(
                expiredTokenProvider.createRefreshToken(1L)));
        assertFalse(tokenProvider.validateRefreshToken("not-a-jwt"));
    }

    @Test
    void versionTwoTokensUseStableMemberId() {
        String access = tokenProvider.createToken(42L);
        org.junit.jupiter.api.Assertions.assertEquals(42L, tokenProvider.getUserId(access));
        org.junit.jupiter.api.Assertions.assertEquals(42L,
                ((MemberPrincipal) tokenProvider.getAuthentication(access).getPrincipal()).userId());
    }

    @Test
    void rejectsLegacyTokensAndMalformedVersionTwoSubjects() {
        javax.crypto.SecretKey key = io.jsonwebtoken.Jwts.SIG.HS256.key().build();
        TokenProvider provider = new TokenProvider(java.util.Base64.getEncoder().encodeToString(key.getEncoded()), 60000L, 60000L);
        for (String type : java.util.List.of("access", "refresh")) {
            for (String subject : java.util.List.of("old-login", "42")) {
                String legacy = io.jsonwebtoken.Jwts.builder().subject(subject).claim("typ", type)
                        .expiration(new java.util.Date(System.currentTimeMillis() + 60000)).signWith(key).compact();
                assertFalse(provider.validateToken(legacy));
                assertFalse(provider.validateRefreshToken(legacy));
            }
            for (String subject : java.util.List.of("0", "-1", "01", "login-id", "9223372036854775808")) {
                String invalid = io.jsonwebtoken.Jwts.builder().subject(subject).claim("ver", 2).claim("typ", type)
                        .expiration(new java.util.Date(System.currentTimeMillis() + 60000)).signWith(key).compact();
                assertFalse(provider.validateToken(invalid));
                assertFalse(provider.validateRefreshToken(invalid));
            }
        }
        String valid = provider.createToken(42L);
        var claims = io.jsonwebtoken.Jwts.parser().verifyWith(key).build().parseSignedClaims(valid).getPayload();
        org.junit.jupiter.api.Assertions.assertEquals("42", claims.getSubject());
        org.junit.jupiter.api.Assertions.assertEquals(2, claims.get("ver", Integer.class));
        String wrongVersion = io.jsonwebtoken.Jwts.builder().subject("42").claim("ver", 3).claim("typ", "access")
                .expiration(new java.util.Date(System.currentTimeMillis() + 60000)).signWith(key).compact();
        assertFalse(provider.validateToken(wrongVersion));
    }
}
