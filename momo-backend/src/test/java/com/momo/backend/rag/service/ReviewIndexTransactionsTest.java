package com.momo.backend.rag.service;

import com.momo.backend.entity.Review;
import com.momo.backend.rag.enums.IndexStatus;
import com.momo.backend.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ReviewIndexTransactionsTest {
    private final ReviewRepository repository = mock(ReviewRepository.class);
    private final ReviewIndexTransactions transactions = new ReviewIndexTransactions(repository);

    // MySQL collation과 무관하게 대소문자와 후행 공백 차이를 검출한다.
    @Test
    void sameTimestampButChangedOriginalCannotBecomeReady() {
        Review review = review("Title", "body ");
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(review));
        var sent = new ReviewIndexTransactions.Snapshot(1L, "movie", "title", "body", review.getUpdatedAt());
        assertThat(transactions.recordResult(sent, IndexStatus.READY, null)).isFalse();
        verify(repository, never()).writeIndexResult(any(), any(), any(), any());
    }

    @Test
    void matchingOriginalUsesBulkUpdateWithoutChangingUpdatedAt() {
        Review review = review("Title", "body");
        var snapshot = ReviewIndexTransactions.Snapshot.from(review);
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(review));
        when(repository.writeIndexResult(eq(1L), eq(IndexStatus.READY), isNull(), any())).thenReturn(1);
        assertThat(transactions.recordResult(snapshot, IndexStatus.READY, null)).isTrue();
        assertThat(review.getUpdatedAt()).isEqualTo(snapshot.updatedAt());
        assertThat(review.getIndexStatus()).isEqualTo(IndexStatus.INDEXING);
    }

    @Test
    void deletedOriginalCannotBeOverwritten() {
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.empty());
        assertThat(transactions.recordResult(new ReviewIndexTransactions.Snapshot(1L, "m", "t", "c", LocalDateTime.now()),
                IndexStatus.FAILED, "SAFE")).isFalse();
        verify(repository, never()).writeIndexResult(any(), any(), any(), any());
    }

    @Test
    void manualRecoveryOfIndexingDoesNotDependOnMysqlChangedRowCount() {
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(review("Title", "body")));
        when(repository.resetIndexState(1L)).thenReturn(0);
        assertThat(transactions.beginManual(1L)).isTrue();
    }

    private Review review(String title, String content) {
        Review review = new Review(null, "movie", title, content);
        ReflectionTestUtils.setField(review, "reviewId", 1L);
        ReflectionTestUtils.setField(review, "updatedAt", LocalDateTime.of(2026, 1, 1, 0, 0));
        return review;
    }
}
