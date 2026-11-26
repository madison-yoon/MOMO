package com.momo.backend.service;

import com.momo.backend.dto.auth.UserUpdateRequest;
import com.momo.backend.entity.AuthProvider;
import com.momo.backend.entity.User;
import com.momo.backend.repository.CommentReactionRepository;
import com.momo.backend.repository.CommentRepository;
import com.momo.backend.repository.FavoriteMovieRepository;
import com.momo.backend.repository.MovieRatingRepository;
import com.momo.backend.repository.ReviewReactionRepository;
import com.momo.backend.repository.ReviewRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class AuthServiceProfileConflictTest {

    @Test
    void returnsConflictWhenAnotherMemberAlreadyUsesRequestedNickname() {
        UserRepository userRepository = mock(UserRepository.class);
        User member = mock(User.class);

        when(userRepository.findByUserIdForUpdate(41L)).thenReturn(Optional.of(member));
        when(member.getProvider()).thenReturn(AuthProvider.LOCAL);
        when(member.getNickname()).thenReturn("CurrentNick");
        when(userRepository.existsByNickname("TakenNick")).thenReturn(true);

        AuthService service = new AuthService(
                userRepository,
                mock(PasswordEncoder.class),
                mock(ReviewRepository.class),
                mock(CommentRepository.class),
                mock(ReviewReactionRepository.class),
                mock(CommentReactionRepository.class),
                mock(FirebaseStorageService.class),
                mock(MovieRatingRepository.class),
                mock(FavoriteMovieRepository.class),
                mock(RefreshTokenService.class),
                mock(org.springframework.context.ApplicationEventPublisher.class)
        );

        UserUpdateRequest request = new UserUpdateRequest(
                "TakenNick",
                "member@example.com",
                null,
                null
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.updateMyInfo(41L, request)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(member, never()).updateProfile(anyString(), anyString());
        verify(userRepository, never()).flush();
    }
}
