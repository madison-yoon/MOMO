package com.momo.backend.service;

import com.momo.backend.client.KobisApiClient;
import com.momo.backend.client.KmdbApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.momo.backend.dto.movie.MovieSearchResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import com.momo.backend.dto.movie.MovieDetailResponse;
import java.util.stream.StreamSupport;
import com.momo.backend.dto.movie.BoxOfficeResponse;
import com.momo.backend.entity.Movie;
import com.momo.backend.repository.MovieRepository;


@Service
@RequiredArgsConstructor
public class MovieService {

    private final KobisApiClient kobisApiClient;
    private final KmdbApiClient kmdbApiClient;
    private final ObjectMapper objectMapper;

    // 영화 기본정보 DB 조회 및 저장
    private final MovieRepository movieRepository;

    // 영화 제목으로 KOBIS 영화 목록 검색
//    public String searchMovies(String keyword) {
//        return kobisApiClient.searchMovies(keyword);
//    }

    // 영화 검색 결과를 DTO 목록으로 변환
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


    // 영화 코드로 상세정보 조회
//    public String getMovieDetail(String movieCode) {
//        return kobisApiClient.getMovieDetail(movieCode);
//    }

    // 영화 상세정보를 DTO로 변환
    public MovieDetailResponse getMovieDetail(String movieCode) {

        // DB에 저장된 영화 정보가 있는지 먼저 확인
        Movie savedMovie = movieRepository.findById(movieCode).orElse(null);

        if(savedMovie != null){

            // DB에 저장된 배우 문자열을 목록으로 변환
            List<String> actors = new ArrayList<>();

            if (savedMovie.getActors() != null && !savedMovie.getActors().isBlank())
            {
                actors = Arrays.asList(savedMovie.getActors().split(","));
            }

            // DB에 영화 정보가 있으면 외부 API를 호출하지 않고 반환
            return  new MovieDetailResponse(
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

        // DB에 영화 정보가 없을 때만 KOBIS API 호출
        String json = kobisApiClient.getMovieDetail(movieCode);

        try {
            JsonNode movie = objectMapper.readTree(json)
                    .path("movieInfoResult")
                    .path("movieInfo");

            // 감독 정보
            String director = "";
            JsonNode directors = movie.path("directors");

            if (directors.isArray() && !directors.isEmpty()) {
                director = directors.get(0).path("peopleNm").asText("");
            }

            // 장르 정보
            String genre = StreamSupport.stream(
                            movie.path("genres").spliterator(), false)
                    .map(node -> node.path("genreNm").asText(""))
                    .filter(name -> !name.isBlank())
                    .reduce((a, b) -> a + "," + b)
                    .orElse("");

            // 출연 배우 목록
            List<String> actors = new ArrayList<>();

            for (JsonNode actor : movie.path("actors")) {
                String name = actor.path("peopleNm").asText("");

                if (!name.isBlank()) {
                    actors.add(name);
                }
                if (actors.size() >=10) {
                    break;
                    // 출연 배우는 최대 10명까지만 저장
                }
            }

            // 관람등급
            String watchGrade = "";
            JsonNode audits = movie.path("audits");

            if (audits.isArray() && !audits.isEmpty()) {
                watchGrade = audits.get(0).path("watchGradeNm").asText("");
            }

            // KOBIS에서 가져온 영화 기본정보를 DB에 저장
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
//    public String getDailyBoxOffice(String targetDate) {
//        return kobisApiClient.getDailyBoxOffice(targetDate);
//    }
    // 일별 박스오피스 결과를 DTO 목록으로 변환
    public List<BoxOfficeResponse> getDailyBoxOffice(String targetDate) {

        String json = kobisApiClient.getDailyBoxOffice(targetDate);
        List<BoxOfficeResponse> movies = new ArrayList<>();

        try {
            JsonNode boxOfficeList = objectMapper.readTree(json)
                    .path("boxOfficeResult")
                    .path("dailyBoxOfficeList");

            for (JsonNode movie : boxOfficeList) {

                String title = movie.path("movieNm").asText("");
                String posterUrl = getPosterUrl(title);

                movies.add(new BoxOfficeResponse(
                        movie.path("rank").asInt(),
                        movie.path("movieCd").asText(""),
                        title,
                        movie.path("openDt").asText(""),
                        movie.path("audiCnt").asText(""),
                        movie.path("audiAcc").asText(""),
                        posterUrl
                ));
            }

        } catch (Exception e) {
            throw new IllegalStateException("박스오피스 결과를 처리하지 못했습니다.", e);
        }

        return movies;
    }

    // KMDb에서 영화 포스터 주소 조회
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

            // 포스터 주소가 여러 개면 첫 번째 주소 사용
            return posters.split("\\|")[0];

        } catch (Exception e) {
            return "";
        }
    }

}