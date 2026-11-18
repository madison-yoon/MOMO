import { createGlobalStyle } from "styled-components";

/*
 * MOMO route experience system.
 * This module owns page composition for archive, movie, review and account routes.
 * Shared control materials are defined separately in MomoMaterialSystem.styles.js.
 */
const MomoLiquidGlassPageStyles = createGlobalStyle`
  :root {
    --momo-route-ink: #292820;
    --momo-route-body: #514C40;
    --momo-route-muted: #6A6251;
    --momo-route-paper: rgba(255,250,236,.78);
    --momo-route-glass: linear-gradient(138deg, rgba(255,255,255,.78), rgba(255,250,236,.48) 60%, rgba(255,244,210,.34));
    --momo-route-edge: rgba(255,255,255,.9);
    --momo-route-depth: 0 3px 8px rgba(41,40,32,.035), 0 16px 36px rgba(41,40,32,.075), inset 0 1px 0 rgba(255,255,255,.98);
    --momo-route-blur: 26px;
  }

  /* ---------------------------------------------------------
     Shared archive headers: editorial hierarchy with a visible
     glass plane, warm light refraction and a single accent rule.
  --------------------------------------------------------- */
  #root .all-reviews-heading,
  #root .my-reviews-heading,
  #root .liked-reviews-heading,
  #root .favorite-page-heading {
    --route-accent: #B38D19;
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 164px;
    margin: 0 0 24px;
    padding: clamp(26px, 3.5vw, 40px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 22px;
    background: linear-gradient(132deg, rgba(255,254,250,.88), rgba(255,250,236,.58) 65%, rgba(255,243,194,.34));
    box-shadow: var(--momo-route-depth);
    -webkit-backdrop-filter: blur(28px) saturate(150%);
    backdrop-filter: blur(28px) saturate(150%);
  }
  #root .all-reviews-heading::before,
  #root .my-reviews-heading::before,
  #root .liked-reviews-heading::before,
  #root .favorite-page-heading::before {
    position: absolute;
    z-index: 0;
    top: 28px;
    bottom: 28px;
    left: 0;
    width: 3px;
    content: "";
    border-radius: 0 3px 3px 0;
    background: var(--route-accent);
    box-shadow: 0 0 0 1px rgba(255,255,255,.24);
    pointer-events: none;
  }
  #root .all-reviews-heading::after,
  #root .my-reviews-heading::after,
  #root .liked-reviews-heading::after,
  #root .favorite-page-heading::after {
    position: absolute;
    z-index: 0;
    top: -55%;
    right: -8%;
    width: 52%;
    height: 190%;
    content: "";
    border-left: 1px solid rgba(255,255,255,.34);
    background: linear-gradient(112deg, transparent 12%, rgba(255,255,255,.26) 48%, transparent 82%);
    transform: rotate(12deg);
    pointer-events: none;
  }
  #root .all-reviews-heading > *,
  #root .my-reviews-heading > *,
  #root .liked-reviews-heading > *,
  #root .favorite-page-heading > * {
    position: relative;
    z-index: 1;
    min-width: 0;
  }
  #root .all-reviews-heading h1,
  #root .my-reviews-heading h1,
  #root .liked-reviews-heading h1,
  #root .favorite-page-heading h1 {
    margin: 0 0 8px;
    color: #292820;
    font-size: clamp(29px, 3.4vw, 40px);
    font-weight: 850;
    line-height: 1.12;
    letter-spacing: -.055em;
  }
  #root .all-reviews-heading p,
  #root .my-reviews-heading p:not(.my-reviews-eyebrow),
  #root .liked-reviews-heading p,
  #root .favorite-page-heading p {
    margin: 0;
    color: #625B4F;
    font-size: 13px;
    line-height: 1.75;
  }
  #root .my-reviews-heading .my-reviews-eyebrow,
  #root .liked-reviews-heading .liked-reviews-eyebrow,
  #root .favorite-page-heading .favorite-page-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 11px;
    color: var(--route-accent);
    font-size: 10px;
    font-weight: 850;
    letter-spacing: .15em;
  }
  #root .my-reviews-heading .my-reviews-eyebrow::before,
  #root .liked-reviews-heading .liked-reviews-eyebrow::before,
  #root .favorite-page-heading .favorite-page-eyebrow::before {
    width: 6px;
    height: 6px;
    content: "";
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 0 3px rgba(255,212,59,.2);
  }
  #root .all-reviews-heading { --route-accent: #768C80; }
  #root .my-reviews-heading { --route-accent: #88734D; }
  #root .liked-reviews-heading { --route-accent: #9A6258; }
  #root .favorite-page-heading { --route-accent: #596A4E; }

  #root .page-back-link,
  #root .favorite-back-button,
  #root .review-detail-back {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid rgba(255,255,255,.92);
    border-radius: 999px;
    background: linear-gradient(145deg, rgba(255,255,255,.84), rgba(255,250,236,.62));
    box-shadow: 0 4px 11px rgba(41,40,32,.045), inset 0 1px rgba(255,255,255,.98);
    color: #514C40;
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
    -webkit-backdrop-filter: blur(18px) saturate(145%);
    backdrop-filter: blur(18px) saturate(145%);
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  #root .page-back-link:hover,
  #root .favorite-back-button:hover,
  #root .review-detail-back:hover {
    border-color: rgba(214,180,63,.64);
    background: rgba(255,255,255,.94);
    box-shadow: 0 8px 17px rgba(41,40,32,.085), inset 0 1px rgba(255,255,255,1);
  }

  /* ---------------------------------------------------------
     Favorites: the saved collection is an image-first gallery,
     not a stack of flat dashboard cards.
  --------------------------------------------------------- */
  #root .favorite-page {
    min-height: 100%;
    padding: 0 0 54px;
    background: linear-gradient(180deg, rgba(255,212,59,.105), rgba(255,212,59,.025) 360px, transparent 660px);
  }
  #root .favorite-page-container {
    width: min(1280px, 100%);
    max-width: 1280px;
    margin: 0 auto;
  }
  #root .favorite-page-heading {
    min-height: 164px;
    margin-bottom: 23px;
    border-radius: 21px;
    background: linear-gradient(132deg, rgba(255,254,250,.92), rgba(255,250,236,.62) 68%, rgba(255,243,194,.3));
  }
  #root .favorite-page .favorite-list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 45px;
    margin: 0 0 19px;
    padding: 0 2px 11px;
    border-bottom: 1px solid rgba(179,141,25,.2);
  }
  #root .favorite-page .favorite-list-toolbar > span {
    display: inline-flex;
    align-items: center;
    min-height: 31px;
    padding: 0 12px;
    border: 1px solid rgba(214,180,63,.48);
    border-radius: 999px;
    background: rgba(255,241,178,.5);
    color: #66510F;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: -.01em;
  }
  #root .favorite-page .favorite-page-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 22px 18px;
  }
  #root .favorite-page .favorite-page-card {
    position: relative;
    display: flex;
    min-width: 0;
    flex-direction: column;
    padding: 8px;
    overflow: hidden;
    border: 1px solid #E9DFC5;
    border-radius: 17px;
    background: linear-gradient(145deg, rgba(255,255,255,.76), rgba(255,250,236,.54));
    box-shadow: 0 3px 8px rgba(41,40,32,.035), 0 12px 26px rgba(41,40,32,.065), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
    backdrop-filter: blur(24px) saturate(145%);
    transition: border-color 220ms ease, box-shadow 220ms ease, background 220ms ease;
  }
  #root .favorite-page .favorite-page-card::before {
    position: absolute;
    z-index: 2;
    inset: 1px 1px auto;
    height: 1px;
    content: "";
    background: linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent);
    pointer-events: none;
  }
  #root .favorite-page .favorite-page-card:hover {
    border-color: rgba(214,180,63,.58);
    background: linear-gradient(145deg, rgba(255,255,255,.9), rgba(255,250,236,.66));
    box-shadow: 0 8px 16px rgba(41,40,32,.055), 0 18px 34px rgba(41,40,32,.09), inset 0 1px rgba(255,255,255,1);
  }
  #root .favorite-page .favorite-page-poster {
    position: relative;
    aspect-ratio: 2 / 2.86;
    padding: 4px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 12px;
    background: linear-gradient(145deg, rgba(255,255,255,.65), rgba(229,222,207,.6));
    box-shadow: 0 5px 14px rgba(41,40,32,.095), inset 0 1px rgba(255,255,255,.94);
  }
  #root .favorite-page .favorite-page-open-button {
    position: absolute;
    inset: 4px;
    display: block;
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    padding: 0;
    overflow: hidden;
    border: 0;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
  }
  #root .favorite-page .favorite-page-open-button img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
    transition: filter 220ms ease;
  }
  #root .favorite-page .favorite-page-card:hover .favorite-page-open-button img { filter: saturate(1.045) contrast(1.015); }
  #root .favorite-page .favorite-page-no-poster {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    background: linear-gradient(145deg, #EEE9DE, #F9F5EB);
    color: #6A6251;
    font-size: 11px;
  }
  #root .favorite-page .favorite-page-movie-info {
    display: grid;
    gap: 5px;
    min-width: 0;
    padding: 13px 6px 7px;
  }
  #root .favorite-page .favorite-page-movie-info h3 {
    margin: 0;
    overflow: hidden;
    color: #292820;
    font-size: 13px;
    font-weight: 850;
    letter-spacing: -.025em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #root .favorite-page .favorite-page-movie-info p {
    margin: 0;
    color: #6A6251;
    font-size: 11px;
    font-weight: 600;
  }
  #root .favorite-page .favorite-page-empty {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 10px;
    min-height: 300px;
    padding: 42px 24px;
    border: 1px solid rgba(255,255,255,.92);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.92), transparent 58%),
      linear-gradient(145deg, rgba(255,255,255,.76), rgba(255,250,236,.62));
    box-shadow: var(--momo-route-depth);
    text-align: center;
    -webkit-backdrop-filter: blur(26px) saturate(145%);
    backdrop-filter: blur(26px) saturate(145%);
  }
  #root .favorite-page .favorite-empty-symbol {
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    border: 1px solid rgba(214,180,63,.4);
    border-radius: 17px;
    background: rgba(255,241,178,.48);
    box-shadow: inset 0 1px rgba(255,255,255,.96);
    color: #80600E;
    font-size: 23px;
  }
  #root .favorite-page .favorite-page-empty h2 {
    margin: 3px 0 0;
    color: #292820;
    font-size: 19px;
    font-weight: 850;
    letter-spacing: -.035em;
  }
  #root .favorite-page .favorite-page-empty p {
    margin: 0;
    color: #746D60;
    font-size: 12px;
    line-height: 1.7;
  }
  #root .favorite-page .favorite-browse-button {
    min-height: 43px;
    margin-top: 9px;
    padding: 0 19px;
    border: 1px solid #D6B43F;
    border-radius: 999px;
    background: linear-gradient(145deg, #FFE078, #FFD43B);
    color: #292820;
    font-size: 12px;
    font-weight: 850;
    box-shadow: 0 5px 13px rgba(179,141,25,.16), inset 0 1px rgba(255,255,255,.72);
  }
  #root .favorite-page .favorite-browse-button:hover { background: #F3C51E; }

  /* ---------------------------------------------------------
     Movie detail and person detail share a cinematic stage.
     The poster, rather than another card, is the visual anchor.
  --------------------------------------------------------- */
  #root .movie-detail-page {
    width: 100%;
    max-width: 1260px;
    margin: 0 auto;
    padding: 0 0 76px;
  }
  #root .movie-detail-page > .detail-back-button {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    margin: 0 0 16px;
    padding: 0 15px;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 999px;
    background: rgba(255,250,236,.72);
    color: #514C40;
    font-size: 11px;
    font-weight: 800;
    box-shadow: 0 3px 8px rgba(41,40,32,.04), inset 0 1px rgba(255,255,255,.96);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    backdrop-filter: blur(18px) saturate(140%);
  }
  #root .movie-detail-page .movie-detail-header {
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(235px, 310px) minmax(0, 1fr);
    align-items: center;
    gap: clamp(28px, 4vw, 58px);
    min-height: 430px;
    padding: clamp(26px, 4vw, 48px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.88);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 8% 4%, rgba(255,255,255,.92), transparent 42%),
      radial-gradient(ellipse at 96% 100%, rgba(255,212,59,.15), transparent 45%),
      linear-gradient(132deg, rgba(255,255,255,.74), rgba(255,250,236,.4));
    box-shadow: 0 4px 11px rgba(41,40,32,.04), 0 24px 58px rgba(41,40,32,.11),
      inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.2);
    -webkit-backdrop-filter: blur(32px) saturate(152%);
    backdrop-filter: blur(32px) saturate(152%);
  }
  #root .movie-detail-page .movie-detail-header::after {
    position: absolute;
    z-index: 0;
    inset: 0;
    content: "";
    border-radius: inherit;
    background: linear-gradient(116deg, rgba(255,255,255,.28), transparent 34%, transparent 68%, rgba(255,255,255,.13));
    pointer-events: none;
  }
  #root .movie-detail-page .movie-detail-poster {
    position: relative;
    z-index: 1;
    width: min(100%, 292px);
    aspect-ratio: 2 / 2.95;
    padding: 7px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(255,250,236,.4));
    box-shadow: 0 12px 24px rgba(30,34,30,.15), 0 22px 42px rgba(30,34,30,.12),
      inset 0 1px 0 rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(18px) saturate(145%);
    backdrop-filter: blur(18px) saturate(145%);
  }
  #root .movie-detail-page .movie-detail-poster img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    object-fit: cover;
  }
  #root .movie-detail-page .movie-detail-info {
    position: relative;
    z-index: 1;
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  #root .movie-detail-page .movie-detail-info .detail-rank {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    margin: 0 0 5px;
    padding: 0 11px;
    border: 1px solid rgba(214,180,63,.48);
    border-radius: 999px;
    background: rgba(255,241,178,.42);
    color: #80600E;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .12em;
  }
  #root .movie-detail-page .movie-detail-info h1 {
    flex: 0 0 100%;
    width: 100%;
    margin: 0 0 13px;
    color: #292820;
    font-size: clamp(34px, 4.4vw, 54px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -.06em;
    overflow-wrap: anywhere;
  }
  #root .movie-detail-page .movie-detail-info > p {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    min-height: 34px;
    margin: 0;
    padding: 7px 11px;
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 10px;
    background: rgba(255,254,250,.46);
    box-shadow: inset 0 1px rgba(255,255,255,.92);
    color: #514C40;
    font-size: 11px;
    font-weight: 650;
    line-height: 1.5;
    -webkit-backdrop-filter: blur(16px) saturate(145%);
    backdrop-filter: blur(16px) saturate(145%);
  }
  #root .movie-detail-page .movie-detail-header-no-poster {
    grid-template-columns: minmax(0, 1fr);
    min-height: 340px;
  }
  #root .movie-detail-page .movie-detail-header-no-poster .movie-detail-info { max-width: 900px; }
  #root .movie-detail-page > .detail-content-section,
  #root .movie-detail-page .movie-rating-panel {
    position: relative;
    border: 1px solid rgba(255,255,255,.88);
    border-radius: 19px;
    background:
      linear-gradient(140deg, rgba(255,255,255,.74), rgba(255,250,236,.5));
    box-shadow: 0 3px 9px rgba(41,40,32,.035), 0 14px 32px rgba(41,40,32,.065),
      inset 0 1px 0 rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(26px) saturate(145%);
    backdrop-filter: blur(26px) saturate(145%);
  }
  #root .movie-detail-page > .detail-content-section {
    margin-top: 18px;
    padding: clamp(22px, 3vw, 31px);
  }
  #root .movie-detail-page > .detail-content-section > h2,
  #root .movie-detail-page .detail-section-heading h2 {
    margin: 0;
    color: #292820;
    font-size: 19px;
    font-weight: 850;
    letter-spacing: -.04em;
  }
  #root .movie-detail-page > .detail-content-section > p {
    margin: 13px 0 0;
    color: #5F584D;
    font-size: 13px;
    line-height: 1.9;
  }
  #root .movie-detail-page .detail-section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin: 0 0 19px;
    padding: 0 0 13px;
    border-bottom: 1px solid rgba(214,180,63,.25);
  }
  #root .movie-detail-page .detail-section-count {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 9px;
    border: 1px solid rgba(233,223,197,.88);
    border-radius: 999px;
    background: rgba(255,254,250,.64);
    color: #6A6251;
    font-size: 10px;
    font-weight: 800;
  }
  #root .movie-detail-page .people-list-compact {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 11px;
  }
  #root .movie-detail-page .people-list-compact .person-chip {
    display: grid;
    grid-template-columns: 54px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    min-width: 0;
    min-height: 78px;
    padding: 9px;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 13px;
    background: linear-gradient(145deg, rgba(255,255,255,.76), rgba(255,250,236,.54));
    box-shadow: 0 3px 8px rgba(41,40,32,.035), inset 0 1px rgba(255,255,255,.96);
    color: #292820;
    text-align: left;
    cursor: pointer;
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  #root .movie-detail-page .people-list-compact .person-chip:hover {
    border-color: rgba(214,180,63,.6);
    background: rgba(255,255,255,.9);
    box-shadow: 0 7px 15px rgba(41,40,32,.07), inset 0 1px rgba(255,255,255,1);
  }
  #root .movie-detail-page .people-list-compact .person-chip > img,
  #root .movie-detail-page .people-list-compact .person-chip > div:first-child {
    display: block;
    width: 54px;
    height: 58px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.88);
    border-radius: 9px;
    background: #EEE9DE;
    object-fit: cover;
  }
  #root .movie-detail-page .people-list-compact .person-chip > div:last-child {
    display: grid;
    min-width: 0;
    gap: 4px;
  }
  #root .movie-detail-page .people-list-compact .person-chip strong {
    overflow: hidden;
    color: #292820;
    font-size: 11px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #root .movie-detail-page .people-list-compact .person-chip span {
    overflow: hidden;
    color: #6A6251;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #root .movie-detail-page .people-list-actions {
    display: flex;
    justify-content: center;
    margin-top: 17px;
  }
  #root .movie-detail-page .people-more-button,
  #root .movie-detail-page .person-bio-toggle {
    min-height: 37px;
    padding: 0 15px;
    border: 1px solid rgba(214,180,63,.48);
    border-radius: 999px;
    background: rgba(255,241,178,.34);
    color: #66510F;
    font-size: 11px;
    font-weight: 800;
  }

  /* Audience rating: a single horizontal instrument with distinct readout and action. */
  #root .movie-detail-page .movie-rating-panel {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin-top: 18px;
    padding: clamp(22px, 3vw, 32px);
  }
  #root .movie-detail-page .rating-panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }
  #root .movie-detail-page .rating-panel-eyebrow {
    display: block;
    margin: 0 0 7px;
    color: #80600E;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .15em;
  }
  #root .movie-detail-page .rating-label {
    margin: 0;
    color: #292820;
    font-size: 21px;
    font-weight: 850;
    letter-spacing: -.04em;
  }
  #root .movie-detail-page .rating-panel-description {
    margin: 7px 0 0;
    color: #746D60;
    font-size: 11px;
    line-height: 1.6;
  }
  #root .movie-detail-page .rating-panel-stamp {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border: 1px solid rgba(233,223,197,.88);
    border-radius: 999px;
    background: rgba(255,254,250,.6);
    color: #6A6251;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .11em;
    white-space: nowrap;
  }
  #root .movie-detail-page .rating-panel-main {
    display: grid;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    grid-template-columns: minmax(160px,.65fr) minmax(0,1.35fr);
    gap: 14px;
  }
  #root .movie-detail-page .movie-score-display,
  #root .movie-detail-page .rating-distribution {
    min-width: 0;
    padding: 19px;
    border: 1px solid rgba(255,255,255,.88);
    border-radius: 15px;
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(255,250,236,.48));
    box-shadow: inset 0 1px rgba(255,255,255,.96);
  }
  #root .movie-detail-page .movie-score-display {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  #root .movie-detail-page .movie-score-value {
    display: flex;
    align-items: baseline;
    gap: 7px;
  }
  #root .movie-detail-page .movie-score-value strong {
    color: #292820;
    font-size: clamp(40px, 5vw, 54px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -.07em;
    font-variant-numeric: tabular-nums;
  }
  #root .movie-detail-page .movie-score-value span {
    color: #6A6251;
    font-size: 11px;
    font-weight: 700;
  }
  #root .movie-detail-page .rating-vote-summary {
    margin: 10px 0 0;
    color: #514C40;
    font-size: 11px;
    font-weight: 750;
  }
  #root .movie-detail-page .rating-score-caption {
    margin: 5px 0 0;
    color: #6A6251;
    font-size: 9px;
    line-height: 1.45;
  }
  #root .movie-detail-page .rating-distribution-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #625B4F;
    font-size: 11px;
    font-weight: 750;
  }
  #root .movie-detail-page .rating-distribution-heading strong {
    color: #66510F;
    font-size: 13px;
    font-weight: 850;
    font-variant-numeric: tabular-nums;
  }
  #root .movie-detail-page .rating-distribution-track {
    height: 9px;
    margin: 16px 0 13px;
    overflow: hidden;
    border: 1px solid rgba(179,141,25,.14);
    border-radius: 999px;
    background: rgba(214,201,159,.24);
    box-shadow: inset 0 1px 2px rgba(41,40,32,.06);
  }
  #root .movie-detail-page .rating-distribution-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #D6B43F, #F1D879);
    box-shadow: 0 0 10px rgba(214,180,63,.22);
  }
  #root .movie-detail-page .rating-distribution-legend {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #746D60;
    font-size: 10px;
    font-weight: 650;
  }
  #root .movie-detail-page .rating-distribution-legend > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  #root .movie-detail-page .rating-legend-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #D6B43F;
  }
  #root .movie-detail-page .rating-legend-dot.is-dislike { background: #B77B70; }
  #root .movie-detail-page .detail-reaction-counts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 10px;
    margin-top: 13px;
  }
  #root .movie-detail-page .rating-vote-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 48px;
    padding: 0 15px;
    border: 1px solid rgba(233,223,197,.9);
    border-radius: 12px;
    background: rgba(255,254,250,.62);
    color: #514C40;
    font-size: 12px;
    font-weight: 800;
    box-shadow: inset 0 1px rgba(255,255,255,.96);
  }
  #root .movie-detail-page .rating-vote-button.is-like {
    border-color: rgba(214,180,63,.42);
    background: #FFF3C5;
    color: #66510F;
  }
  #root .movie-detail-page .rating-vote-button.is-dislike {
    border-color: rgba(183,123,112,.28);
    background: #FFF1EC;
    color: #8B4F47;
  }
  #root .movie-detail-page .rating-vote-button.selected-like {
    border-color: #D6B43F;
    background: rgba(255,212,59,.48);
    color: #51400F;
    box-shadow: 0 0 0 2px rgba(255,212,59,.14), inset 0 1px rgba(255,255,255,.8);
  }
  #root .movie-detail-page .rating-vote-button.selected-dislike {
    border-color: rgba(166,91,79,.54);
    background: rgba(255,229,220,.68);
    color: #793A34;
  }
  #root .movie-detail-page .rating-vote-button strong {
    color: inherit;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
  #root .movie-detail-page .detail-total-count {
    margin: 10px 2px 0;
    color: #6A6251;
    text-align: right;
    font-size: 10px;
  }
  #root .movie-detail-page .detail-total-count strong { color: #514C40; }
  #root .movie-detail-page .rating-status,
  #root .movie-detail-page .rating-error {
    margin: 9px 0 0;
    color: #80600E;
    font-size: 11px;
  }
  #root .movie-detail-page .rating-error { color: #A34D43; }
  #root .movie-detail-page .rating-unavailable {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
    padding: 15px;
    border: 1px solid rgba(233,223,197,.9);
    border-radius: 12px;
    background: rgba(255,250,236,.62);
    color: #746D60;
    font-size: 11px;
  }
  #root .movie-detail-page .rating-unavailable > span {
    display: grid;
    place-items: center;
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: rgba(255,241,178,.48);
    color: #80600E;
    font-size: 15px;
  }
  #root .movie-detail-page .rating-unavailable p { margin: 0; }

  /* The save control reads as a film ticket, not a decorative star. */
  #root .favorite-star {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid rgba(255,255,255,.78);
    border-radius: 12px;
    background: rgba(34,34,29,.54);
    box-shadow: 0 5px 13px rgba(0,0,0,.2), inset 0 1px rgba(255,255,255,.3);
    color: #fff;
    -webkit-backdrop-filter: blur(18px) saturate(150%);
    backdrop-filter: blur(18px) saturate(150%);
    transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease, transform 100ms ease;
  }
  #root .favorite-star .favorite-film-ticket-icon { display: block; width: 23px; height: 23px; }
  #root .favorite-star:hover:not(:disabled) {
    border-color: rgba(255,255,255,1);
    background: rgba(34,34,29,.76);
    box-shadow: 0 8px 18px rgba(0,0,0,.23), inset 0 1px rgba(255,255,255,.48);
  }
  #root .favorite-star.is-active {
    border-color: rgba(255,255,255,.9);
    background: linear-gradient(145deg, #FFE078, #D6B43F);
    color: #292820;
    box-shadow: 0 5px 15px rgba(41,40,32,.2), inset 0 1px rgba(255,255,255,.7);
  }
  #root .favorite-star:focus-visible {
    outline: 3px solid rgba(179,141,25,.72);
    outline-offset: 3px;
  }

  /* ---------------------------------------------------------
     Review archives and review detail: reading-first panels,
     consistent data hierarchy and tactile action controls.
  --------------------------------------------------------- */
  #root .all-reviews-page,
  #root .my-reviews-page,
  #root .liked-reviews-page,
  #root .liked-reviews-container {
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
  }
  #root .all-reviews-card,
  #root .my-reviews-card,
  #root .liked-reviews-card,
  #root .review-detail-card,
  #root .review-comment-card {
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 19px;
    background: linear-gradient(145deg, rgba(255,255,255,.76), rgba(255,250,236,.56));
    box-shadow: var(--momo-route-depth);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
    backdrop-filter: blur(24px) saturate(145%);
  }
  #root .all-reviews-card,
  #root .my-reviews-card,
  #root .liked-reviews-card { padding: clamp(18px, 2.5vw, 28px); }
  #root .all-reviews-card-heading,
  #root .my-reviews-card-heading,
  #root .liked-reviews-toolbar,
  #root .review-comment-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
    padding-bottom: 13px;
    border-bottom: 1px solid rgba(214,180,63,.24);
  }
  #root .all-reviews-card-heading h2,
  #root .my-reviews-card-heading h2,
  #root .liked-reviews-toolbar h2,
  #root .review-comment-heading h2 {
    margin: 0;
    color: #292820;
    font-size: 17px;
    font-weight: 850;
    letter-spacing: -.035em;
  }
  #root .all-reviews-card-heading p,
  #root .my-reviews-card-heading p,
  #root .liked-reviews-toolbar p {
    margin: 5px 0 0;
    color: #6A6251;
    font-size: 11px;
  }
  #root .all-reviews-page-info,
  #root .my-reviews-card-heading > span,
  #root .liked-reviews-toolbar > span {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 9px;
    border: 1px solid rgba(233,223,197,.92);
    border-radius: 999px;
    background: rgba(255,254,250,.68);
    color: #746D60;
    font-size: 10px;
    font-weight: 750;
  }
  #root .all-reviews-search {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: 9px;
    margin: 0 0 19px;
    padding: 15px;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 14px;
    background: rgba(255,250,236,.54);
    box-shadow: inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    backdrop-filter: blur(18px) saturate(140%);
  }
  #root .all-reviews-search-label {
    display: grid;
    gap: 6px;
    color: #625B4F;
    font-size: 10px;
    font-weight: 800;
  }
  #root .all-reviews-search-select,
  #root .all-reviews-search-input {
    min-height: 40px;
    padding: 0 11px;
    border: 1px solid rgba(216,201,159,.9);
    border-radius: 9px;
    background: rgba(255,254,250,.92);
    color: #292820;
    font-size: 11px;
  }
  #root .all-reviews-search-submit,
  #root .all-reviews-search-reset {
    min-height: 40px;
    padding: 0 15px;
    border-radius: 9px;
    font-size: 11px;
    font-weight: 800;
  }
  #root .all-reviews-search-submit {
    border: 1px solid #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 4px 10px rgba(179,141,25,.12);
  }
  #root .all-reviews-search-submit:hover:not(:disabled) { background: #F3C51E; }
  #root .all-reviews-search-reset {
    border: 1px solid rgba(233,223,197,.9);
    background: rgba(255,254,250,.76);
    color: #746D60;
  }
  #root .all-reviews-table-wrap {
    overflow-x: auto;
    border: 1px solid rgba(233,223,197,.86);
    border-radius: 13px;
    background: rgba(255,254,250,.54);
  }
  #root .all-reviews-table { border-collapse: separate; border-spacing: 0; }
  #root .all-reviews-table thead th {
    padding: 13px 12px;
    border-bottom: 1px solid rgba(214,180,63,.26);
    background: rgba(255,241,178,.3);
    color: #66551A;
    font-size: 10px;
    font-weight: 850;
  }
  #root .all-reviews-table tbody tr,
  #root .all-reviews-table tbody tr:nth-child(even) { background: rgba(255,254,250,.56); }
  #root .all-reviews-table tbody tr:hover { background: rgba(255,241,178,.24); }
  #root .all-reviews-table td {
    padding: 14px 12px;
    border-bottom-color: rgba(233,223,197,.66);
    color: #514C40;
    font-size: 11px;
  }
  #root .review-title-link { color: #51400F; font-weight: 800; text-decoration: none; }
  #root .review-title-link:hover { color: #80600E; text-decoration: underline; text-underline-offset: 3px; }
  #root .all-reviews-mobile-list { display: grid; gap: 10px; }
  #root .all-reviews-mobile-item {
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 13px;
    background: linear-gradient(145deg, rgba(255,255,255,.78), rgba(255,250,236,.6));
    box-shadow: 0 4px 12px rgba(41,40,32,.045), inset 0 1px rgba(255,255,255,.98);
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  #root .all-reviews-mobile-item:hover {
    border-color: rgba(214,180,63,.58);
    background: rgba(255,255,255,.9);
    box-shadow: 0 8px 17px rgba(41,40,32,.075), inset 0 1px rgba(255,255,255,1);
  }
  #root .my-review-item,
  #root .liked-review-item {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
    padding: 16px 13px;
    border-bottom: 1px solid rgba(233,223,197,.75);
    border-radius: 12px;
    background: rgba(255,254,250,.28);
    transition: background 180ms ease, border-color 180ms ease;
  }
  #root .my-review-item:hover,
  #root .liked-review-item:hover { background: rgba(255,241,178,.18); }
  #root .my-review-poster,
  #root .liked-review-poster,
  #root .all-review-poster {
    flex: 0 0 58px;
    width: 58px;
    height: 82px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.92);
    border-radius: 8px;
    background: #EEE9DE;
    box-shadow: 0 4px 10px rgba(41,40,32,.1);
  }
  #root .my-review-poster img,
  #root .liked-review-poster img,
  #root .all-review-poster img { width: 100%; height: 100%; object-fit: cover; }
  #root .my-review-info h3,
  #root .liked-review-title { color: #292820; font-size: 14px; font-weight: 850; }
  #root .my-review-movie,
  #root .liked-review-movie { color: #80600E; font-size: 10px; font-weight: 800; }
  #root .my-review-info p,
  #root .liked-review-content { color: #625B4F; font-size: 11px; line-height: 1.65; }
  #root .my-review-date,
  #root .liked-review-meta { color: #6A6251; font-size: 10px; }
  #root .my-review-arrow { color: #B38D19; }
  #root .liked-review-unlike {
    min-height: 34px;
    padding: 0 11px;
    border: 1px solid rgba(229,184,173,.78);
    border-radius: 9px;
    background: rgba(255,247,243,.78);
    color: #8C5149;
    font-size: 10px;
    font-weight: 800;
  }
  #root .liked-review-unlike:hover:not(:disabled) { border-color: #D69D91; background: #FFF1EC; }

  /* Review detail: a reading canvas, not another dense admin panel. */
  #root .review-detail-page {
    width: min(1100px, 100%);
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 0 72px;
  }
  #root .review-detail-page > .review-detail-back { margin: 0 0 16px; }
  #root .review-detail-page .review-detail-card {
    padding: clamp(23px, 3.5vw, 42px);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.9), transparent 50%),
      linear-gradient(145deg, rgba(255,255,255,.8), rgba(255,250,236,.66));
  }
  #root .review-detail-page .review-detail-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 22px;
    padding-bottom: 22px;
    border-bottom: 1px solid rgba(214,180,63,.28);
  }
  #root .review-detail-page .review-detail-eyebrow {
    margin: 0 0 11px;
    color: #80600E;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .14em;
  }
  #root .review-detail-page .review-detail-title {
    margin: 0 0 13px;
    color: #292820;
    font-size: clamp(25px, 3.2vw, 36px);
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: -.05em;
  }
  #root .review-detail-page .review-detail-meta {
    color: #746D60;
    font-size: 11px;
  }
  #root .review-detail-page .review-detail-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  #root .review-detail-page .review-action-button {
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid rgba(233,223,197,.92);
    border-radius: 9px;
    background: rgba(255,254,250,.78);
    color: #514C40;
    font-size: 10px;
    font-weight: 800;
  }
  #root .review-detail-page .review-action-button.delete {
    border-color: rgba(229,184,173,.74);
    background: rgba(255,247,243,.76);
    color: #8C5149;
  }
  #root .review-detail-page .review-detail-movie {
    display: flex;
    align-items: center;
    gap: 18px;
    margin: 20px 0;
    padding: 15px;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 15px;
    background: linear-gradient(145deg, rgba(255,255,255,.76), rgba(255,250,236,.56));
    box-shadow: inset 0 1px rgba(255,255,255,.98);
  }
  #root .review-detail-page .review-detail-movie-poster {
    flex: 0 0 76px;
    width: 76px;
    height: 110px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 8px;
    box-shadow: 0 5px 12px rgba(41,40,32,.1);
  }
  #root .review-detail-page .review-detail-movie-poster img { width: 100%; height: 100%; object-fit: cover; }
  #root .review-detail-page .review-detail-movie-info h2 {
    margin: 0 0 5px;
    color: #292820;
    font-size: 17px;
    font-weight: 850;
  }
  #root .review-detail-page .review-detail-movie-info > p { margin: 0 0 9px; color: #6A6251; font-size: 10px; }
  #root .review-detail-page .review-detail-content {
    min-height: 140px;
    padding: clamp(20px, 3vw, 30px);
    border: 1px solid rgba(233,223,197,.84);
    border-radius: 15px;
    background:
      radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.82), transparent 58%),
      linear-gradient(145deg, rgba(255,255,255,.46), rgba(245,247,242,.28) 52%, rgba(232,238,231,.38));
    color: #3F3A31;
    font-size: 14px;
    line-height: 2;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  #root .review-detail-page .review-detail-reactions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
  #root .review-detail-page .review-like-button,
  #root .review-detail-page .review-dislike-button,
  #root .review-detail-page .comment-like-button,
  #root .review-detail-page .comment-dislike-button {
    min-width: 118px;
    min-height: 40px;
    padding: 0 15px;
    border-radius: 10px;
    font-size: 11px;
  }
  #root .review-detail-page .review-comment-card { margin-top: 20px; padding: clamp(20px, 3vw, 28px); }
  #root .review-detail-page .review-comment-item {
    padding: 14px 0;
    border-bottom: 1px solid rgba(233,223,197,.72);
  }
  #root .review-detail-page .review-comment-content { color: #514C40; font-size: 12px; line-height: 1.75; }

  /* Signup and login share a centered, illuminated glass entry panel. */
  #root .signup-page {
    min-height: calc(100vh - 220px);
    display: grid;
    place-items: center;
    padding: 18px 0 44px;
    background: radial-gradient(ellipse at 50% 0%, rgba(255,212,59,.11), transparent 54%);
  }
  #root .signup-page .signup-wrapper { width: min(100%, 500px); max-width: 500px; }
  #root .signup-page .signup-brand { display: flex; justify-content: center; margin: 0 0 19px; }
  #root .signup-page .signup-brand img { width: auto; max-width: 160px; height: 36px; object-fit: contain; }
  #root .signup-page .signup-card {
    position: relative;
    padding: clamp(24px, 4vw, 38px);
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 6% 0%, rgba(255,255,255,.94), transparent 52%),
      linear-gradient(145deg, rgba(255,255,255,.82), rgba(255,250,236,.68));
    box-shadow: 0 4px 12px rgba(41,40,32,.04), 0 22px 52px rgba(41,40,32,.09), inset 0 1px rgba(255,255,255,1);
    -webkit-backdrop-filter: blur(28px) saturate(148%);
    backdrop-filter: blur(28px) saturate(148%);
  }
  #root .signup-page .signup-card-heading { margin: 0 0 22px; }
  #root .signup-page .signup-card-heading h1 {
    margin: 0;
    color: #292820;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -.05em;
  }
  #root .signup-page .signup-eyebrow {
    display: block;
    margin: 0 0 8px;
    color: #80600E;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .15em;
  }
  #root .signup-page .signup-field { display: grid; gap: 7px; margin: 0 0 15px; }
  #root .signup-page .signup-field label { color: #514C40; font-size: 11px; font-weight: 800; }
  #root .signup-page .signup-field input {
    min-height: 46px;
    padding: 0 13px;
    border: 1px solid rgba(216,201,159,.88);
    border-radius: 10px;
    background: rgba(255,254,250,.88);
    color: #292820;
    font-size: 12px;
  }
  #root .signup-page .signup-note-label {
    display: inline-flex;
    align-items: center;
    min-height: 25px;
    margin: 0 0 13px;
    padding: 0 9px;
    border: 1px solid rgba(214,180,63,.38);
    border-radius: 999px;
    background: rgba(255,241,178,.38);
    color: #80600E;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .06em;
  }
  #root .signup-page .signup-submit {
    width: 100%;
    min-height: 48px;
    margin-top: 5px;
    border: 1px solid #D6B43F;
    border-radius: 11px;
    background: linear-gradient(145deg, #FFE078, #FFD43B);
    color: #292820;
    font-size: 12px;
    font-weight: 850;
    box-shadow: 0 5px 14px rgba(179,141,25,.16), inset 0 1px rgba(255,255,255,.78);
  }
  #root .signup-page .signup-submit:hover:not(:disabled) {
    border-color: #B38D19;
    background: #F3C51E;
    box-shadow: 0 8px 18px rgba(179,141,25,.2), inset 0 1px rgba(255,255,255,.9);
  }
  #root .signup-page .signup-footer {
    margin: 18px 0 0;
    color: #6A6251;
    font-size: 11px;
    text-align: center;
  }
  #root .signup-page .signup-footer a { color: #80600E; font-weight: 800; text-decoration: none; }
  #root .signup-page .signup-bottom-caption { margin: 14px 0 0; color: #6A6251; font-size: 10px; text-align: center; }

  /* State and accessibility treatment. */
  #root .all-reviews-state,
  #root .my-reviews-state,
  #root .liked-reviews-state,
  #root .review-detail-state {
    color: #6A6251;
  }
  #root .all-reviews-error,
  #root .my-reviews-state.error,
  #root .liked-reviews-state.error,
  #root .review-detail-error { color: #A34D43; }
  #root a:focus-visible,
  #root button:focus-visible,
  #root input:focus-visible,
  #root textarea:focus-visible,
  #root select:focus-visible {
    outline: 3px solid rgba(179,141,25,.68);
    outline-offset: 3px;
  }

  @media (max-width: 980px) {
    #root .favorite-page .favorite-page-grid { grid-template-columns: repeat(4, minmax(0,1fr)); }
    #root .movie-detail-page .movie-detail-header { grid-template-columns: minmax(205px,260px) minmax(0,1fr); }
    #root .movie-detail-page .people-list-compact { grid-template-columns: repeat(2,minmax(0,1fr)); }
  }
  @media (max-width: 700px) {
    #root .all-reviews-heading,
    #root .my-reviews-heading,
    #root .liked-reviews-heading,
    #root .favorite-page-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 16px;
      min-height: 0;
      padding: 25px 22px;
    }
    #root .favorite-page .favorite-page-grid { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px 10px; }
    #root .favorite-page .favorite-page-card { padding: 6px; border-radius: 13px; }
    #root .favorite-page .favorite-page-poster { padding: 3px; border-radius: 9px; }
    #root .favorite-page .favorite-page-open-button { inset: 3px; width: calc(100% - 6px); height: calc(100% - 6px); }
    #root .favorite-page .favorite-page-movie-info { padding: 10px 3px 5px; }
    #root .favorite-page .favorite-page-movie-info h3 { font-size: 11px; }
    #root .favorite-page .favorite-page-movie-info p { font-size: 9px; }
    #root .movie-detail-page .movie-detail-header {
      grid-template-columns: minmax(0,1fr);
      gap: 20px;
      min-height: 0;
      padding: 20px;
      border-radius: 18px;
    }
    #root .movie-detail-page .movie-detail-poster { width: min(62%,220px); margin: 0 auto; }
    #root .movie-detail-page .movie-detail-info { gap: 8px; }
    #root .movie-detail-page .movie-detail-info h1 { font-size: clamp(29px,8vw,38px); margin-bottom: 7px; }
    #root .movie-detail-page .movie-detail-info > p { min-height: 30px; font-size: 10px; padding: 5px 8px; }
    #root .movie-detail-page .movie-rating-panel { padding: 19px; }
    #root .movie-detail-page .rating-panel-heading { gap: 9px; }
    #root .movie-detail-page .rating-panel-stamp { display: none; }
    #root .movie-detail-page .rating-panel-main { grid-template-columns: 1fr; }
    #root .movie-detail-page .movie-score-display { min-height: 125px; }
    #root .movie-detail-page > .detail-content-section { padding: 19px; }
    #root .movie-detail-page .people-list-compact { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; }
    #root .movie-detail-page .people-list-compact .person-chip { grid-template-columns: 42px minmax(0,1fr); gap: 8px; padding: 7px; }
    #root .movie-detail-page .people-list-compact .person-chip > img,
    #root .movie-detail-page .people-list-compact .person-chip > div:first-child { width: 42px; height: 48px; }
    #root .review-detail-page .review-detail-card { padding: 20px 16px; border-radius: 17px; }
    #root .review-detail-page .review-detail-top { flex-direction: column; gap: 14px; }
    #root .review-detail-page .review-detail-actions { width: 100%; }
    #root .review-detail-page .review-detail-actions > * { flex: 1; }
    #root .review-detail-page .review-detail-movie { align-items: flex-start; gap: 12px; padding: 11px; }
    #root .review-detail-page .review-detail-movie-poster { flex-basis: 62px; width: 62px; height: 92px; }
    #root .review-detail-page .review-detail-title { font-size: 25px; }
    #root .signup-page { min-height: auto; padding-top: 4px; }
    #root .signup-page .signup-card { padding: 24px 19px; border-radius: 18px; }
  }
  @media (max-width: 430px) {
    #root .favorite-page .favorite-page-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 15px 11px; }
    #root .movie-detail-page .detail-reaction-counts { grid-template-columns: 1fr; }
    #root .movie-detail-page .people-list-compact { grid-template-columns: repeat(2,minmax(0,1fr)); }
    #root .all-reviews-card,
    #root .my-reviews-card,
    #root .liked-reviews-card { padding: 16px 12px; }
    #root .review-detail-page .review-detail-content { padding: 17px; font-size: 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    #root .favorite-page *,
    #root .movie-detail-page *,
    #root .review-detail-page *,
    #root .all-reviews-page *,
    #root .my-reviews-page *,
    #root .liked-reviews-page *,
    #root .signup-page * {
      animation-duration: .01ms;
      animation-iteration-count: 1;
      transition-duration: .01ms;
      scroll-behavior: auto;
    }
  }
`;

export default MomoLiquidGlassPageStyles;
