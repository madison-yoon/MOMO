import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MovieDetail from "./MovieDetail";
import AllReviews from "./AllReviews";
import ProfileEdit from "./ProfileEdit";
import SignUp from "./SignUp";
import ReviewDetail from "./ReviewDetail";
import AxiosApi from "../api/AxiosApi";
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate, useParams: () => ({ id: "20260001", reviewId: "1" }), Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a> }));
jest.mock("../components/redesign/ArchiveAuthFrame", () => ({ children }) => children);
jest.mock("../components/ProfileAvatar", () => () => <span>프로필 이미지</span>);
jest.mock("../components/common/FavoriteStar", () => () => <button aria-label="관심 영화 추가" />);
jest.mock("../api/AxiosApi", () => ({ movieDetailByIdentifier: jest.fn(), movieDetail: jest.fn(), moviePoster: jest.fn(), moviePeople: jest.fn(), movieReviews: jest.fn(), movieRating: jest.fn(), memberMe: jest.fn(), reviewCreate: jest.fn(), allReviews: jest.fn(), reviewSummaries: jest.fn(), moviePostersEnsure: jest.fn(), moviePosterStatuses: jest.fn(), memberIdExist: jest.fn(), memberSignup: jest.fn(), reviewDetail: jest.fn(), reviewComments: jest.fn(), reviewReactionCounts: jest.fn(), reviewMyReactionGet: jest.fn(), reviewUpdate: jest.fn(), reviewDelete: jest.fn() }));
beforeEach(() => {
  jest.clearAllMocks(); localStorage.clear();
  const movie = { movieCode: "20260001", title: "검증 영화", titleEn: "Test", releaseDate: "20260101", genre: "드라마", actors: [], director: "감독" };
  AxiosApi.movieDetailByIdentifier.mockResolvedValue({ data: movie }); AxiosApi.movieDetail.mockResolvedValue({ data: movie });
  AxiosApi.moviePoster.mockResolvedValue({ data: { posterUrl: "/posters/test.jpg" } }); AxiosApi.moviePeople.mockResolvedValue({ data: [] });
  AxiosApi.movieReviews.mockResolvedValue({ data: { content: [] } }); AxiosApi.movieRating.mockResolvedValue({ data: { likeCount: 1, dislikeCount: 0, totalCount: 1, myRating: null } });
  AxiosApi.memberMe.mockResolvedValue({ data: { userId: 1, loginId: "sample-id", nickname: "회원표본", email: "sample@example.test", profileImage: "" } });
  AxiosApi.allReviews.mockResolvedValue({ data: { content: [{ reviewId: 1, movieCode: movie.movieCode, movieTitle: movie.title, title: "검증 리뷰", nickname: "작성자", createdAt: "2026-11-18T10:00:00" }], totalPages: 2 } });
  AxiosApi.reviewSummaries.mockResolvedValue({ data: [{ reviewId: 1, likeCount: 2, dislikeCount: 1, commentCount: 3 }] });
  AxiosApi.moviePostersEnsure.mockResolvedValue({ data: [{ movieCode: movie.movieCode, status: "SUCCESS", posterUrl: "/posters/test.jpg" }] });
  AxiosApi.moviePosterStatuses.mockResolvedValue({ data: [] });
  AxiosApi.reviewDetail.mockResolvedValue({ data: { reviewId: 1, userId: 2, movieCode: movie.movieCode, title: "권한 확인 리뷰", content: "원래 리뷰 본문", nickname: "다른 작성자", createdAt: "2026-11-18T10:00:00" } });
  AxiosApi.reviewComments.mockResolvedValue({ data: { content: [], totalElements: 0 } });
  AxiosApi.reviewReactionCounts.mockResolvedValue({ data: { likeCount: 2, dislikeCount: 0 } }); AxiosApi.reviewMyReactionGet.mockResolvedValue({ data: null });
});

test("인라인 메모는 확장 상태와 글자 제한·초안을 유지하고 서버에 임의로 쓰지 않는다", async () => {
  render(<MovieDetail />);
  const toggle = await screen.findByRole("button", { name: /영화 메모 작성하기/ });
  expect(toggle).toHaveAttribute("aria-expanded", "false"); fireEvent.click(toggle);
  const title = screen.getByLabelText("메모 제목"); fireEvent.change(title, { target: { value: "남겨둔 초안" } });
  expect(title).toHaveAttribute("maxLength", "100"); expect(screen.getByLabelText("영화 메모")).toHaveAttribute("maxLength", "2000");
  fireEvent.click(toggle); expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(screen.queryByRole("button", { name: "취소", exact: true })).not.toBeInTheDocument();
  expect(screen.getByLabelText("메모 제목")).toHaveValue("남겨둔 초안"); expect(AxiosApi.reviewCreate).not.toHaveBeenCalled();
});

