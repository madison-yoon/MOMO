package com.momo.backend.rag.service;

import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;

/** 단일 프로세스의 원자적 진입 제한. 답변 보류나 실패도 질문 횟수로 계산한다. */
@Component
public class RagQueryBudget {
    private final Clock clock;
    private final Map<Long, ArrayDeque<Instant>> recent = new HashMap<>();
    private final Set<Long> active = new HashSet<>();
    private LocalDate day;
    private int daily;
    public RagQueryBudget() { this(Clock.systemUTC()); }
    RagQueryBudget(Clock clock) { this.clock = clock; }
    public synchronized Lease enter(Long userId) {
        Instant now = clock.instant();
        LocalDate today = now.atZone(ZoneId.of("Asia/Seoul")).toLocalDate();
        if (!today.equals(day)) { day=today; daily=0; }
        recent.entrySet().removeIf(entry -> {
            entry.getValue().removeIf(time -> !time.isAfter(now.minusSeconds(60)));
            return entry.getValue().isEmpty();
        });
        var times = recent.computeIfAbsent(userId, ignored -> new ArrayDeque<>());
        if (active.contains(userId) || times.size() >= 5 || daily >= 100)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "AI 질문 이용 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.");
        times.addLast(now); daily++; active.add(userId);
        return new Lease(userId);
    }
    public final class Lease implements AutoCloseable {
        private final Long userId;
        private Lease(Long userId) { this.userId=userId; }
        @Override public void close() { synchronized (RagQueryBudget.this) { active.remove(userId); } }
    }
}
