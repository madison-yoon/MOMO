import React, { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import styled from "styled-components";
import AxiosApi, {
  getAuthSessionVersion,
  isAuthSessionCurrent,
  getAuthSessionMarker,
} from "../api/AxiosApi";
import AnswerView from "../components/rag/AnswerView";

const Page = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 40px 20px 72px;
  color: var(--momo-text);
  h1 {
    margin: 0 0 8px;
    font-size: 26px;
  }
  h2 {
    font-size: 22px;
  }
  h3 {
    font-size: 17px;
  }
  .subtitle {
    margin: 0 0 10px;
    font-size: 15px;
    color: var(--momo-text);
    line-height: 1.6;
  }
  #ai-data-notice {
    margin: 0;
    font-size: 13px;
    color: var(--momo-muted);
    line-height: 1.5;
  }
  form {
    display: grid;
    gap: 12px;
    margin: 28px 0;
  }
  label {
    font-weight: 600;
    font-size: 14px;
  }
  textarea,
  select {
    background: var(--momo-note);
    color: var(--momo-text);
    border: 1px solid var(--momo-border);
    border-radius: 4px;
    padding: 12px;
    font: inherit;
    font-size: 14px;
  }
  textarea {
    resize: vertical;
    min-height: 120px;
  }
  small {
    font-size: 12px;
    color: var(--momo-muted);
  }
  button {
    justify-self: start;
    background: var(--momo-primary);
    color: var(--momo-on-primary);
    border: 0;
    border-radius: 4px;
    padding: 10px 18px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.6;
    cursor: default;
  }
  :is(button, textarea, select):focus-visible {
    outline: 2px solid var(--momo-accent-ink);
    outline-offset: 3px;
  }
  [role="alert"] {
    font-size: 14px;
    color: var(--momo-error);
  }
  [role="status"],
  .guide-text {
    font-size: 14px;
    color: var(--momo-muted);
  }
`;

// 질문과 요청 상태를 관리하고, 답변·출처 표시는 AnswerView에 위임한다.
export default function AiAssistant() {
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState("ALL");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(() =>
    Boolean(
      localStorage.getItem("accessToken") ||
      localStorage.getItem("refreshToken"),
    ),
  );
  const pending = useRef(false);
  const request = useRef(null);
  const generation = useRef(0);

  useEffect(() => {
    // 로그인 계정이 바뀌면 진행 중 요청을 취소하고 이전 회원의 질문·답변을 지운다.
    const reset = () => {
      generation.current += 1;
      request.current?.abort();
      pending.current = false;
      setLoading(false);
      setResult(null);
      setError("");
      setQuestion("");
      setAuthenticated(
        Boolean(
          localStorage.getItem("accessToken") ||
          localStorage.getItem("refreshToken"),
        ),
      );
    };
    const storageChanged = (event) => {
      if (
        !event.key ||
        ["accessToken", "refreshToken", "momo-auth-session-id"].includes(
          event.key,
        )
      )
        reset();
    };
    window.addEventListener("momo-auth-changed", reset);
    window.addEventListener("storage", storageChanged);
    return () => {
      generation.current += 1;
      request.current?.abort();
      window.removeEventListener("momo-auth-changed", reset);
      window.removeEventListener("storage", storageChanged);
    };
  }, []);

  const ask = async (event) => {
    event.preventDefault();
    // 상태 갱신 전 연속 제출도 ref로 차단하고, 요청 세대와 세션이 같은 응답만 반영한다.
    if (pending.current || !question.trim() || question.trim().length > 500)
      return;
    const session = getAuthSessionVersion();
    const marker = getAuthSessionMarker();
    const currentGeneration = ++generation.current;
    const controller = new AbortController();
    request.current = controller;
    const current = () =>
      !controller.signal.aborted &&
      generation.current === currentGeneration &&
      isAuthSessionCurrent(session) &&
      getAuthSessionMarker() === marker;
    pending.current = true;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await AxiosApi.ragQuery(
        question.trim(),
        scope,
        controller.signal,
      );
      if (current())
        setResult({ question: question.trim(), response: response.data });
    } catch (failure) {
      if (!current() || failure.code === "MOMO_AUTH_SESSION_CHANGED") return;
      const status = failure.response?.status;
      setError(
        status === 429
          ? "요청 한도에 도달했습니다. 잠시 후 또는 다음 날 다시 질문해 주세요."
          : status === 503 || status === 502 || status === 504
            ? "외부 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요."
            : status === 401
              ? "로그인이 필요합니다. 다시 로그인해 주세요."
              : "질문을 처리하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.",
      );
    } finally {
      if (current()) {
        pending.current = false;
        setLoading(false);
      }
    }
  };

  if (!authenticated) return <Navigate to="/login" replace />;

  return (
    <Page>
      <h1>조감독 AI</h1>
      <p className="subtitle">
        MOMO에 쌓인 영화 리뷰를 꼼꼼히 찾아 근거와 함께 답변해 드립니다. AI
        답변은 출처 리뷰와 꼭 함께 확인해 주세요.
      </p>
      <p id="ai-data-notice">
        ※ 원활한 검색을 위해 질문과 관련 리뷰는 외부 AI(OpenAI)로 전송될 수
        있으며, 리뷰는 검색용 MongoDB Atlas에 저장됩니다. 개인정보나 민감한
        정보는 입력하지 마세요.
      </p>
      <form
        onSubmit={ask}
        aria-describedby="ai-data-notice"
        aria-busy={loading}
      >
        <label htmlFor="rag-question">무엇이 궁금하신가요?</label>
        <textarea
          id="rag-question"
          value={question}
          maxLength={500}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={loading}
          placeholder="예: 결말의 여운을 다룬 리뷰를 찾아주세요."
        />
        <small>{question.length}/500자</small>
        <label htmlFor="rag-scope">검색 범위</label>
        <select
          id="rag-scope"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          disabled={loading}
        >
          <option value="ALL">전체 리뷰</option>
          <option value="MINE">내 리뷰</option>
        </select>
        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? "리뷰 근거를 찾고 있습니다…" : "조감독 AI에게 물어보기"}
        </button>
      </form>
      {loading && (
        <p role="status">리뷰 검색과 근거 확인 후 답변을 작성하고 있습니다.</p>
      )}
      {error && <p role="alert">{error}</p>}
      {result ? (
        <AnswerView question={result.question} result={result.response} />
      ) : (
        !loading &&
        !error && (
          <p className="guide-text">
            질문을 입력하시면 리뷰 기반 답변과 출처, 실행 경로를 한눈에 정리해
            드립니다.
          </p>
        )
      )}
    </Page>
  );
}
