jest.mock("axios", () => jest.requireActual("axios/dist/node/axios.cjs"));

import axios from "axios";
import "./AxiosApi";
import { storeLoginTokens, clearAuthSession, getAuthSessionVersion } from "./AxiosApi";

const URL = "http://localhost:8111/api/private";
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const response = (config, data = {}) => ({ status: 200, data, config, headers: {} });
const failure = (config, status) => new axios.AxiosError("test request failure", "ERR_BAD_RESPONSE", config, null, { status, data: {}, headers: {}, config });
const flushUntil = async (predicate) => { for (let i = 0; i < 80; i++) { if (predicate()) return; await Promise.resolve(); } throw new Error("Expected adapter stage was not reached"); };
let originalAdapter, originalTransforms;
beforeEach(() => {
  originalAdapter = axios.defaults.adapter;
  originalTransforms = axios.defaults.transformRequest;
  localStorage.clear();
  window.history.replaceState({}, "", "/login");
  storeLoginTokens("A-access", "A-refresh");
});
afterEach(() => { axios.defaults.adapter = originalAdapter; axios.defaults.transformRequest = originalTransforms; });

function delayedRefreshAdapter() {
  const pending = [];
  const adapter = jest.fn(config => {
    if (config.url.endsWith("/reissue")) { const task = deferred(); pending.push({ ...task, config }); return task.promise; }
    if (!config._retry) return Promise.reject(failure(config, 401));
    return Promise.resolve(response(config, { ok: true }));
  });
  axios.defaults.adapter = adapter;
  return { pending, adapter };
}

test.each(["success", "401"])("old A refresh %s preserves B tokens and member information", async mode => {
  const { pending } = delayedRefreshAdapter();
  const result = axios.get(URL).catch(error => error);
  await flushUntil(() => pending.length === 1);
  clearAuthSession(); storeLoginTokens("B-access", "B-refresh");
  localStorage.setItem("username", "B-member"); localStorage.setItem("nickname", "B-name");
  const changed = jest.fn(); window.addEventListener("momo-auth-changed", changed);
  try {
    if (mode === "success") pending[0].resolve(response(pending[0].config, { accessToken: "stale-access", refreshToken: "stale-refresh" }));
    else pending[0].reject(failure(pending[0].config, 401));
    expect((await result).code).toBe("MOMO_AUTH_SESSION_CHANGED");
    expect(localStorage.getItem("accessToken")).toBe("B-access");
    expect(localStorage.getItem("refreshToken")).toBe("B-refresh");
    expect(localStorage.getItem("nickname")).toBe("B-name");
    expect(changed).not.toHaveBeenCalled();
  } finally { window.removeEventListener("momo-auth-changed", changed); }
});

test("old promise rejection cannot clear B's shared refresh promise", async () => {
  const { pending } = delayedRefreshAdapter();
  const a = axios.get(URL).catch(error => error);
  await flushUntil(() => pending.length === 1);
  storeLoginTokens("B-access", "B-refresh");
  const b1 = axios.get(URL);
  await flushUntil(() => pending.length === 2);
  pending[0].reject(failure(pending[0].config, 401));
  expect((await a).code).toBe("MOMO_AUTH_SESSION_CHANGED");
  const b2 = axios.get(URL);
  await flushUntil(() => axios.defaults.adapter.mock.calls.filter(([c]) => c.url === URL).length === 3);
  for (let i = 0; i < 12; i++) await Promise.resolve();
  expect(pending).toHaveLength(2);
  pending[1].resolve(response(pending[1].config, { accessToken: "B-new-access", refreshToken: "B-new-refresh" }));
  await Promise.all([b1, b2]);
  expect(localStorage.getItem("accessToken")).toBe("B-new-access");
});

test("same-session concurrent 401 requests share exactly one refresh", async () => {
  const { pending } = delayedRefreshAdapter();
  const requests = [axios.get(URL), axios.get(URL), axios.get(URL)];
  await flushUntil(() => pending.length === 1);
  for (let i = 0; i < 12; i++) await Promise.resolve();
  expect(pending).toHaveLength(1);
  pending[0].resolve(response(pending[0].config, { accessToken: "A-new-access", refreshToken: "A-new-refresh" }));
  expect((await Promise.all(requests)).every(r => r.status === 200)).toBe(true);
});

