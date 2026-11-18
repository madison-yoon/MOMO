import { createGlobalStyle } from "styled-components";

// MOMO 원본 브랜드 팔레트: 웜 크림, 메모지 아이보리, 형광펜 옐로
const GlobalTokensStyles = createGlobalStyle`
  :root {
    color-scheme: light;

    /* Paper / memo */
    --momo-bg: #F5F2EB;
    --momo-surface: #FFFAEC;
    --momo-surface-raised: #FFFEFA;
    --momo-note: #FFFAEC;
    --momo-note-strong: #FFF1B2;

    /* Brand accent: MOMO highlighter yellow */
    --momo-accent: #FFD43B;
    --momo-accent-hover: #F3C72E;
    --momo-accent-soft: #FFF1B2;
    --momo-accent-ink: #292820;

    /* Typography */
    --momo-text: #292820;
    --momo-text-soft: #494333;
    --momo-muted: #6A6251;
    --momo-placeholder: #776F62;
    --momo-link: #715713;

    /* Borders and feedback */
    --momo-border: #E9DFC5;
    --momo-border-strong: #D8C99F;
    --momo-note-border: #E9DFC5;
    --momo-focus: rgba(198, 161, 43, .45);
    --momo-like-bg: #FFF3C5;
    --momo-like-bg-hover: #FFE99A;
    --momo-like-border: #D8B44E;
    --momo-like-text: #66510F;
    --momo-dislike-bg: #FFF1EC;
    --momo-dislike-bg-hover: #FFE5DC;
    --momo-dislike-border: #E5B8AD;
    --momo-dislike-text: #8B4F47;
    --momo-danger: #8C3F38;
    --momo-danger-bg: #FFF0EB;
    --momo-success: #77601C;

    /* Material */
    --momo-shadow-xs: 0 1px 2px rgba(39, 43, 39, .035);
    --momo-shadow-sm: 0 5px 16px rgba(39, 43, 39, .055);
    --momo-shadow: 0 12px 30px rgba(39, 43, 39, .075);
    --momo-shadow-lg: 0 20px 46px rgba(39, 43, 39, .105);
    --momo-glass: rgba(255, 250, 236, .76);
    --momo-glass-border: rgba(255, 255, 255, .78);
    --momo-header-glass: rgba(255, 250, 236, .84);

    /* Layout */
    --momo-radius-sm: 8px;
    --momo-radius: 13px;
    --momo-radius-lg: 19px;
    --momo-radius-pill: 999px;
    --momo-content-width: 1280px;
    --momo-page-gutter: clamp(18px, 4vw, 52px);
    --momo-section-gap: clamp(34px, 4.2vw, 56px);
    --momo-font-display: clamp(2rem, 3.5vw, 3.25rem);
    --momo-font-title: clamp(1.3rem, 2vw, 1.75rem);
    --momo-font-body: .9375rem;
    --momo-line-body: 1.65;
    --momo-space-1: 4px;
    --momo-space-2: 8px;
    --momo-space-3: 12px;
    --momo-space-4: 16px;
    --momo-space-6: 24px;
    --momo-space-8: 32px;
    --momo-space-10: 40px;
    --momo-space-12: 48px;
    --momo-transition-fast: 150ms cubic-bezier(.2, .7, .2, 1);
    --momo-transition-ui: 220ms cubic-bezier(.2, .7, .2, 1);
    --momo-ring: 0 0 0 3px rgba(255, 212, 59, .22);
  }

  html, body, #root { min-height: 100%; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background: var(--momo-bg);
    color: var(--momo-text);
    font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
      system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo",
      "Noto Sans KR", "Malgun Gothic", sans-serif;
    letter-spacing: -.012em;
    line-height: var(--momo-line-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  button, input, textarea, select { font: inherit; }
  a { color: inherit; }
  img { max-width: 100%; }
  button, a, input, textarea, select { -webkit-tap-highlight-color: transparent; }
  button { color: inherit; }
  button:disabled { cursor: not-allowed; opacity: .58; }
  :focus-visible {
    outline: 3px solid var(--momo-focus);
    outline-offset: 3px;
  }
  ::selection { color: var(--momo-text); background: #DDD4BE; }
  input::placeholder, textarea::placeholder { color: var(--momo-placeholder); }
  code { font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      scroll-behavior: auto;
      animation-duration: .01ms;
      animation-iteration-count: 1;
      transition-duration: .01ms;
    }
  }
`;

export default GlobalTokensStyles;
