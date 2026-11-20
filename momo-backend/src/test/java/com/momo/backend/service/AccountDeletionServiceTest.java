package com.momo.backend.service;

import com.momo.backend.dto.auth.*;
import com.momo.backend.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.dao.*;
import org.springframework.transaction.*;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.web.server.ResponseStatusException;
import java.sql.SQLException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** 외부 호출은 모의 경계로 격리하고 해제·삭제 순서와 실패 시 허용되는 부작용을 검증한다. */
@org.junit.jupiter.api.extension.ExtendWith(org.springframework.boot.test.system.OutputCaptureExtension.class)
class AccountDeletionServiceTest {
    final AuthService auth = mock(AuthService.class);
    final KakaoOAuthService kakao = mock(KakaoOAuthService.class);
    final SocialOAuthService social = mock(SocialOAuthService.class);
    final PlatformTransactionManager manager = mock(PlatformTransactionManager.class);
    final AccountDeletionService service = new AccountDeletionService(auth, kakao, social, manager);
    final OAuthRequestContext context = new OAuthRequestContext("state", "nonce", "verifier", OAuthPurpose.DELETE, AuthProvider.GOOGLE, 41L);
    final OAuthDeleteRequest request = new OAuthDeleteRequest("code", "state", true, "MOMO 회원 탈퇴");

