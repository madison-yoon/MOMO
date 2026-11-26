package com.momo.backend.rag.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class RagQueryBudgetTest {
    static class MutableClock extends Clock {
        Instant now = Instant.parse("2026-11-26T14:59:30Z");
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return now; }
    }
    @Test void onlyOneConcurrentQuestionAndLeaseReleaseAllowsNext() {
        var budget = new RagQueryBudget();
        try (var first = budget.enter(1L)) { limited(() -> budget.enter(1L)); }
        try (var next = budget.enter(1L)) { assertNotNull(next); }
    }
    @Test void minuteWindowExpiresWithoutResettingDailyBudget() {
        var clock = new MutableClock(); var budget = new RagQueryBudget(clock);
        for(int i=0;i<5;i++) try(var ignored=budget.enter(1L)) { }
        limited(() -> budget.enter(1L));
        clock.now=clock.now.plusSeconds(60);
        try(var next=budget.enter(1L)) { assertNotNull(next); }
    }
    @Test void hundredDailyQuestionsResetAtKoreanMidnight() {
        var clock = new MutableClock(); var budget = new RagQueryBudget(clock);
        for(long i=1;i<=100;i++) try(var ignored=budget.enter(i)) { }
        limited(() -> budget.enter(101L));
        clock.now=Instant.parse("2026-11-26T15:00:00Z");
        try(var next=budget.enter(101L)) { assertNotNull(next); }
    }
    @Test void simultaneousUsersCannotOverspendDailyAllowance() throws Exception {
        var budget=new RagQueryBudget(); var passed=new AtomicInteger();
        try(var executor=Executors.newFixedThreadPool(12)) {
            var work=new java.util.ArrayList<Future<?>>();
            for(long id=1;id<=130;id++) { long user=id; work.add(executor.submit(()->{
                try(var ignored=budget.enter(user)) { passed.incrementAndGet(); }
                catch(ResponseStatusException limit) { assertEquals(429,limit.getStatusCode().value()); }
            })); }
            for(var result:work) result.get(3,TimeUnit.SECONDS);
        }
        assertEquals(100,passed.get());
    }
    private void limited(Runnable action) { assertEquals(429,assertThrows(ResponseStatusException.class,action::run).getStatusCode().value()); }
}
