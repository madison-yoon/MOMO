package com.momo.backend.service;

import com.momo.backend.dto.review.ReviewCreateRequest;
import com.momo.backend.entity.User;
import com.momo.backend.exception.CustomException;
import com.momo.backend.repository.CommentReactionRepository;
import com.momo.backend.repository.CommentRepository;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.repository.ReviewReactionRepository;
import com.momo.backend.repository.ReviewRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class ReviewMovieExistenceTest {

    @Test
    void refusesToCreateReviewForMovieMissingFromMovieCatalog() {
        ReviewRepository reviews = mock(ReviewRepository.class);
        UserRepository users = mock(UserRepository.class);
        MovieRepository movies = mock(MovieRepository.class);
        User member = mock(User.class);

        when(users.findByUserIdForUpdate(7L)).thenReturn(Optional.of(member));
        when(member.getUserId()).thenReturn(7L);
        when(movies.existsById("20261234")).thenReturn(false);

        ReviewService service = new ReviewService(
                reviews,
                users,
                movies,
                mock(CommentRepository.class),
                mock(ReviewReactionRepository.class),
                mock(CommentReactionRepository.class),
                mock(org.springframework.context.ApplicationEventPublisher.class)
        );
        ReviewCreateRequest request = new ReviewCreateRequest();
        ReflectionTestUtils.setField(request, "movieCode", "20261234");

        CustomException error = assertThrows(
                CustomException.class,
                () -> service.createReview(7L, request)
        );

        assertEquals("MOVIE_NOT_FOUND", error.getCode());
        verify(movies).existsById("20261234");
        verifyNoInteractions(reviews);
    }
}
