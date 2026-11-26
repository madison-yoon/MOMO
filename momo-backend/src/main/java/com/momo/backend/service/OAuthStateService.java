package com.momo.backend.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.dto.auth.OAuthRequestContext;
import com.momo.backend.dto.auth.OAuthPurpose;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Ticker;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

// 로그인 시작 브라우저와 콜백을 묶고 state 재사용을 차단한다. JWT 세션 정책은 변경하지 않는다.
@Service
public class OAuthStateService {
    public static final long TTL_SECONDS = 300;
    private final SecureRandom random = new SecureRandom();
    private final Cache<String, OAuthRequestContext> pending;

    public OAuthStateService() {
        this(Ticker.systemTicker());
    }

    OAuthStateService(Ticker ticker) {
        // 미완료 인증 요청이 서버 메모리에 무한히 쌓이지 않도록 수명과 개수를 함께 제한한다.
        pending = Caffeine.newBuilder().maximumSize(1000)
                .expireAfterWrite(Duration.ofSeconds(TTL_SECONDS)).ticker(ticker).build();
    }

    // 추측하기 어려운 일회용 값을 발급하며 실제 계정·토큰 정보는 저장하지 않는다.
    public String issue() { return issue(AuthProvider.KAKAO).state(); }

    // 공급자마다 별도 키를 사용해 다른 로그인 흐름의 state를 가져다 쓰지 못하게 한다.
    public OAuthRequestContext issue(AuthProvider provider) {
        return issue(provider, OAuthPurpose.LOGIN, null);
    }

    /** 발급 시점의 목적·공급자·탈퇴 대상을 보관하고 두 목적의 캐시 키를 격리한다. */
    public OAuthRequestContext issue(AuthProvider provider, OAuthPurpose purpose, Long userId) {
        if (provider == null || provider == AuthProvider.LOCAL) throw new IllegalArgumentException("소셜 공급자가 필요합니다.");
        if (purpose == null || (purpose == OAuthPurpose.DELETE && userId == null)
                || (purpose == OAuthPurpose.LOGIN && userId != null)) throw new IllegalArgumentException("OAuth 목적을 확인해 주세요.");
        var context = new OAuthRequestContext(randomValue(), randomValue(), randomValue(), purpose, provider, userId);
        pending.put(provider.name() + ":" + purpose + ":" + context.state(), context);
        return context;
    }

    private String randomValue() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public void consume(String state, String cookie) { consume(AuthProvider.KAKAO, state, cookie); }

    // 쿠키 바인딩을 먼저 확인하고 원자적으로 한 번만 소비한다. 실패한 코드는 재교환하지 않는다.
    public OAuthRequestContext consume(AuthProvider provider, String state, String cookie) {
        return consume(provider, OAuthPurpose.LOGIN, null, state, cookie);
    }

    /** 다른 목적·회원 요청은 정상 컨텍스트를 가져가거나 소비하지 못한다. */
    public OAuthRequestContext consume(AuthProvider provider, OAuthPurpose purpose, Long userId, String state, String cookie) {
        if (provider == null || state == null || cookie == null || !state.matches("[A-Za-z0-9_-]{43}")
                || !MessageDigest.isEqual(state.getBytes(StandardCharsets.US_ASCII), cookie.getBytes(StandardCharsets.US_ASCII))) {
            throw unauthorized();
        }
        String key = provider.name() + ":" + purpose + ":" + state;
        var context = pending.getIfPresent(key);
        if (context == null) throw unauthorized();
        if (context.provider() != provider || context.purpose() != purpose
                || !java.util.Objects.equals(context.targetUserId(), userId)
                || !pending.asMap().remove(key, context)) throw unauthorized();
        return context;
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "소셜 인증 요청이 만료되었거나 일치하지 않습니다. 다시 시작해 주세요.");
    }
}
