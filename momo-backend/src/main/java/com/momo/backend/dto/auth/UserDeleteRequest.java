package com.momo.backend.dto.auth;

/** DB 회원 유형에 따라 일반 비밀번호 또는 소셜 명시적 동의를 검증한다. */
public record UserDeleteRequest(String password, Boolean agreed, String confirmation) {
    @Override public String toString() { return "UserDeleteRequest[redacted]"; }
}
