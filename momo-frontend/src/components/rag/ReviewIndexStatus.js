import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import AxiosApi, { getAuthSessionMarker } from "../../api/AxiosApi";

const Status = styled.section`
  margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--momo-border); color: var(--momo-muted); font-size: 14px;
  p { margin: 8px 0; overflow-wrap: anywhere; }
  button { background: var(--momo-surface); color: var(--momo-text); border: 1px solid var(--momo-border); border-radius: 4px; padding: 6px 12px; cursor: pointer; }
  [role="alert"] { color: var(--momo-error); }
`;
const LABEL = { INDEXING: "검색 준비 중", READY: "검색 가능", FAILED: "검색 준비 실패" };
// 공개 색인 상태와 운영자 전용 조작을 함께 표시하되 권한은 서버의 boolean 응답으로 판단한다.
export default function ReviewIndexStatus({ review, reviewId, onReindexed }) {
  const [canReindex, setCanReindex] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [indexError, setIndexError] = useState("");
  const pending = useRef(false);
  const request = useRef(null);
  useEffect(() => {
    // 계정·리뷰 변경 뒤 도착한 권한 및 오류 응답을 버려 이전 운영자 정보가 남지 않게 한다.
    const controller = new AbortController(); request.current = controller;
    setCanReindex(false); setMessage(""); setIndexError(""); setBusy(false); pending.current = false;
    const revoke = () => { controller.abort(); setCanReindex(false); setBusy(false); setMessage(""); setIndexError(""); };
    if (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken")) {
      const marker = getAuthSessionMarker();
      AxiosApi.ragCapabilities(controller.signal).then(async response => {
        if (controller.signal.aborted || getAuthSessionMarker() !== marker) return;
        const allowed = response.data.canReindex === true;
        setCanReindex(allowed);
        if (allowed && review.indexStatus === "FAILED") {
          const status = await AxiosApi.ragIndexStatus(reviewId, controller.signal);
          if (!controller.signal.aborted && getAuthSessionMarker() === marker) setIndexError(status?.data?.indexError || "");
        }
      }).catch(() => {});
    }
    window.addEventListener("momo-auth-changed", revoke); window.addEventListener("storage", revoke);
    return () => { controller.abort(); window.removeEventListener("momo-auth-changed", revoke); window.removeEventListener("storage", revoke); };
  }, [reviewId, review.indexStatus, review.indexedAt]);
  const reindex = async () => {
    // 연속 클릭을 즉시 차단하며, 재색인 완료 후에도 같은 세션에서만 리뷰를 갱신한다.
    if (!canReindex || pending.current || request.current.signal.aborted) return;
    const controller = request.current; const marker = getAuthSessionMarker();
    pending.current = true; setBusy(true); setMessage("");
    try {
      const response = await AxiosApi.ragReindex(reviewId, controller.signal);
      if (!controller.signal.aborted && getAuthSessionMarker() === marker) {
        await onReindexed();
        if (!controller.signal.aborted && getAuthSessionMarker() === marker) setMessage(response.data.result === "FAILED" ? "재색인에 실패했습니다. 색인 상태를 확인해 주세요." : "재색인 처리가 끝났습니다. 현재 색인 상태를 확인해 주세요.");
      }
    } catch (failure) {
      if (!controller.signal.aborted && getAuthSessionMarker() === marker) { if (failure.response?.status === 403) setCanReindex(false); setMessage("재색인하지 못했습니다. 운영 권한과 AI 서비스 상태를 확인해 주세요."); }
    } finally { if (!controller.signal.aborted && getAuthSessionMarker() === marker) { pending.current = false; setBusy(false); } }
  };
  return <Status aria-label="AI 검색 색인 상태">
    <p>AI 색인 · {review.indexStatus ? `${review.indexStatus} (${LABEL[review.indexStatus] || "상태 확인 필요"})` : "상태 정보 없음"}</p>
    {review.indexedAt && <p>최근 색인 · {new Date(review.indexedAt).toLocaleString("ko-KR")}</p>}
    {canReindex && <button type="button" onClick={reindex} disabled={busy}>{busy ? "재색인 중…" : "AI 재색인"}</button>}
    {canReindex && indexError && <p>운영자용 색인 오류 · {indexError}</p>}
    {message && <p role="status">{message}</p>}
  </Status>;
}
