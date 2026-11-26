package com.momo.backend.service;

import com.github.benmanes.caffeine.cache.Caffeine;
import com.momo.backend.client.KobisApiClient;
import com.momo.backend.entity.MovieCache;
import com.momo.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.dao.*;
import tools.jackson.databind.ObjectMapper;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MovieWriteApiBoundaryTest {
    final KobisApiClient kobis=mock(KobisApiClient.class);
    final KmdbService kmdb=mock(KmdbService.class);
    final TmdbService tmdb=mock(TmdbService.class);
    final MovieRepository movies=mock(MovieRepository.class);
    final MovieCacheRepository caches=mock(MovieCacheRepository.class);
    final MoviePersistenceWriter writer=mock(MoviePersistenceWriter.class);
    final MovieService service=new MovieService(mock(MoviePosterAsyncService.class),kobis,kmdb,tmdb,
            new ObjectMapper(),movies,caches,mock(MoviePosterCacheService.class),new MoviePersistenceService(writer),
            mock(MoviePosterCacheRepository.class),mock(MovieExternalIdMappingRepository.class),
            mock(PosterFileStorageService.class),Caffeine.newBuilder().maximumSize(20).build());

    @Test void newDetailExternalResultIsReusedAcrossDatabaseRetries() {
        when(kobis.getMovieDetail("20991203")).thenReturn("""
            {"movieInfoResult":{"movieInfo":{"movieCd":"20991203","movieNm":"Movie","movieNmEn":"English",
            "openDt":"20260101","showTm":"100","genres":[{"genreNm":"Drama"}],
            "directors":[{"peopleNm":"Director"}],"actors":[{"peopleNm":"Actor"}],"audits":[{"watchGradeNm":"all"}]}}}
            """);
        when(writer.applyDetail(any(),eq(false)))
                .thenThrow(new OptimisticLockingFailureException("1"))
                .thenThrow(new OptimisticLockingFailureException("2"))
                .thenAnswer(inv -> { MovieDetailUpdate update=inv.getArgument(0); var movie=update.create(); update.apply(movie); return movie; });
        assertEquals("Movie",service.getMovieDetail("20991203").title());
        verify(writer,times(3)).applyDetail(any(),eq(false));
        verify(kobis).getMovieDetail("20991203");
        verifyNoMoreInteractions(kobis);
        verify(tmdb).findMovieOverview("Movie","20260101");
        verifyNoInteractions(kmdb);
    }

    void cache(String type) {
        when(caches.findByCacheTypeAndCacheKey(type,"20261114")).thenReturn(Optional.of(new MovieCache(type,"20261114","""
            [{"rank":1,"movieCode":"20991203","title":"Movie","releaseDate":"20260101","audienceCount":"1","totalAudience":"1","posterUrl":""}]
            """,24)));
    }

    @Test void cachedDailyDatabaseFailureDoesNotBecomeApiCacheMiss() {
        cache("DAILY_BOX_OFFICE");
        when(movies.findAllById(any())).thenThrow(new DataAccessResourceFailureException("DB unavailable"));
        assertThrows(DataAccessResourceFailureException.class,()->service.getDailyBoxOffice("20261114"));
        verifyNoInteractions(kobis,kmdb,tmdb);
    }

    @Test void cachedWeeklyExhaustionIsPerMovieFailureWithoutExternalRetry() {
        cache("WEEKLY_BOX_OFFICE");
        doThrow(new OptimisticLockingFailureException("conflict")).when(writer).applyBoxOffice(anyString(),anyInt(),anyString(),eq(false));
        assertEquals(1,service.getWeeklyBoxOffice("20261114").size());
        verify(writer,times(3)).applyBoxOffice("20991203",1,"20261114",false);
        verifyNoInteractions(kobis,kmdb,tmdb);
    }

    @Test void cachedSearchWriteConflictDoesNotTriggerKobisSearchAgain() {
        when(caches.findByCacheTypeAndCacheKey("SEARCH","Movie|1|20")).thenReturn(Optional.of(new MovieCache("SEARCH","Movie|1|20","""
            {"content":[{"movieCode":"20991203","title":"Movie","releaseDate":"20260101","genre":"Drama","director":"Director","posterUrl":""}],
            "page":1,"size":20,"totalCount":1,"hasNext":false}
            """,24)));
        doThrow(new OptimisticLockingFailureException("conflict")).when(writer).saveOrSupplement(any());
        assertThrows(OptimisticLockingFailureException.class,()->service.searchMovies("Movie",1,20));
        verify(writer,times(3)).saveOrSupplement(any());
        verifyNoInteractions(kobis,kmdb,tmdb);
    }
}
