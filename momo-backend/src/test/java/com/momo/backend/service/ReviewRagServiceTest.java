package com.momo.backend.service;

import org.springframework.context.ApplicationEventPublisher;
import com.momo.backend.rag.event.ReviewIndexEvent;
import com.momo.backend.rag.event.ReviewIndexEvent.Operation;
import com.momo.backend.dto.review.*;
import com.momo.backend.entity.*;
import com.momo.backend.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

/** 가상 회원·리뷰로 기존 소유권/중복 검사와 색인 연결을 검증한다. */
class ReviewRagServiceTest {
    ReviewRepository reviews = mock(ReviewRepository.class);
    UserRepository users = mock(UserRepository.class);
    MovieRepository movies = mock(MovieRepository.class);
    ApplicationEventPublisher rag = mock(ApplicationEventPublisher.class);
    ReviewService service = new ReviewService(reviews, users, movies,
            mock(CommentRepository.class), mock(ReviewReactionRepository.class),
            mock(CommentReactionRepository.class), rag);
    User user = mock(User.class);
    Review review;
    @BeforeEach void setup() {
        when(user.getUserId()).thenReturn(91L);
        when(users.findByUserIdForUpdate(anyLong())).thenReturn(Optional.of(user));
        when(movies.existsById("20990001")).thenReturn(true);
        review = new Review(user, "20990001", "우주 영화", "우주 탐험");
        ReflectionTestUtils.setField(review, "reviewId", 910001L);
        when(reviews.findByIdForUpdate(910001L)).thenReturn(Optional.of(review));
        when(reviews.saveAndFlush(any())).thenReturn(review);
    }
    @Test void createCapturesSavedReview() {
        ReviewCreateRequest req = mock(ReviewCreateRequest.class);
        when(req.getMovieCode()).thenReturn("20990001");
        when(req.getTitle()).thenReturn("우주 영화");
        when(req.getContent()).thenReturn("우주 탐험");
        assertEquals(910001L, service.createReview(91L, req).getReviewId());
        verify(rag).publishEvent(new ReviewIndexEvent(910001L, Operation.UPSERT));
    }
    @Test void updateCapturesNewContent() {
        ReviewUpdateRequest req = mock(ReviewUpdateRequest.class);
        when(req.getTitle()).thenReturn("수정 제목");
        when(req.getContent()).thenReturn("기차 여행");
        service.updateReview(910001L, 91L, req);
        verify(rag).publishEvent(new ReviewIndexEvent(910001L, Operation.UPSERT));
    }
    @Test void deleteSchedulesOnlyAfterLocalDelete() {
        service.deleteReview(910001L, 91L);
        var ordered = inOrder(reviews, rag);
        ordered.verify(reviews).delete(review);
        ordered.verify(rag).publishEvent(new ReviewIndexEvent(910001L, Operation.DELETE));
    }
    @Test void forbiddenDoesNotScheduleIndexOrDelete() {
        assertThrows(RuntimeException.class, () -> service.updateReview(910001L, 92L, mock(ReviewUpdateRequest.class)));
        assertThrows(RuntimeException.class, () -> service.deleteReview(910001L, 92L));
        verifyNoInteractions(rag);
    }
    @Test void duplicateDoesNotScheduleIndex() {
        when(reviews.existsByUser_UserIdAndMovieCode(91L, "20990001")).thenReturn(true);
        ReviewCreateRequest req = mock(ReviewCreateRequest.class);
        when(req.getMovieCode()).thenReturn("20990001");
        assertThrows(RuntimeException.class, () -> service.createReview(91L, req));
        verifyNoInteractions(rag);
    }
}
