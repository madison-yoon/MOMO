
package com.momo.backend.dto.review;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewCreateRequest {

    // 포스터 API와 동일한 영화 코드 형식을 검증한다.
    @NotBlank(message = "영화 코드는 필수입니다.")
    @Pattern(
            regexp = "^[A-Za-z0-9]{8}$",
            message = "영화 코드는 영문·숫자 8자리여야 합니다."
    )
    private String movieCode;

    // 리뷰 제목
    @NotBlank(message = "리뷰 제목은 필수입니다.")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
    private String title;

    // 리뷰 본문
    @NotBlank(message = "리뷰 내용은 필수입니다.")
    @Size(max = 2000, message = "리뷰 내용은 2000자 이하여야 합니다.")
    private String content;
}
