import { createGlobalStyle } from "styled-components";

// 기존 className과 선택자를 그대로 유지하는 호환 스타일 모듈입니다.
const ReviewDetailAndRatingStyles = createGlobalStyle`
/* ========================================
   MOMO 리뷰 상세 페이지 (.review-detail-page)
======================================== */

.review-detail-page {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 12px 0 88px;
  color: var(--momo-text);
}

/* 상단 이동 버튼 */
.review-detail-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 22px;
  background: var(--momo-surface);
  border: 1px solid var(--momo-border);
  border-radius: 8px;
  color: var(--momo-text);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-detail-back:hover {
  background: var(--momo-note);
  border-color: var(--momo-accent-ink);
}

/* 리뷰 본문 카드 */
.review-detail-card {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 3vw, 40px);
  background: linear-gradient(145deg, var(--momo-surface), var(--momo-surface-raised));
  border: 1px solid var(--momo-border);
  border-radius: var(--momo-radius-lg);
  box-shadow: var(--momo-shadow-sm);
}

.review-detail-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 30px;
  right: 30px;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--momo-accent),
    transparent
  );
}

/* 리뷰 상단 정보 */
.review-detail-eyebrow {
  margin: 0 0 12px;
  color: var(--momo-accent-ink);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.review-detail-title {
  margin: 0 0 22px;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.review-detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--momo-border);
  color: var(--momo-muted);
  font-size: 12px;
}

.review-detail-meta strong {
  color: var(--momo-text);
  font-size: 13px;
}

/* 영화 정보 */
.review-detail-movie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 24px 0;
  padding: 22px 24px;
  background: linear-gradient(135deg, var(--momo-note), #FFFDF6);
  border: 1px solid var(--momo-note-border);
  border-radius: 18px;
}

.review-detail-movie-info {
  min-width: 0;
}

.review-detail-movie-label {
  display: block;
  margin-bottom: 6px;
  color: var(--momo-muted);
  font-size: 11px;
  font-weight: 700;
}

.review-detail-movie strong {
  display: block;
  overflow-wrap: anywhere;
  font-size: 16px;
  font-weight: 800;
}

.review-detail-movie-code {
  flex-shrink: 0;
  color: var(--momo-muted);
  font-size: 11px;
}

/* 작성자 영화 평가 */
.review-detail-reaction {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  margin-bottom: 24px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
}

.review-detail-reaction.like {
  background: var(--momo-like-bg);
  border: 1px solid var(--momo-like-border);
  color: var(--momo-like-text);
}

.review-detail-reaction.dislike {
  background: var(--momo-dislike-bg);
  border: 1px solid var(--momo-dislike-border);
  color: var(--momo-dislike-text);
}

/* 리뷰 내용 */
.review-detail-content {
  min-height: 180px;
  padding: 28px;
  margin: 0;
  background: linear-gradient(140deg, rgba(255,255,255,.64), rgba(242,247,243,.34));
  border: 1px solid rgba(255,255,255,.88);
  border-radius: 14px;
  color: var(--momo-text);
  font-size: 15px;
  line-height: 2.05;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* 수정 일자 */
.review-detail-updated {
  margin: 16px 0 0;
  color: var(--momo-muted);
  font-size: 11px;
  text-align: right;
}

/* 로딩 및 오류 */
.review-detail-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding: 30px;
  background: var(--momo-surface);
  border: 1px dashed var(--momo-border);
  border-radius: var(--momo-radius);
  color: var(--momo-muted);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.review-detail-error {
  color: var(--momo-danger);
}

/* 모바일 */
@media (max-width: 600px) {
  .review-detail-page {
    padding: 20px 0 50px;
  }

  .review-detail-card {
    padding: 28px 18px;
  }

  .review-detail-card::before {
    left: 18px;
    right: 18px;
  }

  .review-detail-meta {
    gap: 8px 12px;
  }

  .review-detail-movie {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px;
  }

  .review-detail-content {
    min-height: 150px;
    padding: 20px 16px;
    font-size: 14px;
  }
}

/* ========================================
   관객 평점 - MOMO 가로형 카드
======================================== */

.movie-rating-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
  padding: 20px;
  background: linear-gradient(140deg, rgba(255,255,255,.68), rgba(241,247,242,.38));
  border: 1px solid rgba(255,255,255,.88);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(34,42,37,.055), inset 0 1px rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(22px) saturate(155%);
  backdrop-filter: blur(22px) saturate(155%);
}

.rating-label {
  color: var(--momo-text);
  font-size: 15px;
  font-weight: 800;
}

.detail-reaction-counts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}

.detail-reaction-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 110px;
  padding: 18px;
  background: var(--momo-surface);
  border: 1px solid var(--momo-border);
  border-radius: 10px;
  color: var(--momo-text);
  font: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-reaction-count:first-child {
  background: var(--momo-like-bg);
  border-color: var(--momo-like-border);
  color: var(--momo-like-text);
}

.detail-reaction-count:last-child {
  background: var(--momo-dislike-bg);
  border-color: var(--momo-dislike-border);
  color: var(--momo-dislike-text);
}

.detail-reaction-count span {
  font-size: 14px;
  font-weight: 700;
}

.detail-reaction-count strong {
  font-size: 28px;
  font-weight: 900;
}

.detail-reaction-count:hover {
  transform: none;
  box-shadow: var(--momo-shadow);
}

.detail-reaction-count.selected-like {
  background: var(--momo-like-bg-hover);
  border: 2px solid var(--momo-like-border);
  color: var(--momo-like-text);
}

.detail-reaction-count.selected-dislike {
  background: var(--momo-dislike-bg-hover);
  border: 2px solid var(--momo-dislike-border);
  color: var(--momo-dislike-text);
}

.detail-total-count {
  margin: 0;
  padding-top: 12px;
  border-top: 1px solid var(--momo-note-border);
  color: var(--momo-muted);
  font-size: 12px;
  text-align: right;
}

.detail-total-count strong {
  color: var(--momo-text);
  font-weight: 800;
}

@media (max-width: 600px) {
  .detail-reaction-count {
    min-height: 95px;
    padding: 12px;
  }

  .detail-reaction-count strong {
    font-size: 24px;
  }
}



/* Product refinement: the reader's note is the visual focus. */
.review-detail-page { max-width: 920px; padding-top: 6px; }
.review-detail-card {
  padding: clamp(22px, 3vw, 36px);
  border-radius: 16px;
  box-shadow: var(--momo-shadow-xs);
}
.review-detail-card::before { left: 0; right: auto; width: 48px; height: 4px; background: var(--momo-accent); }
.review-detail-title { font-size: clamp(25px, 3.4vw, 35px); line-height: 1.3; }
.review-detail-movie { padding: 17px 19px; border-radius: 12px; }
.review-detail-content {
  min-height: 160px;
  padding: clamp(20px, 2.5vw, 28px);
  background: #FFFAEC;
  border-color: #E9DFC5;
  border-radius: 9px;
  font-size: 15px;
  line-height: 1.9;
}
.movie-rating-panel { padding: 18px; border-radius: 12px; }
.detail-reaction-count { min-height: 96px; border-radius: 9px; box-shadow: none; }
.detail-reaction-count:hover { box-shadow: var(--momo-shadow-sm); }
@media (max-width: 600px) {
  .review-detail-card { padding: 23px 17px; }
  .review-detail-title { font-size: 25px; }
}

`;

export default ReviewDetailAndRatingStyles;
