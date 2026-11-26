import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ActorCarousel from "./ActorCarousel";

test("배우 카드는 기존 자식을 유지하고 좌우 버튼으로 가로 목록만 이동한다", () => {
  const click = jest.fn();
  render(<ActorCarousel><button onClick={click}>배우 상세</button></ActorCarousel>);
  const list = screen.getByRole("region", { name: "출연 배우 가로 목록" });
  list.scrollBy = jest.fn();
  fireEvent.click(screen.getByRole("button", { name: "다음 출연 배우" }));
  expect(list.scrollBy).toHaveBeenCalledWith({ left: 308, behavior: "smooth" });
  fireEvent.click(screen.getByRole("button", { name: "이전 출연 배우" }));
  expect(list.scrollBy).toHaveBeenLastCalledWith({ left: -308, behavior: "smooth" });
  fireEvent.click(screen.getByRole("button", { name: "배우 상세" }));
  expect(click).toHaveBeenCalledTimes(1);
});
