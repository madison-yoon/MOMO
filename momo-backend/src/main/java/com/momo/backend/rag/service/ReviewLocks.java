package com.momo.backend.rag.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.BooleanSupplier;

/** 고정 크기 stripe와 짧은 상태 세대 잠금을 분리하여 전체 재색인과 결과 기록을 조정한다. */
@Component
public class ReviewLocks {
    private final ReentrantLock[] stripes = new ReentrantLock[256];
    private final long waitMillis;
    private final Object stateMonitor = new Object();
    private long generation;

    public ReviewLocks(@Value("${rag.index.lock-wait-ms:2000}") long waitMillis) {
        if (waitMillis < 1) throw new IllegalArgumentException("Lock wait must be positive");
        this.waitMillis = waitMillis;
        for (int i = 0; i < stripes.length; i++) stripes[i] = new ReentrantLock();
    }

    public Lease acquire(Long reviewId) {
        ReentrantLock lock = stripes[Math.floorMod(Long.hashCode(reviewId), stripes.length)];
        try {
            if (!lock.tryLock(waitMillis, TimeUnit.MILLISECONDS)) throw new LockUnavailableException();
            return new Lease(lock);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new LockUnavailableException();
        }
    }

    public long generation() { synchronized (stateMonitor) { return generation; } }

    public boolean record(long expected, BooleanSupplier write) {
        synchronized (stateMonitor) { return generation == expected && write.getAsBoolean(); }
    }

    public void invalidate(Runnable databaseInvalidation) {
        synchronized (stateMonitor) {
            // Stripe를 잡지 않으므로 stripe를 보유한 결과 기록과 순환 대기하지 않는다.
            databaseInvalidation.run();
            generation++;
        }
    }

    public static final class Lease implements AutoCloseable {
        private final ReentrantLock lock;
        private Lease(ReentrantLock lock) { this.lock = lock; }
        @Override public void close() { lock.unlock(); }
    }

    public static final class LockUnavailableException extends RuntimeException { }
}