    AccountDeletionServiceTest() {
        when(auth.getLoginUser(41L)).thenReturn(User.social(AuthProvider.GOOGLE, "social", "hash", "닉네임", null, "subject"));
        when(social.authenticateForDeletion(AuthProvider.GOOGLE, "code", context))
                .thenReturn(new OAuthAuthenticationResult(new SocialUserInfo("subject", "표본", null), "ephemeral"));
        when(manager.getTransaction(any())).thenAnswer(invocation -> {
            assertEquals(TransactionDefinition.PROPAGATION_REQUIRES_NEW, ((TransactionDefinition)invocation.getArgument(0)).getPropagationBehavior());
            return new SimpleTransactionStatus();
        });
    }
    @Test void mismatchedAccountCannotUnlinkOrDelete() {
        when(social.authenticateForDeletion(AuthProvider.GOOGLE, "code", context))
                .thenReturn(new OAuthAuthenticationResult(new SocialUserInfo("other", "표본", null), "ephemeral"));
        assertEquals(403, assertThrows(ResponseStatusException.class, () -> service.complete(41L, AuthProvider.GOOGLE, context, request)).getStatusCode().value());
        verify(social, never()).unlink(any(), any()); verifyNoInteractions(manager);
    }
    @Test void consentPurposeTargetAndProviderAreCheckedBeforeAuthentication() {
        assertThrows(ResponseStatusException.class, () -> service.validateStart(41L, AuthProvider.GOOGLE, false, "MOMO 회원 탈퇴"));
        assertThrows(ResponseStatusException.class, () -> service.validateStart(41L, AuthProvider.NAVER, true, "MOMO 회원 탈퇴"));
        assertThrows(ResponseStatusException.class, () -> service.validateStart(41L, AuthProvider.GOOGLE, true, "탈퇴"));
        assertThrows(ResponseStatusException.class, () -> service.complete(42L, AuthProvider.GOOGLE, context, request));
        var login = new OAuthRequestContext("state", "nonce", "verifier", OAuthPurpose.LOGIN, AuthProvider.GOOGLE, null);
        assertThrows(ResponseStatusException.class, () -> service.complete(41L, AuthProvider.GOOGLE, login, request));
        verifyNoInteractions(social, kakao, manager);
    }
    @Test void unlinkFailureDoesNotStartDatabaseDeletion() {
        doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY, "UNKNOWN"))
                .when(social).unlink(AuthProvider.GOOGLE, "ephemeral");
        assertThrows(ResponseStatusException.class, () -> service.complete(41L, AuthProvider.GOOGLE, context, request));
        verifyNoInteractions(manager); verify(auth, never()).deleteVerifiedSocialAccount(any(), any(), any());
    }
    @Test void retriesOnlyDatabaseWritesAfterConfirmedRollbackAndUnlinksOnce() {
        doThrow(lockFailure()).doThrow(lockFailure()).doNothing().when(auth).deleteVerifiedSocialAccount(41L, AuthProvider.GOOGLE, "subject");
        service.complete(41L, AuthProvider.GOOGLE, context, request);
        verify(social, times(1)).unlink(AuthProvider.GOOGLE, "ephemeral");
        verify(manager, times(3)).getTransaction(any()); verify(manager, times(2)).rollback(any()); verify(manager).commit(any());
        var order = inOrder(social, manager, auth);
        order.verify(social).unlink(AuthProvider.GOOGLE, "ephemeral");
        order.verify(manager).getTransaction(any()); order.verify(auth).deleteVerifiedSocialAccount(41L, AuthProvider.GOOGLE, "subject");
        order.verify(manager).rollback(any());
    }
    @Test void retryLimitLeavesPartialFailureInsteadOfSuccess() {
        doThrow(lockFailure()).when(auth).deleteVerifiedSocialAccount(41L, AuthProvider.GOOGLE, "subject");
        var error = assertThrows(ResponseStatusException.class, () -> service.complete(41L, AuthProvider.GOOGLE, context, request));
        assertEquals(503, error.getStatusCode().value()); assertTrue(error.getReason().contains("외부 연결은 해제"));
        verify(manager, times(3)).getTransaction(any()); verify(manager, never()).commit(any()); verify(social).unlink(AuthProvider.GOOGLE, "ephemeral");
    }
    @Test void permanentAndConnectionErrorsAreNeverRetried() {
        for (RuntimeException failure : new RuntimeException[]{new DataIntegrityViolationException("constraint"),
                new DataAccessResourceFailureException("connection", new SQLException("unknown", "08S01", 0)),
                new CannotAcquireLockException("wrong driver", new SQLException("lock", "40001", 0))}) {
            clearInvocations(manager);
            doThrow(failure).when(auth).deleteVerifiedSocialAccount(41L, AuthProvider.GOOGLE, "subject");
            assertThrows(ResponseStatusException.class, () -> service.complete(41L, AuthProvider.GOOGLE, context, request));
            verify(manager).getTransaction(any()); verify(manager, never()).commit(any());
        }
    }
    @Test void uncertainCommitAndFailedRollbackAreNotRetried() {
        doThrow(new TransactionSystemException("commit unknown")).when(manager).commit(any());
        assertThrows(ResponseStatusException.class, () -> service.complete(41L, AuthProvider.GOOGLE, context, request));
        verify(manager).getTransaction(any()); verify(manager, never()).rollback(any());
        reset(manager);
        when(manager.getTransaction(any())).thenReturn(new SimpleTransactionStatus());
        doThrow(lockFailure()).when(auth).deleteVerifiedSocialAccount(41L, AuthProvider.GOOGLE, "subject");
        doThrow(new TransactionSystemException("rollback unknown")).when(manager).rollback(any());
        assertThrows(ResponseStatusException.class, () -> service.complete(41L, AuthProvider.GOOGLE, context, request));
        verify(manager).getTransaction(any());
    }
    @Test void kakaoUsesDatabaseIdentityAndLocalKeepsPasswordPath() {
        when(auth.getLoginUser(41L)).thenReturn(User.social(AuthProvider.KAKAO, "social", "hash", "닉네임", null, "123"));
        service.delete(41L, new UserDeleteRequest(null, true, "MOMO 회원 탈퇴"));
        verify(kakao).unlink("123"); verify(auth).deleteVerifiedSocialAccount(41L, AuthProvider.KAKAO, "123");
        when(auth.getLoginUser(42L)).thenReturn(new User("local", "hash", "일반", "local@example.test"));
        service.delete(42L, new UserDeleteRequest("password", null, null));
        verify(auth).deleteMyAccount(42L, "password");
    }
    @Test void permanentFailureLogsSafeSqlMetadataWithoutSecretMessages(org.springframework.boot.test.system.CapturedOutput output) {
        doThrow(new DataIntegrityViolationException("ephemeral secret in message",
                new java.sql.SQLIntegrityConstraintViolationException("ephemeral", "23000", 1062)))
                .when(auth).deleteVerifiedSocialAccount(41L, AuthProvider.GOOGLE, "subject");
        assertThrows(ResponseStatusException.class, () -> service.complete(41L, AuthProvider.GOOGLE, context, request));
        assertTrue(output.getAll().contains("sqlState=23000"));
        assertTrue(output.getAll().contains("vendorCode=1062"));
        assertFalse(output.getAll().contains("ephemeral"));
    }
    private RuntimeException lockFailure() { return new CannotAcquireLockException("deadlock", new SQLException("deadlock", "40001", 1213)); }
}
