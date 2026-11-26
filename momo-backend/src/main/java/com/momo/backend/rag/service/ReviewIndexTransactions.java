package com.momo.backend.rag.service;

import com.momo.backend.entity.Review;
import com.momo.backend.rag.enums.IndexStatus;
import com.momo.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/** 별도 프록시 빈이 DB 경계를 소유하며 외부 HTTP는 이 빈에서 호출하지 않는다. */
@Service
@RequiredArgsConstructor
public class ReviewIndexTransactions {
    private final ReviewRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true, timeout = 5)
    public Optional<Snapshot> readLatest(Long reviewId) {
        return repository.findById(reviewId).map(Snapshot::from);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true, timeout = 5)
    public List<Long> allIds() { return repository.findAllReviewIds(); }

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
    public boolean beginManual(Long reviewId) {
        // 이미 INDEXING인 행은 JDBC의 변경 행 수 설정에 따라 UPDATE 결과가 0일 수 있다.
        // 존재 여부는 잠긴 원본으로 판별하여 고착된 INDEXING도 재색인할 수 있게 한다.
        if (repository.findByIdForUpdate(reviewId).isEmpty()) return false;
        repository.resetIndexState(reviewId);
        return true;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
    public void invalidateReady() { repository.invalidateReadyIndexes(); }

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
    public boolean recordResult(Snapshot sent, IndexStatus status, String error) {
        Optional<Review> current = repository.findByIdForUpdate(sent.reviewId());
        if (current.isEmpty() || current.get().getIndexStatus() != IndexStatus.INDEXING
                || !sent.matches(current.get())) return false;
        // 행 잠금 안에서 Java 문자열 동등성을 비교하여 DB collation의 공백/대소문자 문제를 피한다.
        String safeError = status == IndexStatus.FAILED && error != null
                ? error.substring(0, Math.min(500, error.length())) : null;
        return repository.writeIndexResult(sent.reviewId(), status, safeError,
                status == IndexStatus.READY ? LocalDateTime.now() : null) == 1;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true, timeout = 5)
    public Optional<String> indexError(Long reviewId) {
        return repository.findById(reviewId).map(review -> review.getIndexError() == null ? "" : review.getIndexError());
    }

    public record Snapshot(Long reviewId, String movieCode, String title, String content, LocalDateTime updatedAt) {
        public static Snapshot from(Review review) {
            return new Snapshot(review.getReviewId(), review.getMovieCode(), review.getTitle(), review.getContent(), review.getUpdatedAt());
        }
        boolean matches(Review review) {
            return Objects.equals(reviewId, review.getReviewId()) && Objects.equals(updatedAt, review.getUpdatedAt())
                    && Objects.equals(movieCode, review.getMovieCode()) && Objects.equals(title, review.getTitle())
                    && Objects.equals(content, review.getContent());
        }
    }
}
