package com.momo.backend;

import com.momo.backend.service.MovieService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import tools.jackson.databind.JsonNode;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class MovieServiceResponseValidationTest {

    @Autowired
    private MovieService movieService;

    @Test
    void acceptsDetailForRequestedMovieCode() {
        String json = """
                {"movieInfoResult":{"movieInfo":{
                  "movieCd":"20260001","movieNm":"테스트 영화",
                  "directors":[],"genres":[],"actors":[],"audits":[]
                }}}
                """;

        JsonNode detail = ReflectionTestUtils.invokeMethod(
                movieService, "readRequiredMovieDetail", json, "20260001");

        assertNotNull(detail);
        assertEquals("테스트 영화", detail.path("movieNm").asText());
    }

    @Test
    void rejectsDetailForDifferentMovieCode() {
        String json = """
                {"movieInfoResult":{"movieInfo":{
                  "movieCd":"20260002","movieNm":"다른 영화"
                }}}
                """;

        assertThrows(IllegalStateException.class, () ->
                ReflectionTestUtils.invokeMethod(
                        movieService, "readRequiredMovieDetail", json, "20260001"));
    }

    @Test
    void rejectsDetailWithoutRequiredTitle() {
        String json = """
                {"movieInfoResult":{"movieInfo":{"movieCd":"20260001"}}}
                """;

        assertThrows(IllegalStateException.class, () ->
                ReflectionTestUtils.invokeMethod(
                        movieService, "readRequiredMovieDetail", json, "20260001"));
    }

    @Test
    void rejectsMalformedOptionalArray() {
        String json = """
                {"movieInfoResult":{"movieInfo":{
                  "movieCd":"20260001","movieNm":"테스트 영화","genres":"드라마"
                }}}
                """;

        assertThrows(IllegalStateException.class, () ->
                ReflectionTestUtils.invokeMethod(
                        movieService, "readRequiredMovieDetail", json, "20260001"));
    }
}
