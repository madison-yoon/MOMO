package com.momo.backend.rag.dto;
import java.util.List;
/** FastAPI의 snake_case 응답 계약. 작성자 개인정보는 포함하지 않는다. */
public record RagAnswer(String answer, boolean abstained, List<Source> sources, List<String> trace) {
    public record Source(Long review_id, String title, String snippet, double score, String fingerprint) {
        public Source(Long review_id, String title, String snippet, double score) { this(review_id, title, snippet, score, null); }
    }
    public static RagAnswer hold() { return new RagAnswer("리뷰 근거를 확인하지 못했습니다. 잠시 후 다시 질문해 주세요.", true, List.of(), List.of()); }
}
