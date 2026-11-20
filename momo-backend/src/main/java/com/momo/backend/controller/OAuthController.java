package com.momo.backend.controller;

import com.momo.backend.dto.auth.*;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.security.MemberPrincipal;
import com.momo.backend.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** 세 공급자의 기존 로그인 주소를 유지하면서 LOGIN·DELETE의 쿠키·state·완료 책임을 분리한다. */
@RestController
@RequestMapping("/api/auth/{provider:kakao|naver|google}")
@RequiredArgsConstructor
public class OAuthController {
    private final OAuthStateService states;
    private final KakaoOAuthService kakao;
    private final SocialOAuthService social;
    private final SocialLoginService logins;
    private final AccountDeletionService deletions;

    /** 기존 공개 로그인 계약을 유지하고 서버에서 LOGIN 목적을 고정한다. */
    @GetMapping("/authorize")
    public ResponseEntity<OAuthAuthorizeResponse> authorize(@PathVariable String provider, HttpServletRequest request) {
        return issue(provider, OAuthPurpose.LOGIN, null, request);
    }

    /** state 검증 후에만 외부 신원을 확인하고 회원 조회·가입으로 연결한다. */
    @PostMapping
    public ResponseEntity<LoginResponse> login(@PathVariable String provider, @Valid @RequestBody OAuthLoginRequest body, HttpServletRequest request) {
        var type = type(provider);
        var context = states.consume(type, body.state(), cookieValue(provider, OAuthPurpose.LOGIN, request));
        var identity = type == AuthProvider.KAKAO ? kakao.authenticate(body.code()) : social.authenticate(type, body.code(), context);
        return noStore().header(HttpHeaders.SET_COOKIE, cookie(provider, OAuthPurpose.LOGIN, "", 0, request).toString())
                .body(logins.login(type, identity));
    }

    /** 인증된 회원과 명시적 동의를 확인한 후 탈퇴 목적을 발급한다. */
    @PostMapping("/delete/authorize")
    public ResponseEntity<OAuthAuthorizeResponse> deleteAuthorize(@PathVariable String provider, @RequestBody UserDeleteRequest body,
            Authentication authentication, HttpServletRequest request) {
        Long userId = MemberPrincipal.requireUserId(authentication);
        deletions.validateStart(userId, type(provider), body.agreed(), body.confirmation());
        return issue(provider, OAuthPurpose.DELETE, userId, request);
    }

    /** 로그인과 별도의 state를 소비하며 삭제가 커밋된 경우에만 완료 응답을 보낸다. */
    @PostMapping("/delete/complete")
    public ResponseEntity<String> deleteComplete(@PathVariable String provider, @Valid @RequestBody OAuthDeleteRequest body,
            Authentication authentication, HttpServletRequest request) {
        Long userId = MemberPrincipal.requireUserId(authentication);
        var type = type(provider);
        deletions.validateStart(userId, type, body.agreed(), body.confirmation());
        OAuthRequestContext context;
        try { context = states.consume(type, OAuthPurpose.DELETE, userId, body.state(), cookieValue(provider, OAuthPurpose.DELETE, request)); }
        catch (ResponseStatusException error) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "탈퇴 인증 요청이 만료되었거나 일치하지 않습니다. 다시 시작해 주세요.");
        }
        deletions.complete(userId, type, context, body);
        SecurityContextHolder.clearContext();
        return noStore().header(HttpHeaders.SET_COOKIE, cookie(provider, OAuthPurpose.DELETE, "", 0, request).toString())
                .body("회원 탈퇴가 완료되었습니다.");
    }

    private ResponseEntity<OAuthAuthorizeResponse> issue(String provider, OAuthPurpose purpose, Long userId, HttpServletRequest request) {
        var type = type(provider);
        var context = states.issue(type, purpose, userId);
        var url = type == AuthProvider.KAKAO ? kakao.authorizationUrl(context.state()) : social.authorizationUrl(type, context);
        return noStore().header(HttpHeaders.SET_COOKIE, cookie(provider, purpose, context.state(), OAuthStateService.TTL_SECONDS, request).toString())
                .body(new OAuthAuthorizeResponse(url, OAuthStateService.TTL_SECONDS));
    }

    private ResponseEntity.BodyBuilder noStore() { return ResponseEntity.ok().cacheControl(CacheControl.noStore()); }
    private AuthProvider type(String provider) { return AuthProvider.valueOf(provider.toUpperCase(java.util.Locale.ROOT)); }
    private String cookieName(String provider, OAuthPurpose purpose) { return "momo_" + provider + (purpose == OAuthPurpose.LOGIN ? "_state" : "_delete_state"); }
    private String cookieValue(String provider, OAuthPurpose purpose, HttpServletRequest request) {
        if (request.getCookies() != null) for (var cookie : request.getCookies()) if (cookie.getName().equals(cookieName(provider, purpose))) return cookie.getValue();
        return null;
    }
    private ResponseCookie cookie(String provider, OAuthPurpose purpose, String value, long age, HttpServletRequest request) {
        var type = type(provider);
        boolean secure = type == AuthProvider.KAKAO ? kakao.secureRedirect() : social.secureRedirect(type);
        return ResponseCookie.from(cookieName(provider, purpose), value).httpOnly(true).secure(request.isSecure() || secure)
                .sameSite("Lax").path("/api/auth/" + provider).maxAge(age).build();
    }
}
