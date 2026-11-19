package com.momo.backend.controller;

import com.momo.backend.dto.auth.KakaoAuthorizeResponse;
import com.momo.backend.dto.auth.KakaoLoginRequest;
import com.momo.backend.dto.auth.LoginResponse;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

// 카카오의 쿠키·일회용 state 계약을 네이버·구글에도 적용하되 허용 공급자는 경로로 한정한다.
@RestController
@RequestMapping("/api/auth/{provider:naver|google}")
@RequiredArgsConstructor
public class SocialAuthController {
    private final KakaoStateService states;
    private final SocialOAuthService oauth;
    private final KakaoLoginService logins;

    @GetMapping("/authorize")
    public ResponseEntity<KakaoAuthorizeResponse> authorize(@PathVariable String provider, HttpServletRequest request) {
        var type = type(provider);
        var context = states.issue(type);
        var url = oauth.authorizationUrl(type, context);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, cookie(provider, context.state(), KakaoStateService.TTL_SECONDS, request).toString())
                .body(new KakaoAuthorizeResponse(url, KakaoStateService.TTL_SECONDS));
    }

    // 공급자별 HttpOnly 쿠키와 state를 검증한 다음 외부 신원 확인과 회원 저장을 순서대로 수행한다.
    @PostMapping
    public ResponseEntity<LoginResponse> login(@PathVariable String provider, @Valid @RequestBody KakaoLoginRequest body, HttpServletRequest request) {
        String value = null;
        if (request.getCookies() != null) for (var cookie : request.getCookies())
            if (cookie.getName().equals("momo_" + provider + "_state")) value = cookie.getValue();
        var type = type(provider);
        var context = states.consume(type, body.state(), value);
        var response = logins.login(type, oauth.authenticate(type, body.code(), context));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, cookie(provider, "", 0, request).toString()).body(response);
    }
    private AuthProvider type(String provider) { return AuthProvider.valueOf(provider.toUpperCase(java.util.Locale.ROOT)); }
    private ResponseCookie cookie(String provider, String value, long age, HttpServletRequest request) {
        return ResponseCookie.from("momo_" + provider + "_state", value).httpOnly(true)
                .secure(request.isSecure() || oauth.secureRedirect(type(provider))).sameSite("Lax")
                .path("/api/auth/" + provider).maxAge(age).build();
    }
}
