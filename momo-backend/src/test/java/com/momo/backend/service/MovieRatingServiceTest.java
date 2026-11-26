package com.momo.backend.service;

import com.momo.backend.entity.Movie;
import com.momo.backend.entity.MovieRating;
import com.momo.backend.entity.User;
import com.momo.backend.repository.MovieRatingRepository;
import com.momo.backend.repository.MovieRepository;
import com.momo.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

class MovieRatingServiceTest {

    @Test
    void locksMemberBeforeCreatingMovieRating() {
        UserRepository userRepository = mock(UserRepository.class);
        MovieRepository movieRepository = mock(MovieRepository.class);
        MovieRatingRepository ratingRepository = mock(MovieRatingRepository.class);
        User user = mock(User.class);
        Movie movie = mock(Movie.class);

        when(user.getUserId()).thenReturn(7L);
        when(userRepository.findByUserIdForUpdate(7L))
                .thenReturn(Optional.of(user));
        when(movieRepository.findById("20261234"))
                .thenReturn(Optional.of(movie));
        when(ratingRepository.findByUser_UserIdAndMovie_MovieCode(7L, "20261234"))
                .thenReturn(Optional.empty());

        MovieRatingService service = new MovieRatingService(
                ratingRepository, movieRepository, userRepository);

        service.saveRating(7L, "20261234", true);

        verify(userRepository).findByUserIdForUpdate(7L);
        verify(userRepository, never()).findById(7L);
        verify(ratingRepository).save(any(MovieRating.class));
    }

    @Test
    void locksMemberBeforeUpdatingExistingMovieRating() {
        UserRepository userRepository = mock(UserRepository.class);
        MovieRepository movieRepository = mock(MovieRepository.class);
        MovieRatingRepository ratingRepository = mock(MovieRatingRepository.class);
        User user = mock(User.class);
        Movie movie = mock(Movie.class);
        MovieRating existing = mock(MovieRating.class);

        when(user.getUserId()).thenReturn(7L);
        when(userRepository.findByUserIdForUpdate(7L))
                .thenReturn(Optional.of(user));
        when(movieRepository.findById("20261234"))
                .thenReturn(Optional.of(movie));
        when(ratingRepository.findByUser_UserIdAndMovie_MovieCode(7L, "20261234"))
                .thenReturn(Optional.of(existing));

        MovieRatingService service = new MovieRatingService(
                ratingRepository, movieRepository, userRepository);

        service.saveRating(7L, "20261234", false);

        verify(userRepository).findByUserIdForUpdate(7L);
        verify(existing).updateRating(false);
        verify(ratingRepository, never()).save(any(MovieRating.class));
    }

    @Test
    void readsCountsAndCurrentMemberReactionWithRepositoryQueries() {
        UserRepository userRepository = mock(UserRepository.class);
        MovieRepository movieRepository = mock(MovieRepository.class);
        MovieRatingRepository ratingRepository = mock(MovieRatingRepository.class);
        User user = mock(User.class);
        MovieRating rating = mock(MovieRating.class);
        when(movieRepository.existsById("20261234")).thenReturn(true);
        when(ratingRepository.countByMovie_MovieCodeAndLiked("20261234", true)).thenReturn(8L);
        when(ratingRepository.countByMovie_MovieCodeAndLiked("20261234", false)).thenReturn(2L);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(user.getUserId()).thenReturn(7L);
        when(ratingRepository.findByUser_UserIdAndMovie_MovieCode(7L, "20261234"))
                .thenReturn(Optional.of(rating));
        when(rating.getLiked()).thenReturn(true);

        MovieRatingService service = new MovieRatingService(
                ratingRepository, movieRepository, userRepository);

        Map<String, Object> result = service.getMovieRating("20261234", 7L);

        assertEquals(8L, result.get("likeCount"));
        assertEquals(2L, result.get("dislikeCount"));
        assertEquals(10L, result.get("totalCount"));
        assertEquals(80.0, result.get("positiveRate"));
        assertEquals(true, result.get("myRating"));

        verify(movieRepository).existsById("20261234");
        verify(ratingRepository).countByMovie_MovieCodeAndLiked("20261234", true);
        verify(ratingRepository).countByMovie_MovieCodeAndLiked("20261234", false);
        verify(ratingRepository).findByUser_UserIdAndMovie_MovieCode(7L, "20261234");
    }

    @Test
    void rejectsUnregisteredMovieWithoutCallingExternalMovieApis() {
        UserRepository userRepository = mock(UserRepository.class);
        MovieRepository movieRepository = mock(MovieRepository.class);
        MovieRatingRepository ratingRepository = mock(MovieRatingRepository.class);
        when(movieRepository.existsById("20167904")).thenReturn(false);

        MovieRatingService service = new MovieRatingService(
                ratingRepository, movieRepository, userRepository);

        com.momo.backend.exception.CustomException error = org.junit.jupiter.api.Assertions.assertThrows(
                com.momo.backend.exception.CustomException.class,
                () -> service.getMovieRating("20167904", null));

        assertEquals("MOVIE_NOT_FOUND", error.getCode());
        verify(movieRepository).existsById("20167904");
        verifyNoInteractions(ratingRepository);
        verifyNoInteractions(userRepository);
    }

    @Test
    void anonymousMovieRatingDoesNotPerformMemberLookup() {
        UserRepository userRepository = mock(UserRepository.class);
        MovieRepository movieRepository = mock(MovieRepository.class);
        MovieRatingRepository ratingRepository = mock(MovieRatingRepository.class);
        when(movieRepository.existsById("20261234")).thenReturn(true);
        when(ratingRepository.countByMovie_MovieCodeAndLiked("20261234", true)).thenReturn(0L);
        when(ratingRepository.countByMovie_MovieCodeAndLiked("20261234", false)).thenReturn(0L);

        MovieRatingService service = new MovieRatingService(
                ratingRepository, movieRepository, userRepository);

        Map<String, Object> result = service.getMovieRating("20261234", null);

        assertEquals(0L, result.get("likeCount"));
        assertEquals(0L, result.get("dislikeCount"));
        assertEquals(0L, result.get("totalCount"));
        assertNull(result.get("positiveRate"));
        assertNull(result.get("myRating"));

        verify(movieRepository).existsById("20261234");
        verify(ratingRepository).countByMovie_MovieCodeAndLiked("20261234", true);
        verify(ratingRepository).countByMovie_MovieCodeAndLiked("20261234", false);
        verify(userRepository, never()).findByLoginId(anyString());
    }
}
