package com.momo.backend.entity;

// 이메일이 같아도 일반 회원과 카카오 회원을 서로 다른 인증 계정으로 구분한다.
public enum AuthProvider {
    LOCAL, KAKAO, NAVER, GOOGLE
}
