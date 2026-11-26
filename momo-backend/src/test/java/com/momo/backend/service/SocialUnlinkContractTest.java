package com.momo.backend.service;

import com.momo.backend.entity.AuthProvider;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

/** 실제 HTTP 직렬화 경계에서 외부 해제 계약과 비밀값 비노출을 검증한다. */
class SocialUnlinkContractTest {
    @Test void kakaoUsesAdminKeyAndChecksReturnedIdentity() {
        var builder = RestClient.builder(); var server = MockRestServiceServer.bindTo(builder).build();
        var service = new KakaoOAuthService(builder.build(), "client", "secret", "http://localhost/oauth/kakao", "admin-key");
        server.expect(requestTo("https://kapi.kakao.com/v1/user/unlink")).andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "KakaoAK admin-key"))
                .andExpect(content().string("target_id_type=user_id&target_id=123"))
                .andRespond(withSuccess("{\"id\":123}", MediaType.APPLICATION_JSON));
        assertDoesNotThrow(() -> service.unlink("123")); server.verify();
    }
    @Test void wrongKakaoResponseCannotPermitDeletion() {
        var builder = RestClient.builder(); var server = MockRestServiceServer.bindTo(builder).build();
        var service = new KakaoOAuthService(builder.build(), "client", "secret", "http://localhost/oauth/kakao", "admin-key");
        server.expect(requestTo("https://kapi.kakao.com/v1/user/unlink"))
                .andRespond(withSuccess("{\"id\":456}", MediaType.APPLICATION_JSON));
        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.unlink("123")); server.verify();
    }
    @Test void onlyDocumentedNotLinkedKakaoErrorCountsAsTargetAlreadyReached() {
        for (int code : new int[]{-101, -1013, -401}) {
            var builder = RestClient.builder(); var server = MockRestServiceServer.bindTo(builder).build();
            var service = new KakaoOAuthService(builder.build(), "client", "secret", "http://localhost/oauth/kakao", "admin-key");
            server.expect(requestTo("https://kapi.kakao.com/v1/user/unlink"))
                    .andRespond(withBadRequest().contentType(MediaType.APPLICATION_JSON).body("{\"code\":" + code + "}"));
            if (code == -101) assertDoesNotThrow(() -> service.unlink("123"));
            else assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.unlink("123"));
            server.verify();
        }
    }
    @Test void providerClientErrorsCannotBeMisreadAsSuccessfulRevocation() {
        for (var provider : new AuthProvider[]{AuthProvider.NAVER, AuthProvider.GOOGLE}) {
            var builder = RestClient.builder(); var server = MockRestServiceServer.bindTo(builder).build();
            var service = new SocialOAuthService(builder.build(), new GoogleIdentityVerifier(), java.util.Map.of(provider,
                    new SocialOAuthService.Settings("client", "secret", "http://localhost/oauth/callback")));
            server.expect(requestTo(provider == AuthProvider.NAVER ? "https://nid.naver.com/oauth2.0/revoke" : "https://oauth2.googleapis.com/revoke"))
                    .andRespond(withBadRequest().body("{\"error\":\"invalid_token\"}"));
            var error = assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.unlink(provider, "ephemeral"));
            assertEquals(502, error.getStatusCode().value()); server.verify();
        }
    }
    @Test void naverAndGoogleRevokeWithEphemeralAccessToken() {
        for (var provider : new AuthProvider[]{AuthProvider.NAVER, AuthProvider.GOOGLE}) {
            var builder = RestClient.builder(); var server = MockRestServiceServer.bindTo(builder).build();
            var service = new SocialOAuthService(builder.build(), new GoogleIdentityVerifier(), java.util.Map.of(provider,
                    new SocialOAuthService.Settings("client", "secret", "http://localhost/oauth/callback")));
            server.expect(requestTo(provider == AuthProvider.NAVER ? "https://nid.naver.com/oauth2.0/revoke" : "https://oauth2.googleapis.com/revoke"))
                    .andExpect(method(HttpMethod.POST)).andExpect(content().string(provider == AuthProvider.NAVER
                            ? "client_id=client&client_secret=secret&token=ephemeral&token_type_hint=access_token" : "token=ephemeral"))
                    .andRespond(withSuccess());
            assertDoesNotThrow(() -> service.unlink(provider, "ephemeral")); server.verify();
        }
    }
    @Test void unknownTransportResultIsNotRetriedAndDoesNotExposeToken() {
        var builder = RestClient.builder(); var server = MockRestServiceServer.bindTo(builder).build();
        var service = new SocialOAuthService(builder.build(), new GoogleIdentityVerifier(), java.util.Map.of(AuthProvider.GOOGLE,
                new SocialOAuthService.Settings("client", "secret", "http://localhost/oauth/google")));
        server.expect(requestTo("https://oauth2.googleapis.com/revoke")).andRespond(withException(new java.net.SocketTimeoutException("ephemeral")));
        var error = assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.unlink(AuthProvider.GOOGLE, "ephemeral"));
        assertTrue(error.getReason().contains("확인")); assertFalse(error.toString().contains("ephemeral")); assertNull(error.getCause()); server.verify();
    }
}
