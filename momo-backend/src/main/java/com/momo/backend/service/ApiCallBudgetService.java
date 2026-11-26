package com.momo.backend.service;

import com.momo.backend.entity.ApiCallBudgetState;
import com.momo.backend.repository.ApiCallBudgetStateRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.sql.SQLException;

/**
 * 공급처별 일일 호출 예산을 DB에 기록한다.
 * 사전 수집 90%, 사용자 검색 10%를 서로 침범하지 않는 예약 예산으로 운용한다.
 * daily-limit 값은 공급처의 공식 한도가 아니라 운영자가 설정하는 MOMO 자체 예산이다.
 */
@Service
@Slf4j
public class ApiCallBudgetService {

    private static final ZoneId KOREA_ZONE = ZoneId.of("Asia/Seoul");
    private static final double PREFETCH_RATIO = 0.90;

    private final ApiCallBudgetStateRepository repository;
    private final TransactionTemplate reservationTransaction;
    private static final int MAX_ATTEMPTS = 3;

    /** 내부 메서드의 프록시 호출에 의존하지 않고 각 예약을 독립 트랜잭션으로 실행한다. */
    public ApiCallBudgetService(ApiCallBudgetStateRepository repository, PlatformTransactionManager transactions) {
        this.repository = repository;
        this.reservationTransaction = new TransactionTemplate(transactions);
        this.reservationTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.reservationTransaction.setTimeout(5);
    }

    // 0 means the provider's daily quota is unknown or is not a fixed daily quota.
    // Do not invent a local daily cap in that case.
    @Value("${momo.api-budget.kobis.daily-limit:0}")
    private long kobisDailyLimit;

    @Value("${momo.api-budget.kmdb.daily-limit:0}")
    private long kmdbDailyLimit;

    @Value("${momo.api-budget.tmdb.daily-limit:0}")
    private long tmdbDailyLimit;

    public void acquire(String provider, TrafficType trafficType) {
        String normalizedProvider = provider.toUpperCase(Locale.ROOT);
        long dailyLimit = dailyLimitFor(normalizedProvider);
        LocalDate today = LocalDate.now(KOREA_ZONE);
        String budgetId = normalizedProvider + "_" + today;

        // 90:10 예약 한도. 공급처 한도가 설정되지 않으면 호출량만 집계한다.
        long maxCalls = Long.MAX_VALUE;
        if (dailyLimit > 0) {
            long prefetchLimit = (long) Math.floor(dailyLimit * PREFETCH_RATIO);
            maxCalls = trafficType == TrafficType.PREFETCH
                    ? prefetchLimit : dailyLimit - prefetchLimit;
        }

        final long limit = maxCalls;
        for (int attempt = 1; ; attempt++) {
            boolean[] workFinished = {false};
            try {
                reservationTransaction.executeWithoutResult(status -> {
                    reserve(budgetId, normalizedProvider, today, trafficType, limit);
                    workFinished[0] = true;
                });
                // 커밋 완료 후 반환하므로 호출자는 그 뒤에만 외부 HTTP를 실행한다.
                return;
            } catch (RuntimeException failure) {
                // 커밋 결과 불명·롤백 실패는 재시도하지 않아 중복 차감을 피한다.
                if (workFinished[0] || failure instanceof TransactionSystemException
                        || attempt >= MAX_ATTEMPTS || !isRetryableLock(failure)) {
                    throw failure;
                }
                log.warn("API 예산 잠금 충돌 재시도. provider={}, attempt={}/{}",
                        normalizedProvider, attempt, MAX_ATTEMPTS);
                pauseBeforeRetry(attempt);
            }
        }
    }

    /** 이 메서드에는 DB 작업만 둔다. 예외가 나면 템플릿의 롤백이 끝난 뒤 재시도한다. */
    private void reserve(String budgetId, String provider, LocalDate date, TrafficType trafficType, long maxCalls) {
        repository.insertIfAbsent(budgetId, provider, date);
        // 단일 조건부 UPDATE의 원자적 한도 검사·증가 정책은 유지한다.
        int updated = trafficType == TrafficType.PREFETCH
                ? repository.incrementPrefetchIfAvailable(budgetId, maxCalls)
                : repository.incrementDemandIfAvailable(budgetId, maxCalls);

        if (updated != 1) {
            String message = trafficType == TrafficType.PREFETCH
                    ? "사전 수집 예산(90%)을 모두 사용했습니다."
                    : "사용자 검색 예산(10%)을 모두 사용했습니다.";
            throw new ApiBudgetExceededException(provider, message);
        }
    }

    private boolean isRetryableLock(Throwable failure) {
        for (Throwable cause = failure; cause != null; cause = cause.getCause()) {
            if (cause instanceof SQLException sql) {
                if (sql.getErrorCode() == 1213 && "40001".equals(sql.getSQLState())) return true;
                // MySQL JDBC 드라이버가 1205를 40001로 변환하는 경우도 실제 잠금 시간 초과다.
                if (sql.getErrorCode() == 1205
                        && ("HY000".equals(sql.getSQLState()) || "41000".equals(sql.getSQLState())
                            || "40001".equals(sql.getSQLState()))) return true;
            }
        }
        return false;
    }

    private void pauseBeforeRetry(int attempt) {
        try {
            // 총 3회 시도, 대기는 25ms·50ms로 제한한다. HTTP는 재시도 범위에 포함하지 않는다.
            Thread.sleep(25L * attempt);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("API 예산 잠금 재시도 대기 중 중단되었습니다.", interrupted);
        }
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, BudgetSnapshot> getTodayStatus() {
        LocalDate today = LocalDate.now(KOREA_ZONE);
        java.util.Map<String, BudgetSnapshot> result = new java.util.LinkedHashMap<>();
        for (String provider : java.util.List.of("KOBIS", "KMDB", "TMDB")) {
            long limit = dailyLimitFor(provider);
            ApiCallBudgetState state = repository.findById(provider + "_" + today)
                    .orElseGet(() -> ApiCallBudgetState.create(provider, today));
            long prefetchLimit = limit > 0
                    ? (long) Math.floor(limit * PREFETCH_RATIO) : 0;
            long demandLimit = limit > 0 ? limit - prefetchLimit : 0;
            result.put(provider, new BudgetSnapshot(
                    limit,
                    prefetchLimit,
                    demandLimit,
                    state.getPrefetchCalls(),
                    state.getDemandCalls(),
                    limit > 0
            ));
        }
        return java.util.Map.copyOf(result);
    }

    public record BudgetSnapshot(
            long dailyLimit,
            long prefetchLimit,
            long userSearchLimit,
            long prefetchUsed,
            long userSearchUsed,
            boolean dailyLimitConfigured
    ) {}

    private long dailyLimitFor(String provider) {
        long limit = switch (provider) {
            case "KOBIS" -> kobisDailyLimit;
            case "KMDB" -> kmdbDailyLimit;
            case "TMDB" -> tmdbDailyLimit;
            default -> throw new IllegalArgumentException("지원하지 않는 API 공급처: " + provider);
        };
        if (limit < 0) {
            throw new IllegalStateException(provider + " 일일 API 예산은 0 또는 양수여야 합니다.");
        }
        return limit;
    }

    public enum TrafficType {
        PREFETCH,
        USER_SEARCH
    }

    public static class ApiBudgetExceededException extends RuntimeException {
        public ApiBudgetExceededException(String provider, String message) {
            super(provider + " API 호출 제한: " + message);
        }
    }
}
