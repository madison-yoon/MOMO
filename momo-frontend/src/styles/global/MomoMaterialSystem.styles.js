import { createGlobalStyle } from "styled-components";

/*
 * MOMO shared material layer.
 * Page layout and hierarchy live in the existing page style modules.
 * This file owns only shared glass materials, interactive surfaces and focus.
 */
const MomoMaterialSystemStyles = createGlobalStyle`
  :root {
    --momo-glass-blur: 26px;
    --momo-glass-saturation: 150%;
    --momo-glass-tint: rgba(255, 250, 236, .38);
    --momo-glass-clear: rgba(255, 255, 255, .34);
    --momo-glass-edge: rgba(233, 223, 197, .9);
    --momo-glass-edge-warm: rgba(214, 180, 63, .28);
    --momo-glass-surface:
      linear-gradient(138deg, rgba(255,255,255,.76), rgba(242,247,243,.54) 56%, rgba(226,237,231,.38));
    --momo-glass-depth:
      0 2px 5px rgba(41,40,32,.035),
      0 12px 28px rgba(41,40,32,.075),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(216,201,159,.16);
    --momo-glass-depth-active:
      0 1px 3px rgba(41,40,32,.05),
      inset 0 2px 5px rgba(41,40,32,.075),
      inset 0 1px 0 rgba(255,255,255,.86);
    --momo-motion-material: 240ms cubic-bezier(.2,.72,.2,1);
    --momo-motion-press: 100ms cubic-bezier(.2,.7,.2,1);
  }

  /* Navigation: a translucent continuous plane with a quiet optical rim. */
  #root .momo-app-header {
    background:
      linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,250,236,.58));
    border-bottom: 1px solid rgba(255,255,255,.9);
    box-shadow:
      0 8px 26px rgba(41,40,32,.065),
      inset 0 1px 0 rgba(255,255,255,.96);
    -webkit-backdrop-filter: blur(30px) saturate(155%);
    backdrop-filter: blur(30px) saturate(155%);
  }

  #root .momo-app-header nav a {
    transition:
      color var(--momo-motion-material),
      background-color var(--momo-motion-material),
      border-color var(--momo-motion-material),
      box-shadow var(--momo-motion-material);
  }

  #root .momo-app-header nav a:hover,
  #root .momo-app-header nav a:focus-visible {
    border-color: rgba(214,180,63,.46);
    background: rgba(255,255,255,.58);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.96), 0 4px 12px rgba(41,40,32,.055);
  }

  #root .momo-app-header nav a.active {
    border-color: rgba(214,180,63,.55);
    background: rgba(255,212,59,.22);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
  }

  /* Major panels: translucent, but with enough pigment for readable content. */
  #root .profile-dashboard .profile-card,
  #root .profile-edit-page .profile-edit-card,
  #root .profile-edit-page .profile-edit-photo-card,
  #root .profile-edit-page .profile-edit-details,
  #root .favorite-page-heading,
  #root .favorite-page-empty,
  #root .search-page-heading,
  #root .my-reviews-heading,
  #root .my-reviews-card,
  #root .liked-reviews-heading,
  #root .liked-reviews-card,
  #root .all-reviews-heading,
  #root .all-reviews-card,
  #root .all-reviews-search,
  #root .movie-detail-page .movie-detail-header,
  #root .movie-detail-page .movie-rating-panel,
  #root .movie-detail-page .detail-content-section,
  #root .movie-detail-page .review-write-section,
  #root .movie-detail-page .detail-review-card,
  #root .review-detail-card,
  #root .review-comment-card,
  #root .signup-card,
  #root .profile-delete-page-card {
    border-color: var(--momo-glass-edge);
    box-shadow: var(--momo-glass-depth);
    -webkit-backdrop-filter: blur(var(--momo-glass-blur)) saturate(var(--momo-glass-saturation));
    backdrop-filter: blur(var(--momo-glass-blur)) saturate(var(--momo-glass-saturation));
  }

  #root .profile-dashboard .profile-card,
  #root .profile-edit-page .profile-edit-card,
  #root .profile-edit-page .profile-edit-photo-card,
  #root .profile-edit-page .profile-edit-details,
  #root .favorite-page-empty,
  #root .my-reviews-card,
  #root .liked-reviews-card,
  #root .all-reviews-card,
  #root .movie-detail-page .movie-rating-panel,
  #root .movie-detail-page .detail-content-section,
  #root .movie-detail-page .review-write-section,
  #root .movie-detail-page .detail-review-card,
  #root .review-detail-card,
  #root .review-comment-card,
  #root .signup-card,
  #root .profile-delete-page-card {
    background: var(--momo-glass-surface);
  }

  #root .movie-detail-page .movie-detail-header {
    background:
      radial-gradient(ellipse at 8% 4%, rgba(255,255,255,.78), transparent 44%),
      radial-gradient(ellipse at 96% 100%, rgba(255,212,59,.16), transparent 46%),
      linear-gradient(132deg, rgba(255,255,255,.76), rgba(255,250,236,.42));
  }

  /* Main cinematic surfaces keep a stronger refractive layer than compact cards. */
  #root .movie-detail-page .movie-detail-header {
    border-color: rgba(255,255,255,.88);
    backdrop-filter: blur(32px) saturate(152%);
    -webkit-backdrop-filter: blur(32px) saturate(152%);
  }
  #root .movie-detail-page .movie-rating-panel {
    border-color: rgba(255,255,255,.82);
    background: radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.82), transparent 48%), linear-gradient(140deg, rgba(255,255,255,.7), rgba(239,246,243,.52));
  }
  #root .profile-edit-page .profile-edit-photo-card {
    backdrop-filter: blur(24px) saturate(145%);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
  }

  /* Smaller surfaces keep their own silhouettes instead of becoming uniform cards. */
  #root .favorite-page .favorite-page-card,
  #root .profile-dashboard .profile-activity-item,
  #root .search-page .movie-card,
  #root .search-page .movie-item,
  #root .my-review-item,
  #root .liked-review-item,
  #root .all-reviews-mobile-item,
  #root .person-chip,
  #root .review-comment-item,
  #root .review-detail-movie {
    border-color: rgba(255,255,255,.84);
    box-shadow:
      0 4px 12px rgba(41,40,32,.045),
      inset 0 1px 0 rgba(255,255,255,.94);
  }

  #root .favorite-page .favorite-page-card,
  #root .profile-dashboard .profile-activity-item,
  #root .search-page .movie-card,
  #root .search-page .movie-item,
  #root .my-review-item,
  #root .liked-review-item,
  #root .all-reviews-mobile-item,
  #root .person-chip {
    transition:
      border-color var(--momo-motion-material),
      background-color var(--momo-motion-material),
      box-shadow var(--momo-motion-material),
      filter var(--momo-motion-material);
  }

  #root .favorite-page .favorite-page-card:hover,
  #root .profile-dashboard .profile-activity-item:hover,
  #root .search-page .movie-card:hover,
  #root .search-page .movie-item:hover,
  #root .my-review-item:hover,
  #root .liked-review-item:hover,
  #root .all-reviews-mobile-item:hover,
  #root .person-chip:hover {
    border-color: rgba(255,255,255,.98);
    box-shadow:
      0 5px 14px rgba(41,40,32,.055),
      0 16px 30px rgba(41,40,32,.085),
      inset 0 1px 0 rgba(255,255,255,1);
    filter: saturate(1.04);
  }

  #root .favorite-page .favorite-page-card { border-color: #E9DFC5; }

  /* The saved-film action is anchored to the poster, without shifting the card itself. */
  #root .favorite-page .favorite-page-poster .favorite-star,
  #root .momo-home-poster-frame .favorite-star {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 5;
    width: 40px;
    height: 40px;
    padding: 0;
  }

  /* Preserve semantic left-edge cues for the three profile destinations. */
  #root .profile-dashboard .profile-activity-item[data-tone="writing"] { border-left-color: #D6B43F; }
  #root .profile-dashboard .profile-activity-item[data-tone="liked"] { border-left-color: #B98778; }
  #root .profile-dashboard .profile-activity-item[data-tone="saved"] { border-left-color: #829276; }

  /* Poster edges are crisp; the image remains the visual focus. */
  #root .favorite-page .favorite-page-poster,
  #root .movie-detail-page .movie-detail-poster,
  #root .review-detail-movie-poster,
  #root .liked-review-poster,
  #root .all-review-poster,
  #root .my-review-poster {
    box-shadow: 0 8px 20px rgba(34,31,24,.12), inset 0 1px 0 rgba(255,255,255,.86);
  }

  /* Reusable controls: optical edge-light and pressure feedback, no lift motion. */
  #root .profile-button,
  #root .all-reviews-pagination button,
  #root .my-reviews-pagination button,
  #root .liked-reviews-pagination button,
  #root .review-edit-buttons button,
  #root .review-comment-form button,
  #root .liked-review-unlike,
  #root .reaction-button,
  #root .favorite-browse-button,
  #root .favorite-back-button,
  #root .page-back-link,
  #root .detail-back-button,
  #root .review-detail-back,
  #root .review-action-button,
  #root .all-reviews-search-submit,
  #root .all-reviews-search-reset,
  #root .rating-vote-button,
  #root .review-form-actions button,
  #root .signup-submit,
  #root .favorite-star,
  #root .profile-dashboard-edit,
  #root .profile-delete-button,
  #root .profile-edit-page .profile-image-buttons button,
  #root .review-like-button,
  #root .review-dislike-button,
  #root .comment-like-button,
  #root .comment-dislike-button,
  #root .recommend-button,
  #root .people-more-button,
  #root .person-bio-toggle,
  #root .movie-review-button,
  #root .movie-like-button,
  #root .momo-app-header button {
    border-color: rgba(255,255,255,.82);
    box-shadow:
      0 2px 4px rgba(41,40,32,.04),
      0 6px 14px rgba(41,40,32,.055),
      inset 0 1px 0 rgba(255,255,255,.94);
    transition:
      color var(--momo-motion-material),
      background-color var(--momo-motion-material),
      border-color var(--momo-motion-material),
      box-shadow var(--momo-motion-material),
      filter var(--momo-motion-material),
      transform var(--momo-motion-press);
  }

  #root .profile-button:hover:not(:disabled),
  #root .all-reviews-pagination button:hover:not(:disabled),
  #root .my-reviews-pagination button:hover:not(:disabled),
  #root .liked-reviews-pagination button:hover:not(:disabled),
  #root .review-edit-buttons button:hover:not(:disabled),
  #root .review-comment-form button:hover:not(:disabled),
  #root .liked-review-unlike:hover:not(:disabled),
  #root .reaction-button:hover:not(:disabled),
  #root .favorite-browse-button:hover:not(:disabled),
  #root .favorite-back-button:hover,
  #root .page-back-link:hover,
  #root .detail-back-button:hover,
  #root .review-detail-back:hover,
  #root .review-action-button:hover:not(:disabled),
  #root .all-reviews-search-submit:hover:not(:disabled),
  #root .all-reviews-search-reset:hover:not(:disabled),
  #root .rating-vote-button:hover:not(:disabled),
  #root .review-form-actions button:hover:not(:disabled),
  #root .signup-submit:hover:not(:disabled),
  #root .favorite-star:hover:not(:disabled),
  #root .profile-dashboard-edit:hover,
  #root .profile-delete-button:hover:not(:disabled),
  #root .profile-edit-page .profile-image-buttons button:hover:not(:disabled),
  #root .review-like-button:hover:not(:disabled),
  #root .review-dislike-button:hover:not(:disabled),
  #root .comment-like-button:hover:not(:disabled),
  #root .comment-dislike-button:hover:not(:disabled),
  #root .recommend-button:hover:not(:disabled),
  #root .people-more-button:hover:not(:disabled),
  #root .person-bio-toggle:hover:not(:disabled),
  #root .movie-review-button:hover:not(:disabled),
  #root .movie-like-button:hover:not(:disabled),
  #root .momo-app-header button:hover:not(:disabled) {
    border-color: rgba(255,255,255,.98);
    box-shadow:
      0 3px 7px rgba(41,40,32,.045),
      0 10px 20px rgba(41,40,32,.085),
      inset 0 1px 0 rgba(255,255,255,1),
      inset 0 0 0 1px rgba(255,255,255,.18);
    filter: saturate(1.06) brightness(1.015);
  }

  /* The logout action stays visually secondary inside the glass masthead. */
  #root .momo-app-header button.momo-logout-button {
    border-color: rgba(216,201,159,.58);
  }

  #root .profile-button:active:not(:disabled),
  #root .all-reviews-pagination button:active:not(:disabled),
  #root .my-reviews-pagination button:active:not(:disabled),
  #root .liked-reviews-pagination button:active:not(:disabled),
  #root .review-edit-buttons button:active:not(:disabled),
  #root .review-comment-form button:active:not(:disabled),
  #root .liked-review-unlike:active:not(:disabled),
  #root .reaction-button:active:not(:disabled),
  #root .favorite-browse-button:active:not(:disabled),
  #root .favorite-back-button:active,
  #root .page-back-link:active,
  #root .detail-back-button:active,
  #root .review-detail-back:active,
  #root .review-action-button:active:not(:disabled),
  #root .all-reviews-search-submit:active:not(:disabled),
  #root .rating-vote-button:active:not(:disabled),
  #root .review-form-actions button:active:not(:disabled),
  #root .signup-submit:active:not(:disabled),
  #root .favorite-star:active:not(:disabled),
  #root .profile-delete-button:active:not(:disabled),
  #root .review-like-button:active:not(:disabled),
  #root .review-dislike-button:active:not(:disabled),
  #root .comment-like-button:active:not(:disabled),
  #root .comment-dislike-button:active:not(:disabled),
  #root .recommend-button:active:not(:disabled) {
    transform: scale(.985);
    box-shadow: var(--momo-glass-depth-active);
    transition-duration: var(--momo-motion-press);
  }

  #root .profile-button:focus-visible,
  #root .all-reviews-pagination button:focus-visible,
  #root .my-reviews-pagination button:focus-visible,
  #root .liked-reviews-pagination button:focus-visible,
  #root .review-edit-buttons button:focus-visible,
  #root .review-comment-form button:focus-visible,
  #root .liked-review-unlike:focus-visible,
  #root .reaction-button:focus-visible,
  #root .favorite-browse-button:focus-visible,
  #root .favorite-back-button:focus-visible,
  #root .page-back-link:focus-visible,
  #root .detail-back-button:focus-visible,
  #root .review-detail-back:focus-visible,
  #root .review-action-button:focus-visible,
  #root .all-reviews-search-submit:focus-visible,
  #root .all-reviews-search-reset:focus-visible,
  #root .rating-vote-button:focus-visible,
  #root .review-form-actions button:focus-visible,
  #root .signup-submit:focus-visible,
  #root .favorite-star:focus-visible,
  #root .profile-dashboard-edit:focus-visible,
  #root .profile-delete-button:focus-visible,
  #root .review-like-button:focus-visible,
  #root .review-dislike-button:focus-visible,
  #root .comment-like-button:focus-visible,
  #root .comment-dislike-button:focus-visible,
  #root .recommend-button:focus-visible,
  #root .people-more-button:focus-visible,
  #root .person-bio-toggle:focus-visible,
  #root .movie-review-button:focus-visible,
  #root .movie-like-button:focus-visible,
  #root input:focus-visible,
  #root textarea:focus-visible,
  #root select:focus-visible,
  #root a:focus-visible {
    outline: 3px solid rgba(179,141,25,.72);
    outline-offset: 3px;
  }

  /* Destructive action colors stay stable even while pointer hover is active. */
  #root .profile-page .profile-container .profile-delete-page-card button.profile-button.profile-delete-button:disabled {
    border-color: #E5B8AD;
    background-color: #F1EADF;
    background-image: none;
    color: #776F62;
    opacity: 1;
  }
  #root .profile-page .profile-container .profile-delete-page-card button.profile-button.profile-delete-button:not(:disabled),
  #root .profile-page .profile-container .profile-delete-page-card button.profile-button.profile-delete-button:not(:disabled):hover {
    border-color: #E5B8AD;
    background-color: #FFF1EC;
    background-image: none;
    color: #8C3F38;
    opacity: 1;
  }

  /* Fields use a light inset surface and a visible focus ring. */
  #root .signup-field input,
  #root .signup-field textarea,
  #root .profile-edit-page .profile-edit-field input,
  #root .review-title-field input,
  #root .review-content-field textarea,
  #root .review-edit-title,
  #root .review-edit-area textarea,
  #root .all-reviews-search-input,
  #root .movie-search-input {
    border-color: rgba(216,201,159,.84);
    background-color: rgba(255,254,250,.78);
    box-shadow: inset 0 1px 2px rgba(41,40,32,.035), 0 1px 0 rgba(255,255,255,.8);
    transition:
      border-color var(--momo-motion-material),
      box-shadow var(--momo-motion-material),
      background-color var(--momo-motion-material);
  }

  #root .signup-field input:focus,
  #root .signup-field textarea:focus,
  #root .profile-edit-page .profile-edit-field input:focus,
  #root .review-title-field input:focus,
  #root .review-content-field textarea:focus,
  #root .review-edit-title:focus,
  #root .review-edit-area textarea:focus,
  #root .all-reviews-search-input:focus,
  #root .movie-search-input:focus {
    border-color: rgba(179,141,25,.72);
    background-color: rgba(255,255,255,.94);
    box-shadow: 0 0 0 3px rgba(255,212,59,.18), inset 0 1px 2px rgba(41,40,32,.025);
    outline: none;
  }

  /* Route canvases: color belongs to the page, not to a yellow paper texture. */
  #root .home-page {
    border-radius: 26px;
    background:
      radial-gradient(ellipse at 8% 0%, rgba(255,212,59,.13), transparent 36%),
      radial-gradient(ellipse at 92% 18%, rgba(152,166,139,.12), transparent 42%);
  }
  #root .search-page {
    border-radius: 26px;
    background:
      radial-gradient(ellipse at 4% 0%, rgba(128,164,174,.17), transparent 42%),
      radial-gradient(ellipse at 96% 45%, rgba(170,190,183,.13), transparent 40%);
  }
  #root .favorite-page {
    border-radius: 26px;
    background:
      radial-gradient(ellipse at 5% 0%, rgba(117,148,111,.18), transparent 44%),
      radial-gradient(ellipse at 100% 55%, rgba(191,207,179,.2), transparent 48%);
  }
  #root .profile-dashboard,
  #root .profile-edit-page {
    border-radius: 26px;
    background:
      radial-gradient(ellipse at 0% 0%, rgba(143,169,151,.16), transparent 46%),
      radial-gradient(ellipse at 100% 38%, rgba(198,211,202,.18), transparent 48%);
  }
  #root .movie-detail-page {
    border-radius: 26px;
    background:
      radial-gradient(ellipse at 4% 0%, rgba(117,139,145,.15), transparent 42%),
      radial-gradient(ellipse at 96% 36%, rgba(196,203,190,.15), transparent 46%);
  }
  #root .all-reviews-page,
  #root .my-reviews-page {
    border-radius: 26px;
    background:
      radial-gradient(ellipse at 4% 0%, rgba(158,166,184,.15), transparent 44%),
      radial-gradient(ellipse at 96% 34%, rgba(205,190,176,.13), transparent 48%);
  }
  #root .liked-reviews-page {
    border-radius: 26px;
    background:
      radial-gradient(ellipse at 4% 0%, rgba(177,133,128,.15), transparent 44%),
      radial-gradient(ellipse at 96% 34%, rgba(208,179,171,.12), transparent 48%);
  }
  #root .review-detail-page {
    border-radius: 26px;
    background:
      radial-gradient(ellipse at 4% 0%, rgba(156,168,184,.15), transparent 44%),
      radial-gradient(ellipse at 96% 34%, rgba(194,205,197,.14), transparent 48%);
  }

  /* The primary action is still warm MOMO yellow, but it is a translucent glass object. */
  #root .favorite-browse-button,
  #root .all-reviews-search-submit,
  #root .signup-submit,
  #root .review-form-actions button,
  #root .recommend-button,
  #root .profile-edit-submit,
  #root .profile-edit-image-save,
  #root .profile-dashboard-edit,
  #root .profile-button:not(.profile-button-secondary):not(.profile-delete-button) {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.94);
    background:
      linear-gradient(145deg, rgba(255,255,255,.78), rgba(255,241,190,.62) 48%, rgba(255,212,59,.46));
    color: #4D401A;
    box-shadow:
      0 5px 12px rgba(60,49,20,.09),
      0 13px 24px rgba(60,49,20,.07),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(196,157,52,.2);
    -webkit-backdrop-filter: blur(18px) saturate(165%);
    backdrop-filter: blur(18px) saturate(165%);
    transition:
      color var(--momo-motion-material),
      background var(--momo-motion-material),
      border-color var(--momo-motion-material),
      box-shadow var(--momo-motion-material),
      filter var(--momo-motion-material),
      transform var(--momo-motion-press);
  }
  #root .favorite-browse-button::before,
  #root .all-reviews-search-submit::before,
  #root .signup-submit::before,
  #root .review-form-actions button::before,
  #root .recommend-button::before,
  #root .profile-edit-submit::before,
  #root .profile-edit-image-save::before,
  #root .profile-dashboard-edit::before,
  #root .profile-button:not(.profile-button-secondary):not(.profile-delete-button)::before {
    position: absolute;
    inset: 1px 12% auto;
    height: 1px;
    content: "";
    background: linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent);
    pointer-events: none;
  }
  #root .favorite-browse-button:hover:not(:disabled),
  #root .all-reviews-search-submit:hover:not(:disabled),
  #root .signup-submit:hover:not(:disabled),
  #root .review-form-actions button:hover:not(:disabled),
  #root .recommend-button:hover:not(:disabled),
  #root .profile-edit-submit:hover:not(:disabled),
  #root .profile-edit-image-save:hover:not(:disabled),
  #root .profile-dashboard-edit:hover,
  #root .profile-button:not(.profile-button-secondary):not(.profile-delete-button):hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    background:
      linear-gradient(145deg, rgba(255,255,255,.92), rgba(255,246,213,.76) 48%, rgba(255,219,95,.58));
    color: #453811;
    box-shadow:
      0 7px 15px rgba(60,49,20,.1),
      0 17px 28px rgba(60,49,20,.09),
      inset 0 1px 0 rgba(255,255,255,1),
      inset 0 -1px 0 rgba(196,157,52,.24);
    filter: saturate(1.08) brightness(1.02);
    transform: none;
  }

  /* Secondary navigation/actions are clear, cool glass rather than flat cream pills. */
  #root .page-back-link,
  #root .favorite-back-button,
  #root .detail-back-button,
  #root .review-detail-back,
  #root .all-reviews-search-reset,
  #root .review-action-button,
  #root .people-more-button,
  #root .person-bio-toggle,
  #root .profile-edit-cancel,
  #root .profile-image-remove,
  #root .profile-button-secondary,
  #root .all-reviews-pagination button,
  #root .my-reviews-pagination button,
  #root .liked-reviews-pagination button {
    position: relative;
    border: 1px solid rgba(255,255,255,.88);
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(231,239,237,.44));
    color: #465653;
    box-shadow:
      0 4px 10px rgba(37,50,47,.055),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(135,158,151,.13);
    -webkit-backdrop-filter: blur(18px) saturate(155%);
    backdrop-filter: blur(18px) saturate(155%);
  }
  #root .page-back-link:hover,
  #root .favorite-back-button:hover,
  #root .detail-back-button:hover,
  #root .review-detail-back:hover,
  #root .all-reviews-search-reset:hover:not(:disabled),
  #root .review-action-button:hover:not(:disabled),
  #root .people-more-button:hover:not(:disabled),
  #root .person-bio-toggle:hover:not(:disabled),
  #root .profile-edit-cancel:hover:not(:disabled),
  #root .profile-button-secondary:hover:not(:disabled),
  #root .all-reviews-pagination button:hover:not(:disabled),
  #root .my-reviews-pagination button:hover:not(:disabled),
  #root .liked-reviews-pagination button:hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    background: linear-gradient(145deg, rgba(255,255,255,.9), rgba(229,240,237,.66));
    color: #314541;
    box-shadow:
      0 7px 15px rgba(37,50,47,.085),
      inset 0 1px 0 rgba(255,255,255,1);
  }

  /* Like/dislike and delete actions retain distinct meanings inside a glass shell. */
  #root .movie-detail-page .rating-vote-button.is-like,
  #root .reaction-button.selected-like,
  #root .review-like-button,
  #root .comment-like-button {
    border: 1px solid rgba(255,255,255,.92);
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(255,242,190,.56));
    color: #66510F;
    box-shadow: 0 4px 10px rgba(80,63,20,.055), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(16px) saturate(155%);
    backdrop-filter: blur(16px) saturate(155%);
  }
  #root .movie-detail-page .rating-vote-button.is-dislike,
  #root .reaction-button.selected-dislike,
  #root .review-dislike-button,
  #root .comment-dislike-button,
  #root .liked-review-unlike,
  #root .review-action-button.delete {
    border: 1px solid rgba(255,255,255,.92);
    background: linear-gradient(145deg, rgba(255,255,255,.76), rgba(247,229,225,.62));
    color: #84564F;
    box-shadow: 0 4px 10px rgba(76,43,39,.055), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(16px) saturate(155%);
    backdrop-filter: blur(16px) saturate(155%);
  }
  #root .profile-delete-button,
  #root .profile-page .profile-container .profile-delete-page-card button.profile-button.profile-delete-button:not(:disabled),
  #root .profile-page .profile-container .profile-delete-page-card button.profile-button.profile-delete-button:not(:disabled):hover {
    border: 1px solid rgba(255,255,255,.92);
    background: linear-gradient(145deg, rgba(255,255,255,.78), rgba(248,228,223,.66));
    color: #813F39;
    box-shadow: 0 4px 12px rgba(80,42,36,.075), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
    backdrop-filter: blur(16px) saturate(150%);
  }
  #root .profile-delete-button:disabled {
    border: 1px solid rgba(255,255,255,.82);
    background: linear-gradient(145deg, rgba(255,255,255,.64), rgba(237,233,224,.5));
    color: #766E62;
    box-shadow: inset 0 1px rgba(255,255,255,.94);
    opacity: .72;
  }

  /* Film save control: dark optical lens at rest, warm illuminated lens when selected. */
  #root .favorite-star {
    border: 1px solid rgba(255,255,255,.74);
    background: linear-gradient(145deg, rgba(38,43,39,.66), rgba(27,34,31,.42));
    color: rgba(255,255,255,.96);
    box-shadow: 0 7px 18px rgba(16,22,19,.2), inset 0 1px 0 rgba(255,255,255,.38);
    -webkit-backdrop-filter: blur(20px) saturate(165%);
    backdrop-filter: blur(20px) saturate(165%);
  }
  #root .favorite-star.is-active {
    border-color: rgba(255,255,255,.96);
    background: linear-gradient(145deg, rgba(255,255,255,.86), rgba(255,225,125,.72) 55%, rgba(255,212,59,.56));
    color: #4E4019;
    box-shadow: 0 7px 16px rgba(65,49,13,.16), inset 0 1px 0 rgba(255,255,255,1);
  }

  /* The profile activity tiles need legible content above their glass highlight layer. */
  #root .profile-dashboard .profile-activity-item h3,
  #root .profile-dashboard .profile-activity-count,
  #root .profile-dashboard .profile-activity-unit,
  #root .profile-dashboard .profile-activity-number,
  #root .profile-dashboard .profile-activity-footer p,
  #root .profile-dashboard .profile-activity-arrow,
  #root .profile-dashboard .profile-activity-icon {
    visibility: visible;
    opacity: 1;
  }
  #root .profile-dashboard .profile-activity-body,
  #root .profile-dashboard .profile-activity-footer {
    position: relative;
    z-index: 2;
  }

  /* Every page control uses a translucent shell; semantic variants are layered below it. */
  #root .home-page button,
  #root .search-page button,
  #root .favorite-page button,
  #root .profile-dashboard button,
  #root .profile-edit-page button,
  #root .profile-page button,
  #root .movie-detail-page button,
  #root .all-reviews-page button,
  #root .my-reviews-page button,
  #root .liked-reviews-page button,
  #root .review-detail-page button,
  #root .signup-page button {
    border-color: rgba(255,255,255,.9);
    background: linear-gradient(145deg, rgba(255,255,255,.7), rgba(233,241,237,.48));
    color: #465653;
    box-shadow:
      0 4px 10px rgba(37,50,47,.055),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(135,158,151,.12);
    -webkit-backdrop-filter: blur(16px) saturate(155%);
    backdrop-filter: blur(16px) saturate(155%);
    transition:
      background var(--momo-motion-material),
      border-color var(--momo-motion-material),
      color var(--momo-motion-material),
      box-shadow var(--momo-motion-material),
      filter var(--momo-motion-material);
  }
  #root .home-page button:hover:not(:disabled),
  #root .search-page button:hover:not(:disabled),
  #root .favorite-page button:hover:not(:disabled),
  #root .profile-dashboard button:hover:not(:disabled),
  #root .profile-edit-page button:hover:not(:disabled),
  #root .profile-page button:hover:not(:disabled),
  #root .movie-detail-page button:hover:not(:disabled),
  #root .all-reviews-page button:hover:not(:disabled),
  #root .my-reviews-page button:hover:not(:disabled),
  #root .liked-reviews-page button:hover:not(:disabled),
  #root .review-detail-page button:hover:not(:disabled),
  #root .signup-page button:hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    background: linear-gradient(145deg, rgba(255,255,255,.9), rgba(231,241,236,.66));
    color: #314541;
    box-shadow:
      0 7px 15px rgba(37,50,47,.085),
      inset 0 1px 0 rgba(255,255,255,1),
      inset 0 -1px 0 rgba(135,158,151,.14);
    filter: saturate(1.06);
    transform: none;
  }

  /* Primary actions intentionally glow warm; they remain translucent and refractive. */
  #root .favorite-page .favorite-browse-button,
  #root .all-reviews-page .all-reviews-search-submit,
  #root .signup-page .signup-submit,
  #root .movie-detail-page .recommend-button,
  #root .movie-detail-page .movie-review-button,
  #root .movie-detail-page .movie-like-button,
  #root .profile-edit-page .profile-edit-submit,
  #root .profile-edit-page .profile-edit-image-save,
  #root .profile-dashboard .profile-dashboard-edit,
  #root .profile-edit-page .profile-button:not(.profile-button-secondary):not(.profile-delete-button),
  #root .profile-page .profile-button:not(.profile-button-secondary):not(.profile-delete-button),
  #root .movie-detail-page .review-form-actions button {
    border: 1px solid rgba(255,255,255,.94);
    background: linear-gradient(145deg, rgba(255,255,255,.8), rgba(255,242,193,.66) 48%, rgba(255,212,59,.48));
    color: #4D401A;
    box-shadow:
      0 5px 12px rgba(60,49,20,.09),
      0 13px 24px rgba(60,49,20,.07),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(196,157,52,.2);
    -webkit-backdrop-filter: blur(18px) saturate(165%);
    backdrop-filter: blur(18px) saturate(165%);
  }
  #root .favorite-page .favorite-browse-button:hover:not(:disabled),
  #root .all-reviews-page .all-reviews-search-submit:hover:not(:disabled),
  #root .signup-page .signup-submit:hover:not(:disabled),
  #root .movie-detail-page .recommend-button:hover:not(:disabled),
  #root .movie-detail-page .movie-review-button:hover:not(:disabled),
  #root .movie-detail-page .movie-like-button:hover:not(:disabled),
  #root .profile-edit-page .profile-edit-submit:hover:not(:disabled),
  #root .profile-edit-page .profile-edit-image-save:hover:not(:disabled),
  #root .profile-dashboard .profile-dashboard-edit:hover,
  #root .profile-edit-page .profile-button:not(.profile-button-secondary):not(.profile-delete-button):hover:not(:disabled),
  #root .profile-page .profile-button:not(.profile-button-secondary):not(.profile-delete-button):hover:not(:disabled),
  #root .movie-detail-page .review-form-actions button:hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    background: linear-gradient(145deg, rgba(255,255,255,.94), rgba(255,247,218,.8) 48%, rgba(255,219,95,.62));
    color: #453811;
    box-shadow:
      0 8px 17px rgba(60,49,20,.11),
      0 18px 29px rgba(60,49,20,.085),
      inset 0 1px 0 rgba(255,255,255,1),
      inset 0 -1px 0 rgba(196,157,52,.24);
    filter: saturate(1.08) brightness(1.02);
    transform: none;
  }

  /* The review composer is a glass workspace, not a lined memo pad. */
  #root .movie-detail-page .review-write-section {
    border-color: rgba(255,255,255,.88);
    border-radius: 18px;
    background: linear-gradient(140deg, rgba(255,255,255,.64), rgba(235,243,239,.48));
    box-shadow: 0 8px 24px rgba(37,50,47,.055), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
    backdrop-filter: blur(24px) saturate(150%);
  }
  #root .movie-detail-page .review-write-toggle {
    border: 0;
    border-bottom: 1px solid rgba(255,255,255,.66);
    border-radius: 17px 17px 0 0;
    background: linear-gradient(140deg, rgba(255,255,255,.72), rgba(231,240,235,.5));
    color: #344944;
  }
  #root .movie-detail-page .review-write-toggle:hover {
    background: linear-gradient(140deg, rgba(255,255,255,.88), rgba(226,239,232,.7));
  }
  #root .movie-detail-page .review-write-content {
    border-top-color: rgba(255,255,255,.66);
  }

  /* Remove the last analog ruled-paper cues from profile rows and review content. */
  #root .profile-dashboard .profile-user-details {
    border-top-color: rgba(255,255,255,.72);
  }
  #root .profile-dashboard .profile-user-details > div {
    border-left-color: rgba(255,255,255,.72);
  }
  #root .review-detail-page .review-detail-content {
    background: linear-gradient(145deg, rgba(255,255,255,.52), rgba(238,244,240,.38));
    border-color: rgba(255,255,255,.78);
    box-shadow: inset 0 1px rgba(255,255,255,.96);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    backdrop-filter: blur(16px) saturate(140%);
  }

  /* Profile tiles have a visible hierarchy even in loading/empty data states. */
  #root .profile-dashboard .profile-activity-item {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 184px;
    background: linear-gradient(145deg, rgba(255,255,255,.68), rgba(232,241,235,.44));
    border-color: rgba(255,255,255,.9);
    box-shadow:
      0 6px 14px rgba(37,50,47,.055),
      0 15px 28px rgba(37,50,47,.045),
      inset 0 1px rgba(255,255,255,.98);
  }
  #root .profile-dashboard .profile-activity-item[data-tone="writing"] {
    border-left-color: #B99A43;
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(248,240,211,.48));
  }
  #root .profile-dashboard .profile-activity-item[data-tone="liked"] {
    border-left-color: #B98778;
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(245,231,228,.48));
  }
  #root .profile-dashboard .profile-activity-item[data-tone="saved"] {
    border-left-color: #829276;
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(229,239,229,.5));
  }
  #root .profile-dashboard .profile-activity-item h3 { display: block; color: #292820; }
  #root .profile-dashboard .profile-activity-count-row { display: inline-flex; }
  #root .profile-dashboard .profile-activity-footer { display: flex; }
  #root .profile-dashboard .profile-activity-footer p { display: block; color: #514C40; }
  @media (prefers-reduced-motion: reduce) {
    #root .momo-app-header *,
    #root .profile-dashboard *,
    #root .profile-edit-page *,
    #root .favorite-page *,
    #root .movie-detail-page *,
    #root .review-detail-page *,
    #root .all-reviews-page *,
    #root .my-reviews-page *,
    #root .liked-reviews-page *,
    #root .signup-page * {
      scroll-behavior: auto;
      animation-duration: .01ms;
      animation-iteration-count: 1;
      transition-duration: .01ms;
    }
  }
`;

export default MomoMaterialSystemStyles;
