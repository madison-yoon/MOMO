import React, { useRef } from "react";

// 기존 인물 버튼과 상세 이동은 그대로 두고 목록의 스크롤만 제어한다.
export default function ActorCarousel({ children }) {
  const list = useRef(null);
  const move = (direction) => list.current?.scrollBy({ left: direction * 308, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return <div className="actor-carousel">
    <div className="actor-carousel-controls"><button type="button" aria-label="이전 출연 배우" onClick={() => move(-1)}>‹</button><button type="button" aria-label="다음 출연 배우" onClick={() => move(1)}>›</button></div>
    <div className="people-list actor-people-list" ref={list} role="region" aria-label="출연 배우 가로 목록">{children}</div>
  </div>;
}
