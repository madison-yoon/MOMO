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
        Operation publicMovieRating = new Operation();
        Operation privateMovieRatingWrite = new Operation();
        Operation publicSocialCallback = new Operation();
        Operation privateSocialDelete = new Operation();
        Operation privateLikedMovies = new Operation();

        OpenAPI api = new OpenAPI()
                .path("/api/reviews", new PathItem().get(publicReviews).post(privateReviewCreate))
                .path("/api/reviews/me", new PathItem().get(privateMyReviews))
                .path("/api/movies/{movieCode}/rating",
                        new PathItem().get(publicMovieRating).put(privateMovieRatingWrite))
                .path("/api/auth/{provider}", new PathItem().post(publicSocialCallback))
                .path("/api/auth/{provider}/delete/complete", new PathItem().post(privateSocialDelete))
                .path("/api/movies/my/liked", new PathItem().get(privateLikedMovies));

        new OpenApiConfig().securityPerOperationCustomizer().customise(api);

        assertTrue(publicReviews.getSecurity().isEmpty());
        assertFalse(privateReviewCreate.getSecurity().isEmpty());
        assertFalse(privateMyReviews.getSecurity().isEmpty());
        assertTrue(publicMovieRating.getSecurity().isEmpty());
        assertFalse(privateMovieRatingWrite.getSecurity().isEmpty());
        assertTrue(publicSocialCallback.getSecurity().isEmpty());
        assertFalse(privateSocialDelete.getSecurity().isEmpty());
        assertFalse(privateLikedMovies.getSecurity().isEmpty());
    }
}
