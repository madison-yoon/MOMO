import styled from "styled-components";
import { homeFloatingButtonStyle } from "./HomeTheme.styles";

// API와 이벤트를 가진 Home은 유지하고, 화면 구성에 필요한 스타일만 분리한다.
export const HomePage = styled.div`
  width: 100%;
  min-width: 0;
  color: var(--momo-text);

  .home-favorites-more {
    min-height: 40px;
    padding: 8px 12px;
    border: 1px solid var(--momo-border);
    border-radius: 8px;
    color: var(--momo-accent-ink);
    background: var(--momo-surface);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }
  .home-favorites-more:hover { border-color: var(--momo-accent); }
  .home-favorites-empty {
    padding: 26px 28px;
    background: var(--momo-surface);
    border: 1px solid var(--momo-border);
    border-radius: 14px;
    color: var(--momo-text);
  }
  .home-favorites-empty p {
    margin: 8px 0 0;
    color: var(--momo-muted);
    font-size: 14px;
    line-height: 1.7;
  }
  button:focus-visible, a:focus-visible {
    outline: 3px solid var(--momo-accent-ink);
    outline-offset: 4px;
  }
`;

// 하나의 영화관 배경을 유지하고 정보별 고정 행으로 제목 길이·로딩에 따른 높이 변화를 막는다.
export const FeatureSection = styled.section`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  height: 480px;
  margin-bottom: 56px;
  border-radius: 12px;
  background: var(--home-hero-bg, #211E1C);
  color: var(--home-hero-text, #FFFFFF);
  &::after { content: ""; position: absolute; z-index: -1; inset: 0; background: var(--home-hero-overlay, linear-gradient(90deg, rgba(21,19,17,.93), rgba(21,19,17,.65) 60%, rgba(21,19,17,.35))); }
  a:focus-visible, button:focus-visible { outline: 3px solid var(--home-focus, #E2AE97); outline-offset: 3px; }
  .recommend-banner { position: relative; display: grid; grid-template-rows: minmax(0, 1fr) 70px; width: 100%; height: 100%; min-height: 0; margin: 0; padding: 32px 40px 0; box-sizing: border-box; border-radius: 0; background: none; box-shadow: none; }
  .recommend-layout { display: grid; grid-row: 1; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); align-items: center; gap: 44px; min-height: 0; height: 100%; padding: 0 0 24px; box-sizing: border-box; animation: home-film-fade .45s ease-out; }
  .recommend-content { position: static; display: grid; grid-template-rows: 18px 104px 20px 20px 48px 44px; row-gap: 10px; align-content: center; height: 100%; min-width: 0; min-height: 0; max-width: none; padding: 0; color: var(--home-hero-text, #FFFFFF); }
  .recommend-label { grid-row: 1; display: block; border: 0; border-radius: 0; box-shadow: none; letter-spacing: normal; margin: 0; padding: 0; background: none; color: var(--home-hero-accent, #E3BDA7); font-size: 13px; line-height: 18px; font-weight: 500; }
  .recommend-title { grid-row: 2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; color: var(--home-hero-text, #FFFFFF); font-size: 40px; font-weight: 700; line-height: 52px; letter-spacing: -.03em; word-break: keep-all; overflow-wrap: anywhere; }
  .recommend-subtitle { grid-row: 3; margin: 0; color: var(--home-hero-muted, #DCCABD); font-size: 13px; line-height: 20px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
  .recommend-info { grid-row: 4; margin: 0; color: var(--home-hero-accent, #E3BDA7); font-size: 13px; line-height: 20px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
  .recommend-description { grid-row: 5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; color: var(--home-hero-text, #F0E4DA); font-size: 14px; line-height: 24px; overflow-wrap: anywhere; }
  .recommend-button { grid-row: 6; justify-self: start; height: 44px; min-height: 44px; padding: 11px 21px; border: 0; border-radius: 6px; color: var(--home-primary-text, #FFFFFF); background: var(--momo-primary); font-size: 14px; font-weight: 600; cursor: pointer; }
  .recommend-button:hover { background: var(--momo-primary-hover); }
  .recommend-poster-link { display: block; justify-self: center; width: 216px; height: 324px; padding: 0; border: 0; border-radius: 9px; background: none; cursor: pointer; box-shadow: 0 14px 30px rgba(0,0,0,.4); }
  .recommend-poster { opacity: 1; display: block; position: static; width: 100%; height: 100%; object-fit: contain; border-radius: 9px; background: var(--home-poster-bg, #302923); }
  .poster-placeholder { display: flex; align-items: center; justify-content: center; color: var(--home-hero-muted, #E4D9CF); font-size: 13px; }
  .recommend-footer { grid-row: 2; display: flex; align-items: center; justify-content: space-between; gap: 24px; height: 70px; box-sizing: border-box; padding: 14px 0; border-top: 1px solid var(--home-hero-border, #69584B); }
  .recommend-footer > p { margin: 0; color: var(--home-hero-muted, #E4D9CF); font-size: 13px; line-height: 1.7; }
  .recommend-controls { display: flex; align-items: center; gap: 3px; color: var(--home-hero-text, #F1E7DB); }
  .recommend-controls button { display: grid; place-items: center; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 4px; background: none; color: var(--home-hero-text, #F1E7DB); font-size: 23px; cursor: pointer; }
  .recommend-controls button:hover:not(:disabled) { background: var(--home-hero-hover, #534238); }
  .recommend-controls button:disabled { opacity: .35; cursor: default; }
  .recommend-dots { display: flex; }
  .recommend-dots button { width: 24px; }
  .recommend-dots span { display: block; position: relative; overflow: hidden; width: 5px; height: 5px; border-radius: 50%; background: var(--home-hero-muted, #AE9483); }
  .recommend-dots i { display: none; }
  .recommend-dots [aria-current="true"] span { width: 20px; border-radius: 4px; background: var(--home-hero-hover, #6F594A); }
  .recommend-dots [aria-current="true"] i { display: block; position: absolute; inset: 0; background: var(--home-hero-accent, #E5B59B); transform: scaleX(var(--slide-progress, 0)); transform-origin: left center; }
  .recommend-counter { min-width: 60px; text-align: center; font-size: 12px; font-variant-numeric: tabular-nums; }
  .recommend-state { grid-row: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; height: 100%; min-height: 0; padding: 0 0 24px; margin: 0; border: 0; background: none; box-sizing: border-box; color: var(--home-hero-muted, #E4D9CF); text-align: left; }
  .recommend-state h1 { margin: 0 0 18px; font-size: 40px; line-height: 1.45; letter-spacing: -.03em; color: var(--home-hero-text, #FFFFFF); }
  .recommend-state p { margin: 0; max-width: 52ch; font-size: 14px; line-height: 1.8; }
  @keyframes home-film-fade { from { opacity: .35; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .recommend-layout { animation: none; } }
  @media (max-width: 900px) { .recommend-banner { padding: 28px 28px 0; } .recommend-layout { gap: 24px; } .recommend-poster-link { max-width: 180px; } }
  @media (max-width: 520px) { .recommend-layout { grid-template-columns: 1fr; } .recommend-poster-link { width: 150px; } .recommend-footer { justify-content: center; } .recommend-controls { gap: 0; } .recommend-dots button { width: 20px; } }
`;
export const HeroBackdrop = styled.img`
  position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center;
`;

