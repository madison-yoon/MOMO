import { css } from "styled-components";

// 두 실행 버튼의 색상·크기·상호작용을 같은 기준으로 맞추되 홈 밖에는 적용하지 않는다.
export const homeFloatingButtonStyle = css`
  box-sizing: border-box;
  position: fixed; right: 20px;
  display: grid; place-items: center;
  width: 56px; height: 56px; min-width: 56px;
  padding: 0; border: 0; border-radius: 50%;
  background: #775A48; color: #FFFFFF; cursor: pointer;
  &:hover { background: #604735; }
  &:focus-visible { outline: 3px solid #292929; outline-offset: 4px; }
`;

// 홈 컨테이너에만 적용하며, 펼침 속성이 있는 채팅 실행 버튼의 모양만 바꾼다.
// 상태·알림 DOM은 유지하고 아이콘 전용 표시에서도 읽지 않은 메시지 배지는 남긴다.
export const homeRedesignTheme = css`
  --momo-bg: #F5F1E8;
  --momo-surface: #FFFFFF;
  --momo-text: #292929;
  --momo-muted: #775A48;
  --momo-border: #DED6CB;
  --momo-note: #F1E7DB;
  --momo-note-border: #DED6CB;
  --momo-accent: #C66B4E;
  --momo-accent-ink: #8E402B;
  --momo-primary: #B45B40;
  --momo-primary-hover: #9E4932;
  --momo-radius: 14px;
  --momo-content-width: 1120px;
  --home-header-bg: #292929;
  --home-header-height: 88px;
  --home-header-padding: 0 28px;
  --home-nav-color: #E7DDD2;
  --home-nav-active: #FFFFFF;
  --home-logo-filter: grayscale(1) invert(1);
  --home-main-width: calc(100% - 64px);
  --home-main-max: var(--momo-content-width);
  --home-main-padding: 32px 0 64px;
  --home-footer-bg: #EEE6DA;
  --home-footer-padding: 28px max(32px, calc((100% - 1120px) / 2));

  background-color: var(--momo-bg);
  color: var(--momo-text);

  .momo-search-form {
    min-height: 42px;
    background: var(--momo-surface);
    border-color: var(--momo-border);
    border-radius: 8px;
  }
  .momo-search-input:focus-visible {
    outline: 2px solid #E2AE97;
    outline-offset: 4px;
    border-radius: 3px;
  }
  .momo-search-input, .momo-search-button { color: var(--momo-text); }
  .momo-search-input::placeholder { color: var(--momo-muted); }
  .momo-search-button:hover { color: var(--momo-text); }

  .favorite-star.is-active {
    background: var(--momo-note);
    color: var(--momo-accent-ink);
    border-color: var(--momo-accent);
  }


  button[aria-expanded][aria-label="공용 채팅 열기"],
  button[aria-expanded][aria-label="채팅 닫기"] {
    ${homeFloatingButtonStyle}
    bottom: 20px;
    &::before { content: ""; width: 26px; height: 26px; background: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221.8%22%3E%3Cpath%20d%3D%22M6%204h12a3%203%200%200%201%203%203v7a3%203%200%200%201-3%203H9l-5%204v-4a3%203%200%200%201-3-3V7a3%203%200%200%201%203-3Z%22%2F%3E%3Cpath%20d%3D%22M7%2010h.01M12%2010h.01M17%2010h.01%22%20stroke-linecap%3D%22round%22%20stroke-width%3D%222.8%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
    > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    > span[aria-label^="새 메시지"] { top: -4px; right: -4px; width: auto; min-width: 20px; height: 20px; clip-path: none; overflow: visible; }
  }

  ::selection { background: #E6C2AF; color: #292929; }
  input, textarea { caret-color: var(--momo-accent); }
  a, button { text-underline-offset: 4px; }
`;

