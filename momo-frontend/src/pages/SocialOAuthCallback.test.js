jest.mock("../components/redesign/ArchiveAuthFrame", () => ({children}) => children);
jest.mock("../api/AxiosApi", () => ({
  __esModule: true, default: { naverAuthorize: jest.fn(), naverLogin: jest.fn(), googleAuthorize: jest.fn(), googleLogin: jest.fn() },
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
import { prepareSocialLogin } from "../auth/socialOAuthFlow";
import SocialOAuthCallback from "./SocialOAuthCallback";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); jest.clearAllMocks(); isAuthSessionCurrent.mockReturnValue(true); });
const mount = (query, provider) => { mockQuery = query; return render(<StrictMode><SocialOAuthCallback provider={provider} /></StrictMode>); };

test.each(["naver", "google"])("StrictMode 콜백에서도 코드 교환·로그인 완료가 한 번만 실행된다", async provider => {
  const state="d".repeat(43);
  AxiosApi[`${provider}Authorize`].mockResolvedValue({data:{authorizationUrl:`${provider === "naver" ? "https://nid.naver.com/oauth2.0/authorize" : "https://accounts.google.com/o/oauth2/v2/auth"}?state=${state}`}});
  await prepareSocialLogin(provider);
  AxiosApi[`${provider}Login`].mockResolvedValue({data:{loginId:"kakao-test",nickname:"검증회원",accessToken:"test-access",refreshToken:"test-refresh"}});
  mount(`code=test-code&state=${state}`, provider);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/", {replace:true}));
  expect(AxiosApi[`${provider}Login`]).toHaveBeenCalledTimes(1);
  expect(storeLoginTokens).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem("username")).toBe("kakao-test");
});

test.each(["naver", "google"])("다른 인증 상태가 시작되면 늦은 콜백이 현재 세션을 덮어쓰지 않는다", async provider => {
  const state="f".repeat(43);
  AxiosApi[`${provider}Authorize`].mockResolvedValue({data:{authorizationUrl:`${provider === "naver" ? "https://nid.naver.com/oauth2.0/authorize" : "https://accounts.google.com/o/oauth2/v2/auth"}?state=${state}`}});
  await prepareSocialLogin(provider);
  localStorage.setItem("username","current-member");
  isAuthSessionCurrent.mockReturnValue(false);
  AxiosApi[`${provider}Login`].mockResolvedValue({data:{loginId:"late-member",accessToken:"test-access",refreshToken:"test-refresh"}});
  mount(`code=late-code&state=${state}`, provider);
  await waitFor(()=>expect(screen.getByRole("alert")).toHaveTextContent("인증 상태가 변경"));
  expect(storeLoginTokens).not.toHaveBeenCalled();
  expect(localStorage.getItem("username")).toBe("current-member");
});

test.each(["naver", "google"])("인증 취소는 안내만 표시하고 서버 코드 교환을 하지 않는다", async provider => {
  mount("error=access_denied", provider);
  expect(await screen.findByRole("alert")).toHaveTextContent("취소");
  expect(AxiosApi[`${provider}Login`]).not.toHaveBeenCalled();
});

test.each(["naver", "google"])("코드 교환 401은 로그인 안내를 표시하고 회원정보를 보존한다", async provider => {
  const state="e".repeat(43);
  AxiosApi[`${provider}Authorize`].mockResolvedValue({data:{authorizationUrl:`${provider === "naver" ? "https://nid.naver.com/oauth2.0/authorize" : "https://accounts.google.com/o/oauth2/v2/auth"}?state=${state}`}});
  await prepareSocialLogin(provider);
  localStorage.setItem("username","existing-member");
  AxiosApi[`${provider}Login`].mockRejectedValue({response:{status:401,data:{message:"카카오 인증을 다시 시작해 주세요."}}});
  mount(`code=failed-code&state=${state}`, provider);
  await waitFor(()=>expect(screen.getByRole("alert")).toHaveTextContent("다시 시작"));
  expect(storeLoginTokens).not.toHaveBeenCalled();
  expect(localStorage.getItem("username")).toBe("existing-member");
});
