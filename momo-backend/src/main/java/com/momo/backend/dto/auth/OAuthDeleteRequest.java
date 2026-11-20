package com.momo.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** 탈퇴 Callback 입력이며 목적·대상 회원은 서버 state에서만 가져온다. */
public record OAuthDeleteRequest(@NotBlank @Size(max = 2048) String code,
        @NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{43}") String state, Boolean agreed, String confirmation) {
    @Override public String toString() { return "OAuthDeleteRequest[redacted]"; }
}
