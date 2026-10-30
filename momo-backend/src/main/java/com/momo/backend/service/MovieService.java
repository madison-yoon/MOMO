
package com.momo.backend.service;

import com.momo.backend.client.KobisApiClient;
import com.momo.backend.client.KmdbApiClient;
import com.momo.backend.dto.movie.BoxOfficeResponse;
import com.momo.backend.dto.movie.MovieDetailResponse;
import com.momo.backend.dto.movie.MovieSearchResponse;
import com.momo.backend.entity.BoxOffice;
import com.momo.backend.entity.Movie;
import com.momo.backend.repository.BoxOfficeRepository;
import com.momo.backend.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final KobisApiClient kobisApiClient;
    private final KmdbApiClient kmdbApiClient;
    private final ObjectMapper objectMapper;

    // 영화 및 박스오피스 DB
    private final MovieRepository movieRepository;
    private final BoxOfficeRepository boxOfficeRepository;

    // 영화 제목으로 검색
    public List<MovieSearchResponse> searchMovies(String keyword) {

        String json = kobisApiClient.searchMovies(keyword);
        List<MovieSearchResponse> movies = new ArrayList<>();

        try {
            JsonNode movieList = objectMapper.readTree(json)
                    .path("movieListResult")
                    .path("movieList");

            for (JsonNode movie : movieList) {

                String director = "";

                JsonNode directors = movie.path("directors");
                if (directors.isArray() && !directors.isEmpty()) {
                    director = directors.get(0).path("peopleNm").asText("");
                }

                movies.add(new MovieSearchResponse(
                        movie.path("movieCd").asText(""),
                        movie.path("movieNm").asText(""),
                        movie.path("openDt").asText(""),
                        movie.path("genreAlt").asText(""),
                        director
                ));
            }

        } catch (Exception e) {
            throw new IllegalStateException("영화 검색 결과를 처리하지 못했습니다.", e);
        }

        return movies;
    }

    // 영화 상세정보 조회
    public MovieDetailResponse getMovieDetail(String movieCode) {

        // 저장된 영화가 있으면 DB에서 조회
        Movie savedMovie = movieRepository.findById(movieCode).orElse(null);

        if (savedMovie != null) {

            List<String> actors = new ArrayList<>();

            if (savedMovie.getActors() != null && !savedMovie.getActors().isBlank()) {
                actors = Arrays.asList(savedMovie.getActors().split(","));
            }

            return new MovieDetailResponse(
                    savedMovie.getMovieCode(),
                    savedMovie.getTitle(),
                    savedMovie.getTitleEn(),
                    savedMovie.getReleaseDate(),
                    savedMovie.getShowTime(),
                    savedMovie.getGenre(),
                    savedMovie.getDirector(),
                    actors,
                    savedMovie.getWatchGrade()
            );
        }

        // DB에 없으면 KOBIS에서 조회
        String json = kobisApiClient.getMovieDetail(movieCode);

        try {
            JsonNode movie = objectMapper.readTree(json)
                    .path("movieInfoResult")
                    .path("movieInfo");

            // 영화 정보가 없는 경우 저장하지 않음
            if (movie.isMissingNode() || movie.isNull()
                    || movie.path("movieCd").asText("").isBlank()) {
                throw new IllegalStateException("해당 영화 정보를 찾을 수 없습니다.");
            }

            // 감독
            String director = "";
            JsonNode directors = movie.path("directors");

            if (directors.isArray() && !directors.isEmpty()) {
                director = directors.get(0).path("peopleNm").asText("");
            }

            // 장르
            String genre = StreamSupport.stream(
                            movie.path("genres").spliterator(), false)
                    .map(node -> node.path("genreNm").asText(""))
                    .filter(name -> !name.isBlank())
                    .reduce((a, b) -> a + "," + b)
                    .orElse("");

            // 배우는 최대 10명까지 저장
            List<String> actors = new ArrayList<>();

            for (JsonNode actor : movie.path("actors")) {
                String name = actor.path("peopleNm").asText("");

                if (!name.isBlank()) {
                    actors.add(name);
                }

                if (actors.size() >= 10) {
                    break;
                }
            }

            // 관람등급
            String watchGrade = "";
            JsonNode audits = movie.path("audits");

            if (audits.isArray() && !audits.isEmpty()) {
                watchGrade = audits.get(0).path("watchGradeNm").asText("");
            }

            // 조회한 영화 정보를 DB에 저장
            Movie newMovie = new Movie(
                    movie.path("movieCd").asText(""),
                    movie.path("movieNm").asText(""),
                    movie.path("movieNmEn").asText(""),
                    movie.path("openDt").asText(""),
                    movie.path("showTm").asText(""),
                    genre,
                    director,
                    String.join(",", actors),
                    watchGrade
            );

            movieRepository.save(newMovie);

            return new MovieDetailResponse(
                    movie.path("movieCd").asText(""),
                    movie.path("movieNm").asText(""),
                    movie.path("movieNmEn").asText(""),
                    movie.path("openDt").asText(""),
                    movie.path("showTm").asText(""),
                    genre,
                    director,
                    actors,
                    watchGrade
            );

        } catch (Exception e) {
            throw new IllegalStateException("영화 상세정보를 처리하지 못했습니다.", e);
        }
    }

    // 날짜별 박스오피스 조회
    public List<BoxOfficeResponse> getDailyBoxOffice(String targetDate) {

        // 해당 날짜의 데이터가 DB에 있는지 확인
        List<BoxOffice> savedMovies =
                boxOfficeRepository.findByTargetDateOrderByRankAsc(targetDate);

        if (!savedMovies.isEmpty()) {

            List<BoxOfficeResponse> movies = new ArrayList<>();

            for (BoxOffice movie : savedMovies) {
                movies.add(new BoxOfficeResponse(
                        movie.getRank(),
                        movie.getMovieCode(),
                        movie.getTitle(),
                        movie.getReleaseDate(),
                        movie.getAudienceCount(),
                        movie.getTotalAudience(),
                        movie.getPosterUrl()
                ));
            }

            return movies;
        }

        // DB에 없으면 KOBIS에서 조회
        String json = kobisApiClient.getDailyBoxOffice(targetDate);

        List<BoxOfficeResponse> movies = new ArrayList<>();
        List<BoxOffice> boxOffices = new ArrayList<>();

        try {
            JsonNode boxOfficeList = objectMapper.readTree(json)
                    .path("boxOfficeResult")
                    .path("dailyBoxOfficeList");

            // API 응답에 박스오피스 목록이 없는 경우
            if (!boxOfficeList.isArray()) {
                throw new IllegalStateException("박스오피스 목록이 없습니다.");
            }

            for (JsonNode movie : boxOfficeList) {

                String title = movie.path("movieNm").asText("");
                String movieCode = movie.path("movieCd").asText("");

                // 영화 코드가 없는 데이터는 저장하지 않음
                if (movieCode.isBlank()) {
                    continue;
                }

                String posterUrl = getPosterUrl(title);

                int rank = movie.path("rank").asInt();
                String releaseDate = movie.path("openDt").asText("");
                String audienceCount = movie.path("audiCnt").asText("");
                String totalAudience = movie.path("audiAcc").asText("");

                // 화면에 전달할 데이터
                movies.add(new BoxOfficeResponse(
                        rank,
                        movieCode,
                        title,
                        releaseDate,
                        audienceCount,
                        totalAudience,
                        posterUrl
                ));

                // DB에 저장할 데이터
                boxOffices.add(new BoxOffice(
                        targetDate,
                        movieCode,
                        rank,
                        title,
                        releaseDate,
                        audienceCount,
                        totalAudience,
                        posterUrl
                ));
            }

            // 조회한 박스오피스 저장
            if (!boxOffices.isEmpty()) {
                boxOfficeRepository.saveAll(boxOffices);
            }

        } catch (Exception e) {
            throw new IllegalStateException("박스오피스 결과를 처리하지 못했습니다.", e);
        }

        return movies;
    }

    // KMDb에서 포스터 주소 조회
    private String getPosterUrl(String title) {

        String json = kmdbApiClient.searchMovie(title);

        try {
            JsonNode data = objectMapper.readTree(json)
                    .path("Data");

            if (!data.isArray() || data.isEmpty()) {
                return "";
            }

            JsonNode results = data.get(0).path("Result");

            if (!results.isArray() || results.isEmpty()) {
                return "";
            }

            String posters = results.get(0)
                    .path("posters")
                    .asText("");

            if (posters.isBlank()) {
                return "";
            }

            // 포스터가 여러 개면 첫 번째 주소 사용
            return posters.split("\\|")[0];

        } catch (Exception e) {
            return "";
        }
    }
}
