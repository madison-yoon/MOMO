import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import AllReviews from "./AllReviews";
import MovieDetail from "./MovieDetail";
import ReviewDetail from "./ReviewDetail";
import MyReviews from "./MyReviews";
import SignUp from "./SignUp";
import AxiosApi from "../api/AxiosApi";
import { archivePageForPath } from "../styles/redesign/ArchivePages.styles";

let mockParams = {};
jest.mock("react-router-dom", () => ({
  useParams: () => mockParams, useNavigate: () => jest.fn(),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));
jest.mock("../components/redesign/ArchiveAuthFrame", () => ({ children }) => children);
jest.mock("../components/ProfileAvatar", () => () => <span>프로필</span>);
jest.mock("../components/common/FavoriteStar", () => () => <span>관심 영화</span>);
jest.mock("../api/AxiosApi", () => ({
  allReviews: jest.fn(), movieReviews: jest.fn(), reviewSummaries: jest.fn(),
  moviePostersEnsure: jest.fn(), moviePosterStatuses: jest.fn(),
  movieDetailByIdentifier: jest.fn(), movieDetail: jest.fn(), moviePoster: jest.fn(),
  moviePeople: jest.fn(), movieRating: jest.fn(), memberMe: jest.fn(),
  reviewDetail: jest.fn(), reviewComments: jest.fn(), reviewReactionCounts: jest.fn(),
  reviewMyReactionGet: jest.fn(), myReviews: jest.fn(), memberIdExist: jest.fn(),
  memberSignup: jest.fn(), commentUpdate: jest.fn(), commentDelete: jest.fn(), commentCreate: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks(); localStorage.clear(); mockParams = { reviewId: "1", id: "20260001" };
  window.scrollTo = jest.fn();
  const movie = { movieCode: "20260001", title: "검증 영화", actors: [] };
  AxiosApi.movieDetailByIdentifier.mockResolvedValue({ data: movie });
  AxiosApi.movieDetail.mockResolvedValue({ data: movie });
  AxiosApi.moviePoster.mockResolvedValue({ data: { posterUrl: "" } });
  AxiosApi.moviePeople.mockResolvedValue({ data: [] });
  AxiosApi.movieRating.mockResolvedValue({ data: {} });
  AxiosApi.reviewSummaries.mockResolvedValue({ data: [] });
  AxiosApi.moviePostersEnsure.mockResolvedValue({ data: [] });
  AxiosApi.moviePosterStatuses.mockResolvedValue({ data: [] });
  AxiosApi.memberMe.mockResolvedValue({ data: { userId: 1 } });
  AxiosApi.reviewDetail.mockResolvedValue({ data: { reviewId: 1, title: "원글", content: "본문" } });
  AxiosApi.reviewReactionCounts.mockResolvedValue({ data: {} });
  AxiosApi.reviewMyReactionGet.mockResolvedValue({ data: null });
  AxiosApi.reviewComments.mockResolvedValue({ data: { content: [], page: { totalElements: 0, totalPages: 0 } } });
  AxiosApi.movieReviews.mockResolvedValue({ data: { content: [] } });
});

// 실제 통신 대신 API 경계만 대체해 영화 식별자와 페이지 전달, 화면 동작을 검증한다.
test("영화별 리뷰 화면은 해당 영화 API로 페이지를 이동하고 전체 검색을 노출하지 않는다", async () => {
  mockParams.movieCode = "20260001";
  AxiosApi.movieReviews.mockImplementation((code, page) => Promise.resolve({ data: {
    content: [{ reviewId: page + 1, movieCode: code, title: page === 0 ? "첫 영화 리뷰" : "다음 영화 리뷰" }],
    page: { totalPages: 2, totalElements: 11 },
  } }));
  render(<AllReviews />);
  await screen.findByText("첫 영화 리뷰");
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다음" }));
  await screen.findByText("다음 영화 리뷰");
  expect(AxiosApi.movieReviews).toHaveBeenLastCalledWith("20260001", 1, expect.any(AbortSignal));
  expect(AxiosApi.allReviews).not.toHaveBeenCalled();
});

test("영화 상세의 전체 리뷰 링크는 영화 코드가 포함된 기존 리뷰 화면을 가리킨다", async () => {
  render(<MovieDetail />);
  expect(await screen.findByRole("link", { name: "전체 리뷰 보기" })).toHaveAttribute("href", "/reviews/movie/20260001");
});

test("영화별 경로도 기존 리뷰 테마를 사용하고 일반 리뷰 목록의 검색은 유지한다", async () => {
  expect(archivePageForPath("/reviews/movie/20260001")).toBe("reviews");
  AxiosApi.allReviews.mockResolvedValue({ data: { content: [], totalPages: 0 } });
  render(<AllReviews />);
  await screen.findByText("아직 작성된 리뷰가 없습니다.");
  expect(screen.getByRole("searchbox")).toBeInTheDocument();
  expect(AxiosApi.allReviews).toHaveBeenCalled();
  expect(AxiosApi.movieReviews).not.toHaveBeenCalled();
});

const comment = (id, content) => ({ commentId: id, userId: 2, nickname: "작성자", content });
test("댓글 더보기는 ID 중복 없이 기존 순서 뒤에 추가하고 마지막 페이지에서 숨긴다", async () => {
  AxiosApi.reviewComments.mockImplementation((id, page) => Promise.resolve({ data: page === 0
    ? { content: [comment(1, "이전 댓글")], page: { totalElements: 3, totalPages: 2 } }
    : { content: [comment(1, "이전 댓글"), comment(2, "추가 댓글")], page: { totalElements: 3, totalPages: 2 } },
  }));
  render(<ReviewDetail />);
  await screen.findByText("이전 댓글");
  fireEvent.click(screen.getByRole("button", { name: "댓글 더 보기" }));
  const added = await screen.findByText("추가 댓글");
  expect(screen.getAllByText("이전 댓글")).toHaveLength(1);
  expect(screen.getByText("이전 댓글").compareDocumentPosition(added) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.queryByRole("button", { name: "댓글 더 보기" })).not.toBeInTheDocument();
});

test("댓글 추가 조회 실패 시 기존 댓글을 보존하고 같은 페이지를 재시도한다", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  AxiosApi.reviewComments.mockResolvedValueOnce({ data: { content: [comment(1, "유지 댓글")], page: { totalPages: 2, totalElements: 11 } } })
    .mockRejectedValueOnce(new Error("test failure"))
    .mockResolvedValueOnce({ data: { content: [comment(2, "재시도 댓글")], page: { totalPages: 2, totalElements: 11 } } });
  try {
    render(<ReviewDetail />); await screen.findByText("유지 댓글");
    fireEvent.click(screen.getByRole("button", { name: "댓글 더 보기" }));
    await screen.findByRole("alert"); expect(screen.getByText("유지 댓글")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "댓글 더 보기" }));
    await screen.findByText("재시도 댓글");
    expect(AxiosApi.reviewComments.mock.calls.map(call => call[1])).toEqual([0, 1, 1]);
  } finally { log.mockRestore(); }
});

