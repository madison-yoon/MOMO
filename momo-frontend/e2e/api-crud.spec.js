const { test, expect } = require("@playwright/test");

const API = "http://127.0.0.1:8111";
const MOVIE_CODE = process.env.MOMO_E2E_MOVIE_CODE || "20261234";

const auth = (token) => ({ Authorization: `Bearer ${token}` });

test("격리 MySQL에서 회원·리뷰·댓글·반응·평점·관심 영화 API를 실제 호출한다", async ({ request }) => {
  expect(MOVIE_CODE).toMatch(/^[A-Za-z0-9]{8}$/);

  const suffix = Date.now().toString(36).slice(-7);
  const loginId = `crud${suffix}`;
  const password = "MomoE2e1!";
  const nickname = `C${suffix}`;
  const updatedNickname = `U${suffix}`;
  const email = `${loginId}@example.com`;

  const signup = await request.post(`${API}/api/auth/signup`, {
    data: { loginId, password, nickname, email },
  });
  expect(signup.status()).toBe(201);

  const login = await request.post(`${API}/api/auth/login`, {
    data: { loginId, password },
  });
  expect(login.status()).toBe(200);
  const session = await login.json();
  const headers = auth(session.accessToken);

  expect((await request.get(`${API}/api/auth/me`)).status()).toBe(401);
  const profile = await request.get(`${API}/api/auth/me`, { headers });
  expect(profile.status()).toBe(200);
  expect((await profile.json()).loginId).toBe(loginId);

  const updateProfile = await request.put(`${API}/api/auth/me`, {
    headers,
    data: { nickname: updatedNickname, email, currentPassword: null, newPassword: null },
  });
  expect(updateProfile.status()).toBe(200);
  expect((await updateProfile.json()).nickname).toBe(updatedNickname);

  const ratingBefore = await request.get(`${API}/api/movies/${MOVIE_CODE}/rating`, { headers });
  expect(ratingBefore.status(), "CI DB Movie fixture가 존재해야 합니다.").toBe(200);

  const reviewTitle = `CI CRUD ${suffix}`;
  const createReview = await request.post(`${API}/api/reviews`, {
    headers,
    data: { movieCode: MOVIE_CODE, title: reviewTitle, content: "리뷰 CRUD API 검증" },
  });
  expect(createReview.status()).toBe(201);
  const reviewId = (await createReview.json()).reviewId;
  expect(reviewId).toBeTruthy();

  const duplicateReview = await request.post(`${API}/api/reviews`, {
    headers,
    data: { movieCode: MOVIE_CODE, title: "중복 리뷰", content: "중복 작성 검증" },
  });
  expect(duplicateReview.status()).toBe(409);

  const reviewDetail = await request.get(`${API}/api/reviews/${reviewId}`);
  expect(reviewDetail.status()).toBe(200);
  expect((await reviewDetail.json()).title).toBe(reviewTitle);

  const updateReview = await request.put(`${API}/api/reviews/${reviewId}`, {
    headers,
    data: { title: `${reviewTitle} 수정`, content: "수정 API 검증" },
  });
  expect(updateReview.status()).toBe(200);

  const reviewSearch = await request.get(
    `${API}/api/reviews?page=0&searchType=TITLE&keyword=${encodeURIComponent(reviewTitle)}`,
  );
  expect(reviewSearch.status()).toBe(200);
  expect((await reviewSearch.json()).content.some((item) => item.reviewId === reviewId)).toBe(true);

  expect((await request.put(`${API}/api/reviews/${reviewId}/reaction`, {
    headers, data: true,
  })).status()).toBe(200);
  expect((await request.get(`${API}/api/reviews/${reviewId}/reaction`, { headers })).status()).toBe(200);
  expect((await request.get(`${API}/api/reviews/${reviewId}/reactions`)).status()).toBe(200);
  expect((await request.delete(`${API}/api/reviews/${reviewId}/reaction`, { headers })).status()).toBe(204);

  const createComment = await request.post(`${API}/api/reviews/${reviewId}/comments`, {
    headers, data: { content: `CI CRUD comment ${suffix}` },
  });
  expect(createComment.status()).toBe(201);
  const commentId = (await createComment.json()).commentId;
  expect(commentId).toBeTruthy();

  const commentList = await request.get(`${API}/api/reviews/${reviewId}/comments?page=0`);
  expect(commentList.status()).toBe(200);
  expect((await commentList.json()).content.some((item) => item.commentId === commentId)).toBe(true);

  const updateComment = await request.put(`${API}/api/comments/${commentId}`, {
    headers, data: { content: `CI CRUD comment updated ${suffix}` },
  });
  expect(updateComment.status()).toBe(200);
  expect((await updateComment.json()).content).toContain("updated");

  expect((await request.put(`${API}/api/comments/${commentId}/reaction`, {
    headers, data: true,
  })).status()).toBe(200);
  expect((await request.get(`${API}/api/comments/${commentId}/reactions`)).status()).toBe(200);
  expect((await request.delete(`${API}/api/comments/${commentId}/reaction`, { headers })).status()).toBe(204);
  expect((await request.delete(`${API}/api/comments/${commentId}`, { headers })).status()).toBe(204);

  const commentsAfterDelete = await request.get(`${API}/api/reviews/${reviewId}/comments?page=0`);
  expect((await commentsAfterDelete.json()).content.some((item) => item.commentId === commentId)).toBe(false);

  expect((await request.delete(`${API}/api/reviews/${reviewId}`, { headers })).status()).toBe(204);
  expect((await request.get(`${API}/api/reviews/${reviewId}`)).status()).toBe(404);

  expect((await request.put(`${API}/api/movies/${MOVIE_CODE}/rating`, {
    headers, data: true,
  })).status()).toBe(200);
  const rating = await request.get(`${API}/api/movies/${MOVIE_CODE}/rating`, { headers });
  expect((await rating.json()).myRating).toBe(true);
  expect((await request.delete(`${API}/api/movies/${MOVIE_CODE}/rating`, { headers })).status()).toBe(204);

  const favorite = {
    movieCode: MOVIE_CODE,
    title: "CI API CRUD fixture",
    releaseDate: "20260101",
    posterUrl: "",
  };
  expect((await request.post(`${API}/api/favorites`, { headers, data: favorite })).status()).toBe(201);
  const favorites = await request.get(`${API}/api/favorites`, { headers });
  expect((await favorites.json()).some((item) => item.movieCode === MOVIE_CODE)).toBe(true);
  expect((await request.delete(`${API}/api/favorites/${MOVIE_CODE}`, { headers })).status()).toBe(204);
  expect((await request.delete(`${API}/api/favorites/${MOVIE_CODE}`, { headers })).status()).toBe(204);

  const invalidSearch = await request.get(`${API}/api/movies/search?keyword=x&page=0&size=51`);
  expect(invalidSearch.status()).toBe(400);

  expect((await request.post(`${API}/api/auth/logout`, { headers })).status()).toBe(204);
  const reissue = await request.post(`${API}/api/auth/reissue`, {
    data: { refreshToken: session.refreshToken },
  });
  expect(reissue.status()).toBe(401);
});
