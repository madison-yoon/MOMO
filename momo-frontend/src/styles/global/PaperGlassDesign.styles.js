import { createGlobalStyle } from "styled-components";

/*
 * MOMO Paper Glass / Soft 3D
 * Visual language: a warm memo desk, ruled paper, translucent glass,
 * soft stacked-paper depth and restrained, tactile interactions.
 */
const PaperGlassDesignStyles = createGlobalStyle`
  :root {
    --momo-desk: #F2EEE4;
    --momo-paper: #FFFCF3;
    --momo-paper-bright: #FFFEFA;
    --momo-paper-note: #FFF9E9;
    --momo-paper-edge: rgba(177, 158, 119, .34);
    --momo-paper-rule: rgba(116, 145, 178, .16);
    --momo-paper-margin: rgba(201, 117, 104, .22);
    --momo-glass-soft: rgba(255, 254, 249, .58);
    --momo-glass-mid: rgba(255, 254, 249, .76);
    --momo-glass-deep: rgba(255, 254, 249, .88);
    --momo-glass-border: rgba(255, 255, 255, .9);
    --momo-paper-shadow: 0 2px 4px rgba(66, 52, 29, .035),
      0 10px 26px rgba(66, 52, 29, .075),
      0 24px 48px rgba(66, 52, 29, .045),
      inset 0 1px rgba(255,255,255,.96);
    --momo-paper-shadow-hover: 0 4px 8px rgba(66, 52, 29, .05),
      0 18px 38px rgba(66, 52, 29, .12),
      0 30px 56px rgba(66, 52, 29, .055),
      inset 0 1px rgba(255,255,255,.98);
    --momo-glass-shadow: 0 12px 32px rgba(58, 48, 30, .11),
      inset 0 1px rgba(255,255,255,.98),
      inset 0 -1px rgba(208,196,169,.18);
    --momo-memo-ease: cubic-bezier(.2, .72, .2, 1);
  }

  @keyframes momo-paper-enter {
    from { opacity: 0; transform: translate3d(0, 12px, 0) rotateX(1deg); }
    to { opacity: 1; transform: translate3d(0, 0, 0) rotateX(0); }
  }
  @keyframes momo-glass-sheen {
    from { transform: translateX(-140%) rotate(12deg); }
    to { transform: translateX(140%) rotate(12deg); }
  }
  @keyframes momo-note-float {
    0%, 100% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-3px) rotate(-.12deg); }
  }

  /* Desk: subtle graph-paper texture, not a flat beige canvas. */
  html { background: var(--momo-desk); }
  body {
    color: var(--momo-text);
    background-color: var(--momo-desk);
    background-image:
      linear-gradient(rgba(122, 146, 170, .052) 1px, transparent 1px),
      linear-gradient(90deg, rgba(122, 146, 170, .052) 1px, transparent 1px),
      radial-gradient(ellipse at 12% 0%, rgba(255, 255, 255, .8), transparent 38%),
      radial-gradient(ellipse at 92% 30%, rgba(236, 220, 179, .38), transparent 42%);
    background-size: 34px 34px, 34px 34px, auto, auto;
    background-attachment: fixed;
  }
  #root { min-height: 100vh; }
  ::selection { color: #383126; background: rgba(255, 210, 84, .48); }

  /* Every route enters with the same calm, physical motion. */
  .home-page, .search-page, .movie-detail-page, .review-detail-page,
  .all-reviews-page, .profile-page, .favorite-page, .my-reviews-page,
  .liked-reviews-page, .signup-page {
    animation: momo-paper-enter .48s var(--momo-memo-ease) both;
  }

  /* Shared paper surface: translucent top coat over a warm paper core. */
  .profile-card, .all-reviews-card, .my-reviews-card, .liked-reviews-card,
  .review-detail-card, .review-comment-card, .detail-content-section,
  .movie-detail-header, .signup-card, .favorite-page-empty {
    position: relative;
    isolation: isolate;
    border: 1px solid var(--momo-glass-border);
    border-radius: 20px;
    background:
      linear-gradient(145deg, rgba(255,255,255,.76), rgba(255,250,235,.76)),
      var(--momo-paper);
    box-shadow: var(--momo-paper-shadow);
    backdrop-filter: blur(18px) saturate(128%);
    -webkit-backdrop-filter: blur(18px) saturate(128%);
  }

  .profile-card, .all-reviews-card, .my-reviews-card,
  .liked-reviews-card, .review-detail-card, .review-comment-card,
  .detail-content-section, .signup-card {
    transform: translateZ(0);
    transition: box-shadow 260ms ease, border-color 260ms ease, transform 260ms var(--momo-memo-ease);
  }
  .profile-card:hover, .all-reviews-card:hover, .my-reviews-card:hover,
  .liked-reviews-card:hover, .review-detail-card:hover, .review-comment-card:hover {
    border-color: rgba(255,255,255,.98);
    box-shadow: var(--momo-paper-shadow-hover);
  }

  /* Tape tabs and dog-eared corners make the cards read as notes, not generic panels. */
  .profile-card::before, .review-detail-card::before, .signup-card::before {
    position: absolute;
    z-index: 2;
    top: -1px;
    left: clamp(24px, 4vw, 42px);
    width: 68px;
    height: 20px;
    content: "";
    border-right: 1px solid rgba(203,170,102,.18);
    border-left: 1px solid rgba(203,170,102,.18);
    background: linear-gradient(180deg, rgba(255,224,151,.56), rgba(255,231,178,.28));
    box-shadow: 0 2px 5px rgba(91,70,35,.06);
    transform: rotate(-2deg);
    pointer-events: none;
  }
  .signup-card::after {
    position: absolute;
    z-index: 0;
    top: 0;
    right: 0;
    width: 66px;
    height: 66px;
    content: "";
    background: linear-gradient(225deg, rgba(226,211,176,.52) 0 49%, rgba(255,255,255,.72) 50% 52%, transparent 53%);
    filter: drop-shadow(-2px 3px 3px rgba(67,52,28,.07));
    pointer-events: none;
  }

  /* Page headings share one alignment, one note silhouette, one action position. */
  .all-reviews-heading, .my-reviews-heading, .liked-reviews-heading,
  .favorite-page-heading, .search-page-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 22px;
    min-height: 126px;
    margin: 0 0 22px;
    padding: clamp(22px, 3vw, 32px);
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 21px;
    background:
      linear-gradient(90deg, transparent 0 34px, rgba(201,117,104,.11) 34px 35px, transparent 35px),
      repeating-linear-gradient(0deg, transparent 0 30px, rgba(117,145,177,.075) 31px, transparent 32px),
      linear-gradient(135deg, rgba(255,255,255,.83), rgba(255,249,231,.82));
    box-shadow: var(--momo-paper-shadow);
    backdrop-filter: blur(18px) saturate(130%);
  }
  .all-reviews-heading::after, .my-reviews-heading::after,
  .liked-reviews-heading::after, .favorite-page-heading::after,
  .search-page-heading::after {
    position: absolute;
    top: 0;
    right: 52px;
    width: 74px;
    height: 19px;
    content: "";
    background: rgba(255, 222, 150, .46);
    border-right: 1px solid rgba(201,166,103,.18);
    border-left: 1px solid rgba(201,166,103,.18);
    box-shadow: 0 2px 5px rgba(91,70,35,.05);
    transform: rotate(2deg);
    pointer-events: none;
  }
  .all-reviews-heading h1, .my-reviews-heading h1,
  .liked-reviews-heading h1, .favorite-page-heading h1,
  .search-page-heading h1 {
    margin: 0 0 7px;
    color: var(--momo-text);
    font-size: clamp(26px, 3vw, 35px);
    font-weight: 850;
    line-height: 1.2;
    letter-spacing: -.05em;
  }
  .all-reviews-description, .my-reviews-heading p:not(.my-reviews-eyebrow),
  .liked-reviews-heading p, .favorite-page-heading p,
  .search-page-heading p {
    margin: 0;
    color: var(--momo-muted);
    font-size: 13px;
    line-height: 1.65;
  }
  .my-reviews-eyebrow, .liked-reviews-eyebrow, .favorite-page-eyebrow {
    display: block;
    margin: 0 0 9px;
    color: #947327;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .19em;
  }
  .page-back-link, .favorite-back-button, .review-detail-back {
    position: relative;
    z-index: 3;
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(255,255,255,.84), rgba(255,250,237,.74));
    box-shadow: 0 5px 14px rgba(59,48,29,.07), inset 0 1px rgba(255,255,255,.98);
    color: var(--momo-text-soft);
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: transform 180ms var(--momo-memo-ease), box-shadow 180ms ease, background 180ms ease;
  }
  .page-back-link:hover, .favorite-back-button:hover, .review-detail-back:hover {
    transform: translateY(-2px);
    box-shadow: 0 9px 20px rgba(59,48,29,.12), inset 0 1px rgba(255,255,255,.98);
    background: #FFF9E7;
  }
  .favorite-page-heading { margin-bottom: 14px; }
  .favorite-list-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 48px;
    margin: 0 0 20px;
    padding: 0 2px 12px;
    border-bottom: 1px solid rgba(172,153,113,.24);
  }
  .favorite-list-toolbar > span, .all-reviews-page-info,
  .my-reviews-card-heading > span, .liked-reviews-toolbar > span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 5px 11px;
    border: 1px solid rgba(218,195,139,.46);
    border-radius: 999px;
    background: rgba(255,249,226,.76);
    color: #82651B;
    font-size: 11px;
    font-weight: 850;
    white-space: nowrap;
  }

  /* One reading column width keeps archive pages aligned across routes. */
  .all-reviews-page, .my-reviews-page, .liked-reviews-container,
  .favorite-page-container, .profile-page, .search-page {
    width: 100%;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
  .all-reviews-page, .my-reviews-page, .liked-reviews-container,
  .favorite-page-container, .profile-page, .search-page {
    box-sizing: border-box;
  }

  /* Common content headers and section rhythm. */
  .profile-heading h1 { font-size: clamp(27px,3vw,35px); letter-spacing: -.05em; }
  .profile-heading p { color: var(--momo-muted); }
  .profile-container { gap: 22px; }
  .profile-card { padding: clamp(22px, 3vw, 34px); }
  .profile-card-heading { align-items: flex-end; margin-bottom: 22px; }
  .profile-card-heading h2, .all-reviews-card-heading h2,
  .my-reviews-card-heading h2, .liked-reviews-toolbar h2 {
    color: var(--momo-text);
    font-size: 18px;
    font-weight: 850;
    letter-spacing: -.035em;
  }
  .profile-card-heading p, .all-reviews-card-heading p,
  .my-reviews-card-heading p, .liked-reviews-toolbar p {
    color: var(--momo-muted);
    font-size: 12px;
    line-height: 1.6;
  }
  .all-reviews-card-heading, .my-reviews-card-heading, .liked-reviews-toolbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    padding-bottom: 16px;
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(172,153,113,.26);
  }

  /* Profile activity: three matching note cards, same depth and visual weight. */
  .profile-activity-grid { gap: 14px; }
  .profile-activity-item {
    position: relative;
    isolation: isolate;
    min-height: 174px;
    padding: 20px 14px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 17px;
    background:
      linear-gradient(90deg, transparent 0 20px, rgba(201,117,104,.11) 20px 21px, transparent 21px),
      repeating-linear-gradient(0deg, transparent 0 26px, rgba(117,145,177,.08) 27px, transparent 28px),
      linear-gradient(145deg, rgba(255,255,255,.86), rgba(255,249,230,.82));
    box-shadow: 0 7px 18px rgba(63,50,28,.065), inset 0 1px rgba(255,255,255,.98);
    transition: transform 240ms var(--momo-memo-ease), box-shadow 240ms ease, border-color 240ms ease;
  }
  .profile-activity-item:nth-child(2) { transform: rotate(.45deg); }
  .profile-activity-item:nth-child(3) { transform: rotate(-.45deg); }
  .profile-activity-item:hover {
    transform: translateY(-6px) rotate(0);
    border-color: rgba(255,255,255,1);
    box-shadow: 0 18px 32px rgba(63,50,28,.13), inset 0 1px rgba(255,255,255,1);
  }
  .profile-activity-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 13px;
    background: rgba(255,255,255,.62);
    box-shadow: 0 5px 12px rgba(63,50,28,.08), inset 0 1px rgba(255,255,255,.98);
    color: #886B24;
  }
  .profile-activity-item h3 { margin: 2px 0 0; font-size: 14px; font-weight: 850; }
  .profile-activity-item strong { font-size: 23px; font-weight: 900; letter-spacing: -.04em; }
  .profile-activity-item p { font-size: 11px; font-weight: 750; color: #8A702F; }

  /* Movie pages: layered information sheets and tactile ratings. */
  .movie-detail-page { max-width: 1240px; }
  .movie-detail-header {
    gap: clamp(24px, 3.5vw, 44px);
    padding: clamp(22px, 3.2vw, 38px);
    border-radius: 24px;
    background:
      linear-gradient(90deg, transparent 0 28px, rgba(201,117,104,.12) 28px 29px, transparent 29px),
      repeating-linear-gradient(0deg, transparent 0 31px, rgba(117,145,177,.075) 32px, transparent 33px),
      linear-gradient(145deg, rgba(255,255,255,.85), rgba(255,249,231,.78));
    box-shadow: var(--momo-paper-shadow);
  }
  .movie-detail-poster {
    padding: 7px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 15px;
    background: rgba(255,255,255,.68);
    box-shadow: 0 12px 25px rgba(44,35,21,.14), 0 2px 5px rgba(44,35,21,.07), inset 0 1px rgba(255,255,255,.98);
    transform: perspective(950px) rotateY(-1.2deg);
    transition: transform 320ms var(--momo-memo-ease), box-shadow 320ms ease;
  }
  .movie-detail-poster:hover {
    transform: perspective(950px) rotateY(0) translateY(-4px);
    box-shadow: 0 20px 34px rgba(44,35,21,.2), inset 0 1px rgba(255,255,255,.98);
  }
  .movie-detail-poster img { border-radius: 9px; }
  .movie-detail-info h1 { letter-spacing: -.05em; font-size: clamp(27px,3.3vw,40px); }
  .movie-detail-info > p:not(.eyebrow) {
    display: flex;
    gap: 6px;
    font-size: 13px;
    line-height: 1.65;
  }
  .detail-rank {
    display: inline-flex;
    width: fit-content;
    padding: 5px 10px;
    border: 1px solid rgba(216,188,111,.52);
    border-radius: 999px;
    background: rgba(255,246,211,.74);
    color: #85691F;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .09em;
  }
  .movie-rating-panel {
    padding: 22px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 18px;
    background:
      radial-gradient(circle at 100% 0, rgba(255,212,82,.16), transparent 36%),
      linear-gradient(145deg, rgba(255,255,255,.82), rgba(255,249,231,.84));
    box-shadow: var(--momo-glass-shadow);
    backdrop-filter: blur(18px) saturate(135%);
  }
  .movie-score-value strong { color: #6C521A; font-size: 38px; letter-spacing: -.06em; }
  .detail-reaction-count {
    min-height: 82px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 13px;
    background: rgba(255,255,255,.66);
    box-shadow: 0 5px 14px rgba(58,48,30,.055), inset 0 1px rgba(255,255,255,.98);
    transition: transform 200ms var(--momo-memo-ease), box-shadow 200ms ease, border-color 200ms ease;
  }
  .detail-reaction-count:first-child, .detail-reaction-count:last-child {
    background: rgba(255,255,255,.62);
  }
  .detail-reaction-count:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 22px rgba(58,48,30,.1), inset 0 1px rgba(255,255,255,.98);
  }
  .detail-reaction-count.selected-like { background: rgba(255,244,194,.9); border-color: #D6B64D; }
  .detail-reaction-count.selected-dislike { background: rgba(255,238,234,.9); border-color: #D9A5A0; }

  .detail-content-section {
    margin-top: 22px;
    padding: clamp(22px, 3vw, 30px);
    border-radius: 19px;
    background:
      linear-gradient(145deg, rgba(255,255,255,.78), rgba(255,251,241,.76)),
      var(--momo-paper);
    box-shadow: 0 8px 24px rgba(64,51,30,.055), inset 0 1px rgba(255,255,255,.98);
  }
  .detail-content-section > h2, .detail-section-heading h2 {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin: 0 0 18px;
    padding: 0 1px 8px;
    color: var(--momo-text);
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -.04em;
    background: linear-gradient(transparent 69%, rgba(255,212,82,.43) 69% 92%, transparent 92%);
    background-repeat: no-repeat;
  }
  .detail-section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }
  .detail-section-heading h2 { margin-bottom: 16px; }
  .detail-section-count {
    margin-bottom: 18px;
    color: #927638;
    font-size: 11px;
    font-weight: 850;
  }

  /* Movie-detail people cards are compact profile tiles, not oversized posters. */
  .movie-detail-page > .detail-content-section > .people-list-compact {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 0;
    min-height: 94px;
    gap: 12px;
    padding: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 14px;
    background: linear-gradient(145deg, rgba(255,255,255,.84), rgba(255,249,231,.78));
    box-shadow: 0 5px 14px rgba(58,48,30,.06), inset 0 1px rgba(255,255,255,.98);
    text-align: left;
    transition: transform 220ms var(--momo-memo-ease), box-shadow 220ms ease, border-color 220ms ease;
  }
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip:hover {
    transform: translateY(-3px);
    border-color: rgba(218,185,104,.78);
    box-shadow: 0 12px 22px rgba(58,48,30,.11), inset 0 1px rgba(255,255,255,.98);
  }
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip > img,
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip > div:first-child {
    display: block;
    flex: 0 0 62px;
    width: 62px;
    height: 74px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 9px;
    background: #F1E9D9;
  }
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip > div:first-child {
    display: grid;
    place-items: center;
  }
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip > div:last-child {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 5px;
  }
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip strong {
    overflow-wrap: anywhere;
    font-size: 13px;
    font-weight: 850;
  }
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip > div:last-child > span {
    overflow: hidden;
    color: var(--momo-muted);
    font-size: 11px;
    text-overflow: ellipsis;
  }
  .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip > div:last-child > .person-role {
    width: fit-content;
    padding: 3px 7px;
    border: 1px solid rgba(214,190,136,.34);
    border-radius: 999px;
    background: rgba(255,249,226,.72);
  }
  .people-list-actions {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
  .people-more-button, .person-bio-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    padding: 0 18px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 999px;
    background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,249,229,.78));
    box-shadow: 0 5px 14px rgba(58,48,30,.065), inset 0 1px rgba(255,255,255,.98);
    color: #80631D;
    font-size: 11px;
    font-weight: 850;
    cursor: pointer;
    transition: transform 180ms var(--momo-memo-ease), box-shadow 180ms ease;
  }
  .people-more-button:hover, .person-bio-toggle:hover {
    transform: translateY(-2px);
    box-shadow: 0 9px 20px rgba(58,48,30,.11), inset 0 1px rgba(255,255,255,.98);
  }

  .movie-detail-info .person-meta-details {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin: 12px 0 6px;
  }
  .movie-detail-info .person-meta-details p {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 29px;
    padding: 4px 10px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 999px;
    background: rgba(255,255,255,.66);
    box-shadow: 0 3px 8px rgba(58,48,30,.045), inset 0 1px rgba(255,255,255,.98);
    color: #806B45;
    font-size: 11px;
    font-weight: 750;
  }
  .movie-detail-page .movie-detail-info > p.person-biography {
    display: -webkit-box;
    max-width: 68ch;
    margin: 12px 0 0;
    padding: 16px 18px 16px 40px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 12px;
    background:
      linear-gradient(90deg, transparent 0 24px, rgba(201,117,104,.18) 24px 25px, transparent 25px),
      repeating-linear-gradient(to bottom, rgba(255,252,240,.82) 0 27px, rgba(117,145,177,.13) 28px, rgba(255,252,240,.82) 29px);
    box-shadow: inset 0 1px rgba(255,255,255,.96), 0 5px 13px rgba(63,50,28,.045);
    color: var(--momo-text-soft);
    font-size: 13px;
    line-height: 1.85;
    white-space: pre-line;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
  .movie-detail-page .movie-detail-info > p.person-biography.is-expanded {
    display: block;
    overflow: visible;
  }
  .person-bio-toggle { margin-top: 8px; min-height: 31px; padding: 0 12px; }
  .movie-detail-page > .detail-content-section > .filmography-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip {
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: 126px;
    gap: 12px;
    padding: 10px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 14px;
    background: linear-gradient(145deg, rgba(255,255,255,.86), rgba(255,249,232,.78));
    box-shadow: 0 5px 14px rgba(58,48,30,.065), inset 0 1px rgba(255,255,255,.98);
    transition: transform 200ms var(--momo-memo-ease), box-shadow 200ms ease;
  }
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 22px rgba(58,48,30,.12), inset 0 1px rgba(255,255,255,.98);
  }
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip > img,
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip > div:first-child {
    display: block;
    flex: 0 0 72px;
    width: 72px;
    height: 104px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 8px;
    background: #F1E9D9;
  }
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip > div:first-child {
    display: grid;
    place-items: center;
  }
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip > div:last-child {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 5px;
  }
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip strong {
    display: -webkit-box;
    overflow: hidden;
    font-size: 13px;
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip > div:last-child > span {
    color: var(--momo-muted);
    font-size: 11px;
  }
  .movie-detail-page > .detail-content-section > .filmography-list > .person-chip .person-role {
    width: fit-content;
    padding: 3px 7px;
    border: 1px solid rgba(214,190,136,.34);
    border-radius: 999px;
    background: rgba(255,249,226,.72);
  }

  /* Memo writing: graph paper under a glass cover, ruled paper when reading. */
  .review-write-section {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(220,198,150,.55);
    border-radius: 17px;
    background: rgba(255,252,241,.74);
    box-shadow: 0 8px 22px rgba(63,50,28,.06), inset 0 1px rgba(255,255,255,.96);
  }
  .review-write-toggle {
    position: relative;
    min-height: 62px;
    padding: 16px 22px 16px 58px;
    border: 0;
    border-radius: 0;
    background:
      linear-gradient(90deg, transparent 0 32px, rgba(201,117,104,.2) 32px 33px, transparent 33px),
      linear-gradient(135deg, rgba(255,255,255,.72), rgba(255,248,224,.7));
    color: var(--momo-text);
    font-size: 13px;
    font-weight: 850;
  }
  .review-write-toggle::before {
    position: absolute;
    left: 18px;
    top: 50%;
    width: 24px;
    height: 24px;
    content: "✎";
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 8px;
    background: rgba(255,255,255,.64);
    box-shadow: 0 3px 8px rgba(60,48,28,.07);
    color: #8A6A20;
    font-size: 13px;
    transform: translateY(-50%);
  }
  .review-write-toggle:hover { background-color: rgba(255,247,218,.88); }
  .review-toggle-arrow { color: #94752C; }
  .review-write-content {
    position: relative;
    gap: 18px;
    padding: 28px 26px 24px 54px;
    border-top: 1px solid rgba(193,173,130,.3);
    background:
      linear-gradient(90deg, transparent 0 36px, var(--momo-paper-margin) 36px 37px, transparent 37px),
      linear-gradient(rgba(116,145,178,.10) 1px, transparent 1px),
      linear-gradient(90deg, rgba(116,145,178,.10) 1px, transparent 1px),
      linear-gradient(145deg, rgba(255,254,247,.92), rgba(255,249,231,.88));
    background-size: auto, 22px 22px, 22px 22px, auto;
  }
  .review-write-content::before {
    position: absolute;
    top: -10px;
    left: 42px;
    width: 70px;
    height: 19px;
    content: "";
    border: 1px solid rgba(201,166,103,.18);
    background: rgba(255,224,151,.48);
    box-shadow: 0 2px 5px rgba(74,57,29,.06);
    transform: rotate(-2deg);
  }
  .review-write-content h3 {
    margin: 0 0 3px;
    color: var(--momo-text);
    font-size: 17px;
    letter-spacing: -.035em;
  }
  .review-field-heading label { font-size: 12px; font-weight: 850; color: #6E5A34; }
  .review-field-heading span { font-size: 10px; color: #97866A; }
  .review-title-field input, .review-content-field textarea,
  .review-edit-title, .review-edit-area textarea,
  .review-comment-form textarea, .profile-form input {
    border: 1px solid rgba(195,179,146,.68);
    border-radius: 9px;
    background: rgba(255,255,255,.76);
    box-shadow: inset 0 1px 3px rgba(72,58,32,.035), 0 3px 9px rgba(72,58,32,.025);
    color: var(--momo-text);
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  .review-title-field input:focus, .review-content-field textarea:focus,
  .review-edit-title:focus, .review-edit-area textarea:focus,
  .review-comment-form textarea:focus, .profile-form input:focus {
    border-color: rgba(188,146,49,.88);
    background: #FFFEFA;
    box-shadow: 0 0 0 3px rgba(255,212,82,.18), inset 0 1px 2px rgba(72,58,32,.025);
    outline: none;
  }
  .review-content-field textarea, .review-edit-area textarea, .review-comment-form textarea {
    line-height: 31px;
    padding: 12px 15px;
    background:
      linear-gradient(90deg, transparent 0 18px, rgba(201,117,104,.14) 18px 19px, transparent 19px),
      repeating-linear-gradient(to bottom, rgba(255,255,255,.82) 0 30px, rgba(130,151,173,.18) 31px, rgba(255,255,255,.82) 32px);
    background-attachment: local;
  }
  .review-detail-movie {
    position: relative;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 14px;
    background:
      linear-gradient(90deg, transparent 0 20px, rgba(201,117,104,.12) 20px 21px, transparent 21px),
      repeating-linear-gradient(0deg, transparent 0 27px, rgba(117,145,177,.07) 28px, transparent 29px),
      linear-gradient(145deg, rgba(255,255,255,.8), rgba(255,249,231,.82));
    box-shadow: 0 7px 18px rgba(63,50,28,.065), inset 0 1px rgba(255,255,255,.98);
  }
  .review-detail-movie-poster {
    padding: 4px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 10px;
    background: rgba(255,255,255,.72);
    box-shadow: 0 6px 15px rgba(48,38,22,.12), inset 0 1px rgba(255,255,255,.98);
  }
  .review-detail-movie-poster img { border-radius: 6px; }
  .review-detail-content {
    position: relative;
    min-height: 200px;
    padding: 25px 28px 28px 54px;
    border: 1px solid rgba(214,195,152,.72);
    border-radius: 8px 17px 15px 8px;
    background:
      linear-gradient(90deg, transparent 0 34px, rgba(201,117,104,.22) 34px 35px, transparent 35px),
      repeating-linear-gradient(to bottom, rgba(255,252,239,.96) 0 31px, rgba(129,151,174,.22) 32px, rgba(255,252,239,.96) 33px);
    box-shadow: inset 0 1px rgba(255,255,255,.95), 0 4px 12px rgba(65,52,30,.045);
    font-size: 14px;
    line-height: 2.05;
  }
  .review-detail-content::after {
    position: absolute;
    top: 0;
    right: 0;
    width: 42px;
    height: 42px;
    content: "";
    background: linear-gradient(225deg, rgba(223,211,183,.78) 0 48%, rgba(255,255,255,.82) 49% 51%, transparent 52%);
    filter: drop-shadow(-2px 3px 3px rgba(65,52,30,.06));
    pointer-events: none;
  }
  .detail-review-card {
    position: relative;
    margin-top: 14px;
    padding: 17px 20px 18px 40px;
    overflow: hidden;
    border: 1px solid rgba(219,200,158,.6);
    border-radius: 9px 14px 14px 9px;
    background:
      linear-gradient(90deg, transparent 0 24px, rgba(201,117,104,.16) 24px 25px, transparent 25px),
      repeating-linear-gradient(to bottom, rgba(255,252,239,.95) 0 27px, rgba(129,151,174,.14) 28px, rgba(255,252,239,.95) 29px);
    box-shadow: 0 5px 14px rgba(65,52,30,.05);
  }
  .detail-review-card p { margin: 9px 0 0; color: var(--momo-text-soft); line-height: 1.85; }

  /* Comments: each entry is a small loose-leaf memo, composer is frosted. */
  .review-comment-card {
    margin-top: 22px;
    padding: clamp(20px, 3vw, 30px);
  }
  .review-comment-heading {
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(172,153,113,.26);
  }
  .review-comment-heading h2 { font-size: 18px; font-weight: 900; letter-spacing: -.04em; }
  .review-comment-form {
    padding: 16px;
    border: 1px solid rgba(255,255,255,.95);
    border-radius: 14px;
    background:
      linear-gradient(rgba(116,145,178,.075) 1px, transparent 1px),
      linear-gradient(90deg, rgba(116,145,178,.075) 1px, transparent 1px),
      rgba(255,252,242,.76);
    background-size: 20px 20px, 20px 20px, auto;
    box-shadow: inset 0 1px rgba(255,255,255,.95), 0 5px 15px rgba(65,52,30,.045);
    backdrop-filter: blur(12px);
  }
  .review-comment-item {
    align-items: flex-start;
    padding: 17px 14px;
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 13px;
    background: rgba(255,253,246,.66);
    box-shadow: 0 4px 12px rgba(65,52,30,.035);
    transition: transform 180ms var(--momo-memo-ease), box-shadow 180ms ease, background 180ms ease;
  }
  .review-comment-item:hover {
    transform: translateY(-2px);
    background: rgba(255,254,250,.86);
    box-shadow: 0 8px 19px rgba(65,52,30,.07);
  }
  .review-comment-content {
    display: block;
    padding: 8px 11px;
    border-left: 2px solid rgba(220,185,91,.7);
    border-radius: 0 8px 8px 0;
    background: rgba(255,249,230,.72);
    color: var(--momo-text-soft);
    font-size: 13px;
    line-height: 1.8;
  }

  /* Archive lists: poster mats, note rows, and aligned action bars. */
  .all-reviews-search {
    display: grid;
    align-items: end;
    gap: 10px;
    padding: 16px;
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 15px;
    background:
      linear-gradient(90deg, transparent 0 24px, rgba(201,117,104,.1) 24px 25px, transparent 25px),
      repeating-linear-gradient(0deg, transparent 0 28px, rgba(117,145,177,.065) 29px, transparent 30px),
      rgba(255,252,242,.76);
    box-shadow: inset 0 1px rgba(255,255,255,.96), 0 5px 15px rgba(65,52,30,.045);
    backdrop-filter: blur(14px);
  }
  .all-reviews-search-label { color: #76623B; font-size: 11px; font-weight: 850; }
  .all-reviews-search-select, .all-reviews-search-input {
    min-height: 42px;
    border: 1px solid rgba(195,179,146,.68);
    border-radius: 9px;
    background: rgba(255,255,255,.78);
    box-shadow: inset 0 1px 2px rgba(72,58,32,.025);
    color: var(--momo-text);
  }
  .all-reviews-search-select:focus, .all-reviews-search-input:focus {
    outline: none;
    border-color: rgba(188,146,49,.86);
    box-shadow: 0 0 0 3px rgba(255,212,82,.16);
  }
  .all-reviews-table-wrap { overflow-x: auto; border: 1px solid rgba(219,202,165,.5); border-radius: 13px; background: rgba(255,254,249,.58); }
  .all-reviews-table { border-collapse: separate; border-spacing: 0; }
  .all-reviews-table thead th {
    background: rgba(249,243,225,.94);
    color: #77643E;
    border-bottom: 1px solid rgba(181,160,119,.36);
    font-size: 11px;
    font-weight: 900;
  }
  .all-reviews-table tbody tr { background: rgba(255,254,249,.7); }
  .all-reviews-table tbody tr:nth-child(even) { background: rgba(251,247,235,.72); }
  .all-reviews-table tbody tr:hover { background: rgba(255,245,206,.76); }
  .all-reviews-table td { border-bottom: 1px solid rgba(182,166,133,.18); }
  .all-review-poster, .my-review-poster, .liked-review-poster {
    padding: 4px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 10px;
    background: rgba(255,255,255,.76);
    box-shadow: 0 5px 13px rgba(48,38,22,.1), inset 0 1px rgba(255,255,255,.98);
  }
  .all-review-poster img, .my-review-poster img, .liked-review-poster img { border-radius: 6px; }
  .my-reviews-list, .liked-reviews-list { gap: 10px; }
  .my-review-item, .liked-review-item, .all-reviews-mobile-item {
    position: relative;
    padding: 16px;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 14px;
    background:
      linear-gradient(90deg, transparent 0 22px, rgba(201,117,104,.10) 22px 23px, transparent 23px),
      repeating-linear-gradient(to bottom, rgba(255,254,248,.72) 0 30px, rgba(123,148,174,.07) 31px, rgba(255,254,248,.72) 32px);
    box-shadow: 0 4px 12px rgba(64,51,30,.035);
    transition: transform 200ms var(--momo-memo-ease), box-shadow 200ms ease, border-color 200ms ease;
  }
  .my-review-item:hover, .liked-review-item:hover, .all-reviews-mobile-item:hover {
    transform: translateY(-3px);
    background:
      linear-gradient(90deg, transparent 0 22px, rgba(201,117,104,.12) 22px 23px, transparent 23px),
      repeating-linear-gradient(to bottom, rgba(255,255,255,.85) 0 30px, rgba(123,148,174,.09) 31px, rgba(255,255,255,.85) 32px);
    box-shadow: 0 11px 22px rgba(64,51,30,.085);
  }
  .my-review-info h3, .liked-review-title { font-size: 16px; letter-spacing: -.025em; }
  .my-review-info p { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: normal; }
  .liked-review-unlike {
    min-height: 36px;
    padding: 0 13px;
    border: 1px solid rgba(213,151,145,.6);
    border-radius: 999px;
    background: rgba(255,242,238,.78);
    color: #A4574F;
    font-weight: 850;
    transition: transform 180ms var(--momo-memo-ease), box-shadow 180ms ease;
  }
  .liked-review-unlike:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 7px 15px rgba(139,78,68,.12); }

  /* Search and autocomplete: frosted field above a neat stack of results. */
  .momo-search-form, .search-page input, .search-page select {
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 13px;
    background: rgba(255,254,249,.7);
    box-shadow: 0 5px 16px rgba(64,51,30,.06), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(18px) saturate(135%);
  }
  .momo-search-form:focus-within, .search-page input:focus, .search-page select:focus {
    border-color: rgba(190,151,55,.8);
    background: rgba(255,255,255,.9);
    box-shadow: 0 0 0 3px rgba(255,212,82,.17), 0 10px 22px rgba(64,51,30,.09);
  }
  .momo-search-dropdown {
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 17px;
    background: rgba(255,254,249,.86);
    box-shadow: 0 22px 48px rgba(51,41,25,.17), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(24px) saturate(145%);
  }
  .momo-search-result { border-bottom-color: rgba(177,158,119,.22); }
  .momo-search-poster {
    padding: 3px;
    border: 1px solid rgba(255,255,255,.95);
    border-radius: 7px;
    box-shadow: 0 3px 8px rgba(44,35,21,.1);
  }
  .search-page-heading { margin-bottom: 20px; }
  .search-page input { min-height: 48px; }
  .search-page .search-message, .search-page [class*="Message"] { border-radius: 16px; }

  /* Auth: clipped note corners, bright paper core, frosted glass shell. */
  .signup-card {
    border-radius: 22px;
    background:
      linear-gradient(90deg, transparent 0 30px, rgba(201,117,104,.1) 30px 31px, transparent 31px),
      repeating-linear-gradient(0deg, transparent 0 30px, rgba(117,145,177,.075) 31px, transparent 32px),
      linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,249,231,.83));
    box-shadow: 0 18px 44px rgba(62,49,29,.11), 0 3px 7px rgba(62,49,29,.045), inset 0 1px rgba(255,255,255,.98);
  }
  .signup-card-heading h1 { letter-spacing: -.05em; line-height: 1.24; }
  .signup-field { gap: 8px; }
  .signup-field label { color: #6E5A34; font-size: 12px; font-weight: 850; }
  .signup-field input {
    min-height: 48px;
    border: 1px solid rgba(195,179,146,.7);
    border-radius: 10px;
    background: rgba(255,255,255,.76);
    box-shadow: inset 0 1px 3px rgba(72,58,32,.035);
  }
  .signup-submit {
    min-height: 50px;
    border: 1px solid rgba(223,183,66,.75);
    border-radius: 12px;
    background: linear-gradient(145deg, #FFE58E, #F7D15A);
    box-shadow: 0 7px 16px rgba(154,116,25,.18), inset 0 1px rgba(255,255,255,.75);
    color: #5C4818;
    transition: transform 200ms var(--momo-memo-ease), box-shadow 200ms ease, filter 200ms ease;
  }
  .signup-submit:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 23px rgba(154,116,25,.23), inset 0 1px rgba(255,255,255,.8); filter: saturate(1.05); }

  /* Favorites gallery: consistent paper mat and poster lift. */
  .favorite-page-grid { gap: 22px 18px; }
  .favorite-page-card {
    padding: 9px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(255,250,236,.82));
    box-shadow: 0 7px 17px rgba(64,51,30,.07), inset 0 1px rgba(255,255,255,.98);
    transition: transform 230ms var(--momo-memo-ease), box-shadow 230ms ease;
  }
  .favorite-page-card:hover { transform: translateY(-5px) rotate(-.15deg); box-shadow: 0 17px 30px rgba(64,51,30,.13), inset 0 1px rgba(255,255,255,.98); }
  .favorite-page-poster {
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(45,35,20,.11);
  }
  .favorite-page-movie-info { padding: 12px 3px 4px; }
  .favorite-page-movie-info h3 { font-size: 13px; font-weight: 850; }
  .favorite-page-movie-info p { font-size: 11px; }
  .favorite-star {
    width: 38px;
    height: 38px;
    border: 1px solid rgba(255,255,255,.86);
    background: rgba(255,254,249,.72);
    box-shadow: 0 6px 14px rgba(32,25,16,.17), inset 0 1px rgba(255,255,255,.96);
    backdrop-filter: blur(14px);
    transition: transform 180ms var(--momo-memo-ease), background 180ms ease, box-shadow 180ms ease;
  }
  .favorite-star:hover { transform: translateY(-2px) scale(1.07); box-shadow: 0 10px 20px rgba(32,25,16,.21); }
  .favorite-star.is-active { background: rgba(255,216,103,.92); border-color: rgba(255,255,255,.98); }

  /* Chat and toast reuse the same glass material without losing contrast. */
  [aria-label="전체 회원 채팅"] {
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 19px;
    background: rgba(255,254,249,.91);
    box-shadow: 0 24px 56px rgba(46,36,21,.2), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(24px) saturate(145%);
  }
  .momo-toast {
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 15px;
    background: rgba(255,254,249,.9);
    box-shadow: 0 16px 34px rgba(46,36,21,.16), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(20px) saturate(145%);
  }

  /* Shared tactile controls. */
  .detail-back-button, .review-action-button, .review-edit-buttons button,
  .review-form-actions button, .all-reviews-search-submit, .all-reviews-search-reset,
  .all-reviews-pagination button, .my-reviews-pagination button,
  .liked-reviews-pagination button, .profile-button, .favorite-browse-button,
  .favorite-back-button, .recommend-button, .review-like-button,
  .review-dislike-button, .comment-like-button, .comment-dislike-button {
    border-radius: 10px;
    transition: transform 180ms var(--momo-memo-ease), box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
  }
  .detail-back-button, .review-action-button, .profile-button,
  .all-reviews-search-reset, .favorite-back-button {
    min-height: 40px;
    border: 1px solid rgba(255,255,255,.96);
    background: linear-gradient(145deg, rgba(255,255,255,.86), rgba(255,249,231,.8));
    box-shadow: 0 5px 13px rgba(58,48,30,.06), inset 0 1px rgba(255,255,255,.98);
    color: var(--momo-text-soft);
  }
  .detail-back-button:hover, .review-action-button:hover, .profile-button:hover,
  .all-reviews-search-reset:hover, .favorite-back-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 9px 19px rgba(58,48,30,.11), inset 0 1px rgba(255,255,255,.98);
    border-color: rgba(221,190,111,.7);
  }
  .all-reviews-search-submit, .review-form-actions button, .favorite-browse-button,
  .recommend-button {
    border: 1px solid rgba(222,183,72,.78);
    background: linear-gradient(145deg, #FFE58D, #F5D05C);
    box-shadow: 0 6px 14px rgba(154,116,25,.16), inset 0 1px rgba(255,255,255,.75);
    color: #5C4818;
    font-weight: 850;
  }
  .all-reviews-search-submit:hover, .review-form-actions button:hover:not(:disabled),
  .favorite-browse-button:hover, .recommend-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 11px 20px rgba(154,116,25,.21), inset 0 1px rgba(255,255,255,.84);
  }
  .all-reviews-pagination button, .my-reviews-pagination button, .liked-reviews-pagination button {
    min-width: 38px;
    height: 38px;
    border: 1px solid rgba(255,255,255,.96);
    background: rgba(255,254,249,.74);
    box-shadow: 0 3px 8px rgba(58,48,30,.05), inset 0 1px rgba(255,255,255,.98);
  }
  .all-reviews-pagination button.active, .my-reviews-pagination button.active,
  .liked-reviews-pagination button.active {
    border-color: rgba(220,180,65,.78);
    background: linear-gradient(145deg, #FFE58D, #F4CF5B);
    color: #5C4818;
    box-shadow: 0 5px 11px rgba(154,116,25,.16), inset 0 1px rgba(255,255,255,.78);
  }
  .all-reviews-pagination button:hover:not(:disabled),
  .my-reviews-pagination button:hover:not(:disabled),
  .liked-reviews-pagination button:hover:not(:disabled) { transform: translateY(-2px); }
  .review-action-button.delete, .profile-delete-button {
    border-color: rgba(213,151,145,.62);
    background: rgba(255,242,238,.84);
    color: #A4574F;
  }
  .review-like-button, .comment-like-button,
  .review-dislike-button, .comment-dislike-button {
    min-height: 38px;
    min-width: 112px;
    padding: 0 14px;
    border-radius: 999px;
    box-shadow: 0 4px 10px rgba(58,48,30,.045), inset 0 1px rgba(255,255,255,.8);
    font-size: 12px;
  }
  button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
    outline: 3px solid rgba(183,143,43,.42);
    outline-offset: 3px;
  }

  /* Footer should feel like the back cover of the notebook. */
  footer {
    border-top: 1px solid rgba(177,158,119,.28);
    background:
      linear-gradient(rgba(116,145,178,.055) 1px, transparent 1px),
      linear-gradient(135deg, rgba(245,239,223,.94), rgba(239,232,216,.96));
    background-size: 28px 28px, auto;
  }

  @media (max-width: 760px) {
    .all-reviews-heading, .my-reviews-heading, .liked-reviews-heading,
    .favorite-page-heading, .search-page-heading {
      min-height: 0;
      align-items: flex-start;
      flex-direction: column;
      gap: 16px;
    }
    .page-back-link, .favorite-back-button { align-self: flex-start; }
    .movie-detail-page > .detail-content-section > .people-list-compact {
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 9px;
    }
    .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip {
      min-height: 82px;
      gap: 8px;
      padding: 8px;
    }
    .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip > img,
    .movie-detail-page > .detail-content-section > .people-list-compact > .person-chip > div:first-child {
      flex-basis: 52px;
      width: 52px;
      height: 66px;
    }
    .profile-activity-item { min-height: 145px; }
  }
  @media (max-width: 560px) {
    body { background-size: 28px 28px, 28px 28px, auto, auto; }
    .profile-card, .all-reviews-card, .my-reviews-card,
    .liked-reviews-card, .review-detail-card, .review-comment-card,
    .detail-content-section { border-radius: 16px; }
    .profile-activity-grid { grid-template-columns: 1fr; }
    .profile-activity-item { min-height: 132px; }
    .review-write-content { padding: 25px 15px 18px 43px; }
    .review-detail-content { padding: 20px 16px 22px 42px; }
    .movie-detail-header { padding: 20px 16px; }
    .movie-detail-page > .detail-content-section > .filmography-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .movie-detail-page > .detail-content-section > .filmography-list > .person-chip {
      min-height: 88px;
      gap: 7px;
      padding: 7px;
    }
    .movie-detail-page > .detail-content-section > .filmography-list > .person-chip > img,
    .movie-detail-page > .detail-content-section > .filmography-list > .person-chip > div:first-child {
      flex-basis: 48px;
      width: 48px;
      height: 70px;
    }
    .movie-detail-page > .detail-content-section > .filmography-list > .person-chip strong {
      font-size: 11px;
    }
    .movie-detail-page > .detail-content-section > .filmography-list > .person-chip > div:last-child > span {
      font-size: 10px;
    }
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

export default PaperGlassDesignStyles;
