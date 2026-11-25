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
