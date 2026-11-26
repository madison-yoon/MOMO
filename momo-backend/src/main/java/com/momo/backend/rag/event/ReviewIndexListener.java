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
    private final Executor indexExecutor;

    @org.springframework.beans.factory.annotation.Autowired
    public ReviewIndexListener(ReviewIndexService indexService,
            @Qualifier("ragPurgeExecutor") Executor purgeExecutor,
            @Qualifier("ragIndexExecutor") Executor indexExecutor) {
        this.indexService = indexService;
        this.purgeExecutor = purgeExecutor;
        this.indexExecutor = indexExecutor;
    }

    public ReviewIndexListener(ReviewIndexService indexService, Executor purgeExecutor) {
        this(indexService, purgeExecutor, Runnable::run);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onIndex(ReviewIndexEvent event) {
        try {
            switch (event.operation()) {
                case UPSERT -> submit(event);
                case DELETE -> indexService.remove(event.reviewId());
            }
        } catch (RuntimeException failure) {
            log.warn("RAG 커밋 후 처리 실패 reviewId={} operation={} type={}",
                    event.reviewId(), event.operation(), failure.getClass().getSimpleName());
        }
    }

    private void submit(ReviewIndexEvent event) {
        long generation = indexService.generation();
        try {
            indexExecutor.execute(() -> {
                try { indexService.index(event.reviewId()); }
                catch (RuntimeException failure) {
                    log.warn("RAG async index failed reviewId={} type={}", event.reviewId(), failure.getClass().getSimpleName());
                }
            });
        } catch (java.util.concurrent.RejectedExecutionException rejected) {
            // 기존 유한 삭제 작업 큐를 재사용하여 짧은 조건부 상태 갱신을 수행한다.
            try { purgeExecutor.execute(() -> indexService.rejected(event.snapshot(), generation)); }
            catch (RuntimeException saturated) {
                // 두 큐가 모두 포화되면 INDEXING을 유지하고 기존 수동 재색인으로 복구한다.
                log.warn("RAG rejection marker unavailable reviewId={} classification=INDEX_RECOVERY_REQUIRED", event.reviewId());
            }
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
