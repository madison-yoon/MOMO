import { createGlobalStyle } from "styled-components";

/*
 * MOMO Spatial Experience
 * 기존 페이지의 className / styled-component 계약을 유지하면서
 * 각 라우트의 화면 구조와 시각적 깊이를 다시 정의한다.
 */
const MomoSpatialExperienceStyles = createGlobalStyle`
  /* ---------- Global atmosphere ---------- */
  ::selection { background: rgba(255,212,59,.52); color: #292820; }
  :where(button, a, input, textarea, select) { -webkit-tap-highlight-color: transparent; }
  :where(button, a, input, textarea, select):focus-visible {
    outline: 2px solid #765A0A;
    outline-offset: 3px;
    box-shadow: 0 0 0 5px rgba(255,212,59,.2);
  }

  /* ---------- Movie detail: poster-led cinematic stage ---------- */
  .movie-detail-page { max-width: 1440px; padding-bottom: 96px; }
  .movie-detail-page > .detail-back-button {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 40px;
    padding: 0 15px;
    margin: 0 0 22px;
    border: 1px solid rgba(229,222,209,.9);
    border-radius: 6px 14px 6px 14px;
    background: rgba(255,254,250,.76);
    box-shadow: 0 6px 16px rgba(54,45,28,.05);
  }
  .movie-detail-header {
    position: relative;
    isolation: isolate;
    grid-template-columns: minmax(220px, 310px) minmax(0, 1fr);
    align-items: center;
    gap: clamp(28px, 5vw, 76px);
    min-height: 500px;
    padding: clamp(28px, 4.5vw, 64px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 28px;
    background:
      radial-gradient(ellipse at 90% 10%, rgba(255,212,59,.22), transparent 28rem),
      repeating-linear-gradient(0deg, rgba(91,78,50,.025) 0 1px, transparent 1px 5px),
      linear-gradient(135deg, #FFFEFA, #F1E8D8);
    box-shadow: 0 28px 68px rgba(54,45,28,.12);
  }
  .movie-detail-header::after {
    content: "NOW SHOWING";
    position: absolute;
    z-index: -1;
    right: -22px;
    bottom: 22px;
    color: rgba(118,90,10,.07);
    font: 900 clamp(58px, 10vw, 150px)/.9 ui-monospace,monospace;
    letter-spacing: -.09em;
    white-space: nowrap;
  }
  .movie-detail-poster {
    position: relative;
    z-index: 1;
    width: min(100%, 310px);
    aspect-ratio: 2 / 3;
    border: 8px solid rgba(255,254,250,.94);
    border-radius: 5px;
    box-shadow: 0 26px 50px rgba(35,29,18,.25), 0 0 0 1px rgba(41,40,32,.12);
    transform: rotate(-2deg);
    transition: transform .4s cubic-bezier(.2,.7,.2,1);
  }
  .movie-detail-poster:hover { transform: rotate(0) translateY(-5px); }
  .movie-detail-info { position: relative; z-index: 1; gap: 14px; }
  .movie-detail-info .eyebrow {
    display: inline-flex;
    width: fit-content;
    padding: 7px 10px;
    border: 1px solid rgba(214,166,20,.28);
    border-radius: 4px;
    background: rgba(255,212,59,.2);
    color: #765A0A;
    font: 800 10px/1 ui-monospace,monospace;
    letter-spacing: .13em;
  }
  .movie-detail-info h1 {
    max-width: 900px;
    font-size: clamp(34px, 5vw, 68px);
    line-height: 1.04;
    letter-spacing: -.065em;
  }
  .movie-detail-info > p:not(.eyebrow) { color: #625B4E; font-size: 14px; }
  .movie-detail-info .movie-rating-panel {
    display: grid;
    grid-template-columns: auto minmax(0,1fr);
    align-items: center;
    gap: 8px 20px;
    max-width: 620px;
    padding: 20px 22px;
    border: 1px solid rgba(229,222,209,.82);
    border-radius: 14px;
    background: rgba(255,254,250,.72);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
    backdrop-filter: blur(16px);
  }
  .movie-detail-info .movie-rating-number { grid-row: span 2; font: 800 48px/1 Georgia,serif; color: #765A0A; }
  .movie-detail-page .detail-content-section {
    position: relative;
    margin-top: 24px;
    padding: clamp(24px, 3.2vw, 42px);
    border: 1px solid rgba(229,222,209,.86);
    border-radius: 22px;
    background: rgba(255,254,250,.78);
    box-shadow: 0 14px 34px rgba(54,45,28,.055);
    backdrop-filter: blur(14px);
  }
  .movie-detail-page .detail-content-section > h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: clamp(20px, 2.2vw, 28px);
    letter-spacing: -.05em;
  }
  .movie-detail-page .detail-content-section > h2::before { content: ""; width: 22px; height: 3px; border-radius: 3px; background: #FFD43B; }
  .movie-detail-page .person-chip {
    border-radius: 6px 14px 6px 14px;
    background: linear-gradient(135deg, #FFFEFA, #FFF7DF);
    box-shadow: 0 5px 14px rgba(54,45,28,.055);
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .movie-detail-page .person-chip:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(54,45,28,.1); }

  /* ---------- Search: immersive discovery canvas ---------- */
  .search-page {
    position: relative;
    max-width: 1440px;
    padding: clamp(20px, 3vw, 44px);
    border: 1px solid rgba(255,255,255,.76);
    border-radius: 28px;
    background:
      radial-gradient(ellipse at 100% 0%, rgba(255,212,59,.16), transparent 30rem),
      rgba(255,254,250,.58);
    box-shadow: 0 22px 54px rgba(54,45,28,.07);
    backdrop-filter: blur(18px);
  }
  .search-page > div:first-child { display: grid; grid-template-columns: minmax(0,1fr) minmax(280px,.65fr); align-items: end; gap: 20px; }
  .search-page h1 { font-size: clamp(34px, 4.4vw, 58px); line-height: 1.05; letter-spacing: -.065em; }
  .search-page input { min-height: 58px; padding: 0 22px; border: 1px solid #D9CFBC; border-radius: 8px 18px 8px 18px; background: rgba(255,255,255,.88); box-shadow: 0 12px 26px rgba(54,45,28,.08), inset 0 1px 0 #fff; }
  .search-page input:focus { border-color: #B18A1A; }
  .search-page > div:nth-child(2) { margin-top: 36px; }
  .search-page .movie-grid { grid-template-columns: repeat(5,minmax(0,1fr)); gap: 30px 20px; }
  .search-page .movie-grid > * { transition: transform .28s ease; }
  .search-page .movie-grid > *:hover { transform: translateY(-8px) rotate(.6deg); }
  .search-page .movie-grid img { border-radius: 6px; box-shadow: 0 16px 30px rgba(41,40,32,.15); }
  .search-page .movie-info { padding: 12px 3px 0; }
  @media(max-width: 900px) { .search-page > div:first-child { grid-template-columns: 1fr; } .search-page .movie-grid { grid-template-columns: repeat(4,minmax(0,1fr)); } }
  @media(max-width: 600px) { .search-page { padding: 20px 14px; border-radius: 18px; } .search-page .movie-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 22px 12px; } }

  /* ---------- Review list: community wall, not spreadsheet ---------- */
  .all-reviews-page { max-width: 1440px; }
  .all-reviews-heading {
    min-height: 210px;
    padding: clamp(28px, 4.5vw, 60px);
    border: 1px solid rgba(255,255,255,.8);
    border-radius: 28px;
    background:
      radial-gradient(circle at 85% 30%, rgba(255,212,59,.3), transparent 19rem),
      repeating-linear-gradient(90deg, rgba(81,76,64,.025) 0 1px, transparent 1px 6px),
      linear-gradient(120deg, #FFFDF7, #F1E7D5);
    box-shadow: 0 22px 52px rgba(54,45,28,.09);
  }
  .all-reviews-heading::before { width: 8px; background: linear-gradient(#FFE27A,#D5A916); }
  .all-reviews-heading h1 { font-size: clamp(36px, 5vw, 64px); letter-spacing: -.07em; }
  .all-reviews-count { width: 150px; height: 130px; border-radius: 50%; background: rgba(255,254,250,.74); box-shadow: 0 12px 26px rgba(54,45,28,.08); }
  .all-reviews-count strong { font: 800 30px/1 Georgia,serif; }
  .all-reviews-card { padding: clamp(20px, 3vw, 38px); border: 0; border-radius: 24px; background: rgba(255,254,250,.76); box-shadow: 0 18px 42px rgba(54,45,28,.065); }
  .all-reviews-search { grid-template-columns: auto minmax(150px,.7fr) minmax(220px,2fr) auto auto; padding: 14px; border-radius: 9px 18px 9px 18px; background: rgba(245,242,235,.82); }
  .all-reviews-table thead { background: transparent; }
  .all-reviews-table th { padding: 16px 12px; border-top: 0; color: #8A806D; font: 800 10px/1.3 ui-monospace,monospace; letter-spacing: .1em; text-transform: uppercase; }
  .all-reviews-table td { padding: 21px 12px; }
  .all-reviews-table tbody tr { background: rgba(255,255,255,.38); transition: background .2s ease, transform .2s ease; }
  .all-reviews-table tbody tr:hover { background: #FFF7DF; transform: translateX(3px); }

  /* ---------- Review detail: authored note canvas ---------- */
  .review-detail-page { max-width: 1120px; }
  .review-detail-card {
    display: grid;
    grid-template-columns: minmax(0,1fr) minmax(220px,.38fr);
    column-gap: clamp(24px,4vw,56px);
    padding: clamp(28px,4vw,58px);
    border: 1px solid rgba(255,255,255,.86);
    border-radius: 26px;
    background:
      repeating-linear-gradient(0deg, transparent 0 35px, rgba(214,166,20,.065) 35px 36px),
      linear-gradient(135deg,#FFFEFA,#FFF9E9);
    box-shadow: 0 24px 56px rgba(54,45,28,.09);
  }
  .review-detail-card::before { left: 0; right: auto; top: 0; bottom: 0; width: 5px; height: auto; background: linear-gradient(#FFD43B,rgba(255,212,59,.08)); }
  .review-detail-top, .review-detail-content-section, .review-detail-reactions, .review-detail-updated { grid-column: 1 / -1; }
  .review-detail-title { font-size: clamp(34px,4.5vw,54px); line-height: 1.12; letter-spacing: -.06em; }
  .review-detail-movie { grid-column: 1 / -1; display: grid; grid-template-columns: 92px minmax(0,1fr); align-items: center; gap: 20px; margin: 28px 0; padding: 18px; border-radius: 14px; background: rgba(255,255,255,.66); box-shadow: 0 10px 24px rgba(54,45,28,.06); }
  .review-detail-movie-poster { width: 92px; min-width: 92px; height: 132px; border: 5px solid white; border-radius: 4px; box-shadow: 0 8px 16px rgba(54,45,28,.15); }
  .review-detail-content { min-height: 220px; padding: 30px 34px; border: 0; border-radius: 4px 14px 4px 14px; background: rgba(255,255,255,.55); line-height: 2.05; }
  .review-detail-reactions { margin-top: 26px; }
  @media(max-width: 680px) { .review-detail-card { display: block; padding: 28px 20px; } .review-detail-movie { grid-template-columns: 72px minmax(0,1fr); } .review-detail-movie-poster { width:72px; min-width:72px; height:104px; } .review-detail-content { padding: 22px 18px; } }

  /* ---------- Profile: member identity + activity dashboard ---------- */
  .profile-page { max-width: 1240px; }
  .profile-container { grid-template-columns: minmax(0,.82fr) minmax(0,1.18fr); align-items: start; gap: 22px; }
  .profile-heading { grid-column: 1 / -1; padding: 8px 0 14px; }
  .profile-heading h1 { font-size: clamp(36px,4.4vw,58px); letter-spacing: -.065em; }
  .profile-container > .profile-card:first-of-type { grid-column: 1; grid-row: 2 / span 2; min-height: 300px; display: flex; flex-direction: column; justify-content: center; }
  .profile-container > .profile-card:nth-of-type(2) { grid-column: 2; }
  .profile-container > .profile-card:last-of-type { grid-column: 2; }
  .profile-user { align-items: flex-start; flex-direction: column; gap: 20px; }
  .profile-avatar { width: 96px; height: 96px; font-size: 34px; box-shadow: 0 12px 28px rgba(140,105,0,.18); }
  .profile-activity-grid { gap: 12px; }
  .profile-activity-item { min-height: 142px; border-radius: 8px 18px 8px 18px; background: linear-gradient(145deg,#FFFDF7,#F6EEDC); box-shadow: 0 9px 20px rgba(54,45,28,.055); }
  .profile-activity-item:nth-child(2) { transform: translateY(9px); }
  .profile-activity-item:hover { transform: translateY(-4px); }
  @media(max-width: 800px) { .profile-container { grid-template-columns: 1fr; } .profile-container > .profile-card:first-of-type, .profile-container > .profile-card:nth-of-type(2), .profile-container > .profile-card:last-of-type { grid-column: 1; grid-row: auto; } .profile-user { flex-direction: row; } .profile-activity-item:nth-child(2) { transform: none; } }
  @media(max-width: 600px) { .profile-user { align-items: center; flex-direction: row; } .profile-avatar { width: 68px; height: 68px; font-size: 25px; } }

  /* ---------- Login / signup: split composition ---------- */
  .signup-page {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 1080px;
    min-height: min(760px, calc(100vh - 160px));
    padding: 36px 0 60px;
  }
  .signup-page > .signup-wrapper {
    display: grid;
    grid-template-columns: minmax(220px,.82fr) minmax(0,1.18fr);
    align-items: center;
    gap: clamp(24px,4vw,56px);
    width: 100%;
  }
  .signup-page .signup-brand { grid-column: 1; grid-row: 1; align-self: end; }
  .signup-page .signup-card {
    grid-column: 2; grid-row: 1 / span 2;
    display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); align-items: center; gap: 26px;
    position: relative; padding: clamp(28px,4vw,54px);
    border: 1px solid rgba(255,255,255,.86); border-radius: 26px;
    background: rgba(255,254,250,.82); box-shadow: 0 26px 64px rgba(54,45,28,.1); backdrop-filter: blur(18px);
  }
  .signup-page .signup-card::before { content: "M"; position: absolute; right: 24px; top: -38px; color: rgba(255,212,59,.22); font: 900 160px/1 Georgia,serif; pointer-events: none; }
  .signup-page .signup-card-heading { grid-column: 1; grid-row: 1 / span 2; padding: 0; margin: 0; background: transparent; border: 0; }
  .signup-page .signup-card-heading h1 { font-size: clamp(30px,3.6vw,44px); line-height: 1.13; letter-spacing: -.06em; }
  .signup-page .signup-card-heading p { max-width: 320px; line-height: 1.9; }
  .signup-page .signup-note-label { flex-wrap: wrap; }
  .signup-page .signup-card form, .signup-page .signup-footer { grid-column: 2; }
  .signup-page .signup-card form { grid-row: 1; }
  .signup-page .signup-footer { grid-row: 2; align-self: start; margin-top: 0; }
  .signup-page .signup-field input { min-height: 50px; border-radius: 7px 14px 7px 14px; background: rgba(255,255,255,.88); }
  .signup-page .signup-submit { min-height: 54px; border: 1px solid #D6AD27; border-radius: 7px 16px 7px 16px; box-shadow: 0 9px 18px rgba(140,105,0,.16), inset 0 1px 0 rgba(255,255,255,.5); }
  .signup-page .signup-bottom-caption { margin-top: 18px; text-align: center; }
  @media(max-width: 760px) {
    .signup-page { display: flex; flex-direction: column; align-items: stretch; min-height: 0; padding: 20px 0 48px; }
    .signup-page > .signup-wrapper { display: flex; flex-direction: column; gap: 20px; }
    .signup-page .signup-card { display: flex; flex-direction: column; align-items: stretch; gap: 20px; padding: 24px 18px; }
    .signup-page .signup-card-heading { width: 100%; }
    .signup-page .signup-card form, .signup-page .signup-footer { width: 100%; }
    .signup-page .signup-brand { align-self: flex-start; }
    .signup-page .signup-bottom-caption { text-align: center; }
  }

  /* ---------- Favorites / activity pages ---------- */
  .favorite-page-container { max-width: 1440px; }
  .favorite-page { position: relative; }
  .favorite-page .movie-grid { grid-template-columns: repeat(5,minmax(0,1fr)); gap: 28px 18px; }
  .favorite-page .movie-card, .favorite-page .favorite-movie-card { transition: transform .3s ease; }
  .favorite-page .movie-card:hover, .favorite-page .favorite-movie-card:hover { transform: translateY(-7px) rotate(.5deg); }
  .my-reviews-heading, .liked-reviews-heading { min-height: 190px; padding: clamp(28px,4vw,54px); border-radius: 26px; background: radial-gradient(circle at 90% 20%,rgba(255,212,59,.3),transparent 18rem), linear-gradient(120deg,#FFFDF7,#F0E6D4); box-shadow: 0 22px 48px rgba(54,45,28,.08); }
  .my-reviews-heading h1, .liked-reviews-heading h1 { font-size: clamp(34px,4.4vw,56px); letter-spacing: -.06em; }
  .my-reviews-card, .liked-reviews-card { border: 0; border-radius: 22px; background: rgba(255,254,250,.8); box-shadow: 0 16px 36px rgba(54,45,28,.065); }
  .my-reviews-page, .liked-reviews-page { max-width: 1440px; margin: 0 auto; }
  .my-reviews-list, .liked-reviews-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }
  .my-review-item, .liked-review-item { min-width: 0; padding: 20px; border: 1px solid rgba(229,222,209,.86); border-radius: 16px; background: linear-gradient(145deg,rgba(255,255,255,.9),rgba(255,250,236,.74)); box-shadow: 0 8px 20px rgba(54,45,28,.045); }
  .my-review-item:hover, .liked-review-item:hover { background: #FFF7DF; transform: translateY(-3px); }
  .my-review-info h3, .liked-review-title { font-size: 17px; letter-spacing: -.035em; }
  .liked-reviews-container { max-width: 1240px; }
  @media(max-width: 760px) { .my-reviews-list, .liked-reviews-list { grid-template-columns: 1fr; } }

  /* ---------- Common layered surfaces / form controls ---------- */
  .review-write-section { border: 1px solid rgba(214,166,20,.25); border-radius: 18px; background: linear-gradient(145deg,#FFF8E4,#FFFDF7); box-shadow: 0 16px 36px rgba(54,45,28,.07); }
  .review-write-toggle { min-height: 72px; padding: 20px 25px; font-size: 14px; }
  .review-write-content { padding: clamp(22px,3vw,38px); background: rgba(255,254,250,.78); }
  .review-title-field input, .review-content-field textarea, .profile-form input, .signup-field input { transition: border-color .2s ease, box-shadow .2s ease, background .2s ease; }
  .review-title-field input:focus, .review-content-field textarea:focus, .profile-form input:focus, .signup-field input:focus { border-color: #9C791B; box-shadow: 0 0 0 4px rgba(255,212,59,.19); }
  .review-form-actions button { min-height: 48px; border-radius: 7px 15px 7px 15px; box-shadow: 0 8px 16px rgba(140,105,0,.14); }

  @media(max-width: 600px) {
    .movie-detail-header { grid-template-columns: 1fr; min-height: 0; padding: 20px; gap: 24px; }
    .movie-detail-poster { width: min(62%,240px); margin: 0 auto; }
    .movie-detail-info h1 { font-size: 34px; }
    .all-reviews-heading { align-items: flex-start; }
    .all-reviews-count { display: none; }
    .all-reviews-search { grid-template-columns: 1fr 1fr; }
    .all-reviews-search-label, .all-reviews-search-select, .all-reviews-search-input { grid-column: 1 / -1; }
    .favorite-page .movie-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  }

  @media(prefers-reduced-motion: reduce) {
    .movie-detail-poster, .movie-card, .person-chip, .profile-activity-item, .recommend-banner, .recommend-poster { transition: none !important; transform: none !important; }
  }
`;

export default MomoSpatialExperienceStyles;
