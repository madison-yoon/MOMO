import { createGlobalStyle, css } from "styled-components";
import { homeRedesignTheme } from "./HomeTheme.styles";
import { cinemaCharcoalTokens } from "./CinemaCharcoal.tokens";

// 페이지별 배치 선택은 유지하며 색상은 Cinema Charcoal 공통 토큰을 사용한다.
export function archivePageForPath(path) {
  if (path === "/search") return "search";
  if (/^\/movie\/[^/]+$/.test(path)) return "movie";
  if (path === "/reviews" || /^\/reviews\/movie\/[^/]+$/.test(path)) return "reviews";
  if (/^\/reviews\/[^/]+$/.test(path)) return "review";
  return { "/profile/reviews": "my-reviews", "/profile/liked-reviews": "liked-reviews", "/profile/favorites": "favorites", "/profile/delete": "delete", "/profile": "profile", "/profile/edit": "edit", "/login": "login", "/signup": "signup" }[path] || null;
}

// 홈의 실제 디자인 토큰과 헤더를 재사용하되 승인 시안의 본문 폭 1000px을 적용한다.
export const archivePageTheme = css`
  ${homeRedesignTheme}
  --momo-content-width: 1000px;
  --home-main-padding: 48px 0 64px;
  --home-footer-padding: 28px max(32px, calc((100% - 1000px) / 2));
`;

