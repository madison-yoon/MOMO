package com.momo.backend.service;

import com.momo.backend.entity.Movie;
import com.momo.backend.repository.MovieRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

/** 격리된 H2에서 잘못된 PK 후보 제외와 기존 보완 조건을 검증한다. 실제 MySQL은 사용하지 않는다. */
@DataJpaTest(showSql = false, properties = {
    "spring.datasource.url=jdbc:h2:mem:metadata-candidates;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
    "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MovieMetadataRepositoryTest {
    @Autowired MovieRepository movies;

    @Test void firstCandidateSkipsEmptySpacesAndControlWhitespace() {
        for (String code : List.of("", "   ", "\t", "\r\n", " \t ", "\u3000")) save(code, null);
        save("20260001", null);
        save("20260002", null);
        var candidates = movies.findMoviesNeedingMetadata(LocalDateTime.now().minusHours(6), PageRequest.of(0, 1));
        assertEquals(List.of("20260001"), candidates.stream().map(Movie::getMovieCode).toList());
    }

    @Test void sixHourCutoffAndMissingDetailsRemainRequired() {
        LocalDateTime cutoff = LocalDateTime.of(2026, 11, 23, 6, 0);
        save("20260001", cutoff.plusSeconds(1));
        save("20260002", cutoff);
        save("20260003", cutoff.minusSeconds(1));
        save("20260004", null);
        movies.saveAndFlush(new Movie("20260005", "완료 영화", "Title", "20260101", "120",
                "드라마", "감독", "배우", "전체"));
        var candidates = movies.findMoviesNeedingMetadata(cutoff, PageRequest.of(0, 10));
        assertEquals(List.of("20260003", "20260004"), candidates.stream().map(Movie::getMovieCode).toList());
    }

    private void save(String code, LocalDateTime attemptedAt) {
        Movie movie = new Movie(code, "검증 영화", "", "", "", "", "", "", "");
        if (attemptedAt != null) movie.markKobisDetailAttempted(attemptedAt);
        movies.saveAndFlush(movie);
    }
}
