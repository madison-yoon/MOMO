import { createGlobalStyle } from "styled-components";

/*
 * MOMO route system
 * One visual language for review archives, favorites, search and detail routes.
 * This is intentionally the final global layer so legacy route palettes cannot
 * leak through from older page-specific stylesheets.
 */
const RouteBrandSystemStyles = createGlobalStyle`
  :root {
    --momo-route-bg: #F5F2EB;
    --momo-route-paper: rgba(255, 250, 236, .92);
    --momo-route-white: rgba(255, 254, 250, .96);
    --momo-route-ink: #292820;
    --momo-route-body: #494333;
    --momo-route-muted: #6A6251;
    --momo-route-line: #E9DFC5;
    --momo-route-line-strong: #D8C99F;
    --momo-route-yellow: #FFD43B;
    --momo-route-yellow-soft: #FFF1B2;
    --momo-route-yellow-ink: #66510F;
    --momo-route-blush: #FFF1EC;
    --momo-route-blush-ink: #8B4F47;
    --momo-route-shadow: 0 16px 38px rgba(75, 61, 31, .075), inset 0 1px rgba(255,255,255,.96);
    --momo-route-glass: rgba(255, 250, 236, .78);
  }

  /*
   * Restore the MOMO graph-paper desk underneath every route.
   * Route containers stay translucent so the grid remains visible through them.
   */
  html, body {
    min-height: 100%;
    background-color: var(--momo-route-bg) !important;
    background-image:
      linear-gradient(rgba(116, 145, 178, .075) 1px, transparent 1px),
      linear-gradient(90deg, rgba(116, 145, 178, .075) 1px, transparent 1px),
      radial-gradient(ellipse at 12% 0%, rgba(255,255,255,.78), transparent 38%),
      radial-gradient(ellipse at 92% 28%, rgba(255,212,59,.12), transparent 42%) !important;
    background-size: 32px 32px, 32px 32px, auto, auto !important;
    background-attachment: fixed !important;
  }

  #root .my-reviews-page,
  #root .liked-reviews-page,
  #root .all-reviews-page,
  #root .favorite-page,
  #root .search-page,
  #root .movie-detail-page {
    box-sizing: border-box;
    color: var(--momo-route-ink);
    background:
      radial-gradient(ellipse at 50% 0%, rgba(255,212,59,.11), transparent 38rem),
      linear-gradient(180deg, rgba(255,250,236,.10), rgba(255,250,236,.025)) !important;
    background-color: transparent !important;
  }

  #root .my-reviews-page,
  #root .all-reviews-page {
    width: min(1240px, calc(100% - 48px));
    max-width: 1240px;
    margin-inline: auto;
    padding: 24px 0 76px;
  }

  #root .liked-reviews-page,
  #root .favorite-page,
  #root .search-page,
  #root .movie-detail-page {
    padding-top: 24px;
    padding-bottom: 76px;
  }

  #root .liked-reviews-container,
  #root .favorite-page-container {
    width: min(1160px, calc(100% - 48px));
    max-width: 1160px;
    margin-inline: auto;
  }

  /* The same editorial title panel on every archive route */
  #root .my-reviews-heading,
  #root .liked-reviews-heading,
  #root .all-reviews-heading,
  #root .favorite-page-heading,
  #root .search-page-heading {
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 142px;
    box-sizing: border-box;
    margin: 0 0 24px;
    padding: clamp(25px, 3.2vw, 38px);
    overflow: hidden;
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 20px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.72), rgba(255,250,236,.58)),
      rgba(255,250,236,.56) !important;
    box-shadow: 0 14px 38px rgba(75,61,31,.085), inset 0 1px rgba(255,255,255,.94), inset 0 -1px rgba(216,201,159,.16) !important;
    backdrop-filter: blur(26px) saturate(138%);
    -webkit-backdrop-filter: blur(26px) saturate(138%);
    -webkit-backdrop-filter: blur(22px) saturate(125%);
  }

  #root .my-reviews-heading::before,
  #root .liked-reviews-heading::before,
  #root .all-reviews-heading::before,
  #root .favorite-page-heading::before,
  #root .search-page-heading::before {
    position: absolute;
    z-index: 0;
    inset: 24px auto 24px 0;
    width: 4px;
    content: "";
    border-radius: 0 4px 4px 0;
    background: var(--momo-route-yellow);
    box-shadow: 0 0 18px rgba(255,212,59,.24);
    pointer-events: none;
  }

  #root .my-reviews-heading::after,
  #root .liked-reviews-heading::after,
  #root .all-reviews-heading::after,
  #root .favorite-page-heading::after,
  #root .search-page-heading::after {
    position: absolute;
    z-index: 0;
    top: -45%;
    left: -35%;
    width: 42%;
    height: 190%;
    content: "";
    display: block;
    border-radius: 50%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.42), transparent);
    filter: blur(12px);
    transform: rotate(18deg);
    pointer-events: none;
    opacity: .7;
  }

  #root .my-reviews-heading > *,
  #root .liked-reviews-heading > *,
  #root .all-reviews-heading > *,
  #root .favorite-page-heading > *,
  #root .search-page-heading > * {
    position: relative;
    z-index: 1;
  }

  #root .my-reviews-heading h1,
  #root .liked-reviews-heading h1,
  #root .all-reviews-heading h1,
  #root .favorite-page-heading h1,
  #root .search-page-heading h1 {
    margin: 0 0 8px;
    color: var(--momo-route-ink) !important;
    font-size: clamp(27px, 3.2vw, 36px);
    font-weight: 850;
    line-height: 1.18;
    letter-spacing: -.045em;
  }

  #root .my-reviews-heading p:not(.my-reviews-eyebrow),
  #root .liked-reviews-heading p:not(.liked-reviews-eyebrow),
  #root .all-reviews-heading p,
  #root .favorite-page-heading p:not(.favorite-page-eyebrow),
  #root .search-page-heading p {
    margin: 0;
    color: var(--momo-route-muted) !important;
    font-size: 13px;
    line-height: 1.7;
  }

  #root .my-reviews-eyebrow,
  #root .liked-reviews-eyebrow,
  #root .favorite-page-eyebrow {
    display: block;
    margin: 0 0 10px;
    color: var(--momo-route-yellow-ink) !important;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: .15em;
  }

  /* Shared cards and toolbars */
  #root .my-reviews-card,
  #root .liked-reviews-card,
  #root .all-reviews-card,
  #root .favorite-page-empty,
  #root .all-reviews-search,
  #root .all-reviews-search-panel,
  #root .all-reviews-table-wrap {
    box-sizing: border-box;
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 17px !important;
    background:
      linear-gradient(145deg, rgba(255,255,255,.68), rgba(255,250,236,.56)),
      rgba(255,250,236,.48) !important;
    box-shadow: 0 12px 32px rgba(75,61,31,.075), inset 0 1px rgba(255,255,255,.94), inset 0 -1px rgba(216,201,159,.14) !important;
    backdrop-filter: blur(24px) saturate(132%);
    -webkit-backdrop-filter: blur(24px) saturate(132%);
    -webkit-backdrop-filter: blur(18px) saturate(118%);
  }

  #root .my-reviews-card,
  #root .liked-reviews-card,
  #root .all-reviews-card {
    padding: clamp(20px, 2.6vw, 30px);
  }

  #root .my-reviews-card-heading,
  #root .liked-reviews-toolbar,
  #root .all-reviews-card-heading {
    border-bottom: 1px solid rgba(216,201,159,.72) !important;
  }

  #root .my-reviews-card-heading h2,
  #root .liked-reviews-toolbar h2,
  #root .all-reviews-card-heading h2 {
    color: var(--momo-route-ink) !important;
  }

  #root .my-reviews-card-heading p,
  #root .liked-reviews-toolbar p,
  #root .all-reviews-card-heading p,
  #root .all-reviews-page-info {
    color: var(--momo-route-muted) !important;
  }

  #root .my-reviews-card-heading > span,
  #root .liked-reviews-toolbar > span,
  #root .favorite-list-toolbar > span {
    border: 1px solid rgba(214,180,63,.55) !important;
    border-radius: 9px !important;
    background: rgba(255,241,178,.58) !important;
    color: var(--momo-route-yellow-ink) !important;
  }

  /* Review rows: clear reading rhythm, not a stack of unrelated boxes */
  #root .my-review-item,
  #root .liked-review-item,
  #root .all-reviews-mobile-item,
  #root .all-reviews-table tbody tr {
    color: var(--momo-route-ink) !important;
    border-color: rgba(233,223,197,.86) !important;
    background: transparent !important;
    transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
  }

  #root .my-review-item:hover,
  #root .liked-review-item:hover,
  #root .all-reviews-mobile-item:hover,
  #root .all-reviews-table tbody tr:hover {
    background: rgba(255,241,178,.34) !important;
  }

  #root .my-review-movie,
  #root .my-review-arrow,
  #root .liked-review-movie,
  #root .liked-review-stats strong,
  #root .all-review-movie-info,
  #root .review-title-link {
    color: #80600E !important;
  }

  #root .my-review-info h3,
  #root .liked-review-title,
  #root .review-movie-title,
  #root .mobile-review-movie,
  #root .mobile-review-title {
    color: var(--momo-route-ink) !important;
  }

  #root .my-review-info p,
  #root .liked-review-content,
  #root .liked-review-meta,
  #root .review-author-cell,
  #root .review-date-cell,
  #root .review-stats-cell,
  #root .mobile-review-meta {
    color: var(--momo-route-body) !important;
  }

  #root .my-review-date { color: var(--momo-route-muted) !important; }

  #root .my-review-poster,
  #root .liked-review-poster,
  #root .all-review-poster {
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 9px !important;
    background: #FFFEFA !important;
    box-shadow: 0 7px 16px rgba(75,61,31,.11);
  }

  #root .liked-review-unlike {
    border: 1px solid rgba(229,184,173,.88) !important;
    border-radius: 9px !important;
    background: var(--momo-route-blush) !important;
    color: var(--momo-route-blush-ink) !important;
  }

  #root .liked-review-unlike:hover:not(:disabled) {
    background: #FFE5DC !important;
  }

  /* All-reviews search and table */
  #root .all-reviews-search-label { color: var(--momo-route-yellow-ink) !important; }
  #root .all-reviews-search-select,
  #root .all-reviews-search-input,
  #root .search-page input,
  #root .search-page select,
  #root .movie-detail-page input,
  #root .movie-detail-page textarea {
    border: 1px solid var(--momo-route-line-strong) !important;
    border-radius: 11px !important;
    background: rgba(255,254,250,.94) !important;
    color: var(--momo-route-ink) !important;
    box-shadow: inset 0 1px rgba(255,255,255,.98);
  }

  #root .all-reviews-search-select:focus,
  #root .all-reviews-search-input:focus,
  #root .search-page input:focus,
  #root .movie-detail-page input:focus,
  #root .movie-detail-page textarea:focus {
    border-color: #D6B43F !important;
    box-shadow: 0 0 0 4px rgba(255,212,59,.2) !important;
  }

  #root .all-reviews-search-submit,
  #root .favorite-browse-button {
    border: 1px solid #D6B43F !important;
    border-radius: 10px !important;
    background: var(--momo-route-yellow) !important;
    color: var(--momo-route-ink) !important;
    box-shadow: 0 6px 14px rgba(179,141,25,.15) !important;
  }

  #root .all-reviews-search-submit:hover:not(:disabled),
  #root .favorite-browse-button:hover:not(:disabled) {
    background: #F3C72E !important;
  }

  #root .all-reviews-search-reset,
  #root .page-back-link,
  #root .favorite-back-button,
  #root .detail-back-button {
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 10px !important;
    background: rgba(255,250,236,.86) !important;
    color: var(--momo-route-body) !important;
  }

  #root .all-reviews-table thead th {
    border-bottom: 1px solid rgba(214,180,63,.48) !important;
    background: rgba(255,241,178,.58) !important;
    color: var(--momo-route-yellow-ink) !important;
  }

  #root .all-reviews-table tbody tr:nth-child(even) {
    background: rgba(255,254,250,.48) !important;
  }

  #root .all-reviews-pagination button,
  #root .my-reviews-pagination button,
  #root .liked-reviews-pagination button {
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 9px !important;
    background: rgba(255,250,236,.9) !important;
    color: var(--momo-route-body) !important;
  }

  #root .all-reviews-pagination button.active,
  #root .my-reviews-pagination button.active,
  #root .liked-reviews-pagination button.active {
    border-color: #D6B43F !important;
    background: var(--momo-route-yellow) !important;
    color: var(--momo-route-ink) !important;
  }

  /* Saved movies: one neutral ivory gallery; no nth-child color alternation */
  #root .favorite-page .favorite-page-card,
  #root .favorite-page .favorite-page-card:nth-child(3n + 2),
  #root .favorite-page .favorite-page-card:nth-child(3n) {
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 15px !important;
    background:
      linear-gradient(145deg, rgba(255,255,255,.66), rgba(255,250,236,.54)),
      rgba(255,250,236,.46) !important;
    box-shadow: 0 10px 26px rgba(75,61,31,.075), inset 0 1px rgba(255,255,255,.94) !important;
    backdrop-filter: blur(22px) saturate(132%);
    -webkit-backdrop-filter: blur(22px) saturate(132%);
  }

  #root .favorite-page .favorite-page-card:hover {
    border-color: rgba(214,180,63,.72) !important;
    box-shadow: 0 16px 30px rgba(75,61,31,.12), inset 0 1px rgba(255,255,255,.98) !important;
    transform: translateY(-4px);
  }

  #root .favorite-page .favorite-page-poster {
    border: 1px solid rgba(233,223,197,.85) !important;
    border-radius: 10px !important;
    background: #FFFEFA !important;
  }

  #root .favorite-page .favorite-page-movie-info h3 { color: var(--momo-route-ink) !important; }
  #root .favorite-page .favorite-page-movie-info p { color: var(--momo-route-muted) !important; }

  /* Search page: match archive header and provide a prominent single search field */
  #root .search-page [role="search"] {
    width: min(760px, 100%);
    margin: 0 auto 30px;
  }

  #root .search-page [role="search"] input {
    width: 100%;
    min-height: 54px;
    box-sizing: border-box;
    padding: 0 22px;
    border-radius: 15px !important;
    font-size: 15px;
  }

  /* Movie and person detail share a single cinema-glass composition */
  #root .movie-detail-page .movie-detail-header {
    border: 1px solid rgba(233,223,197,.9) !important;
    border-radius: 22px !important;
    background:
      radial-gradient(circle at 92% 0%, rgba(255,212,59,.17), transparent 32%),
      linear-gradient(135deg, rgba(255,254,250,.96), rgba(255,250,236,.86)) !important;
    box-shadow: var(--momo-route-shadow) !important;
    backdrop-filter: blur(22px) saturate(125%);
  }

  #root .movie-detail-page .movie-detail-info h1,
  #root .movie-detail-page .detail-section-heading,
  #root .movie-detail-page .rating-panel-title-group,
  #root .movie-detail-page .movie-score-value strong {
    color: var(--momo-route-ink) !important;
  }

  #root .movie-detail-page .detail-content-section,
  #root .movie-detail-page .movie-rating-panel {
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 17px !important;
    background: linear-gradient(145deg, rgba(255,255,255,.68), rgba(255,250,236,.58)) !important;
    box-shadow: 0 12px 30px rgba(75,61,31,.075), inset 0 1px rgba(255,255,255,.95) !important;
    backdrop-filter: blur(24px) saturate(136%);
    -webkit-backdrop-filter: blur(24px) saturate(136%);
  }

  #root .movie-detail-page .rating-panel-heading {
    border-bottom-color: rgba(214,180,63,.38) !important;
  }

  #root .movie-detail-page .rating-panel-eyebrow,
  #root .movie-detail-page .rating-label,
  #root .movie-detail-page .rating-score-caption {
    color: var(--momo-route-yellow-ink) !important;
  }

  #root .movie-detail-page .rating-distribution-track {
    background: #F1EADF !important;
  }

  #root .movie-detail-page .rating-distribution-track span {
    background: linear-gradient(90deg, #F3C72E, #FFD43B) !important;
  }

  #root .movie-detail-page .rating-legend-dot.is-like {
    background: #D6B43F !important;
  }

  #root .movie-detail-page .rating-legend-dot.is-dislike {
    background: #D69D91 !important;
  }

  #root .movie-detail-page .rating-vote-button.is-like {
    border: 1px solid #D8B44E !important;
    background: #FFF3C5 !important;
    color: #66510F !important;
  }

  #root .movie-detail-page .rating-vote-button.is-dislike {
    border: 1px solid #E5B8AD !important;
    background: #FFF1EC !important;
    color: #8B4F47 !important;
  }

  #root .movie-detail-page .person-chip {
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 999px !important;
    background: rgba(255,254,250,.86) !important;
    color: var(--momo-route-body) !important;
  }

  #root .movie-detail-page .person-chip:hover {
    border-color: rgba(214,180,63,.68) !important;
    background: rgba(255,241,178,.5) !important;
  }

  #root .movie-detail-page .detail-back-button:hover,
  #root .movie-detail-page .page-back-link:hover {
    border-color: rgba(214,180,63,.68) !important;
    background: rgba(255,241,178,.52) !important;
  }

  /* Shared reading typography and state surfaces */
  #root .my-reviews-state,
  #root .liked-reviews-state,
  #root .all-reviews-state,
  #root .search-page [role="status"] {
    color: var(--momo-route-muted) !important;
  }

  #root .my-reviews-state.error,
  #root .liked-reviews-state.error,
  #root .all-reviews-state.all-reviews-error {
    color: var(--momo-danger) !important;
  }


  /* Search result cards use the same poster frame and text hierarchy as favorites. */
  #root .search-page .movie-card,
  #root .search-page .movie-grid > *,
  #root .search-page .movie-item {
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 15px !important;
    background: rgba(255,250,236,.92) !important;
    color: var(--momo-route-ink) !important;
    box-shadow: 0 10px 24px rgba(75,61,31,.075), inset 0 1px rgba(255,255,255,.96) !important;
  }

  #root .search-page .movie-card:hover,
  #root .search-page .movie-item:hover {
    border-color: rgba(214,180,63,.72) !important;
    background: rgba(255,250,236,.98) !important;
    box-shadow: 0 16px 30px rgba(75,61,31,.12), inset 0 1px rgba(255,255,255,.98) !important;
  }

  #root .search-page .poster-frame,
  #root .search-page .movie-poster,
  #root .search-page .poster-placeholder {
    border-color: rgba(233,223,197,.9) !important;
    background: #FFFEFA !important;
  }

  #root .search-page .movie-card h3,
  #root .search-page .movie-item h3,
  #root .search-page .movie-info h3 {
    color: var(--momo-route-ink) !important;
  }

  #root .search-page .movie-card p,
  #root .search-page .movie-item p,
  #root .search-page .movie-info p,
  #root .search-page .movie-audience-info {
    color: var(--momo-route-muted) !important;
  }

  #root .search-page .poster-rank {
    border: 1px solid rgba(233,223,197,.72) !important;
    background: rgba(41,40,32,.86) !important;
    color: #FFF1B2 !important;
  }

  #root .search-page .movie-message,
  #root .search-page [class*="Message"] {
    color: var(--momo-route-muted) !important;
  }

  /* Detail metadata, biography, filmography and review composer. */
  #root .movie-detail-page .movie-detail-info,
  #root .movie-detail-page .movie-detail-info > p:not(.eyebrow),
  #root .movie-detail-page .person-meta-details,
  #root .movie-detail-page .person-meta-details p,
  #root .movie-detail-page .person-biography,
  #root .movie-detail-page .rating-panel-description,
  #root .movie-detail-page .rating-panel-stamp,
  #root .movie-detail-page .movie-score-value span,
  #root .movie-detail-page .rating-vote-summary,
  #root .movie-detail-page .rating-distribution-legend,
  #root .movie-detail-page .detail-total-count {
    color: var(--momo-route-body) !important;
  }

  #root .movie-detail-page .detail-rank {
    border: 1px solid rgba(214,180,63,.58) !important;
    background: rgba(255,241,178,.58) !important;
    color: var(--momo-route-yellow-ink) !important;
  }

  #root .movie-detail-page .rating-distribution-heading,
  #root .movie-detail-page .rating-distribution-heading strong,
  #root .movie-detail-page .detail-total-count strong {
    color: var(--momo-route-ink) !important;
  }

  #root .movie-detail-page .rating-error {
    color: var(--momo-danger) !important;
  }

  #root .movie-detail-page .rating-unavailable {
    border-color: var(--momo-route-line) !important;
    background: rgba(255,250,236,.72) !important;
    color: var(--momo-route-muted) !important;
  }

  #root .movie-detail-page .review-write-section,
  #root .movie-detail-page .detail-review-card {
    border: 1px solid var(--momo-route-line) !important;
    border-radius: 16px !important;
    background: rgba(255,250,236,.9) !important;
    box-shadow: 0 10px 24px rgba(75,61,31,.065), inset 0 1px rgba(255,255,255,.96) !important;
  }

  #root .movie-detail-page .review-write-toggle {
    color: var(--momo-route-ink) !important;
  }

  #root .movie-detail-page .review-write-toggle:hover {
    background: rgba(255,241,178,.4) !important;
  }

  #root .movie-detail-page .review-write-content {
    border-top-color: rgba(216,201,159,.72) !important;
  }

  #root .movie-detail-page .review-write-content h3,
  #root .movie-detail-page .review-field-heading label,
  #root .movie-detail-page .detail-review-card h3 {
    color: var(--momo-route-ink) !important;
  }

  #root .movie-detail-page .review-field-heading span,
  #root .movie-detail-page .detail-review-card p {
    color: var(--momo-route-body) !important;
  }

  #root .movie-detail-page .people-empty,
  #root .movie-detail-page .person-biography {
    color: var(--momo-route-body) !important;
  }

  #root .movie-detail-page .filmography-list .person-chip,
  #root .movie-detail-page .people-list .person-chip {
    border-color: var(--momo-route-line) !important;
    background: rgba(255,254,250,.9) !important;
    color: var(--momo-route-body) !important;
  }

  @media (max-width: 760px) {
    #root .my-reviews-page,
    #root .all-reviews-page {
      width: calc(100% - 32px);
      padding-top: 18px;
    }

    #root .liked-reviews-container,
    #root .favorite-page-container {
      width: calc(100% - 32px);
    }

    #root .my-reviews-heading,
    #root .liked-reviews-heading,
    #root .all-reviews-heading,
    #root .favorite-page-heading,
    #root .search-page-heading {
      min-height: 120px;
      padding: 22px 18px;
      gap: 14px;
    }

    #root .my-reviews-heading h1,
    #root .liked-reviews-heading h1,
    #root .all-reviews-heading h1,
    #root .favorite-page-heading h1,
    #root .search-page-heading h1 {
      font-size: clamp(24px, 6vw, 30px);
    }

    #root .favorite-page .favorite-page-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px 12px;
    }

    #root .my-reviews-card,
    #root .liked-reviews-card,
    #root .all-reviews-card {
      padding: 18px 15px;
    }
  }

  @media (max-width: 520px) {
    #root .my-reviews-page,
    #root .all-reviews-page,
    #root .liked-reviews-container,
    #root .favorite-page-container {
      width: calc(100% - 24px);
    }

    #root .my-reviews-heading,
    #root .liked-reviews-heading,
    #root .all-reviews-heading,
    #root .favorite-page-heading,
    #root .search-page-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    #root .favorite-page .favorite-page-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px 10px;
    }

    #root .liked-review-item {
      align-items: flex-start;
      gap: 12px;
      padding: 16px 6px;
    }

    #root .liked-review-unlike {
      margin-left: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #root .my-review-item,
    #root .liked-review-item,
    #root .favorite-page-card,
    #root .person-chip {
      transition: none !important;
      transform: none !important;
    }
  }
`;

export default RouteBrandSystemStyles;
