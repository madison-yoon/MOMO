/* Existing local momo_db Swagger regression test. Test rows are intentionally retained. */
const { test, expect } = require("@playwright/test");

const API = (process.env.MOMO_API_BASE_URL || "http://127.0.0.1:8111").replace(/\/$/, "");
const ACCOUNT = {
  loginId: process.env.MOMO_SWAGGER_LOGIN_ID || "momoSwaggerQA",
  password: process.env.MOMO_SWAGGER_PASSWORD || "",
  nickname: process.env.MOMO_SWAGGER_NICKNAME || "MomoSwQA",
  email: process.env.MOMO_SWAGGER_EMAIL || "momo.swagger.qa@example.com",
};
const REVIEW_TITLE = "[MOMO SWAGGER QA] persistent review";
const DELETE_REVIEW_TITLE = "[MOMO SWAGGER QA] review deletion";
const COMMENT_MARKER = "[MOMO SWAGGER QA] persistent comment";
const DELETE_COMMENT_MARKER = "[MOMO SWAGGER QA] comment deletion";
const UPDATED_NICKNAME = process.env.MOMO_SWAGGER_UPDATED_NICKNAME || `${ACCOUNT.nickname}2`;
const UPDATED_EMAIL = `${ACCOUNT.loginId}+updated@example.com`;

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

async function getAllPagedContent(request, path, headers) {
  const items = [];
  let totalPages = 1;

  for (let page = 0; page < totalPages; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await request.get(`${API}${path}${separator}page=${page}`, { headers });
    expect(response.status(), `페이지 조회 실패: ${path} (page=${page})`).toBe(200);

    const body = await response.json();
    items.push(...(body.content || []));
    totalPages = Number(body.page?.totalPages ?? body.totalPages ?? 1);
    if (!Number.isFinite(totalPages) || totalPages < 1) totalPages = 1;
  }

  return items;
}

async function loginOrCreateAccount(request) {
  const exists = await request.get(
    `${API}/api/auth/exists/id/${encodeURIComponent(ACCOUNT.loginId)}`,
  );
  expect(exists.status()).toBe(200);

  if (!(await exists.json())) {
    const signup = await request.post(`${API}/api/auth/signup`, {
      data: {
        loginId: ACCOUNT.loginId,
        password: ACCOUNT.password,
        nickname: ACCOUNT.nickname,
        email: ACCOUNT.email,
      },
    });
    expect(signup.status(), "최초 실행 시 Swagger 테스트 계정 생성 실패").toBe(201);
  }

  const login = await request.post(`${API}/api/auth/login`, {
    data: { loginId: ACCOUNT.loginId, password: ACCOUNT.password },
  });
  expect(login.status(), "고정 테스트 계정 로그인 실패. MOMO_SWAGGER_PASSWORD를 확인하세요.").toBe(200);
  return login.json();
}

async function loadExistingMovie(request, movieCode, titleVariable, codeVariable) {
  // This suite never inserts a fake Movie row. Each supplied code must already exist in momo_db.
  expect(
    movieCode,
    `실제 momo_db의 movies.movie_code를 ${codeVariable}로 지정하세요.`,
  ).toMatch(/^[A-Za-z0-9]{8}$/);

  const title = (process.env[titleVariable] || "").trim();
  expect(
    title,
    `실제 영화 제목을 ${titleVariable}로 지정하세요.`,
  ).not.toBe("");

  // Rating GET checks the Movie row without starting external movie-detail collection.
  const existingMovie = await request.get(`${API}/api/movies/${movieCode}/rating`);
  expect(existingMovie.status(), `실제 Movie 행이 없습니다: ${movieCode}`).toBe(200);

  return {
    movieCode,
    title,
    releaseDate: process.env.MOMO_SWAGGER_MOVIE_RELEASE_DATE || "",
  };
}

const hasBearer = (operation) =>
  (operation?.security || []).some((rule) =>
    Object.prototype.hasOwnProperty.call(rule, "bearerAuth"),
  );