// 공통 아카이브 테마는 유지하고 홈 경로에서만 Cinema Charcoal 색상 역할을 덮어쓴다.
export const cinemaCharcoalTheme = css`
  --momo-bg: #303030;
  --momo-surface: #424242;
  --momo-text: #F0ECE6;
  --momo-muted: #C9C2BA;
  --momo-border: #6D665F;
  --momo-note: #514139;
  --momo-note-border: #8D6A57;
  --momo-accent: #C0785A;
  --momo-accent-ink: #E4AE92;
  --momo-primary: #C0785A;
  --momo-primary-hover: #D38B6B;
  --home-header-bg: #222222;
  --home-nav-color: #C9C2BA;
  --home-nav-active: #F0ECE6;
  --home-header-border: #424242;
  --home-action-bg: #424242;
  --home-action-color: #F0ECE6;
  --home-action-border: #6D665F;
  --home-action-hover: #514139;
  --home-footer-bg: #222222;
  --home-footer-text: #C9C2BA;
  --home-footer-heading: #F0ECE6;
  --home-footer-border: #6D665F;
  --home-footer-logo-filter: grayscale(1) invert(1);
  --home-poster-bg: #424242;
  --home-primary-text: #222222;
  --home-carousel-bg: #424242;
  --home-carousel-border: #A89B8F;
  --home-carousel-ink: #F0ECE6;
  --home-carousel-hover: #514139;
  --home-floating-bg: #424242;
  --home-floating-ink: #F0ECE6;
  --home-floating-hover: #55504B;
  --home-focus: #E4AE92;
  --home-hero-bg: #222222;
  --home-hero-overlay: linear-gradient(90deg, rgba(34,34,34,.94), rgba(34,34,34,.7) 60%, rgba(34,34,34,.4));
  --home-hero-text: #F0ECE6;
  --home-hero-muted: #C9C2BA;
  --home-hero-accent: #E4AE92;
  --home-hero-border: #6D665F;
  --home-hero-hover: #424242;
  --home-subtle-border: #5A5552;
  --home-detail-text: #BEB8B2;

  .momo-search-form, .momo-search-dropdown, .momo-search-result {
    background: var(--momo-surface);
    border-color: var(--momo-border);
  }
  .momo-search-form:focus-within {
    border-color: var(--momo-accent);
    box-shadow: 0 0 0 3px rgba(192,120,90,.25);
  }
  .momo-search-input, .momo-search-button, .momo-search-title { color: var(--momo-text); }
  .momo-search-input::placeholder, .momo-search-meta, .momo-search-message,
  .momo-search-poster-fallback { color: var(--momo-muted); }
  .momo-search-button:hover { color: var(--momo-accent-ink); }
  .momo-search-result:hover, .momo-search-result:focus-visible,
  .momo-search-result.is-active { background: var(--momo-note); }
  .momo-search-poster { background: var(--momo-bg); border-color: var(--momo-border); }
  .favorite-star { background: var(--momo-surface); color: var(--momo-text); border-color: var(--momo-border); }
  // 공유 실행 버튼의 기본 스타일은 그대로 두고 홈 안에서만 색상을 바꾼다.
  button[aria-label="맨 위로 이동"],
  button[aria-expanded][aria-label="공용 채팅 열기"],
  button[aria-expanded][aria-label="채팅 닫기"] {
    background: var(--home-floating-bg);
    color: var(--home-floating-ink);
    &:hover { background: var(--home-floating-hover); }
    &:focus-visible { outline-color: var(--home-focus); }
  }

  // 제목과 주요 설명의 대비는 유지하고 날짜·반응 수 등 부가 정보만 한 단계 낮춘다.
  section[aria-label="최근 영화 메모"] a[href^="/reviews/"] {
    border-color: var(--home-subtle-border);
    &:hover { border-color: var(--home-carousel-border); }
    &:focus-visible { outline: 2px solid var(--momo-text); outline-offset: 3px; }
    time, > div:last-child { color: var(--home-detail-text); }
    > div:last-child { border-color: var(--home-subtle-border); }
  }
  section[aria-label="오늘의 박스오피스"] [role="button"] p,
  section[aria-label="장르로 영화 찾기"] [role="button"] p {
    color: var(--home-detail-text);
  }

  .momo-search-form { border-color: var(--home-carousel-border); }
  .momo-search-form:focus-within {
    border-color: var(--home-detail-text);
    box-shadow: 0 0 0 3px rgba(190,184,178,.25);
  }
  .momo-search-input::placeholder, .momo-search-meta, .momo-search-message {
    color: var(--home-detail-text);
  }
  .momo-search-input:focus-visible { outline-color: var(--momo-text); }

  // 보조 탐색은 중립색으로 구분해 테라코타 주요 액션과 경쟁하지 않게 한다.
  .home-favorites-more {
    color: var(--momo-text);
    border-color: var(--home-carousel-border);
    &:hover { background: var(--home-subtle-border); border-color: var(--home-detail-text); }
    &:focus-visible { outline-color: var(--momo-text); }
  }
  section[aria-label="최근 영화 메모"] a[href="/reviews"] {
    color: var(--momo-text);
    &:hover { color: var(--home-detail-text); }
    &:focus-visible { outline-color: var(--momo-text); }
  }
  button[aria-label$="박스오피스 영화"] {
    &:hover:not(:disabled) { background: var(--home-subtle-border); border-color: var(--home-detail-text); }
    &:focus-visible { outline-color: var(--momo-text); }
  }
  ::selection { background: var(--momo-accent); color: #222222; }
`;
