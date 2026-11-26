package com.momo.backend.service;

import com.momo.backend.dto.auth.OAuthRequestContext;
import com.momo.backend.dto.auth.SocialUserInfo;
import com.momo.backend.dto.auth.OAuthPurpose;
import com.momo.backend.dto.auth.OAuthAuthenticationResult;
import com.momo.backend.entity.AuthProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;

// 네이버·구글 외부 통신만 담당한다. 외부 토큰은 DB에 저장하거나 MOMO JWT로 사용하지 않는다.
@Service
public class SocialOAuthService {
    private static final ParameterizedTypeReference<Map<String, Object>> MAP = new ParameterizedTypeReference<>() {};
    private final RestClient client;
    private final GoogleIdentityVerifier google;
    private final Map<AuthProvider, Settings> settings;
    record Settings(String clientId, String secret, String redirect) {
        @Override public String toString() { return "Settings[redacted]"; }
    }

    @Autowired
    public SocialOAuthService(GoogleIdentityVerifier google,
            @Value("${naver.oauth.client-id:}") String ni, @Value("${naver.oauth.client-secret:}") String ns,
            @Value("${naver.oauth.redirect-uri:}") String nr, @Value("${google.oauth.client-id:}") String gi,
            @Value("${google.oauth.client-secret:}") String gs, @Value("${google.oauth.redirect-uri:}") String gr) {
        this(OAuthHttpSupport.client(), google, Map.of(AuthProvider.NAVER, new Settings(ni, ns, nr), AuthProvider.GOOGLE, new Settings(gi, gs, gr)));
    }
    SocialOAuthService(RestClient client, GoogleIdentityVerifier google, Map<AuthProvider, Settings> settings) {
        this.client = client; this.google = google; this.settings = settings;
    }

