import { createGlobalStyle } from "styled-components";

// 기존 호환 스타일의 밝은 잔여 색만 교체한다. 홈 A안의 선택자와 배치는 건드리지 않는다.
const CinemaCharcoalStyles = createGlobalStyle`
  [data-archive-page][data-archive-page] { background-color: var(--momo-bg); }
  [data-archive-page][data-archive-page] a { color: var(--momo-text); }
  [data-archive-page][data-archive-page] :is(h1, h2, h3, h4) { color: var(--momo-text); }
  [data-archive-page][data-archive-page] .detail-back-button {
    background: var(--momo-surface); color: var(--momo-text); border-color: var(--momo-border);
  }
  [data-archive-page][data-archive-page] .movie-score-display :is(span, p),
  [data-archive-page][data-archive-page] .movie-score-label { color: var(--momo-muted); }
  [data-archive-page][data-archive-page] .movie-score-display strong { color: var(--momo-text); }
  [data-archive-page][data-archive-page] :is(.review-detail-meta, .review-detail-meta span,
    .review-detail-movie-info p, .review-detail-movie-meta, .review-detail-movie-label,
    .review-comment-meta > span:not(.review-author-badge)) { color: var(--momo-muted); }
  [data-archive-page][data-archive-page] :is(.review-detail-meta strong, .review-comment-meta strong,
    .review-comment-content, .review-detail-content) { color: var(--momo-text); }
  [data-archive-page][data-archive-page] .review-edit-buttons button:not(:first-child) {
    background: var(--momo-surface); color: var(--momo-text); border-color: var(--momo-border);
    &:hover { background: var(--momo-control-hover); }
  }
  [data-archive-page][data-archive-page] :is(.my-review-movie, .my-review-date, .my-review-stats,
    .liked-review-movie, .liked-review-date, .liked-review-stats),
  [data-archive-page][data-archive-page] :is(.my-review-stats, .liked-review-stats) :is(span, strong) {
    color: var(--momo-muted);
  }
  [data-archive-page][data-archive-page] input,
  [data-archive-page][data-archive-page] textarea,
  [data-archive-page][data-archive-page] select {
    color-scheme: dark;
    color: var(--momo-text);
    background-color: var(--momo-note);
    border-color: var(--momo-border);
    caret-color: var(--momo-text);
  }
  [data-archive-page][data-archive-page] input::placeholder,
  [data-archive-page][data-archive-page] textarea::placeholder { color: var(--momo-muted); opacity: 1; }
  [data-archive-page][data-archive-page] :is(a, button, input, textarea, select):focus-visible {
    outline: 2px solid var(--momo-text); outline-offset: 3px;
  }
  [data-archive-page][data-archive-page] :is(.review-detail-back, .review-action-button),
  [data-archive-page][data-archive-page] .review-comment-actions button,
  [data-archive-page][data-archive-page] .review-comment-edit button {
    color: var(--momo-text); background-color: var(--momo-surface); border-color: var(--momo-border);
  }
  [data-archive-page][data-archive-page] :is(.review-detail-back, .review-action-button):hover,
  [data-archive-page][data-archive-page] .review-comment-actions button:hover {
    background-color: var(--momo-control-hover); color: var(--momo-text);
  }
  [data-archive-page][data-archive-page] :is(.profile-avatar, .profile-image-preview, .review-comment-avatar,
    .review-detail-movie-poster, .my-review-poster, .liked-review-poster, .favorite-page-poster),
  [data-archive-page][data-archive-page] :is(.my-reviews-heading, .liked-reviews-heading, .my-reviews-card-heading, .liked-reviews-card-heading) span {
    background: var(--momo-surface); color: var(--momo-muted); border-color: var(--momo-border);
  }

  // 주요 저장·등록만 테라코타로 강조하고 밝은 버튼 위에는 어두운 글자를 사용한다.
  [data-archive-page][data-archive-page] .signup-submit,
  [data-archive-page][data-archive-page] .profile-button:not(.profile-button-secondary):not(.profile-delete-button),
  [data-archive-page][data-archive-page] .review-form-actions button:not(.review-cancel),
  [data-archive-page][data-archive-page] .all-reviews-search-submit,
  [data-archive-page][data-archive-page] .review-comment-form button[type=submit],
  [data-archive-page][data-archive-page] .review-edit-buttons button:first-child,
  [data-archive-page][data-archive-page] .review-comment-edit button:first-child {
    background-color: var(--momo-primary); color: var(--momo-on-primary); border-color: var(--momo-primary);
  }
  [data-archive-page][data-archive-page] .signup-submit:hover:not(:disabled),
  [data-archive-page][data-archive-page] .profile-button:not(.profile-button-secondary):not(.profile-delete-button):hover:not(:disabled),
  [data-archive-page][data-archive-page] .review-form-actions button:not(.review-cancel):hover:not(:disabled),
  [data-archive-page][data-archive-page] .all-reviews-search-submit:hover:not(:disabled) {
    background-color: var(--momo-primary-hover); color: var(--momo-on-primary);
  }
  [data-archive-page][data-archive-page] .profile-delete-button,
  [data-archive-page][data-archive-page] .review-action-button.delete,
  [data-archive-page][data-archive-page] .review-comment-actions button.delete {
    background-color: var(--momo-dislike-bg); color: var(--momo-dislike-text); border-color: var(--momo-dislike-border);
  }
  [data-archive-page][data-archive-page] .profile-delete-button:hover:not(:disabled),
  [data-archive-page][data-archive-page] .review-action-button.delete:hover,
  [data-archive-page][data-archive-page] .review-comment-actions button.delete:hover {
    background-color: var(--momo-dislike-bg-hover); color: var(--momo-dislike-text);
  }
  [data-archive-page][data-archive-page] .profile-button:disabled {
    background-color: var(--momo-note); color: var(--momo-muted); border-color: var(--momo-border);
  }
  // 빈 상태와 실패 안내를 같은 회색으로 보이지 않게 해 오류의 의미를 유지한다.
  [data-archive-page][data-archive-page] :is(.error, .all-reviews-error, .review-detail-error, .form-error, [role=alert]) {
    background: var(--momo-dislike-bg); color: var(--momo-error); border-color: var(--momo-dislike-border);
  }
  .movie-detail-page:not([data-archive-page]) .movie-detail-poster { background: var(--momo-surface); }
  .movie-detail-page:not([data-archive-page]) .detail-back-button {
    background: var(--momo-surface); color: var(--momo-text); border-color: var(--momo-border);
  }
  .momo-toast-logo { filter: grayscale(1) invert(1); }
`;

export default CinemaCharcoalStyles;
