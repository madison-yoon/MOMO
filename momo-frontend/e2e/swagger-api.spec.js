/* Read-only Swagger/OpenAPI smoke check. Persistent DB CRUD is covered separately. */
const { test, expect } = require("@playwright/test");

const API = (process.env.MOMO_API_BASE_URL || "http://127.0.0.1:8111").replace(/\/$/, "");

const hasBearer = (operation) =>
  (operation?.security || []).some((requirement) =>
    Object.prototype.hasOwnProperty.call(requirement, "bearerAuth"),
  );

test("Swagger OpenAPI 보안 표시와 공개 리뷰 API Try it out을 확인한다", async ({ page, request }) => {
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

  const requiredPaths = [
    "/api/auth/signup",
    "/api/auth/login",
    "/api/auth/me",
    "/api/reviews",
    "/api/reviews/summaries",
    "/api/reviews/{reviewId}/comments",
    "/api/reviews/{reviewId}/reaction",
    "/api/reviews/{reviewId}/reactions",
    "/api/comments/{commentId}/reaction",
    "/api/comments/{commentId}/reactions",
    "/api/favorites",
    "/api/movies/posters/status",
    "/api/movies/catalog/status",
    "/api/rag/query",
    "/api/chat/images",
  ];

  requiredPaths.forEach((path) => {
    expect(spec.paths[path], `OpenAPI 경로 누락: ${path}`).toBeTruthy();
  });

  // Public reads must not request JWT; private writes and member-only reads must.
  expect(hasBearer(spec.paths["/api/reviews"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/reviews"].post)).toBe(true);
  expect(hasBearer(spec.paths["/api/reviews/summaries"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/reviews/{reviewId}/comments"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/reviews/{reviewId}/reaction"].get)).toBe(true);
  expect(hasBearer(spec.paths["/api/reviews/{reviewId}/reactions"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/comments/{commentId}/reactions"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/auth/me"].get)).toBe(true);
  expect(hasBearer(spec.paths["/api/auth/signup"].post)).toBe(false);

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