export const Section = styled.section`
  margin-bottom: 52px;
  scroll-margin-top: 110px;
`;
export const SectionHeading = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
  h2 { margin: 0; color: var(--momo-text); font-size: 25px; line-height: 1.4; letter-spacing: -0.025em; }
  p { margin: 7px 0 0; color: var(--momo-muted); font-size: 14px; line-height: 1.65; }
`;
export const MoreText = styled.span`
  color: var(--momo-muted);
  font-size: 13px;
  white-space: nowrap;
`;
// 작은 PC 창이나 화면 확대에서도 기존 열 수 전환 규칙을 유지한다.
export const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 30px 22px;
  @media (max-width: 1000px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (max-width: 700px) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 12px; }
  @media (max-width: 430px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
export const MovieCard = styled.div`
  min-width: 0;
  cursor: pointer;
  &:focus-visible { outline: 3px solid var(--momo-accent-ink); outline-offset: 5px; border-radius: 10px; }
  &:hover h3 { color: var(--momo-accent-ink); text-decoration: underline; text-underline-offset: 4px; }
`;
export const PosterWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 7px;
  background: var(--home-poster-bg, #E9DFD4);
  img { display: block; width: 100%; height: 100%; object-fit: cover; }
`;
export const Rank = styled.span`
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  padding: 3px 7px;
  border-radius: 5px;
  background: transparent;
  text-shadow: 0 2px 5px rgba(0,0,0,.95);
  color: #FFFFFF;
  font-size: 20px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
`;
export const MovieInfo = styled.div`
  padding-top: 13px;
  h3 { margin: 0; color: var(--momo-text); font-size: 15px; line-height: 1.6; font-weight: 700; overflow-wrap: anywhere; }
  p { margin: 5px 0 0; color: var(--momo-muted); font-size: 12px; line-height: 1.6; }
`;
export const GenreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 24px;
  button {
    min-height: 42px;
    padding: 9px 18px;
    border: 1px solid var(--momo-border);
    border-radius: 22px;
    color: var(--momo-muted);
    background: var(--momo-surface);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover, button[aria-pressed="true"] { border-color: var(--momo-accent); background: var(--momo-note); color: var(--momo-accent-ink); }
`;
export const BrandLine = styled.div`
  padding-top: 24px;
  border-top: 1px solid var(--momo-border);
  h2 { margin: 0; font-size: 20px; line-height: 1.5; letter-spacing: -0.02em; }
  p { margin: 6px 0 0; color: var(--momo-muted); font-size: 14px; line-height: 1.7; }
`;
export const EmptyPoster = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--momo-muted);
  font-size: 13px;
`;
// 실패를 정상적인 빈 목록과 구분하여 잘못된 0건 안내를 피한다.
export const HomeState = styled.div`
  padding: 28px;
  border: 1px solid var(--momo-border);
  border-radius: 12px;
  color: var(--momo-muted);
  background: var(--momo-surface);
  font-size: 14px;
  line-height: 1.7;
`;

export const SectionLink = styled.a`
  display: inline-flex; align-items: center; gap: 10px; min-height: 40px;
  color: var(--momo-accent-ink); font-size: 13px; font-weight: 600; text-decoration: none;
  &:hover { text-decoration: underline; }
`;
export const ReviewsGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;
export const ReviewPreview = styled.a`
  display: flex; flex-direction: column; min-width: 0; padding: 24px;
  border: 1px solid var(--momo-border); border-radius: 8px;
  background: var(--momo-surface); color: var(--momo-text); text-decoration: none;
  h3 { margin: 13px 0 24px; font-size: 18px; line-height: 1.65; font-weight: 650; overflow-wrap: anywhere; }
  &:hover { border-color: var(--momo-accent); }
  &:hover h3 { text-decoration: underline; text-underline-offset: 4px; }
`;
export const ReviewMovie = styled.p`
  margin: 0; font-size: 12px; line-height: 1.65; color: var(--momo-accent-ink); overflow-wrap: anywhere;
`;
export const ReviewAuthor = styled.div`
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-top: auto;
  color: var(--momo-muted); font-size: 12px; line-height: 1.7;
  span { overflow-wrap: anywhere; }
`;
export const ReviewReactions = styled.div`
  display: flex; flex-wrap: wrap; gap: 12px; padding-top: 14px; margin-top: 15px;
  border-top: 1px solid var(--momo-border); color: var(--momo-muted); font-size: 12px; line-height: 1.7;
`;

// 화면 폭이 달라져도 두 번째 줄을 만들지 않고 가로 탐색을 유지한다.
// 순위 글자의 그림자만 유지하고 포스터 전체를 덮는 효과는 사용하지 않는다.
export const CarouselShell = styled.div`
  position: relative;
  ${PosterWrap}::before, ${PosterWrap}::after { content: none; display: none; }
  ${PosterWrap} img { opacity: 1; filter: none; }
`;
export const CarouselViewport = styled.div`
  --visible: 5;
  display: grid; grid-auto-flow: column; grid-auto-columns: calc((100% - (var(--visible) - 1) * 22px) / var(--visible));
  column-gap: 22px; padding: 6px 0 12px; overflow-x: auto; overscroll-behavior-x: contain;
  scrollbar-width: none; scroll-snap-type: ${({ $dragging }) => $dragging ? "none" : "x proximity"};
  cursor: ${({ $dragging }) => $dragging ? "grabbing" : "grab"}; touch-action: pan-x pan-y;
  user-select: none; &::-webkit-scrollbar { display: none; }
  > div { scroll-snap-align: start; }
  @media (max-width: 1000px) { --visible: 4; }
  @media (max-width: 760px) { --visible: 3; }
  @media (max-width: 520px) { --visible: 2; }
`;
export const CarouselArrow = styled.button`
  position: absolute; z-index: 3; top: 39%; ${({ $side }) => $side === "left" ? "left: -20px" : "right: -20px"};
  display: grid; place-items: center; width: 44px; height: 44px; padding: 0;
  border: 2px solid var(--home-carousel-border, #775A48); border-radius: 50%; background: var(--home-carousel-bg, #F5F1E8); color: var(--home-carousel-ink, #292929); font-size: 28px; cursor: pointer;
  &:disabled { opacity: .35; cursor: default; }
  &:hover:not(:disabled) { background: var(--home-carousel-hover, #E3D5C5); border-color: var(--home-carousel-ink, #292929); }
`;
// 채팅 팝업보다 아래에 두어 메시지 입력창이나 전송 버튼을 가리지 않는다.
export const TopButton = styled.button`
  ${homeFloatingButtonStyle}
  z-index: 999;
  bottom: 88px;
`;
