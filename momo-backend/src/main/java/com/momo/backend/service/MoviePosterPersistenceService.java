package com.momo.backend.service;

import com.momo.backend.repository.MoviePosterCacheRepository;
import com.momo.backend.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class MoviePosterPersistenceService {

    private final MoviePosterCacheRepository posterCacheRepository;
    private final MovieRepository movieRepository;

    /**
     * 현재 작업 선점 토큰이 유효한 경우에만 포스터 캐시와 영화 정보를 함께 갱신한다.
     * 이미 만료된 이전 비동기 작업은 새 작업의 결과를 덮어쓸 수 없다.
     */
    @Transactional
    public boolean saveSuccess(
            String movieCode,
            String posterUrl,
            LocalDateTime claimedAt
    ) {
        if (movieCode == null || movieCode.isBlank()
                || posterUrl == null || posterUrl.isBlank()
                || claimedAt == null) {
            return false;
        }

        LocalDateTime completedAt = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        int completed = posterCacheRepository.completeSuccess(
                movieCode,
                posterUrl,
                claimedAt,
                completedAt
        );

        if (completed != 1) {
            return false;
        }

        movieRepository.findById(movieCode)
                .ifPresent(movie -> movie.updatePosterUrl(posterUrl));

        return true;
    }
}
