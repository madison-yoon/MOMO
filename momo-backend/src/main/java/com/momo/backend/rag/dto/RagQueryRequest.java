package com.momo.backend.rag.dto;

import com.momo.backend.rag.enums.QueryScope;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 허용 리뷰 ID와 회원 ID는 서버에서만 결정한다. */
public record RagQueryRequest(
        @NotBlank(message = "질문을 입력해 주세요.")
        @Size(max = 500, message = "질문은 500자 이내로 입력해 주세요.") String question,
        @NotNull(message = "검색 범위는 ALL 또는 MINE이어야 합니다.") QueryScope scope) {
    public RagQueryRequest {
        if (question != null) question = question.strip();
    }
}
