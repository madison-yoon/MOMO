package com.momo.backend.service;

import com.momo.backend.entity.AuthProvider;
import com.momo.backend.dto.auth.OAuthPurpose;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** 목적·공급자·시작 회원을 모두 검증한 state만 소비할 수 있다. */
class OAuthDeletionStateTest {
    @Test void deleteCannotBecomeLoginAndWrongMemberCannotConsumeIt() {
        var states = new OAuthStateService();
        var context = states.issue(AuthProvider.GOOGLE, OAuthPurpose.DELETE, 41L);
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> states.consume(AuthProvider.GOOGLE, OAuthPurpose.LOGIN, null, context.state(), context.state()));
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> states.consume(AuthProvider.GOOGLE, OAuthPurpose.DELETE, 42L, context.state(), context.state()));
        assertEquals(context, states.consume(AuthProvider.GOOGLE, OAuthPurpose.DELETE, 41L, context.state(), context.state()));
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> states.consume(AuthProvider.GOOGLE, OAuthPurpose.DELETE, 41L, context.state(), context.state()));
    }
}
