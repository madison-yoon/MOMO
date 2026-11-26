package com.momo.backend.service;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.momo.backend.client.KobisApiClient;
import com.momo.backend.entity.Movie;
import com.momo.backend.repository.*;
import com.momo.backend.controller.MovieController;
import com.momo.backend.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.*;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MovieGenreRequestTest {
    private MovieRepository movies;
    private KobisApiClient kobis;
    private KmdbService kmdb;
    private TmdbService tmdb;
    private MoviePosterAsyncService poster;
    private MoviePosterCacheService posters;
    private MoviePersistenceService persistence;
    private MovieService service;

    @BeforeEach void setup() {
        movies = mock(MovieRepository.class);
        kobis = mock(KobisApiClient.class);
        kmdb = mock(KmdbService.class);
        tmdb = mock(TmdbService.class);
        poster = mock(MoviePosterAsyncService.class);
        posters = mock(MoviePosterCacheService.class);
        persistence = mock(MoviePersistenceService.class);
        service = new MovieService(poster, kobis, kmdb, tmdb, new ObjectMapper(), movies,
                mock(MovieCacheRepository.class), posters, persistence, mock(MoviePosterCacheRepository.class),
                mock(MovieExternalIdMappingRepository.class), mock(PosterFileStorageService.class),
                Caffeine.newBuilder().maximumSize(20).build());
        when(movies.findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(anyString(), any()))
                .thenReturn(Page.empty());
    }

    @Test void repeatedEmptyGenresNeverCollectMoviesOrPosters() {
        for (int i = 0; i < 5; i++) assertTrue(service.getMoviesByGenre("드라마", 1).isEmpty());
        assertTrue(service.getMoviesByGenre("드라마", 2).isEmpty());
        verifyNoInteractions(kobis, kmdb, tmdb, persistence, poster, posters);
    }

    @Test void aliasesAndCaseAreNormalizedBeforeDatabaseLookup() {
        service.getMoviesByGenre(" 로맨스 ", 1);
        service.getMoviesByGenre("공포", 1);
        service.getMoviesByGenre("sf", 1);
        verify(movies).findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(eq("멜로/로맨스"), any());
        verify(movies).findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(eq("공포(호러)"), any());
        verify(movies).findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(eq("SF"), any());
        verifyNoInteractions(kobis);
    }

    @Test void futureStoredGenreIsAcceptedButUnknownGenreIsRejected() {
        when(movies.existsByGenreToken("새장르")).thenReturn(true);
        assertTrue(service.getMoviesByGenre("새장르", 1).isEmpty());
        assertThrows(IllegalArgumentException.class, () -> service.getMoviesByGenre("없는장르", 1));
        verifyNoInteractions(kobis, persistence);
    }

    @Test void malformedGenresAndPagesAreRejectedWithoutCatalogAccess() {
        for (String value : List.of("", " ", "%", "_", "드라마,액션", "x".repeat(51))) {
            assertThrows(IllegalArgumentException.class, () -> service.getMoviesByGenre(value, 1));
        }
        assertThrows(IllegalArgumentException.class, () -> service.getMoviesByGenre(null, 1));
        assertThrows(IllegalArgumentException.class, () -> service.getMoviesByGenre("드라마", 0));
        verifyNoInteractions(kobis, persistence);
    }

    @Test void allPagesUseSameDatabaseQueryAndTenItemPageSize() {
        Movie movie = new Movie("20260001", "movie", "", "20200101", "", "드라마", "director", "", "");
        movie.updatePosterUrl("/posters/already-present.jpg");
        when(movies.findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(eq("드라마"), any()))
                .thenReturn(new PageImpl<>(List.of(movie)));
        when(movies.findAllById(any())).thenReturn(List.of(movie));
        assertEquals("director", service.getMoviesByGenre("드라마", 1).getFirst().director());
        assertEquals("20260001", service.getMoviesByGenre("드라마", 2).getFirst().movieCode());
        ArgumentCaptor<Pageable> pages = ArgumentCaptor.forClass(Pageable.class);
        verify(movies, times(2)).findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(eq("드라마"), pages.capture());
        assertEquals(List.of(0, 1), pages.getAllValues().stream().map(Pageable::getPageNumber).toList());
        assertTrue(pages.getAllValues().stream().allMatch(p -> p.getPageSize() == 10));
        verifyNoInteractions(kobis, kmdb, tmdb, persistence, poster, posters);
    }

    @Test void missingPostersStillUseExistingClaimedPosterWork() {
        Movie movie = new Movie("20260001", "movie", "", "20200101", "", "드라마", "", "", "");
        when(movies.findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(eq("드라마"), any()))
                .thenReturn(new PageImpl<>(List.of(movie)));
        when(movies.findAllById(any())).thenReturn(List.of(movie));
        when(posters.tryMarkAsProcessing("20260001")).thenReturn("test-claim");
        service.getMoviesByGenre("드라마", 1);
        verify(posters).createCache("20260001", "movie", "20200101", 200);
        verify(poster).searchPosterAsync("20260001", "movie", "20200101", "test-claim");
        verifyNoInteractions(kobis, kmdb, tmdb, persistence);
    }

    @Test void recommendationEmptyCandidatesAllowExistingFallbackWithoutGenreLookup() {
        when(movies.findByBoxOfficeEnteredTrueAndGenreContainingIgnoreCaseOrderByBestBoxOfficeRankAscLastBoxOfficeDateDesc("드라마"))
                .thenReturn(List.of());
        when(movies.findByBoxOfficeEnteredTrueOrderByBestBoxOfficeRankAscLastBoxOfficeDateDesc()).thenReturn(List.of());
        assertTrue(service.getBoxOfficeRecommendations("드라마").isEmpty());
        assertTrue(service.getBoxOfficeRecommendations(null).isEmpty());
        assertTrue(service.getBoxOfficeRecommendations(" ").isEmpty());
        verify(movies, never()).findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(anyString(), any());
        verifyNoInteractions(kobis, kmdb, tmdb, persistence, poster);
    }

    @Test void targetRequestSummariesReportZeroCatalogAttempts() throws Exception {
        var logger = (ch.qos.logback.classic.Logger) org.slf4j.LoggerFactory.getLogger(com.momo.backend.observability.ApiRequestTraceFilter.class);
        var logs = new ch.qos.logback.core.read.ListAppender<ch.qos.logback.classic.spi.ILoggingEvent>();
        logs.start(); logger.addAppender(logs);
        try {
            var mvc = MockMvcBuilders.standaloneSetup(new MovieController(mock(ReviewService.class), service,
                    mock(PersonService.class), tmdb)).addFilters(new com.momo.backend.observability.ApiRequestTraceFilter()).build();
            mvc.perform(get("/api/movies/genre").param("genre", "드라마")).andExpect(status().isOk());
            mvc.perform(get("/api/movies/recommendations").param("genre", "드라마")).andExpect(status().isOk());
            assertEquals(2, logs.list.size());
            assertTrue(logs.list.stream().allMatch(log -> log.getFormattedMessage().contains("catalogHttpAttempts=0")));
            verifyNoInteractions(kobis, kmdb, tmdb, persistence);
        } finally { logger.detachAppender(logs); logs.stop(); }
    }

    @Test void restContractKeepsArraysAndRejectsUnsupportedOrMissingGenre() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new MovieController(mock(ReviewService.class), service,
                mock(PersonService.class), tmdb)).setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new com.momo.backend.observability.ApiRequestTraceFilter()).build();
        mvc.perform(get("/api/movies/genre").param("genre", "드라마")).andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/api/movies/genre").param("genre", "없는장르")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/movies/genre")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/movies/genre").param("genre", " ")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/movies/genre").param("genre", "드라마").param("page", "0")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/movies/recommendations").param("genre", "없는장르")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/movies/recommendations")).andExpect(status().isOk()).andExpect(content().json("[]"));
        verifyNoInteractions(kobis, kmdb, tmdb, persistence);
    }

    @Test void defaultGenrePolicyCoversMoreThanTheHomeButtonsWithoutDiscoveryQueries() {
        for (String genre : MovieGenrePolicy.SUPPORTED_GENRES) {
            assertTrue(service.getMoviesByGenre(genre, 1).isEmpty());
        }
        verify(movies, never()).existsByGenreToken(anyString());
        verifyNoInteractions(kobis, kmdb, tmdb, persistence);
    }

    @Test void genreRecommendationUsesExistingCandidatesWithoutStartingCollection() {
        Movie eligible = new Movie("20260001", "eligible", "", "20200101", "", "드라마", "", "", "");
        eligible.markBoxOfficeEntered(2, "20200102");
        when(movies.findByBoxOfficeEnteredTrueAndGenreContainingIgnoreCaseOrderByBestBoxOfficeRankAscLastBoxOfficeDateDesc("드라마"))
                .thenReturn(List.of(eligible));
        when(movies.findById("20260001")).thenReturn(Optional.of(eligible));
        assertEquals("20260001", service.getBoxOfficeRecommendations("드라마").getFirst().get("movieCode"));
        verify(movies, never()).findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(anyString(), any());
        verifyNoInteractions(kobis, kmdb, tmdb, persistence, poster);
    }

    @Test void catalogBatchStillCollectsOnePagePerTickAndPersistsGenreMetadata() {
        var stateRepo = mock(MovieCatalogSyncStateRepository.class);
        var state = com.momo.backend.entity.MovieCatalogSyncState.initial();
        var batchMovies = mock(MovieService.class);
        when(stateRepo.findByIdForUpdate(1)).thenReturn(Optional.of(state));
        when(kobis.searchCatalogMovies(1, 100, null, null)).thenReturn(
                "{\"movieListResult\":{\"totCnt\":101,\"movieList\":[{\"movieCd\":\"20260001\",\"movieNm\":\"first\",\"genreAlt\":\"드라마,새장르\"}]}}");
        when(kobis.searchCatalogMovies(2, 100, null, null)).thenReturn(
                "{\"movieListResult\":{\"totCnt\":101,\"movieList\":[{\"movieCd\":\"20260002\",\"movieNm\":\"second\",\"genreAlt\":\"SF\"}]}}");
        var batch = new MovieCatalogSyncService(kobis, new ObjectMapper(), persistence, batchMovies, stateRepo);
        org.springframework.test.util.ReflectionTestUtils.setField(batch, "enabled", true);
        batch.syncNextPage();
        assertEquals(2, state.getNextPage());
        verify(kobis, times(1)).searchCatalogMovies(anyInt(), eq(100), isNull(), isNull());
        batch.syncNextPage();
        assertEquals("IDLE", state.getPhase());
        verify(kobis, times(2)).searchCatalogMovies(anyInt(), eq(100), isNull(), isNull());
        verify(persistence).saveSearchMovies(argThat(rows -> rows.size() == 1 && rows.getFirst().genre().equals("드라마,새장르")));
        verify(persistence).saveSearchMovies(argThat(rows -> rows.size() == 1 && rows.getFirst().genre().equals("SF")));
        verify(batchMovies, times(2)).enqueueCatalogPosterSearches(anyList());
    }
}
