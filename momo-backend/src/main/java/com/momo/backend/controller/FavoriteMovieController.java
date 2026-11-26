package com.momo.backend.controller;

import com.momo.backend.dto.favorite.FavoriteMovieRequest;
import com.momo.backend.dto.favorite.FavoriteMovieResponse;
import com.momo.backend.service.FavoriteMovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.momo.backend.security.MemberPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteMovieController {

    private final FavoriteMovieService favoriteMovieService;

    @GetMapping
    public ResponseEntity<List<FavoriteMovieResponse>> getFavorites(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                favoriteMovieService.getFavorites(MemberPrincipal.requireUserId(authentication))
        );
    }

    @PostMapping
    public ResponseEntity<FavoriteMovieResponse> addFavorite(
            @Valid @RequestBody FavoriteMovieRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                favoriteMovieService.addFavorite(MemberPrincipal.requireUserId(authentication), request)
        );
    }

    @DeleteMapping("/{movieCode}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable String movieCode,
            Authentication authentication
    ) {
        favoriteMovieService.removeFavorite(MemberPrincipal.requireUserId(authentication), movieCode);
        return ResponseEntity.noContent().build();
    }
}
