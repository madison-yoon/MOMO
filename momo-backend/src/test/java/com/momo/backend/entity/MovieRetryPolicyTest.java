package com.momo.backend.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class MovieRetryPolicyTest {
    @Test
    void kobisAndSupplementRetryWindowsAreIndependent() {
        Movie movie = new Movie("123", "title", "", "", "", "", "", "", "");
        LocalDateTime now = LocalDateTime.now();
        assertTrue(movie.canAttemptKobisDetail(now));
        assertTrue(movie.canAttemptSupplement(now));
        movie.markKobisDetailAttempted(now);
        assertFalse(movie.canAttemptKobisDetail(now.plusHours(23)));
        assertTrue(movie.canAttemptSupplement(now.plusHours(23)));
        movie.markSupplementAttempted(now);
        assertFalse(movie.canAttemptSupplement(now.plusHours(23)));
        assertTrue(movie.canAttemptKobisDetail(now.plusHours(25)));
    }
}
