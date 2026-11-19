jest.mock("../components/redesign/ArchiveAuthFrame", () => ({children}) => children);
jest.mock("../api/AxiosApi", () => ({
  __esModule: true, default: { kakaoAuthorize: jest.fn(), kakaoLogin: jest.fn() },
  getAuthSessionVersion: () => 1, isAuthSessionCurrent: jest.fn(() => true), storeLoginTokens: jest.fn(),
}));
import React, { StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
const mockNavigate = jest.fn();
let mockQuery = "";
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockQuery)],
  Link: ({children}) => require("react").createElement("a", null, children),
}));
import AxiosApi, { storeLoginTokens, isAuthSessionCurrent } from "../api/AxiosApi";
import { prepareKakaoLogin } from "../auth/kakaoFlow";
import KakaoCallback from "./KakaoCallback";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); jest.clearAllMocks(); isAuthSessionCurrent.mockReturnValue(true); });
const mount = query => { mockQuery = query; return render(<StrictMode><KakaoCallback /></StrictMode>); };

test("StrictMode 콜백에서도 코드 교환·로그인 완료가 한 번만 실행된다", async () => {
  const state="d".repeat(43);
  AxiosApi.kakaoAuthorize.mockResolvedValue({data:{authorizationUrl:`https://kauth.kakao.com/oauth/authorize?state=${state}`}});
  await prepareKakaoLogin();
  AxiosApi.kakaoLogin.mockResolvedValue({data:{loginId:"kakao-test",nickname:"검증회원",accessToken:"test-access",refreshToken:"test-refresh"}});
  mount(`code=test-code&state=${state}`);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/", {replace:true}));
  expect(AxiosApi.kakaoLogin).toHaveBeenCalledTimes(1);
  expect(storeLoginTokens).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem("username")).toBe("kakao-test");
});

test("다른 인증 상태가 시작되면 늦은 콜백이 현재 세션을 덮어쓰지 않는다", async () => {
  const state="f".repeat(43);
  AxiosApi.kakaoAuthorize.mockResolvedValue({data:{authorizationUrl:`https://kauth.kakao.com/oauth/authorize?state=${state}`}});
  await prepareKakaoLogin();
  localStorage.setItem("username","current-member");
  isAuthSessionCurrent.mockReturnValue(false);
  AxiosApi.kakaoLogin.mockResolvedValue({data:{loginId:"late-member",accessToken:"test-access",refreshToken:"test-refresh"}});
  mount(`code=late-code&state=${state}`);
  await waitFor(()=>expect(screen.getByRole("alert")).toHaveTextContent("인증 상태가 변경"));
  expect(storeLoginTokens).not.toHaveBeenCalled();
  expect(localStorage.getItem("username")).toBe("current-member");
});

test("인증 취소는 안내만 표시하고 서버 코드 교환을 하지 않는다", async () => {
  mount("error=access_denied");
  expect(await screen.findByRole("alert")).toHaveTextContent("취소");
  expect(AxiosApi.kakaoLogin).not.toHaveBeenCalled();
});

test("코드 교환 401은 로그인 안내를 표시하고 회원정보를 보존한다", async () => {
  const state="e".repeat(43);
  AxiosApi.kakaoAuthorize.mockResolvedValue({data:{authorizationUrl:`https://kauth.kakao.com/oauth/authorize?state=${state}`}});
  await prepareKakaoLogin();
  localStorage.setItem("username","existing-member");
  AxiosApi.kakaoLogin.mockRejectedValue({response:{status:401,data:{message:"카카오 인증을 다시 시작해 주세요."}}});
  mount(`code=failed-code&state=${state}`);
  await waitFor(()=>expect(screen.getByRole("alert")).toHaveTextContent("다시 시작"));
  expect(storeLoginTokens).not.toHaveBeenCalled();
  expect(localStorage.getItem("username")).toBe("existing-member");
});
