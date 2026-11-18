import { createGlobalStyle } from "styled-components";

/*
 * MOMO material system
 * Shared material rules are applied after legacy page styles in GlobalStyles.js.
 * Page layouts stay in their own style modules; this file owns only surface,
 * colour-field, button, input and motion behavior.
 */
const MomoMaterialSystemStyles = createGlobalStyle`
  :root {
    --momo-glass-blur: 26px;
    --momo-glass-saturation: 165%;
    --momo-glass-edge: rgba(255,255,255,.9);
    --momo-glass-edge-soft: rgba(222,230,223,.72);
    --momo-glass-surface: linear-gradient(138deg, rgba(255,255,255,.68), rgba(244,248,245,.34) 54%, rgba(222,232,225,.24));
    --momo-glass-depth:
      0 2px 5px rgba(34,42,37,.035),
      0 14px 34px rgba(34,42,37,.075),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(207,220,210,.2);
    --momo-glass-depth-hover:
      0 5px 10px rgba(34,42,37,.045),
      0 18px 38px rgba(34,42,37,.1),
      inset 0 1px 0 rgba(255,255,255,1),
      inset 0 -1px 0 rgba(207,220,210,.26);
    --momo-glass-depth-active:
      0 1px 3px rgba(34,42,37,.045),
      inset 0 2px 5px rgba(34,42,37,.075),
      inset 0 1px 0 rgba(255,255,255,.88);
    --momo-glass-button:
      linear-gradient(145deg, rgba(255,255,255,.76), rgba(244,248,245,.42) 54%, rgba(222,232,225,.28)),
      rgba(255,255,255,.16);
    --momo-glass-button-hover:
      linear-gradient(145deg, rgba(255,255,255,.9), rgba(241,248,243,.58) 54%, rgba(218,232,222,.38)),
      rgba(255,255,255,.2);
    --momo-glass-button-primary:
      linear-gradient(140deg, rgba(255,255,255,.82), rgba(255,231,151,.64) 48%, rgba(255,212,59,.36)),
      rgba(255,255,255,.18);
    --momo-glass-button-primary-hover:
      linear-gradient(140deg, rgba(255,255,255,.94), rgba(255,230,132,.72) 48%, rgba(255,212,59,.46)),
      rgba(255,255,255,.22);
    --momo-motion-material: 230ms cubic-bezier(.2,.72,.2,1);
    --momo-motion-press: 100ms cubic-bezier(.2,.7,.2,1);
  }

  /* A neutral canvas. Yellow is reserved for actions and selected states. */
  body {
    background-color: #F5F2EB;
    background-image:
      radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.86), transparent 46rem),
      radial-gradient(ellipse at 92% 16%, rgba(183,200,188,.22), transparent 42rem),
      radial-gradient(ellipse at 8% 88%, rgba(218,211,196,.2), transparent 36rem),
      linear-gradient(140deg, #F5F3EE 0%, #EEF1EC 54%, #F2EFE8 100%);
    background-attachment: fixed;
  }

  /* Route-specific colour fields. These sit behind the glass, not on top of it. */
  #root .momo-app-main > .home-page {
    background:
      radial-gradient(ellipse at 82% 0%, rgba(151,174,159,.22), transparent 35rem),
      radial-gradient(ellipse at 4% 48%, rgba(220,210,187,.2), transparent 31rem);
    border-radius: 26px;
  }
  #root .momo-app-main > .search-page {
    background:
      radial-gradient(ellipse at 5% 0%, rgba(151,177,181,.23), transparent 34rem),
      radial-gradient(ellipse at 96% 58%, rgba(199,211,204,.2), transparent 38rem);
    border-radius: 26px;
  }
  #root .momo-app-main > .favorite-page {
    background:
      radial-gradient(ellipse at 4% 0%, rgba(155,176,139,.24), transparent 34rem),
      radial-gradient(ellipse at 96% 62%, rgba(204,215,194,.19), transparent 40rem);
    border-radius: 26px;
  }
  #root .momo-app-main > .movie-detail-page {
    background:
      radial-gradient(ellipse at 8% 0%, rgba(142,169,158,.21), transparent 36rem),
      radial-gradient(ellipse at 96% 68%, rgba(201,211,194,.18), transparent 40rem);
    border-radius: 26px;
  }
  #root .momo-app-main > .all-reviews-page {
    background:
      radial-gradient(ellipse at 4% 0%, rgba(191,155,143,.19), transparent 34rem),
      radial-gradient(ellipse at 96% 60%, rgba(220,204,190,.2), transparent 40rem);
    border-radius: 26px;
  }
  #root .momo-app-main > .my-reviews-page,
  #root .momo-app-main > .liked-reviews-page {
    background:
      radial-gradient(ellipse at 4% 0%, rgba(183,154,132,.19), transparent 34rem),
      radial-gradient(ellipse at 96% 60%, rgba(219,207,186,.18), transparent 40rem);
    border-radius: 26px;
  }
  #root .momo-app-main > .profile-dashboard,
  #root .momo-app-main > .profile-edit-page,
  #root .momo-app-main > .profile-page {
    background:
      radial-gradient(ellipse at 6% 0%, rgba(195,176,139,.2), transparent 34rem),
      radial-gradient(ellipse at 96% 64%, rgba(208,216,199,.18), transparent 40rem);
    border-radius: 26px;
  }
  #root .momo-app-main > .review-detail-page {
    background:
      radial-gradient(ellipse at 4% 0%, rgba(188,152,143,.2), transparent 34rem),
      radial-gradient(ellipse at 96% 65%, rgba(220,203,192,.18), transparent 40rem);
    border-radius: 26px;
  }
  #root .signup-page {
    background:
      radial-gradient(ellipse at 50% 0%, rgba(198,211,199,.28), transparent 42rem),
      radial-gradient(ellipse at 86% 68%, rgba(224,213,190,.18), transparent 32rem);
  }

  /* Shared header: translucent material with a visible refractive rim. */
  #root .momo-app-header {
    background: linear-gradient(180deg, rgba(255,255,255,.78), rgba(245,248,245,.56));
    border-bottom: 1px solid rgba(255,255,255,.88);
    box-shadow: 0 8px 28px rgba(34,42,37,.065), inset 0 1px 0 rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(32px) saturate(175%);
    backdrop-filter: blur(32px) saturate(175%);
  }
  #root .momo-app-header button {
    border: 1px solid rgba(255,255,255,.9);
    background: var(--momo-glass-button);
    color: #3D4941;
    box-shadow: 0 2px 5px rgba(34,42,37,.045), 0 7px 16px rgba(34,42,37,.065), inset 0 1px 0 rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(20px) saturate(175%);
    backdrop-filter: blur(20px) saturate(175%);
    transition: color var(--momo-motion-material), background var(--momo-motion-material), border-color var(--momo-motion-material), box-shadow var(--momo-motion-material), transform var(--momo-motion-press);
  }
  #root .momo-app-header button:hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    background: var(--momo-glass-button-hover);
    color: #29382F;
    box-shadow: var(--momo-glass-depth-hover);
    transform: none;
  }

  #root .momo-chat-launcher {
    border: 1px solid rgba(255,255,255,.94);
    background: linear-gradient(145deg, rgba(255,255,255,.84), rgba(232,243,235,.56) 54%, rgba(211,231,218,.36));
    color: #3D4C41;
    box-shadow: 0 8px 22px rgba(34,42,37,.12), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px rgba(150,176,156,.16);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    backdrop-filter: blur(24px) saturate(180%);
  }
  #root .momo-chat-launcher:hover {
    border-color: rgba(255,255,255,1);
    background: linear-gradient(145deg, rgba(255,255,255,.96), rgba(226,241,231,.72) 54%, rgba(205,228,213,.48));
    box-shadow: 0 11px 26px rgba(34,42,37,.15), inset 0 1px 0 rgba(255,255,255,1);
    color: #2F4135;
    transform: none;
  }

  #root .momo-app-header nav a {
    border: 1px solid rgba(255,255,255,.54);
    background: linear-gradient(145deg, rgba(255,255,255,.46), rgba(235,242,237,.18));
    color: #465148;
    box-shadow: inset 0 1px rgba(255,255,255,.78);
    -webkit-backdrop-filter: blur(18px) saturate(165%);
    backdrop-filter: blur(18px) saturate(165%);
    transition: color var(--momo-motion-material), background var(--momo-motion-material), border-color var(--momo-motion-material), box-shadow var(--momo-motion-material);
  }
  #root .momo-app-header nav a:hover,
  #root .momo-app-header nav a:focus-visible {
    border-color: rgba(255,255,255,.98);
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(230,240,233,.48));
    color: #29382F;
    box-shadow: 0 5px 13px rgba(34,42,37,.065), inset 0 1px rgba(255,255,255,1);
  }
  #root .momo-app-header nav a.active {
    border-color: rgba(176,194,178,.78);
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(220,235,222,.56));
    color: #34463A;
    box-shadow: 0 3px 10px rgba(34,42,37,.04), inset 0 1px rgba(255,255,255,1);
  }
  #root .momo-app-header .momo-search-form {
    border: 1px solid rgba(255,255,255,.9);
    background: linear-gradient(140deg, rgba(255,255,255,.68), rgba(237,244,239,.36));
    box-shadow: 0 4px 14px rgba(34,42,37,.055), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(24px) saturate(165%);
    backdrop-filter: blur(24px) saturate(165%);
  }
  #root .momo-app-header .momo-search-button {
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 10px;
    color: #46554A;
  }
  #root .momo-app-header .momo-search-dropdown {
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 18px;
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(238,246,240,.56) 58%, rgba(220,233,225,.38));
    box-shadow: 0 20px 46px rgba(34,42,37,.14), inset 0 1px rgba(255,255,255,1);
    -webkit-backdrop-filter: blur(30px) saturate(175%);
    backdrop-filter: blur(30px) saturate(175%);
  }
  #root .momo-app-header .momo-search-result {
    border: 0;
    border-bottom: 1px solid rgba(255,255,255,.74);
    border-radius: 0;
    background: rgba(255,255,255,.12);
    box-shadow: none;
    color: #364239;
    text-align: left;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  #root .momo-app-header .momo-search-result:hover,
  #root .momo-app-header .momo-search-result:focus-visible,
  #root .momo-app-header .momo-search-result.is-active {
    border-color: rgba(255,255,255,.88);
    background: linear-gradient(140deg, rgba(255,255,255,.78), rgba(224,239,228,.56));
    color: #2E4234;
    box-shadow: inset 0 1px rgba(255,255,255,.98);
  }
  #root .momo-app-header .momo-search-form:focus-within {
    border-color: rgba(166,190,171,.92);
    background: linear-gradient(140deg, rgba(255,255,255,.84), rgba(235,245,238,.5));
    box-shadow: 0 0 0 3px rgba(151,177,157,.18), 0 9px 22px rgba(34,42,37,.075), inset 0 1px rgba(255,255,255,1);
  }

  /* Main glass planes. Each keeps its own shape and hierarchy. */
  #root .home-feature-section,
  #root .home-brand-line,
  #root .home-favorites-empty,
  #root .search-page-heading,
  #root .favorite-page-heading,
  #root .favorite-page-empty,
  #root .favorite-page-card,
  #root .profile-dashboard-heading,
  #root .profile-dashboard .profile-card,
  #root .profile-edit-heading,
  #root .profile-edit-card,
  #root .profile-edit-photo-card,
  #root .profile-edit-details,
  #root .profile-delete-page-card,
  #root .all-reviews-heading,
  #root .all-reviews-card,
  #root .all-reviews-search,
  #root .my-reviews-heading,
  #root .my-reviews-card,
  #root .liked-reviews-heading,
  #root .liked-reviews-card,
  #root .movie-detail-page .movie-detail-header,
  #root .movie-detail-page .movie-rating-panel,
  #root .movie-detail-page .detail-content-section,
  #root .movie-detail-page .review-write-section,
  #root .movie-detail-page .detail-review-card,
  #root .review-detail-page .review-detail-card,
  #root .review-detail-page .review-comment-card,
  #root .signup-page .signup-card {
    border-color: var(--momo-glass-edge);
    box-shadow: var(--momo-glass-depth);
    -webkit-backdrop-filter: blur(var(--momo-glass-blur)) saturate(var(--momo-glass-saturation));
    backdrop-filter: blur(var(--momo-glass-blur)) saturate(var(--momo-glass-saturation));
  }

  #root .home-feature-section {
    border-color: rgba(255,255,255,.92);
    -webkit-backdrop-filter: blur(28px) saturate(175%);
    backdrop-filter: blur(28px) saturate(175%);
    background:
      radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.78), transparent 50%),
      linear-gradient(135deg, rgba(255,255,255,.62), rgba(231,241,234,.32) 56%, rgba(255,255,255,.22));
  }
  #root .home-feature-info {
    background: linear-gradient(145deg, rgba(255,255,255,.46), rgba(234,242,235,.2));
  }
  #root .home-feature-visual .recommend-content {
    background: linear-gradient(140deg, rgba(255,255,255,.3), rgba(229,239,232,.14) 55%, rgba(255,255,255,.08)), rgba(23,31,27,.3);
    border-color: rgba(255,255,255,.58);
    box-shadow: 0 18px 48px rgba(0,0,0,.26), inset 0 1px rgba(255,255,255,.68), inset 0 -1px rgba(255,255,255,.12);
    -webkit-backdrop-filter: blur(28px) saturate(175%);
    backdrop-filter: blur(28px) saturate(175%);
  }
  #root .search-page-heading {
    background: linear-gradient(132deg, rgba(255,255,255,.72), rgba(225,239,239,.34) 58%, rgba(255,255,255,.24));
  }
  #root .favorite-page-heading {
    background: linear-gradient(132deg, rgba(255,255,255,.72), rgba(228,238,222,.34) 58%, rgba(255,255,255,.24));
  }
  #root .all-reviews-heading,
  #root .my-reviews-heading,
  #root .liked-reviews-heading {
    background: linear-gradient(132deg, rgba(255,255,255,.74), rgba(239,228,220,.34) 58%, rgba(255,255,255,.22));
  }
  #root .profile-dashboard-heading,
  #root .profile-edit-heading {
    background: linear-gradient(132deg, rgba(255,255,255,.74), rgba(240,233,216,.34) 58%, rgba(255,255,255,.22));
  }
  #root .movie-detail-page .movie-detail-header {
    background:
      radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.78), transparent 48%),
      linear-gradient(135deg, rgba(241,248,243,.68), rgba(212,229,218,.28) 58%, rgba(255,255,255,.2));
    border-color: rgba(255,255,255,.9);
    -webkit-backdrop-filter: blur(32px) saturate(175%);
    backdrop-filter: blur(32px) saturate(175%);
  }
  #root .movie-detail-page .movie-rating-panel,
  #root .movie-detail-page .detail-content-section,
  #root .movie-detail-page .review-write-section,
  #root .movie-detail-page .detail-review-card {
    background: linear-gradient(140deg, rgba(255,255,255,.66), rgba(244,248,245,.32) 58%, rgba(221,233,225,.24));
  }
  #root .review-detail-page .review-detail-card,
  #root .review-detail-page .review-comment-card {
    background: linear-gradient(140deg, rgba(255,255,255,.68), rgba(247,241,237,.3) 58%, rgba(229,220,213,.22));
  }
  #root .profile-dashboard .profile-card,
  #root .profile-edit-card,
  #root .profile-edit-photo-card,
  #root .profile-edit-details,
  #root .all-reviews-card,
  #root .my-reviews-card,
  #root .liked-reviews-card,
  #root .favorite-page-empty,
  #root .profile-delete-page-card,
  #root .signup-page .signup-card {
    background: linear-gradient(140deg, rgba(255,255,255,.68), rgba(245,248,245,.32) 58%, rgba(224,233,226,.22));
  }

  /* Compact cards also need transparency, a highlight rim and real depth. */
  #root .home-movie-card,
  #root .search-page .search-movie-card,
  #root .favorite-page-card,
  #root .profile-activity-item,
  #root .my-review-item,
  #root .liked-review-item,
  #root .all-reviews-mobile-item,
  #root .person-chip,
  #root .review-detail-movie,
  #root .review-comment-item {
    border-color: rgba(255,255,255,.84);
    background: linear-gradient(145deg, rgba(255,255,255,.58), rgba(239,246,241,.28) 58%, rgba(220,232,223,.22));
    box-shadow: 0 4px 12px rgba(34,42,37,.045), 0 12px 26px rgba(34,42,37,.06), inset 0 1px 0 rgba(255,255,255,.96);
    -webkit-backdrop-filter: blur(22px) saturate(160%);
    backdrop-filter: blur(22px) saturate(160%);
  }
  #root .home-movie-card:hover,
  #root .search-page .search-movie-card:hover,
  #root .favorite-page-card:hover,
  #root .profile-activity-item:hover,
  #root .my-review-item:hover,
  #root .liked-review-item:hover,
  #root .all-reviews-mobile-item:hover,
  #root .person-chip:hover {
    border-color: rgba(255,255,255,.98);
    background: linear-gradient(145deg, rgba(255,255,255,.76), rgba(237,246,239,.4) 58%, rgba(216,232,220,.3));
    box-shadow: var(--momo-glass-depth-hover);
    filter: saturate(1.045);
    transform: none;
  }

  /* Poster frame optics. Images do not jump when hovered. */
  #root .momo-home-poster-frame,
  #root .search-poster-frame,
  #root .favorite-page-poster,
  #root .movie-detail-poster {
    border: 1px solid rgba(255,255,255,.9);
    box-shadow: 0 8px 20px rgba(34,42,37,.12), inset 0 1px rgba(255,255,255,.9);
  }
  #root .favorite-page-poster:hover img,
  #root .momo-home-poster-frame:hover img {
    transform: none;
    filter: saturate(1.06) contrast(1.02);
  }
  #root .favorite-page-poster .favorite-star,
  #root .momo-home-poster-frame .favorite-star {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 5;
    width: 40px;
    height: 40px;
    padding: 0;
  }

  /* One consistent glass treatment for all controls inside every app route. */
  #root .momo-app-main button,
  #root .signup-page button {
    appearance: none;
    border: 1px solid rgba(255,255,255,.9);
    background: var(--momo-glass-button);
    color: #3D4941;
    box-shadow:
      0 2px 5px rgba(34,42,37,.045),
      0 7px 16px rgba(34,42,37,.065),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(207,220,210,.22);
    -webkit-backdrop-filter: blur(20px) saturate(175%);
    backdrop-filter: blur(20px) saturate(175%);
    transition:
      color var(--momo-motion-material),
      border-color var(--momo-motion-material),
      background var(--momo-motion-material),
      box-shadow var(--momo-motion-material),
      filter var(--momo-motion-material),
      transform var(--momo-motion-press);
  }
  #root .momo-app-main button:hover:not(:disabled),
  #root .signup-page button:hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    background: var(--momo-glass-button-hover);
    color: #29382F;
    box-shadow: var(--momo-glass-depth-hover);
    filter: saturate(1.1) brightness(1.02);
    transform: none;
  }
  #root .momo-app-main button:active:not(:disabled),
  #root .signup-page button:active:not(:disabled) {
    background: linear-gradient(145deg, rgba(234,242,236,.74), rgba(214,228,218,.48));
    box-shadow: var(--momo-glass-depth-active);
    filter: none;
    transform: scale(.985);
    transition-duration: var(--momo-motion-press);
  }
  #root .momo-app-main button:focus-visible,
  #root .signup-page button:focus-visible,
  #root .momo-app-header button:focus-visible,
  #root .momo-app-header a:focus-visible {
    outline: 3px solid rgba(94,125,104,.56);
    outline-offset: 3px;
  }
  #root .momo-app-main button:disabled,
  #root .signup-page button:disabled {
    opacity: .58;
    cursor: not-allowed;
    filter: saturate(.72);
  }

  /* Primary actions: yellow-tinted translucent glass, not opaque yellow buttons. */
  #root .momo-app-main .review-form-actions button,
  #root .momo-app-main .signup-submit,
  #root .momo-app-main .all-reviews-search-submit,
  #root .momo-app-main .favorite-browse-button,
  #root .momo-app-main .recommend-button,
  #root .momo-app-main .profile-edit-submit,
  #root .momo-app-main .profile-edit-image-save,
  #root .momo-app-main .home-favorites-more,
  #root .signup-page .signup-submit {
    border: 1px solid rgba(255,255,255,.94);
    background: var(--momo-glass-button-primary);
    color: #4D421F;
    box-shadow: 0 3px 8px rgba(92,76,29,.075), 0 9px 19px rgba(92,76,29,.09), inset 0 1px 0 rgba(255,255,255,.98), inset 0 -1px rgba(214,180,63,.18);
    -webkit-backdrop-filter: blur(22px) saturate(175%);
    backdrop-filter: blur(22px) saturate(175%);
  }
  #root .momo-app-main .review-form-actions button:hover:not(:disabled),
  #root .momo-app-main .signup-submit:hover:not(:disabled),
  #root .momo-app-main .all-reviews-search-submit:hover:not(:disabled),
  #root .momo-app-main .favorite-browse-button:hover:not(:disabled),
  #root .momo-app-main .recommend-button:hover:not(:disabled),
  #root .momo-app-main .profile-edit-submit:hover:not(:disabled),
  #root .momo-app-main .profile-edit-image-save:hover:not(:disabled),
  #root .momo-app-main .home-favorites-more:hover:not(:disabled),
  #root .signup-page .signup-submit:hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    background: var(--momo-glass-button-primary-hover);
    box-shadow: 0 6px 12px rgba(92,76,29,.085), 0 15px 27px rgba(92,76,29,.12), inset 0 1px 0 rgba(255,255,255,1);
    color: #3F3519;
  }

  /* Text-link controls have the same refractive surface as buttons. */
  #root .momo-app-main .page-back-link,
  #root .momo-app-main .detail-back-button,
  #root .momo-app-main .favorite-back-button,
  #root .momo-app-main .review-detail-back {
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 999px;
    background: var(--momo-glass-button);
    color: #465148;
    box-shadow: 0 3px 8px rgba(34,42,37,.045), 0 7px 15px rgba(34,42,37,.055), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(20px) saturate(170%);
    backdrop-filter: blur(20px) saturate(170%);
  }
  #root .momo-app-main .page-back-link:hover,
  #root .momo-app-main .detail-back-button:hover,
  #root .momo-app-main .favorite-back-button:hover,
  #root .momo-app-main .review-detail-back:hover {
    border-color: rgba(255,255,255,1);
    background: var(--momo-glass-button-hover);
    box-shadow: var(--momo-glass-depth-hover);
  }

  /* Selected, destructive and saved states use tinted glass without hiding depth. */
  #root .momo-app-main .selected-like,
  #root .momo-app-main .rating-vote-button.is-like.selected-like,
  #root .momo-app-main .all-reviews-pagination button.active,
  #root .momo-app-main .my-reviews-pagination button.active,
  #root .momo-app-main .liked-reviews-pagination button.active {
    border-color: rgba(190,162,82,.74);
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(255,228,141,.54) 58%, rgba(255,212,59,.28));
    color: #5A4815;
    box-shadow: 0 4px 10px rgba(92,76,29,.075), inset 0 1px rgba(255,255,255,1);
  }
  #root .momo-app-main .selected-dislike,
  #root .momo-app-main .rating-vote-button.is-dislike.selected-dislike {
    border-color: rgba(190,132,121,.66);
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(247,222,215,.52) 58%, rgba(228,184,171,.24));
    color: #814F49;
    box-shadow: 0 4px 10px rgba(97,53,47,.06), inset 0 1px rgba(255,255,255,1);
  }
  #root .momo-app-main .profile-delete-button,
  #root .momo-app-main .review-action-button.delete,
  #root .momo-app-main .liked-review-unlike,
  #root .momo-app-main .review-comment-actions .delete {
    border-color: rgba(221,171,160,.78);
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(250,232,226,.5) 58%, rgba(229,184,173,.24));
    color: #8C5149;
    box-shadow: 0 3px 8px rgba(98,55,47,.045), inset 0 1px rgba(255,255,255,.98);
  }
  #root .momo-app-main .profile-delete-button:hover:not(:disabled),
  #root .momo-app-main .review-action-button.delete:hover:not(:disabled),
  #root .momo-app-main .liked-review-unlike:hover:not(:disabled),
  #root .momo-app-main .review-comment-actions .delete:hover:not(:disabled) {
    border-color: rgba(212,152,139,.9);
    background: linear-gradient(145deg, rgba(255,255,255,.92), rgba(250,226,219,.7));
    color: #773D37;
  }
  #root .momo-app-main .favorite-star {
    border: 1px solid rgba(255,255,255,.72);
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(32,40,34,.58), rgba(31,37,32,.34));
    color: rgba(255,255,255,.94);
    box-shadow: 0 6px 16px rgba(0,0,0,.18), inset 0 1px rgba(255,255,255,.38);
    -webkit-backdrop-filter: blur(20px) saturate(175%);
    backdrop-filter: blur(20px) saturate(175%);
  }
  #root .momo-app-main .favorite-star:hover:not(:disabled) {
    border-color: rgba(255,255,255,.98);
    background: linear-gradient(145deg, rgba(39,49,41,.72), rgba(31,37,32,.46));
    color: #fff;
    box-shadow: 0 8px 19px rgba(0,0,0,.2), inset 0 1px rgba(255,255,255,.52);
  }
  #root .momo-app-main .favorite-star.is-active {
    border-color: rgba(255,255,255,.95);
    background: linear-gradient(145deg, rgba(255,255,255,.8), rgba(255,225,124,.68) 58%, rgba(255,212,59,.4));
    color: #66510F;
    box-shadow: 0 5px 15px rgba(67,53,22,.16), inset 0 1px rgba(255,255,255,1);
  }

  /* Rating and review reactions keep their semantic tint, with glass translucency. */
  #root .momo-app-main .movie-detail-page .rating-vote-button.is-like,
  #root .momo-app-main .review-detail-page .review-like-button,
  #root .momo-app-main .review-detail-page .comment-like-button {
    border: 1px solid rgba(255,255,255,.94);
    background: linear-gradient(145deg, rgba(255,255,255,.8), rgba(255,239,184,.54) 58%, rgba(255,212,59,.22));
    color: #66510F;
    box-shadow: 0 5px 12px rgba(75,59,16,.06), inset 0 1px 0 rgba(255,255,255,1);
    -webkit-backdrop-filter: blur(18px) saturate(165%);
    backdrop-filter: blur(18px) saturate(165%);
  }
  #root .momo-app-main .movie-detail-page .rating-vote-button.is-dislike,
  #root .momo-app-main .review-detail-page .review-dislike-button,
  #root .momo-app-main .review-detail-page .comment-dislike-button {
    border: 1px solid rgba(255,255,255,.94);
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(246,228,225,.56) 58%, rgba(228,184,171,.22));
    color: #84564F;
    box-shadow: 0 5px 12px rgba(76,43,39,.055), inset 0 1px 0 rgba(255,255,255,1);
    -webkit-backdrop-filter: blur(18px) saturate(165%);
    backdrop-filter: blur(18px) saturate(165%);
  }
  #root .momo-app-main .rating-vote-button:hover:not(:disabled),
  #root .momo-app-main .review-like-button:hover:not(:disabled),
  #root .momo-app-main .review-dislike-button:hover:not(:disabled),
  #root .momo-app-main .comment-like-button:hover:not(:disabled),
  #root .momo-app-main .comment-dislike-button:hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    filter: saturate(1.08);
    box-shadow: 0 8px 16px rgba(50,55,47,.09), inset 0 1px 0 rgba(255,255,255,1);
    transform: none;
  }

  /* Fields are frosted too; placeholder and typed values remain distinct. */
  #root .momo-app-main input:not([type="checkbox"]):not([type="radio"]),
  #root .momo-app-main textarea,
  #root .momo-app-main select,
  #root .momo-app-header .momo-search-input {
    border-color: rgba(212,222,214,.9);
    background: linear-gradient(145deg, rgba(255,255,255,.7), rgba(239,246,241,.36));
    color: #303A33;
    box-shadow: inset 0 1px 2px rgba(34,42,37,.035), 0 1px 0 rgba(255,255,255,.86);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
    backdrop-filter: blur(16px) saturate(150%);
  }
  #root .momo-app-main input:not([type="checkbox"]):not([type="radio"]):focus,
  #root .momo-app-main textarea:focus,
  #root .momo-app-main select:focus,
  #root .momo-app-header .momo-search-input:focus {
    border-color: rgba(131,160,139,.82);
    background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(236,245,239,.55));
    box-shadow: 0 0 0 3px rgba(137,170,145,.16), inset 0 1px 2px rgba(34,42,37,.025);
    outline: none;
  }
  #root .momo-app-main input::placeholder,
  #root .momo-app-main textarea::placeholder,
  #root .momo-app-header .momo-search-input::placeholder {
    color: #777D73;
  }

  /* Review copy is a clean reading surface — no ruled-paper or red margin lines. */
  #root .review-detail-page .review-detail-content {
    border: 1px solid rgba(255,255,255,.86);
    border-radius: 15px;
    background: linear-gradient(140deg, rgba(255,255,255,.6), rgba(242,247,243,.32) 58%, rgba(222,233,225,.22));
    color: #353D36;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.96), 0 8px 20px rgba(34,42,37,.045);
    -webkit-backdrop-filter: blur(22px) saturate(155%);
    backdrop-filter: blur(22px) saturate(155%);
  }
  #root .review-detail-page .review-detail-movie {
    border: 1px solid rgba(255,255,255,.88);
    background: linear-gradient(145deg, rgba(255,255,255,.64), rgba(238,245,240,.32));
    box-shadow: 0 6px 16px rgba(34,42,37,.05), inset 0 1px rgba(255,255,255,.96);
    -webkit-backdrop-filter: blur(22px) saturate(155%);
    backdrop-filter: blur(22px) saturate(155%);
  }

  /* Footer is a quiet translucent panel, not a graph-paper memo. */
  #root .momo-app-footer {
    border-top-color: rgba(255,255,255,.86);
    background: linear-gradient(145deg, rgba(255,255,255,.68), rgba(239,244,239,.42) 58%, rgba(225,232,225,.34));
    box-shadow: 0 -8px 26px rgba(34,42,37,.045), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(28px) saturate(155%);
    backdrop-filter: blur(28px) saturate(155%);
  }
  #root .momo-app-footer::before { display: none; }

  @media (max-width: 700px) {
    #root .momo-app-main > .home-page,
    #root .momo-app-main > .search-page,
    #root .momo-app-main > .favorite-page,
    #root .momo-app-main > .movie-detail-page,
    #root .momo-app-main > .all-reviews-page,
    #root .momo-app-main > .my-reviews-page,
    #root .momo-app-main > .liked-reviews-page,
    #root .momo-app-main > .profile-dashboard,
    #root .momo-app-main > .profile-edit-page,
    #root .momo-app-main > .review-detail-page {
      border-radius: 18px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #root .momo-app-main *,
    #root .momo-app-header *,
    #root footer * {
      scroll-behavior: auto;
      animation-duration: .01ms;
      animation-iteration-count: 1;
      transition-duration: .01ms;
    }
  }
`;

export default MomoMaterialSystemStyles;