test("Swagger UI와 기존 momo_db의 실제 API 계약을 검증하고 테스트 데이터를 유지한다", async ({ page, request }) => {
  test.skip(!ACCOUNT.password, "실제 DB 검증 시 MOMO_SWAGGER_PASSWORD 환경변수를 설정하세요.");
  test.setTimeout(120000);

  // Swagger 문서와 인증 표시
  const specResponse = await request.get(`${API}/v3/api-docs`);
  expect(specResponse.status()).toBe(200);
  const spec = await specResponse.json();
  expect(spec.openapi).toMatch(/^3\./);
  expect(spec.components.securitySchemes.bearerAuth).toMatchObject({
    type: "http", scheme: "bearer", bearerFormat: "JWT",
  });

  const required = [
    "/api/auth/signup", "/api/auth/login", "/api/auth/me",
    "/api/reviews", "/api/reviews/summaries",
    "/api/reviews/{reviewId}/comments",
    "/api/reviews/{reviewId}/reaction",
    "/api/reviews/{reviewId}/reactions",
    "/api/comments/{commentId}/reaction",
    "/api/comments/{commentId}/reactions",
    "/api/favorites", "/api/movies/posters/status",
    "/api/movies/catalog/status", "/api/rag/query", "/api/chat/images",
  ];
  required.forEach((path) => expect(spec.paths[path], `OpenAPI 경로 누락: ${path}`).toBeTruthy());

  expect(hasBearer(spec.paths["/api/reviews"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/reviews"].post)).toBe(true);
  expect(hasBearer(spec.paths["/api/reviews/summaries"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/reviews/{reviewId}/comments"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/reviews/{reviewId}/reaction"].get)).toBe(true);
  expect(hasBearer(spec.paths["/api/reviews/{reviewId}/reactions"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/comments/{commentId}/reactions"].get)).toBe(false);
  expect(hasBearer(spec.paths["/api/auth/me"].get)).toBe(true);
  expect(hasBearer(spec.paths["/api/auth/signup"].post)).toBe(false);

  // Swagger UI Try it out으로 공개 리뷰 목록을 실제 호출
  const swagger = await page.goto(`${API}/swagger-ui/index.html`);
  expect(swagger?.status()).toBe(200);
  await expect(page.locator(".swagger-ui").first()).toBeVisible();
  const publicReviews = page.locator(".opblock-get").filter({
    has: page.locator(".opblock-summary-path").filter({ hasText: /^\/api\/reviews$/ }),
  });
  await expect(publicReviews).toHaveCount(1);
  await publicReviews.locator(".opblock-summary").click();
  await publicReviews.locator("button.try-out__btn").click();
  await publicReviews.locator("button.execute").click();
  await expect(publicReviews.locator(".responses-wrapper")).toContainText("200");

  // DB에 쓰기 전에 테스트 비밀번호와 기존 영화 정보를 먼저 검증한다.
  expect(
    ACCOUNT.password,
    "비밀번호는 영문·숫자·특수문자(!@#$%^&*)를 포함한 8~20자로 지정하세요.",
  ).toMatch(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/);
  expect(
    UPDATED_NICKNAME,
    "회원정보 수정 테스트용 닉네임은 한글·영문·숫자 2~12자여야 합니다.",
  ).toMatch(/^[가-힣a-zA-Z0-9]{2,12}$/);
  expect(UPDATED_NICKNAME).not.toBe(ACCOUNT.nickname);

  const configuredMovie = await loadExistingMovie(
    request,
    process.env.MOMO_SWAGGER_MOVIE_CODE || "",
    "MOMO_SWAGGER_MOVIE_TITLE",
    "MOMO_SWAGGER_MOVIE_CODE",
  );
  const deleteMovie = await loadExistingMovie(
    request,
    process.env.MOMO_SWAGGER_DELETE_MOVIE_CODE || "",
    "MOMO_SWAGGER_DELETE_MOVIE_TITLE",
    "MOMO_SWAGGER_DELETE_MOVIE_CODE",
  );
  expect(
    deleteMovie.movieCode,
    "리뷰 삭제 검증용 영화는 유지형 리뷰 테스트 영화와 달라야 합니다.",
  ).not.toBe(configuredMovie.movieCode);

  // 테스트 계정은 최초 한 번만 만들고, 이후에는 기존 계정을 재사용
  expect((await request.get(`${API}/api/auth/me`)).status()).toBe(401);
  const session = await loginOrCreateAccount(request);
  const headers = authHeaders(session.accessToken);
  const me = await request.get(`${API}/api/auth/me`, { headers });
  expect(me.status()).toBe(200);
  const originalProfile = await me.json();
  expect(originalProfile.loginId).toBe(ACCOUNT.loginId);

  // 회원 정보 수정은 QA 계정에만 적용하고, 성공 여부를 확인한 직후 기존 값으로 복구한다.
  const nextNickname = originalProfile.nickname === UPDATED_NICKNAME
    ? ACCOUNT.nickname
    : UPDATED_NICKNAME;
  const nextEmail = originalProfile.email === UPDATED_EMAIL
    ? ACCOUNT.email
    : UPDATED_EMAIL;
  expect(nextNickname).not.toBe(originalProfile.nickname);

  try {
    const profileUpdate = await request.put(`${API}/api/auth/me`, {
      headers,
      data: {
        nickname: nextNickname,
        email: nextEmail,
        currentPassword: null,
        newPassword: null,
      },
    });
    expect(profileUpdate.status(), "회원 정보 수정 API 실패").toBe(200);
    const updatedProfile = await profileUpdate.json();
    expect(updatedProfile.nickname).toBe(nextNickname);
    expect(updatedProfile.email).toBe(nextEmail);
  } finally {
    const restoreProfile = await request.put(`${API}/api/auth/me`, {
      headers,
      data: {
        nickname: originalProfile.nickname,
        email: originalProfile.email,
        currentPassword: null,
        newPassword: null,
      },
    });
    expect(restoreProfile.status(), "회원 정보 복구 실패").toBe(200);
    const restoredProfile = await restoreProfile.json();
    expect(restoredProfile.nickname).toBe(originalProfile.nickname);
    expect(restoredProfile.email).toBe(originalProfile.email);
  }

  const passwordCheck = await request.post(`${API}/api/auth/me/password-check`, {
    headers, data: { currentPassword: ACCOUNT.password },
  });
  expect(passwordCheck.status()).toBe(200);
  expect(await passwordCheck.json()).toBe(true);

  // 실제 영화 검색 API를 호출한다. 검색 결과는 서비스의 정상 동작에 따라 캐시·Movie DB에 반영될 수 있다.
  const movieSearch = await request.get(
    `${API}/api/movies/search?keyword=${encodeURIComponent(configuredMovie.title)}&page=1&size=5`,
  );
  expect(movieSearch.status(), "영화 검색 API 실패").toBe(200);
  const searchBody = await movieSearch.json();
  expect(Array.isArray(searchBody.content)).toBe(true);
  expect(searchBody.page).toBe(1);
  expect(searchBody.size).toBe(5);
  expect(Number.isInteger(searchBody.totalCount)).toBe(true);
  expect(typeof searchBody.hasNext).toBe("boolean");

  const invalidMovieSearch = await request.get(
    `${API}/api/movies/search?keyword=x&page=0&size=51`,
  );
  expect(invalidMovieSearch.status(), "영화 검색 입력값 검증 실패").toBe(400);

  // 모든 페이지를 조회해 QA 레코드를 찾는다. 다른 리뷰를 테스트 데이터로 오인하지 않는다.
  const ownReviews = await getAllPagedContent(request, "/api/reviews/me", headers);
  const qaReview = ownReviews.find((item) => item.title === REVIEW_TITLE);
  if (qaReview) {
    expect(
      qaReview.movieCode,
      "기존 QA 리뷰와 MOMO_SWAGGER_MOVIE_CODE가 다릅니다. 최초 실행 때 사용한 영화 코드를 유지하세요.",
    ).toBe(configuredMovie.movieCode);
  }
  const movie = configuredMovie;

  if (!qaReview) {
    const existingReview = ownReviews.find((item) => item.movieCode === movie.movieCode);
    expect(
      existingReview,
      `선택한 영화(${movie.movieCode})에 QA 표시가 없는 기존 리뷰가 있습니다. 기존 리뷰를 변경하지 않도록 다른 미리 리뷰하지 않은 영화 코드를 지정하세요.`,
    ).toBeUndefined();
  }

  // 삭제 API 검증용 임시 리뷰는 별도 기존 영화에만 만든 뒤 바로 삭제한다.
  const oldDeleteReview = ownReviews.find((item) => item.title === DELETE_REVIEW_TITLE);
  if (oldDeleteReview) {
    expect(oldDeleteReview.movieCode).toBe(deleteMovie.movieCode);
    const oldDeleteComments = await getAllPagedContent(
      request, `/api/reviews/${oldDeleteReview.reviewId}/comments`, headers,
    );
    expect(oldDeleteComments, "기존 삭제 테스트 리뷰에 다른 사용자의 댓글이 있어 자동 삭제를 중단합니다.").toHaveLength(0);
    const oldDeleteReactions = await request.get(
      `${API}/api/reviews/${oldDeleteReview.reviewId}/reactions`,
    );
    expect(oldDeleteReactions.status()).toBe(200);
    const oldReactionCounts = await oldDeleteReactions.json();
    expect(oldReactionCounts.likeCount + oldReactionCounts.dislikeCount).toBe(0);
    expect((await request.delete(
      `${API}/api/reviews/${oldDeleteReview.reviewId}`, { headers },
    )).status()).toBe(204);
  }

  const unrelatedDeleteMovieReview = ownReviews.find(
    (item) => item.movieCode === deleteMovie.movieCode && item.title !== DELETE_REVIEW_TITLE,
  );
  expect(
    unrelatedDeleteMovieReview,
    "리뷰 삭제 검증용 영화에 일반 리뷰가 있습니다. 해당 리뷰는 수정·삭제하지 않습니다.",
  ).toBeUndefined();

  const deleteReviewCreate = await request.post(`${API}/api/reviews`, {
    headers,
    data: {
      movieCode: deleteMovie.movieCode,
      title: DELETE_REVIEW_TITLE,
      content: "DELETE API 전용 임시 QA 리뷰입니다.",
    },
  });
  expect(deleteReviewCreate.status(), "리뷰 삭제 검증용 임시 리뷰 생성 실패").toBe(201);
  const deleteReviewId = (await deleteReviewCreate.json()).reviewId;
  expect(deleteReviewId).toBeTruthy();
  expect((await request.get(`${API}/api/reviews/${deleteReviewId}`)).status()).toBe(200);
  expect((await request.delete(
    `${API}/api/reviews/${deleteReviewId}`, { headers },
  )).status()).toBe(204);
  expect(
    (await request.get(`${API}/api/reviews/${deleteReviewId}`)).status(),
    "삭제한 리뷰가 다시 조회됩니다.",
  ).toBe(404);

  let reviewId;
  if (qaReview) {
    reviewId = qaReview.reviewId;
    const update = await request.put(`${API}/api/reviews/${reviewId}`, {
      headers,
      data: { title: REVIEW_TITLE, content: "현재 momo_db에서 재사용하는 Swagger 리뷰입니다." },
    });
    expect(update.status()).toBe(200);
  } else {
    const create = await request.post(`${API}/api/reviews`, {
      headers,
      data: {
        movieCode: movie.movieCode,
        title: REVIEW_TITLE,
        content: "현재 momo_db에서 재사용하는 Swagger 리뷰입니다.",
      },
    });
    expect(create.status()).toBe(201);
    reviewId = (await create.json()).reviewId;
  }
  expect(reviewId).toBeTruthy();

  const duplicate = await request.post(`${API}/api/reviews`, {
    headers,
    data: { movieCode: movie.movieCode, title: "duplicate", content: "duplicate check" },
  });
  expect(duplicate.status()).toBe(409);

  expect((await request.get(`${API}/api/reviews/${reviewId}`)).status()).toBe(200);
  const reviewSearch = await request.get(
    `${API}/api/reviews?page=0&searchType=TITLE&keyword=SWAGGER`,
  );
  expect(reviewSearch.status()).toBe(200);
  const reviewSearchBody = await reviewSearch.json();
  expect(reviewSearchBody.content.some((item) => item.reviewId === reviewId)).toBe(true);
  expect((await request.get(`${API}/api/reviews/movie/${movie.movieCode}?page=0`)).status()).toBe(200);
  expect((await request.get(`${API}/api/reviews/summaries?reviewIds=${reviewId}`)).status()).toBe(200);

  // 개인 반응은 보호하고 집계 수치는 공개한다.
  expect((await request.get(`${API}/api/reviews/${reviewId}/reaction`)).status()).toBe(401);
  expect((await request.get(`${API}/api/reviews/${reviewId}/reactions`)).status()).toBe(200);

  const reviewReaction = await request.put(`${API}/api/reviews/${reviewId}/reaction`, {
    headers, data: true,
  });
  expect(reviewReaction.status()).toBe(200);
  expect(await (await request.get(
    `${API}/api/reviews/${reviewId}/reaction`, { headers },
  )).json()).toBe(true);

  // 댓글 목록은 비회원에게도 공개되며, 개인 반응 정보만 인증에 의존한다.
  expect((await request.get(
    `${API}/api/reviews/${reviewId}/comments?page=0`,
  )).status()).toBe(200);

  // 댓글 역시 모든 페이지에서 QA 표시를 찾고, 동일 commentId만 수정한다.
  const allComments = await getAllPagedContent(
    request, `/api/reviews/${reviewId}/comments`, headers,
  );
  const oldComment = allComments.find(
    (item) => (item.content || "").startsWith(COMMENT_MARKER),
  );

  let commentId;
  if (oldComment) {
    commentId = oldComment.commentId;
    const update = await request.put(`${API}/api/comments/${commentId}`, {
      headers, data: { content: `${COMMENT_MARKER} · updated` },
    });
    expect(update.status()).toBe(200);
  } else {
    const create = await request.post(`${API}/api/reviews/${reviewId}/comments`, {
      headers, data: { content: COMMENT_MARKER },
    });
    expect(create.status()).toBe(201);
    commentId = (await create.json()).commentId;
  }

  expect((await request.put(`${API}/api/comments/${commentId}/reaction`, {
    headers, data: true,
  })).status()).toBe(200);
  expect((await request.get(`${API}/api/comments/${commentId}/reactions`)).status()).toBe(200);

  // 댓글 삭제는 별도 임시 댓글만 사용한다. 기존 QA 댓글과 일반 댓글은 보존한다.
  const commentsForDeletion = await getAllPagedContent(
    request, `/api/reviews/${reviewId}/comments`, headers,
  );
  const oldDeleteComments = commentsForDeletion.filter(
    (item) => (item.content || "").startsWith(DELETE_COMMENT_MARKER),
  );
  expect(oldDeleteComments.length).toBeLessThanOrEqual(1);
  if (oldDeleteComments.length === 1) {
    const oldDeleteComment = oldDeleteComments[0];
    expect(oldDeleteComment.userId).toBe(originalProfile.userId);
    expect(oldDeleteComment.likeCount + oldDeleteComment.dislikeCount).toBe(0);
    expect((await request.delete(
      `${API}/api/comments/${oldDeleteComment.commentId}`, { headers },
    )).status()).toBe(204);
  }

  const deleteCommentCreate = await request.post(
    `${API}/api/reviews/${reviewId}/comments`,
    { headers, data: { content: DELETE_COMMENT_MARKER } },
  );
  expect(deleteCommentCreate.status()).toBe(201);
  const deleteCommentId = (await deleteCommentCreate.json()).commentId;
  expect(deleteCommentId).toBeTruthy();
  expect((await request.delete(
    `${API}/api/comments/${deleteCommentId}`, { headers },
  )).status()).toBe(204);
  const commentsAfterDelete = await getAllPagedContent(
    request, `/api/reviews/${reviewId}/comments`, headers,
  );
  expect(commentsAfterDelete.some((item) => item.commentId === deleteCommentId)).toBe(false);

  // 평가·관심 영화는 user/movie 조합으로 갱신해 중복 행을 만들지 않는다.
  expect((await request.put(`${API}/api/movies/${movie.movieCode}/rating`, {
    headers, data: true,
  })).status()).toBe(200);
  const rating = await request.get(`${API}/api/movies/${movie.movieCode}/rating`, { headers });
  expect(rating.status()).toBe(200);
  expect((await rating.json()).myRating).toBe(true);
  expect((await request.get(`${API}/api/movies/my/liked`, { headers })).status()).toBe(200);

  expect((await request.post(`${API}/api/favorites`, {
    headers,
    data: {
      movieCode: movie.movieCode,
      title: movie.title,
      releaseDate: movie.releaseDate,
      posterUrl: "",
    },
  })).status()).toBe(201);
  const favorites = await request.get(`${API}/api/favorites`, { headers });
  expect(favorites.status()).toBe(200);
  expect((await favorites.json()).some((item) => item.movieCode === movie.movieCode)).toBe(true);

  expect((await request.post(`${API}/api/movies/posters/status`, {
    data: [movie.movieCode],
  })).status()).toBe(200);
  expect((await request.post(`${API}/api/movies/posters/status`, {
    data: ["bad-code"],
  })).status()).toBe(400);
  expect((await request.get(`${API}/api/movies/catalog/status`)).status()).toBe(200);
  expect((await request.get(`${API}/api/movies/catalog/budget`)).status()).toBe(200);
  expect((await request.get(`${API}/api/movies/ZZZ99999/rating`)).status()).toBe(404);

  // 영구 QA 회원·리뷰·댓글·반응·평점·관심 영화는 보존한다. 별도 임시 삭제 검증 행만 생성 직후 삭제한다.
  expect((await request.post(`${API}/api/auth/logout`, { headers })).status()).toBe(204);
  const reissue = await request.post(`${API}/api/auth/reissue`, {
    data: { refreshToken: session.refreshToken },
  });
  expect(reissue.status()).toBe(401);
});
