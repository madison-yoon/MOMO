import { storeLoginTokens } from "../api/AxiosApi";

export const KAKAO_STATE_KEY = "momo-kakao-login-state";

// 일반·소셜 로그인 모두 같은 저장·이벤트 흐름을 사용하고 응답 검증 전에는 기존 회원정보를 건드리지 않는다.
export const completeLogin = (data, fallbackLoginId = "") => {
  const loginId = data?.loginId || fallbackLoginId;
  if (!loginId || typeof data?.accessToken !== "string" || !data.accessToken.trim()
      || typeof data?.refreshToken !== "string" || !data.refreshToken.trim()) {
    const error = new Error("로그인 토큰을 발급받지 못했습니다.");
    error.code = "MOMO_INVALID_LOGIN_RESPONSE";
    throw error;
  }
  const nickname = data.nickname || "회원";
  localStorage.setItem("username", loginId);
  localStorage.setItem("nickname", nickname);
  sessionStorage.removeItem(KAKAO_STATE_KEY);
  sessionStorage.removeItem("momo-naver-login-state");
  sessionStorage.removeItem("momo-google-login-state");
  ["kakao", "naver", "google"].forEach(provider => sessionStorage.removeItem(`momo-${provider}-login-session`));
  storeLoginTokens(data.accessToken, data.refreshToken);
  window.dispatchEvent(new CustomEvent("momo-toast", { detail: { nickname } }));
  return nickname;
};
