import { createGlobalStyle } from "styled-components";

// MOMO palette: cool mineral surfaces with a warm highlighter accent
const GlobalTokensStyles = createGlobalStyle`
  :root {
    color-scheme: light;

    /* Neutral canvas and glass surfaces */
    --momo-bg: #EFF3EF;
    --momo-surface: #F8FBF8;
    --momo-surface-raised: #FFFEFA;
    --momo-note: #EEF4EF;
    --momo-note-strong: #E3EEE5;

    /* Brand accent: MOMO highlighter yellow */
    --momo-accent: #FFD43B;
    --momo-accent-hover: #F3C51E;
    --momo-accent-soft: #FFF1B2;
    --momo-accent-ink: #292820;

    /* Typography */
    --momo-text: #292820;
    --momo-text-soft: #514C40;
    --momo-muted: #6A6251;
    --momo-placeholder: #776F62;
    --momo-link: #715713;

    /* Borders and feedback */
    --momo-border: #DCE5DD;
    --momo-border-strong: #C9D7CC;
    --momo-note-border: #D8E4DA;
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
    --momo-shadow: 0 12px 28px rgba(41, 40, 32, .065);
    --momo-shadow-lg: 0 24px 48px rgba(41, 40, 32, .105);
    --momo-glass: rgba(255, 253, 247, .48);
    --momo-glass-border: rgba(255, 255, 255, .86);
    --momo-header-glass: rgba(255, 253, 247, .58);
    --momo-glass-clear: rgba(255, 255, 255, .32);
    --momo-glass-soft: rgba(238, 245, 240, .48);
    --momo-glass-highlight: rgba(255, 255, 255, .94);
    --momo-glass-shadow: 0 14px 34px rgba(34,42,37,.075), 0 3px 8px rgba(34,42,37,.035), inset 0 1px rgba(255,255,255,.96), inset 0 -1px rgba(207,220,210,.16);
    --momo-depth-shadow: 0 16px 34px rgba(41,40,32,.085), 0 4px 10px rgba(41,40,32,.04), inset 0 1px rgba(255,255,255,.96);

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
    --momo-ring: 0 0 0 3px rgba(214, 180, 63, .2);
    --momo-glass-blur: 26px;
    --momo-glass-saturation: 150%;
    --momo-glass-tint: rgba(255, 250, 236, .36);
    --momo-glass-edge: rgba(255, 255, 255, .88);
    --momo-glass-inner-light: inset 0 1px 0 rgba(255,255,255,.96);
    --momo-glass-depth: 0 2px 5px rgba(41,40,32,.035), 0 12px 28px rgba(41,40,32,.075), inset 0 1px 0 rgba(255,255,255,.96);
  }

  html, body, #root { min-height: 100%; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background-color: var(--momo-bg);
    background-image:
      radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.72), transparent 42rem),
      radial-gradient(ellipse at 92% 16%, rgba(145,166,154,.075), transparent 44rem),
      linear-gradient(140deg, rgba(226,230,221,.12), transparent 54%);
    background-size: auto, auto, auto;
    background-attachment: fixed;
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

`;

export default GlobalTokensStyles;
