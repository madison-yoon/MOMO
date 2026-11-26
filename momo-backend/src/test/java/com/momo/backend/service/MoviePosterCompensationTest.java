package com.momo.backend.service;

import com.momo.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.dao.DataAccessResourceFailureException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MoviePosterCompensationTest {
    final MoviePosterWriter writer=mock(MoviePosterWriter.class);
    final PosterFileStorageService files=mock(PosterFileStorageService.class);
    final MoviePosterPersistenceService service=new MoviePosterPersistenceService(
            mock(MoviePosterCacheRepository.class),mock(MovieRepository.class),files,writer);

    @Test void downloadOccursOnceAcrossThreeDatabaseAttempts() {
        when(files.downloadAndSave("20991202","https://example.org/poster.jpg")).thenReturn("/posters/new.jpg");
        doThrow(new OptimisticLockingFailureException("1"))
                .doThrow(new OptimisticLockingFailureException("2")).doNothing()
                .when(writer).complete("20991202","claim","/posters/new.jpg");
        assertTrue(service.saveSuccess("20991202","claim","https://example.org/poster.jpg"));
        verify(files).downloadAndSave("20991202","https://example.org/poster.jpg");
        verify(writer,times(3)).complete("20991202","claim","/posters/new.jpg");
        verify(files,never()).delete(anyString());
    }

    @Test void rejectedClaimCannotDeleteAReferencedFile() {
        when(files.downloadAndSave(anyString(),anyString())).thenReturn("/posters/referenced.jpg");
        doThrow(new MoviePosterWriter.Rejected()).when(writer).complete(anyString(),anyString(),anyString());
        when(writer.isReferenced("/posters/referenced.jpg")).thenReturn(true);
        assertFalse(service.saveSuccess("20991202","old","https://example.org/poster.jpg"));
        verify(files,never()).delete(anyString());
    }

    @Test void failedReferenceReadPreservesFileAndOriginalDatabaseFailure() {
        when(files.downloadAndSave(anyString(),anyString())).thenReturn("/posters/uncertain.jpg");
        doThrow(new DataAccessResourceFailureException("DB unavailable")).when(writer).complete(anyString(),anyString(),anyString());
        when(writer.isReferenced(anyString())).thenThrow(new DataAccessResourceFailureException("DB unavailable"));
        assertThrows(DataAccessResourceFailureException.class,()->service.saveSuccess("20991202","claim","https://example.org/poster.jpg"));
        verify(files,never()).delete(anyString());
        verify(writer).complete(anyString(),anyString(),anyString());
    }

    @Test void exhaustedConflictIsNotReportedAsSuccessAndUnreferencedDownloadIsRemoved() {
        when(files.downloadAndSave(anyString(),anyString())).thenReturn("/posters/unused.jpg");
        doThrow(new OptimisticLockingFailureException("conflict")).when(writer).complete(anyString(),anyString(),anyString());
        assertThrows(OptimisticLockingFailureException.class,()->service.saveSuccess("20991202","claim","https://example.org/poster.jpg"));
        verify(writer,times(3)).complete(anyString(),anyString(),anyString());
        verify(files).delete("/posters/unused.jpg");
        verify(files).downloadAndSave(anyString(),anyString());
    }
}
