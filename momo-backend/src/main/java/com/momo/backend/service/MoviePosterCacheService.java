package com.momo.backend.service;

import com.momo.backend.dto.movie.MoviePosterStatusResponse;
import com.momo.backend.entity.MoviePosterCache;
import com.momo.backend.repository.MoviePosterCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MoviePosterCacheService {
    private final MoviePosterCacheRepository posterCacheRepository;
    private static final long FAILED_RETRY_HOURS = 24;
    private static final long PROCESSING_TIMEOUT_MINUTES = 10;

    public Optional<MoviePosterCache> findCache(String movieCode) {
        return posterCacheRepository.findById(movieCode);
    }

    @Transactional
    public MoviePosterCache createCache(String movieCode, String title, String releaseDate) {
        posterCacheRepository.insertIfAbsent(movieCode, title, releaseDate, LocalDateTime.now());
        return posterCacheRepository.findById(movieCode)
                .orElseThrow(() -> new IllegalStateException("포스터 캐시 생성 실패: " + movieCode));
    }

    @Transactional
    public Optional<LocalDateTime> claimProcessing(String movieCode) {
        // DB의 DATETIME 정밀도와 일치하도록 선점 토큰을 초 단위로 고정한다.
        LocalDateTime claimedAt = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        int claimed = posterCacheRepository.tryClaim(
                movieCode,
                claimedAt,
                claimedAt.minusHours(FAILED_RETRY_HOURS),
                claimedAt.minusMinutes(PROCESSING_TIMEOUT_MINUTES)
        );
        return claimed == 1 ? Optional.of(claimedAt) : Optional.empty();
    }

    // 기존 호출 호환용이다. 신규 비동기 작업은 claimProcessing의 토큰을 전달해야 한다.
    @Transactional
    public boolean tryMarkAsProcessing(String movieCode) {
        return claimProcessing(movieCode).isPresent();
    }

    @Transactional
    public boolean markAsFailed(String movieCode, LocalDateTime claimedAt) {
        if (claimedAt == null) {
            return false;
        }
        LocalDateTime failedAt = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        return posterCacheRepository.completeFailure(movieCode, claimedAt, failedAt) == 1;
    }

    public List<MoviePosterStatusResponse> findPosterStatuses(Collection<String> movieCodes) {
        if (movieCodes == null || movieCodes.isEmpty()) return List.of();
        return posterCacheRepository.findAllByMovieCodeIn(movieCodes).stream()
                .map(cache -> new MoviePosterStatusResponse(cache.getMovieCode(), cache.getStatus(),
                        cache.getPosterUrl() == null ? "" : cache.getPosterUrl())).toList();
    }

    public Optional<MoviePosterStatusResponse> findPosterStatus(String movieCode) {
        return posterCacheRepository.findById(movieCode)
                .map(cache -> new MoviePosterStatusResponse(cache.getMovieCode(), cache.getStatus(),
                        cache.getPosterUrl() == null ? "" : cache.getPosterUrl()));
    }
}
