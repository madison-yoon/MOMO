import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import BoxOfficeCarousel from "./BoxOfficeCarousel";
jest.mock("../common/FavoriteStar", () => () => <button>관심 영화</button>);
const movies = Array.from({ length: 10 }, (_, i) => ({ movieCode: String(i), title: `영화 ${i}`, rank: i + 1 }));

test("10편을 유지하고 카드와 키보드로 기존 상세 이동을 요청한다", () => {
  const go = jest.fn(); render(<BoxOfficeCarousel movies={movies} onMovieSelect={go} />);
  expect(screen.getAllByRole("button", { name: /상세 페이지/ })).toHaveLength(10);
  fireEvent.click(screen.getByRole("button", { name: "영화 0 상세 페이지" }));
  fireEvent.keyDown(screen.getByRole("button", { name: "영화 1 상세 페이지" }), { key: "Enter" });
  expect(go.mock.calls).toEqual([["0"], ["1"]]);
  fireEvent.keyDown(screen.getAllByRole("button", { name: "관심 영화" })[0], { key: "Enter" });
  expect(go).toHaveBeenCalledTimes(2);
});

test("화살표는 한 카드 단위로 이동하고 처음·끝에서는 비활성화한다", () => {
  render(<BoxOfficeCarousel movies={movies} onMovieSelect={jest.fn()} />);
  const viewport = screen.getByTestId("boxoffice-viewport");
  Object.defineProperties(viewport, { clientWidth: { value: 1000 }, scrollWidth: { value: 2020 } });
  viewport.firstElementChild.getBoundingClientRect = () => ({ width: 188 });
  viewport.scrollBy = jest.fn();
  fireEvent(window, new Event("resize"));
  expect(screen.getByRole("button", { name: "이전 박스오피스 영화" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "다음 박스오피스 영화" }));
  expect(viewport.scrollBy).toHaveBeenCalledWith({ left: 210, behavior: "smooth" });
  viewport.scrollLeft = 1020; fireEvent.scroll(viewport);
  expect(screen.getByRole("button", { name: "다음 박스오피스 영화" })).toBeDisabled();
});

test("마우스 드래그 뒤 카드 클릭은 차단하고 다음 정상 클릭은 허용한다", () => {
  const go = jest.fn(); render(<BoxOfficeCarousel movies={movies} onMovieSelect={go} />);
  const viewport = screen.getByTestId("boxoffice-viewport");
  // jsdom에서 마우스 좌표를 보존하도록 PointerEvent를 사용한다.
  window.PointerEvent = MouseEvent;
  fireEvent.pointerDown(viewport, { button: 0, clientX: 300 });
  fireEvent.pointerMove(viewport, { clientX: 200, buttons: 1 });
  fireEvent.pointerUp(viewport);
  fireEvent.click(screen.getByRole("button", { name: "영화 0 상세 페이지" }));
  expect(go).not.toHaveBeenCalled();
  fireEvent.pointerDown(viewport, { button: 0, clientX: 200 }); fireEvent.pointerUp(viewport);
  fireEvent.click(screen.getByRole("button", { name: "영화 0 상세 페이지" }));
  expect(go).toHaveBeenCalledWith("0");
});

test("영역 밖에서 버튼을 놓은 뒤 돌아와도 드래그가 이어지지 않는다", () => {
  window.PointerEvent = MouseEvent;
  render(<BoxOfficeCarousel movies={movies} onMovieSelect={jest.fn()} />);
  const viewport = screen.getByTestId("boxoffice-viewport");
  fireEvent.pointerDown(viewport, { button: 0, clientX: 100 });
  fireEvent.pointerUp(window);
  fireEvent.pointerMove(viewport, { clientX: 200, buttons: 0 });
  expect(viewport.scrollLeft).toBe(0);
});
