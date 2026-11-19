jest.mock("../api/AxiosApi", () => ({
  __esModule: true, default: { kakaoAuthorize: jest.fn(), kakaoLogin: jest.fn() },
  getAuthSessionVersion: () => 1, isAuthSessionCurrent: () => true,
}));
import AxiosApi from "../api/AxiosApi";
import { prepareKakaoLogin, getKakaoCallbackAttempt, KAKAO_STATE_KEY } from "./kakaoFlow";

beforeEach(() => { sessionStorage.clear(); jest.clearAllMocks(); });

test("인가 URL의 state를 현재 탭에 저장하고 카카오 주소만 허용한다", async () => {
  const state = "a".repeat(43);
  const url = `https://kauth.kakao.com/oauth/authorize?state=${state}`;
  AxiosApi.kakaoAuthorize.mockResolvedValue({ data: { authorizationUrl: url } });
  expect(await prepareKakaoLogin()).toBe(url);
  expect(sessionStorage.getItem(KAKAO_STATE_KEY)).toBe(state);
  AxiosApi.kakaoAuthorize.mockResolvedValue({ data: { authorizationUrl: "https://example.test/redirect" } });
  await expect(prepareKakaoLogin()).rejects.toThrow();
});

test("같은 code와 state의 중복 콜백은 한 요청을 공유한다", async () => {
  const state = "b".repeat(43);
  AxiosApi.kakaoAuthorize.mockResolvedValue({ data: { authorizationUrl: `https://kauth.kakao.com/oauth/authorize?state=${state}` } });
  await prepareKakaoLogin();
  AxiosApi.kakaoLogin.mockResolvedValue({ data: { accessToken: "test-access", refreshToken: "test-refresh" } });
  const first = getKakaoCallbackAttempt("test-code", state);
  const second = getKakaoCallbackAttempt("test-code", state);
  expect(second).toBe(first);
  await first.promise;
  expect(AxiosApi.kakaoLogin).toHaveBeenCalledTimes(1);
  expect(AxiosApi.kakaoLogin).toHaveBeenCalledWith("test-code", state);
});

test("다른 탭·시작하지 않은 콜백은 서버에 전달하지 않는다", () => {
  expect(() => getKakaoCallbackAttempt("code", "c".repeat(43))).toThrow();
  expect(AxiosApi.kakaoLogin).not.toHaveBeenCalled();
});
