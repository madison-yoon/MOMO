package com.momo.backend.service;

import com.momo.backend.entity.Movie;
import com.momo.backend.dto.movie.MovieSearchResponse;
import org.junit.jupiter.api.Test;
import org.springframework.dao.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MovieWritePolicyTest {
    Movie movie() { return new Movie("20991201","movie","","","","","","",""); }

    @Test void onlyOptimisticConflictsRetryWithThreeTotalAttempts() {
        AtomicInteger attempts=new AtomicInteger();
        assertThrows(OptimisticLockingFailureException.class, () -> MovieWriteRetry.execute(() -> {
            attempts.incrementAndGet(); throw new OptimisticLockingFailureException("conflict");
        }));
        assertEquals(3,attempts.get());
        attempts.set(0);
        assertThrows(DataAccessResourceFailureException.class, () -> MovieWriteRetry.execute(() -> {
            attempts.incrementAndGet(); throw new DataAccessResourceFailureException("DB unavailable");
        }));
        assertEquals(1,attempts.get());
    }

    @Test void fallbackIsOnlyForExistingEnrichmentAndReadsCurrentInsteadOfCandidate() {
        var writer=mock(MoviePersistenceWriter.class);
        var service=new MoviePersistenceService(writer);
        var update=MovieDetailUpdate.from(movie());
        Movie current=movie(); current.updatePosterUrl("/posters/current.jpg");
        when(writer.applyDetail(update,true)).thenThrow(new OptimisticLockingFailureException("conflict"));
        when(writer.readCurrent(update.movieCode())).thenReturn(current);
        assertSame(current,service.saveDetail(update,true));
        verify(writer,times(3)).applyDetail(update,true);
        verify(writer).readCurrent(update.movieCode());
    }

    @Test void newMovieCannotUseFallbackAndDatabaseFailureIsNotSwallowed() {
        var writer=mock(MoviePersistenceWriter.class);
        var service=new MoviePersistenceService(writer);
        var update=MovieDetailUpdate.from(movie());
        when(writer.applyDetail(update,false)).thenThrow(new OptimisticLockingFailureException("conflict"));
        assertThrows(OptimisticLockingFailureException.class,()->service.saveDetail(update,false));
        verify(writer,times(3)).applyDetail(update,false);
        verify(writer,never()).readCurrent(anyString());
        when(writer.applyDetail(update,true)).thenThrow(new DataAccessResourceFailureException("DB unavailable"));
        assertThrows(DataAccessResourceFailureException.class,()->service.saveDetail(update,true));
        verify(writer).applyDetail(update,true);
    }

    @Test void fallbackReadFailureRemainsAnError() {
        var writer=mock(MoviePersistenceWriter.class);
        var update=MovieDetailUpdate.from(movie());
        when(writer.applyDetail(update,true)).thenThrow(new OptimisticLockingFailureException("conflict"));
        when(writer.readCurrent(update.movieCode())).thenThrow(new DataAccessResourceFailureException("DB unavailable"));
        assertThrows(DataAccessResourceFailureException.class,()->new MoviePersistenceService(writer).saveDetail(update,true));
    }

    @Test void nonDuplicateIntegrityErrorIsNotTreatedAsConcurrentInsert() {
        var writer=mock(MoviePersistenceWriter.class);
        var item=new MovieSearchResponse("20991201","movie","","","");
        doThrow(new DataIntegrityViolationException("invalid field")).when(writer).saveOrSupplement(item);
        assertThrows(DataIntegrityViolationException.class,()->new MoviePersistenceService(writer).saveSearchMovies(List.of(item)));
        verify(writer,never()).supplementAfterConcurrentInsert(any());
    }

    @Test void detailIntentCannotCarryPosterOrRankAndAttemptTimesNeverGoBackwards() {
        Movie stale=movie(); stale.updatePosterUrl("/posters/stale.jpg"); stale.markBoxOfficeEntered(7,"20260101");
        stale.supplementMissingDetails("English","","","Drama","","","","TMDb");
        Movie created=MovieDetailUpdate.from(stale).create();
        assertTrue(created.isSupplementVerified());
        assertEquals(stale.getSupplementSources(),created.getSupplementSources());
        LocalDateTime later=LocalDateTime.of(2026,11,15,1,0);
        stale.markOverviewAttempted(later.minusHours(1));
        stale.markSupplementAttempted(later.minusHours(1));
        stale.markKobisDetailAttempted(later.minusHours(1));
        Movie current=movie(); current.markBoxOfficeEntered(1,"20261114");
        current.markOverviewAttempted(later); current.markSupplementAttempted(later); current.markKobisDetailAttempted(later);
        MovieDetailUpdate.from(stale).apply(current);
        assertNull(current.getPosterUrl());
        assertEquals(1,current.getBestBoxOfficeRank());
        assertEquals("20261114",current.getLastBoxOfficeDate());
        assertEquals(later,current.getOverviewAttemptedAt());
        assertEquals(later,current.getSupplementAttemptedAt());
        assertEquals(later,current.getKobisDetailAttemptedAt());
    }
}
