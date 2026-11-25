package com.momo.backend.rag.service;

import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.enums.IndexStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReviewIndexServiceTest {
    RagClient client = mock(RagClient.class);
    ReviewIndexTransactions transactions = mock(ReviewIndexTransactions.class);
    ReindexAccessGuard guard = mock(ReindexAccessGuard.class);
    ReviewLocks locks = new ReviewLocks(100);
    ReviewIndexService service = new ReviewIndexService(client, transactions, locks, guard);
    ReviewIndexTransactions.Snapshot snapshot = new ReviewIndexTransactions.Snapshot(1L, "movie", "title", "body", LocalDateTime.now());

    @BeforeEach void setup() {
        when(client.isEnabled()).thenReturn(true);
        when(transactions.readLatest(1L)).thenReturn(Optional.of(snapshot));
        when(transactions.recordResult(eq(snapshot), any(), any())).thenReturn(true);
    }

    @Test void disabledSkipsWithoutFailureOrDatabaseWrite() {
        when(client.isEnabled()).thenReturn(false);
        assertThat(service.index(1L)).isEqualTo(ReviewIndexService.Outcome.SKIPPED);
        verifyNoInteractions(transactions);
        verify(client, never()).index(any());
    }

    @Test void successRecordsReady() {
        assertThat(service.index(1L)).isEqualTo(ReviewIndexService.Outcome.READY);
        verify(transactions).recordResult(snapshot, IndexStatus.READY, null);
    }

    @Test void failureRecordsOnlySafeClassification() {
        when(client.index(any())).thenThrow(new IllegalStateException("secret JWT body password"));
        assertThat(service.index(1L)).isEqualTo(ReviewIndexService.Outcome.FAILED);
        verify(transactions).recordResult(snapshot, IndexStatus.FAILED, "INDEX_IllegalStateException");
    }

    @Test void resultWriteFailureIsIsolatedAndLeaseReleased() {
        when(transactions.recordResult(eq(snapshot), any(), any())).thenThrow(new IllegalStateException("secret"));
        assertThat(service.index(1L)).isEqualTo(ReviewIndexService.Outcome.FAILED);
        try (var lease = locks.acquire(1L)) { assertThat(lease).isNotNull(); }
    }

    @Test void deletionBeforeSnapshotSkipsHttp() {
        when(transactions.readLatest(1L)).thenReturn(Optional.empty());
        assertThat(service.index(1L)).isEqualTo(ReviewIndexService.Outcome.SKIPPED);
        verify(client, never()).index(any());
    }

    @Test void manualResetsStateBeforeFreshRead() {
        when(transactions.beginManual(1L)).thenReturn(true);
        service.reindex(1L, 10L);
        var order = inOrder(guard, transactions, client);
        order.verify(guard).check(10L);
        order.verify(transactions).beginManual(1L);
        order.verify(transactions).readLatest(1L);
        order.verify(client).index(any());
    }

    @Test void missingManualReviewReturns404() {
        assertThatThrownBy(() -> service.reindex(4L, 10L)).isInstanceOfSatisfying(ResponseStatusException.class,
                error -> assertThat(error.getStatusCode().value()).isEqualTo(404));
        verify(client, never()).index(any());
    }

    @Test void fullReindexIncludesAllIdsAndContinuesAfterFailure() {
        when(transactions.allIds()).thenReturn(List.of(1L, 2L, 3L));
        when(transactions.beginManual(anyLong())).thenReturn(true);
        when(transactions.readLatest(2L)).thenThrow(new IllegalStateException());
        when(transactions.readLatest(3L)).thenReturn(Optional.empty());
        var result = service.reindexAll(10L);
        assertThat(result).isEqualTo(new ReviewIndexService.ReindexSummary(3, 1, 1, 1));
        verify(transactions).invalidateReady();
    }

    @Test void invalidationFailureStopsWorkAndReleasesFullGuard() {
        doThrow(new IllegalStateException()).doNothing().when(transactions).invalidateReady();
        when(transactions.allIds()).thenReturn(List.of());
        assertThatThrownBy(() -> service.reindexAll(10L)).isInstanceOf(IllegalStateException.class);
        verify(transactions, never()).allIds();
        assertThat(service.reindexAll(10L).total()).isZero();
    }

    @Test void concurrentFullReindexIsRejectedAndPriorGenerationCannotWrite() throws Exception {
        CountDownLatch entered = new CountDownLatch(1), release = new CountDownLatch(1);
        when(transactions.allIds()).thenAnswer(invocation -> {
            entered.countDown();
            if (!release.await(2, TimeUnit.SECONDS)) throw new IllegalStateException();
            return List.of();
        });
        try (var executor = Executors.newSingleThreadExecutor()) {
            Future<?> running = executor.submit(() -> service.reindexAll(10L));
            assertThat(entered.await(1, TimeUnit.SECONDS)).isTrue();
            try {
                assertThatThrownBy(() -> service.reindexAll(10L)).isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode().value()).isEqualTo(409));
            } finally { release.countDown(); }
            running.get(2, TimeUnit.SECONDS);
        }
    }

    @Test void inFlightIndexResultBeforeFullInvalidationIsDiscarded() {
        when(client.index(any())).thenAnswer(invocation -> { locks.invalidate(transactions::invalidateReady); return 1; });
        assertThat(service.index(1L)).isEqualTo(ReviewIndexService.Outcome.SKIPPED);
        verify(transactions, never()).recordResult(any(), any(), any());
    }

    @Test void concurrentInvalidationAndIndexResultFinishWithoutCircularLockWait() throws Exception {
        CountDownLatch httpEntered = new CountDownLatch(1), invalidated = new CountDownLatch(1);
        when(client.index(any())).thenAnswer(invocation -> {
            httpEntered.countDown();
            assertThat(invalidated.await(1, TimeUnit.SECONDS)).isTrue();
            return 1;
        });
        doAnswer(invocation -> { invalidated.countDown(); return null; }).when(transactions).invalidateReady();
        when(transactions.allIds()).thenReturn(List.of());
        try (var executor = Executors.newFixedThreadPool(2)) {
            Future<ReviewIndexService.Outcome> indexing = executor.submit(() -> service.index(1L));
            assertThat(httpEntered.await(1, TimeUnit.SECONDS)).isTrue();
            Future<?> rebuilding = executor.submit(() -> service.reindexAll(10L));
            rebuilding.get(2, TimeUnit.SECONDS);
            assertThat(indexing.get(2, TimeUnit.SECONDS)).isEqualTo(ReviewIndexService.Outcome.SKIPPED);
        }
    }
}
