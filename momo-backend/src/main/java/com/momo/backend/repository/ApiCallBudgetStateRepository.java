package com.momo.backend.repository;

import com.momo.backend.entity.ApiCallBudgetState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface ApiCallBudgetStateRepository extends JpaRepository<ApiCallBudgetState, String> {

        /**
         * 날짜별 예산 행을 원자적으로 생성한다.
         * 기존 행은 카운터를 유지한 채 배타 잠금을 얻어 공유→배타 잠금 전환 경쟁을 피한다.
         * 최초 생성 경쟁도 같은 PK의 UPSERT로 처리하며 실제 증가는 아래 조건부 UPDATE만 수행한다.
         */
        @Modifying
        @Query(value = """
                        INSERT INTO api_call_budget
                            (id, provider, usage_date, prefetch_calls, demand_calls)
                        VALUES (:id, :provider, :usageDate, 0, 0)
                        ON DUPLICATE KEY UPDATE id = api_call_budget.id
                        """, nativeQuery = true)
        int insertIfAbsent(
                        @Param("id") String id,
                        @Param("provider") String provider,
                        @Param("usageDate") LocalDate usageDate);

        /**
         * 단일 조건부 UPDATE로 카운터를 원자적으로 증가시킨다.
         * maxCalls는 예약 한도이며 Long.MAX_VALUE는 사실상 무제한 집계다.
         */
        @Modifying
        @Query(value = """
                        UPDATE api_call_budget
                           SET prefetch_calls = prefetch_calls + 1
                         WHERE id = :id AND prefetch_calls < :maxCalls
                        """, nativeQuery = true)
        int incrementPrefetchIfAvailable(@Param("id") String id, @Param("maxCalls") long maxCalls);

        @Modifying
        @Query(value = """
                        UPDATE api_call_budget
                           SET demand_calls = demand_calls + 1
                         WHERE id = :id AND demand_calls < :maxCalls
                        """, nativeQuery = true)
        int incrementDemandIfAvailable(@Param("id") String id, @Param("maxCalls") long maxCalls);
}
