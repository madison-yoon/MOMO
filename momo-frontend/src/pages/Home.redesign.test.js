import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Home from "./Home";
import AxiosApi from "../api/AxiosApi";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
jest.mock("../api/AxiosApi", () => ({ dailyBoxOffice: jest.fn(), moviePosterStatuses: jest.fn(), moviesByGenre: jest.fn() }));
jest.mock("../utils/favorites", () => ({ getFavoriteMovies: () => [] }));
jest.mock("../components/common/TodayRecommend", () => () => <h1>추천 영역 테스트 대역</h1>);
jest.mock("../components/home/RecentReviews", () => () => <section aria-label="최근 영화 메모">최근 메모 테스트 대역</section>);
jest.mock("../components/common/FavoriteStar", () => () => <button type="button">관심 영화 테스트 대역</button>);

// API 대역은 이 테스트 파일에서만 사용하며 실제 화면의 데이터 경로는 바꾸지 않는다.
const movie = { movieCode: "20260001", title: "회귀 테스트 영화", releaseDate: "20260101", posterUrl: "/posters/test.jpg", rank: 1 };

beforeEach(() => {
  jest.clearAllMocks();
  AxiosApi.dailyBoxOffice.mockResolvedValue({ data: [movie] });
  AxiosApi.moviePosterStatuses.mockResolvedValue({ data: [] });
  AxiosApi.moviesByGenre.mockResolvedValue({ data: [] });
});

test("홈은 추천 제목과 기존 박스오피스·최근 메모·관심 영화 영역을 유지한다", async () => {
  render(<Home />);
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("region", { name: "오늘의 박스오피스" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "최근 영화 메모" })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "관심 영화" })).toBeInTheDocument();
  await screen.findByText(movie.title);
});

test("박스오피스의 실제 응답과 키보드 상세 이동 계약을 유지한다", async () => {
  render(<Home />);
  const card = await screen.findByRole("button", { name: /회귀 테스트 영화/ });
  expect(AxiosApi.dailyBoxOffice).toHaveBeenCalledWith(expect.stringMatching(/^\d{8}$/), expect.any(AbortSignal));
  fireEvent.keyDown(card, { key: "Enter" });
  expect(mockNavigate).toHaveBeenCalledWith("/movie/20260001");
});

test("장르 선택은 홈에 머무르고 전체 보기만 선택 장르 검색 경로로 이동한다", async () => {
  render(<Home />);
  fireEvent.click(screen.getByRole("button", { name: "액션", exact: true }));
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(await screen.findByText("현재 표시할 액션 영화가 없습니다.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "장르 전체 보기" }));
  expect(mockNavigate).toHaveBeenCalledWith("/search?genre=" + encodeURIComponent("액션"));
  await screen.findByText(movie.title);
});

test("로딩 중에는 대기 상태를 안내하고 가상 영화를 표시하지 않는다", async () => {
  AxiosApi.dailyBoxOffice.mockReturnValue(new Promise(() => {}));
  render(<Home />);
  expect(screen.getByText("영화 정보를 불러오는 중입니다.")).toHaveAttribute("role", "status");
  expect(screen.queryByText(movie.title)).not.toBeInTheDocument();
  await screen.findByText("현재 표시할 드라마 영화가 없습니다.");
});

test("박스오피스 조회 실패는 정상 빈 목록과 구분한다", async () => {
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  AxiosApi.dailyBoxOffice.mockRejectedValue(Object.assign(new Error("offline"), { code: "ERR_NETWORK" }));
  try {
    render(<Home />);
    expect(await screen.findByRole("alert")).toHaveTextContent("박스오피스를 불러오지 못했습니다.");
    expect(screen.queryByText("현재 표시할 영화가 없습니다.")).not.toBeInTheDocument();
  } finally { log.mockRestore(); }
});

test("정상 빈 응답에서는 기존 빈 목록을 표시한다", async () => {
  AxiosApi.dailyBoxOffice.mockResolvedValue({ data: [] });
  render(<Home />);
  expect(await screen.findByText("현재 표시할 영화가 없습니다.")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("관심 영화 변경 이벤트와 전체 보기 경로를 유지한다", async () => {
  render(<Home />);
  await screen.findByText(movie.title);
  act(() => window.dispatchEvent(new CustomEvent("momo-favorites-changed", { detail: [{...movie, movieCode:"20260002",title:"관심 영화 테스트"}] })));
  expect(screen.getByText("관심 영화 테스트")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "전체 보기 →", exact: true }));
  expect(mockNavigate).toHaveBeenCalledWith("/profile/favorites");
});

test("홈을 떠나면 진행 중인 조회를 취소한다", async () => {
  AxiosApi.dailyBoxOffice.mockReturnValue(new Promise(() => {}));
  const { unmount } = render(<Home />);
  const signal = AxiosApi.dailyBoxOffice.mock.calls[0][1];
  unmount();
  expect(signal.aborted).toBe(true);
});
