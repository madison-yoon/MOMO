import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AxiosApi from "../../api/AxiosApi";
import RecentReviews from "./RecentReviews";

jest.mock("../../api/AxiosApi", () => ({ allReviews: jest.fn(), reviewSummaries: jest.fn() }));
// CRA의 Jest 해석기와 Router 7의 내보내기 경로 차이를 격리하고 실제 경로는 검사한다.
jest.mock("react-router-dom", () => ({ Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a> }));
const reviews = [1, 2, 3, 4].map((id) => ({ reviewId: id, movieTitle: `테스트 영화 ${id}`, title: `테스트 메모 ${id}`, nickname: `작성자 ${id}`, createdAt: "2026-11-18T10:00:00" }));
const show = () => render(<RecentReviews />);
beforeEach(() => {
  jest.clearAllMocks();
  AxiosApi.allReviews.mockResolvedValue({ data: { content: reviews } });
  AxiosApi.reviewSummaries.mockResolvedValue({ data: [{ reviewId: 1, likeCount: 2, dislikeCount: 0, commentCount: 3 }] });
});

test("실제 응답의 첫 3개와 기존 상세 경로만 사용한다", async () => {
  show();
  const first = await screen.findByRole("link", { name: /테스트 메모 1/ });
  expect(first).toHaveAttribute("href", "/reviews/1");
  expect(screen.queryByText("테스트 메모 4")).not.toBeInTheDocument();
  expect(AxiosApi.reviewSummaries).toHaveBeenCalledWith([1, 2, 3], expect.any(AbortSignal));
  expect(await screen.findByText("공감 2")).toBeInTheDocument();
  expect(screen.getByText("아쉬워요 0")).toBeInTheDocument();
  expect(screen.getByText("댓글 3")).toBeInTheDocument();
});

test("집계 실패는 가상의 0건으로 표시하지 않고 메모를 유지한다", async () => {
  AxiosApi.reviewSummaries.mockRejectedValue(new Error("offline"));
  show();
  expect(await screen.findAllByText("반응 정보 미확인")).toHaveLength(3);
  expect(screen.getByText("테스트 메모 1")).toBeInTheDocument();
  expect(screen.queryByText("공감 0")).not.toBeInTheDocument();
});

test("빈 목록과 조회 실패를 구분한다", async () => {
  AxiosApi.allReviews.mockResolvedValue({ data: { content: [] } });
  const first = show();
  expect(await screen.findByText("첫 영화 메모를 기다리고 있어요.")).toBeInTheDocument();
  expect(AxiosApi.reviewSummaries).not.toHaveBeenCalled();
  first.unmount();
  AxiosApi.allReviews.mockRejectedValue(new Error("offline"));
  show();
  expect(await screen.findByRole("alert")).toHaveTextContent("최근 메모를 불러오지 못했습니다.");
});

test("화면을 떠나면 목록과 집계 조회에 공유한 신호를 취소한다", async () => {
  AxiosApi.reviewSummaries.mockReturnValue(new Promise(() => {}));
  const view = show();
  await waitFor(() => expect(AxiosApi.reviewSummaries).toHaveBeenCalledTimes(1));
  const signal = AxiosApi.allReviews.mock.calls[0][1];
  expect(AxiosApi.reviewSummaries.mock.calls[0][1]).toBe(signal);
  view.unmount();
  expect(signal.aborted).toBe(true);
});
