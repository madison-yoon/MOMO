import { createGlobalStyle } from "styled-components";

/*
 * Final detail pass for MOMO Paper Glass.
 * Focus: real DOM structure, readable contrast, tactile labels and complete rating UI.
 */
const PaperGlassDetailPolishStyles = createGlobalStyle`
  :root {
    --momo-muted: #6A6256;
    --momo-placeholder: #776F62;
    --momo-text-soft: #4B463B;
    --momo-link: #634C0B;
    --momo-accent-ink: #51400F;
    --momo-detail-line: rgba(135, 153, 171, .2);
    --momo-detail-margin: rgba(197, 112, 101, .2);
  }

  /* MY PAGE — the activity links are three full memo objects, not plain text links. */
  #root .profile-page .profile-card:has(.profile-activity-grid) {
    display: block;
    width: 100%;
    padding: clamp(22px, 3vw, 34px);
  }
  #root .profile-page .profile-card:has(.profile-activity-grid) > .profile-card-heading {
    display: flex;
    width: 100%;
    margin-bottom: 22px;
  }
  #root .profile-page .profile-activity-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 16px;
  }
  #root .profile-page .profile-activity-item {
    position: relative;
    isolation: isolate;
    display: flex;
    min-width: 0;
    min-height: 218px;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 0;
    padding: 23px 20px 17px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.97);
    border-radius: 8px 17px 16px 15px;
    background:
      linear-gradient(90deg, transparent 0 25px, var(--momo-detail-margin) 25px 26px, transparent 26px),
      repeating-linear-gradient(0deg, transparent 0 29px, var(--momo-detail-line) 30px, transparent 31px),
      linear-gradient(145deg, rgba(255,255,255,.94), rgba(255,249,229,.88));
    box-shadow:
      0 3px 6px rgba(62,49,28,.035),
      0 10px 22px rgba(62,49,28,.075),
      inset 0 1px rgba(255,255,255,.99);
    color: #302B22;
    text-align: left;
    text-decoration: none;
    transform: translateY(0);
    transition:
      transform 240ms cubic-bezier(.2,.72,.2,1),
      box-shadow 240ms ease,
      border-color 240ms ease,
      background 240ms ease;
  }
  #root .profile-page .profile-activity-item::before {
    position: absolute;
    z-index: 2;
    top: 10px;
    left: 50%;
    width: 70px;
    height: 18px;
    content: "";
    border-right: 1px solid rgba(196,158,87,.22);
    border-left: 1px solid rgba(196,158,87,.22);
    background: linear-gradient(180deg, rgba(255,225,155,.62), rgba(255,231,183,.36));
    box-shadow: 0 2px 5px rgba(67,51,26,.055);
    transform: translateX(-50%) rotate(-1.5deg);
    pointer-events: none;
  }
  #root .profile-page .profile-activity-item::after {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    width: 43px;
    height: 43px;
    content: "";
    background: linear-gradient(225deg, rgba(220,207,177,.86) 0 48%, rgba(255,255,255,.86) 49% 52%, transparent 53%);
    filter: drop-shadow(-2px 3px 3px rgba(62,49,28,.07));
    pointer-events: none;
  }
  #root .profile-page .profile-activity-item[data-tone="writing"] {
    background:
      linear-gradient(90deg, transparent 0 25px, rgba(197,112,101,.2) 25px 26px, transparent 26px),
      repeating-linear-gradient(0deg, transparent 0 29px, rgba(135,153,171,.2) 30px, transparent 31px),
      linear-gradient(145deg, #FFFEF8, #FFF8E8);
  }
  #root .profile-page .profile-activity-item[data-tone="liked"] {
    background:
      linear-gradient(90deg, transparent 0 25px, rgba(197,112,101,.17) 25px 26px, transparent 26px),
      repeating-linear-gradient(0deg, transparent 0 29px, rgba(135,153,171,.18) 30px, transparent 31px),
      linear-gradient(145deg, #FFFDFC, #FFF2EE);
  }
  #root .profile-page .profile-activity-item[data-tone="saved"] {
    background:
      linear-gradient(90deg, transparent 0 25px, rgba(197,112,101,.18) 25px 26px, transparent 26px),
      repeating-linear-gradient(0deg, transparent 0 29px, rgba(135,153,171,.18) 30px, transparent 31px),
      linear-gradient(145deg, #FFFEF8, #FFF6D9);
  }
  #root .profile-page .profile-activity-item:hover {
    border-color: rgba(223,190,113,.82);
    box-shadow:
      0 5px 9px rgba(62,49,28,.045),
      0 20px 34px rgba(62,49,28,.13),
      inset 0 1px rgba(255,255,255,1);
    transform: translateY(-6px) rotate(-.25deg);
  }
  #root .profile-page .profile-activity-item:active {
    box-shadow: 0 4px 9px rgba(62,49,28,.07), inset 0 2px 5px rgba(62,49,28,.06);
    transform: translateY(-1px) scale(.995);
  }
  #root .profile-page .profile-activity-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 46px;
    margin-bottom: 13px;
  }
  #root .profile-page .profile-activity-kicker {
    color: #76613B;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .16em;
  }
  #root .profile-page .profile-activity-icon {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    flex: 0 0 42px;
    width: 42px;
    height: 42px;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 12px;
    background: rgba(255,255,255,.72);
    box-shadow: 0 5px 12px rgba(65,51,29,.085), inset 0 1px rgba(255,255,255,1);
    color: #72551C;
    font-size: 21px;
    line-height: 1;
    transition: transform 240ms cubic-bezier(.2,.72,.2,1), box-shadow 240ms ease;
  }
  #root .profile-page .profile-activity-item[data-tone="liked"] .profile-activity-icon {
    color: #A44C4D;
  }
  #root .profile-page .profile-activity-item:hover .profile-activity-icon {
    box-shadow: 0 8px 16px rgba(65,51,29,.12), inset 0 1px rgba(255,255,255,1);
    transform: translateY(-2px) rotate(-5deg) scale(1.04);
  }
  #root .profile-page .profile-activity-item h3 {
    display: block;
    margin: 0 0 9px;
    color: #393329;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: -.025em;
  }
  #root .profile-page .profile-activity-count-row {
    display: inline-flex;
    align-items: baseline;
    align-self: flex-start;
    gap: 5px;
    min-width: 78px;
    min-height: 47px;
    padding: 4px 12px 5px;
    border: 1px solid rgba(218,190,126,.64);
    border-radius: 10px;
    background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,247,217,.92));
    box-shadow: 0 4px 10px rgba(86,66,28,.06), inset 0 1px rgba(255,255,255,.98);
  }
  #root .profile-page .profile-activity-count {
    color: #493710;
    font-size: 29px;
    font-weight: 950;
    line-height: 1.2;
    letter-spacing: -.055em;
    font-variant-numeric: tabular-nums;
  }
  #root .profile-page .profile-activity-unit {
    color: #655331;
    font-size: 11px;
    font-weight: 850;
  }
  #root .profile-page .profile-activity-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
    padding-top: 15px;
    border-top: 1px dashed rgba(158,139,103,.42);
  }
  #root .profile-page .profile-activity-footer p {
    display: block;
    margin: 0;
    color: #655B4B;
    font-size: 11px;
    font-weight: 750;
    line-height: 1.5;
  }
  #root .profile-page .profile-activity-arrow {
    display: grid;
    place-items: center;
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 9px;
    background: rgba(255,255,255,.72);
    box-shadow: 0 3px 8px rgba(62,49,28,.055), inset 0 1px rgba(255,255,255,.98);
    color: #684F1B;
    font-size: 15px;
    font-weight: 900;
    transition: transform 200ms cubic-bezier(.2,.72,.2,1), background 200ms ease;
  }
  #root .profile-page .profile-activity-item:hover .profile-activity-arrow {
    background: #FFF2C4;
    transform: translate(2px,-2px);
  }

  /* Audience rating — the card remains visible even when an ID cannot be rated yet. */
  #root .movie-detail-page .movie-rating-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 22px;
    padding: clamp(20px, 2.8vw, 30px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 20px 20px 18px 18px;
    background:
      linear-gradient(90deg, transparent 0 28px, rgba(197,112,101,.14) 28px 29px, transparent 29px),
      repeating-linear-gradient(0deg, transparent 0 31px, rgba(135,153,171,.12) 32px, transparent 33px),
      radial-gradient(circle at 94% 5%, rgba(255,213,95,.24), transparent 34%),
      linear-gradient(145deg, rgba(255,255,255,.93), rgba(255,248,224,.9));
    box-shadow:
      0 3px 7px rgba(62,49,28,.035),
      0 14px 32px rgba(62,49,28,.085),
      inset 0 1px rgba(255,255,255,1);
    backdrop-filter: blur(18px) saturate(135%);
    -webkit-backdrop-filter: blur(18px) saturate(135%);
  }
  #root .movie-detail-page .movie-rating-panel::before {
    position: absolute;
    top: 10px;
    right: clamp(28px, 5vw, 56px);
    width: 74px;
    height: 18px;
    content: "";
    border-right: 1px solid rgba(196,158,87,.2);
    border-left: 1px solid rgba(196,158,87,.2);
    background: rgba(255,225,155,.5);
    box-shadow: 0 2px 5px rgba(67,51,26,.05);
    transform: rotate(2deg);
    pointer-events: none;
  }
  #root .movie-detail-page .rating-panel-heading {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(170,151,112,.28);
  }
  #root .movie-detail-page .rating-panel-eyebrow {
    display: block;
    margin: 0 0 7px;
    color: #80652C;
    font-size: 9px;
    font-weight: 950;
    letter-spacing: .2em;
  }
  #root .movie-detail-page .rating-label {
    display: block;
    margin: 0;
    color: #342E22;
    font-size: 19px;
    font-weight: 950;
    letter-spacing: -.04em;
  }
  #root .movie-detail-page .rating-panel-description {
    margin: 5px 0 0;
    color: #62594B;
    font-size: 12px;
    line-height: 1.6;
  }
  #root .movie-detail-page .rating-panel-stamp {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    min-height: 27px;
    padding: 0 10px;
    border: 1px solid rgba(208,178,105,.52);
    border-radius: 6px;
    background: rgba(255,246,214,.9);
    box-shadow: 0 3px 8px rgba(79,60,24,.045), inset 0 1px rgba(255,255,255,.98);
    color: #65501E;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .08em;
    white-space: nowrap;
  }
  #root .movie-detail-page .rating-panel-main {
    display: grid;
    grid-template-columns: minmax(180px, .82fr) minmax(0, 1.18fr);
    gap: 18px;
    align-items: stretch;
  }
  #root .movie-detail-page .movie-score-display {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    min-width: 0;
    padding: 17px 19px;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 13px;
    background: rgba(255,255,255,.66);
    box-shadow: 0 5px 13px rgba(62,49,28,.055), inset 0 1px rgba(255,255,255,.98);
  }
  #root .movie-detail-page .movie-score-value {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  #root .movie-detail-page .movie-score-value strong {
    color: #4E3A11;
    font-size: clamp(38px, 5vw, 50px);
    font-weight: 950;
    line-height: 1;
    letter-spacing: -.065em;
    font-variant-numeric: tabular-nums;
  }
  #root .movie-detail-page .movie-score-value span {
    color: #70634A;
    font-size: 12px;
    font-weight: 800;
  }
  #root .movie-detail-page .rating-vote-summary {
    margin: 10px 0 0;
    color: #4E483D;
    font-size: 12px;
    font-weight: 800;
  }
  #root .movie-detail-page .rating-score-caption {
    display: block;
    margin-top: 5px;
    color: #716653;
    font-size: 10px;
    line-height: 1.5;
  }
  #root .movie-detail-page .rating-distribution {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 17px 18px;
    border: 1px solid rgba(224,211,178,.68);
    border-radius: 13px;
    background: rgba(255,250,235,.78);
    box-shadow: inset 0 1px rgba(255,255,255,.96);
  }
  #root .movie-detail-page .rating-distribution-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 13px;
    color: #62543A;
    font-size: 11px;
    font-weight: 800;
  }
  #root .movie-detail-page .rating-distribution-heading strong {
    color: #59400D;
    font-size: 14px;
    font-weight: 950;
    font-variant-numeric: tabular-nums;
  }
  #root .movie-detail-page .rating-distribution-track {
    position: relative;
    width: 100%;
    height: 11px;
    overflow: hidden;
    border: 1px solid rgba(189,173,139,.42);
    border-radius: 999px;
    background: rgba(226,219,201,.72);
    box-shadow: inset 0 1px 2px rgba(67,55,34,.08);
  }
  #root .movie-detail-page .rating-distribution-track span {
    display: block;
    height: 100%;
    min-width: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, #C99B35, #F2D375);
    box-shadow: 0 0 9px rgba(204,164,69,.2);
    transition: width 420ms cubic-bezier(.2,.72,.2,1);
  }
  #root .movie-detail-page .rating-distribution-legend {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-top: 12px;
    color: #5F574B;
    font-size: 10px;
    font-weight: 800;
  }
  #root .movie-detail-page .rating-distribution-legend > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  #root .movie-detail-page .rating-legend-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #C49A36;
  }
  #root .movie-detail-page .rating-legend-dot.is-dislike { background: #C77E78; }
  #root .movie-detail-page .detail-reaction-counts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin: 0;
  }
  #root .movie-detail-page .rating-vote-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 58px;
    padding: 10px 16px;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 12px;
    background: rgba(255,255,255,.76);
    box-shadow: 0 4px 11px rgba(62,49,28,.055), inset 0 1px rgba(255,255,255,.98);
    color: #4C4436;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
    transition: transform 180ms cubic-bezier(.2,.72,.2,1), box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
  }
  #root .movie-detail-page .rating-vote-button.is-like { background: rgba(255,249,220,.92); }
  #root .movie-detail-page .rating-vote-button.is-dislike { background: rgba(255,245,241,.92); }
  #root .movie-detail-page .rating-vote-button strong {
    color: #403622;
    font-size: 18px;
    font-weight: 950;
    font-variant-numeric: tabular-nums;
  }
  #root .movie-detail-page .rating-vote-button:hover:not(:disabled) {
    border-color: rgba(204,167,80,.78);
    box-shadow: 0 8px 17px rgba(62,49,28,.095), inset 0 1px rgba(255,255,255,.98);
    transform: translateY(-2px);
  }
  #root .movie-detail-page .rating-vote-button.selected-like {
    border: 2px solid #C99C37;
    background: linear-gradient(145deg, #FFF5CF, #FFEBA6);
    color: #563D0B;
  }
  #root .movie-detail-page .rating-vote-button.selected-dislike {
    border: 2px solid #C77E78;
    background: linear-gradient(145deg, #FFF3EF, #FFE2DE);
    color: #793F3D;
  }
  #root .movie-detail-page .rating-vote-button:disabled { opacity: .62; }
  #root .movie-detail-page .detail-total-count {
    margin: 0;
    padding-top: 11px;
    border-top: 1px dashed rgba(158,139,103,.4);
    color: #62594C;
    font-size: 11px;
    text-align: right;
  }
  #root .movie-detail-page .detail-total-count strong { color: #403622; font-weight: 900; }
  #root .movie-detail-page .rating-status,
  #root .movie-detail-page .rating-error {
    margin: 0;
    color: #655333;
    font-size: 11px;
    font-weight: 750;
  }
  #root .movie-detail-page .rating-error { color: #9A4141; }
  #root .movie-detail-page .rating-unavailable {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 12px 14px;
    border: 1px dashed rgba(184,151,78,.56);
    border-radius: 11px;
    background: rgba(255,249,226,.78);
    color: #665534;
  }
  #root .movie-detail-page .rating-unavailable > span {
    display: grid;
    place-items: center;
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 8px;
    background: rgba(255,255,255,.76);
    color: #80652C;
  }
  #root .movie-detail-page .rating-unavailable p {
    margin: 0;
    font-size: 11px;
    font-weight: 750;
    line-height: 1.6;
  }

  /* Poster labels — shared paper-glass badge language. */
  #root .favorite-star {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 5;
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    padding: 0;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 13px 13px 13px 5px;
    background: rgba(255,254,248,.88);
    box-shadow: 0 6px 16px rgba(28,22,14,.2), inset 0 1px rgba(255,255,255,1);
    backdrop-filter: blur(16px) saturate(145%);
    -webkit-backdrop-filter: blur(16px) saturate(145%);
    color: #6B551D;
    font-family: inherit;
    font-size: 22px;
    font-weight: 900;
    line-height: 1;
    transition: transform 200ms cubic-bezier(.2,.72,.2,1), box-shadow 200ms ease, background 200ms ease, color 200ms ease;
  }
  #root .favorite-star:hover {
    border-color: rgba(232,205,138,.92);
    background: #FFF8DC;
    box-shadow: 0 10px 21px rgba(28,22,14,.23), inset 0 1px rgba(255,255,255,1);
    color: #8A6410;
    transform: translateY(-2px) rotate(-3deg) scale(1.04);
  }
  #root .favorite-star.is-active {
    border-color: rgba(255,255,255,.98);
    background: linear-gradient(145deg, #FFEBA0, #F4CF5D);
    box-shadow: 0 7px 17px rgba(110,79,14,.28), inset 0 1px rgba(255,255,255,.92);
    color: #5A410C;
  }
  #root .favorite-star:active { transform: scale(.94); }
  #root .favorite-star:focus-visible { outline: 3px solid rgba(205,157,55,.62); outline-offset: 3px; }
  #root .favorite-star:disabled { opacity: .72; cursor: progress; }

  #root .recommend-content .recommend-label {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 29px;
    margin: 0 0 12px;
    padding: 5px 11px 5px 9px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 7px 7px 8px 3px;
    background: linear-gradient(145deg, rgba(255,250,225,.98), rgba(255,231,159,.94));
    box-shadow: 0 5px 13px rgba(0,0,0,.16), inset 0 1px rgba(255,255,255,1);
    color: #57400D;
    font-size: 10px;
    font-weight: 950;
    letter-spacing: .04em;
    transform: rotate(-1.2deg);
    transition: transform 200ms cubic-bezier(.2,.72,.2,1), box-shadow 200ms ease;
  }
  #root .recommend-content .recommend-label::before {
    content: "✦";
    color: #9A741D;
    font-size: 12px;
  }
  #root .recommend-content .recommend-label::after {
    position: absolute;
    top: -6px;
    right: 15px;
    width: 34px;
    height: 10px;
    content: "";
    border-right: 1px solid rgba(255,255,255,.35);
    border-left: 1px solid rgba(255,255,255,.35);
    background: rgba(255,255,255,.24);
    transform: rotate(2deg);
  }
  #root .recommend-content:hover .recommend-label {
    box-shadow: 0 7px 17px rgba(0,0,0,.2), inset 0 1px rgba(255,255,255,1);
    transform: rotate(0) translateY(-1px);
  }
  #root .recommend-content .recommend-info {
    color: rgba(255,255,255,.92);
    text-shadow: 0 1px 2px rgba(0,0,0,.28);
  }
  #root .recommend-content .recommend-description {
    color: rgba(255,255,255,.94);
    text-shadow: 0 1px 2px rgba(0,0,0,.28);
  }
  #root .recommend-content .recommend-button {
    min-height: 42px;
    padding: 0 17px;
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 11px;
    background: linear-gradient(145deg, #FFEBA0, #F4CF5D);
    box-shadow: 0 7px 17px rgba(0,0,0,.18), inset 0 1px rgba(255,255,255,.88);
    color: #51400F;
    font-size: 12px;
    font-weight: 900;
  }
  #root .recommend-content .recommend-button:hover {
    background: linear-gradient(145deg, #FFF1B8, #F7D66E);
    box-shadow: 0 11px 22px rgba(0,0,0,.23), inset 0 1px rgba(255,255,255,.94);
    transform: translateY(-2px);
  }

  /* Box-office rank and saved movie mats share one compact label system. */
  #root .home-page .movie-info h3 { color: #342F25; }
  #root .home-page .movie-info p { color: #696052; }
  #root .favorite-page-card {
    padding: 9px;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,249,231,.86));
    box-shadow: 0 6px 16px rgba(62,49,28,.07), inset 0 1px rgba(255,255,255,.98);
    transition: transform 240ms cubic-bezier(.2,.72,.2,1), box-shadow 240ms ease, border-color 240ms ease;
  }
  #root .favorite-page-card:hover {
    border-color: rgba(221,189,112,.78);
    box-shadow: 0 15px 27px rgba(62,49,28,.13), inset 0 1px rgba(255,255,255,1);
    transform: translateY(-5px) rotate(-.2deg);
  }
  #root .favorite-page-poster {
    position: relative;
    padding: 5px;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 11px;
    background: rgba(255,255,255,.76);
    box-shadow: 0 5px 12px rgba(47,36,20,.11), inset 0 1px rgba(255,255,255,1);
  }
  #root .favorite-page-poster > .favorite-page-open-button,
  #root .favorite-page-poster img { border-radius: 7px; }
  #root .favorite-page-movie-info h3 {
    color: #373126;
    font-size: 13px;
    font-weight: 900;
  }
  #root .favorite-page-movie-info p {
    color: #6E6557;
    font-size: 11px;
    font-weight: 650;
  }
  #root .favorite-list-toolbar > span {
    color: #5D4919;
    background: linear-gradient(145deg, rgba(255,250,230,.96), rgba(255,241,196,.88));
    border-color: rgba(211,181,112,.62);
    box-shadow: 0 3px 9px rgba(94,70,24,.055), inset 0 1px rgba(255,255,255,.98);
  }

  /* High contrast for small labels and secondary copy. */
  #root .profile-heading p,
  #root .profile-card-heading p,
  #root .movie-detail-info > p:not(.eyebrow),
  #root .detail-section-count,
  #root .all-reviews-description,
  #root .my-reviews-heading p,
  #root .liked-reviews-heading p,
  #root .favorite-page-heading p,
  #root .favorite-page-empty p,
  #root .search-page-heading p {
    color: #625A4E;
  }
  #root .profile-user-info span { color: #655D51; }
  #root .profile-user-info p { color: #3F3A31; }
  #root .detail-rank {
    border-color: rgba(197,162,80,.64);
    background: rgba(255,245,208,.92);
    color: #5D4712;
  }
  #root .page-back-link,
  #root .profile-button,
  #root .favorite-back-button,
  #root .detail-back-button,
  #root .review-detail-back {
    color: #4D4639;
    font-weight: 850;
  }

  /* Shared buttons use the same compact paper-glass shape and tactile motion. */
  #root .profile-button,
  #root .page-back-link,
  #root .favorite-back-button,
  #root .detail-back-button,
  #root .review-detail-back,
  #root .people-more-button,
  #root .person-bio-toggle,
  #root .home-favorites-more {
    min-height: 40px;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(255,255,255,.9), rgba(255,249,231,.86));
    box-shadow: 0 4px 11px rgba(62,49,28,.06), inset 0 1px rgba(255,255,255,.99);
    color: #4C4538;
    font-size: 11px;
    font-weight: 900;
    transition: transform 180ms cubic-bezier(.2,.72,.2,1), box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
  }
  #root .profile-button:hover,
  #root .page-back-link:hover,
  #root .favorite-back-button:hover,
  #root .detail-back-button:hover,
  #root .review-detail-back:hover,
  #root .people-more-button:hover,
  #root .person-bio-toggle:hover,
  #root .home-favorites-more:hover {
    border-color: rgba(216,183,107,.78);
    background: #FFF9E7;
    box-shadow: 0 8px 17px rgba(62,49,28,.11), inset 0 1px rgba(255,255,255,1);
    transform: translateY(-2px);
  }
  #root a:focus-visible,
  #root button:focus-visible {
    outline: 3px solid rgba(173,132,38,.5);
    outline-offset: 3px;
  }

  @media (max-width: 860px) {
    #root .profile-page .profile-activity-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  }
  @media (max-width: 600px) {
    #root .profile-page .profile-activity-grid { grid-template-columns: 1fr; gap: 12px; }
    #root .profile-page .profile-activity-item { min-height: 190px; padding: 21px 18px 16px; }
    #root .movie-detail-page .rating-panel-heading { flex-direction: column; align-items: flex-start; }
    #root .movie-detail-page .rating-panel-main { grid-template-columns: 1fr; }
    #root .movie-detail-page .rating-distribution { min-height: 112px; }
    #root .movie-detail-page .detail-reaction-counts { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 380px) {
    #root .movie-detail-page .detail-reaction-counts { grid-template-columns: 1fr; }
    #root .movie-detail-page .rating-panel-stamp { font-size: 8px; }
  }
  @media (prefers-reduced-motion: reduce) {
    #root .profile-page .profile-activity-item,
    #root .profile-page .profile-activity-icon,
    #root .profile-page .profile-activity-arrow,
    #root .favorite-star,
    #root .recommend-content .recommend-label {
      animation: none;
      transition: none;
    }
  }
`;

export default PaperGlassDetailPolishStyles;
