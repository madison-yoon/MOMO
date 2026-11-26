package com.momo.backend.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OpenApiConfigTest {

    @Test
    void registersBearerSchemeWithoutApplyingItGlobally() {
        SecurityScheme scheme = OpenApiConfig.class.getAnnotation(SecurityScheme.class);

        assertNotNull(scheme);
        assertEquals(OpenApiConfig.BEARER_AUTH, scheme.name());
        assertEquals(SecuritySchemeType.HTTP, scheme.type());
        assertEquals("bearer", scheme.scheme());
        assertEquals("JWT", scheme.bearerFormat());
    }

    @Test
    void documentsPublicAndAuthenticatedOperationsAccordingToSecurityRules() {
        Operation publicReviews = new Operation();
        Operation privateReviewCreate = new Operation();
        Operation privateMyReviews = new Operation();
        Operation publicReviewSummaries = new Operation();
        Operation publicMovieRating = new Operation();
        Operation privateMovieRatingWrite = new Operation();
        Operation publicSocialCallback = new Operation();
        Operation privateSocialDelete = new Operation();
        Operation privateLikedMovies = new Operation();
        Operation publicReactionCounts = new Operation();
        Operation privateMyReaction = new Operation();
        Operation publicCommentCounts = new Operation();
        Operation privateMe = new Operation();

        OpenAPI api = new OpenAPI()
                .path("/api/reviews", new PathItem().get(publicReviews).post(privateReviewCreate))
                .path("/api/reviews/me", new PathItem().get(privateMyReviews))
                .path("/api/reviews/summaries", new PathItem().get(publicReviewSummaries))
                .path("/api/reviews/{reviewId}/reactions", new PathItem().get(publicReactionCounts))
                .path("/api/reviews/{reviewId}/reaction", new PathItem().get(privateMyReaction))
                .path("/api/comments/{commentId}/reactions", new PathItem().get(publicCommentCounts))
                .path("/api/movies/{movieCode}/rating",
                        new PathItem().get(publicMovieRating).put(privateMovieRatingWrite))
                .path("/api/auth/{provider}", new PathItem().post(publicSocialCallback))
                .path("/api/auth/{provider}/delete/complete", new PathItem().post(privateSocialDelete))
                .path("/api/auth/me", new PathItem().get(privateMe))
                .path("/api/movies/my/liked", new PathItem().get(privateLikedMovies));

        new OpenApiConfig().securityPerOperationCustomizer().customise(api);

        assertTrue(publicReviews.getSecurity().isEmpty());
        assertFalse(privateReviewCreate.getSecurity().isEmpty());
        assertFalse(privateMyReviews.getSecurity().isEmpty());
        assertTrue(publicReviewSummaries.getSecurity().isEmpty());
        assertTrue(publicMovieRating.getSecurity().isEmpty());
        assertFalse(privateMovieRatingWrite.getSecurity().isEmpty());
        assertTrue(publicSocialCallback.getSecurity().isEmpty());
        assertFalse(privateSocialDelete.getSecurity().isEmpty());
        assertFalse(privateLikedMovies.getSecurity().isEmpty());
        assertTrue(publicReactionCounts.getSecurity().isEmpty());
        assertFalse(privateMyReaction.getSecurity().isEmpty());
        assertTrue(publicCommentCounts.getSecurity().isEmpty());
        assertFalse(privateMe.getSecurity().isEmpty());
    }

    @Test
    void keepsSwaggerPublicOnlyForTheExactSecurityConfigReviewMatchers() {
        OpenApiConfig config = new OpenApiConfig();

        assertFalse(config.requiresAuthentication("/api/reviews", "GET"));
        assertFalse(config.requiresAuthentication("/api/reviews/summaries", "GET"));
        assertFalse(config.requiresAuthentication("/api/reviews/{reviewId}", "GET"));
        assertFalse(config.requiresAuthentication("/api/reviews/{reviewId}/comments", "GET"));
        assertFalse(config.requiresAuthentication("/api/reviews/{reviewId}/reactions", "GET"));
        assertFalse(config.requiresAuthentication("/api/reviews/movie/{movieCode}", "GET"));
        assertFalse(config.requiresAuthentication("/api/comments/{commentId}/reactions", "GET"));

        assertTrue(config.requiresAuthentication("/api/reviews/{reviewId}/reaction", "GET"));
        assertTrue(config.requiresAuthentication("/api/reviews/{reviewId}/comments", "POST"));
        assertTrue(config.requiresAuthentication("/api/reviews/{reviewId}", "PUT"));
        assertTrue(config.requiresAuthentication("/api/reviews/{reviewId}", "DELETE"));
        assertTrue(config.requiresAuthentication("/api/auth/me", "GET"));
        assertTrue(config.requiresAuthentication("/api/auth/me/password-check", "POST"));
    }
}
