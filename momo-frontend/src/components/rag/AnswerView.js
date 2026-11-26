import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Answer = styled.section`
  border-top: 1px solid var(--momo-border); padding-top: 24px;
  p { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.8; }
  li { margin-bottom: 16px; overflow-wrap: anywhere; }
  a { color: var(--momo-accent-ink); text-decoration: underline; }
  small { color: var(--momo-muted); }
`;
const NODE_LABEL = { retrieve: "검색", grade: "근거 평가", rewrite: "질문 재작성", generate: "답변 생성", abstain: "답변 보류", format: "정리" };

// 서버의 답변은 HTML로 해석하지 않으며, 실제 검색 출처의 리뷰 ID로 상세 화면을 연결한다.
export default function AnswerView({ question, result }) {
  const { answer, abstained, sources = [], trace = [] } = result;
  return <Answer aria-label="AI 답변">
    <small>질문 · {question}</small>
    <h2>{abstained ? "답변 보류" : "리뷰 기반 답변"}</h2>
    <p>{answer}</p>
    <h3>출처 리뷰</h3>
    {sources.length ? <ol>{sources.map((source, index) => <li key={`${source.review_id}-${index}`}>
      <Link to={`/reviews/${encodeURIComponent(source.review_id)}`}>#{source.review_id} {source.title || "리뷰 상세 보기"}</Link>
      <small> · 유사도 {Number.isFinite(source.score) ? source.score.toFixed(2) : "확인 불가"}</small>
      <p>{source.snippet}</p>
    </li>)}</ol> : <p>답변에 사용할 리뷰 근거가 없습니다.</p>}
    <h3>실행 경로 (LangGraph trace)</h3>
    {trace.length ? <ol aria-label="LangGraph 실행 경로">{trace.map((node, index) => <li key={index}>{NODE_LABEL[node] || node}</li>)}</ol> : <p>제공된 실행 경로가 없습니다.</p>}
  </Answer>;
}
