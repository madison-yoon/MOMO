import AxiosApi, { storeLoginTokens, clearAuthSession } from "../api/AxiosApi";
import { prepareSocialLogin, prepareSocialDelete, getSocialCallbackAttempt, socialStateKey } from "./socialOAuthFlow";
jest.mock("axios", () => jest.requireActual("axios/dist/node/axios.cjs"));
const bases = { kakao:"https://kauth.kakao.com/oauth/authorize", naver:"https://nid.naver.com/oauth2.0/authorize", google:"https://accounts.google.com/o/oauth2/v2/auth" };
let serial = 0;
const stateFor = () => String(++serial).padStart(43, "s");
beforeEach(() => { sessionStorage.clear(); localStorage.clear(); jest.restoreAllMocks(); });
function authorize(provider, state, purpose = "login") {
  jest.spyOn(AxiosApi, purpose === "login" ? "oauthAuthorize" : "socialDeleteAuthorize").mockResolvedValue({data:{authorizationUrl:bases[provider]+"?state="+state}});
}
test.each(Object.keys(bases))("%s 로그인은 기존 키를 보존하고 중복 교환을 공유한다", async provider => {
  const state = stateFor(); authorize(provider,state);
  expect(await prepareSocialLogin(provider)).toBe(bases[provider]+"?state="+state);
  expect(sessionStorage.getItem(`momo-${provider}-login-state`)).toBe(state);
  const login = jest.spyOn(AxiosApi,"oauthLogin").mockResolvedValue({data:{}});
  const a=getSocialCallbackAttempt(provider,"code",state), b=getSocialCallbackAttempt(provider,"code",state);
  expect(a).toBe(b); await a.promise;
  expect(login).toHaveBeenCalledTimes(1); expect(login).toHaveBeenCalledWith(provider,"code",state);
});
test.each(Object.keys(bases))("%s 변조된 인가 주소와 미시작 콜백은 차단한다", async provider => {
  jest.spyOn(AxiosApi,"oauthAuthorize").mockResolvedValue({data:{authorizationUrl:"https://attacker.test/?state="+stateFor()}});
  await expect(prepareSocialLogin(provider)).rejects.toThrow();
  expect(()=>getSocialCallbackAttempt(provider,"code",stateFor())).toThrow();
});
test.each(["naver","google"])("%s 탈퇴 state는 로그인과 격리되고 중복 요청을 공유한다",async provider=>{
  localStorage.setItem("username","member-a");storeLoginTokens("access","refresh");
  const loginState=stateFor();authorize(provider,loginState);await prepareSocialLogin(provider);
  const state=stateFor();authorize(provider,state,"delete");await prepareSocialDelete(provider,{agreed:true,confirmation:"MOMO 회원 탈퇴"});
  expect(sessionStorage.getItem(socialStateKey(provider))).toBe(loginState);
  const login=jest.spyOn(AxiosApi,"oauthLogin");const deletion=jest.spyOn(AxiosApi,"socialDeleteComplete").mockResolvedValue({status:200});
  const a=getSocialCallbackAttempt(provider,"delete-code",state),b=getSocialCallbackAttempt(provider,"delete-code",state);
  expect(a.purpose).toBe("DELETE");expect(a).toBe(b);await a.promise;
  expect(login).not.toHaveBeenCalled();expect(deletion).toHaveBeenCalledTimes(1);
  expect(deletion).toHaveBeenCalledWith(provider,"delete-code",state,{agreed:true,confirmation:"MOMO 회원 탈퇴"});
});
test.each(["different-account","same-account-new-session"])("전체 페이지 이동 후 %s 탈퇴 콜백은 서버 호출 전에 차단한다",async change=>{
  localStorage.setItem("username","member-a");storeLoginTokens("access","refresh");
  const state=stateFor();authorize("naver",state,"delete");await prepareSocialDelete("naver",{agreed:true,confirmation:"MOMO 회원 탈퇴"});
  clearAuthSession();localStorage.setItem("username",change==="different-account"?"member-b":"member-a");storeLoginTokens("new-access","new-refresh");
  const deletion=jest.spyOn(AxiosApi,"socialDeleteComplete");
  expect(()=>getSocialCallbackAttempt("naver","code",state)).toThrow(/인증 상태/);expect(deletion).not.toHaveBeenCalled();
});
test("동일 state가 LOGIN과 DELETE에 혼용되면 어느 코드도 교환하지 않는다",async()=>{
  localStorage.setItem("username","member-a");storeLoginTokens("access","refresh");
  const state=stateFor();authorize("google",state);await prepareSocialLogin("google");authorize("google",state,"delete");await prepareSocialDelete("google",{agreed:true,confirmation:"MOMO 회원 탈퇴"});
  expect(()=>getSocialCallbackAttempt("google","code",state)).toThrow();
});

test("페이지 재로드로 메모리 버전이 초기화되어도 탈퇴 대상 계정 변경을 차단한다",async()=>{
 localStorage.setItem("username","member-a");storeLoginTokens("access-a","refresh-a");const state=stateFor();authorize("google",state,"delete");await prepareSocialDelete("google",{agreed:true,confirmation:"MOMO 회원 탈퇴"});
 // 새 번들 인스턴스는 이전 메모리 버전과 무관하게 저장된 계정 식별자를 비교한다.
 localStorage.setItem("username","member-b");localStorage.setItem("momo-auth-session-id","new-session");
 jest.isolateModules(()=>{
  const api=require("../api/AxiosApi").default;const flow=require("./socialOAuthFlow");const deletion=jest.spyOn(api,"socialDeleteComplete");
  expect(()=>flow.getSocialCallbackAttempt("google","code",state)).toThrow(/인증 상태/);expect(deletion).not.toHaveBeenCalled();
 });
});

test("로그인 중 다른 탭에서 로그인한 뒤 페이지를 재로드해도 늦은 콜백이 새 계정을 덮어쓰지 않는다",async()=>{
 const state=stateFor();authorize("kakao",state);await prepareSocialLogin("kakao");
 localStorage.setItem("username","member-b");storeLoginTokens("B-access","B-refresh");
 jest.isolateModules(()=>{
  const api=require("../api/AxiosApi").default;const flow=require("./socialOAuthFlow");const login=jest.spyOn(api,"oauthLogin").mockResolvedValue({data:{}});
  expect(()=>flow.getSocialCallbackAttempt("kakao","late-code",state)).toThrow(/인증 상태/);expect(login).not.toHaveBeenCalled();
 });
});
test("익명 로그인 시작 후 다른 세션의 로그인·로그아웃을 거치면 이전 콜백을 거절한다",async()=>{
 const state=stateFor();authorize("naver",state);await prepareSocialLogin("naver");
 localStorage.setItem("username","member-b");storeLoginTokens("B-access","B-refresh");clearAuthSession();
 jest.isolateModules(()=>{
  const api=require("../api/AxiosApi").default;const flow=require("./socialOAuthFlow");const login=jest.spyOn(api,"oauthLogin").mockResolvedValue({data:{}});
  expect(()=>flow.getSocialCallbackAttempt("naver","late-code",state)).toThrow(/인증 상태/);expect(login).not.toHaveBeenCalled();
 });
});
