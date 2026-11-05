package com.momo.backend.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MoviePosterCacheTest {
    @Test
    void posterTransitionsPersistExpectedStatus() {
        MoviePosterCache cache = new MoviePosterCache("123", "title", "20260101");
        assertEquals(PosterStatus.PENDING, cache.getStatus());
        cache.markAsProcessing();
        assertEquals(PosterStatus.PROCESSING, cache.getStatus());
        cache.updatePoster("https://example.com/poster.jpg");
        assertEquals(PosterStatus.SUCCESS, cache.getStatus());
        assertEquals("https://example.com/poster.jpg", cache.getPosterUrl());
        cache.markAsFailed();
        assertEquals(PosterStatus.FAILED, cache.getStatus());
        assertNull(cache.getPosterUrl());
    }
}
