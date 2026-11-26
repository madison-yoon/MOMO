package com.momo.backend.scheduler;

import com.momo.backend.entity.Movie;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.service.MovieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "momo.catalog.enrichment.enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class MovieMetadataEnrichmentScheduler {

    private final MovieRepository movieRepository;
    private final MovieService movieService;

    // 외부 API 호출량을 제한하기 위해 60초마다 한 편만 처리한다.
    @Scheduled(fixedDelayString = "${momo.catalog.enrichment.delay-ms:60000}")
    public void enrichMissingMovieDetails() {
        try (var trace = com.momo.backend.observability.ApiCallTrace.open(
                com.momo.backend.observability.ApiCallTrace.Source.SCHEDULER)) {
            List<Movie> movies = movieRepository.findMoviesNeedingMetadata(
                    LocalDateTime.now().minusHours(6),
                    PageRequest.of(0, 1)
            );

            for (Movie movie : movies) {
                // 예외적인 조회 결과도 상세 서비스로 넘기지 않고 다음 후보를 처리한다.
                if (movie == null || movie.getMovieCode() == null || movie.getMovieCode().isBlank()) {
                    log.warn("영화 상세정보 자동 보완 대상 제외: 영화 코드가 비어 있습니다.");
                    continue;
                }
                try {
                    movieService.getMovieDetail(movie.getMovieCode());
                } catch (Exception exception) {
                    log.warn("영화 상세정보 자동 보완 실패. movieCode={}",
                            movie.getMovieCode(), exception);
                }
            }
        }
    }
}
