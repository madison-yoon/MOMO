import AxiosApi, { getAuthSessionVersion, isAuthSessionCurrent } from "../api/AxiosApi";

const providers = {
  naver: { name: "네이버", origin: "https://nid.naver.com", path: "/oauth2.0/authorize" },
  google: { name: "구글", origin: "https://accounts.google.com", path: "/o/oauth2/v2/auth" },
};
const attempts = new Map();
export const socialStateKey = provider => `momo-${provider}-login-state`;
export const socialProviderName = provider => providers[provider]?.name || "소셜";

// 서버가 만든 인가 URL만 사용하고 state만 현재 탭에 보관한다. Client Secret·PKCE 검증값은 받지 않는다.
export const prepareSocialLogin = async provider => {
  const config = providers[provider];
  if (!config) throw new Error("지원하지 않는 로그인 방식입니다.");
  const version = getAuthSessionVersion();
  const { data } = await AxiosApi[`${provider}Authorize`]();
  if (!isAuthSessionCurrent(version)) throw new Error("인증 상태가 변경되었습니다. 다시 시도해 주세요.");
  const url = new URL(data?.authorizationUrl);
  const state = url.searchParams.get("state");
  if (url.origin !== config.origin || url.pathname !== config.path || url.username || url.password
      || !/^[A-Za-z0-9_-]{43}$/.test(state || "")) throw new Error("소셜 로그인 주소가 올바르지 않습니다.");
  sessionStorage.setItem(socialStateKey(provider), state);
  attempts.delete(provider);
  return url.toString();
};

// StrictMode와 재마운트는 진행 중인 한 요청을 공유한다. 공급자 사이에는 인가 코드·state를 공유하지 않는다.
export const getSocialCallbackAttempt = (provider, code, state) => {
  if (!providers[provider] || !code || !state || sessionStorage.getItem(socialStateKey(provider)) !== state)
    throw new Error("소셜 로그인 요청을 확인할 수 없습니다. 로그인을 다시 시작해 주세요.");
  const previous = attempts.get(provider);
  if (previous?.code === code && previous?.state === state && !previous.completed) return previous;
  const attempt = { code, state, sessionVersion: getAuthSessionVersion(), completed: false,
    promise: Promise.resolve().then(() => AxiosApi[`${provider}Login`](code, state)) };
  attempts.set(provider, attempt);
  return attempt;
};
