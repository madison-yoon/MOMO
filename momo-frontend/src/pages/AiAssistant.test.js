import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import AiAssistant from "./AiAssistant";
import ReviewIndexStatus from "../components/rag/ReviewIndexStatus";
import AxiosApi from "../api/AxiosApi";
jest.mock("react-router-dom", () => ({ Navigate: () => <p>로그인 화면</p>, Link: ({ to, children }) => <a href={to}>{children}</a> }));
jest.mock("../api/AxiosApi", () => ({ __esModule: true, getAuthSessionVersion: () => 0, isAuthSessionCurrent: () => true, getAuthSessionMarker: () => "session", default: { ragQuery: jest.fn(), ragCapabilities: jest.fn(), ragReindex: jest.fn(), ragIndexStatus: jest.fn() } }));
beforeEach(() => { jest.clearAllMocks(); localStorage.clear(); localStorage.setItem("accessToken", "test"); AxiosApi.ragCapabilities.mockResolvedValue({ data: { canReindex: false } }); });
const ask = () => { fireEvent.change(screen.getByLabelText("질문"), { target: { value: "영화의 결말은?" } }); fireEvent.click(screen.getByRole("button", { name: "리뷰에 질문하기" })); };
test("질문 범위와 중복 제출 방지, 일반 텍스트 답변·실제 출처·trace", async () => {
  let resolve; AxiosApi.ragQuery.mockReturnValue(new Promise(done => { resolve = done; })); render(<AiAssistant />);
  fireEvent.change(screen.getByLabelText("검색 범위"), { target: { value: "MINE" } }); ask();
  fireEvent.submit(screen.getByRole("button", { name: "리뷰 근거를 찾고 있습니다…" }).closest("form"));
  expect(AxiosApi.ragQuery).toHaveBeenCalledTimes(1); expect(AxiosApi.ragQuery).toHaveBeenCalledWith("영화의 결말은?", "MINE", expect.any(AbortSignal));
  await act(async () => resolve({ data: { answer: "<img src=x onerror=alert(1)> [#7]", abstained: false, sources: [{ review_id: 7, title: "결말 기록", snippet: "리뷰 본문", score: 0.83 }], trace: ["retrieve", "generate", "format"] } }));
  expect(screen.getByText("<img src=x onerror=alert(1)> [#7]")).toBeInTheDocument(); expect(document.querySelector("img")).toBeNull();
  expect(screen.getByRole("link", { name: /결말 기록/ })).toHaveAttribute("href", "/reviews/7"); expect(screen.getByText(/0.83/)).toBeInTheDocument(); expect(screen.getByText("답변 생성")).toBeInTheDocument(); expect(screen.getByText(/OpenAI/)).toBeInTheDocument();
});
test.each([[429, /요청 한도/], [503, /외부 AI 서비스/]])("%s 오류를 구분한다", async (status, message) => {
  AxiosApi.ragQuery.mockRejectedValue({ response: { status } }); render(<AiAssistant />); ask(); expect(await screen.findByRole("alert")).toHaveTextContent(message);
});
test("답변 보류와 ALL 기본 범위를 표시한다", async () => { AxiosApi.ragQuery.mockResolvedValue({ data: { abstained: true, answer: "근거 부족", sources: [], trace: ["abstain"] } }); render(<AiAssistant />); expect(screen.getByLabelText("검색 범위")).toHaveValue("ALL"); ask(); expect(await screen.findByRole("heading", { name: "답변 보류" })).toBeInTheDocument(); });
test("로그인하지 않은 사용자는 질문 화면에 진입하지 않는다", () => { localStorage.clear(); render(<AiAssistant />); expect(screen.getByText("로그인 화면")).toBeInTheDocument(); expect(AxiosApi.ragQuery).not.toHaveBeenCalled(); });
test("세션 변경 후에는 진행 중 응답을 표시하지 않는다", async () => { let resolve; AxiosApi.ragQuery.mockReturnValue(new Promise(done => { resolve = done; })); render(<AiAssistant />); ask(); await act(async () => { window.dispatchEvent(new Event("momo-auth-changed")); resolve({ data: { answer: "이전 사용자 답변" } }); }); expect(screen.queryByText("이전 사용자 답변")).not.toBeInTheDocument(); });
test.each(["INDEXING", "READY", "FAILED"])("리뷰의 %s 상태를 표시하고 일반 회원에게 재색인을 숨긴다", async status => { render(<ReviewIndexStatus review={{ indexStatus: status, indexedAt: "2026-11-26T10:00:00" }} reviewId={7} onReindexed={jest.fn()} />); expect(screen.getByText(new RegExp(status))).toBeInTheDocument(); await act(async () => {}); expect(screen.queryByRole("button", { name: "AI 재색인" })).not.toBeInTheDocument(); });
test("허용된 운영자만 개별 재색인을 실행하고 상세 데이터를 갱신한다", async () => { const refreshed = jest.fn(); AxiosApi.ragCapabilities.mockResolvedValue({ data: { canReindex: true } }); AxiosApi.ragReindex.mockResolvedValue({ data: { outcome: "READY" } }); render(<ReviewIndexStatus review={{ indexStatus: "FAILED" }} reviewId={7} onReindexed={refreshed} />); fireEvent.click(await screen.findByRole("button", { name: "AI 재색인" })); await act(async () => {}); expect(AxiosApi.ragReindex).toHaveBeenCalledWith(7, expect.any(AbortSignal)); expect(refreshed).toHaveBeenCalledTimes(1); });
test("운영자 권한을 확인한 뒤에만 상세 색인 오류를 읽는다", async () => { AxiosApi.ragCapabilities.mockResolvedValue({ data: { canReindex: true } }); AxiosApi.ragIndexStatus.mockResolvedValue({ data: { indexError: "AI_SERVICE_UNAVAILABLE" } }); render(<ReviewIndexStatus review={{ indexStatus: "FAILED" }} reviewId={7} onReindexed={jest.fn()} />); expect(await screen.findByText(/AI_SERVICE_UNAVAILABLE/)).toBeInTheDocument(); expect(AxiosApi.ragIndexStatus).toHaveBeenCalledWith(7, expect.any(AbortSignal)); });
test("일반 회원은 상세 색인 오류를 요청하거나 표시하지 않는다", async () => { render(<ReviewIndexStatus review={{ indexStatus: "FAILED", indexError: "private" }} reviewId={7} onReindexed={jest.fn()} />); await act(async () => {}); expect(AxiosApi.ragIndexStatus).not.toHaveBeenCalled(); expect(screen.queryByText(/private/)).not.toBeInTheDocument(); });
