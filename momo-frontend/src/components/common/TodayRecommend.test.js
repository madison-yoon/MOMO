import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import AxiosApi from "../../api/AxiosApi";
import TodayRecommend from "./TodayRecommend";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("../../api/AxiosApi", () => ({
  boxOfficeRecommendations: jest.fn(),
  movieRating: jest.fn(),
  movieDetail: jest.fn(),
  moviePoster: jest.fn(),
  moviePosterStatuses: jest.fn(),
  myLikedMovies: jest.fn(),
}));

jest.mock("../../utils/favorites", () => ({
  getFavoriteMovies: () => [],
}));

describe("TodayRecommend poster recovery", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    AxiosApi.boxOfficeRecommendations.mockResolvedValue({
      data: [
        {
          movieCode: "20260001",
          title: "추천 영화",
          releaseDate: "20260101",
          genre: "드라마",
          posterUrl: "",
        },
      ],
    });
    AxiosApi.movieRating.mockResolvedValue({ data: { myRating: null } });
    AxiosApi.movieDetail.mockResolvedValue({ data: { overview: "추천 영화 줄거리" } });
    AxiosApi.moviePoster.mockResolvedValue({ data: { posterUrl: "" } });
    AxiosApi.moviePosterStatuses.mockResolvedValue({
      data: [
        {
          movieCode: "20260001",
          status: "SUCCESS",
          posterUrl: "/posters/20260001-test.jpg",
        },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test("requests a missing poster and refreshes the recommendation when it is ready", async () => {
    render(React.createElement(TodayRecommend));

    await act(async () => {
      for (let i = 0; i < 12; i += 1) {
        await Promise.resolve();
      }
    });

    expect(AxiosApi.moviePoster).toHaveBeenCalledWith(
      "20260001",
      expect.anything(),
    );

    await act(async () => {
      jest.advanceTimersByTime(4000);
      for (let i = 0; i < 8; i += 1) {
        await Promise.resolve();
      }
    });

    expect(AxiosApi.moviePosterStatuses).toHaveBeenCalledWith(
      ["20260001"],
      expect.any(AbortSignal),
    );
    expect(screen.getByAltText("추천 영화").getAttribute("src")).toContain(
      "/posters/20260001-test.jpg",
    );
  });

  test("does not log the access token when a recommendation request fails", async () => {
    const error = Object.assign(new Error("request failed"), {
      code: "ERR_BAD_RESPONSE",
      response: { status: 503 },
      config: { headers: { Authorization: "Bearer test-access-token" } },
    });
    AxiosApi.boxOfficeRecommendations.mockRejectedValue(error);
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      render(React.createElement(TodayRecommend));

      await act(async () => {
        for (let i = 0; i < 12; i += 1) {
          await Promise.resolve();
        }
      });

      expect(consoleError).toHaveBeenCalled();
      expect(JSON.stringify(consoleError.mock.calls)).not.toContain("test-access-token");
    } finally {
      consoleError.mockRestore();
    }
  });

  test.each(["empty", "unsupported"])("falls back to all candidates after %s genre results", async (mode) => {
    localStorage.setItem("accessToken", "test-session");
    AxiosApi.myLikedMovies.mockResolvedValue({ data: [{ movieCode: "20260002", genre: "드라마" }] });
    AxiosApi.boxOfficeRecommendations.mockImplementation((genre) => {
      if (genre) return mode === "empty"
        ? Promise.resolve({ data: [] })
        : Promise.reject({ response: { status: 400 } });
      return Promise.resolve({ data: [{ movieCode: "20260001", title: "추천 영화", releaseDate: "20200101", genre: "드라마", posterUrl: "/posters/fallback.jpg" }] });
    });
    const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      render(React.createElement(TodayRecommend));
      await act(async () => {
        for (let i = 0; i < 20; i += 1) await Promise.resolve();
      });
      expect(AxiosApi.boxOfficeRecommendations).toHaveBeenCalledWith("드라마", expect.any(AbortSignal));
      expect(AxiosApi.boxOfficeRecommendations).toHaveBeenCalledWith(null, expect.any(AbortSignal));
      expect(screen.getByAltText("추천 영화").getAttribute("src")).toContain("/posters/fallback.jpg");
    } finally {
      warning.mockRestore();
    }
  });

  test("네 편의 실제 후보를 10초마다 순환하고 수동·호버·정지 상태를 구분한다", async () => {
    AxiosApi.boxOfficeRecommendations.mockResolvedValue({ data: Array.from({ length: 4 }, (_, i) => ({ movieCode: `2026000${i}`, title: `순환 영화 ${i}`, releaseDate: "20260101", posterUrl: `/posters/${i}.png` })) });
    AxiosApi.movieDetail.mockImplementation((code) => Promise.resolve({ data: { titleEn: `English ${code}`, runningTime: "120", overview: `소개 ${code}` } }));
    const view = render(<TodayRecommend />);
    await act(async () => { for (let i = 0; i < 50; i++) await Promise.resolve(); });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("순환 영화 0");
    expect(screen.getByText("01 / 04")).toBeInTheDocument();
    await act(async () => jest.advanceTimersByTime(10000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("순환 영화 1");
    fireEvent.mouseEnter(screen.getByRole("region", { name: "오늘의 추천 영화" }));
    await act(async () => jest.advanceTimersByTime(10000));
    expect(screen.getByText("02 / 04")).toBeInTheDocument();
    fireEvent.mouseLeave(screen.getByRole("region", { name: "오늘의 추천 영화" }));
    fireEvent.click(screen.getByRole("button", { name: "추천 자동 전환 일시정지" }));
    await act(async () => jest.advanceTimersByTime(10000));
    expect(screen.getByText("02 / 04")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다음 추천 영화" }));
    expect(screen.getByText("03 / 04")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "추천 자동 전환 재생" }));
    await act(async () => jest.advanceTimersByTime(9000));
    fireEvent.click(screen.getByRole("button", { name: "다음 추천 영화" }));
    await act(async () => jest.advanceTimersByTime(1000));
    expect(screen.getByText("04 / 04")).toBeInTheDocument();
    expect(screen.getByAltText("순환 영화 3")).toHaveAttribute("src", expect.stringContaining("/posters/3.png"));
    expect(screen.getByText("English 20260003 · 2026")).toBeInTheDocument();
    await act(async () => jest.advanceTimersByTime(9000));
    expect(screen.getByText("01 / 04")).toBeInTheDocument();
    expect(AxiosApi.movieDetail).toHaveBeenCalledTimes(4);
    view.unmount(); expect(jest.getTimerCount()).toBe(0);
  });

  test("한 편은 자동 순환하지 않고 실제 수량을 표시한다", async () => {
    AxiosApi.boxOfficeRecommendations.mockResolvedValue({ data: [{ movieCode: "20260001", title: "한 편", releaseDate: "20260101", posterUrl: "/posters/one.png" }] });
    render(<TodayRecommend />);
    await act(async () => { for (let i = 0; i < 25; i++) await Promise.resolve(); });
    expect(screen.getByText("01 / 01")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 추천 영화" })).toBeDisabled();
    await act(async () => jest.advanceTimersByTime(20000));
    expect(screen.getByText("01 / 01")).toBeInTheDocument();
  });

  test("진행률과 남은 전환 시간은 일시정지·재생 및 호버 후에도 함께 이어진다", async () => {
    AxiosApi.boxOfficeRecommendations.mockResolvedValue({ data: [1, 2].map((i) => ({ movieCode: `2026000${i}`, title: `진행 영화 ${i}`, releaseDate: "20260101", posterUrl: `/posters/${i}.jpg` })) });
    const view = render(<TodayRecommend />);
    await act(async () => { for (let i = 0; i < 40; i++) await Promise.resolve(); });
    const track = screen.getByRole("button", { name: "1번째 추천 영화" }).parentElement;
    await act(async () => jest.advanceTimersByTime(4000));
    fireEvent.click(screen.getByRole("button", { name: "추천 자동 전환 일시정지" }));
    expect(Number(track.style.getPropertyValue("--slide-progress"))).toBeCloseTo(.4, 2);
    await act(async () => jest.advanceTimersByTime(15000));
    expect(screen.getByText("01 / 02")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "추천 자동 전환 재생" }));
    await act(async () => jest.advanceTimersByTime(5999));
    expect(screen.getByText("01 / 02")).toBeInTheDocument();
    await act(async () => jest.advanceTimersByTime(1));
    expect(screen.getByText("02 / 02")).toBeInTheDocument();
    await act(async () => jest.advanceTimersByTime(2500));
    fireEvent.mouseEnter(screen.getByRole("region", { name: "오늘의 추천 영화" }));
    expect(Number(track.style.getPropertyValue("--slide-progress"))).toBeCloseTo(.25, 2);
    await act(async () => jest.advanceTimersByTime(10000));
    fireEvent.mouseLeave(screen.getByRole("region", { name: "오늘의 추천 영화" }));
    await act(async () => jest.advanceTimersByTime(7500));
    expect(screen.getByText("01 / 02")).toBeInTheDocument();
    await act(async () => jest.advanceTimersByTime(3000));
    fireEvent.click(screen.getByRole("button", { name: "다음 추천 영화" }));
    expect(Number(track.style.getPropertyValue("--slide-progress"))).toBe(0);
    view.unmount(); expect(jest.getTimerCount()).toBe(0);
  });

  test("추천 응답에 포스터가 있으면 재수집하지 않고 이미지 실패 대체 UI를 유지한다", async () => {
    AxiosApi.boxOfficeRecommendations.mockResolvedValue({ data: [{ movieCode: "20260001", title: "저장된 포스터", releaseDate: "20260101", posterUrl: "/posters/saved.jpg" }] });
    render(<TodayRecommend />);
    await act(async () => { for (let i = 0; i < 25; i++) await Promise.resolve(); });
    const image = screen.getByAltText("저장된 포스터");
    expect(image).toHaveAttribute("src", expect.stringContaining("/posters/saved.jpg"));
    expect(AxiosApi.moviePoster).not.toHaveBeenCalled();
    fireEvent.error(image);
    expect(screen.getByText("포스터 준비 중")).toBeInTheDocument();
  });
});
