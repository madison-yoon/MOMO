import { createGlobalStyle } from "styled-components";
import { cinemaCharcoalTokens } from "../redesign/CinemaCharcoal.tokens";

// MOMO 공통 디자인 토큰과 브라우저 기본 요소의 기본 스타일
const GlobalTokensStyles = createGlobalStyle`
  :root {
    --momo-shadow: 0 10px 30px -6px rgba(45, 38, 26, 0.08);
    --momo-radius: 14px;
    ${cinemaCharcoalTokens}
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    background-color: var(--momo-bg);
    color: var(--momo-text);
    font-family:
      "Pretendard Variable",
      Pretendard,
      -apple-system,
      BlinkMacSystemFont,
      system-ui,
      Roboto,
      "Helvetica Neue",
      "Segoe UI",
      "Apple SD Gothic Neo",
      "Noto Sans KR",
      "Malgun Gothic",
      sans-serif;
    letter-spacing: -0.01em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
  }
`;

export default GlobalTokensStyles;
