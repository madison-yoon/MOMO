package com.momo.backend;

import com.momo.backend.client.KobisApiClient;
import com.momo.backend.service.MoviePosterAsyncService;
import com.momo.backend.service.MoviePosterCacheService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MovieSearchHttpE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private KobisApiClient kobisApiClient;

    @MockitoBean
    private MoviePosterCacheService posterCacheService;

    @MockitoBean
    private MoviePosterAsyncService posterAsyncService;

    @Test
    void httpSearchPersistsResponseAndSecondRequestUsesDatabaseCache() throws Exception {
        String keyword = "http-e2e-" + UUID.randomUUID();
        String movieCode = UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        when(kobisApiClient.searchMovies(keyword, 1, 10)).thenReturn("""
                {"movieListResult":{"totCnt":1,"movieList":[{
                  "movieCd":"%s","movieNm":"HTTP 통합 테스트 영화","openDt":"20260101",
                  "genreAlt":"드라마","directors":[{"peopleNm":"통합 테스트 감독"}]
                }]}}
                """.formatted(movieCode));
        when(posterCacheService.tryMarkAsProcessing(movieCode)).thenReturn(false);

        mockMvc.perform(get("/api/movies/search")
                        .param("keyword", keyword)
                        .param("page", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].movieCode").value(movieCode))
                .andExpect(jsonPath("$.content[0].title").value("HTTP 통합 테스트 영화"))
                .andExpect(jsonPath("$.totalCount").value(1));

        mockMvc.perform(get("/api/movies/search")
                        .param("keyword", keyword)
                        .param("page", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].movieCode").value(movieCode));

        verify(kobisApiClient, times(1)).searchMovies(keyword, 1, 10);
    }
}
