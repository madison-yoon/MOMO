package com.momo.backend;

import com.momo.backend.entity.MovieCache;
import com.momo.backend.entity.MoviePosterCache;
import com.momo.backend.entity.Movie;
import com.momo.backend.entity.PosterStatus;
import com.momo.backend.repository.MovieCacheRepository;
import com.momo.backend.repository.MoviePosterCacheRepository;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.service.MoviePosterPersistenceService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ApiCacheRepositoryIntegrationTest {

    @Autowired
    private MovieCacheRepository movieCacheRepository;

    @Autowired
    private MoviePosterCacheRepository moviePosterCacheRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private MoviePosterPersistenceService posterPersistenceService;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Test
    @Transactional
    void genericCacheUpsertUpdatesExistingUniqueKey() {
        String key = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        movieCacheRepository.upsert("TEST", key, "{\"version\":1}", now,
                now.plusHours(1));
        movieCacheRepository.upsert("TEST", key, "{\"version\":2}", now.plusMinutes(1),
                now.plusHours(2));

        entityManager.flush();
        entityManager.clear();

        MovieCache saved = movieCacheRepository.findByCacheTypeAndCacheKey("TEST", key)
                .orElseThrow();
        assertEquals("{\"version\":2}", saved.getContentJson());
        assertTrue(saved.getExpiresAt().isAfter(now.plusHours(1)));
    }

    @Test
    @Transactional
    void expiredGenericCachesAreDeletedWithoutDeletingActiveRows() {
        String expiredKey = UUID.randomUUID().toString();
        String activeKey = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        movieCacheRepository.upsert("TEST", expiredKey, "{}", now.minusHours(3),
                now.minusHours(2));
        movieCacheRepository.upsert("TEST", activeKey, "{}", now,
                now.plusHours(1));

        int deleted = movieCacheRepository.deleteExpired(now);

        assertEquals(1, deleted);
        assertTrue(movieCacheRepository.findByCacheTypeAndCacheKey("TEST", expiredKey).isEmpty());
        assertTrue(movieCacheRepository.findByCacheTypeAndCacheKey("TEST", activeKey).isPresent());
    }

    @Test
    @Transactional
    void posterClaimIsAtomicAndHonorsRetryWindows() {
        String code = UUID.randomUUID().toString().substring(0, 20);
        LocalDateTime now = LocalDateTime.now();

        moviePosterCacheRepository.insertIfAbsent(code, "test", "20260101", now);
        assertEquals(1, moviePosterCacheRepository.tryClaim(code, now,
                now.minusHours(24), now.minusMinutes(10)));
        assertEquals(0, moviePosterCacheRepository.tryClaim(code, now.plusMinutes(1),
                now.minusHours(24).plusMinutes(1), now.minusMinutes(9)));

        entityManager.flush();
        entityManager.clear();
        MoviePosterCache processing = moviePosterCacheRepository.findById(code).orElseThrow();
        processing.markAsFailed();
        moviePosterCacheRepository.saveAndFlush(processing);

        LocalDateTime beforeRetry = now.plusHours(23);
        assertEquals(0, moviePosterCacheRepository.tryClaim(code, beforeRetry,
                beforeRetry.minusHours(24), beforeRetry.minusMinutes(10)));

        LocalDateTime afterRetry = now.plusHours(25);
        assertEquals(1, moviePosterCacheRepository.tryClaim(code, afterRetry,
                afterRetry.minusHours(24), afterRetry.minusMinutes(10)));
    }

    @Test
    @Transactional
    void staleProcessingClaimCanBeRecoveredAfterTenMinutes() {
        String code = UUID.randomUUID().toString().substring(0, 20);
        LocalDateTime now = LocalDateTime.now();

        moviePosterCacheRepository.insertIfAbsent(code, "test", "20260101", now);
        assertEquals(1, moviePosterCacheRepository.tryClaim(code, now,
                now.minusHours(24), now.minusMinutes(10)));

        LocalDateTime nineMinutesLater = now.plusMinutes(9);
        assertEquals(0, moviePosterCacheRepository.tryClaim(code, nineMinutesLater,
                nineMinutesLater.minusHours(24), nineMinutesLater.minusMinutes(10)));

        LocalDateTime elevenMinutesLater = now.plusMinutes(11);
        assertEquals(1, moviePosterCacheRepository.tryClaim(code, elevenMinutesLater,
                elevenMinutesLater.minusHours(24), elevenMinutesLater.minusMinutes(10)));
    }

    @Test
    void posterAndMovieUpdatesRollbackTogetherWhenTransactionFails() {
        String code = UUID.randomUUID().toString().substring(0, 20);
        movieRepository.saveAndFlush(new Movie(code, "rollback-test", "", "20260101",
                "", "드라마", "감독", "배우", "전체관람가"));
        moviePosterCacheRepository.saveAndFlush(new MoviePosterCache(code,
                "rollback-test", "20260101"));

        assertThrows(IllegalStateException.class, () ->
                transactionTemplate.executeWithoutResult(status -> {
                    posterPersistenceService.saveSuccess(code, "https://example.com/poster.jpg");
                    throw new IllegalStateException("force rollback");
                }));

        entityManager.clear();
        Movie savedMovie = movieRepository.findById(code).orElseThrow();
        MoviePosterCache savedCache = moviePosterCacheRepository.findById(code).orElseThrow();

        assertNull(savedMovie.getPosterUrl());
        assertNull(savedCache.getPosterUrl());
        assertEquals(PosterStatus.PENDING, savedCache.getStatus());
    }
}
