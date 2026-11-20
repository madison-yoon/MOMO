import axios from "axios";

const HM_DOMAIN = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8111").replace(/\/+$/, "");

// ========================================
// 인증 관리
// ========================================

let authSessionVersion = 0;
let refreshPromise = null;
let isHandlingAuthExpired = false;

export const getAuthSessionVersion = () => authSessionVersion;
export const isAuthSessionCurrent = (version) => version === authSessionVersion;

const sessionChangedError = () => {
  const error = new Error("인증 상태가 이미 변경되었습니다.");
  error.code = "MOMO_AUTH_SESSION_CHANGED";
  return error;
};

// 사용자 정의·mock adapter를 유지하면서 실제 요청 전송 직전에 세션 변경을 차단한다.
const guardSessionAdapter = (config) => {
  if (config._momoSessionGuarded) return;
  const adapter = config.adapter || axios.defaults?.adapter;
  config.adapter = (requestConfig) => {
    if (!isAuthSessionCurrent(requestConfig._momoAuthSessionVersion)
        || (requestConfig._momoAuthMarker && requestConfig._momoAuthMarker !== getAuthSessionMarker())
        || (requestConfig._momoAuthIdentity && !isAuthIdentityCurrent(requestConfig._momoAuthIdentity))) {
      return Promise.reject(sessionChangedError());
    }
    return axios.getAdapter(adapter)(requestConfig);
  };
  config._momoSessionGuarded = true;
};

// 인증이 필요 없는 API
const isExcludedAuthRequest = (url = "") => {
  const path = new URL(url, HM_DOMAIN).pathname;
  return ["/api/auth/signup", "/api/auth/login", "/api/auth/reissue"].includes(path)
    || /^\/api\/auth\/(kakao|naver|google)(\/authorize)?$/.test(path)
    || /^\/api\/auth\/exists\/id\/[^/]+$/.test(path);
};

