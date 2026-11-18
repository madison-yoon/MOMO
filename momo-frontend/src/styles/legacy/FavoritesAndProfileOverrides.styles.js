import { createGlobalStyle } from "styled-components";

// 기존 className과 선택자를 그대로 유지하는 호환 스타일 모듈입니다.
const FavoritesAndProfileOverridesStyles = createGlobalStyle`
/* ========================================
   관심 영화 슬레이트 버튼
======================================== */

.favorite-star {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
  width: 42px;
  height: 42px;
  padding: 0;

  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;

  background: rgba(30, 30, 30, 0.38);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(6px);

  color: rgba(255, 255, 255, 0.9);

  font-family: "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
  font-size: 19px;
  font-weight: normal;
  line-height: 1;
  padding-bottom: 2.3px;


  text-align: center;
  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.favorite-star:hover {
  background: rgba(30, 30, 30, 0.7);
  transform: none;
}

.favorite-star.is-active {
  background: rgba(255, 212, 59, 0.25);
  border-color: rgba(255, 212, 59, 0.7);
  color: var(--momo-accent);
}

/* ========================================
   홈 관심 영화 전체 보기
======================================== */

.home-favorites-more {
  padding: 8px 12px;
  border: 1px solid var(--momo-border);
  border-radius: 8px;
  background: var(--momo-surface);
  color: var(--momo-text-soft);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.home-favorites-more:hover {
  border-color: var(--momo-accent);
  background: var(--momo-note-strong);
}

.home-favorites-empty {
  padding: 32px 20px;
  border: 1px dashed var(--momo-border);
  border-radius: 16px;
  background: var(--momo-surface);
  color: var(--momo-muted);
  font-size: 13px;
  text-align: center;
}

/* ========================================
   마이페이지 관심 영화 링크
======================================== */

.profile-favorites-link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.profile-favorites-link:hover {
  border-color: var(--momo-accent);
  background: var(--momo-surface-raised);
}

.profile-favorites-count {
  flex-shrink: 0;
  color: var(--momo-link);
  font-size: 12px;
  font-weight: 800;
}

/* ========================================
   관심 영화 목록 페이지
======================================== */

.favorite-page {
  min-height: 100vh;
  padding: 12px 0 64px;
  background: transparent;
}

.favorite-page-container {
  max-width: 1360px;
  margin: 0 auto;
}

.favorite-page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 30px 34px;
  margin-bottom: 28px;
  background: linear-gradient(120deg, var(--momo-note), rgba(255,255,255,.88));
  border: 1px solid var(--momo-note-border);
  border-radius: var(--momo-radius-lg);
  box-shadow: var(--momo-shadow-sm);
}

.favorite-page-heading > div {
  min-width: 0;
}

.favorite-page-heading .eyebrow {
  display: block;
  margin-bottom: 8px;
  color: var(--momo-link);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.favorite-page-heading h1 {
  margin: 0 0 8px;
  color: var(--momo-text);
  font-size: clamp(26px, 4vw, 34px);
  font-weight: 800;
}

.favorite-page-heading p,
.favorite-list-toolbar p {
  margin: 0;
  color: var(--momo-muted);
  font-size: 13px;
}

.favorite-back-button {
  flex-shrink: 0;
  padding: 10px 16px;
  border: 1px solid var(--momo-border);
  border-radius: 8px;
  background: var(--momo-surface);
  color: var(--momo-text-soft);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.favorite-list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  margin-bottom: 22px;
  border-top: 1px solid var(--momo-border);
  border-bottom: 1px solid var(--momo-border);
}

.favorite-list-toolbar strong {
  color: var(--momo-text);
  font-size: 15px;
}

.favorite-list-toolbar strong span {
  margin-left: 6px;
  color: var(--momo-link);
}

.favorite-page-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 22px 18px;
}

.favorite-page-card {
  position: relative;
  min-width: 0;
  padding: 10px;
  background: var(--momo-surface);
  border: 1px solid var(--momo-border);
  border-radius: 18px;
  box-shadow: var(--momo-shadow-xs);
  transition: transform .2s ease, box-shadow .2s ease;

  &:hover {
    transform: none;
    box-shadow: var(--momo-shadow-sm);
  }
}

.favorite-page-poster {
  display: block;
  width: 100%;
  padding: 0;
  aspect-ratio: 2 / 2.85;
  overflow: hidden;
  border: 1px solid var(--momo-border);
  border-radius: 10px;
  background: var(--momo-note);
  cursor: pointer;
}

/* 포스터 카드 안의 버튼이 카드 전체 높이를 차지하도록 고정한다. */
.favorite-page-poster > .favorite-page-open-button {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.favorite-page-poster > .favorite-page-open-button:focus-visible {
  outline: 3px solid var(--momo-link);
  outline-offset: -3px;
}

.favorite-page-poster img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.favorite-page-poster [role="img"] {
  width: 100%;
  height: 100%;
}

.favorite-page-poster:hover img {
  transform: none;
  filter: saturate(1.04);
}

.favorite-page-no-poster {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--momo-muted);
  font-size: 12px;
}

.favorite-page-movie-info {
  padding-top: 12px;
}

.favorite-page-movie-info h3 {
  margin: 0;
  overflow: hidden;
  color: var(--momo-text);
  font-size: 15px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-page-movie-info p {
  margin: 6px 0 0;
  color: var(--momo-muted);
  font-size: 12px;
}

.favorite-page-empty {
  padding: 64px 20px;
  border: 1px dashed var(--momo-border);
  border-radius: 12px;
  background: var(--momo-surface);
  text-align: center;
}

.favorite-empty-symbol {
  margin-bottom: 12px;
  color: var(--momo-link);
  font-size: 42px;
}

.favorite-page-empty h2 {
  margin: 0 0 10px;
  font-size: 20px;
}

.favorite-page-empty p {
  margin: 0 0 20px;
  color: var(--momo-muted);
  font-size: 13px;
}

.favorite-page-empty button {
  padding: 11px 18px;
  border: 1px solid var(--momo-border);
  border-radius: 8px;
  background: var(--momo-accent);
  color: var(--momo-accent-ink);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

/* ========================================
   반응형
======================================== */

@media (max-width: 900px) {
  .favorite-page-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .favorite-page-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px 12px;
  }

  .favorite-page-heading,
  .favorite-list-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 430px) {
  .favorite-page-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* 관심 영화 페이지 버튼 */

.favorite-back-button,
.favorite-browse-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-back-button {
  color: var(--momo-text-soft);
  background: var(--momo-surface);
  border: 1px solid var(--momo-border);
}

.favorite-back-button:hover {
  background: var(--momo-bg);
  border-color: var(--momo-border-strong);
}

.favorite-browse-button {
  color: var(--momo-surface);
  background: var(--momo-text-soft);
  border: 1px solid var(--momo-text-soft);
}

.favorite-browse-button:hover {
  background: var(--momo-text-soft);
  border-color: var(--momo-text-soft);
  transform: none;
  box-shadow: 0 4px 12px rgba(50, 40, 30, 0.12);
}

/* ========================================
   MOMO 대형 관객 평점
======================================== */

/* MOMO 관객 평점 */

.movie-score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 220px;
  box-sizing: border-box;

  padding: 30px 20px;
  margin: 20px 0;

  background: var(--momo-bg);
  border: 1px solid var(--momo-border);
  border-radius: 16px;
}

.movie-score-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--momo-muted);
  margin-bottom: 12px;
}

.movie-score-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.movie-score-value strong {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: var(--momo-link);
}

.movie-score-value span {
  font-size: 22px;
  color: var(--momo-muted);
}

.movie-score-display p {
  margin: 12px 0 0;
  font-size: 14px;
  color: var(--momo-muted);
}

/* =========================
   마이페이지 및 프로필 수정 스타일 정돈
========================= */

/* 1. 마이페이지 프로필 아바타를 동그랗게 정돈 */
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--momo-border);
  flex-shrink: 0;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 2. 마이페이지 배경에 들어가는 거대한 슬레이트/클라퍼 아이콘 크기 제한 */
.profile-page::before,
.profile-page .profile-bg,
.profile-page img {
  max-width: 100%;
  max-height: 250px;
  object-fit: contain;
}

/* 3. 프로필 수정 페이지의 아바타 미리보기 영역을 원형으로 고정 */
.profile-image-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--momo-note);
  margin: 0 auto 16px auto;
}

.profile-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-image-preview span {
  font-size: 2rem;
  font-weight: bold;
  color: var(--momo-muted);
}

.profile-image-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.profile-image-input-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}



/* Favorites: let the poster be the main surface, not another nested card. */
.favorite-page-container { max-width: 1280px; }
.favorite-page-heading {
  padding: 24px 28px;
  margin-bottom: 20px;
  background: #FFF9E9;
  border-radius: 15px;
  box-shadow: none;
}
.favorite-page-heading h1 { font-size: clamp(26px, 3vw, 34px); letter-spacing: -.04em; }
.favorite-page-grid { gap: 24px 18px; }
.favorite-page-card {
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  box-shadow: none;
}
.favorite-page-card:hover { transform: none; box-shadow: none; }
.favorite-page-poster { border-radius: 10px; box-shadow: var(--momo-shadow-xs); }
.favorite-page-movie-info { padding: 10px 2px 0; }
.favorite-page-movie-info h3 { font-size: 14px; }
.home-favorites-empty { border-radius: 10px; background: rgba(255,254,250,.65); }
@media (max-width: 600px) {
  .favorite-page-heading { padding: 20px 17px; }
  .favorite-page-grid { gap: 18px 12px; }
}

`;

export default FavoritesAndProfileOverridesStyles;
