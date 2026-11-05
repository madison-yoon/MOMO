package com.momo.backend;

import com.momo.backend.client.KobisApiClient;
import com.momo.backend.repository.MovieCacheRepository;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.service.MoviePosterAsyncService;
import com.momo.backend.service.MoviePosterCacheService;
import com.momo.backend.service.MovieService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class MovieServiceCacheFlowTest {

    @Autowired
    private MovieService movieService;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private MovieCacheRepository movieCacheRepository;

    @MockitoBean
    private KobisApiClient kobisApiClient;

    @MockitoBean
    private MoviePosterCacheService posterCacheService;

    @MockitoBean
    private MoviePosterAsyncService posterAsyncService;

    @Test
    void searchRequestPersistsMovieAndCachesValidatedResponse() {
        String keyword = "cache-flow-" + UUID.randomUUID();
        String movieCode = UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        String responseJson = """
                {"movieListResult":{"totCnt":1,"movieList":[{
                  "movieCd":"%s","movieNm":"캐시 흐름 테스트 영화","openDt":"20260101",
                  "genreAlt":"드라마","directors":[{"peopleNm":"테스트 감독"}]
                }]}}
                """.formatted(movieCode);
        when(kobisApiClient.searchMovies(keyword, 1, 10)).thenReturn(responseJson);
        when(posterCacheService.tryMarkAsProcessing(movieCode)).thenReturn(false);

        var response = movieService.searchMovies(keyword, 1, 10);

        assertEquals(1, response.content().size());
        assertEquals(movieCode, response.content().get(0).movieCode());
        assertTrue(movieRepository.findById(movieCode).isPresent());
        assertTrue(movieCacheRepository.findByCacheTypeAndCacheKey(
                "SEARCH", keyword + "|1|10").isPresent());
        verify(kobisApiClient, times(1)).searchMovies(keyword, 1, 10);
        verify(posterAsyncService, never()).searchPosterAsync(anyString(), anyString(), anyString());
    }

    @Test
    void malformedSearchResponseIsRejectedAndNotCached() {
        String keyword = "invalid-flow-" + UUID.randomUUID();
        when(kobisApiClient.searchMovies(keyword, 1, 10)).thenReturn("""
                {"movieListResult":{"totCnt":1,"movieList":[{"movieCd":"20260001"}]}}
                """);

        assertThrows(IllegalStateException.class,
                () -> movieService.searchMovies(keyword, 1, 10));

        assertTrue(movieCacheRepository.findByCacheTypeAndCacheKey(
                "SEARCH", keyword + "|1|10").isEmpty());
    }
}
