package com.momo.backend.rag.service;

import org.junit.jupiter.api.Test;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

class RagIndexExecutorTest {
    @Test void twoWorkersAndFiftyQueuedJobsRejectWithoutCallerExecution() throws Exception {
        var executor=new RagIndexExecutorConfig().ragIndexExecutor(); executor.initialize();
        var entered=new CountDownLatch(2); var release=new CountDownLatch(1);
        try {
            for(int i=0;i<2;i++) executor.execute(()->{
                entered.countDown(); try {release.await(3,TimeUnit.SECONDS);}
                catch(InterruptedException interrupted) {Thread.currentThread().interrupt();}
            });
            assertTrue(entered.await(1,TimeUnit.SECONDS));
            for(int i=0;i<50;i++) executor.execute(()->{});
            assertThrows(RejectedExecutionException.class,()->executor.execute(()->fail("요청 스레드에서 실행되면 안 됩니다.")));
        } finally {release.countDown();executor.shutdown();}
    }
}
