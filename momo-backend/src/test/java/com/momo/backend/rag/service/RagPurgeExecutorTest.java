package com.momo.backend.rag.service;

import org.junit.jupiter.api.Test;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;

class RagPurgeExecutorTest {
    @Test void saturatedDedicatedQueueRejectsWithoutRunningOnCallingThread() throws Exception {
        var executor = new RagPurgeExecutorConfig().ragPurgeExecutor(1);
        executor.initialize();
        CountDownLatch entered = new CountDownLatch(1), release = new CountDownLatch(1);
        try {
            executor.execute(() -> {
                entered.countDown();
                try { release.await(2, TimeUnit.SECONDS); }
                catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); }
            });
            assertThat(entered.await(1, TimeUnit.SECONDS)).isTrue();
            executor.execute(() -> { });
            assertThatThrownBy(() -> executor.execute(() -> fail("호출자에서 실행되면 안 된다")))
                    .isInstanceOf(RejectedExecutionException.class);
            assertThat(executor.getMaxPoolSize()).isEqualTo(1);
        } finally { release.countDown(); executor.shutdown(); }
    }
}
