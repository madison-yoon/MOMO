jest.mock("axios", () => {
  const mockedAxios = jest.fn();
  mockedAxios.post = jest.fn();
  mockedAxios.get = jest.fn();
  mockedAxios.interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };
  return mockedAxios;
});

import axios from "axios";
import AxiosApi, { clearAuthSession, storeLoginTokens } from "./AxiosApi";

const requestInterceptor = axios.interceptors.request.use.mock.calls[0][0];
const responseErrorInterceptor = axios.interceptors.response.use.mock.calls[0][1];
const API_URL = "http://localhost:8111/api/private";

test("카카오 요청은 쿠키를 포함하고 401에서 JWT 재발급을 시도하지 않는다", async () => {
  axios.get.mockResolvedValue({data:{}});
  axios.post.mockResolvedValue({data:{}});
  await AxiosApi.oauthAuthorize("kakao");
  await AxiosApi.oauthLogin("kakao", "test-code", "test-state");
  expect(axios.get).toHaveBeenCalledWith("http://localhost:8111/api/auth/kakao/authorize", {withCredentials:true});
  expect(axios.post).toHaveBeenCalledWith("http://localhost:8111/api/auth/kakao", {code:"test-code",state:"test-state"}, expect.objectContaining({withCredentials:true}));
  axios.post.mockClear();
  storeLoginTokens("existing-access", "existing-refresh");
  for (const path of ["/api/auth/kakao/authorize", "/api/auth/kakao"]) {
    const config=requestInterceptor({url:`http://localhost:8111${path}`,headers:{}});
    expect(config.headers.Authorization).toBeUndefined();
    const error={response:{status:401},config};
    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
  }
  expect(axios.post).not.toHaveBeenCalled();
  expect(localStorage.getItem("refreshToken")).toBe("existing-refresh");
});

function unauthorizedRequest() {
  return requestInterceptor({
    url: API_URL,
    headers: {},
  });
}

function unauthorizedError(config) {
  return {
    response: { status: 401 },
    config,
  };
}

describe("AxiosApi authentication interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    axios.mockReset();
    axios.post.mockReset();
    axios.mockResolvedValue({ data: { success: true } });
  });

  test("clearAuthSession removes both tokens and broadcasts one auth event", () => {
    storeLoginTokens("access-token", "refresh-token");
    const listener = jest.fn();
    window.addEventListener("momo-auth-changed", listener);

    clearAuthSession();

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("username")).toBeNull();
    expect(localStorage.getItem("nickname")).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener("momo-auth-changed", listener);
  });

  test("an older refresh promise cannot clear a newer session refresh promise", async () => {
    const pending = [];
    axios.post.mockImplementation(
      () =>
        new Promise((resolve) => {
          pending.push({ resolve });
        }),
    );

    storeLoginTokens("old-access", "old-refresh");
    const firstRequest = unauthorizedRequest();
    const firstRefresh = responseErrorInterceptor(
      unauthorizedError(firstRequest),
    );

    // 로그아웃 후 다른 계정으로 로그인해 새로운 재발급을 시작한다.
    clearAuthSession();
    storeLoginTokens("new-access", "new-refresh");

    const secondRequest = unauthorizedRequest();
    const secondRefresh = responseErrorInterceptor(
      unauthorizedError(secondRequest),
    );

    // 이전 세션의 응답은 새 토큰을 저장하지 못해야 한다.
    pending[0].resolve({
      data: {
        accessToken: "stale-access",
        refreshToken: "stale-refresh",
      },
    });

    await expect(firstRefresh).rejects.toMatchObject({
      code: "MOMO_AUTH_SESSION_CHANGED",
    });

    // 이전 Promise의 finally가 새 Promise를 지우지 않았는지 확인한다.
    const thirdRequest = unauthorizedRequest();
    const thirdRefresh = responseErrorInterceptor(
      unauthorizedError(thirdRequest),
    );

    expect(axios.post).toHaveBeenCalledTimes(2);

    pending[1].resolve({
      data: {
        accessToken: "fresh-access",
        refreshToken: "fresh-refresh",
      },
    });

    await Promise.all([secondRefresh, thirdRefresh]);

    expect(localStorage.getItem("accessToken")).toBe("fresh-access");
    expect(localStorage.getItem("refreshToken")).toBe("fresh-refresh");
  });

  test("temporary refresh server errors do not erase a valid local session", async () => {
    storeLoginTokens("access-token", "refresh-token");
    axios.post.mockRejectedValue({
      response: { status: 503 },
    });

    const request = unauthorizedRequest();

    await expect(
      responseErrorInterceptor(unauthorizedError(request)),
    ).rejects.toMatchObject({
      response: { status: 503 },
    });

    expect(localStorage.getItem("accessToken")).toBe("access-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
  });
});


