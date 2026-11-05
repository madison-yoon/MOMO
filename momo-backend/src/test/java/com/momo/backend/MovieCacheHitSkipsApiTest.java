package com.momo.backend;

import com.momo.backend.client.KobisApiClient;
import com.momo.backend.repository.MovieCacheRepository;
import com.momo.backend.service.MovieService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verifyNoInteractions;

@SpringBootTest
@ActiveProfiles("test")
class MovieCacheHitSkipsApiTest {

    @Autowired
    private MovieService movieService;

    @Autowired
    private MovieCacheRepository movieCacheRepository;

    @MockitoBean
    private KobisApiClient kobisApiClient;

    @Test
    @Transactional
    void validSearchBoxOfficeAndGenreCachesSkipKobisRequests() {
        LocalDateTime now = LocalDateTime.now();

        movieCacheRepository.upsert("SEARCH", "cache-hit-test|1|10",
                "{\"content\":[],\"page\":1,\"size\":10,\"totalCount\":0,\"hasNext\":false}",
                now, now.plusHours(24));
        movieCacheRepository.upsert("DAILY_BOX_OFFICE", "20260101", "[]",
                now, now.plusHours(1));
        movieCacheRepository.upsert("GENRE", "드라마", "[]",
                now, now.plusHours(24));

        assertTrue(movieService.searchMovies("cache-hit-test", 1, 10).content().isEmpty());
        assertTrue(movieService.getDailyBoxOffice("20260101").isEmpty());
        assertTrue(movieService.getMoviesByGenre("드라마", 1).isEmpty());

        verifyNoInteractions(kobisApiClient);
    }
}