const newSessionMarker = () => Array.from(window.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");

// 익명 상태에도 식별자를 유지해 외부 인증 중 다른 탭의 로그인·로그아웃을 감지한다.
export const getAuthSessionMarker = () => {
  let marker = localStorage.getItem("momo-auth-session-id");
  if (!marker) {
    marker = newSessionMarker();
    localStorage.setItem("momo-auth-session-id", marker);
  }
  return marker;
};

// 전체 페이지 이동 후에도 같은 로그인인지 확인한다. 토큰 재발급은 이 식별자를 변경하지 않는다.
export const getAuthSessionIdentity = () => {
  const username = localStorage.getItem("username");
  if (!username || (!localStorage.getItem("accessToken") && !localStorage.getItem("refreshToken"))) return null;
  return JSON.stringify([username, getAuthSessionMarker()]);
};
export const isAuthIdentityCurrent = identity => Boolean(identity) && getAuthSessionIdentity() === identity;

// Authorization 헤더 설정
const setAuthorization = (config, accessToken) => {
  if (!config.headers) {
    config.headers = {};
  }

  config.headers.Authorization = `Bearer ${accessToken}`;
};

// 로그인 성공 시 토큰 저장
export const storeLoginTokens = (accessToken, refreshToken) => {
  if (!accessToken || !refreshToken) {
    throw new Error("로그인 토큰이 올바르지 않습니다.");
  }

  authSessionVersion += 1;
  refreshPromise = null;
  isHandlingAuthExpired = false;

  localStorage.setItem("momo-auth-session-id", newSessionMarker());
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  window.dispatchEvent(new Event("momo-auth-changed"));
};

// 로그아웃 및 회원 탈퇴 시 인증 정보 제거
export const clearAuthSession = (expectedSessionVersion = authSessionVersion) => {
  if (!isAuthSessionCurrent(expectedSessionVersion)) return false;
  // 진행 중인 재발급 응답이 현재 세션을 덮어쓰지 못하도록 버전을 올린다.
  authSessionVersion += 1;

  localStorage.setItem("momo-auth-session-id", newSessionMarker());
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  localStorage.removeItem("nickname");
  // 이전 버전에서 저장한 이메일도 인증 종료 시 정리한다.
  localStorage.removeItem("email");

  // 기존 Promise는 취소할 수 없지만, 새 세션은 새 재발급을 시작할 수 있다.
  refreshPromise = null;

  window.dispatchEvent(new Event("momo-auth-changed"));
  return true;
};

// 인증 만료 처리
const handleAuthExpired = (error, expectedSessionVersion) => {
  if (!isAuthSessionCurrent(expectedSessionVersion)) return;
  if (isHandlingAuthExpired) {
    if (error) {
      error.momoAuthExpiredHandled = true;
    }
    return;
  }

  isHandlingAuthExpired = true;

  clearAuthSession(expectedSessionVersion);

  if (error) {
    error.momoAuthExpiredHandled = true;
  }

  if (window.location.pathname !== "/login") {
    alert("로그인이 만료되었습니다. 다시 로그인해 주세요.");
    window.location.href = "/login";
  }
};

// Refresh Token을 이용한 Access Token 재발급
const reissueAccessToken = () => {
  // 같은 로그인 세션의 동시 401 요청은 하나의 재발급 요청을 공유한다.
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    const error = new Error("Refresh Token이 없습니다.");
    error.code = "MOMO_REFRESH_TOKEN_MISSING";
    return Promise.reject(error);
  }

  const requestedSessionVersion = authSessionVersion;
  const requestedIdentity = getAuthSessionIdentity();

  // finally에서 이전 Promise가 새 세션의 Promise를 지우지 않도록 참조를 비교한다.
  const currentPromise = axios
    .post(`${HM_DOMAIN}/api/auth/reissue`, { refreshToken }, {
      _momoAuthSessionVersion: requestedSessionVersion,
      _momoAuthIdentity: requestedIdentity,
    })
    .then((response) => {
      // 이전 세션에서 시작한 응답은 현재 로그인 토큰을 덮어쓸 수 없다.
      if (authSessionVersion !== requestedSessionVersion || (requestedIdentity && !isAuthIdentityCurrent(requestedIdentity))) {
        const error = new Error("인증 상태가 이미 변경되었습니다.");
        error.code = "MOMO_AUTH_SESSION_CHANGED";
        throw error;
      }

      const newAccessToken = response.data?.accessToken;
      const newRefreshToken = response.data?.refreshToken;

      if (!newAccessToken || !newRefreshToken) {
        const error = new Error("재발급 토큰 응답이 올바르지 않습니다.");
        error.code = "MOMO_INVALID_REFRESH_RESPONSE";
        throw error;
      }

      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      return newAccessToken;
    })
    .finally(() => {
      if (refreshPromise === currentPromise) {
        refreshPromise = null;
      }
    });

  refreshPromise = currentPromise;
  return currentPromise;
};

// ========================================
// Axios Request Interceptor
// ========================================

axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    const isMomoApi = config.url?.startsWith(`${HM_DOMAIN}/api/`);

    const isPublicAuthRequest = isExcludedAuthRequest(config.url);

    if (isMomoApi && config._momoAuthMarker && config._momoAuthMarker !== getAuthSessionMarker()) throw sessionChangedError();

    if (isMomoApi && config._momoAuthIdentity && !isAuthIdentityCurrent(config._momoAuthIdentity)) throw sessionChangedError();

    if (isMomoApi && config._momoAuthSessionVersion !== undefined
        && !isAuthSessionCurrent(config._momoAuthSessionVersion)) {
      throw sessionChangedError();
    }

    if (isMomoApi && accessToken && !isPublicAuthRequest) {
      setAuthorization(config, accessToken);

      if (config._momoAuthSessionVersion === undefined) {
        config._momoAuthSessionVersion = authSessionVersion;
      }
    }

    if (isMomoApi && config._momoAuthSessionVersion !== undefined) guardSessionAdapter(config);
    return config;
  },
  (error) => Promise.reject(error),
);

// ========================================
// Axios Response Interceptor
// ========================================

