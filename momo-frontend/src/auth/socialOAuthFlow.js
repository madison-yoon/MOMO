import AxiosApi, { getAuthSessionVersion, isAuthSessionCurrent, getAuthSessionIdentity, isAuthIdentityCurrent, getAuthSessionMarker } from "../api/AxiosApi";

const providers = {
  kakao: { name: "카카오", origin: "https://kauth.kakao.com", path: "/oauth/authorize" },
  naver: { name: "네이버", origin: "https://nid.naver.com", path: "/oauth2.0/authorize" },
  google: { name: "구글", origin: "https://accounts.google.com", path: "/o/oauth2/v2/auth" },
};
const attempts = new Map();
export const socialStateKey = provider => `momo-${provider}-login-state`;
const loginSessionKey = provider => `momo-${provider}-login-session`;
export const socialDeleteStateKey = provider => `momo-${provider}-delete-state`;
export const socialProviderName = provider => providers[provider]?.name || "소셜";
export const DELETE_CONFIRMATION = "MOMO 회원 탈퇴";

const readRecord = key => {
  try { return JSON.parse(sessionStorage.getItem(key)); }
  catch { return null; }
};
const readDelete = provider => readRecord(socialDeleteStateKey(provider));

const prepare = async (provider, purpose, confirmation) => {
  const config = providers[provider];
  if (!config) throw new Error("지원하지 않는 인증 방식입니다.");
  const version = getAuthSessionVersion();
  const sessionMarker = getAuthSessionMarker();
  const identity = getAuthSessionIdentity();
  if (purpose === "DELETE" && (!identity || !confirmation?.agreed || confirmation.confirmation !== DELETE_CONFIRMATION))
    throw new Error("회원 탈퇴 안내와 확인 문구를 확인해 주세요.");
  const { data } = await (purpose === "DELETE" ? AxiosApi.socialDeleteAuthorize(provider, confirmation) : AxiosApi.oauthAuthorize(provider));
  if (!isAuthSessionCurrent(version) || getAuthSessionMarker() !== sessionMarker || (purpose === "DELETE" && !isAuthIdentityCurrent(identity)))
    throw new Error("인증 상태가 변경되었습니다. 다시 시도해 주세요.");
  const url = new URL(data?.authorizationUrl);
  const state = url.searchParams.get("state");
  if (url.origin !== config.origin || url.pathname !== config.path || url.username || url.password
      || !/^[A-Za-z0-9_-]{43}$/.test(state || "")) throw new Error("소셜 인증 주소가 올바르지 않습니다.");
  if (purpose === "DELETE") sessionStorage.setItem(socialDeleteStateKey(provider), JSON.stringify({state, identity}));
  else {
    sessionStorage.setItem(socialStateKey(provider), state);
    sessionStorage.setItem(loginSessionKey(provider), JSON.stringify({state, sessionMarker}));
  }
  // 인가 코드는 메모리에만 보관하고 새 인가가 시작되면 이전 교환 결과를 폐기한다.
  attempts.delete(`${provider}:${purpose}`);
  return url.toString();
};
export const prepareSocialLogin = provider => prepare(provider, "LOGIN");
export const prepareSocialDelete = (provider, confirmation) => prepare(provider, "DELETE", confirmation);

export const clearSocialCallbackState = (provider, state) => {
  if (sessionStorage.getItem(socialStateKey(provider)) === state) sessionStorage.removeItem(socialStateKey(provider));
  if (readRecord(loginSessionKey(provider))?.state === state) sessionStorage.removeItem(loginSessionKey(provider));
  if (readDelete(provider)?.state === state) sessionStorage.removeItem(socialDeleteStateKey(provider));
};

// 탭의 목적 정보는 분기 힌트일 뿐이며, 서버가 목적·공급자·대상 회원을 최종 검증한다.
export const getSocialCallbackAttempt = (provider, code, state) => {
  const deletion = readDelete(provider);
  const isDelete = deletion?.state === state;
  const isLogin = sessionStorage.getItem(socialStateKey(provider)) === state;
  if (!providers[provider] || !code || !state || isDelete === isLogin)
    throw new Error("소셜 인증 요청을 확인할 수 없습니다. 다시 시작해 주세요.");
  if (isDelete && !isAuthIdentityCurrent(deletion.identity)) throw new Error("인증 상태가 변경되었습니다. 탈퇴를 다시 시작해 주세요.");
  const loginSession = readRecord(loginSessionKey(provider));
  if (isLogin && (loginSession?.state !== state || loginSession.sessionMarker !== getAuthSessionMarker()))
    throw new Error("인증 상태가 변경되었습니다. 다시 시작해 주세요.");
  const purpose = isDelete ? "DELETE" : "LOGIN";
  const key = `${provider}:${purpose}`;
  const previous = attempts.get(key);
  if (previous?.code === code && previous?.state === state && !previous.completed) return previous;
  const attempt = { code, state, purpose, sessionMarker: getAuthSessionMarker(), identity: deletion?.identity, sessionVersion: getAuthSessionVersion(), completed: false,
    promise: Promise.resolve().then(() => {
      if (!isAuthSessionCurrent(attempt.sessionVersion) || getAuthSessionMarker() !== attempt.sessionMarker || (isDelete && !isAuthIdentityCurrent(attempt.identity)))
        throw new Error("인증 상태가 변경되었습니다. 다시 시작해 주세요.");
      return isDelete ? AxiosApi.socialDeleteComplete(provider, code, state, {agreed:true, confirmation:DELETE_CONFIRMATION})
        : AxiosApi.oauthLogin(provider, code, state);
    }) };
  attempts.set(key, attempt);
  return attempt;
};
