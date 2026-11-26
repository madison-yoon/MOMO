package com.momo.backend.service;

import com.momo.backend.client.KobisApiClient;
import com.momo.backend.entity.MovieCatalogSyncState;
import com.momo.backend.repository.MovieCatalogSyncStateRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.ObjectMapper;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class MovieCatalogSyncServiceTest {

    @Test
    void locksTheSharedDatabaseStateBeforeCallingKobisAndRecordsProviderFailure() {
        KobisApiClient kobisApiClient = mock(KobisApiClient.class);
        MovieCatalogSyncStateRepository stateRepository =
                mock(MovieCatalogSyncStateRepository.class);
        MovieCatalogSyncState state = MovieCatalogSyncState.initial();

        when(stateRepository.findByIdForUpdate(1)).thenReturn(Optional.of(state));
        when(stateRepository.findById(1)).thenReturn(Optional.of(state));
        when(kobisApiClient.searchCatalogMovies(1, 100, null, null))
                .thenThrow(new IllegalStateException("provider unavailable"));

        MovieCatalogSyncService service = new MovieCatalogSyncService(
                kobisApiClient,
                mock(ObjectMapper.class),
                mock(MoviePersistenceService.class),
                mock(MovieService.class),
                stateRepository
        );
        ReflectionTestUtils.setField(service, "enabled", true);

        service.syncNextPage();

        var order = inOrder(stateRepository, kobisApiClient);
        order.verify(stateRepository).insertInitialIfAbsent();
        order.verify(stateRepository).findByIdForUpdate(1);
        order.verify(kobisApiClient).searchCatalogMovies(1, 100, null, null);

        verify(stateRepository).save(state);
        assertEquals("EXTERNAL_PROVIDER_FAILURE", state.getLastError());
        assertEquals("외부 영화 데이터 수집에 실패했습니다.", service.getStatus().lastError());
    }

    @Test
    void doesNotTouchTheDatabaseWhenCatalogSynchronizationIsDisabled() {
        MovieCatalogSyncStateRepository stateRepository =
                mock(MovieCatalogSyncStateRepository.class);
        MovieCatalogSyncService service = new MovieCatalogSyncService(
                mock(KobisApiClient.class),
                mock(ObjectMapper.class),
                mock(MoviePersistenceService.class),
                mock(MovieService.class),
                stateRepository
        );
        ReflectionTestUtils.setField(service, "enabled", false);

        service.syncNextPage();

        verifyNoInteractions(stateRepository);
    }
}
