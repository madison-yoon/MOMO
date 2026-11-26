package com.momo.backend.rag.event;

import com.momo.backend.rag.service.ReviewIndexService;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReviewIndexListenerTest {
    ReviewIndexService service = mock(ReviewIndexService.class);

    @Test void upsertIsQueuedAndDoesNotWaitForRemoteIndex() {
        java.util.List<Runnable> tasks = new java.util.ArrayList<>();
        var listener = new ReviewIndexListener(service, Runnable::run, tasks::add);
        listener.onIndex(new ReviewIndexEvent(1L, ReviewIndexEvent.Operation.UPSERT));
        verify(service, never()).index(anyLong());
        assertThat(tasks).hasSize(1);
        tasks.getFirst().run();
        verify(service).index(1L);
    }

    @Test void rejectedUpsertDefersConditionalStateWriteToExistingPurgeWorker() {
        java.util.List<Runnable> markers = new java.util.ArrayList<>();
        Executor rejected = command -> { throw new RejectedExecutionException(); };
        var snapshot = new com.momo.backend.rag.service.ReviewIndexTransactions.Snapshot(1L,"m","t","c",null);
        when(service.generation()).thenReturn(8L);
        new ReviewIndexListener(service, markers::add, rejected)
                .onIndex(new ReviewIndexEvent(1L, ReviewIndexEvent.Operation.UPSERT, snapshot));
        verify(service, never()).rejected(any(), anyLong());
        assertThat(markers).hasSize(1);
        markers.getFirst().run();
        verify(service).rejected(snapshot, 8L);
        verify(service, never()).index(anyLong());
    }

    @Test void highestBoundaryIsolatesReadLockWriteAndDeleteFailure() {
        ReviewIndexListener listener = new ReviewIndexListener(service, Runnable::run);
        when(service.index(1L)).thenThrow(new IllegalStateException("secret"));
        doThrow(new IllegalStateException("secret")).when(service).remove(1L);
        assertThatCode(() -> listener.onIndex(new ReviewIndexEvent(1L, ReviewIndexEvent.Operation.UPSERT))).doesNotThrowAnyException();
        assertThatCode(() -> listener.onIndex(new ReviewIndexEvent(1L, ReviewIndexEvent.Operation.DELETE))).doesNotThrowAnyException();
    }

    @Test void rejectedQueueDoesNotExecuteDeletesOnCaller() {
        Executor rejected = command -> { throw new RejectedExecutionException(); };
        assertThatCode(() -> new ReviewIndexListener(service, rejected).onPurge(new ReviewPurgeEvent(List.of(1L))))
                .doesNotThrowAnyException();
        verifyNoInteractions(service);
    }

    @Test void sequentialPurgeContinuesAfterIndividualFailure() {
        doThrow(new IllegalStateException()).when(service).remove(1L);
        new ReviewIndexListener(service, Runnable::run).onPurge(new ReviewPurgeEvent(List.of(1L, 2L)));
        var order = inOrder(service);
        order.verify(service).remove(1L);
        order.verify(service).remove(2L);
    }

    @Test void fatalJvmErrorsAreNotSwallowed() {
        when(service.index(1L)).thenThrow(new OutOfMemoryError());
        assertThatThrownBy(() -> new ReviewIndexListener(service, Runnable::run)
                .onIndex(new ReviewIndexEvent(1L, ReviewIndexEvent.Operation.UPSERT))).isInstanceOf(OutOfMemoryError.class);
    }
}