axios.interceptors.response.use(
  (response) => {
    const version = response.config?._momoAuthSessionVersion;
    if ((version !== undefined && !isAuthSessionCurrent(version))
        || (response.config?._momoAuthMarker && response.config._momoAuthMarker !== getAuthSessionMarker())
        || (response.config?._momoAuthIdentity && !isAuthIdentityCurrent(response.config._momoAuthIdentity))) {
      return Promise.reject(sessionChangedError());
    }
    return response;
  },

  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    const requestUrl = originalRequest?.url || "";

    const sentAuthorization =
      originalRequest?.headers?.Authorization ||
      originalRequest?.headers?.get?.("Authorization");

    if (originalRequest?._momoAuthSessionVersion !== undefined
        && !isAuthSessionCurrent(originalRequest._momoAuthSessionVersion)) {
      return Promise.reject(sessionChangedError());
    }

    if (originalRequest?._momoAuthMarker && originalRequest._momoAuthMarker !== getAuthSessionMarker()) return Promise.reject(sessionChangedError());

    if (originalRequest?._momoAuthIdentity && !isAuthIdentityCurrent(originalRequest._momoAuthIdentity)) return Promise.reject(sessionChangedError());

    // 재발급 대상이 아닌 요청
    if (
      status !== 401 ||
      !originalRequest ||
      !requestUrl.startsWith(`${HM_DOMAIN}/api/`) ||
      isExcludedAuthRequest(requestUrl) ||
      !sentAuthorization
    ) {
      return Promise.reject(error);
    }

    const requestedSessionVersion = originalRequest._momoAuthSessionVersion ?? authSessionVersion;

    // 이미 재시도한 요청이라면 인증 만료 처리
    if (originalRequest._retry) {
      handleAuthExpired(error, requestedSessionVersion);

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const currentAccessToken = localStorage.getItem("accessToken");

    // 다른 요청이 먼저 토큰을 재발급했다면 최신 토큰 사용
    if (
      currentAccessToken &&
      sentAuthorization !== `Bearer ${currentAccessToken}`
    ) {
      setAuthorization(originalRequest, currentAccessToken);

      return axios(originalRequest);
    }

    try {
      const newAccessToken = await reissueAccessToken();

      // 재발급 도중 로그인 세션이 변경되었는지 확인
      if (authSessionVersion !== requestedSessionVersion) {
        const sessionError = new Error("인증 상태가 이미 변경되었습니다.");

        sessionError.code = "MOMO_AUTH_SESSION_CHANGED";

        throw sessionError;
      }

      setAuthorization(originalRequest, newAccessToken);

      // 기존 요청 한 번 재시도
      return axios(originalRequest);
    } catch (reissueError) {
      if (!isAuthSessionCurrent(requestedSessionVersion)) {
        return Promise.reject(sessionChangedError());
      }
      // Refresh Token이 실제로 거부된 경우에만 세션을 종료한다.
      // 네트워크 오류나 서버 5xx는 로그인 정보를 보존해 재시도할 수 있게 한다.
      if (
        reissueError?.code === "MOMO_REFRESH_TOKEN_MISSING" ||
        reissueError?.response?.status === 401
      ) {
        handleAuthExpired(reissueError, requestedSessionVersion);
      }

      return Promise.reject(reissueError);
    }
  },
);

// ========================================
// MOMO API
// ========================================

const oauthProvider = provider => {
  if (!["kakao", "naver", "google"].includes(provider)) throw new Error("지원하지 않는 인증 방식입니다.");
  return provider;
};

// 토큰이 없는 콜백은 코드 소비 전에 재발급한다. 서버의 JWT 401은 state 소비 이전에만 반환된다.
const ensureDeleteAuthentication = async () => {
  const version = getAuthSessionVersion();
  const identity = getAuthSessionIdentity();
  if (!localStorage.getItem("accessToken")) await reissueAccessToken();
  if (!isAuthSessionCurrent(version) || (identity && !isAuthIdentityCurrent(identity))) throw sessionChangedError();
  return { withCredentials: true, _momoAuthSessionVersion: version, _momoAuthIdentity: identity };
};

