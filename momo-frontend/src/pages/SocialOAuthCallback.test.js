jest.mock("axios", () => jest.requireActual("axios/dist/node/axios.cjs"));
jest.mock("../components/redesign/ArchiveAuthFrame", () => ({children}) => children);
import React, { StrictMode } from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
const mockNavigate = jest.fn();
let mockQuery = "";
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockQuery)],
  Link: ({children}) => require("react").createElement("a", null, children),
}));
import AxiosApi, { storeLoginTokens, clearAuthSession } from "../api/AxiosApi";
import { prepareSocialLogin, prepareSocialDelete } from "../auth/socialOAuthFlow";
import SocialOAuthCallback from "./SocialOAuthCallback";
const bases={kakao:"https://kauth.kakao.com/oauth/authorize",naver:"https://nid.naver.com/oauth2.0/authorize",google:"https://accounts.google.com/o/oauth2/v2/auth"};
let serial=0;
const nextState=()=>String(++serial).padStart(43,"s");
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
beforeEach(() => { localStorage.clear();sessionStorage.clear();jest.restoreAllMocks();jest.clearAllMocks();jest.spyOn(window,"alert").mockImplementation(()=>{}); });
const mount=(query,provider)=>{mockQuery=query;return render(<StrictMode><SocialOAuthCallback provider={provider}/></StrictMode>);};
async function start(provider,purpose="LOGIN") {
 const state=nextState();
 jest.spyOn(AxiosApi,purpose==="LOGIN"?"oauthAuthorize":"socialDeleteAuthorize").mockResolvedValue({data:{authorizationUrl:bases[provider]+"?state="+state}});
 if(purpose==="LOGIN")await prepareSocialLogin(provider);
 else await prepareSocialDelete(provider,{agreed:true,confirmation:"MOMO 회원 탈퇴"});
 return state;
}
test.each(Object.keys(bases))("%s StrictMode 콜백은 코드 교환·로그인 완료를 한 번만 실행한다",async provider=>{
 const state=await start(provider);
 const login=jest.spyOn(AxiosApi,"oauthLogin").mockResolvedValue({data:{loginId:"social-test",nickname:"검증회원",accessToken:"test-access",refreshToken:"test-refresh"}});
 const changed=jest.fn();window.addEventListener("momo-auth-changed",changed);
 try{mount(`code=test-code&state=${state}`,provider);await waitFor(()=>expect(mockNavigate).toHaveBeenCalledWith("/",{replace:true}));
 expect(login).toHaveBeenCalledTimes(1);expect(changed).toHaveBeenCalledTimes(1);expect(localStorage.getItem("username")).toBe("social-test");expect(localStorage.getItem("accessToken")).toBe("test-access");
 }finally{window.removeEventListener("momo-auth-changed",changed);}
});
test.each(Object.keys(bases))("%s 늦은 로그인 콜백은 다른 세션을 덮어쓰지 않는다",async provider=>{
 const state=await start(provider);const pending=deferred();jest.spyOn(AxiosApi,"oauthLogin").mockReturnValue(pending.promise);
 mount(`code=late-code&state=${state}`,provider);await act(async()=>{});
 localStorage.setItem("username","current-member");storeLoginTokens("current-access","current-refresh");
 await act(async()=>pending.resolve({data:{loginId:"late-member",accessToken:"late-access",refreshToken:"late-refresh"}}));
 expect(await screen.findByRole("alert")).toHaveTextContent("인증 상태가 변경");expect(localStorage.getItem("username")).toBe("current-member");expect(localStorage.getItem("accessToken")).toBe("current-access");
});
test.each(Object.keys(bases))("%s 인증 취소는 교환하지 않고 안내한다",async provider=>{
 const login=jest.spyOn(AxiosApi,"oauthLogin");mount("error=access_denied",provider);
 expect(await screen.findByRole("alert")).toHaveTextContent("취소");expect(login).not.toHaveBeenCalled();
});
test.each(Object.keys(bases))("%s 로그인 401은 기존 세션을 보존하고 다시 시작하도록 안내한다",async provider=>{
 localStorage.setItem("username","existing-member");storeLoginTokens("existing-access","existing-refresh");const state=await start(provider);
 jest.spyOn(AxiosApi,"oauthLogin").mockRejectedValue({response:{status:401,data:{message:"인증을 다시 시작해 주세요."}}});mount(`code=failed-code&state=${state}`,provider);
 expect(await screen.findByRole("alert")).toHaveTextContent("다시 시작");expect(AxiosApi.oauthLogin).toHaveBeenCalledTimes(1);expect(localStorage.getItem("username")).toBe("existing-member");expect(localStorage.getItem("accessToken")).toBe("existing-access");
});
test.each(["naver","google"])("%s 탈퇴 콜백은 로그인하지 않고 현재 회원 세션만 지운다",async provider=>{
 localStorage.setItem("username","deleting-member");storeLoginTokens("access","refresh");const state=await start(provider,"DELETE");
 const deletion=jest.spyOn(AxiosApi,"socialDeleteComplete").mockResolvedValue({data:{}});const login=jest.spyOn(AxiosApi,"oauthLogin");
 mount(`code=delete-code&state=${state}`,provider);await waitFor(()=>expect(mockNavigate).toHaveBeenCalledWith("/login",{replace:true}));
 expect(deletion).toHaveBeenCalledTimes(1);expect(login).not.toHaveBeenCalled();expect(localStorage.getItem("accessToken")).toBeNull();expect(localStorage.getItem("username")).toBeNull();expect(window.alert).toHaveBeenCalledWith("회원 탈퇴가 완료되었습니다.");
});
test.each([403,502,503])("탈퇴 콜백 오류 %s는 성공 처리하지 않고 서버 안내와 현재 세션을 보존한다",async status=>{
 localStorage.setItem("username","member");storeLoginTokens("access","refresh");const state=await start("google","DELETE");
 jest.spyOn(AxiosApi,"socialDeleteComplete").mockRejectedValue({response:{status,data:{message:"탈퇴 미완료: 다시 확인해 주세요."}}});
 mount(`code=delete-failed&state=${state}`,"google");expect(await screen.findByRole("alert")).toHaveTextContent("탈퇴 미완료");
 expect(localStorage.getItem("accessToken")).toBe("access");expect(mockNavigate).not.toHaveBeenCalled();expect(window.alert).not.toHaveBeenCalled();
});
test("탈퇴 요청 중 다른 계정으로 로그인하면 이전 성공 응답으로 새 세션을 종료하지 않는다",async()=>{
 localStorage.setItem("username","member-a");storeLoginTokens("access-a","refresh-a");const state=await start("naver","DELETE");
 const pending=deferred();jest.spyOn(AxiosApi,"socialDeleteComplete").mockReturnValue(pending.promise);mount(`code=old-delete&state=${state}`,"naver");await act(async()=>{});
 clearAuthSession();localStorage.setItem("username","member-b");storeLoginTokens("access-b","refresh-b");await act(async()=>pending.resolve({data:{}}));
 expect(await screen.findByRole("alert")).toHaveTextContent("인증 상태가 변경");expect(localStorage.getItem("accessToken")).toBe("access-b");expect(mockNavigate).not.toHaveBeenCalled();
});

test("콜백 요청 중 다른 탭의 로그인은 메모리 버전이 그대로여도 응답 적용을 차단한다",async()=>{
 const state=await start("google");const pending=deferred();jest.spyOn(AxiosApi,"oauthLogin").mockReturnValue(pending.promise);
 mount(`code=late-code&state=${state}`,"google");await act(async()=>{});
 // 다른 탭에서는 이 번들의 storeLoginTokens가 실행되지 않아 메모리 버전이 그대로다.
 localStorage.setItem("username","member-b");localStorage.setItem("accessToken","B-access");localStorage.setItem("refreshToken","B-refresh");localStorage.setItem("momo-auth-session-id","B-session");
 await act(async()=>pending.resolve({data:{loginId:"member-a",accessToken:"A-access",refreshToken:"A-refresh"}}));
 expect(localStorage.getItem("username")).toBe("member-b");expect(await screen.findByRole("alert")).toHaveTextContent("인증 상태가 변경");expect(mockNavigate).not.toHaveBeenCalled();
});
