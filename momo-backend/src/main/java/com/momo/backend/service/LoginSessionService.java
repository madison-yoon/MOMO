package com.momo.backend.service;

import com.momo.backend.dto.auth.LoginResponse;
import com.momo.backend.entity.User;
import com.momo.backend.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 인증을 마친 일반·소셜 회원에게 동일한 MOMO 토큰 저장 정책을 적용한다. */
@Service
@RequiredArgsConstructor
public class LoginSessionService {
    private final TokenProvider tokens;
    private final RefreshTokenService refreshTokens;

    /** 소셜 최초 가입 트랜잭션에 참여하므로 회원 생성과 토큰 저장이 함께 커밋된다. */
    @Transactional
    public LoginResponse issue(User user) {
        String access = tokens.createToken(user.getUserId());
        String refresh = tokens.createRefreshToken(user.getUserId());
        refreshTokens.saveOrReplace(user, refresh);
        return new LoginResponse(user, access, refresh);
    }
}
