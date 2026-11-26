package com.momo.backend.rag.service;

import com.momo.backend.rag.client.RagClient;
import com.momo.backend.rag.event.ReviewIndexEvent;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReviewIndexOutboxWorkerTest {
    RagClient client = mock(RagClient.class);
    ReviewIndexService indexing = mock(ReviewIndexService.class);
    ReviewIndexOutboxStore store = mock(ReviewIndexOutboxStore.class);

    ReviewIndexOutboxWorker worker() {
        return new ReviewIndexOutboxWorker(client, indexing, store, 100, 1000, 30);
    }

    ReviewIndexOutboxStore.ClaimedEvent event(ReviewIndexEvent.Operation operation, int attempts) {
        return new ReviewIndexOutboxStore.ClaimedEvent(1L, 900L, operation, attempts, "claim-token");
    }

    @Test
    void disabledRagDoesNotClaimOrConsumeOutboxRows() {
        when(client.isEnabled()).thenReturn(false);
        assertThat(worker().processNext()).isFalse();
        verifyNoInteractions(store, indexing);
    }

    @Test
    void successfulUpsertCompletesTheClaim() {
        var event = event(ReviewIndexEvent.Operation.UPSERT, 1);
        when(client.isEnabled()).thenReturn(true);
        when(store.claimNext()).thenReturn(Optional.of(event));
        when(indexing.indexQueued(900L)).thenReturn(ReviewIndexService.Outcome.READY);
        when(store.complete(event)).thenReturn(true);

        assertThat(worker().processNext()).isTrue();
        verify(store).complete(event);
        verify(store, never()).retry(any(), anyLong(), anyString());
    }

    @Test
    void missingOrSupersededReviewIsAnIdempotentSkippedUpsert() {
        var event = event(ReviewIndexEvent.Operation.UPSERT, 1);
        when(client.isEnabled()).thenReturn(true);
        when(store.claimNext()).thenReturn(Optional.of(event));
        when(indexing.indexQueued(900L)).thenReturn(ReviewIndexService.Outcome.SKIPPED);

        worker().processNext();
        verify(store).complete(event);
    }

    @Test
    void failedUpsertIsRetriedWithCappedExponentialBackoff() {
        var event = event(ReviewIndexEvent.Operation.UPSERT, 5);
        when(client.isEnabled()).thenReturn(true);
        when(store.claimNext()).thenReturn(Optional.of(event));
        when(indexing.indexQueued(900L)).thenReturn(ReviewIndexService.Outcome.FAILED);

        worker().processNext();
        verify(store).retry(event, 1000L, "INDEX_FAILED");
        verify(store, never()).complete(event);
    }

    @Test
    void deleteUsesTheSameDurableQueueAndCompletesIdempotently() {
        var event = event(ReviewIndexEvent.Operation.DELETE, 1);
        when(client.isEnabled()).thenReturn(true);
        when(store.claimNext()).thenReturn(Optional.of(event));

        worker().processNext();
        verify(indexing).remove(900L);
        verify(store).complete(event);
    }

    @Test
    void unexpectedFailureRetriesWithoutPersistingExceptionMessage() {
        var event = event(ReviewIndexEvent.Operation.DELETE, 1);
        when(client.isEnabled()).thenReturn(true);
        when(store.claimNext()).thenReturn(Optional.of(event));
        doThrow(new IllegalStateException("private JWT body")).when(indexing).remove(900L);

        worker().processNext();
        verify(store).retry(event, 100L, "OUTBOX_IllegalStateException");
    }
}
