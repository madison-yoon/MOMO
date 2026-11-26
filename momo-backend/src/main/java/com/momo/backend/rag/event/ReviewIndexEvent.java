package com.momo.backend.rag.event;

import com.momo.backend.rag.service.ReviewIndexTransactions.Snapshot;

// 스냅샷은 조건부 거절 처리에만 사용한다. 정상 작업은 실행 시 최신 커밋 원본을 다시 조회한다.
public record ReviewIndexEvent(Long reviewId, Operation operation, Snapshot snapshot) {
    public ReviewIndexEvent(Long reviewId, Operation operation) { this(reviewId, operation, null); }
    public enum Operation { UPSERT, DELETE }
}
