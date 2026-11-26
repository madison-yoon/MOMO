package com.momo.backend.rag.event;

import com.momo.backend.rag.service.ReviewIndexService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import java.util.concurrent.Executor;

/** 커밋 후 조회·잠금·HTTP·상태 기록·작업 등록 예외를 일반 CRUD 응답에서 격리한다. */
@Component
@Slf4j
public class ReviewIndexListener {
    private final ReviewIndexService indexService;
    private final Executor purgeExecutor;

    public ReviewIndexListener(ReviewIndexService indexService,
            @Qualifier("ragPurgeExecutor") Executor purgeExecutor) {
        this.indexService = indexService;
        this.purgeExecutor = purgeExecutor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onIndex(ReviewIndexEvent event) {
        try {
            switch (event.operation()) {
                case UPSERT -> indexService.index(event.reviewId());
                case DELETE -> indexService.remove(event.reviewId());
            }
        } catch (RuntimeException failure) {
            log.warn("RAG 커밋 후 처리 실패 reviewId={} operation={} type={}",
                    event.reviewId(), event.operation(), failure.getClass().getSimpleName());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPurge(ReviewPurgeEvent event) {
        if (event.reviewIds().isEmpty()) return;
        try {
            purgeExecutor.execute(() -> {
                for (Long id : event.reviewIds()) {
                    try { indexService.remove(id); }
                    catch (RuntimeException failure) {
                        log.warn("RAG 탈퇴 청크 삭제 실패 reviewId={} type={}", id, failure.getClass().getSimpleName());
                    }
                }
            });
        } catch (RuntimeException failure) {
            log.warn("RAG 탈퇴 청크 작업 등록 실패 count={} type={}", event.reviewIds().size(), failure.getClass().getSimpleName());
        }
    }
}
