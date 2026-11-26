package com.momo.backend.service;

import com.momo.backend.dto.auth.SocialUserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.util.Map;

// 카카오 토큰은 외부 사용자 확인에만 사용하고 MOMO JWT 발급·저장은 기존 서비스에 맡긴다.
@Service
public class KakaoOAuthService {
    private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {};
    private final RestClient client;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String adminKey;

    @Autowired
    public KakaoOAuthService(@Value("${kakao.client-id:}") String clientId,
                             @Value("${kakao.client-secret:}") String clientSecret,
                             @Value("${kakao.redirect-uri:}") String redirectUri,
                             @Value("${kakao.admin-key:${KAKAO_ADMIN_KEY:}}") String adminKey) {
        this(OAuthHttpSupport.client(), clientId, clientSecret, redirectUri, adminKey);
    }

    KakaoOAuthService(RestClient client, String clientId, String clientSecret, String redirectUri) {
        this(client, clientId, clientSecret, redirectUri, "");
    }

    KakaoOAuthService(RestClient client, String clientId, String clientSecret, String redirectUri, String adminKey) {
        this.client = client;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.adminKey = adminKey;
    }

    /** 서버 DB에서 얻은 대상만 해제한다. 다른 ID 응답·모호한 오류는 성공으로 취급하지 않는다. */
    public void unlink(String providerId) {
        if (adminKey == null || adminKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "카카오 연결 해제 환경설정이 필요합니다.");
        if (providerId == null || !providerId.matches("[1-9][0-9]{0,19}")) throw new IllegalArgumentException("카카오 회원 식별정보가 올바르지 않습니다.");
        var form = new LinkedMultiValueMap<String, String>();
        form.add("target_id_type", "user_id"); form.add("target_id", providerId);
        try {
            var response = client.post().uri("https://kapi.kakao.com/v1/user/unlink")
                    .header(HttpHeaders.AUTHORIZATION, "KakaoAK " + adminKey)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().body(MAP);
            if (response == null || !providerId.equals(String.valueOf(response.get("id"))))
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "카카오 연결 해제 결과를 확인할 수 없습니다. MOMO 탈퇴는 완료되지 않았습니다.");
        } catch (RestClientResponseException error) {
            // 공식 -101은 해당 앱에 연결되지 않은 회원이다. 다른 4xx나 유사 코드는 성공으로 확대하지 않는다.
            if (error.getStatusCode().value() == 400) {
                try {
                    var body = error.getResponseBodyAs(Map.class);
                    if (body != null && body.get("code") instanceof Number code && code.intValue() == -101) return;
                } catch (Exception ignored) { /* 해석 불가 응답은 아래 실패 처리로 전달한다. */ }
            }
            throw OAuthHttpSupport.unlinkFailure(error);
        } catch (RestClientException error) { throw OAuthHttpSupport.unlinkFailure(error); }
    }

    // 인가 요청과 토큰 교환 모두 서버의 동일한 Redirect URI를 사용해 임의 콜백 변경을 막는다.
    public String authorizationUrl(String state) {
        requireConfiguration();
        return UriComponentsBuilder.fromUriString("https://kauth.kakao.com/oauth/authorize")
                .queryParam("response_type", "code").queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri).queryParam("state", state)
                .build().encode().toUriString();
    }

    public boolean secureRedirect() {
        requireConfiguration();
        return "https".equalsIgnoreCase(URI.create(redirectUri).getScheme());
    }

    // 인가 코드는 한 번만 교환한다. 외부 토큰·원문 오류·요청 본문을 로그나 예외에 남기지 않는다.
    public SocialUserInfo authenticate(String code) {
        requireConfiguration();
        if (code == null || code.isBlank() || code.length() > 2048) throw unauthorized();
        var form = new LinkedMultiValueMap<String, String>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("code", code);
        try {
            var token = client.post().uri("https://kauth.kakao.com/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().body(MAP);
            if (token == null || !(token.get("access_token") instanceof String access) || access.isBlank()) throw unauthorized();
            var user = client.get().uri("https://kapi.kakao.com/v2/user/me")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + access).retrieve().body(MAP);
            if (user == null || user.get("id") == null) throw unauthorized();
            String id = user.get("id").toString();
            if (!id.matches("[1-9][0-9]{0,19}")) throw unauthorized();
            Map<?, ?> account = user.get("kakao_account") instanceof Map<?, ?> map ? map : Map.of();
            Map<?, ?> profile = account.get("profile") instanceof Map<?, ?> map ? map : Map.of();
            String nickname = profile.get("nickname") instanceof String name ? name : "카카오회원";
            // 이메일은 동의·유효·검증이 확인된 경우만 저장하며 계정 연결 키로 사용하지 않는다.
            String email = account.get("email") instanceof String address && address.length() <= 254
                    && address.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")
                    && Boolean.TRUE.equals(account.get("is_email_valid")) && Boolean.TRUE.equals(account.get("is_email_verified"))
                    ? address : null;
            return new SocialUserInfo(id, nickname, email);
        } catch (RestClientException error) { throw OAuthHttpSupport.authenticationFailure(error); }
    }

    private void requireConfiguration() {
        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()
                || redirectUri == null || redirectUri.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "카카오 로그인 환경설정이 필요합니다.");
        }
        try {
            URI redirect = URI.create(redirectUri);
            if (redirect.getHost() == null || redirect.getFragment() != null || redirect.getUserInfo() != null
                    || !("https".equalsIgnoreCase(redirect.getScheme())
                    || ("http".equalsIgnoreCase(redirect.getScheme()) && ("localhost".equals(redirect.getHost()) || "127.0.0.1".equals(redirect.getHost()))))) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "카카오 Redirect URI 설정을 확인해 주세요.");
        }
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "카카오 인증에 실패했습니다. 로그인을 다시 시작해 주세요.");
    }
}
