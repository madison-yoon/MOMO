package com.momo.backend.rag.event;

import java.util.List;

// 탈퇴 전 확보한 ID 목록이 발행 후 변경되지 않도록 복사한다.
public record ReviewPurgeEvent(List<Long> reviewIds) {
    public ReviewPurgeEvent { reviewIds = List.copyOf(reviewIds); }
}
