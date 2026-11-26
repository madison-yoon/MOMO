import { css } from "styled-components";

// 레이아웃 값 없이 색상 역할만 공유해 기존 화면의 배치와 홈 A안을 보존한다.
export const cinemaCharcoalTokens = css`
  --momo-bg: #303030;
  --momo-surface: #424242;
  --momo-text: #F0ECE6;
  --momo-muted: #BEB8B2;
  --momo-border: #5A5552;
  --momo-note: #373737;
  --momo-note-border: #5A5552;
  --momo-accent: #C0785A;
  --momo-accent-ink: #E4AE92;
  --momo-primary: #C0785A;
  --momo-primary-hover: #D38B6B;
  --momo-on-primary: #222222;
  --momo-control-hover: #5A5552;
  --momo-success: #93D3AC;
  --momo-error: #F2A7A0;
  --momo-warning: #E3C68C;
  --momo-like-bg: #35483C;
  --momo-like-bg-hover: #405A49;
  --momo-like-border: #789E85;
  --momo-like-text: #B3DDC0;
  --momo-dislike-bg: #503B3B;
  --momo-dislike-bg-hover: #644646;
  --momo-dislike-border: #B77F79;
  --momo-dislike-text: #F2BEB8;
  --home-header-bg: #222222;
  --home-header-border: #424242;
  --home-logo-filter: grayscale(1) invert(1);
  --home-nav-color: #BEB8B2;
  --home-nav-active: #F0ECE6;
  --home-action-bg: #424242;
  --home-action-color: #F0ECE6;
  --home-action-border: #5A5552;
  --home-action-hover: #5A5552;
  --home-footer-bg: #222222;
  --home-footer-text: #BEB8B2;
  --home-footer-heading: #F0ECE6;
  --home-footer-border: #5A5552;
  --home-footer-logo-filter: grayscale(1) invert(1);
`;

// 공유 실행 버튼은 홈 밖에서도 같은 중립색을 사용하되 크기와 위치는 기존 값을 유지한다.
export const cinemaCharcoalControls = css`
  button[aria-label="맨 위로 이동"],
  button[aria-expanded][aria-label="공용 채팅 열기"],
  button[aria-expanded][aria-label="채팅 닫기"] {
    background: var(--momo-surface); color: var(--momo-text);
    &:hover { background: var(--momo-control-hover); }
    &:focus-visible { outline-color: var(--momo-text); }
  }
`;
