package com.momo.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// React 콜백이 받은 인가 코드와 시작 요청의 state를 함께 검증한다.
public record OAuthLoginRequest(
        @NotBlank @Size(max = 2048) String code,
        @NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{43}") String state) {
    @Override public String toString() { return "OAuthLoginRequest[redacted]"; }
}
