
package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.momo.backend.rag.enums.IndexStatus;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_review_user_movie",
                        columnNames = {"user_id", "movie_code"}
                )
        },
        indexes = {
                @Index(name = "ix_review_created_at_id", columnList = "created_at, review_id"),
                @Index(name = "ix_review_movie_created_at", columnList = "movie_code, created_at, review_id"),
                @Index(name = "ix_review_user_created_at", columnList = "user_id, created_at, review_id")
        }
)
@Getter
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "movie_code", nullable = false, length = 20)
    private String movieCode;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 사용자 원본과 색인 상태를 같은 행에 보관하며 성공 이전에는 검색에서 제외한다.
    @Enumerated(EnumType.STRING)
    @Column(name = "index_status", nullable = false, length = 20)
    private IndexStatus indexStatus = IndexStatus.INDEXING;

    @Column(name = "index_error", length = 500)
    private String indexError;

    @Column(name = "indexed_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime indexedAt;

    public Review(User user, String movieCode, String title, String content) {
        this.user = user;
        this.movieCode = movieCode;
        this.title = title;
        this.content = content;
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void updateReview(String title, String content) {
        this.title = title;
        this.content = content;
        markIndexing();
    }

    // 일반 수정 트랜잭션에서 사용한다. 상태 전용 갱신은 벌크 쿼리를 사용한다.
    public void markIndexing() {
        this.indexStatus = IndexStatus.INDEXING;
        this.indexError = null;
        this.indexedAt = null;
    }
}