describe("unified movie detail API", () => {
  test("uses one resolve endpoint for both KOBIS codes and TMDb identifiers", async () => {
    axios.get.mockResolvedValue({ data: { title: "테스트 영화" } });

    await AxiosApi.movieDetailByIdentifier("1571245");
    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:8111/api/movies/resolve/1571245",
      { signal: undefined },
    );

    axios.get.mockClear();
    await AxiosApi.movieDetailByIdentifier("20259894");
    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:8111/api/movies/resolve/20259894",
      { signal: undefined },
    );
  });
});


describe("abortable read APIs", () => {
  test("passes AbortSignal to member ID availability checks", async () => {
    const controller = new AbortController();
    axios.get.mockResolvedValue({ data: false });

    await AxiosApi.memberIdExist("momo-user", controller.signal);

    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:8111/api/auth/exists/id/momo-user",
      { signal: controller.signal },
    );
  });

  test("passes AbortSignal to filmography movie resolution", async () => {
    const controller = new AbortController();
    axios.get.mockResolvedValue({ data: { movieCode: "20240001" } });

    await AxiosApi.resolveFilmographyMovie(12345, controller.signal);

    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:8111/api/persons/filmography/12345",
      { signal: controller.signal },
    );
  });

  test("supports aborting the current user's profile image request", async () => {
    const controller = new AbortController();
    axios.get.mockResolvedValue({ data: new Blob() });

    await AxiosApi.profileImageGet(controller.signal);

    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost:8111/api/auth/me/profile-image",
      {
        withCredentials: true,
        responseType: "blob",
        signal: controller.signal,
      },
    );
  });
});


describe("네이버·구글 OAuth API 계약", () => {
  test.each(["naver", "google"])("%s 시작과 코드 교환은 쿠키를 포함한다", async provider => {
    axios.get.mockResolvedValue({data:{}}); axios.post.mockResolvedValue({data:{}});
    await AxiosApi.oauthAuthorize(provider);
    expect(axios.get).toHaveBeenCalledWith(`http://localhost:8111/api/auth/${provider}/authorize`, {withCredentials:true});
    await AxiosApi.oauthLogin(provider, "test-code", "test-state");
    expect(axios.post).toHaveBeenCalledWith(`http://localhost:8111/api/auth/${provider}`, {code:"test-code",state:"test-state"}, expect.objectContaining({withCredentials:true}));
  });
});


test.each(["naver", "google"])("%s OAuth 401은 재발급·기존 세션 삭제 없이 콜백에 전달한다", async provider => {
  axios.post.mockClear(); storeLoginTokens("current-access", "current-refresh");
  for (const suffix of ["", "/authorize"]) {
    const config = requestInterceptor({url:`http://localhost:8111/api/auth/${provider}${suffix}`,headers:{}});
    expect(config.headers.Authorization).toBeUndefined();
    const error = {response:{status:401},config};
    await expect(responseErrorInterceptor(error)).rejects.toBe(error);
  }
  expect(axios.post).not.toHaveBeenCalled();
  expect(localStorage.getItem("refreshToken")).toBe("current-refresh");
});

test.each(["kakao","naver","google"])("%s 탈퇴 API는 로그인 공개 경로와 달리 Bearer 인증을 전달한다", provider => {
  storeLoginTokens("delete-access", "delete-refresh");
  const config=requestInterceptor({url:`http://localhost:8111/api/auth/${provider}/delete/complete`,headers:{}});
  expect(config.headers.Authorization).toBe("Bearer delete-access");
});
