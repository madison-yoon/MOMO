package com.momo.backend.service;

import com.momo.backend.entity.Movie;
import com.momo.backend.entity.PosterStatus;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.repository.MoviePosterCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import java.time.LocalDateTime;
import java.util.Objects;

/** DB 작업만 수행하는 짧은 경계이며 포스터 트랜잭션은 Movie→캐시 순서로 잠근다. */
@Service
@RequiredArgsConstructor
public class MoviePosterWriter {
    private final MovieRepository movies;
    private final MoviePosterCacheRepository caches;

    public static class Rejected extends RuntimeException {}

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void complete(String code, String claim, String path) {
        Movie movie = movies.findForPosterWrite(code).orElseThrow(Rejected::new);
        movie.updatePosterUrl(path);
        movies.flush();
        if (caches.completeClaim(code, claim, path, LocalDateTime.now()) != 1) throw new Rejected();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void restore(String code, String expectedMoviePath, String cachePath) {
        Movie movie = movies.findForPosterWrite(code).orElseThrow(Rejected::new);
        if (!Objects.equals(movie.getPosterUrl(), expectedMoviePath)) throw new Rejected();
        var cache = caches.findForPosterWrite(code).orElseThrow(Rejected::new);
        if (cache.getStatus() != PosterStatus.SUCCESS || !Objects.equals(cache.getPosterUrl(), cachePath))
            throw new Rejected();
        movie.updatePosterUrl(cachePath);
        movies.flush();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markMigration(String code, String expected, LocalDateTime now) {
        Movie movie = movies.findForPosterWrite(code).orElseThrow(Rejected::new);
        if (!Objects.equals(expected, movie.getPosterUrl())) throw new Rejected();
        movie.markPosterMigrationAttempted(now);
        movies.flush();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void migrate(String code, String expected, String localPath) {
        Movie movie = movies.findForPosterWrite(code).orElseThrow(Rejected::new);
        if (!Objects.equals(expected, movie.getPosterUrl())) throw new Rejected();
        movie.updatePosterUrl(localPath);
        movies.flush();
        caches.findForPosterWrite(code).ifPresent(cache -> {
            // 진행 중인 claim은 다른 작업 소유이므로 포스터 이전 중 빼앗지 않는다.
            if (cache.getStatus() == PosterStatus.PROCESSING) throw new Rejected();
            cache.updatePosterUrl(localPath);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public boolean isReferenced(String path) {
        return movies.existsByPosterUrl(path) || caches.existsByPosterUrl(path);
    }
}
