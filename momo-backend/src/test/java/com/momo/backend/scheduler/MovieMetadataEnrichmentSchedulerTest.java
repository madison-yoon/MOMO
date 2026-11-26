package com.momo.backend.scheduler;

import com.momo.backend.entity.Movie;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.service.MovieService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** 잘못된 후보가 서비스 호출로 넘어가지 않고 정상 후보 처리가 계속되는지 검증한다. */
class MovieMetadataEnrichmentSchedulerTest {
    MovieRepository movies = mock(MovieRepository.class);
    MovieService service = mock(MovieService.class);
    MovieMetadataEnrichmentScheduler scheduler = new MovieMetadataEnrichmentScheduler(movies, service);

    @Test void rejectsNullAndBlankCodesWithoutCallingDetailService() {
        List<Movie> candidates = new ArrayList<>();
        for (String code : new String[]{null, "", " ", "\t\r\n", "\u3000"}) candidates.add(movie(code));
        candidates.add(null);
        candidates.add(movie("20260001"));
        when(movies.findMoviesNeedingMetadata(any(), any())).thenReturn(candidates);
        assertDoesNotThrow(scheduler::enrichMissingMovieDetails);
        verify(service).getMovieDetail("20260001");
        verifyNoMoreInteractions(service);
    }

    @Test void failureDoesNotPreventNextValidCandidate() {
        when(movies.findMoviesNeedingMetadata(any(), any())).thenReturn(List.of(movie("20260001"), movie("20260002")));
        when(service.getMovieDetail("20260001")).thenThrow(new IllegalStateException("외부 조회 실패"));
        assertDoesNotThrow(scheduler::enrichMissingMovieDetails);
        verify(service).getMovieDetail("20260002");
    }

    @Test void preservesSixHourRetryAndSingleCandidateBatch() {
        LocalDateTime before = LocalDateTime.now().minusHours(6);
        when(movies.findMoviesNeedingMetadata(any(), any())).thenReturn(List.of());
        scheduler.enrichMissingMovieDetails();
        LocalDateTime after = LocalDateTime.now().minusHours(6);
        var time = org.mockito.ArgumentCaptor.forClass(LocalDateTime.class);
        var page = org.mockito.ArgumentCaptor.forClass(Pageable.class);
        verify(movies).findMoviesNeedingMetadata(time.capture(), page.capture());
        assertFalse(time.getValue().isBefore(before));
        assertFalse(time.getValue().isAfter(after));
        assertEquals(0, page.getValue().getPageNumber());
        assertEquals(1, page.getValue().getPageSize());
        verifyNoInteractions(service);
    }

    private Movie movie(String code) {
        return new Movie(code, "검증 영화", "", "", "", "", "", "", "");
    }
}
