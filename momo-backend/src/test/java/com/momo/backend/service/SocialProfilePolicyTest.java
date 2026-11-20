package com.momo.backend.service;

import com.momo.backend.dto.auth.UserUpdateRequest;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.entity.User;
import com.momo.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** 소셜 이메일이 없어도 닉네임을 수정하고 서버가 회원별 수정 권한을 지킨다. */
class SocialProfilePolicyTest {
    final UserRepository users = mock(UserRepository.class);
    final AuthService service = new AuthService(users, mock(PasswordEncoder.class), mock(ReviewRepository.class),
            mock(CommentRepository.class), mock(ReviewReactionRepository.class), mock(CommentReactionRepository.class),
            mock(FirebaseStorageService.class), mock(MovieRatingRepository.class), mock(FavoriteMovieRepository.class), mock(RefreshTokenService.class));

    User social(String email) {
        User user = User.social(AuthProvider.NAVER, "social", "random-hash", "기존이름", email, "external-id");
        when(users.findByUserIdForUpdate(1L)).thenReturn(java.util.Optional.of(user));
        return user;
    }
    @Test void absentSocialEmailDoesNotPreventNicknameUpdate() {
        try (var factory = jakarta.validation.Validation.buildDefaultValidatorFactory()) {
            assertTrue(factory.getValidator().validate(new UserUpdateRequest("새닉네임", null, null, null)).isEmpty());
        }
        var user = social(null);
        service.updateMyInfo(1L, new UserUpdateRequest("새닉네임", null, null, null));
        assertEquals("새닉네임", user.getNickname()); assertNull(user.getEmail());
    }
    @Test void omittedSocialEmailPreservesProviderEmail() {
        var user = social("provider@example.test");
        service.updateMyInfo(1L, new UserUpdateRequest("새닉네임", null, null, null));
        assertEquals("provider@example.test", user.getEmail());
    }
    @Test void forgedSocialEmailCannotBeSaved() {
        var user = social(null);
        assertThrows(IllegalArgumentException.class, () -> service.updateMyInfo(1L,
                new UserUpdateRequest("새닉네임", "forged@example.test", null, null)));
        assertNull(user.getEmail()); assertEquals("기존이름", user.getNickname());
    }
    @Test void socialPasswordChangeIsDeniedEvenWhenHashMatches() {
        var user = social(null);
        assertThrows(IllegalArgumentException.class, () -> service.updateMyInfo(1L,
                new UserUpdateRequest("새닉네임", null, "anything", "NewPassword1!")));
        assertEquals("random-hash", user.getPasswordHash());
    }
    @Test void localStillRequiresEmail() {
        var user = new User("local", "hash", "기존이름", "local@example.test");
        when(users.findByUserIdForUpdate(1L)).thenReturn(java.util.Optional.of(user));
        assertThrows(IllegalArgumentException.class, () -> service.updateMyInfo(1L,
                new UserUpdateRequest("새닉네임", null, null, null)));
        assertEquals("local@example.test", user.getEmail());
    }
}
