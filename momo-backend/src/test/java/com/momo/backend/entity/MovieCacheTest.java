package com.momo.backend.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class MovieCacheTest {
    @Test
    void cacheExpiresAtBoundary() {
        MovieCache cache = new MovieCache("SEARCH", "test", "{}", 1);
        LocalDateTime createdAt = cache.getCachedAt();
        assertTrue(cache.isValid(createdAt));
        assertFalse(cache.isValid(cache.getExpiresAt()));
    }
}
