package com.momo.backend.service;

import com.momo.backend.entity.Movie;
import java.time.LocalDateTime;

/** 포스터·박스오피스 상태를 제외하고 정보 보완 결과만 전달하는 불변 값이다. */
public record MovieDetailUpdate(String movieCode, String title, String titleEn, String releaseDate,
        String showTime, String genre, String director, String actors, String watchGrade,
        String overview, String sources, boolean supplementVerified, LocalDateTime overviewAttemptedAt,
        LocalDateTime supplementAttemptedAt, LocalDateTime kobisDetailAttemptedAt) {
    public static MovieDetailUpdate from(Movie m) {
        return new MovieDetailUpdate(m.getMovieCode(), m.getTitle(), m.getTitleEn(), m.getReleaseDate(),
                m.getShowTime(), m.getGenre(), m.getDirector(), m.getActors(), m.getWatchGrade(),
                m.getOverview(), m.getSupplementSources(), m.isSupplementVerified(), m.getOverviewAttemptedAt(),
                m.getSupplementAttemptedAt(), m.getKobisDetailAttemptedAt());
    }
    Movie create() {
        Movie movie = new Movie(movieCode, title, titleEn, releaseDate, showTime, genre, director, actors, watchGrade);
        movie.initializeSupplementState(supplementVerified, sources);
        return movie;
    }
    void apply(Movie m) {
        m.supplementMissingDetails(titleEn, releaseDate, showTime, genre, director, actors, watchGrade, sources);
        m.updateOverview(overview);
        m.markOverviewAttempted(overviewAttemptedAt);
        m.markSupplementAttempted(supplementAttemptedAt);
        m.markKobisDetailAttempted(kobisDetailAttemptedAt);
    }
}
