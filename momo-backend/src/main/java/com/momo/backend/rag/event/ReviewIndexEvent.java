package com.momo.backend.rag.event;

// 엔티티를 전달하지 않고 커밋 후 최신 원본을 다시 읽는다.
public record ReviewIndexEvent(Long reviewId, Operation operation) {
    public enum Operation { UPSERT, DELETE }
}