test("가로 리뷰 카드는 실제 집계와 기존 검색·페이지 이동을 유지한다", async () => {
  render(<AllReviews />);
  expect(await screen.findByRole("link", { name: "검증 리뷰" })).toHaveAttribute("href", "/reviews/1");
  expect(await screen.findByText("댓글 3")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("리뷰 검색어"), { target: { value: "기록" } }); fireEvent.click(screen.getByRole("button", { name: "검색", exact: true }));
  await screen.findByRole("link", { name: "검증 리뷰" });
  expect(AxiosApi.allReviews).toHaveBeenLastCalledWith(0, expect.any(AbortSignal), "ALL", "기록");
});

test("프로필 수정은 읽기 전용 아이디와 기존 비밀번호·이미지 필드를 보존한다", async () => {
  render(<ProfileEdit />);
  expect(await screen.findByDisplayValue("sample-id")).toHaveAttribute("readonly");
  expect(screen.getByRole("heading", { name: "기본 회원 정보" })).toBeInTheDocument();
  expect(screen.getByLabelText("현재 비밀번호")).toHaveAttribute("type", "password");
  expect(screen.getByLabelText("새 비밀번호 확인")).toHaveAttribute("type", "password");
  expect(screen.getByText("이미지 변경")).toBeInTheDocument();
});

test("회원가입은 기존 아이디 중복 검사와 초기 비활성 제출을 유지한다", async () => {
  AxiosApi.memberIdExist.mockResolvedValue({ data: true }); render(<SignUp />);
  expect(screen.getByRole("button", { name: "회원가입", exact: true })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("아이디"), { target: { value: "duplicate" } });
  expect(await screen.findByText("이미 사용 중인 아이디입니다.")).toBeInTheDocument(); expect(AxiosApi.memberSignup).not.toHaveBeenCalled();
});

test("리뷰 상세는 다른 작성자의 수정·삭제 버튼을 노출하지 않는다", async () => {
  render(<ReviewDetail />);
  expect(await screen.findByRole("heading", { name: "권한 확인 리뷰" })).toBeInTheDocument();
  expect(screen.getByText("원래 리뷰 본문")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "수정", exact: true })).not.toBeInTheDocument(); expect(screen.queryByRole("button", { name: "삭제", exact: true })).not.toBeInTheDocument();
});


test("본인 리뷰는 기존 수정·삭제 진입과 수정 취소를 유지한다", async () => {
  AxiosApi.reviewDetail.mockResolvedValue({ data: { reviewId: 1, userId: 1, title: "내 기록", content: "내 본문", nickname: "회원표본" } });
  render(<ReviewDetail />);
  const edit = await screen.findByRole("button", { name: "수정", exact: true });
  expect(screen.getByRole("button", { name: "삭제", exact: true })).toBeInTheDocument();
  fireEvent.click(edit);
  expect(screen.getByDisplayValue("내 기록")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "취소", exact: true }));
  expect(screen.getByRole("heading", { name: "내 기록" })).toBeInTheDocument();
  expect(AxiosApi.reviewUpdate).not.toHaveBeenCalled();
});


test("TMDb 전용 영화에는 저장을 지원하지 않는 관심 영화 버튼을 표시하지 않는다", async () => {
  AxiosApi.movieDetailByIdentifier.mockResolvedValue({ data: { tmdbId: 123, title: "TMDb 전용 검증 영화", actors: [] } });
  render(<MovieDetail />);
  await screen.findByRole("heading", { name: "TMDb 전용 검증 영화" });
  expect(screen.queryByRole("button", { name: "관심 영화 추가" })).not.toBeInTheDocument();
});

test("회원가입 닉네임은 기존처럼 앞뒤 공백을 제거한다", () => {
  render(<SignUp />);
  const field = screen.getByLabelText("닉네임");
  fireEvent.change(field, { target: { value: "  기록회원  " } });
  expect(field).toHaveValue("기록회원");
});
