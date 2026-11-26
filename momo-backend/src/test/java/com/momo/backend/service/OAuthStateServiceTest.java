package com.momo.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.concurrent.atomic.AtomicLong;
import static org.junit.jupiter.api.Assertions.*;

// 실제 브라우저나 외부 인증 없이 state의 수명·브라우저 바인딩·재사용 차단을 확인한다.
class OAuthStateServiceTest {
    @Test void issuedStateRequiresMatchingCookieAndCanOnlyBeConsumedOnce() {
        OAuthStateService states = new OAuthStateService();
        String state = states.issue();
        assertEquals(43, state.length());
        assertThrows(ResponseStatusException.class, () -> states.consume(state, "different-browser"));
        states.consume(state, state);
        assertThrows(ResponseStatusException.class, () -> states.consume(state, state));
    }

    @Test void expiredAndUnissuedStateAreRejected() {
        AtomicLong nanos = new AtomicLong();
        OAuthStateService states = new OAuthStateService(nanos::get);
        String state = states.issue();
        nanos.set(java.time.Duration.ofMinutes(6).toNanos());
        assertThrows(ResponseStatusException.class, () -> states.consume(state, state));
        assertThrows(ResponseStatusException.class, () -> states.consume("not-issued", "not-issued"));
        assertThrows(ResponseStatusException.class, () -> states.consume(null, null));
    }
}