test("댓글이 한 페이지뿐이면 더보기 버튼을 표시하지 않는다", async () => {
  AxiosApi.reviewComments.mockResolvedValue({ data: { content: [comment(1, "단일 댓글")], totalElements: 1, totalPages: 1 } });
  render(<ReviewDetail />); await screen.findByText("단일 댓글");
  expect(screen.queryByRole("button", { name: "댓글 더 보기" })).not.toBeInTheDocument();
});

test("더보기 연속 클릭은 한 번만 요청하고 다른 리뷰로 이동한 뒤 늦은 응답은 무시한다", async () => {
  let resolveMore;
  AxiosApi.reviewComments.mockImplementation((id, page) => {
    if (id === "1" && page === 1) return new Promise(resolve => { resolveMore = resolve; });
    return Promise.resolve({ data: { content: [comment(Number(id), `리뷰${id} 댓글`)], page: { totalPages: 2, totalElements: 11 } } });
  });
  const view = render(<ReviewDetail />); await screen.findByText("리뷰1 댓글");
  const button = screen.getByRole("button", { name: "댓글 더 보기" });
  fireEvent.click(button); fireEvent.click(button);
  expect(AxiosApi.reviewComments.mock.calls.filter(call => call[1] === 1)).toHaveLength(1);
  mockParams = { reviewId: "2" }; view.rerender(<ReviewDetail />);
  await screen.findByText("리뷰2 댓글");
  await act(async () => resolveMore({ data: { content: [comment(3, "늦은 댓글")], page: { totalPages: 2, totalElements: 11 } } }));
  expect(screen.queryByText("늦은 댓글")).not.toBeInTheDocument();
  expect(screen.queryByText("리뷰1 댓글")).not.toBeInTheDocument();
});

