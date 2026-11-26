package com.momo.backend.rag.service;

import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.client.RagClient.IndexRequest;
import com.momo.backend.rag.enums.IndexStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/** 오케스트레이션에는 DB 트랜잭션을 열지 않는다. 외부 호출은 분리된 DB 경계 사이에서 수행한다. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public class ReviewIndexService {
    private final RagClient client;
    private final ReviewIndexTransactions transactions;
    private final ReviewLocks locks;
    private final ReindexAccessGuard access;
    private final AtomicBoolean rebuilding = new AtomicBoolean();

    public long generation() { return locks.generation(); }

    // 원본 커밋 연결을 보유한 요청 스레드 대신 기존 삭제 작업 스레드에서 짧은 상태 갱신을 수행한다.
    public Outcome rejected(ReviewIndexTransactions.Snapshot snapshot, long generation) {
        if (snapshot == null || !client.isEnabled()) return Outcome.SKIPPED;
        try (var ignored = locks.acquire(snapshot.reviewId())) {
            // 먼저 승인된 작업의 성공 결과를 거절 표식이 덮어쓰지 않도록 같은 리뷰 잠금에서 비교한다.
            return record(generation, snapshot, IndexStatus.FAILED, "INDEX_QUEUE_REJECTED");
        } catch (ReviewLocks.LockUnavailableException failure) {
            log.warn("RAG 거절 상태 기록 잠금 대기 초과 reviewId={}", snapshot.reviewId());
            return Outcome.SKIPPED;
        }
    }

    public Outcome index(Long reviewId) {
        if (!client.isEnabled()) return Outcome.SKIPPED;
        try (var ignored = locks.acquire(reviewId)) { return indexLocked(reviewId); }
    }

    private Outcome indexLocked(Long reviewId) {
        if (!client.isEnabled()) return Outcome.SKIPPED;
        long generation = locks.generation();
        var latest = transactions.readLatest(reviewId);
        if (latest.isEmpty()) return Outcome.SKIPPED;
        var snapshot = latest.get();
        try {
            client.index(new IndexRequest(snapshot.reviewId(), snapshot.movieCode(), snapshot.title(), snapshot.content()));
        } catch (RuntimeException error) {
            String safeError = safeFailure(error);
            log.warn("RAG 색인 실패 reviewId={} classification={}", reviewId, safeError);
            record(generation, snapshot, IndexStatus.FAILED, safeError);
            return Outcome.FAILED;
        }
        return record(generation, snapshot, IndexStatus.READY, null);
    }

    private Outcome record(long generation, ReviewIndexTransactions.Snapshot snapshot, IndexStatus status, String error) {
        try {
            boolean written = locks.record(generation, () -> transactions.recordResult(snapshot, status, error));
            return written ? (status == IndexStatus.READY ? Outcome.READY : Outcome.FAILED) : Outcome.SKIPPED;
        } catch (RuntimeException failure) {
            // 예외 메시지·스택에는 원본/인증정보가 섞일 수 있어 클래스명만 남긴다.
            log.warn("RAG 상태 기록 실패 reviewId={} type={}", snapshot.reviewId(), failure.getClass().getSimpleName());
            return Outcome.FAILED;
        }
    }

    public void remove(Long reviewId) {
        if (!client.isEnabled()) return;
        try (var ignored = locks.acquire(reviewId)) { client.delete(reviewId); }
    }

    public String indexError(Long reviewId, Long operatorId) {
        access.check(operatorId);
        return transactions.indexError(reviewId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."));
    }

    public Outcome reindex(Long reviewId, Long operatorId) {
        access.check(operatorId);
        Outcome outcome;
        try (var ignored = locks.acquire(reviewId)) {
            if (!transactions.beginManual(reviewId))
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다.");
            outcome = indexLocked(reviewId);
        } catch (ReviewLocks.LockUnavailableException failure) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "리뷰 처리 대기 시간이 초과되었습니다.");
        }
        log.info("RAG 단건 재색인 operatorId={} reviewId={} result={}", operatorId, reviewId, outcome);
        return outcome;
    }

    public ReindexSummary reindexAll(Long operatorId) {
        access.check(operatorId);
        if (!rebuilding.compareAndSet(false, true))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "전체 재색인이 이미 진행 중입니다.");
        try {
            // 무효화 커밋과 세대 전환이 끝나기 전에 새 결과가 READY로 진입하지 못한다.
            locks.invalidate(transactions::invalidateReady);
            List<Long> ids = transactions.allIds();
            int success = 0, failed = 0, skipped = 0;
            for (Long id : ids) {
                try {
                    Outcome outcome;
                    try (var ignored = locks.acquire(id)) {
                        outcome = transactions.beginManual(id) ? indexLocked(id) : Outcome.SKIPPED;
                    }
                    switch (outcome) {
                        case READY -> success++;
                        case FAILED -> failed++;
                        case SKIPPED -> skipped++;
                    }
                } catch (ReviewLocks.LockUnavailableException failure) {
                    skipped++;
                    log.warn("RAG 전체 재색인 잠금 대기 초과 reviewId={}", id);
                } catch (RuntimeException failure) {
                    failed++;
                    log.warn("RAG 전체 재색인 개별 처리 실패 reviewId={} type={}", id, failure.getClass().getSimpleName());
                }
            }
            var result = new ReindexSummary(ids.size(), success, failed, skipped);
            log.info("RAG 전체 재색인 operatorId={} total={} success={} failed={} skipped={}",
                    operatorId, result.total(), result.success(), result.failed(), result.skipped());
            return result;
        } finally { rebuilding.set(false); }
    }

    private String safeFailure(RuntimeException failure) {
        return failure instanceof RestClientResponseException http
                ? "HTTP_" + http.getStatusCode().value() : "INDEX_" + failure.getClass().getSimpleName();
    }

    public enum Outcome { READY, FAILED, SKIPPED }
    public record ReindexSummary(int total, int success, int failed, int skipped) { }
}
