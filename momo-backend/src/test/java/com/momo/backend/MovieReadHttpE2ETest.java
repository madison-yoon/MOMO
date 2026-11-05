package com.momo.backend;

import com.momo.backend.client.KobisApiClient;
import com.momo.backend.entity.Movie;
import com.momo.backend.repository.MovieCacheRepository;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.service.KmdbService;
import com.momo.backend.service.MoviePosterCacheService;
import com.momo.backend.service.TmdbService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MovieReadHttpE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MovieCacheRepository movieCacheRepository;

    @Autowired
    private MovieRepository movieRepository;

    @MockitoBean
    private KobisApiClient kobisApiClient;

    @MockitoBean
    private KmdbService kmdbService;

    @MockitoBean
    private TmdbService tmdbService;

    @MockitoBean
    private MoviePosterCacheService posterCacheService;

    @Test
    void cachedBoxOfficeAndGenreAndDatabaseDetailAreServedOverHttpWithoutExternalCalls() throws Exception {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String movieCode = suffix;
        LocalDateTime now = LocalDateTime.now();

        movieCacheRepository.upsert("DAILY_BOX_OFFICE", "20260101", "[]",
                now, now.plusHours(1));
        movieCacheRepository.upsert("GENRE", "드라마",
                """
                [{"movieCode":"%s","title":"HTTP 장르 캐시 영화",
                  "releaseDate":"20260101","genre":"드라마","director":"테스트 감독"}]
                """.formatted(movieCode),
                now, now.plusHours(24));
        movieRepository.saveAndFlush(new Movie(movieCode, "HTTP 상세 DB 영화", "HTTP Detail",
                "20260101", "100", "드라마", "DB 감독", "DB 배우", "12세이상관람가"));

        when(posterCacheService.tryMarkAsProcessing(movieCode)).thenReturn(false);

        mockMvc.perform(get("/api/boxoffice/daily").param("targetDate", "20260101"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));

        mockMvc.perform(get("/api/movies/genre")
                        .param("genre", "드라마").param("page", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].movieCode").value(movieCode))
                .andExpect(jsonPath("$[0].title").value("HTTP 장르 캐시 영화"));

        mockMvc.perform(get("/api/movies/{movieCode}", movieCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.movieCode").value(movieCode))
                .andExpect(jsonPath("$.title").value("HTTP 상세 DB 영화"));

        verifyNoInteractions(kobisApiClient, kmdbService, tmdbService);
    }
}
