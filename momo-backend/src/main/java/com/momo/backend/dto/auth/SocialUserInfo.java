package com.momo.backend.dto.auth;
// 외부 토큰은 보관하지 않고 검증을 마친 공급자 식별정보만 회원 서비스에 전달한다.
public record SocialUserInfo(String id, String nickname, String email) {}
