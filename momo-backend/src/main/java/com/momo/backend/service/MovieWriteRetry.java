package com.momo.backend.service;

import org.springframework.dao.OptimisticLockingFailureException;
import java.util.function.Supplier;

/** 프록시를 거친 REQUIRES_NEW writer를 호출해 실패한 트랜잭션 종료 후 재시도한다. */
public final class MovieWriteRetry {
    private MovieWriteRetry() {}
    public static <T> T execute(Supplier<T> write) {
        return execute(write, 3);
    }
    public static <T> T execute(Supplier<T> write, int limit) {
        if (limit < 1 || limit > 3) throw new IllegalArgumentException("Movie write attempt limit must be 1..3");
        for (int attempt = 1; ; attempt++) {
            try { return write.get(); }
            catch (OptimisticLockingFailureException conflict) {
                if (attempt == limit) throw conflict;
            }
        }
    }

    static boolean isDuplicateInsert(Throwable failure) {
        for (Throwable cause = failure; cause != null; cause = cause.getCause()) {
            if (cause instanceof java.sql.SQLException sql && (sql.getErrorCode() == 1062 || sql.getErrorCode() == 23505)) return true;
        }
        return failure instanceof org.springframework.dao.DuplicateKeyException;
    }
}
