/* Swagger/OpenAPI와 실제 REST 계약을 MySQL 기반 일회용 E2E 환경에서 검증한다. */
const { test, expect } = require("@playwright/test");

const API = "http://127.0.0.1:8111";

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

test("Swagger UI Try it out과 인증·리뷰·댓글·반응·관심 영화 API를 검증한다", async ({ page, request }) => {
  test.setTimeout(90000);

  // 1. Swagger UI와 OpenAPI 문서 자체를 먼저 검증한다.
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
    "/api/reviews/{reviewId}/comments",
    "/api/reviews/{reviewId}/reaction",
    "/api/comments/{commentId}/reaction",
    "/api/favorites",
    "/api/movies/posters/status",
    "/api/movies/catalog/status",
    "/api/rag/query",
    "/api/chat/images",
  ];
  for (const path of requiredPaths) {
    expect(spec.paths[path], `OpenAPI path 누락: ${path}`).toBeTruthy();
  }

  const swaggerPage = await page.goto(`${API}/swagger-ui/index.html`);
  expect(swaggerPage?.status()).toBe(200);
  await expect(page.locator(".swagger-ui")).toBeVisible();

  // 브라우저의 Swagger "Try it out"으로 공개 리뷰 목록 API를 실제 호출한다.
  const reviewsOperation = page
    .locator(".opblock-get")
    .filter({
      has: page.locator(".opblock-summary-path").filter({
        hasText: /^\/api\/reviews$/,
      }),
    });

  await expect(reviewsOperation).toHaveCount(1);
  await reviewsOperation.locator(".opblock-summary").click();
  await reviewsOperation.locator("button.try-out__btn").click();
  await reviewsOperation.locator("button.execute").click();
  await expect(reviewsOperation.locator(".response-col_status")).toHaveText("200");

  // 2. 테스트 전용 회원을 만들고 JWT 인증을 확인한다.
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const loginId = `swg${suffix.slice(0, 12)}`;
  const nickname = `S${suffix.slice(0, 7)}`;
  const email = `${loginId}@example.com`;
  const password = "MomoSwagger1!";
  const movieCode = `M${suffix.slice(0, 7)}`.toUpperCase();

  let accessToken = null;
  let refreshToken = null;
  let accountDeleted = false;
  let reviewId = null;

  try {
    const anonymousMe = await request.get(`${API}/api/auth/me`);
    expect(anonymousMe.status()).toBe(401);

    const signup = await request.post(`${API}/api/auth/signup`, {
      data: { loginId, password, nickname, email },
    });
    expect(signup.status()).toBe(201);

    const login = await request.post(`${API}/api/auth/login`, {
      data: { loginId, password },
    });
    expect(login.status()).toBe(200);

    const loginData = await login.json();
    accessToken = loginData.accessToken;
    refreshToken = loginData.refreshToken;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const headers = authHeaders(accessToken);

    const me = await request.get(`${API}/api/auth/me`, { headers });
    expect(me.status()).toBe(200);
    expect((await me.json()).loginId).toBe(loginId);

    const idCheck = await request.get(
      `${API}/api/auth/exists/id/${encodeURIComponent(loginId)}`,
    );
    expect(idCheck.status()).toBe(200);
    expect(await idCheck.json()).toBe(true);

    const passwordCheck = await request.post(`${API}/api/auth/me/password-check`, {
      headers,
      data: { currentPassword: password },
    });
    expect(passwordCheck.status()).toBe(200);
    expect(await passwordCheck.json()).toBe(true);

    // 3. 영화 코드·리뷰 제목·본문을 테스트용 값으로 만들어 리뷰 CRUD를 확인한다.
    const createReview = await request.post(`${API}/api/reviews`, {
      headers,
      data: {
        movieCode,
        title: "Swagger 임시 리뷰",
        content: "일회성 테스트 데이터입니다. 테스트 종료 시 삭제합니다.",
      },
    });
    expect(createReview.status()).toBe(201);
    const createdReview = await createReview.json();
    reviewId = createdReview.reviewId;
    expect(reviewId).toBeTruthy();

    const duplicateReview = await request.post(`${API}/api/reviews`, {
      headers,
      data: {
        movieCode,
        title: "중복 리뷰",
        content: "동일 회원·영화의 중복 리뷰는 허용되면 안 됩니다.",
      },
    });
    expect(duplicateReview.status()).toBe(409);

    const reviewDetail = await request.get(`${API}/api/reviews/${reviewId}`);
    expect(reviewDetail.status()).toBe(200);
    expect((await reviewDetail.json()).title).toBe("Swagger 임시 리뷰");

    const updateReview = await request.put(`${API}/api/reviews/${reviewId}`, {
      headers,
      data: {
        title: "Swagger 수정 리뷰",
        content: "수정 API가 실제 DB 데이터에 반영되는지 확인합니다.",
      },
    });
    expect(updateReview.status()).toBe(200);
    expect((await updateReview.json()).title).toBe("Swagger 수정 리뷰");

    const allReviews = await request.get(
      `${API}/api/reviews?page=0&searchType=ALL&keyword=Swagger`,
    );
    expect(allReviews.status()).toBe(200);

    const myReviews = await request.get(`${API}/api/reviews/me?page=0`, { headers });
    expect(myReviews.status()).toBe(200);

    const movieReviews = await request.get(
      `${API}/api/reviews/movie/${movieCode}?page=0`,
    );
    expect(movieReviews.status()).toBe(200);

    const likedReviews = await request.get(
      `${API}/api/reviews/me/liked?page=0`,
      { headers },
    );
    expect(likedReviews.status()).toBe(200);

    const summaries = await request.get(
      `${API}/api/reviews/summaries?reviewIds=${reviewId}`,
    );
    expect(summaries.status()).toBe(200);
    expect((await summaries.json())[0].reviewId).toBe(reviewId);

    // 4. 리뷰 좋아요 등록·조회·집계·취소를 확인한다.
    const reviewReaction = await request.put(
      `${API}/api/reviews/${reviewId}/reaction`,
      { headers, data: true },
    );
    expect(reviewReaction.status()).toBe(200);

    const myReviewReaction = await request.get(
      `${API}/api/reviews/${reviewId}/reaction`,
      { headers },
    );
    expect(myReviewReaction.status()).toBe(200);
    expect(await myReviewReaction.json()).toBe(true);

    const reviewReactionCounts = await request.get(
      `${API}/api/reviews/${reviewId}/reactions`,
    );
    expect(reviewReactionCounts.status()).toBe(200);
    expect((await reviewReactionCounts.json()).likeCount).toBe(1);

    const removeReviewReaction = await request.delete(
      `${API}/api/reviews/${reviewId}/reaction`,
      { headers },
    );
    expect(removeReviewReaction.status()).toBe(204);

    // 5. 댓글 작성·조회·수정과 댓글 반응을 검증한다.
    const createComment = await request.post(
      `${API}/api/reviews/${reviewId}/comments`,
      { headers, data: { content: "Swagger 임시 댓글" } },
    );
    expect(createComment.status()).toBe(201);
    const commentId = (await createComment.json()).commentId;
    expect(commentId).toBeTruthy();

    const comments = await request.get(
      `${API}/api/reviews/${reviewId}/comments?page=0`,
    );
    expect(comments.status()).toBe(200);

    const updateComment = await request.put(
      `${API}/api/comments/${commentId}`,
      { headers, data: { content: "Swagger 수정 댓글" } },
    );
    expect(updateComment.status()).toBe(200);
    expect((await updateComment.json()).content).toBe("Swagger 수정 댓글");

    const commentReaction = await request.put(
      `${API}/api/comments/${commentId}/reaction`,
      { headers, data: true },
    );
    expect(commentReaction.status()).toBe(200);

    const commentReactionCounts = await request.get(
      `${API}/api/comments/${commentId}/reactions`,
    );
    expect(commentReactionCounts.status()).toBe(200);
    expect((await commentReactionCounts.json()).likeCount).toBe(1);

    const removeCommentReaction = await request.delete(
      `${API}/api/comments/${commentId}/reaction`,
      { headers },
    );
    expect(removeCommentReaction.status()).toBe(204);

    const removeComment = await request.delete(
      `${API}/api/comments/${commentId}`,
      { headers },
    );
    expect(removeComment.status()).toBe(204);

    // 6. 관심 영화와 포스터 상태, 운영 조회 API를 검증한다.
    const favoriteRequest = {
      movieCode,
      title: "Swagger 임시 관심 영화",
      releaseDate: "20261125",
      posterUrl: "",
    };

    const addFavorite = await request.post(`${API}/api/favorites`, {
      headers,
      data: favoriteRequest,
    });
    expect(addFavorite.status()).toBe(201);

    const favorites = await request.get(`${API}/api/favorites`, { headers });
    expect(favorites.status()).toBe(200);
    expect((await favorites.json()).some((item) => item.movieCode === movieCode)).toBe(true);

    const removeFavorite = await request.delete(
      `${API}/api/favorites/${movieCode}`,
      { headers },
    );
    expect(removeFavorite.status()).toBe(204);

    const myLikedMovies = await request.get(`${API}/api/movies/my/liked`, {
      headers,
    });
    expect(myLikedMovies.status()).toBe(200);

    const posterStatuses = await request.post(
      `${API}/api/movies/posters/status`,
      { data: [movieCode] },
    );
    expect(posterStatuses.status()).toBe(200);

    const invalidPosterStatuses = await request.post(
      `${API}/api/movies/posters/status`,
      { data: ["bad-code"] },
    );
    expect(invalidPosterStatuses.status()).toBe(400);

    const catalogStatus = await request.get(`${API}/api/movies/catalog/status`);
    expect(catalogStatus.status()).toBe(200);

    const apiBudget = await request.get(`${API}/api/movies/catalog/budget`);
    expect(apiBudget.status()).toBe(200);

    // 영화 테이블에 없는 코드는 평점 등록 시 외부 API를 호출하지 않고 404로 거부되어야 한다.
    const missingMovieRating = await request.put(
      `${API}/api/movies/ZZZ00001/rating`,
      { headers, data: true },
    );
    expect(missingMovieRating.status()).toBe(404);

    // 7. 리뷰와 회원을 삭제해 테스트 데이터가 남지 않는지 확인한다.
    const removeReview = await request.delete(
      `${API}/api/reviews/${reviewId}`,
      { headers },
    );
    expect(removeReview.status()).toBe(204);
    reviewId = null;

    const deletedReview = await request.get(
      `${API}/api/reviews/${createdReview.reviewId}`,
    );
    expect(deletedReview.status()).toBe(404);

    const deleteAccount = await request.delete(`${API}/api/auth/me`, {
      headers,
      data: { password },
    });
    expect(deleteAccount.status()).toBe(200);
    accountDeleted = true;

    const deletedMember = await request.get(`${API}/api/auth/me`, { headers });
    expect(deletedMember.status()).toBe(401);

    const revokedRefreshToken = await request.post(`${API}/api/auth/reissue`, {
      data: { refreshToken },
    });
    expect(revokedRefreshToken.status()).toBe(401);
  } finally {
    // 중간 단계가 실패해도 일회성 테스트 회원과 하위 데이터는 탈퇴 API로 정리한다.
    if (accessToken && !accountDeleted) {
      await request.delete(`${API}/api/auth/me`, {
        headers: authHeaders(accessToken),
        data: { password },
      }).catch(() => null);
    }
  }
});