test("a late 401 reuses the already renewed token without another refresh", async () => {
  const delayed = deferred(); let secondConfig; let refreshCalls = 0;
  axios.defaults.adapter = jest.fn(config => {
    if (config.url.endsWith("/reissue")) { refreshCalls++; return Promise.resolve(response(config, { accessToken: "fresh-access", refreshToken: "fresh-refresh" })); }
    if (config._retry) return Promise.resolve(response(config));
    if (config.url.endsWith("/late")) { secondConfig = config; return delayed.promise; }
    return Promise.reject(failure(config, 401));
  });
  const late = axios.get(URL + "/late");
  await axios.get(URL);
  delayed.reject(failure(secondConfig, 401));
  await late;
  expect(refreshCalls).toBe(1);
});

test("adapter boundary blocks retry if session changes after request interceptors", async () => {
  const calls = [];
  axios.defaults.transformRequest = [...originalTransforms, function(data) {
    if (this._retry) storeLoginTokens("B-access", "B-refresh");
    return data;
  }];
  axios.defaults.adapter = jest.fn(config => {
    calls.push(config.url);
    if (config.url.endsWith("/reissue")) return Promise.resolve(response(config, { accessToken: "fresh-access", refreshToken: "fresh-refresh" }));
    return Promise.reject(failure(config, 401));
  });
  await expect(axios.get(URL)).rejects.toMatchObject({ code: "MOMO_AUTH_SESSION_CHANGED" });
  expect(calls.filter(url => url === URL)).toHaveLength(1);
  expect(localStorage.getItem("accessToken")).toBe("B-access");
});

test("same-session refresh rejection logs out once", async () => {
  const { pending } = delayedRefreshAdapter();
  const changed = jest.fn(); window.addEventListener("momo-auth-changed", changed);
  try {
    const a = axios.get(URL).catch(error => error);
    const b = axios.get(URL).catch(error => error);
    await flushUntil(() => pending.length === 1);
    pending[0].reject(failure(pending[0].config, 401));
    await Promise.all([a, b]);
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(changed).toHaveBeenCalledTimes(1);
  } finally { window.removeEventListener("momo-auth-changed", changed); }
});

test.each([503, "network"])("refresh %s failure preserves the current session", async status => {
  axios.defaults.adapter = config => {
    if (config.url.endsWith("/reissue")) return Promise.reject(status === "network" ? new axios.AxiosError("network failure", "ERR_NETWORK", config) : failure(config, status));
    return Promise.reject(failure(config, 401));
  };
  await expect(axios.get(URL)).rejects.toBeDefined();
  expect(localStorage.getItem("accessToken")).toBe("A-access");
  expect(localStorage.getItem("refreshToken")).toBe("A-refresh");
});

test("old successful protected response is discarded after new login", async () => {
  const delayed = deferred(); let sent;
  axios.defaults.adapter = config => { sent = config; return delayed.promise; };
  const result = axios.get(URL).catch(error => error);
  await flushUntil(() => Boolean(sent));
  storeLoginTokens("B-access", "B-refresh");
  delayed.resolve(response(sent, { nickname: "old-name" }));
  expect((await result).code).toBe("MOMO_AUTH_SESSION_CHANGED");
});

test("conditional clear cannot delete a later session", () => {
  const version = getAuthSessionVersion();
  storeLoginTokens("B-access", "B-refresh");
  expect(clearAuthSession(version)).toBe(false);
  expect(localStorage.getItem("accessToken")).toBe("B-access");
});


test("a same-session retry 401 terminates authentication without a refresh loop", async () => {
  let refreshCalls = 0;
  axios.defaults.adapter = config => {
    if (config.url.endsWith("/reissue")) {
      refreshCalls++;
      return Promise.resolve(response(config, { accessToken: "fresh-access", refreshToken: "fresh-refresh" }));
    }
    return Promise.reject(failure(config, 401));
  };
  await expect(axios.get(URL)).rejects.toMatchObject({ response: { status: 401 } });
  expect(refreshCalls).toBe(1);
  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(localStorage.getItem("refreshToken")).toBeNull();
});

