jest.mock("../api/AxiosApi", () => ({__esModule:true,default:{naverAuthorize:jest.fn(),naverLogin:jest.fn(),googleAuthorize:jest.fn(),googleLogin:jest.fn()},getAuthSessionVersion:()=>1,isAuthSessionCurrent:()=>true}));
import api from "../api/AxiosApi";
import {prepareSocialLogin,getSocialCallbackAttempt,socialStateKey} from "./socialOAuthFlow";
beforeEach(()=>{sessionStorage.clear();jest.clearAllMocks();});
test.each(["naver","google"])("%s 시작·state 저장·중복 콜백 단일 요청",async provider=>{
 const state=(provider==="naver"?"n":"g").repeat(43);
 const base=provider==="naver"?"https://nid.naver.com/oauth2.0/authorize":"https://accounts.google.com/o/oauth2/v2/auth";
 api[provider+"Authorize"].mockResolvedValue({data:{authorizationUrl:base+"?state="+state}});
 await prepareSocialLogin(provider);expect(sessionStorage.getItem(socialStateKey(provider))).toBe(state);
 api[provider+"Login"].mockResolvedValue({data:{}});
 const a=getSocialCallbackAttempt(provider,"test-code",state);const b=getSocialCallbackAttempt(provider,"test-code",state);
 expect(a).toBe(b);await a.promise;expect(api[provider+"Login"]).toHaveBeenCalledTimes(1);
});
test.each(["naver","google"])("%s 외부 주소 변조와 미시작 콜백 차단",async provider=>{
 api[provider+"Authorize"].mockResolvedValue({data:{authorizationUrl:"https://attacker.test/?state="+"s".repeat(43)}});
 await expect(prepareSocialLogin(provider)).rejects.toThrow();
 expect(()=>getSocialCallbackAttempt(provider,"code","unissued")).toThrow();expect(api[provider+"Login"]).not.toHaveBeenCalled();
});
