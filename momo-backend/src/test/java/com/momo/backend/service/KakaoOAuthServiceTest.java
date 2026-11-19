package com.momo.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

// RestClient의 실제 요청 형식을 모의 카카오 서버에서 검증하며 실제 키·네트워크는 사용하지 않는다.
class KakaoOAuthServiceTest {
    @Test void codeExchangeAndUserRequestUseSeparateKakaoToken() {
        var builder = RestClient.builder();
        var server = MockRestServiceServer.bindTo(builder).build();
        var oauth = new KakaoOAuthService(builder.build(), "test-client", "test-secret", "http://localhost:3000/oauth/kakao");
        server.expect(requestTo("https://kauth.kakao.com/oauth/token")).andExpect(method(HttpMethod.POST))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("grant_type=authorization_code")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("client_secret=test-secret")))
                .andRespond(withSuccess("{\"access_token\":\"provider-test-token\"}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://kapi.kakao.com/v2/user/me")).andExpect(method(HttpMethod.GET))
                .andExpect(header("Authorization", "Bearer provider-test-token"))
                .andRespond(withSuccess("{\"id\":12345,\"kakao_account\":{\"email\":\"verified@example.test\",\"is_email_valid\":true,\"is_email_verified\":true,\"profile\":{\"nickname\":\"카카오표본\"}}}", MediaType.APPLICATION_JSON));
        var info = oauth.authenticate("test-code");
        assertEquals("12345", info.id());
        assertEquals("카카오표본", info.nickname());
        assertEquals("verified@example.test", info.email());
        server.verify();
    }

    @Test void deniedEmailIsNotFabricatedAndMissingIdentityIsRejected() {
        var builder = RestClient.builder();
        var server = MockRestServiceServer.bindTo(builder).build();
        var oauth = new KakaoOAuthService(builder.build(), "id", "secret", "http://localhost:3000/oauth/kakao");
        server.expect(anything()).andRespond(withSuccess("{\"access_token\":\"test-token\"}", MediaType.APPLICATION_JSON));
        server.expect(anything()).andRespond(withSuccess("{\"id\":42,\"kakao_account\":{\"email\":\"unverified@example.test\"}}", MediaType.APPLICATION_JSON));
        assertNull(oauth.authenticate("code").email());
        server.verify();
        server.reset();
        server.expect(anything()).andRespond(withSuccess("{\"access_token\":\"test-token\"}", MediaType.APPLICATION_JSON));
        server.expect(anything()).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        assertThrows(ResponseStatusException.class, () -> oauth.authenticate("code"));
    }

    @Test void providerErrorsDoNotExposeResponseBodyOrCredentials() {
        var builder = RestClient.builder();
        var server = MockRestServiceServer.bindTo(builder).build();
        var oauth = new KakaoOAuthService(builder.build(), "id", "sensitive-secret", "http://localhost:3000/oauth/kakao");
        server.expect(anything()).andRespond(withStatus(HttpStatus.BAD_REQUEST).body("sensitive-provider-body"));
        var error = assertThrows(ResponseStatusException.class, () -> oauth.authenticate("code"));
        assertEquals(401, error.getStatusCode().value());
        assertFalse(error.toString().contains("sensitive"));
        assertNull(error.getCause());
    }

    @Test void missingConfigurationFailsClosedWithoutHttpRequest() {
        var oauth = new KakaoOAuthService(RestClient.create(), "", "", "");
        var error = assertThrows(ResponseStatusException.class, () -> oauth.authorizationUrl("state"));
        assertEquals(503, error.getStatusCode().value());
    }
}
