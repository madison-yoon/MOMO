package com.momo.backend.rag.service;

import com.momo.backend.rag.client.RagClient;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReindexAccessGuardTest {
    UserRepository users = mock(UserRepository.class);
    RagClient client = mock(RagClient.class);

    @Test void onlyExistingConfiguredOperatorWithBothFlagsMayReindex() {
        when(users.existsById(1L)).thenReturn(true);
        when(client.isEnabled()).thenReturn(true);
        assertThatCode(() -> new ReindexAccessGuard(users, client, true, "1, 2").check(1L)).doesNotThrowAnyException();
        rejected(new ReindexAccessGuard(users, client, false, "1"), 1L, 403);
        rejected(new ReindexAccessGuard(users, client, true, ""), 1L, 403);
        rejected(new ReindexAccessGuard(users, client, true, "2"), 1L, 403);
        when(client.isEnabled()).thenReturn(false);
        rejected(new ReindexAccessGuard(users, client, true, "1"), 1L, 503);
    }

    @Test void missingAndDeletedMembersCannotReuseOperatorId() {
        var guard = new ReindexAccessGuard(users, client, true, "1");
        rejected(guard, null, 401);
        rejected(guard, 1L, 401);
        rejected(guard, -1L, 401);
    }

    private void rejected(ReindexAccessGuard guard, Long id, int expected) {
        assertThatThrownBy(() -> guard.check(id)).isInstanceOfSatisfying(ResponseStatusException.class,
                error -> assertThat(error.getStatusCode().value()).isEqualTo(expected));
    }
}