// 페이지 루트 속성 아래에서만 기존 호환 스타일과 메모지 장식을 조정해 다른 화면에 전파하지 않는다.
const ArchivePagesStyles = createGlobalStyle`
  [data-archive-page][data-archive-page] {
    ${cinemaCharcoalTokens}
    --momo-radius: 12px;
    width: 100%; max-width: 1000px; margin: 0 auto; padding: 0;
    color: var(--momo-text); box-sizing: border-box;
  }
  [data-archive-page] *, [data-archive-page] *::before, [data-archive-page] *::after { box-sizing: border-box; }
  [data-archive-page] h1 { font-size: 30px; line-height: 1.45; letter-spacing: -.025em; font-weight: 700; }
  [data-archive-page] h2 { font-size: 22px; line-height: 1.5; letter-spacing: -.02em; }
  [data-archive-page] h3 { line-height: 1.6; }
  [data-archive-page] p { line-height: 1.8; }
  [data-archive-page] input:not([type=file]):not([type=checkbox]), [data-archive-page] textarea, [data-archive-page] select {
    max-width: 100%; border: 1px solid var(--momo-border); border-radius: 8px; color: var(--momo-text);
    background: var(--momo-note); padding: 12px 14px; font: inherit; font-size: 14px;
  }
  [data-archive-page] input[readonly] { background: var(--momo-note); color: var(--momo-muted); }
  [data-archive-page] button { font: inherit; cursor: pointer; }
  [data-archive-page] button:disabled { cursor: default; opacity: .5; }
  [data-archive-page] button:focus-visible, [data-archive-page] a:focus-visible,
  [data-archive-page] input:focus-visible, [data-archive-page] textarea:focus-visible, [data-archive-page] select:focus-visible {
    outline: 3px solid var(--momo-text); outline-offset: 3px; box-shadow: none;
  }
  [data-archive-page] .archive-heading { margin-bottom: 30px; }
  [data-archive-page] .archive-heading h1 { margin: 0 0 8px; }
  [data-archive-page] .archive-heading p { margin: 0; color: var(--momo-muted); font-size: 14px; }
  [data-archive-page="search"] .archive-search-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 30px 25px; margin-top: 28px; }
  [data-archive-page="search"] [role=button] { animation: none; }
  [data-archive-page="search"] .archive-search-poster { aspect-ratio: 2 / 3; border-radius: 8px; border: 0; box-shadow: none; }
  [data-archive-page="search"] h3 { color: var(--momo-text); font-size: 15px; }

  [data-archive-page="reviews"] .all-reviews-heading { margin: 0 0 28px; padding: 0; background: none; border: 0; box-shadow: none; }
  [data-archive-page="reviews"] .all-reviews-eyebrow { display: none; }
  [data-archive-page="reviews"] .all-reviews-title { margin: 0 0 8px; }
  [data-archive-page="reviews"] .all-reviews-description { color: var(--momo-muted); margin: 0; }
  [data-archive-page="reviews"] .all-reviews-card { padding: 0; border: 0; background: none; box-shadow: none; }
  [data-archive-page="reviews"] .all-reviews-card-heading { display: flex; justify-content: space-between; padding: 0; margin-bottom: 18px; background: none; border: 0; }
  [data-archive-page="reviews"] .all-reviews-card-heading h2 { font-size: 18px; }
  [data-archive-page="reviews"] .all-reviews-search { display: flex; gap: 12px; align-items: center; padding: 16px; margin-bottom: 26px; background: var(--momo-surface); border: 1px solid var(--momo-border); border-radius: 10px; }
  [data-archive-page="reviews"] .all-reviews-search-input { flex: 1; min-width: 0; }
  [data-archive-page="reviews"] .all-reviews-search-select { width: 140px; }
  [data-archive-page="reviews"] .all-reviews-search button { min-height: 44px; padding: 10px 18px; border: 0; border-radius: 7px; background: var(--momo-primary); color: var(--momo-text); }
  [data-archive-page="reviews"] .all-reviews-search .all-reviews-search-reset { background: var(--momo-note); color: var(--momo-muted); }
  [data-archive-page="reviews"] .archive-review-list { display: grid; gap: 12px; }
  [data-archive-page="reviews"] .archive-review-row { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 20px; align-items: center; padding: 18px; border: 1px solid var(--momo-border); border-radius: 10px; background: var(--momo-surface); }
  [data-archive-page="reviews"] .archive-review-row:hover { border-color: var(--momo-accent); }
  [data-archive-page="reviews"] .all-review-poster { width: 64px; height: 90px; margin: 0; border-radius: 6px; overflow: hidden; background: var(--momo-note); }
  [data-archive-page="reviews"] .all-review-poster img { width: 100%; height: 100%; object-fit: cover; }
  [data-archive-page="reviews"] .all-review-poster-placeholder { display: grid; place-items: center; width: 100%; height: 100%; color: var(--momo-muted); font-size: 11px; }
  [data-archive-page="reviews"] .archive-review-movie { margin: 0 0 6px; color: var(--momo-muted); font-size: 13px; }
  [data-archive-page="reviews"] .review-title-link { display: inline-block; color: var(--momo-text); font-size: 18px; font-weight: 700; text-decoration: none; }
  [data-archive-page="reviews"] .review-title-link:hover { color: var(--momo-text); text-decoration: underline; }
  [data-archive-page="reviews"] .archive-review-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 10px; color: var(--momo-muted); font-size: 12px; }
  [data-archive-page="reviews"] .all-reviews-pagination { margin-top: 24px; }
  [data-archive-page="reviews"] .all-reviews-pagination .active { background: var(--momo-primary); color: var(--momo-text); border-color: var(--momo-border); }

  [data-archive-page="movie"] .movie-detail-header { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 38px; padding: 0; border: 0; background: none; box-shadow: none; margin-bottom: 32px; }
  [data-archive-page="movie"] .movie-detail-poster { position: relative; width: 260px; height: 390px; margin: 0; border-radius: 9px; overflow: hidden; background: var(--momo-surface); }
  [data-archive-page="movie"] .movie-detail-poster img { width: 100%; height: 100%; object-fit: contain; }
  [data-archive-page="movie"] .movie-detail-poster-placeholder { display: grid; place-items: center; height: 100%; color: var(--momo-muted); }
  [data-archive-page="movie"] .movie-detail-info { padding: 18px 0; align-self: center; }
  [data-archive-page="movie"] .movie-detail-info h1 { margin: 10px 0 22px; font-size: 34px; }
  [data-archive-page="movie"] .movie-detail-info p { color: var(--momo-muted); font-size: 14px; margin: 10px 0; }
  [data-archive-page="movie"] .detail-rank { color: var(--momo-muted); background: none; padding: 0; }
  [data-archive-page="movie"] .detail-content-section { padding: 28px 30px; margin-bottom: 24px; background: var(--momo-surface); border: 1px solid var(--momo-border); border-radius: 12px; }
  [data-archive-page="movie"] .detail-content-section > h2 { margin: 0 0 18px; }
  [data-archive-page="movie"] .detail-content-section > p { font-size: 15px; color: var(--momo-muted); line-height: 1.9; }
  [data-archive-page="movie"] .people-list { display: flex; gap: 16px; flex-wrap: wrap; }
  [data-archive-page="movie"] .person-chip { display: flex; align-items: center; gap: 14px; padding: 10px 14px; border: 1px solid var(--momo-border); border-radius: 8px; background: var(--momo-note); color: var(--momo-text); }
  [data-archive-page="movie"] .person-chip img, [data-archive-page="movie"] .person-chip > div:first-child { width: 56px; height: 70px; border-radius: 5px; object-fit: cover; background: var(--momo-note); }
  [data-archive-page="movie"] .person-chip > div:last-child { display: grid; gap: 6px; text-align: left; }
  [data-archive-page="movie"] .person-chip span { font-size: 12px; color: var(--momo-muted); }
  [data-archive-page="movie"] .actor-people-list { display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 18px; padding: 4px 4px 16px; scroll-snap-type: x proximity; }
  [data-archive-page="movie"] .actor-people-list .person-chip { flex: 0 0 136px; display: flex; flex-direction: column; align-items: stretch; padding: 0; background: none; border: 0; scroll-snap-align: start; }
  [data-archive-page="movie"] .actor-people-list .person-chip img, [data-archive-page="movie"] .actor-people-list .person-chip > div:first-child { width: 136px; height: 181px; object-fit: cover; border-radius: 7px; }
  [data-archive-page="movie"] .actor-people-list .person-chip > div:last-child { padding-top: 4px; }
  [data-archive-page="movie"] .actor-carousel-controls { display: flex; gap: 8px; justify-content: flex-end; margin: -12px 0 12px; }
  [data-archive-page="movie"] .actor-carousel-controls button { width: 40px; height: 40px; border: 1px solid var(--momo-border); border-radius: 50%; background: var(--momo-bg); color: var(--momo-text); }
  [data-archive-page="movie"] .review-write-section { background: var(--momo-note); }
  [data-archive-page="movie"] .review-write-toggle { background: var(--momo-note); min-height: 68px; padding: 20px; }
  [data-archive-page="movie"] .review-write-content { padding: 24px; gap: 22px; }
  [data-archive-page="movie"] .review-form-actions button { border-radius: 7px; min-height: 44px; color: var(--momo-text); background: var(--momo-primary); border: 0; padding: 10px 18px; }
  [data-archive-page="movie"] .review-form-actions .review-cancel { color: var(--momo-muted); background: var(--momo-note); }
  [data-archive-page="movie"] .detail-review-list { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 26px; }
  [data-archive-page="movie"] .detail-review-card { padding: 22px; background: var(--momo-note); border: 1px solid var(--momo-border); border-radius: 8px; }
  [data-archive-page="movie"] .movie-rating-panel { padding: 22px 28px; background: var(--momo-surface); border: 1px solid var(--momo-border); border-radius: 12px; margin-bottom: 24px; }

  [data-archive-page="review"] .review-detail-card, [data-archive-page="review"] .review-comment-card { background: var(--momo-surface); border: 1px solid var(--momo-border); border-radius: 12px; padding: 32px; margin-bottom: 28px; box-shadow: none; }
  [data-archive-page="review"] .review-detail-top { display: block; }
  [data-archive-page="review"] .review-detail-eyebrow { display: none; }
  [data-archive-page="review"] .review-detail-title { margin: 0 0 16px; }
  [data-archive-page="review"] .review-detail-movie { display: flex; align-items: center; gap: 24px; background: var(--momo-note); border: 1px solid var(--momo-border); border-radius: 8px; padding: 20px; margin: 24px 0; width: 100%; }
  [data-archive-page="review"] .review-detail-movie-poster { width: 92px; height: 138px; flex: 0 0 92px; }
  [data-archive-page="review"] .review-detail-movie-poster img { width: 100%; height: 100%; object-fit: contain; }
  [data-archive-page="review"] .review-detail-content { font-size: 16px; line-height: 2; white-space: pre-wrap; overflow-wrap: anywhere; max-width: 75ch; }
  [data-archive-page="review"] .review-comment-form { background: var(--momo-note); border: 1px solid var(--momo-border); border-radius: 8px; padding: 18px; }
  [data-archive-page="review"] .review-comment-item { background: none; border: 0; border-bottom: 1px solid var(--momo-border); border-radius: 0; padding: 22px 0; }
  [data-archive-page="review"] .review-comment-submit, [data-archive-page="review"] .review-comment-form button[type=submit] { background: var(--momo-primary); color: var(--momo-text); }

  [data-archive-page="profile"] .profile-container, [data-archive-page="edit"] .profile-container { max-width: 1000px; padding: 0; }
  [data-archive-page="profile"] .profile-heading, [data-archive-page="edit"] .profile-heading { margin: 0 0 30px; text-align: left; }
  [data-archive-page="profile"] .profile-heading p, [data-archive-page="edit"] .profile-heading p { color: var(--momo-muted); }
  [data-archive-page="profile"] .profile-card { padding: 28px 32px; margin-bottom: 26px; background: var(--momo-surface); border: 1px solid var(--momo-border); border-radius: 12px; box-shadow: none; }
  [data-archive-page="profile"] .profile-card:first-of-type { background: var(--momo-surface); color: var(--momo-text); border-color: var(--momo-border); }
  [data-archive-page="profile"] .profile-card:first-of-type h2, [data-archive-page="profile"] .profile-card:first-of-type h3 { color: var(--momo-text); }
  [data-archive-page="profile"] .profile-card:first-of-type p, [data-archive-page="profile"] .profile-card:first-of-type span { color: var(--momo-muted); }
  [data-archive-page="profile"] .profile-user { display: flex; align-items: center; gap: 24px; }
  [data-archive-page="profile"] .profile-avatar { width: 88px; height: 88px; flex: 0 0 88px; }
  [data-archive-page="profile"] .profile-user-info h3 { font-size: 25px; margin: 0 0 12px; }
  [data-archive-page="profile"] .profile-activity-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
  [data-archive-page="profile"] .profile-activity-item { display: flex; flex-direction: column; padding: 22px; border: 1px solid var(--momo-border); border-radius: 10px; background: var(--momo-note); color: var(--momo-text); text-decoration: none; }
  [data-archive-page="profile"] .profile-activity-item strong { order: 1; font-size: 34px; margin: 12px 0; color: var(--momo-text); }
  [data-archive-page="profile"] .profile-activity-item h3 { order: 2; font-size: 16px; }
  [data-archive-page="profile"] .profile-activity-item p { order: 3; color: var(--momo-muted); font-size: 12px; }
  [data-archive-page="profile"] .profile-activity-icon { color: var(--momo-accent); }
  [data-archive-page="profile"] .profile-delete-section { display: flex; justify-content: space-between; align-items: center; background: var(--momo-note); padding: 20px 24px; }
  [data-archive-page] .profile-button { min-height: 42px; border: 0; border-radius: 7px; padding: 11px 16px; background: var(--momo-primary); color: var(--momo-text); font-size: 14px; text-decoration: none; }
  [data-archive-page] .profile-button-secondary { background: var(--momo-note); color: var(--momo-muted); }
  [data-archive-page="edit"] .profile-card { padding: 0; border: 0; background: none; box-shadow: none; }
  [data-archive-page="profile"] .archive-activity-section { padding: 0; border: 0; background: none; }
  [data-archive-page="edit"] .profile-form { max-width: 1000px; margin: 0 auto; padding: 0; background: none; border: 0; box-shadow: none; }
  [data-archive-page="edit"] .archive-edit-section { display: grid; gap: 10px; padding: 28px 32px; margin-bottom: 24px; background: var(--momo-surface); border: 1px solid var(--momo-border); border-radius: 12px; }
  [data-archive-page="edit"] .archive-edit-section h2 { margin: 0 0 16px; }
  [data-archive-page="edit"] .profile-form label { color: var(--momo-muted); font-size: 13px; font-weight: 600; margin: 10px 0 0; }
  [data-archive-page="edit"] .profile-form input:not([type=file]) { width: 100%; }
  [data-archive-page="edit"] .profile-form-buttons { display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 20px; }

  [data-archive-page="login"], [data-archive-page="signup"] { width: 100%; max-width: none; min-height: 0; background: transparent; }
  [data-archive-page] .signup-wrapper { width: 470px; max-width: none; margin: 20px auto 40px; padding: 0; }
  [data-archive-page] .signup-brand, [data-archive-page] .signup-note-label, [data-archive-page] .signup-eyebrow, [data-archive-page] .signup-bottom-caption { display: none; }
  [data-archive-page] .signup-card { display: block; width: 470px; padding: 36px; background: var(--momo-surface); border: 1px solid var(--momo-border); border-radius: 14px; box-shadow: none; transform: none; }
  [data-archive-page] .signup-card-heading { padding: 0; margin: 0 0 28px; background: none; text-align: left; border: 0; }
  [data-archive-page] .signup-card-heading h1 { margin: 0 0 10px; font-size: 26px; }
  [data-archive-page] .signup-card-heading p { font-size: 13px; color: var(--momo-muted); }
  [data-archive-page] .signup-card form { width: 100%; padding: 0; display: grid; gap: 18px; }
  [data-archive-page] .signup-field { margin: 0; display: grid; gap: 8px; }
  [data-archive-page] .signup-field label { color: var(--momo-muted); font-size: 13px; font-weight: 600; }
  [data-archive-page] .signup-field input { width: 100%; min-height: 46px; }
  [data-archive-page] .signup-message { margin: 0; font-size: 12px; min-height: 0; }
  [data-archive-page] .signup-message:empty { display: none; }
  [data-archive-page] .signup-submit { width: 100%; min-height: 46px; margin: 4px 0 0; border: 0; border-radius: 7px; color: var(--momo-text); background: var(--momo-primary); font-size: 15px; font-weight: 700; }
  [data-archive-page] .signup-submit:hover:not(:disabled) { background: var(--momo-primary-hover); }
  [data-archive-page] .signup-footer { margin: 22px 0 0; padding: 0; background: none; text-align: left; color: var(--momo-muted); font-size: 13px; }
  [data-archive-page] .signup-footer a { color: var(--momo-text); margin-left: 8px; }

  [data-archive-page="reviews"] .all-reviews-heading::before,
  [data-archive-page="review"] .review-detail-card::before,
  [data-archive-page="profile"] .profile-card::before,
  [data-archive-page="edit"] .profile-card::before { content: none; }
  [data-archive-page="edit"] .profile-image-edit { display: grid; grid-template-columns: 80px minmax(0, 1fr); gap: 12px 20px; align-items: center; margin-bottom: 18px; }
  [data-archive-page="edit"] .profile-image-preview { grid-row: 1 / 3; width: 80px; height: 80px; margin: 0; }
  [data-archive-page="edit"] .profile-image-input-wrapper { justify-content: flex-start; margin: 0; }
  [data-archive-page="edit"] .profile-image-input-wrapper input { max-width: 100%; }
  [data-archive-page="edit"] .profile-image-buttons { grid-column: 2; justify-content: flex-start; }
  [data-archive-page="review"] .review-detail-content { background: none; border: 0; padding: 8px 0; border-radius: 0; color: var(--momo-text); }
  [data-archive-page="review"] .review-like-button, [data-archive-page="review"] .review-dislike-button,
  [data-archive-page="review"] .comment-like-button, [data-archive-page="review"] .comment-dislike-button { background: var(--momo-bg); color: var(--momo-muted); border-color: var(--momo-border); }
  [data-archive-page="review"] .review-like-button.active, [data-archive-page="review"] .review-dislike-button.active,
  [data-archive-page="review"] .comment-like-button.active, [data-archive-page="review"] .comment-dislike-button.active { background: var(--momo-control-hover); color: var(--momo-text); border-color: var(--momo-border); }
  [data-archive-page="movie"] .movie-score-display { background: var(--momo-bg); border-color: var(--momo-border); }
  [data-archive-page="movie"] .movie-score-value { color: var(--momo-muted); }

  [data-archive-page] h1, [data-archive-page] h2, [data-archive-page] h3 { overflow-wrap: anywhere; }
  [data-archive-page] .profile-user-info, [data-archive-page] .profile-card-heading > div,
  [data-archive-page] .movie-detail-info { min-width: 0; overflow-wrap: anywhere; }
  [data-archive-page] .profile-card-heading { flex-wrap: wrap; }
  [data-archive-page] .profile-user-info p { gap: 18px; overflow-wrap: anywhere; }
  [data-archive-page] .profile-user-info p span { flex-shrink: 0; }
  [data-archive-page] .profile-button { opacity: 1; transition: background-color .15s, color .15s, border-color .15s; box-shadow: none; }
  [data-archive-page] .profile-button:not(:disabled):hover { opacity: 1; background: var(--momo-primary-hover); color: var(--momo-text); border-color: var(--momo-primary-hover); transform: none; }
  [data-archive-page] .profile-button-secondary:not(:disabled):hover { background: var(--momo-control-hover); color: var(--momo-text); }
  [data-archive-page] .profile-button:disabled { opacity: 1; background: var(--momo-note); color: var(--momo-muted); border-color: var(--momo-border); cursor: not-allowed; }
  [data-archive-page="review"] .review-detail-byline { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--momo-border); padding-bottom: 20px; }
  [data-archive-page="review"] .review-detail-meta { flex: 1; min-width: 0; padding: 0; border: 0; overflow-wrap: anywhere; }
  [data-archive-page="review"] .review-detail-meta span { border: 0; padding: 0; }
  [data-archive-page="review"] .review-detail-actions { margin: 0; padding: 0; border: 0; flex-shrink: 0; }
  [data-archive-page="review"] .review-detail-main { width: 100%; min-width: 0; }
  [data-archive-page="review"] .review-detail-top { border: 0; padding-bottom: 0; }
  [data-archive-page="review"] .review-detail-movie-info { min-width: 0; overflow-wrap: anywhere; }
  [data-archive-page="review"] .review-comment-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
  [data-archive-page="review"] .review-comment-meta > strong { min-width: 0; overflow-wrap: anywhere; }
  [data-archive-page="review"] .review-comment-meta .review-author-badge { display: inline-flex; align-items: center; flex-shrink: 0; gap: 4px; border: 1px solid var(--momo-border); padding: 2px 7px; border-radius: 4px; background: var(--momo-note); color: var(--momo-warning); font-size: 11px; font-weight: 700; }
  [data-archive-page="review"] .review-comment-body { min-width: 0; }
  [data-archive-page="review"] .review-detail-reactions { padding-top: 20px; margin-top: 24px; border-top: 1px solid var(--momo-border); border-bottom: 0; padding-bottom: 0; }
  [data-archive-page="review"] .review-comment-form input { min-width: 0; }
  [data-archive-page="review"] .review-comment-form button { flex-shrink: 0; }
  [data-archive-page="movie"] .movie-detail-info h1 { overflow: visible; white-space: normal; }
  [data-archive-page="movie"] .detail-content-section > p { white-space: pre-wrap; overflow-wrap: anywhere; }
  [data-archive-page="movie"] .detail-reaction-counts { margin: 0 0 22px; }
  [data-archive-page="movie"] .detail-reaction-count { min-height: 84px; background: var(--momo-bg); border-color: var(--momo-border); color: var(--momo-muted); }
  [data-archive-page="movie"] .detail-reaction-count strong { color: var(--momo-text); font-size: 28px; }
  [data-archive-page="movie"] .detail-reaction-count:hover { background: var(--momo-control-hover); border-color: var(--momo-border); }
  [data-archive-page="movie"] .detail-reaction-count.selected-like,
  [data-archive-page="movie"] .detail-reaction-count.selected-dislike { background: var(--momo-control-hover); color: var(--momo-text); border-color: var(--momo-border); }
  [data-archive-page="movie"] .detail-reaction-count.selected-like strong,
  [data-archive-page="movie"] .detail-reaction-count.selected-dislike strong { color: var(--momo-text); }
  [data-archive-page="movie"] .rating-label { font-size: 16px; margin: 0; }
  [data-archive-page="movie"] .movie-score-display { display: flex; flex-direction: row; justify-content: flex-start; gap: 20px; min-height: 0; padding: 10px 0 0; margin: 0; border: 0; border-radius: 0; background: none; }
  [data-archive-page="movie"] .movie-score-value strong { font-size: 24px; color: var(--momo-muted); }
  [data-archive-page="movie"] .movie-score-value span { font-size: 14px; }
  [data-archive-page="movie"] .movie-score-display p { margin: 0; }
  [data-archive-page="movie"] .detail-total-count { font-size: 12px; margin-bottom: 0; }
  [data-archive-page="movie"] .review-write-section { margin-top: 24px; border-color: var(--momo-border); }
  [data-archive-page="movie"] .review-write-toggle { min-height: 58px; padding: 16px 20px; text-align: left; border-color: var(--momo-border); box-shadow: none; }
  [data-archive-page="movie"] .review-write-toggle:hover { background: var(--momo-control-hover); }
  [data-archive-page="movie"] .review-toggle-arrow { font-size: 12px; flex-shrink: 0; }
  [data-archive-page="movie"] .review-write-content input, [data-archive-page="movie"] .review-write-content textarea { width: 100%; }
  [data-archive-page="movie"] .review-form-actions button { box-shadow: none; }
  [data-archive-page="movie"] .detail-review-card > div { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 10px 20px; }
  [data-archive-page="movie"] .detail-review-title { color: var(--momo-text); font-size: 18px; font-weight: 700; text-decoration: none; overflow-wrap: anywhere; min-width: 0; }
  [data-archive-page="movie"] .detail-review-title:hover { color: var(--momo-text); text-decoration: underline; }
  [data-archive-page="movie"] .detail-review-card .detail-review-body { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.9; font-size: 15px; margin: 16px 0; }
  [data-archive-page="movie"] .detail-review-card .detail-review-author { margin-left: 0; }
  [data-archive-page="movie"] .detail-memo-empty { display: grid; justify-items: center; gap: 10px; padding: 38px 24px; text-align: center; color: var(--momo-muted); }
  [data-archive-page="movie"] .detail-memo-empty > span { font-size: 30px; color: var(--momo-accent); }
  [data-archive-page="movie"] .detail-memo-empty h3, [data-archive-page="movie"] .detail-memo-empty p { margin: 0; }
  [data-archive-page="movie"] .detail-memo-empty button { padding: 10px 16px; margin-top: 8px; border: 1px solid var(--momo-border); border-radius: 7px; background: var(--momo-bg); color: var(--momo-muted); }

  [data-archive-page="my-reviews"] .my-reviews-heading,
  [data-archive-page="liked-reviews"] .liked-reviews-heading,
  [data-archive-page="favorites"] .favorite-page-heading { padding: 0; margin: 0 0 28px; border: 0; background: none; box-shadow: none; }
  [data-archive-page="my-reviews"] .my-reviews-eyebrow,
  [data-archive-page="liked-reviews"] .liked-reviews-eyebrow { display: none; }
  [data-archive-page="my-reviews"] .my-reviews-card,
  [data-archive-page="liked-reviews"] .liked-reviews-card { padding: 26px; background: var(--momo-surface); border: 1px solid var(--momo-border); border-radius: 12px; box-shadow: none; }
  [data-archive-page="liked-reviews"] .liked-reviews-container,
  [data-archive-page="favorites"] .favorite-page-container,
  [data-archive-page="delete"] .profile-container { max-width: 1000px; padding: 0; margin: 0 auto; }
  [data-archive-page="liked-reviews"] .liked-review-item,
  [data-archive-page="my-reviews"] .my-review-item { background: var(--momo-note); border: 1px solid var(--momo-border); color: var(--momo-text); min-width: 0; }
  [data-archive-page="liked-reviews"] .liked-review-info,
  [data-archive-page="my-reviews"] .my-review-info { min-width: 0; }
  [data-archive-page="liked-reviews"] .liked-review-title,
  [data-archive-page="my-reviews"] .my-review-info h3 { color: var(--momo-text); overflow-wrap: anywhere; }
  [data-archive-page="liked-reviews"] .liked-review-unlike { background: var(--momo-bg); color: var(--momo-muted); border-color: var(--momo-border); }
  [data-archive-page="my-reviews"] a, [data-archive-page="liked-reviews"] a { color: var(--momo-muted); }
  [data-archive-page="my-reviews"] .my-reviews-pagination button.active,
  [data-archive-page="liked-reviews"] .liked-reviews-pagination button.active { background: var(--momo-control-hover); border-color: var(--momo-border); color: var(--momo-text); }
  [data-archive-page="favorites"] .favorite-page-grid { grid-template-columns: repeat(5,minmax(0,1fr)); gap: 24px; }
  [data-archive-page="favorites"] .favorite-page-card { background: var(--momo-surface); border-color: var(--momo-border); box-shadow: none; }
  [data-archive-page="favorites"] .favorite-page-card h3 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  [data-archive-page="favorites"] .favorite-back-button { background: var(--momo-bg); border-color: var(--momo-border); color: var(--momo-muted); }
  [data-archive-page="delete"] .profile-card { padding: 32px; border: 1px solid var(--momo-border); border-radius: 12px; background: var(--momo-surface); box-shadow: none; }
  [data-archive-page="delete"] .profile-card::before { content: none; }
  [data-archive-page="delete"] .profile-heading { margin-bottom: 0; }
  [data-archive-page="delete"] .profile-delete-check { display: flex; align-items: center; gap: 10px; color: var(--momo-muted); }

  [data-archive-page="movie"] .movie-detail-header { align-items: start; }
  [data-archive-page="movie"] .movie-detail-info { align-self: start; padding: 0; }
  [data-archive-page="movie"] .movie-detail-info h1 { margin: 8px 0 10px; }
  [data-archive-page="movie"] .movie-original-title { margin: 0 0 18px; }
  [data-archive-page="movie"] .movie-detail-facts { display: grid; gap: 8px; margin: 20px 0; font-size: 14px; }
  [data-archive-page="movie"] .movie-detail-facts > div { display: grid; grid-template-columns: 76px minmax(0,1fr); gap: 12px; }
  [data-archive-page="movie"] .movie-detail-facts dt { color: var(--momo-muted); }
  [data-archive-page="movie"] .movie-detail-facts dd { margin: 0; color: var(--momo-text); overflow-wrap: anywhere; }
  [data-archive-page="movie"] .movie-detail-synopsis h2 { font-size: 16px; margin: 22px 0 8px; }
  [data-archive-page="movie"] .movie-detail-synopsis p { margin: 0; font-size: 14px; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; }
  [data-archive-page="movie"] .movie-detail-synopsis .is-collapsed { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden; }
  [data-archive-page="movie"] .movie-overview-toggle { background: none; border: 0; padding: 6px 0; color: var(--momo-text); text-decoration: underline; font-size: 13px; }
  [data-archive-page="movie"] .movie-detail-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
  [data-archive-page="movie"] .movie-detail-actions .favorite-star,
  [data-archive-page="movie"] .movie-share-button { position: static; display: inline-flex; align-items: center; justify-content: center; gap: 7px; width: auto; height: auto; min-height: 42px; padding: 9px 16px; border: 1px solid var(--momo-border); border-radius: 7px; background: var(--momo-bg); color: var(--momo-muted); font-size: 14px; font-family: inherit; line-height: 1.4; transform: none; }
  [data-archive-page="movie"] .movie-detail-actions .favorite-star::after { content: attr(aria-label); }
  [data-archive-page="movie"] .movie-detail-actions .favorite-star:hover,
  [data-archive-page="movie"] .movie-share-button:hover { background: var(--momo-control-hover); }
  [data-archive-page="movie"] .movie-detail-actions .favorite-star.is-active { background: var(--momo-control-hover); color: var(--momo-text); }
  [data-archive-page="movie"] .movie-share-result { margin: 10px 0 0; color: var(--momo-muted); font-size: 13px; }
  [data-archive-page="movie"] .detail-my-memo .review-write-section { margin-top: 0; }
  [data-archive-page="movie"] .detail-member-reviews .detail-review-list { margin-top: 0; }

  [data-archive-page="profile"] .compact-profile-card { padding: 22px 28px; }
  [data-archive-page="profile"] .compact-profile-card .profile-card-heading { margin-bottom: 18px; }
  [data-archive-page="profile"] .compact-profile-card .profile-card-heading h2 { font-size: 20px; margin: 0; }
  [data-archive-page="profile"] .compact-profile-card .profile-user { gap: 20px; }
  [data-archive-page="profile"] .compact-profile-card .profile-avatar { width: 72px; height: 72px; flex: 0 0 72px; }
  [data-archive-page="profile"] .compact-profile-card .profile-user-info { width: auto; max-width: 650px; gap: 0; }
  [data-archive-page="profile"] .compact-profile-card .profile-user-info h3 { font-size: 22px; margin: 0 0 10px; }
  [data-archive-page="profile"] .compact-profile-fields { display: grid; gap: 8px; margin: 0; font-size: 13px; }
  [data-archive-page="profile"] .compact-profile-fields > div { display: flex; align-items: baseline; gap: 14px; border: 0; }
  [data-archive-page="profile"] .compact-profile-fields dt { display: inline-flex; align-items: center; flex: 0 0 72px; gap: 7px; color: var(--momo-muted); }
  [data-archive-page="profile"] .compact-profile-fields dt svg { fill: none; stroke: currentColor; stroke-width: 1.3; flex-shrink: 0; }
  [data-archive-page="profile"] .compact-profile-fields dd { margin: 0; color: var(--momo-text); min-width: 0; overflow-wrap: anywhere; }
`;

export default ArchivePagesStyles;
