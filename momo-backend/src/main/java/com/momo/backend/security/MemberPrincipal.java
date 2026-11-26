package com.momo.backend.security;

import com.momo.backend.exception.CustomException;
import java.security.Principal;
import org.springframework.security.core.Authentication;

/** 재사용 가능한 로그인 아이디와 구분되는 회원 PK 기반 인증 식별자다. */
public record MemberPrincipal(Long userId) implements Principal {
    public MemberPrincipal {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid member ID");
        }
    }

    @Override
    public String getName() {
        return userId.toString();
    }

    public static Long optionalUserId(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof MemberPrincipal member
                ? member.userId() : null;
    }

    public static Long requireUserId(Authentication authentication) {
        Long userId = optionalUserId(authentication);
        if (userId == null) {
            throw new CustomException("UNAUTHORIZED", "로그인이 필요합니다.");
        }
        return userId;
    }
}