test("추가로 읽은 본인 댓글 삭제 후 첫 페이지와 더보기 상태를 다시 조회한다", async () => {
  const confirm = jest.spyOn(window, "confirm").mockReturnValue(true);
  AxiosApi.commentDelete.mockResolvedValue({});
  AxiosApi.reviewComments.mockResolvedValueOnce({ data: { content: [comment(1, "처음 댓글")], page: { totalElements: 11, totalPages: 2 } } })
    .mockResolvedValueOnce({ data: { content: [{ ...comment(11, "삭제할 내 댓글"), userId: 1 }], page: { totalElements: 11, totalPages: 2 } } })
    .mockResolvedValueOnce({ data: { content: [comment(1, "처음 댓글")], page: { totalElements: 10, totalPages: 1 } } });
  try {
    render(<ReviewDetail />); await screen.findByText("처음 댓글");
    fireEvent.click(screen.getByRole("button", { name: "댓글 더 보기" }));
    const row = (await screen.findByText("삭제할 내 댓글")).closest("article");
    fireEvent.click(within(row).getByRole("button", { name: "삭제" }));
    await waitFor(() => expect(screen.queryByText("삭제할 내 댓글")).not.toBeInTheDocument());
    expect(AxiosApi.commentDelete).toHaveBeenCalledWith(11);
    expect(AxiosApi.reviewComments.mock.calls.map(call => call[1])).toEqual([0, 1, 0]);
    expect(screen.queryByRole("button", { name: "댓글 더 보기" })).not.toBeInTheDocument();
  } finally { confirm.mockRestore(); }
});

test("내 리뷰 제목은 현재 페이지 길이가 아닌 전체 개수를 표시한다", async () => {
  AxiosApi.myReviews.mockResolvedValue({ data: { content: [{ reviewId: 1, title: "내 메모" }], page: { totalElements: 17, totalPages: 2 } } });
  render(<MyReviews />);
  expect(await screen.findByText("17개")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();
});

test("댓글 작성 후 기존 첫 페이지 갱신과 입력 초기화를 유지한다", async () => {
  AxiosApi.commentCreate.mockResolvedValue({});
  AxiosApi.reviewComments.mockResolvedValueOnce({ data: { content: [], totalElements: 0, totalPages: 0 } })
    .mockResolvedValueOnce({ data: { content: [{ ...comment(1, "작성한 댓글"), userId: 1 }], totalElements: 1, totalPages: 1 } });
  render(<ReviewDetail />); await screen.findByText("원글");
  const input = await screen.findByPlaceholderText("댓글을 입력하세요...");
  fireEvent.change(input, { target: { value: "작성한 댓글" } });
  fireEvent.click(screen.getByRole("button", { name: "댓글 등록" }));
  await screen.findByText("작성한 댓글");
  expect(AxiosApi.commentCreate).toHaveBeenCalledWith("1", "작성한 댓글");
  expect(input).toHaveValue("");
  expect(AxiosApi.reviewComments.mock.calls.map(call => call[1])).toEqual([0, 0]);
});

test("본인 댓글 수정 후 수정 내용을 재조회하고 더보기 상태를 유지한다", async () => {
  AxiosApi.commentUpdate.mockResolvedValue({});
  AxiosApi.reviewComments.mockResolvedValueOnce({ data: { content: [{ ...comment(1, "수정 전 댓글"), userId: 1 }], page: { totalElements: 11, totalPages: 2 } } })
    .mockResolvedValueOnce({ data: { content: [{ ...comment(1, "수정 후 댓글"), userId: 1 }], page: { totalElements: 11, totalPages: 2 } } });
  render(<ReviewDetail />);
  const row = (await screen.findByText("수정 전 댓글")).closest("article");
  fireEvent.click(within(row).getByRole("button", { name: "수정" }));
  fireEvent.change(within(row).getByRole("textbox"), { target: { value: "수정 후 댓글" } });
  fireEvent.click(within(row).getByRole("button", { name: "저장" }));
  await screen.findByText("수정 후 댓글");
  expect(AxiosApi.commentUpdate).toHaveBeenCalledWith(1, "수정 후 댓글");
  expect(screen.getByRole("button", { name: "댓글 더 보기" })).toBeInTheDocument();
});

test.each(["a", "abc", "a".repeat(21)])("잘못된 길이의 아이디는 사용 가능 안내나 중복 조회를 하지 않는다: %s", async (value) => {
  render(<SignUp />);
  fireEvent.change(screen.getByLabelText("아이디"), { target: { value } });
  expect(screen.getByText("아이디는 4~20자로 입력해 주세요.")).toBeInTheDocument();
  await new Promise(resolve => setTimeout(resolve, 550));
  expect(AxiosApi.memberIdExist).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled();
});

test.each(["abcd", "a".repeat(20)])("서버 허용 길이의 아이디는 중복 확인 후 사용 가능으로 표시한다: %s", async (value) => {
  AxiosApi.memberIdExist.mockResolvedValue({ data: false });
  render(<SignUp />);
  fireEvent.change(screen.getByLabelText("아이디"), { target: { value } });
  await screen.findByText("사용 가능한 아이디입니다.");
  expect(AxiosApi.memberIdExist).toHaveBeenCalledWith(value, expect.any(AbortSignal));
  expect(AxiosApi.memberSignup).not.toHaveBeenCalled();
});
