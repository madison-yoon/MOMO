jest.mock("../api/AxiosApi", () => ({ storeLoginTokens: jest.fn() }));
import { storeLoginTokens } from "../api/AxiosApi";
import { completeLogin } from "./completeLogin";

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); jest.clearAllMocks(); });

test.each(["local-member", "kakao-generated"])("%s 로그인은 기존 회원정보·토큰 저장과 알림을 재사용한다", loginId => {
  const toast = jest.fn(); window.addEventListener("momo-toast", toast);
  try {
    completeLogin({ loginId, nickname: "검증회원", accessToken: "test-access", refreshToken: "test-refresh" });
    expect(localStorage.getItem("username")).toBe(loginId);
    expect(localStorage.getItem("nickname")).toBe("검증회원");
    expect(storeLoginTokens).toHaveBeenCalledWith("test-access", "test-refresh");
    expect(toast).toHaveBeenCalledTimes(1);
  } finally { window.removeEventListener("momo-toast", toast); }
});

test("토큰 누락 시 기존 회원정보를 덮어쓰지 않는다", () => {
  localStorage.setItem("username", "current-member");
  expect(() => completeLogin({ loginId: "other", accessToken: "test-access" })).toThrow();
  expect(localStorage.getItem("username")).toBe("current-member");
  expect(storeLoginTokens).not.toHaveBeenCalled();
});
