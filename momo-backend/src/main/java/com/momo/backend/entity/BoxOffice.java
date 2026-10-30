package com.momo.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 날짜별 박스오피스 순위와 포스터 정보를 DB에 저장
@Entity
@Getter
@NoArgsConstructor
@Table(
        name = "box_offices",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"target_date", "movie_code"}
        )
)
public class BoxOffice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 박스오피스 기준 날짜 (yyyyMMdd)
    @Column(name = "target_date", nullable = false, length = 8)
    private String targetDate;

    // KOBIS 영화 코드
    @Column(name = "movie_code", nullable = false, length = 20)
    private String movieCode;

    // 날짜별 박스오피스 정보
    @Column(name = "ranking")
    private int rank;
    private String title;
    private String releaseDate;
    private String audienceCount;
    private String totalAudience;

    // KMDb 포스터 주소
    @Column(columnDefinition = "TEXT")
    private String posterUrl;

    // 조회한 박스오피스 데이터로 객체 생성
    public BoxOffice(String targetDate, String movieCode, int rank,
                     String title, String releaseDate,
                     String audienceCount, String totalAudience,
                     String posterUrl) {

        this.targetDate = targetDate;
        this.movieCode = movieCode;
        this.rank = rank;
        this.title = title;
        this.releaseDate = releaseDate;
        this.audienceCount = audienceCount;
        this.totalAudience = totalAudience;
        this.posterUrl = posterUrl;
    }
}