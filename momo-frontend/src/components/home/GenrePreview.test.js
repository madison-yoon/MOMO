import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AxiosApi from "../../api/AxiosApi";
import GenrePreview from "./GenrePreview";
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
jest.mock("../../api/AxiosApi", () => ({ moviesByGenre: jest.fn(), moviePosterStatuses: jest.fn() }));
jest.mock("../common/FavoriteStar", () => () => null);
const movies = Array.from({ length: 6 }, (_, i) => ({ movieCode: `2026000${i}`, title: `영화 ${i}`, posterUrl: "/posters/test.png" }));
beforeEach(() => { jest.clearAllMocks(); AxiosApi.moviesByGenre.mockResolvedValue({ data: movies }); });

test("드라마 기본 선택, 최대 다섯 편과 선택 장르 전체 보기", async () => {
  render(<GenrePreview />);
  expect(screen.getByRole("button", { name: "드라마", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await screen.findByText("영화 4")).toBeInTheDocument();
  expect(screen.queryByText("영화 5")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "액션", exact: true }));
  await screen.findByText("영화 0");
  expect(mockNavigate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "장르 전체 보기" }));
  expect(mockNavigate).toHaveBeenCalledWith("/search?genre=" + encodeURIComponent("액션"));
  fireEvent.click(screen.getByRole("button", { name: /영화 0 상세/ }));
  expect(mockNavigate).toHaveBeenCalledWith("/movie/20260000");
});

test("장르 재선택은 캐시를 사용하고 늦은 이전 응답은 표시하지 않는다", async () => {
  let drama;
  AxiosApi.moviesByGenre.mockImplementation((genre) => genre === "드라마" ? new Promise((r) => { drama = r; }) : Promise.resolve({ data: [{ ...movies[0], title: "액션 결과" }] }));
  render(<GenrePreview />);
  fireEvent.click(screen.getByRole("button", { name: "액션", exact: true }));
  await screen.findByText("액션 결과");
  await act(async () => drama({ data: [{ ...movies[0], title: "늦은 드라마" }] }));
  expect(screen.queryByText("늦은 드라마")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "코미디", exact: true }));
  await screen.findByText("액션 결과");
  fireEvent.click(screen.getByRole("button", { name: "액션", exact: true }));
  await screen.findByText("액션 결과");
  expect(AxiosApi.moviesByGenre.mock.calls.filter(([genre]) => genre === "액션")).toHaveLength(1);
});

test("로딩·빈 목록·오류를 구분하고 진행 중 조회를 취소한다", async () => {
  AxiosApi.moviesByGenre.mockReturnValue(new Promise(() => {}));
  const view = render(<GenrePreview />);
  expect(screen.getByRole("status")).toHaveTextContent("드라마 영화를 불러오는 중");
  const signal = AxiosApi.moviesByGenre.mock.calls[0][2];
  view.unmount(); expect(signal.aborted).toBe(true);
  AxiosApi.moviesByGenre.mockResolvedValue({ data: [] });
  const empty = render(<GenrePreview />);
  expect(await screen.findByText("현재 표시할 드라마 영화가 없습니다.")).toBeInTheDocument();
  empty.unmount();
  AxiosApi.moviesByGenre.mockRejectedValue(new Error("offline"));
  render(<GenrePreview />);
  expect(await screen.findByRole("alert")).toHaveTextContent("드라마 영화를 불러오지 못했습니다.");
});

test("캐시된 장르로 돌아와도 아직 준비 중인 포스터의 상태는 다시 확인한다", async () => {
  AxiosApi.moviesByGenre.mockImplementation((genre) => Promise.resolve({ data: [{ ...movies[0], posterUrl: genre === "드라마" ? "" : "/posters/action.png" }] }));
  AxiosApi.moviePosterStatuses.mockResolvedValueOnce({ data: [{ movieCode: movies[0].movieCode, status: "PENDING" }] }).mockResolvedValueOnce({ data: [{ movieCode: movies[0].movieCode, status: "SUCCESS", posterUrl: "/posters/ready.png" }] });
  render(<GenrePreview />);
  await waitFor(() => expect(AxiosApi.moviePosterStatuses).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: "액션", exact: true }));
  await screen.findByAltText("영화 0");
  fireEvent.click(screen.getByRole("button", { name: "드라마", exact: true }));
  await waitFor(() => expect(AxiosApi.moviePosterStatuses).toHaveBeenCalledTimes(2));
  expect(await screen.findByAltText("영화 0")).toHaveAttribute("src", expect.stringContaining("/posters/ready.png"));
});

test("장르 개봉일은 하이픈 형식으로 표시하고 누락·잘못된 날짜를 구분한다", async () => {
  AxiosApi.moviesByGenre.mockResolvedValue({ data: ["20261209", "2026-12-09", "20260230", ""].map((releaseDate, i) => ({ ...movies[i], releaseDate })) });
  render(<GenrePreview />);
  expect(await screen.findAllByText("2026-12-09")).toHaveLength(2);
  expect(screen.getByText("개봉일 확인 필요")).toBeInTheDocument();
  expect(screen.getByText("개봉일 정보 없음")).toBeInTheDocument();
});

test("제공된 포스터 URL을 그대로 연결하고 로드 실패는 대체 UI로 처리한다", async () => {
  AxiosApi.moviesByGenre.mockResolvedValue({ data: [{ ...movies[0], posterUrl: "/posters/saved.jpg" }] });
  render(<GenrePreview />);
  const image = await screen.findByAltText("영화 0");
  expect(image).toHaveAttribute("src", expect.stringContaining("/posters/saved.jpg"));
  expect(AxiosApi.moviePosterStatuses).not.toHaveBeenCalled();
  fireEvent.error(image);
  expect(screen.getByText("포스터 준비 중")).toBeInTheDocument();
});
