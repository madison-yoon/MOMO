package com.momo.backend.scheduler;

import com.momo.backend.repository.MovieCacheRepository;
import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MovieCacheCleanupSchedulerTest {

    @Test
    void scheduledCleanupUsesFourAmSeoulCronAndDeletesExpiredRows() throws Exception {
        MovieCacheRepository repository = mock(MovieCacheRepository.class);
        MovieCacheCleanupScheduler scheduler = new MovieCacheCleanupScheduler(repository);
        when(repository.deleteExpired(any(LocalDateTime.class))).thenReturn(2);

        scheduler.deleteExpiredCaches();

        verify(repository, times(1)).deleteExpired(any(LocalDateTime.class));
        Scheduled scheduled = MovieCacheCleanupScheduler.class
                .getMethod("deleteExpiredCaches")
                .getAnnotation(Scheduled.class);
        assertEquals("0 0 4 * * *", scheduled.cron());
        assertEquals("Asia/Seoul", scheduled.zone());
    }
}
