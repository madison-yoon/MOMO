package com.momo.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupRequest {

    // 회원이 가입할 때 사용할 로그인 아이디
    @NotBlank
    @Size(min = 4, max = 20)
    private String loginId;

    // 회원가입 시 입력한 비밀번호 (암호화 전)
    @NotBlank(message = "비밀번호는 필수 입력 항목입니다.")
    @Size(min = 8, max = 20, message = "비밀번호는 8~20자로 입력해 주세요.")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$",
            message = "비밀번호는 영문, 숫자, 특수문자를 각각 1개 이상 포함한 8~20자여야 합니다."
    )
    private String password;

    // 화면에서 사용할 닉네임
    @NotBlank
    @Size(min = 2, max = 12)
    @Pattern(
            regexp = "^[가-힣a-zA-Z0-9]{2,12}$",
            message = "닉네임은 한글, 영문, 숫자로 2~12자 입력해 주세요."
    )
    private String nickname;

    // 필수 입력 이메일 (이메일 형식 검사)
    @NotBlank(message = "이메일은 필수 입력 항목입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Pattern(
            regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$",
            message = "올바른 이메일 형식이 아닙니다."
    )
    private String email;
}