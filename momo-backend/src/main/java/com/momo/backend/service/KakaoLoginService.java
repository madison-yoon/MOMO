package com.momo.backend.service;

import com.momo.backend.dto.auth.KakaoUserInfo;
import com.momo.backend.dto.auth.SocialUserInfo;
import com.momo.backend.dto.auth.LoginResponse;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.entity.User;
import com.momo.backend.repository.UserRepository;
import com.momo.backend.security.TokenProvider;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

// 외부 인증을 마친 소셜 계정을 기존 회원·JWT·Refresh Token 저장 구조에 연결한다.
@Service
public class KakaoLoginService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final TokenProvider tokens;
    private final RefreshTokenService refreshTokens;
    private final TransactionTemplate transaction;

    public KakaoLoginService(UserRepository users, PasswordEncoder passwords, TokenProvider tokens,
                             RefreshTokenService refreshTokens, PlatformTransactionManager manager) {
        this.users = users;
        this.passwords = passwords;
        this.tokens = tokens;
        this.refreshTokens = refreshTokens;
        transaction = new TransactionTemplate(manager);
        transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    // 외부 HTTP 호출은 이 메서드 전에 끝내 DB 트랜잭션 중 외부 서버를 기다리지 않는다.
    public LoginResponse login(KakaoUserInfo info) {
        if (info == null || info.id() == null || !info.id().matches("[1-9][0-9]{0,19}")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "카카오 회원 식별정보가 올바르지 않습니다.");
        }
        return login(AuthProvider.KAKAO, new SocialUserInfo(info.id(), info.nickname(), info.email()));
    }

    // 검증된 소셜 ID만 받아 기존 숫자 회원 PK와 JWT 발급·회전 정책을 공급자 공통으로 재사용한다.
    public LoginResponse login(AuthProvider provider, SocialUserInfo info) {
        if (provider == null || provider == AuthProvider.LOCAL || info == null || info.id() == null
                || info.id().isBlank() || info.id().length() > 255 || info.id().chars().anyMatch(Character::isISOControl)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "소셜 회원 식별정보가 올바르지 않습니다.");
        }
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                return transaction.execute(status -> {
                    User user = users.findByProviderAndProviderId(provider, info.id())
                            .orElseGet(() -> createUser(provider, info));
                    String access = tokens.createToken(user.getUserId());
                    String refresh = tokens.createRefreshToken(user.getUserId());
                    // 기존 회원 잠금·계정당 한 개 저장·해시 정책과 동일한 서비스를 사용한다.
                    refreshTokens.saveOrReplace(user, refresh);
                    return new LoginResponse(user, access, refresh);
                });
            } catch (DataIntegrityViolationException duplicate) {
                // 동시 최초 로그인은 unique 제약으로 하나만 생성한다. 롤백 후 새 트랜잭션에서 승자를 재조회한다.
                // 아이디·닉네임 충돌도 같은 범위에서 새 식별값으로 재시도하며 인가 코드는 다시 교환하지 않는다.
                if (attempt == 2) throw new ResponseStatusException(HttpStatus.CONFLICT, "소셜 회원 정보를 저장하지 못했습니다. 다시 로그인해 주세요.");
            }
        }
        throw new IllegalStateException("소셜 회원 처리 결과가 없습니다.");
    }

    private User createUser(AuthProvider provider, SocialUserInfo info) {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        String name = info.nickname() == null ? "" : info.nickname().replaceAll("[^가-힣A-Za-z0-9]", "");
        if (name.isBlank()) name = "소셜회원";
        String nickname = name.substring(0, Math.min(name.length(), 6)) + suffix.substring(0, 6);
        // loginId(20자)·nickname(12자)·passwordHash NOT NULL 제약을 일반 회원과 동일하게 지킨다.
        // 외부 이미지 URL은 Firebase 파일 식별자와 호환되지 않아 기존 기본 아바타를 유지한다.
        String prefix = provider.name().toLowerCase(java.util.Locale.ROOT);
        User user = User.social(provider, prefix + suffix.substring(0, 20 - prefix.length()), passwords.encode(UUID.randomUUID().toString()),
                nickname, info.email(), info.id());
        return users.saveAndFlush(user);
    }
}
