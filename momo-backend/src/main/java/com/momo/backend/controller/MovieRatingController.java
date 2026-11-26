package com.momo.backend.controller;

import com.momo.backend.service.MovieRatingService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.momo.backend.security.MemberPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieRatingController {

        private final MovieRatingService movieRatingService;

        @GetMapping("/my/liked")
        public ResponseEntity<java.util.List<Map<String, Object>>> getMyLikedMovies(
                        Authentication authentication) {
                Long userId = MemberPrincipal.optionalUserId(authentication);

                return ResponseEntity.ok(
                                movieRatingService.getMyLikedMovies(userId));
        }

        @GetMapping("/{movieCode:[A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9]}/rating")
        public ResponseEntity<Map<String, Object>> getMovieRating(
                        @PathVariable String movieCode,
                        Authentication authentication) {

                Long userId = MemberPrincipal.optionalUserId(authentication);

                Map<String, Object> result = movieRatingService.getMovieRating(
                                movieCode,
                                userId);

                return ResponseEntity.ok(result);
        }

        @PutMapping("/{movieCode:[A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9]}/rating")
        public ResponseEntity<Void> saveMovieRating(
                        @PathVariable String movieCode,
                        @RequestBody Boolean liked,
                        Authentication authentication) {

                movieRatingService.saveRating(
                                MemberPrincipal.requireUserId(authentication),
                                movieCode,
                                liked);

                return ResponseEntity.ok().build();
        }

        @DeleteMapping("/{movieCode:[A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9]}/rating")
        public ResponseEntity<Void> deleteMovieRating(
                        @PathVariable String movieCode,
                        Authentication authentication) {

                movieRatingService.deleteRating(
                                MemberPrincipal.requireUserId(authentication),
                                movieCode);

                return ResponseEntity.noContent().build();
        }
}
