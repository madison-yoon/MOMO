import { createGlobalStyle } from "styled-components";

/*
 * MOMO Product Experience
 * Shared visual language for every route: translucent surfaces, cinematic depth,
 * restrained motion, clear content contrast, and responsive layouts.
 */
const ProductExperienceStyles = createGlobalStyle`
  :root {
    --momo-glass-panel: rgba(255, 254, 250, .72);
    --momo-glass-strong: rgba(255, 254, 250, .86);
    --momo-glass-stroke: rgba(255, 255, 255, .94);
    --momo-glass-shadow: 0 16px 42px rgba(53, 43, 24, .09), inset 0 1px rgba(255,255,255,.96);
    --momo-depth-shadow: 0 22px 52px rgba(53, 43, 24, .13);
    --momo-ease-out: cubic-bezier(.2,.72,.2,1);
  }

  @keyframes momo-surface-in {
    from { opacity: 0; transform: translate3d(0, 12px, 0) scale(.992); }
    to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes momo-soft-glow {
    0%, 100% { opacity: .35; transform: scale(.96); }
    50% { opacity: .72; transform: scale(1.04); }
  }
  @keyframes momo-sheen {
    from { transform: translateX(-130%); }
    to { transform: translateX(130%); }
  }

  /* All route-level surfaces */
  .movie-detail-page, .all-reviews-page, .review-detail-page,
  .profile-page, .favorite-page, .my-reviews-page, .liked-reviews-page,
  .signup-page {
    animation: momo-surface-in .48s var(--momo-ease-out) both;
  }

  /* Navigation and shared controls */
  button, a, input, textarea, select {
    -webkit-tap-highlight-color: transparent;
  }
  button:not(:disabled), a {
    transition-timing-function: var(--momo-ease-out);
  }
  button:not(:disabled):active {
    transform: translateY(1px) scale(.985);
  }
  :where(.profile-button, .favorite-back-button, .favorite-browse-button,
    .review-action-button, .review-detail-back, .detail-back-button,
    .all-reviews-pagination button, .my-reviews-pagination button,
    .liked-reviews-pagination button, .all-reviews-search-submit,
    .all-reviews-search-reset, .review-form-actions button,
    .signup-submit, .recommend-button) {
    position: relative;
    overflow: hidden;
    transition: transform 180ms var(--momo-ease-out), box-shadow 180ms ease,
      background 180ms ease, border-color 180ms ease;
  }
  :where(.profile-button, .favorite-back-button, .favorite-browse-button,
    .review-action-button, .review-detail-back, .detail-back-button,
    .all-reviews-pagination button, .my-reviews-pagination button,
    .liked-reviews-pagination button, .all-reviews-search-submit,
    .all-reviews-search-reset, .review-form-actions button,
    .signup-submit, .recommend-button)::after {
    position: absolute;
    inset: 0;
    content: "";
    pointer-events: none;
    background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,.22) 48%, transparent 70%);
    transform: translateX(-130%);
    transition: transform .65s var(--momo-ease-out);
  }
  :where(.profile-button, .favorite-back-button, .favorite-browse-button,
    .review-action-button, .review-detail-back, .detail-back-button,
    .all-reviews-pagination button, .my-reviews-pagination button,
    .liked-reviews-pagination button, .all-reviews-search-submit,
    .all-reviews-search-reset, .review-form-actions button,
    .signup-submit, .recommend-button):hover::after {
    transform: translateX(130%);
  }

  /* Movie detail and person detail */
  .movie-detail-page { max-width: 1240px; }
  .movie-detail-header {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--momo-glass-stroke);
    background:
      radial-gradient(circle at 100% 0%, rgba(255,212,59,.16), transparent 35%),
      linear-gradient(140deg, rgba(255,255,255,.86), rgba(255,250,236,.72));
    box-shadow: var(--momo-glass-shadow);
    backdrop-filter: blur(14px) saturate(135%);
    animation: momo-surface-in .55s var(--momo-ease-out) both;
  }
  .movie-detail-header::after {
    position: absolute; inset: 0; content: "";
    pointer-events: none;
    background: linear-gradient(115deg, rgba(255,255,255,.2), transparent 42%);
  }
  .movie-detail-poster { box-shadow: 0 20px 42px rgba(31,26,17,.2); transition: transform 350ms var(--momo-ease-out), box-shadow 350ms ease; }
  .movie-detail-poster:hover { transform: translateY(-4px) rotate(-.5deg); box-shadow: 0 26px 48px rgba(31,26,17,.25); }
  .movie-detail-info { position: relative; z-index: 1; }
  .movie-rating-panel {
    border: 1px solid rgba(255,255,255,.95);
    background: linear-gradient(135deg, rgba(255,255,255,.78), rgba(255,247,218,.72));
    box-shadow: 0 10px 28px rgba(55,44,20,.07), inset 0 1px rgba(255,255,255,.9);
    backdrop-filter: blur(12px);
  }
  .detail-content-section {
    border: 1px solid rgba(255,255,255,.92);
    background: rgba(255,254,250,.78);
    box-shadow: 0 10px 28px rgba(53,43,24,.055);
    backdrop-filter: blur(12px);
    animation: momo-surface-in .5s var(--momo-ease-out) both;
  }
  .detail-content-section:nth-of-type(2) { animation-delay: 60ms; }
  .detail-content-section:nth-of-type(3) { animation-delay: 120ms; }
  .detail-content-section:nth-of-type(4) { animation-delay: 180ms; }
  .person-chip {
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(255,255,255,.82), rgba(255,250,236,.72));
    box-shadow: 0 4px 12px rgba(53,43,24,.045);
    transition: transform 180ms var(--momo-ease-out), box-shadow 180ms ease, background 180ms ease;
  }
  .person-chip:hover { transform: translateY(-2px); box-shadow: 0 9px 18px rgba(53,43,24,.1); }
  .filmography-item { transition: transform 180ms var(--momo-ease-out), background 180ms ease; }
  .filmography-item:hover { transform: translateX(4px); background: rgba(255,255,255,.65); }

  /* Search route */
  .momo-search-area { position: relative; z-index: 20; }
  .momo-search-form {
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 999px;
    background: rgba(255,254,250,.7);
    box-shadow: 0 8px 24px rgba(53,43,24,.07), inset 0 1px rgba(255,255,255,.96);
    backdrop-filter: blur(18px) saturate(150%);
    transition: box-shadow 220ms ease, border-color 220ms ease, transform 220ms var(--momo-ease-out);
  }
  .momo-search-form:focus-within { transform: translateY(-2px); border-color: rgba(205,166,44,.6); box-shadow: 0 0 0 4px rgba(255,212,59,.16), 0 16px 32px rgba(53,43,24,.1); }
  .momo-search-dropdown {
    border: 1px solid rgba(255,255,255,.96);
    background: rgba(255,254,250,.84);
    box-shadow: 0 22px 54px rgba(53,43,24,.16), inset 0 1px rgba(255,255,255,.96);
    backdrop-filter: blur(24px) saturate(155%);
    animation: momo-surface-in .2s var(--momo-ease-out) both;
  }
  .momo-search-result { transition: background 160ms ease, padding 160ms ease; }
  .momo-search-result:hover { background: rgba(255,250,236,.95); }

  /* Search page styled-components are covered through their stable element roles */
  .search-page input, main > input[type="search"] {
    border-color: var(--momo-border-strong);
    background: rgba(255,254,250,.76);
    box-shadow: 0 8px 22px rgba(53,43,24,.055), inset 0 1px rgba(255,255,255,.92);
    backdrop-filter: blur(14px);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  }
  .search-page input:focus, main > input[type="search"]:focus {
    transform: translateY(-1px);
    border-color: rgba(205,166,44,.75);
    box-shadow: 0 0 0 4px rgba(255,212,59,.16), 0 12px 28px rgba(53,43,24,.08);
  }

  /* Reviews: writing paper, glass toolbars, clear readable rows */
  .all-reviews-heading, .my-reviews-heading, .liked-reviews-heading, .favorite-page-heading {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--momo-glass-stroke);
    background:
      radial-gradient(circle at 95% 0%, rgba(255,212,59,.2), transparent 34%),
      linear-gradient(135deg, rgba(255,255,255,.84), rgba(255,250,236,.72));
    box-shadow: var(--momo-glass-shadow);
    backdrop-filter: blur(14px) saturate(140%);
  }
  .all-reviews-heading::after, .my-reviews-heading::after,
  .liked-reviews-heading::after, .favorite-page-heading::after {
    position: absolute; right: -44px; top: -100px; width: 210px; height: 210px;
    border: 1px solid rgba(193,154,37,.2); border-radius: 50%;
    box-shadow: 0 0 0 18px rgba(193,154,37,.04), 0 0 0 40px rgba(193,154,37,.025);
    content: ""; pointer-events: none;
  }
  .all-reviews-card, .my-reviews-card, .liked-reviews-card,
  .profile-card, .review-detail-card, .review-comment-card {
    border: 1px solid rgba(255,255,255,.94);
    background: rgba(255,254,250,.8);
    box-shadow: 0 12px 34px rgba(53,43,24,.065), inset 0 1px rgba(255,255,255,.9);
    backdrop-filter: blur(14px) saturate(135%);
    transition: box-shadow 240ms ease, transform 240ms var(--momo-ease-out);
  }
  .all-reviews-table tbody tr, .my-review-item, .liked-review-item,
  .all-reviews-mobile-item, .review-comment-item {
    transition: background 180ms ease, transform 180ms var(--momo-ease-out);
  }
  .all-reviews-table tbody tr:hover, .my-review-item:hover,
  .liked-review-item:hover, .all-reviews-mobile-item:hover,
  .review-comment-item:hover { background: rgba(255,250,236,.82); }
  .all-review-poster, .my-review-poster, .liked-review-poster {
    overflow: hidden; border-radius: 9px; box-shadow: 0 6px 16px rgba(43,35,21,.12);
    transition: transform 240ms var(--momo-ease-out), box-shadow 240ms ease;
  }
  .all-reviews-table tr:hover .all-review-poster,
  .my-review-item:hover .my-review-poster,
  .liked-review-item:hover .liked-review-poster { transform: translateY(-3px) rotate(-1deg); box-shadow: 0 12px 24px rgba(43,35,21,.18); }
  .review-detail-card { overflow: hidden; }
  .review-detail-top { border-bottom-color: rgba(177,157,111,.3); }
  .review-detail-content {
    position: relative;
    border: 1px solid #E9DFC5;
    background:
      repeating-linear-gradient(to bottom, rgba(255,250,236,.96) 0, rgba(255,250,236,.96) 31px, rgba(226,214,187,.32) 32px);
    box-shadow: inset 0 1px rgba(255,255,255,.8);
  }
  .review-detail-content-section { border: 1px solid rgba(255,255,255,.92); border-radius: 15px; background: rgba(255,254,250,.78); box-shadow: 0 10px 28px rgba(53,43,24,.055); }
  .review-comment-form {
    border: 1px solid rgba(255,255,255,.92);
    border-radius: 14px;
    background: rgba(255,254,250,.75);
    box-shadow: inset 0 1px rgba(255,255,255,.9);
    backdrop-filter: blur(12px);
  }
  .review-comment-item { border-radius: 12px; }
  .review-comment-item:hover { transform: translateX(2px); }
  .review-write-section {
    border: 1px solid rgba(255,255,255,.94);
    background: linear-gradient(140deg, rgba(255,255,255,.82), rgba(255,250,236,.8));
    box-shadow: var(--momo-glass-shadow);
    backdrop-filter: blur(12px);
  }
  .review-write-toggle { background: transparent; transition: background 180ms ease; }
  .review-write-toggle:hover { background: rgba(255,212,59,.12); }
  .review-write-content { border-top-color: rgba(177,157,111,.3); }
  .review-title-field input, .review-content-field textarea,
  .review-edit-title, .review-edit-area textarea,
  .review-comment-form textarea {
    background: rgba(255,255,255,.84);
    border-color: rgba(201,188,160,.72);
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  .review-title-field input:focus, .review-content-field textarea:focus,
  .review-edit-title:focus, .review-edit-area textarea:focus,
  .review-comment-form textarea:focus {
    background: #fff;
    border-color: rgba(205,166,44,.8);
    box-shadow: 0 0 0 4px rgba(255,212,59,.16);
  }
  .review-action-button:hover, .review-detail-back:hover, .detail-back-button:hover {
    transform: translateY(-2px); box-shadow: 0 8px 18px rgba(53,43,24,.09);
  }

  /* Account and profile */
  .signup-page { max-width: 760px; padding-top: clamp(28px,5vw,58px); }
  .signup-wrapper { gap: 20px; }
  .signup-brand { display: flex; justify-content: center; margin-bottom: 4px; }
  .signup-brand img { width: auto; max-width: 190px; height: 44px; object-fit: contain; }
  .signup-card {
    position: relative;
    overflow: hidden;
    padding: clamp(26px,4vw,44px);
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 22px;
    background:
      radial-gradient(circle at 100% 0%, rgba(255,212,59,.19), transparent 35%),
      linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,250,236,.76));
    box-shadow: 0 22px 58px rgba(53,43,24,.12), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(18px) saturate(140%);
    animation: momo-surface-in .6s var(--momo-ease-out) both;
  }
  .signup-card::after {
    position: absolute; right: -82px; bottom: -126px; width: 260px; height: 260px;
    border: 1px solid rgba(193,154,37,.18); border-radius: 50%;
    box-shadow: 0 0 0 22px rgba(193,154,37,.035), 0 0 0 48px rgba(193,154,37,.02);
    content: ""; pointer-events: none;
  }
  .signup-card-heading, .signup-card form { position: relative; z-index: 1; }
  .signup-card-heading h1 { font-size: clamp(26px,3.2vw,36px); letter-spacing: -.045em; line-height: 1.28; }
  .signup-note-label { border-color: rgba(177,157,111,.34); background: rgba(255,255,255,.48); }
  .signup-field { margin-bottom: 17px; }
  .signup-field input {
    min-height: 48px; border: 1px solid rgba(201,188,160,.72); border-radius: 11px;
    background: rgba(255,255,255,.84); transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  }
  .signup-field input:focus { transform: translateY(-1px); border-color: rgba(205,166,44,.8); box-shadow: 0 0 0 4px rgba(255,212,59,.16); }
  .signup-submit {
    min-height: 50px; border-radius: 11px; box-shadow: 0 8px 18px rgba(173,132,13,.2);
    transition: transform 180ms var(--momo-ease-out), box-shadow 180ms ease;
  }
  .signup-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 13px 24px rgba(173,132,13,.26); }
  .signup-footer { border-top-color: rgba(177,157,111,.3); }
  .signup-footer a { color: var(--momo-link); font-weight: 800; }
  .signup-bottom-caption { letter-spacing: .18em; }

  .profile-page { max-width: 1120px; }
  .profile-heading { margin-bottom: 22px; }
  .profile-heading h1 { letter-spacing: -.045em; }
  .profile-card { border-radius: 18px; }
  .profile-user { padding: 22px; border-radius: 14px; background: linear-gradient(135deg, rgba(255,255,255,.82), rgba(255,250,236,.72)); border: 1px solid rgba(255,255,255,.94); }
  .profile-avatar { box-shadow: 0 10px 22px rgba(53,43,24,.12); }
  .profile-activity-item {
    position: relative; overflow: hidden;
    border: 1px solid rgba(255,255,255,.94);
    background: linear-gradient(145deg, rgba(255,255,255,.86), rgba(255,250,236,.76));
    box-shadow: 0 8px 22px rgba(53,43,24,.06), inset 0 1px rgba(255,255,255,.95);
    transition: transform 220ms var(--momo-ease-out), box-shadow 220ms ease;
  }
  .profile-activity-item:hover { transform: translateY(-5px); box-shadow: 0 17px 32px rgba(53,43,24,.12); }
  .profile-activity-icon { transition: transform 240ms var(--momo-ease-out); }
  .profile-activity-item:hover .profile-activity-icon { transform: scale(1.1) rotate(-5deg); }
  .profile-form input, .profile-form textarea, .profile-delete-page-card input {
    min-height: 46px; border-radius: 10px; border: 1px solid rgba(201,188,160,.72);
    background: rgba(255,255,255,.84);
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  .profile-form input:focus, .profile-form textarea:focus, .profile-delete-page-card input:focus {
    background: #fff; border-color: rgba(205,166,44,.8);
    box-shadow: 0 0 0 4px rgba(255,212,59,.16);
  }
  .profile-image-preview {
    border: 1px solid rgba(255,255,255,.94);
    box-shadow: 0 12px 26px rgba(53,43,24,.12);
    transition: transform 240ms var(--momo-ease-out), box-shadow 240ms ease;
  }
  .profile-image-preview:hover { transform: translateY(-3px) rotate(-1deg); box-shadow: 0 18px 34px rgba(53,43,24,.16); }
  .profile-image-buttons button { border-radius: 9px; transition: transform 180ms var(--momo-ease-out), box-shadow 180ms ease; }
  .profile-image-buttons button:hover { transform: translateY(-2px); }

  /* Favorites: saved-state feedback is immediate but restrained. */
  .favorite-star {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(255,255,255,.86);
    border-radius: 50%;
    background: rgba(255,254,250,.78);
    box-shadow: 0 7px 18px rgba(36,29,17,.16), inset 0 1px rgba(255,255,255,.95);
    backdrop-filter: blur(14px);
    transition: transform 200ms var(--momo-ease-out), background 200ms ease, box-shadow 200ms ease;
  }
  .favorite-star:hover { transform: translateY(-2px) scale(1.07); box-shadow: 0 11px 24px rgba(36,29,17,.2); }
  .favorite-star.is-active { background: rgba(255,212,59,.92); border-color: rgba(255,255,255,.96); }
  .favorite-star:active { transform: scale(.92); }

  /* Favorites: clean poster gallery with subtle depth */
  .favorite-page-container { max-width: 1240px; }
  .favorite-page-grid { gap: 26px 20px; }
  .favorite-page-card { transition: transform 240ms var(--momo-ease-out); }
  .favorite-page-card:hover { transform: translateY(-6px); }
  .favorite-page-open-button { display: block; width: 100%; padding: 0; border: 0; background: transparent; cursor: pointer; }
  .favorite-page-poster { position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,.9); box-shadow: 0 8px 22px rgba(43,35,21,.11); }
  .favorite-page-poster img { display: block; width: 100%; transition: transform 400ms var(--momo-ease-out); }
  .favorite-page-card:hover .favorite-page-poster img { transform: scale(1.055); }
  .favorite-page-movie-info h3 { letter-spacing: -.025em; }
  .favorite-page-empty { border: 1px dashed rgba(177,157,111,.5); border-radius: 18px; background: rgba(255,254,250,.65); }

  /* Chat popup: the floating lounge follows the same glass language. */
  [aria-label="전체 회원 채팅"] {
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 20px;
    background: rgba(255,254,250,.9);
    box-shadow: 0 26px 68px rgba(32,27,18,.24), inset 0 1px rgba(255,255,255,.96);
    backdrop-filter: blur(24px) saturate(150%);
  }
  [aria-label="공용 채팅 열기"] {
    border: 1px solid rgba(255,255,255,.8);
    box-shadow: 0 12px 28px rgba(53,43,24,.2), inset 0 1px rgba(255,255,255,.38);
    transition: transform 220ms var(--momo-ease-out), box-shadow 220ms ease;
  }
  [aria-label="공용 채팅 열기"]:hover {
    transform: translateY(-4px) scale(1.035);
    box-shadow: 0 18px 36px rgba(53,43,24,.25), inset 0 1px rgba(255,255,255,.48);
  }

  /* Chat popup, modal, toast and dialogs */
  [role="dialog"], [role="alertdialog"] {
    border-color: rgba(255,255,255,.94);
    box-shadow: 0 24px 64px rgba(32,27,18,.22), inset 0 1px rgba(255,255,255,.9);
    backdrop-filter: blur(22px) saturate(145%);
  }
  .momo-toast {
    border-color: rgba(255,255,255,.9);
    background: rgba(255,254,250,.86);
    box-shadow: 0 18px 44px rgba(53,43,24,.18), inset 0 1px rgba(255,255,255,.96);
    backdrop-filter: blur(20px) saturate(145%);
  }

  /* Consistent scrollbars and selection */
  ::selection { background: rgba(255,212,59,.48); color: var(--momo-text); }
  * { scrollbar-color: rgba(174,151,99,.5) transparent; scrollbar-width: thin; }

  @media (max-width: 760px) {
    .home-page .movie-grid { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px 12px; }
    .all-reviews-heading, .my-reviews-heading, .liked-reviews-heading, .favorite-page-heading { padding: 20px 17px; }
    .all-reviews-card, .my-reviews-card, .liked-reviews-card, .profile-card { padding: 18px 15px; }
    .movie-detail-header { grid-template-columns: minmax(0,1fr); }
    .movie-detail-poster { width: min(58%,230px); margin: 0 auto; }
  }
  @media (max-width: 520px) {
    .home-page .movie-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px 12px; }
    .signup-page { padding: 24px 0 42px; }
    .signup-card { padding: 24px 18px; border-radius: 18px; }
    .review-detail-page { width: 100%; }
    .review-detail-top { flex-direction: column; }
    .review-detail-actions { width: 100%; flex-wrap: wrap; }
    .review-action-button { flex: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms;
      animation-iteration-count: 1;
      transition-duration: .01ms;
      scroll-behavior: auto;
    }
  }
`;

export default ProductExperienceStyles;
