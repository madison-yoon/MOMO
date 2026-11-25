package com.momo.backend.rag.service;

import org.junit.jupiter.api.Test;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;

class ReviewLocksTest {
    @Test
    void stripeWaitIsBoundedAndLockIsReleased() throws Exception {
        ReviewLocks locks = new ReviewLocks(20);
        try (var held = locks.acquire(1L); var executor = Executors.newSingleThreadExecutor()) {
            assertThat(executor.submit(() -> {
                try (var ignored = locks.acquire(1L)) { return false; }
                catch (ReviewLocks.LockUnavailableException expected) { return true; }
            }).get(1, TimeUnit.SECONDS)).isTrue();
        }
        try (var ignored = locks.acquire(1L)) { assertThat(ignored).isNotNull(); }
    }

    @Test
    void invalidationDiscardsResultsFromPreviousGeneration() {
        ReviewLocks locks = new ReviewLocks(20);
        long before = locks.generation();
        locks.invalidate(() -> { });
        assertThat(locks.record(before, () -> true)).isFalse();
        assertThat(locks.record(locks.generation(), () -> true)).isTrue();
    }

    @Test
    void failedInvalidationDoesNotAdvanceGeneration() {
        ReviewLocks locks = new ReviewLocks(20);
        long before = locks.generation();
        assertThatThrownBy(() -> locks.invalidate(() -> { throw new IllegalStateException(); }))
                .isInstanceOf(IllegalStateException.class);
        assertThat(locks.generation()).isEqualTo(before);
    }
}
