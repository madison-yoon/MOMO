import AxiosApi, { getAuthSessionVersion, isAuthSessionCurrent } from "../api/AxiosApi";
import { KAKAO_STATE_KEY } from "../utils/completeLogin";
export { KAKAO_STATE_KEY } from "../utils/completeLogin";

// 진행 중인 콜백 한 건만 메모리에 보관하고 인가 코드는 영구 저장소에 남기지 않는다.
let callbackAttempt = null;

export const prepareKakaoLogin = async () => {
  const version = getAuthSessionVersion();
  const { data } = await AxiosApi.kakaoAuthorize();
  if (!isAuthSessionCurrent(version)) throw new Error("인증 상태가 변경되었습니다. 다시 시도해 주세요.");
  const url = new URL(data?.authorizationUrl);
  const state = url.searchParams.get("state");
  if (url.origin !== "https://kauth.kakao.com" || url.pathname !== "/oauth/authorize"
      || url.username || url.password || !/^[A-Za-z0-9_-]{43}$/.test(state || "")) {
    throw new Error("카카오 로그인 주소가 올바르지 않습니다.");
  }
  sessionStorage.setItem(KAKAO_STATE_KEY, state);
  callbackAttempt = null;
  return url.toString();
};

// StrictMode 재실행·같은 콜백의 재마운트가 일회용 code를 두 번 교환하지 않도록 Promise를 공유한다.
export const getKakaoCallbackAttempt = (code, state) => {
  if (callbackAttempt?.code === code && callbackAttempt?.state === state && !callbackAttempt.completed) return callbackAttempt;
  if (!code || !state || sessionStorage.getItem(KAKAO_STATE_KEY) !== state) {
    throw new Error("카카오 로그인 요청을 확인할 수 없습니다. 로그인을 다시 시작해 주세요.");
  }
  callbackAttempt = {
    code, state, sessionVersion: getAuthSessionVersion(), completed: false,
    promise: Promise.resolve().then(() => AxiosApi.kakaoLogin(code, state)),
  };
  return callbackAttempt;
};
