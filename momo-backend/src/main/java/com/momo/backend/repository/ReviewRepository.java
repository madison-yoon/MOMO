
package com.momo.backend.repository;

import com.momo.backend.entity.Review;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;
import java.time.LocalDateTime;
import com.momo.backend.rag.enums.IndexStatus;


public interface ReviewRepository extends JpaRepository<Review, Long> {

    // flush 직후 DB가 실제 저장한 소수초 정밀도를 읽어 커밋 후 거절 작업의 원본 비교에 사용한다.
    @Query(value = "select updated_at from reviews where review_id = :reviewId", nativeQuery = true)
    LocalDateTime findIndexTimestamp(@Param("reviewId") Long reviewId);

    @Query("select r.reviewId from Review r order by r.reviewId")
    List<Long> findAllReviewIds();

    @Query("select r.reviewId from Review r where r.user.userId = :userId order by r.reviewId")
    List<Long> findAuthoredIds(@Param("userId") Long userId);

    // 벌크 갱신은 엔티티 생명주기 콜백을 우회하므로 원본 updatedAt을 보존한다.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Review r set r.indexStatus = com.momo.backend.rag.enums.IndexStatus.INDEXING, r.indexError = null, r.indexedAt = null where r.reviewId = :reviewId")
    int resetIndexState(@Param("reviewId") Long reviewId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Review r set r.indexStatus = com.momo.backend.rag.enums.IndexStatus.INDEXING, r.indexError = null, r.indexedAt = null where r.indexStatus = com.momo.backend.rag.enums.IndexStatus.READY")
    int invalidateReadyIndexes();

    // 호출자는 같은 REQUIRES_NEW 트랜잭션에서 행 잠금 및 정확한 원본 비교를 완료해야 한다.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Review r set r.indexStatus = :status, r.indexError = :error, r.indexedAt = :indexedAt where r.reviewId = :reviewId and r.indexStatus = com.momo.backend.rag.enums.IndexStatus.INDEXING")
    int writeIndexResult(@Param("reviewId") Long reviewId, @Param("status") IndexStatus status,
                         @Param("error") String error, @Param("indexedAt") LocalDateTime indexedAt);

    // 리뷰 반응·댓글 등록과 리뷰 삭제가 동시에 진행되지 않도록 대상 리뷰 행을 잠근다.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select review from Review review where review.reviewId = :reviewId")
    Optional<Review> findByIdForUpdate(@Param("reviewId") Long reviewId);

    // 전체 영화의 리뷰를 최신순으로 조회
    @EntityGraph(attributePaths = {"user"})
    Page<Review> findAllByOrderByCreatedAtDescReviewIdDesc(
            Pageable pageable
    );

    // 전체 리뷰 검색: 영화 제목, 감독, 배우, 닉네임, 리뷰 제목, 리뷰 내용
    @EntityGraph(attributePaths = {"user"})
    @Query(
            value = """
                    SELECT r
                    FROM Review r
                    WHERE
                        :searchType = 'ALL'
                        AND (
                            LOWER(COALESCE(r.user.nickname, '')) LIKE :pattern
                            OR LOWER(COALESCE(r.title, '')) LIKE :pattern
                            OR LOWER(COALESCE(r.content, '')) LIKE :pattern
                            OR EXISTS (
                                SELECT m.movieCode
                                FROM Movie m
                                WHERE m.movieCode = r.movieCode
                                  AND (
                                      LOWER(COALESCE(m.title, '')) LIKE :pattern
                                      OR LOWER(COALESCE(m.director, '')) LIKE :pattern
                                      OR LOWER(COALESCE(m.actors, '')) LIKE :pattern
                                  )
                            )
                        )
                        OR (
                            :searchType = 'MOVIE'
                            AND EXISTS (
                                SELECT m.movieCode FROM Movie m
                                WHERE m.movieCode = r.movieCode
                                  AND LOWER(COALESCE(m.title, '')) LIKE :pattern
                            )
                        )
                        OR (
                            :searchType = 'DIRECTOR'
                            AND EXISTS (
                                SELECT m.movieCode FROM Movie m
                                WHERE m.movieCode = r.movieCode
                                  AND LOWER(COALESCE(m.director, '')) LIKE :pattern
                            )
                        )
                        OR (
                            :searchType = 'ACTOR'
                            AND EXISTS (
                                SELECT m.movieCode FROM Movie m
                                WHERE m.movieCode = r.movieCode
                                  AND LOWER(COALESCE(m.actors, '')) LIKE :pattern
                            )
                        )
                        OR (
                            :searchType = 'NICKNAME'
                            AND LOWER(COALESCE(r.user.nickname, '')) LIKE :pattern
                        )
                        OR (
                            :searchType = 'TITLE'
                            AND LOWER(COALESCE(r.title, '')) LIKE :pattern
                        )
                        OR (
                            :searchType = 'CONTENT'
                            AND LOWER(COALESCE(r.content, '')) LIKE :pattern
                        )
                    ORDER BY r.createdAt DESC, r.reviewId DESC
                    """,
            countQuery = """
                    SELECT COUNT(r)
                    FROM Review r
                    WHERE
                        (
                            :searchType = 'ALL'
                            AND (
                                LOWER(COALESCE(r.user.nickname, '')) LIKE :pattern
                                OR LOWER(COALESCE(r.title, '')) LIKE :pattern
                                OR LOWER(COALESCE(r.content, '')) LIKE :pattern
                                OR EXISTS (
                                    SELECT m.movieCode
                                    FROM Movie m
                                    WHERE m.movieCode = r.movieCode
                                      AND (
                                          LOWER(COALESCE(m.title, '')) LIKE :pattern
                                          OR LOWER(COALESCE(m.director, '')) LIKE :pattern
                                          OR LOWER(COALESCE(m.actors, '')) LIKE :pattern
                                      )
                                )
                            )
                        )
                        OR (
                            :searchType = 'MOVIE'
                            AND EXISTS (
                                SELECT m.movieCode FROM Movie m
                                WHERE m.movieCode = r.movieCode
                                  AND LOWER(COALESCE(m.title, '')) LIKE :pattern
                            )
                        )
                        OR (
                            :searchType = 'DIRECTOR'
                            AND EXISTS (
                                SELECT m.movieCode FROM Movie m
                                WHERE m.movieCode = r.movieCode
                                  AND LOWER(COALESCE(m.director, '')) LIKE :pattern
                            )
                        )
                        OR (
                            :searchType = 'ACTOR'
                            AND EXISTS (
                                SELECT m.movieCode FROM Movie m
                                WHERE m.movieCode = r.movieCode
                                  AND LOWER(COALESCE(m.actors, '')) LIKE :pattern
                            )
                        )
                        OR (
                            :searchType = 'NICKNAME'
                            AND LOWER(COALESCE(r.user.nickname, '')) LIKE :pattern
                        )
                        OR (
                            :searchType = 'TITLE'
                            AND LOWER(COALESCE(r.title, '')) LIKE :pattern
                        )
                        OR (
                            :searchType = 'CONTENT'
                            AND LOWER(COALESCE(r.content, '')) LIKE :pattern
                        )
                    """
    )
    Page<Review> searchAllReviews(
            @Param("searchType") String searchType,
            @Param("pattern") String pattern,
            Pageable pageable
    );

    // 특정 영화의 리뷰를 최신순으로 조회
    @EntityGraph(attributePaths = {"user"})
    Page<Review> findByMovieCodeOrderByCreatedAtDescReviewIdDesc(
            String movieCode,
            Pageable pageable
    );

    // 같은 회원이 같은 영화에 이미 리뷰를 작성했는지 확인
    boolean existsByUser_UserIdAndMovieCode(
            Long userId,
            String movieCode
    );

    // 특정 회원이 작성한 리뷰 조회
    @EntityGraph(attributePaths = {"user"})
    Page<Review> findByUser_UserId(
            Long userId,
            Pageable pageable
    );

    // 회원 탈퇴 시 작성한 리뷰를 한 번의 DELETE 쿼리로 정리한다.
    @Modifying
    @Query("delete from Review review where review.user.userId = :userId")
    int deleteAuthoredByUserId(@Param("userId") Long userId);
}
