/* Read-only Swagger/OpenAPI smoke check. Persistent DB CRUD is covered separately. */
const { test, expect } = require("@playwright/test");

const API = (process.env.MOMO_API_BASE_URL || "http://127.0.0.1:8111").replace(/\/$/, "");

const hasBearer = (operation) =>
  (operation?.security || []).some((requirement) =>
    Object.prototype.hasOwnProperty.call(requirement, "bearerAuth"),
  );

// Paths and methods are taken from the actual controller mappings.
// The third value is the expected authentication requirement from SecurityConfig.
const expectedOperations = [
  ["POST", "/api/auth/signup", false],
  ["POST", "/api/auth/login", false],
  ["POST", "/api/auth/reissue", false],
  ["GET", "/api/auth/me", true],
  ["PUT", "/api/auth/me", true],
  ["DELETE", "/api/auth/me", true],
  ["DELETE", "/api/auth/me/social", true],
  ["POST", "/api/auth/logout", true],
  ["GET", "/api/auth/me/likes/count", true],
  ["GET", "/api/auth/exists/id/{loginId}", false],
  ["POST", "/api/auth/me/password-check", true],
  ["POST", "/api/auth/me/profile-image", true],
  ["DELETE", "/api/auth/me/profile-image", true],
  ["GET", "/api/auth/me/profile-image", true],
  ["GET", "/api/auth/users/{userId}/profile-image", false],

  ["GET", "/api/auth/{provider}/authorize", false],
  ["POST", "/api/auth/{provider}", false],
  ["POST", "/api/auth/{provider}/delete/authorize", true],
  ["POST", "/api/auth/{provider}/delete/complete", true],

  ["GET", "/api/reviews", false],
  ["POST", "/api/reviews", true],
  ["GET", "/api/reviews/{reviewId}", false],
  ["GET", "/api/reviews/me", true],
  ["GET", "/api/reviews/me/liked", true],
  ["GET", "/api/reviews/movie/{movieCode}", false],
  ["GET", "/api/reviews/summaries", false],
  ["PUT", "/api/reviews/{reviewId}", true],
  ["DELETE", "/api/reviews/{reviewId}", true],
  ["GET", "/api/reviews/{reviewId}/reaction", true],
  ["PUT", "/api/reviews/{reviewId}/reaction", true],
  ["DELETE", "/api/reviews/{reviewId}/reaction", true],
  ["GET", "/api/reviews/{reviewId}/reactions", false],

  ["GET", "/api/reviews/{reviewId}/comments", false],
  ["POST", "/api/reviews/{reviewId}/comments", true],
  ["PUT", "/api/comments/{commentId}", true],
  ["DELETE", "/api/comments/{commentId}", true],
  ["GET", "/api/comments/{commentId}/reactions", false],
  ["PUT", "/api/comments/{commentId}/reaction", true],
  ["DELETE", "/api/comments/{commentId}/reaction", true],

  ["GET", "/api/favorites", true],
  ["POST", "/api/favorites", true],
  ["DELETE", "/api/favorites/{movieCode}", true],

  ["GET", "/api/movies/my/liked", true],
  ["GET", "/api/movies/{movieCode}/rating", false],
  ["PUT", "/api/movies/{movieCode}/rating", true],
  ["DELETE", "/api/movies/{movieCode}/rating", true],
  ["GET", "/api/movies/{movieCode}/poster", false],
  ["POST", "/api/movies/posters/status", false],
  ["POST", "/api/movies/posters/ensure", false],
  ["GET", "/api/movies/catalog/status", false],
  ["GET", "/api/movies/catalog/budget", false],
  ["GET", "/api/movies/recommendations", false],
  ["GET", "/api/movies/search", false],
  ["GET", "/api/movies/resolve/{identifier}", false],
  ["GET", "/api/movies/tmdb/{tmdbId}", false],
  ["GET", "/api/movies/{movieCode}/reviews", false],
  ["GET", "/api/movies/{movieCode}/people", false],
  ["GET", "/api/movies/{movieCode}", false],
  ["GET", "/api/movies/genre", false],
  ["GET", "/api/boxoffice/daily", false],
  ["GET", "/api/persons/filmography/{tmdbId}", false],
  ["GET", "/api/persons/by-id/{type}/{personId}", false],
  ["GET", "/api/persons/{type}/{name}", false],

  ["POST", "/api/rag/query", true],
  ["POST", "/api/rag/reindex/{reviewId}", true],
  ["POST", "/api/rag/reindex/all", true],
  ["POST", "/api/chat/images", true],
  ["GET", "/api/chat/images/{imageId}", true],
];

test("Swagger OpenAPI의 컨트롤러 경로·HTTP 메서드·Bearer 보안 표시를 검증한다", async ({ page, request }) => {
  test.setTimeout(60000);

  const specResponse = await request.get(`${API}/v3/api-docs`);
  expect(specResponse.status()).toBe(200);

  const spec = await specResponse.json();
  expect(spec.openapi).toMatch(/^3\./);
  expect(spec.components.securitySchemes.bearerAuth).toMatchObject({
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });
  // A global Bearer requirement would incorrectly mark public operations as protected.
  expect(spec.security || []).toEqual([]);

  for (const [method, path, requiresBearer] of expectedOperations) {
    const operation = spec.paths[path]?.[method.toLowerCase()];
    expect(operation, `Swagger 경로/메서드 누락: ${method} ${path}`).toBeTruthy();
    expect(
      hasBearer(operation),
      `Swagger 인증 표시 불일치: ${method} ${path} (expected Bearer: ${requiresBearer})`,
    ).toBe(requiresBearer);
  }

  const swagger = await page.goto(`${API}/swagger-ui/index.html`);
  expect(swagger?.status()).toBe(200);
  await expect(page.locator(".swagger-ui").first()).toBeVisible();

  // Execute a read-only public API through Swagger's own Try it out UI.
  const reviewsOperation = page.locator(".opblock-get").filter({
    has: page.locator(".opblock-summary-path").filter({
      hasText: /^\/api\/reviews$/,
    }),
  });

  await expect(reviewsOperation).toHaveCount(1);
  await reviewsOperation.locator(".opblock-summary").click();
  await reviewsOperation.locator("button.try-out__btn").click();
  await reviewsOperation.locator("button.execute").click();
  await expect(reviewsOperation.locator(".responses-wrapper")).toContainText("200");
});