// 탈퇴 API는 외부 공급자의 실패를 JWT 만료로 오인해 일회용 코드를 재전송하면 안 된다.
test.each([403,502,503])("social delete %s does not refresh or replay a consumed code",async status=>{
 const calls=[];axios.defaults.adapter=config=>{calls.push(config);return Promise.reject(failure(config,status));};
 const {default:api}=require("./AxiosApi");
 await expect(api.socialDeleteComplete("google","one-use-code","state",{agreed:true,confirmation:"MOMO 회원 탈퇴"})).rejects.toMatchObject({response:{status}});
 expect(calls).toHaveLength(1);expect(calls[0].headers.Authorization).toBe("Bearer A-access");expect(localStorage.getItem("accessToken")).toBe("A-access");
});
test("security 401 before state consumption refreshes once and sends the current JWT",async()=>{
 const calls=[];axios.defaults.adapter=config=>{
  calls.push(config);
  if(config.url.endsWith("/reissue"))return Promise.resolve(response(config,{accessToken:"fresh-access",refreshToken:"fresh-refresh"}));
  if(!config._retry)return Promise.reject(failure(config,401));
  return Promise.resolve(response(config));
 };
 const {default:api}=require("./AxiosApi");await api.socialDeleteComplete("naver","code","state",{agreed:true,confirmation:"MOMO 회원 탈퇴"});
 expect(calls.filter(c=>c.url.endsWith("/reissue"))).toHaveLength(1);
 const requests=calls.filter(c=>c.url.endsWith("/delete/complete"));expect(requests).toHaveLength(2);expect(requests[1].headers.Authorization).toBe("Bearer fresh-access");
});
test("missing JWT is refreshed before a delete callback consumes state",async()=>{
 localStorage.removeItem("accessToken");const calls=[];axios.defaults.adapter=config=>{
  calls.push(config);return Promise.resolve(response(config,config.url.endsWith("/reissue")?{accessToken:"fresh-access",refreshToken:"fresh-refresh"}:{}));
 };
 const {default:api}=require("./AxiosApi");await api.socialDeleteComplete("google","code","state",{agreed:true,confirmation:"MOMO 회원 탈퇴"});
 expect(calls.map(c=>new globalThis.URL(c.url).pathname)).toEqual(["/api/auth/reissue","/api/auth/google/delete/complete"]);expect(calls[1].headers.Authorization).toBe("Bearer fresh-access");
});
test("another tab switching accounts before delete dispatch cannot send the new account JWT",async()=>{
 localStorage.setItem("username","member-a");const calls=[];axios.defaults.adapter=config=>{calls.push(config);return Promise.resolve(response(config));};
 const {default:api}=require("./AxiosApi");const pending=api.socialDeleteComplete("google","code","state",{agreed:true,confirmation:"MOMO 회원 탈퇴"});
 // 다른 탭의 localStorage 갱신은 이 탭의 메모리 버전을 올리지 않는다.
 localStorage.setItem("username","member-b");localStorage.setItem("accessToken","B-access");localStorage.setItem("momo-auth-session-id","B-session");
 await expect(pending).rejects.toMatchObject({code:"MOMO_AUTH_SESSION_CHANGED"});expect(calls).toHaveLength(0);
});

test("cross-tab account switch during refresh rejection preserves the new account",async()=>{
 localStorage.setItem("username","member-a");const {pending}=delayedRefreshAdapter();const result=axios.get(URL).catch(error=>error);await flushUntil(()=>pending.length===1);
 localStorage.setItem("username","member-b");localStorage.setItem("accessToken","B-access");localStorage.setItem("refreshToken","B-refresh");localStorage.setItem("momo-auth-session-id","B-session");
 pending[0].reject(failure(pending[0].config,401));await result;
 expect(localStorage.getItem("accessToken")).toBe("B-access");expect(localStorage.getItem("username")).toBe("member-b");
});

test("OAuth LOGIN dispatch blocks another-tab session switch after interceptors",async()=>{
 const calls=[];axios.defaults.transformRequest=[...originalTransforms,function(data){localStorage.setItem("momo-auth-session-id","another-tab-login");return data;}];
 axios.defaults.adapter=config=>{calls.push(config);return Promise.resolve(response(config));};const {default:api}=require("./AxiosApi");
 await expect(api.oauthLogin("kakao","old-code","state")).rejects.toMatchObject({code:"MOMO_AUTH_SESSION_CHANGED"});expect(calls).toHaveLength(0);
});
