import React from "react";
import { render, screen } from "@testing-library/react";
import Search from "./Search";
import Profile from "./Profile";
import Login from "./Login";
import AxiosApi from "../api/AxiosApi";
import { archivePageForPath } from "../styles/redesign/ArchivePages.styles";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams("keyword=타짜"), jest.fn()],
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));
jest.mock("../components/redesign/ArchiveAuthFrame", () => ({ children }) => <div>{children}</div>);
jest.mock("../components/ProfileAvatar", () => () => <span>프로필 이미지</span>);
jest.mock("../utils/favorites", () => ({ getFavoriteMovies: () => [] }));
jest.mock("../api/AxiosApi", () => ({
  memberMe: jest.fn(), myReviews: jest.fn(), myLikedReviews: jest.fn(), movieSearch: jest.fn(),
  moviePosterStatuses: jest.fn(), memberLogin: jest.fn(), storeLoginTokens: jest.fn(),
}));
beforeEach(() => {
  jest.clearAllMocks(); localStorage.clear(); sessionStorage.clear();
  AxiosApi.memberMe.mockResolvedValue({ data: { userId: 1, loginId: "sample-id", nickname: "회원표본", email: "sample@example.test" } });
  AxiosApi.myReviews.mockResolvedValue({ data: { page: { totalElements: 3 } } });
  AxiosApi.myLikedReviews.mockResolvedValue({ data: { totalElements: 4 } });
  AxiosApi.movieSearch.mockResolvedValue({ data: { content: [], hasNext: false } });
});

test("기본8개 화면의 새 테마를 유지하고 홈·인물 상세에는 적용하지 않는다", () => {
  expect(["/search", "/movie/20260001", "/reviews", "/reviews/1", "/profile", "/profile/edit", "/login", "/signup"].map(archivePageForPath)).toEqual(["search", "movie", "reviews", "review", "profile", "edit", "login", "signup"]);
  ["/", "/person/actor/1"].forEach((path) => expect(archivePageForPath(path)).toBeNull());
});

test("검색은 본문 중복 입력 없이 검색어 제목과 기존 빈 상태를 보여준다", async () => {
  render(<Search />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("타짜");
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  expect(await screen.findByText("검색 결과가 없습니다.")).toBeInTheDocument();
});

test("프로필은 서버 회원정보와 실제 집계 개수를 표시하고 기존 활동 링크를 유지한다", async () => {
  render(<Profile />);
  expect(await screen.findAllByText("회원표본")).not.toHaveLength(0);
  expect(screen.getByText("sample@example.test")).toBeInTheDocument();
  expect(await screen.findByText("3 개")).toBeInTheDocument();
  expect(screen.getByText("4 개")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /프로필 수정/ })).toHaveAttribute("href", "/profile/edit");
  expect(screen.getByRole("link", { name: /작성한 리뷰 보기/ })).toHaveAttribute("href", "/profile/reviews");
});

test("로그인 중앙 폼은 지정 제목과 기존 필드·비활성 검증을 유지한다", () => {
  render(<Login />);
  expect(screen.getByRole("heading", { name: "다시 만나서 반가워요." })).toBeInTheDocument();
  expect(screen.getByLabelText("아이디")).toBeInTheDocument();
  expect(screen.getByLabelText("비밀번호")).toHaveAttribute("type", "password");
  expect(screen.getByRole("button", { name: "로그인", exact: true })).toBeDisabled();
  expect(screen.getByRole("button", { name: "카카오로 로그인" })).toBeEnabled();
});
