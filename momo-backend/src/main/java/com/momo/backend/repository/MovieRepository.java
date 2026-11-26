package com.momo.backend.repository;

import com.momo.backend.entity.Movie;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, String> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Movie m where m.movieCode = :code")
    java.util.Optional<Movie> findForPosterWrite(@Param("code") String code);

    boolean existsByPosterUrl(String posterUrl);

    // 무결성 스케줄러가 검사한 파일 경로와 현재 DB 경로가 같을 때만 제거한다.
    // 검사와 복구 사이에 새 포스터가 저장된 경우 최신 경로를 덮어쓰지 않는다.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("""
            update Movie movie
               set movie.posterUrl = null, movie.rowVersion = movie.rowVersion + 1
             where movie.movieCode = :movieCode
               and movie.posterUrl = :expectedPosterUrl
            """)
    int clearPosterUrlIfMatches(
            @Param("movieCode") String movieCode,
            @Param("expectedPosterUrl") String expectedPosterUrl
    );


    List<Movie> findByBoxOfficeEnteredTrueOrderByBestBoxOfficeRankAscLastBoxOfficeDateDesc();

    // 로컬 포스터 무결성 점검은 영화 코드 커서 방식으로 조회해 누락 행이 제거되어도 건너뛰지 않는다.
    List<Movie> findTop100ByPosterUrlStartingWithOrderByMovieCodeAsc(String posterUrlPrefix);

    List<Movie> findTop100ByPosterUrlStartingWithAndMovieCodeGreaterThanOrderByMovieCodeAsc(
            String posterUrlPrefix,
            String afterMovieCode
    );


    // 후보를 먼저 좁힌 뒤 쉼표로 구분된 장르를 완전 일치로 비교한다.
    // 저장된 장르명 내부 공백은 유지하고 앞뒤 공백만 제거한다.
    @Query("""
            select distinct movie.genre from Movie movie
             where locate(lower(:genre), lower(movie.genre)) > 0
            """)
    List<String> findGenreValuesContaining(@Param("genre") String genre);

    default boolean existsByGenreToken(String genre) {
        return findGenreValuesContaining(genre).stream()
                .flatMap(value -> java.util.Arrays.stream(value.split(",")))
                .map(String::trim)
                .anyMatch(genre::equalsIgnoreCase);
    }

    Page<Movie> findByGenreContainingIgnoreCaseOrderByReleaseDateDescMovieCodeAsc(String genre, Pageable pageable);

    List<Movie> findByBoxOfficeEnteredTrueAndGenreContainingIgnoreCaseOrderByBestBoxOfficeRankAscLastBoxOfficeDateDesc(
            String genre
    );

    @Query("""
            select movie
              from Movie movie
             where movie.posterUrl like 'http%'
               and (movie.posterMigrationAttemptedAt is null
                 or movie.posterMigrationAttemptedAt < :retryBefore)
             order by movie.movieCode asc
            """)
    List<Movie> findMoviesNeedingPosterMigration(
            @Param("retryBefore") LocalDateTime retryBefore,
            Pageable pageable
    );

    // 일반 공백뿐 아니라 탭·개행·유니코드 구분자만 있는 코드도 배치 제한 전에 제외한다.
    @Query("""
            select movie
              from Movie movie
             where movie.movieCode is not null
               and function('regexp_like', movie.movieCode, '[^\\s\\p{Z}]') = true
               and (movie.titleEn is null or trim(movie.titleEn) = ''
                 or movie.releaseDate is null or trim(movie.releaseDate) = ''
                 or movie.showTime is null or trim(movie.showTime) = ''
                 or movie.genre is null or trim(movie.genre) = ''
                 or movie.director is null or trim(movie.director) = ''
                 or movie.actors is null or trim(movie.actors) = ''
                 or movie.watchGrade is null or trim(movie.watchGrade) = '')
               and (movie.kobisDetailAttemptedAt is null
                 or movie.kobisDetailAttemptedAt < :retryBefore)
             order by movie.movieCode asc
            """)
    List<Movie> findMoviesNeedingMetadata(
            @Param("retryBefore") LocalDateTime retryBefore,
            Pageable pageable
    );
}