const AxiosApi = {
  // 1. 회원 아이디 중복 확인
  memberIdExist: async (loginId, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/auth/exists/id/${encodeURIComponent(loginId)}`,
      { signal },
    );
  },

  // 2. 회원가입
  memberSignup: async (loginId, password, nickname, email) => {
    return await axios.post(`${HM_DOMAIN}/api/auth/signup`, {
      loginId,
      password,
      nickname,
      email,
    });
  },

  // 3. 로그인
  memberLogin: async (loginId, password) => {
    return await axios.post(
      `${HM_DOMAIN}/api/auth/login`,
      { loginId, password },
      { withCredentials: true },
    );
  },

  // 로그인만 공개 API이며 탈퇴 요청은 JWT 인증과 별도 state 쿠키를 사용한다.
  oauthAuthorize: provider => axios.get(`${HM_DOMAIN}/api/auth/${oauthProvider(provider)}/authorize`, { withCredentials: true }),
  oauthLogin: (provider, code, state) => axios.post(`${HM_DOMAIN}/api/auth/${oauthProvider(provider)}`, { code, state }, { withCredentials: true, _momoAuthSessionVersion: getAuthSessionVersion(), _momoAuthMarker: getAuthSessionMarker() }),
  socialDeleteAuthorize: async (provider, confirmation) => {
    const config = await ensureDeleteAuthentication();
    return axios.post(`${HM_DOMAIN}/api/auth/${oauthProvider(provider)}/delete/authorize`, confirmation, config);
  },
  socialDeleteComplete: async (provider, code, state, confirmation) => {
    const config = await ensureDeleteAuthentication();
    return axios.post(`${HM_DOMAIN}/api/auth/${oauthProvider(provider)}/delete/complete`, { code, state, ...confirmation }, config);
  },
  socialMemberDelete: async confirmation => {
    const config = await ensureDeleteAuthentication();
    return axios.delete(`${HM_DOMAIN}/api/auth/me`, { ...config, data: confirmation });
  },

  // 4. 회원정보 수정
  memberUpdate: async (data) => {
    return await axios.put(`${HM_DOMAIN}/api/auth/me`, data, {
      withCredentials: true,
    });
  },

  // 5. 회원 탈퇴
  memberDelete: async (password) => {
    return await axios.delete(`${HM_DOMAIN}/api/auth/me`, {
      data: { password },
      withCredentials: true,
    });
  },

  // TMDb 필모그래피 영화 ID를 MOMO 영화 코드로 연결
  resolveFilmographyMovie: async (tmdbId, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/persons/filmography/${encodeURIComponent(tmdbId)}`, {
      signal,
    });
  },

  // 6. 영화 검색
  movieSearch: async (keyword, page, size = 20, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/movies/search`, {
      params: {
        keyword,
        page,
        size,
      },
      signal,
    });
  },

  // 6-1. 일일 박스오피스 조회
  dailyBoxOffice: async (targetDate, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/boxoffice/daily`, {
      params: { targetDate },
      signal,
    });
  },

  // URL 식별자 하나로 KOBIS 영화와 TMDb 영화를 조회한다.
  movieDetailByIdentifier: async (identifier, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/movies/resolve/${encodeURIComponent(identifier)}`,
      { signal },
    );
  },

  // 기존 API 호환용: TMDb ID로 KOBIS 미등록 영화 상세정보를 조회한다.
  movieDetailByTmdbId: async (tmdbId, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/movies/tmdb/${encodeURIComponent(tmdbId)}`,
      { signal },
    );
  },

  // 6-2. 영화 상세정보 조회
  movieDetail: async (movieCode, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/movies/${encodeURIComponent(movieCode)}`,
      { signal },
    );
  },

  // 영화 상세 화면의 TMDb 인물 ID·프로필 사진 조회
  moviePeople: async (movieCode, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/movies/${encodeURIComponent(movieCode)}/people`,
      { signal },
    );
  },

  // 7. 장르별 영화 목록 조회
  moviesByGenre: async (genre, page, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/movies/genre`, {
      params: {
        genre,
        page,
      },
      signal,
    });
  },

  // 7-1. 박스오피스 진입 이력이 확인된 추천 후보 조회
  boxOfficeRecommendations: async (genre, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/movies/recommendations`, {
      params: genre ? { genre } : {},
      signal,
    });
  },

  // 8. 영화 포스터 조회
  moviePoster: async (movieCode, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/movies/${encodeURIComponent(movieCode)}/poster`,
      { signal },
    );
  },

  // 9. 영화 포스터 상태 일괄 조회
  moviePostersEnsure: async (movieCodes, signal) => {
    return await axios.post(
      `${HM_DOMAIN}/api/movies/posters/ensure`,
      movieCodes,
      { signal },
    );
  },

  moviePosterStatuses: async (movieCodes, signal) => {
    return await axios.post(
      `${HM_DOMAIN}/api/movies/posters/status`,
      movieCodes,
      { signal },
    );
  },

  // 10. 영화별 리뷰 조회
  movieReviews: async (movieCode, page = 0, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/reviews/movie/${encodeURIComponent(movieCode)}`,
      {
        params: { page },
        signal,
      },
    );
  },

  // 11. 영화 평가 조회
  movieRating: async (movieCode, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/movies/${encodeURIComponent(movieCode)}/rating`,
      { signal },
    );
  },

  // 11-1. 로그인 회원의 좋아요 영화 목록 조회
  myLikedMovies: async (signal) => {
    return await axios.get(`${HM_DOMAIN}/api/movies/my/liked`, {
      withCredentials: true,
      signal,
    });
  },

  // 12. 영화 좋아요 / 싫어요 저장 및 변경
  // true = 좋아요, false = 싫어요
  movieRatingSave: async (movieCode, liked) => {
    return await axios.put(
      `${HM_DOMAIN}/api/movies/${encodeURIComponent(movieCode)}/rating`,
      liked,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },

  // 13. 영화 평가 취소
  movieRatingDelete: async (movieCode) => {
    return await axios.delete(
      `${HM_DOMAIN}/api/movies/${encodeURIComponent(movieCode)}/rating`,
      { withCredentials: true },
    );
  },

  // 14. 리뷰 작성
  reviewCreate: async (movieCode, title, content) => {
    return await axios.post(
      `${HM_DOMAIN}/api/reviews`,
      { movieCode, title, content },
      { withCredentials: true },
    );
  },

  // 계정에 저장된 관심 영화 조회
  favoriteMovies: async (signal) => {
    return await axios.get(`${HM_DOMAIN}/api/favorites`, { signal });
  },

  // 관심 영화 등록 및 기존 영화 정보 갱신
  favoriteMovieAdd: async (movie) => {
    return await axios.post(`${HM_DOMAIN}/api/favorites`, movie);
  },

  // 관심 영화 해제
  favoriteMovieDelete: async (movieCode) => {
    return await axios.delete(
      `${HM_DOMAIN}/api/favorites/${encodeURIComponent(movieCode)}`,
    );
  },

  // 15. 로그인 사용자 정보 조회
  memberMe: async (signal) => {
    return await axios.get(`${HM_DOMAIN}/api/auth/me`, {
      withCredentials: true,
      signal,
    });
  },

  // 16. 로그아웃
  memberLogout: async () => {
    return await axios.post(
      `${HM_DOMAIN}/api/auth/logout`,
      {},
      { withCredentials: true },
    );
  },

  // 17. 현재 비밀번호 확인
  memberPasswordCheck: async (currentPassword) => {
    return await axios.post(
      `${HM_DOMAIN}/api/auth/me/password-check`,
      { currentPassword },
      { withCredentials: true },
    );
  },

  // 18. 전체 리뷰 목록 조회
  allReviews: async (page = 0, signal, searchType = "ALL", keyword = "") => {
    return await axios.get(`${HM_DOMAIN}/api/reviews`, {
      params: { page, searchType, keyword },
      withCredentials: true,
      signal,
    });
  },

  // 한 페이지의 리뷰 댓글·반응 통계를 한 번에 조회
  reviewSummaries: async (reviewIds, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/reviews/summaries`, {
      params: { reviewIds: reviewIds.join(",") },
      withCredentials: true,
      signal,
    });
  },

  // 18-1. 내가 작성한 리뷰 목록 조회
  myReviews: async (page = 0, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/reviews/me`, {
      params: { page },
      withCredentials: true,
      signal,
    });
  },

  // 19. 리뷰 상세 조회
  reviewDetail: async (reviewId, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}`,
      {
        withCredentials: true,
        signal,
      },
    );
  },

  // 19-1. 리뷰 수정
  reviewUpdate: async (reviewId, title, content) => {
    return await axios.put(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}`,
      { title, content },
      { withCredentials: true },
    );
  },

  // 19-2. 리뷰 삭제
  reviewDelete: async (reviewId) => {
    return await axios.delete(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}`,
      { withCredentials: true },
    );
  },

  // 20. 프로필 이미지 업로드 및 변경
  profileImageUpload: async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    return await axios.post(
      `${HM_DOMAIN}/api/auth/me/profile-image`,
      formData,
      {
        withCredentials: true,
      },
    );
  },

  // 21. 프로필 이미지 삭제
  profileImageDelete: async () => {
    return await axios.delete(`${HM_DOMAIN}/api/auth/me/profile-image`, {
      withCredentials: true,
    });
  },

  // 22. 프로필 이미지 조회
  profileImageGet: async (signal) => {
    return await axios.get(`${HM_DOMAIN}/api/auth/me/profile-image`, {
      withCredentials: true,
      responseType: "blob",
      signal,
    });
  },

  // 회원 ID로 다른 회원의 프로필 이미지 조회
  profileImageByUserIdGet: async (userId, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/auth/users/${encodeURIComponent(userId)}/profile-image`,
      { responseType: "blob", signal },
    );
  },

  // TMDb 고유 인물 ID로 상세정보 조회 (다국어 이름 재검색에 의존하지 않음)
  getPersonDetailById: async (type, personId, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/persons/by-id/${encodeURIComponent(type)}/${encodeURIComponent(personId)}`,
      { signal },
    );
  },

  // 23. 인물 상세 및 필모그래피 조회
  getPersonDetail: async (type, name, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/persons/${encodeURIComponent(type)}/${encodeURIComponent(name)}`,
      { signal },
    );
  },

  // ========================================
  // MOMO 리뷰 커뮤니티 API
  // ========================================

  // 24. 리뷰 댓글 목록 조회
  reviewComments: async (reviewId, page = 0, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}/comments`,
      {
        params: { page },
        withCredentials: true,
        signal,
      },
    );
  },

  // 25. 리뷰 댓글 작성
  commentCreate: async (reviewId, content) => {
    return await axios.post(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}/comments`,
      { content },
      { withCredentials: true },
    );
  },

  // 26. 리뷰 댓글 수정
  commentUpdate: async (commentId, content) => {
    return await axios.put(
      `${HM_DOMAIN}/api/comments/${encodeURIComponent(commentId)}`,
      { content },
      { withCredentials: true },
    );
  },

  // 27. 리뷰 댓글 삭제
  commentDelete: async (commentId) => {
    return await axios.delete(
      `${HM_DOMAIN}/api/comments/${encodeURIComponent(commentId)}`,
      { withCredentials: true },
    );
  },

  // 27-1. 댓글 좋아요 / 싫어요 저장 및 변경
  commentReaction: async (commentId, liked) => {
    return await axios.put(
      `${HM_DOMAIN}/api/comments/${encodeURIComponent(commentId)}/reaction`,
      liked,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },

  // 27-2. 댓글 반응 취소
  commentReactionDelete: async (commentId) => {
    return await axios.delete(
      `${HM_DOMAIN}/api/comments/${encodeURIComponent(commentId)}/reaction`,
      { withCredentials: true },
    );
  },

  // 28. 리뷰 반응 개수 조회
  reviewReactionCounts: async (reviewId, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}/reactions`,
      {
        withCredentials: true,
        signal,
      },
    );
  },

  // 로그인 회원의 특정 리뷰 반응 조회
  // true = 좋아요, false = 싫어요, null = 반응 없음
  reviewMyReactionGet: async (reviewId, signal) => {
    return await axios.get(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}/reaction`,
      {
        withCredentials: true,
        signal,
      },
    );
  },

  // 29. 리뷰 좋아요 / 싫어요 저장 및 변경
  // true = 좋아요, false = 싫어요
  reviewReaction: async (reviewId, liked) => {
    return await axios.put(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}/reaction`,
      liked,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },

  // 30. 리뷰 반응 취소
  reviewReactionDelete: async (reviewId) => {
    return await axios.delete(
      `${HM_DOMAIN}/api/reviews/${encodeURIComponent(reviewId)}/reaction`,
      { withCredentials: true },
    );
  },

  // 31. 로그인 회원이 좋아요한 리뷰 목록 조회
  myLikedReviews: async (page = 0, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/reviews/me/liked`, {
      params: { page },
      withCredentials: true,
      signal,
    });
  },
  // 공용 채팅 이미지 업로드 및 인증 이미지 조회
  chatImageUpload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axios.post(`${HM_DOMAIN}/api/chat/images`, formData, {
      withCredentials: true,
    });
  },

  chatImageGet: async (imageId, signal) => {
    return await axios.get(`${HM_DOMAIN}/api/chat/images/${encodeURIComponent(imageId)}`, {
      responseType: "blob",
      withCredentials: true,
      signal,
    });
  },
};

export default AxiosApi;
