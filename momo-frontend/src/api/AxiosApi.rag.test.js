jest.mock("axios", () => jest.requireActual("axios/dist/node/axios.cjs"));
import axios from "axios";
import AxiosApi, { storeLoginTokens, clearAuthSession } from "./AxiosApi";

let originalAdapter;
beforeEach(() => { originalAdapter = axios.defaults.adapter; localStorage.clear(); storeLoginTokens("test-access", "test-refresh"); });
afterEach(() => { axios.defaults.adapter = originalAdapter; });

test("RAG 요청은 기존 JWT 세션과 정확한 MOMO 경로·본문·취소 신호를 사용한다", async () => {
  const requests = [];
  axios.defaults.adapter = async config => { requests.push(config); return { status: 200, data: {}, config, headers: {} }; };
  const { signal } = new AbortController();
  await AxiosApi.ragQuery("리뷰 근거 질문", "MINE", signal);
  await AxiosApi.ragCapabilities(signal);
  await AxiosApi.ragIndexStatus(7, signal);
  await AxiosApi.ragReindex(7, signal);
  expect(requests.map(config => [config.method, new URL(config.url).pathname])).toEqual([
    ["post", "/api/rag/query"], ["get", "/api/rag/capabilities"], ["get", "/api/rag/reindex/7/status"], ["post", "/api/rag/reindex/7"],
  ]);
  expect(JSON.parse(requests[0].data)).toEqual({ question: "리뷰 근거 질문", scope: "MINE" });
  requests.forEach(config => { expect(config.headers.Authorization).toBe("Bearer test-access"); expect(config.withCredentials).toBe(true); expect(config.signal).toBe(signal); });
});

test("로그아웃 후 이전 RAG 응답은 기존 세션 보호에 의해 차단된다", async () => {
  let finish;
  axios.defaults.adapter = config => new Promise(resolve => { finish = () => resolve({ status: 200, data: { answer: "이전 세션" }, config, headers: {} }); });
  const pending = AxiosApi.ragQuery("질문", "ALL").catch(error => error);
  for (let count = 0; count < 30 && !finish; count += 1) await Promise.resolve();
  expect(finish).toBeDefined();
  clearAuthSession(); finish();
  expect((await pending).code).toBe("MOMO_AUTH_SESSION_CHANGED");
});
