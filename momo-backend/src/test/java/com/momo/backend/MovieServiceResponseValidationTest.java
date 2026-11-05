package com.momo.backend;

import com.momo.backend.client.KobisApiClient;
import com.momo.backend.entity.Movie;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.service.KmdbService;
import com.momo.backend.service.MovieService;
import com.momo.backend.service.TmdbService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.util.Optional;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class MovieServiceResponseValidationTest {

    @Autowired
    private MovieService movieService;

    @Autowired
    private MovieRepository movieRepository;

    @MockitoBean
    private KobisApiClient kobisApiClient;

    @MockitoBean
    private KmdbService kmdbService;

    @MockitoBean
    private TmdbService tmdbService;

    @Test
    void acceptsDetailForRequestedMovieCode() {
        String json = """
                {"movieInfoResult":{"movieInfo":{
                  "movieCd":"20260001","movieNm":"테스트 영화",
                  "directors":[],"genres":[],"actors":[],"audits":[]
                }}}
                """;

        JsonNode detail = ReflectionTestUtils.invokeMethod(
                movieService, "readRequiredMovieDetail", json, "20260001");

        assertNotNull(detail);
        assertEquals("테스트 영화", detail.path("movieNm").asText());
    }

    @Test
    void rejectsDetailForDifferentMovieCode() {
        String json = """
                {"movieInfoResult":{"movieInfo":{
                  "movieCd":"20260002","movieNm":"다른 영화"
                }}}
                """;

        assertThrows(IllegalStateException.class, () ->
                ReflectionTestUtils.invokeMethod(
                        movieService, "readRequiredMovieDetail", json, "20260001"));
    }

    @Test
    void rejectsDetailWithoutRequiredTitle() {
        String json = """
                {"movieInfoResult":{"movieInfo":{"movieCd":"20260001"}}}
                """;

        assertThrows(IllegalStateException.class, () ->
                ReflectionTestUtils.invokeMethod(
                        movieService, "readRequiredMovieDetail", json, "20260001"));
    }

    @Test
    void rejectsMalformedOptionalArray() {
        String json = """
                {"movieInfoResult":{"movieInfo":{
                  "movieCd":"20260001","movieNm":"테스트 영화","genres":"드라마"
                }}}
                """;

        assertThrows(IllegalStateException.class, () ->
                ReflectionTestUtils.invokeMethod(
                        movieService, "readRequiredMovieDetail", json, "20260001"));
    }

    @Test
    void kobisDetailFailureStillRunsKmdbAndTmdbFallbacks() {
        String code = "fb" + (System.nanoTime() % 100000000000000L);
        Movie partialMovie = new Movie(code, "보완 테스트 영화", "", "", "",
                "", "", "", "");
        movieRepository.saveAndFlush(partialMovie);
        when(kobisApiClient.getMovieDetail(code))
                .thenThrow(new IllegalStateException("simulated KOBIS outage"));
        when(kmdbService.findMovieSupplement(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(tmdbService.findMovieSupplement(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());

        assertDoesNotThrow(() -> movieService.getMovieDetail(code));

        verify(kmdbService, times(1))
                .findMovieSupplement(anyString(), anyString(), anyString(), anyString());
        verify(tmdbService, times(1))
                .findMovieSupplement(anyString(), anyString(), anyString(), anyString());
    }
}
