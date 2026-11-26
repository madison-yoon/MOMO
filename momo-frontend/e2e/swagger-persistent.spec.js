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
const COMMENT_MARKER = "[MOMO SWAGGER QA] persistent comment";

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

async function loadExistingMovie(request, movieCode) {
  // This suite never inserts a fake Movie row. Supply one code already present in momo_db.
  expect(
    movieCode,
    "실제 momo_db의 movies.movie_code를 MOMO_SWAGGER_MOVIE_CODE로 지정하세요.",
  ).toMatch(/^[A-Za-z0-9]{8}$/);

  const title = (process.env.MOMO_SWAGGER_MOVIE_TITLE || "").trim();
  expect(
    title,
    "관심 영화 데이터에 실제 제목을 기록하기 위해 MOMO_SWAGGER_MOVIE_TITLE을 지정하세요.",
  ).not.toBe("");

  // Rating GET checks the Movie row without starting external movie-data collection.
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
  ).toMatch(/^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$/);
  const configuredMovie = await loadExistingMovie(
    request, process.env.MOMO_SWAGGER_MOVIE_CODE || "",
  );

  // 테스트 계정은 최초 한 번만 만들고, 이후에는 기존 계정을 재사용
  expect((await request.get(`${API}/api/auth/me`)).status()).toBe(401);
  const session = await loginOrCreateAccount(request);
  const headers = authHeaders(session.accessToken);
  const me = await request.get(`${API}/api/auth/me`, { headers });
  expect(me.status()).toBe(200);
  expect((await me.json()).loginId).toBe(ACCOUNT.loginId);

  const passwordCheck = await request.post(`${API}/api/auth/me/password-check`, {
    headers, data: { currentPassword: ACCOUNT.password },
  });
  expect(passwordCheck.status()).toBe(200);
  expect(await passwordCheck.json()).toBe(true);

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
  expect((await request.get(`${API}/api/reviews?page=0&searchType=TITLE&keyword=SWAGGER`)).status()).toBe(200);
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

  // 회원·리뷰·댓글·반응·평점·관심 영화는 삭제하지 않는다. Refresh Token만 로그아웃으로 폐기한다.
  expect((await request.post(`${API}/api/auth/logout`, { headers })).status()).toBe(204);
  const reissue = await request.post(`${API}/api/auth/reissue`, {
    data: { refreshToken: session.refreshToken },
  });
  expect(reissue.status()).toBe(401);
});
