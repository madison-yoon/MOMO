import React, { useEffect, useRef, useState } from "react";
import SafeImage from "../common/SafeImage";
import FavoriteStar from "../common/FavoriteStar";
import { resolvePosterUrl } from "../../utils/mediaUrl";
import { CarouselShell, CarouselViewport, CarouselArrow, MovieCard, PosterWrap, Rank, MovieInfo, EmptyPoster } from "../../styles/redesign/Home.styles";

// 조회·순위는 Home에 맡기고 표시 범위와 마우스 조작만 관리한다.
export default function BoxOfficeCarousel({ movies, onMovieSelect }) {
  const viewport = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [dragging, setDragging] = useState(false);
  const endDrag = () => { drag.current = null; setDragging(false); };
  const updateEdges = () => {
    const el = viewport.current;
    if (el) setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 });
  };
  useEffect(() => {
    const el = viewport.current;
    updateEdges();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateEdges) : null;
    observer?.observe(el);
    window.addEventListener("resize", updateEdges);
    // 캡처 임계점 전에 영역 밖에서 손을 놓아도 다음 마우스 이동이 드래그로 남지 않는다.
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => { observer?.disconnect(); window.removeEventListener("resize", updateEdges); window.removeEventListener("pointerup", endDrag); window.removeEventListener("pointercancel", endDrag); };
  }, [movies.length]);

  // 창 크기로 열 수가 바뀌어도 실제 카드 폭을 기준으로 한 작품씩 이동한다.
  const move = (direction) => {
    const el = viewport.current;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 22;
    el.scrollBy({ left: direction * ((el.firstElementChild?.getBoundingClientRect().width || 0) + gap), behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return <CarouselShell aria-label="박스오피스 가로 목록">
    <CarouselArrow type="button" $side="left" aria-label="이전 박스오피스 영화" disabled={edges.start} onClick={() => move(-1)}>‹</CarouselArrow>
    <CarouselViewport ref={viewport} data-testid="boxoffice-viewport" $dragging={dragging} onScroll={updateEdges}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        suppressClick.current = false;
        if (event.pointerType === "touch" || event.button !== 0 || event.target.closest("button, a")) return;
        drag.current = { x: event.clientX, left: viewport.current.scrollLeft };
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        if (!event.buttons) { endDrag(); return; }
        const distance = event.clientX - drag.current.x;
        if (Math.abs(distance) < 6 && !suppressClick.current) return;
        suppressClick.current = true;
        setDragging(true);
        viewport.current.setPointerCapture?.(event.pointerId);
        viewport.current.scrollLeft = drag.current.left - distance;
        event.preventDefault(); updateEdges();
      }} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
      onClickCapture={(event) => {
        // 드래그를 영화 선택으로 오인하지 않되 다음 정상 클릭은 막지 않는다.
        if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
      }}>
      {movies.slice(0, 10).map((movie, index) => <MovieCard key={movie.movieCode || index} role="button" tabIndex={0}
        aria-label={`${movie.title} 상세 페이지`} onClick={() => onMovieSelect(movie.movieCode)}
        onFocus={(event) => { if (event.target === event.currentTarget) event.currentTarget.scrollIntoView?.({ block: "nearest", inline: "nearest" }); }}
        onKeyDown={(event) => { if (event.target === event.currentTarget && ["Enter", " "].includes(event.key)) { event.preventDefault(); onMovieSelect(movie.movieCode); } }}>
        <PosterWrap><SafeImage src={resolvePosterUrl(movie.posterUrl)} alt={movie.title} fallback={<EmptyPoster>포스터 준비 중</EmptyPoster>} /><Rank>{movie.rank}</Rank><FavoriteStar movie={movie} /></PosterWrap>
        <MovieInfo><h3>{movie.title}</h3><p>{movie.releaseDate || "개봉일 정보 없음"}</p></MovieInfo>
      </MovieCard>)}
    </CarouselViewport>
    <CarouselArrow type="button" $side="right" aria-label="다음 박스오피스 영화" disabled={edges.end} onClick={() => move(1)}>›</CarouselArrow>
  </CarouselShell>;
}
