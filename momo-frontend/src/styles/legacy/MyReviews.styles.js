import { createGlobalStyle } from "styled-components";

// 기존 className과 선택자를 그대로 유지하는 호환 스타일 모듈입니다.
const MyReviewsStyles = createGlobalStyle`
/* ==================================================
   MY REVIEWS
   마이페이지 작성 리뷰 모아보기
================================================== */

.my-reviews-page {
  width: calc(100% - 40px);
  max-width: 1320px;

  margin: 0 auto;
  padding: 30px 0 80px;
}

.my-reviews-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  padding: 36px;
  margin-bottom: 30px;

  background: var(--momo-surface);
  border: 1px solid var(--momo-border);
  border-radius: 14px;
}

.my-reviews-eyebrow {
  margin: 0 0 10px;

  color: var(--momo-muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

.my-reviews-heading h1 {
  margin: 0 0 10px;

  color: var(--momo-text);
  font-size: 30px;
  font-weight: 800;
}

.my-reviews-heading p {
  margin: 0;

  color: var(--momo-muted);
  font-size: 14px;
}

.my-reviews-heading > a {
  color: var(--momo-muted);
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

.my-reviews-heading > a:hover {
  text-decoration: underline;
}

.my-reviews-card {
  padding: 30px;

  background: var(--momo-surface);
  border: 1px solid var(--momo-border);
  border-radius: 14px;
}

.my-reviews-card-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  margin-bottom: 24px;
  padding-bottom: 18px;

  border-bottom: 1px solid #e8e3dc;
}

.my-reviews-card-heading h2 {
  margin: 0 0 8px;

  color: var(--momo-text);
  font-size: 20px;
  font-weight: 800;
}

.my-reviews-card-heading p {
  margin: 0;

  color: var(--momo-muted);
  font-size: 13px;
}

.my-reviews-card-heading > span {
  padding: 7px 12px;

  background: var(--momo-surface);
  border: 1px solid var(--momo-border);
  border-radius: 8px;

  color: var(--momo-muted);
  font-size: 12px;
  font-weight: 800;
}

/* 리뷰 리스트 */

.my-reviews-list {
  display: flex;
  flex-direction: column;
}

.my-review-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  padding: 22px 12px;

  border-bottom: 1px solid #e8e3dc;

  color: var(--momo-text);
  text-decoration: none;

  transition: background 0.15s ease;
}

.my-review-item:hover {
  background: var(--momo-surface);
}

.my-review-info {
  flex: 1;
  min-width: 0;
}

.my-review-movie {
  color: var(--momo-muted);
  font-size: 12px;
  font-weight: 800;
}

.my-review-info h3 {
  margin: 8px 0;

  color: var(--momo-text);
  font-size: 18px;
  font-weight: 800;
}

.my-review-info p {
  margin: 0 0 10px;

  color: var(--momo-muted);
  font-size: 14px;
  line-height: 1.6;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-review-date {
  color: var(--momo-muted);
  font-size: 12px;
}

.my-review-arrow {
  color: var(--momo-muted);
  font-size: 22px;
}

/* 리뷰 목록 상태 */

.my-reviews-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  min-height: 200px;

  color: var(--momo-muted);
  text-align: center;
}

.my-reviews-state a {
  color: var(--momo-muted);
  font-weight: 800;
  text-decoration: none;
}

.my-reviews-state.error {
  color: var(--momo-muted);
}

/* 페이지네이션 */

.my-reviews-pagination {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 28px;
}

.my-reviews-pagination button {
  min-width: 38px;
  height: 38px;

  padding: 0 12px;

  background: var(--momo-surface);
  border: 1px solid var(--momo-border);
  border-radius: 8px;

  color: var(--momo-muted);
  font-weight: 700;

  cursor: pointer;
}

.my-reviews-pagination button.active {
  background: var(--momo-surface);
  border-color: var(--momo-border);
  color: var(--momo-text);
}

.my-reviews-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 마이페이지 작성 리뷰 카드 링크 */

.profile-reviews-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.profile-reviews-link:hover {
  background: var(--momo-surface);
}

.profile-reviews-count {
  color: var(--momo-muted);
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

/* ==================================================
   ALL REVIEWS CLICKABLE ROW
================================================== */

.review-clickable-row {
  cursor: pointer;
}

.review-clickable-row:hover {
  background: var(--momo-surface);
}

.all-reviews-mobile-item {
  cursor: pointer;
}

.all-reviews-mobile-item:hover {
  background: var(--momo-surface);
}

`;

export default MyReviewsStyles;
