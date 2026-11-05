package com.momo.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoviePosterAsyncService {

    private final KmdbService kmdbService;
    private final MoviePosterCacheService posterCacheService;
    private final MoviePosterPersistenceService posterPersistenceService;

    /**
     * 이전 호출부와 테스트 코드의 호환을 유지한다.
     * 신규 호출부는 claimProcessing에서 받은 토큰을 직접 전달한다.
     */
    @Async("posterTaskExecutor")
    public void searchPosterAsync(String movieCode, String title, String releaseDate) {
        Optional<LocalDateTime> claim = posterCacheService.claimProcessing(movieCode);
        claim.ifPresent(claimedAt ->
                searchPosterAsync(movieCode, title, releaseDate, claimedAt));
    }

    @Async("posterTaskExecutor")
    public void searchPosterAsync(
            String movieCode,
            String title,
            String releaseDate,
            LocalDateTime claimedAt
    ) {
        if (claimedAt == null) {
            log.warn("포스터 검색 작업 선점 토큰이 없습니다. movieCode: {}", movieCode);
            return;
        }

        try {
            log.info("포스터 검색 시작: {}", movieCode);

            String posterUrl = kmdbService.findPosterUrl(
                    movieCode,
                    title,
                    releaseDate
            );

            if (posterUrl == null || posterUrl.isBlank()) {
                posterCacheService.markAsFailed(movieCode, claimedAt);
                log.warn("포스터 검색 결과 없음: {}", movieCode);
                return;
            }

            boolean saved = posterPersistenceService.saveSuccess(
                    movieCode,
                    posterUrl,
                    claimedAt
            );

            if (saved) {
                log.info("포스터 저장 성공: {}", movieCode);
            } else {
                log.info("만료된 포스터 작업 결과를 무시했습니다. movieCode: {}", movieCode);
            }

        } catch (Exception e) {
            posterCacheService.markAsFailed(movieCode, claimedAt);
            log.error("포스터 검색 실패: {}", movieCode, e);
        }
    }
}
