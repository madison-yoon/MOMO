import React from "react";
import { TopButton } from "../../styles/redesign/Home.styles";

// 홈의 채팅 실행 버튼과 같은 크기로 항상 표시하고 두 버튼 사이에 12px을 둔다.
export default function ScrollToTop() {
  return <TopButton type="button" aria-label="맨 위로 이동" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 12 6-6 6 6M12 6v13" /></svg>
  </TopButton>;
}
