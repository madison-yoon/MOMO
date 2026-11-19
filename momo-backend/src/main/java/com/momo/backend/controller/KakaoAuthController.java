package com.momo.backend.controller;

import com.momo.backend.dto.auth.KakaoAuthorizeResponse;
import com.momo.backend.dto.auth.KakaoLoginRequest;
import com.momo.backend.dto.auth.LoginResponse;
import com.momo.backend.service.KakaoLoginService;
import com.momo.backend.service.KakaoOAuthService;
import com.momo.backend.service.KakaoStateService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// 카카오 시작과 코드 교환만 제공하며 기존 로그인·재발급·로그아웃 API는 유지한다.
@RestController
@RequestMapping("/api/auth/kakao")
@RequiredArgsConstructor
public class KakaoAuthController {
    private static final String STATE_COOKIE = "momo_kakao_state";
    private final KakaoStateService states;
    private final KakaoOAuthService oauth;
    private final KakaoLoginService logins;

    // React는 credentials를 포함해 호출한 뒤 응답 URL로 이동한다. state 쿠키는 JS에서 읽을 수 없다.
    @GetMapping("/authorize")
    public ResponseEntity<KakaoAuthorizeResponse> authorize(HttpServletRequest request) {
        String state = states.issue();
        String url = oauth.authorizationUrl(state);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, cookie(state, KakaoStateService.TTL_SECONDS, request).toString())
                .body(new KakaoAuthorizeResponse(url, KakaoStateService.TTL_SECONDS));
    }

    // 쿠키·state 확인을 먼저 끝내고 카카오 통신 및 회원 저장을 수행해 로그인 CSRF를 차단한다.
    @PostMapping
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody KakaoLoginRequest body,
            @CookieValue(value = STATE_COOKIE, required = false) String cookie,
            HttpServletRequest request) {
        states.consume(body.state(), cookie);
        var info = oauth.authenticate(body.code());
        var response = logins.login(info);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, cookie("", 0, request).toString()).body(response);
    }

    private ResponseCookie cookie(String value, long age, HttpServletRequest request) {
        return ResponseCookie.from(STATE_COOKIE, value).httpOnly(true)
                .secure(request.isSecure() || oauth.secureRedirect()).sameSite("Lax")
                .path("/api/auth/kakao").maxAge(age).build();
    }
}
