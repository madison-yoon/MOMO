package com.momo.backend.dto.auth;

// 카카오에서 확인한 식별 정보만 내부 회원 생성 단계로 전달한다.
public record KakaoUserInfo(String id, String nickname, String email) {
}