    // 콜백 주소는 서버 설정만 사용하며 Google nonce·PKCE 값을 브라우저 입력으로 덮어쓰지 못하게 한다.
    public String authorizationUrl(AuthProvider provider, OAuthRequestContext context) {
        var s = configuration(provider);
        var url = UriComponentsBuilder.fromUriString(provider == AuthProvider.NAVER
                ? "https://nid.naver.com/oauth2.0/authorize" : "https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("response_type", "code").queryParam("client_id", s.clientId())
                .queryParam("redirect_uri", s.redirect()).queryParam("state", context.state());
        if (provider == AuthProvider.GOOGLE) {
            url.queryParam("scope", "openid email profile").queryParam("nonce", context.nonce())
                    .queryParam("code_challenge_method", "S256").queryParam("code_challenge", challenge(context.codeVerifier()));
        }
        if (context.purpose() == OAuthPurpose.DELETE) {
            // 계정 선택·재동의는 Google 비밀번호 재입력 강제를 의미하지 않는다.
            if (provider == AuthProvider.NAVER) url.queryParam("auth_type", "reauthenticate");
            else url.queryParam("prompt", "select_account");
        }
        return url.build().encode().toUriString();
    }
    public boolean secureRedirect(AuthProvider provider) { return URI.create(configuration(provider).redirect()).getScheme().equalsIgnoreCase("https"); }

    // state가 소비된 후 호출되며 인가 코드 교환은 자동 재시도하지 않는다. 외부 오류 원문도 노출하지 않는다.
    public SocialUserInfo authenticate(AuthProvider provider, String code, OAuthRequestContext context) {
        return authenticateResult(provider, code, context, false).identity();
    }

    /** 기존 신원 검증을 그대로 거친 뒤 탈퇴에 필요한 토큰만 일시 반환한다. */
    public OAuthAuthenticationResult authenticateForDeletion(AuthProvider provider, String code, OAuthRequestContext context) {
        return authenticateResult(provider, code, context, true);
    }

    private OAuthAuthenticationResult authenticateResult(AuthProvider provider, String code, OAuthRequestContext context, boolean deleting) {
        var s = configuration(provider);
        if (code == null || code.isBlank() || code.length() > 2048) throw denied();
        var form = new LinkedMultiValueMap<String, String>();
        form.add("grant_type", "authorization_code"); form.add("client_id", s.clientId());
        form.add("client_secret", s.secret()); form.add("code", code); form.add("redirect_uri", s.redirect());
        if (provider == AuthProvider.NAVER) form.add("state", context.state());
        else form.add("code_verifier", context.codeVerifier());
        try {
            var token = client.post().uri(provider == AuthProvider.NAVER ? "https://nid.naver.com/oauth2.0/token" : "https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().body(MAP);
            if (token == null || token.containsKey("error")) throw denied();
            if (provider == AuthProvider.GOOGLE) {
                if (!(token.get("id_token") instanceof String idToken)) throw denied();
                var identity = google.verify(idToken, s.clientId(), context.nonce());
                String access = token.get("access_token") instanceof String value ? value : null;
                if (deleting && (access == null || access.isBlank())) throw denied();
                return new OAuthAuthenticationResult(identity, deleting ? access : null);
            }
            if (!(token.get("access_token") instanceof String access) || access.isBlank()) throw denied();
            var user = client.get().uri("https://openapi.naver.com/v1/nid/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + access).retrieve().body(MAP);
            if (user == null || !"00".equals(user.get("resultcode")) || !(user.get("response") instanceof Map<?, ?> profile)
                    || !(profile.get("id") instanceof String id) || id.isBlank() || id.length() > 255
                    || id.chars().anyMatch(Character::isISOControl)) throw denied();
            return new OAuthAuthenticationResult(new SocialUserInfo(id, profile.get("nickname") instanceof String name ? name : "네이버회원", email(profile.get("email"))), deleting ? access : null);
        } catch (RestClientException error) { throw OAuthHttpSupport.authenticationFailure(error); }
    }

    /** 신규 Access Token만 사용하고 성공 응답 뒤 공급자 토큰을 보관하지 않는다. */
    public void unlink(AuthProvider provider, String accessToken) {
        var s = configuration(provider);
        if (accessToken == null || accessToken.isBlank()) throw denied();
        var form = new LinkedMultiValueMap<String, String>();
        if (provider == AuthProvider.NAVER) {
            form.add("client_id", s.clientId()); form.add("client_secret", s.secret());
        }
        form.add("token", accessToken);
        if (provider == AuthProvider.NAVER) form.add("token_type_hint", "access_token");
        try {
            var response = client.post().uri(provider == AuthProvider.NAVER ? "https://nid.naver.com/oauth2.0/revoke" : "https://oauth2.googleapis.com/revoke")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().toBodilessEntity();
            if (response.getStatusCode().value() != 200) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "외부 연결 해제 결과를 확인할 수 없습니다. MOMO 탈퇴는 완료되지 않았습니다.");
        } catch (RestClientException error) { throw OAuthHttpSupport.unlinkFailure(error); }
    }
    static String email(Object value) {
        return value instanceof String e && e.length() <= 254 && e.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+") ? e : null;
    }
    private Settings configuration(AuthProvider provider) {
        var s = settings.get(provider);
        if (s == null || s.clientId().isBlank() || s.secret().isBlank() || s.redirect().isBlank())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "소셜 로그인 환경설정이 필요합니다.");
        try {
            URI uri = URI.create(s.redirect());
            if (uri.getHost() == null || uri.getFragment() != null || uri.getUserInfo() != null
                    || !("https".equalsIgnoreCase(uri.getScheme()) || ("http".equalsIgnoreCase(uri.getScheme())
                    && ("localhost".equals(uri.getHost()) || "127.0.0.1".equals(uri.getHost()))))) throw new IllegalArgumentException();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "소셜 로그인 Redirect URI 설정을 확인해 주세요.");
        }
        return s;
    }
    private String challenge(String verifier) {
        try { return Base64.getUrlEncoder().withoutPadding().encodeToString(MessageDigest.getInstance("SHA-256").digest(verifier.getBytes(StandardCharsets.US_ASCII))); }
        catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException("PKCE 초기화 실패"); }
    }
    private ResponseStatusException denied() { return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "소셜 인증에 실패했습니다. 로그인을 다시 시작해 주세요."); }
}
