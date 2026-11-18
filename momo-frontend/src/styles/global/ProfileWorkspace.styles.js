import { createGlobalStyle } from "styled-components";

/* Account pages: private archive, identity and settings with one warm glass language. */
const ProfileWorkspaceStyles = createGlobalStyle`
  :root {
    --momo-profile-edge: rgba(255,255,255,.88);
    --momo-profile-tint: rgba(255,250,236,.42);
    --momo-profile-shadow: 0 3px 8px rgba(41,40,32,.035), 0 16px 34px rgba(41,40,32,.07), inset 0 1px 0 rgba(255,255,255,.98);
    --momo-profile-blur: 26px;
  }

  /* MY PAGE — a compact identity overview followed by three clear activity routes. */
  #root .profile-dashboard {
    width: min(1120px, 100%);
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 0 60px;
    background: transparent;
  }
  #root .profile-dashboard .profile-dashboard-container { display: grid; gap: 17px; }
  #root .profile-dashboard .profile-dashboard-heading {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px;
    min-height: 142px;
    margin: 0 0 4px;
    padding: clamp(24px, 3.5vw, 36px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 7% 0%, rgba(255,255,255,.92), transparent 52%),
      linear-gradient(132deg, rgba(255,255,255,.76), rgba(255,250,236,.54) 65%, rgba(255,243,194,.28));
    box-shadow: var(--momo-profile-shadow);
    -webkit-backdrop-filter: blur(28px) saturate(148%);
    backdrop-filter: blur(28px) saturate(148%);
  }
  #root .profile-dashboard .profile-dashboard-heading::before {
    position: absolute;
    top: 25px;
    bottom: 25px;
    left: 0;
    width: 3px;
    content: "";
    border-radius: 0 3px 3px 0;
    background: #829A85;
  }
  #root .profile-dashboard .profile-heading-main { position: relative; z-index: 1; min-width: 0; }
  #root .profile-dashboard .profile-heading-eyebrow,
  #root .profile-edit-page .profile-heading-eyebrow {
    display: block;
    margin: 0 0 9px;
    color: #80600E;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .16em;
  }
  #root .profile-dashboard .profile-heading h1,
  #root .profile-edit-page .profile-heading h1 {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: #292820;
    font-size: clamp(29px, 3.2vw, 38px);
    font-weight: 900;
    line-height: 1.12;
    letter-spacing: -.06em;
    box-shadow: none;
  }
  #root .profile-dashboard .profile-heading p,
  #root .profile-edit-page .profile-heading p {
    margin: 9px 0 0;
    color: #6A6251;
    font-size: 12px;
    line-height: 1.65;
  }
  #root .profile-dashboard .profile-dashboard-edit {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    flex: 0 0 auto;
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid rgba(214,180,63,.52);
    border-radius: 999px;
    background: linear-gradient(145deg, rgba(255,255,255,.84), rgba(255,250,236,.62));
    color: #66510F;
    font-size: 11px;
    font-weight: 850;
    text-decoration: none;
    box-shadow: 0 4px 11px rgba(41,40,32,.045), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(18px) saturate(145%);
    backdrop-filter: blur(18px) saturate(145%);
    transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
  }
  #root .profile-dashboard .profile-dashboard-edit:hover {
    border-color: rgba(179,141,25,.78);
    background: rgba(255,255,255,.96);
    box-shadow: 0 7px 15px rgba(41,40,32,.075), inset 0 1px rgba(255,255,255,1);
  }
  #root .profile-dashboard .profile-dashboard-edit:focus-visible {
    outline: 3px solid rgba(179,141,25,.68);
    outline-offset: 3px;
  }

  #root .profile-dashboard .profile-card {
    position: relative;
    min-width: 0;
    padding: clamp(22px, 2.8vw, 31px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 20px;
    background: linear-gradient(142deg, rgba(255,255,255,.76), rgba(255,250,236,.48));
    box-shadow: var(--momo-profile-shadow);
    -webkit-backdrop-filter: blur(26px) saturate(148%);
    backdrop-filter: blur(26px) saturate(148%);
  }
  #root .profile-dashboard .profile-card::before {
    position: absolute;
    z-index: 0;
    inset: 0;
    content: "";
    border-radius: inherit;
    background: linear-gradient(124deg, rgba(255,255,255,.44), transparent 48%, rgba(255,212,59,.045));
    pointer-events: none;
  }
  #root .profile-dashboard .profile-card > * { position: relative; z-index: 1; }
  #root .profile-dashboard .profile-card-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin: 0 0 21px;
  }
  #root .profile-dashboard .profile-section-label {
    display: block;
    margin: 0 0 7px;
    color: #80600E;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .15em;
  }
  #root .profile-dashboard .profile-card-heading h2 {
    margin: 0;
    color: #292820;
    font-size: 18px;
    font-weight: 850;
    letter-spacing: -.04em;
  }
  #root .profile-dashboard .profile-card-heading p {
    margin: 6px 0 0;
    color: #746D60;
    font-size: 11px;
    line-height: 1.6;
  }

  /* Member identity strip. */
  #root .profile-dashboard .profile-user {
    display: grid;
    grid-template-columns: 82px minmax(0,1fr);
    align-items: center;
    gap: 22px;
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }
  #root .profile-dashboard .profile-avatar {
    display: grid;
    place-items: center;
    width: 82px;
    height: 82px;
    overflow: hidden;
    border: 4px solid #FFF3C5;
    border-radius: 50%;
    background: linear-gradient(145deg, #FFF9E7, #F5EBC6);
    box-shadow: 0 0 0 1px rgba(214,180,63,.4), 0 9px 20px rgba(41,40,32,.09);
    color: #80600E;
  }
  #root .profile-dashboard .profile-avatar > *,
  #root .profile-dashboard .profile-avatar img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }
  #root .profile-dashboard .profile-user-info { display: block; width: 100%; min-width: 0; }
  #root .profile-dashboard .profile-user-identity { margin: 0 0 15px; }
  #root .profile-dashboard .profile-user-kicker {
    display: block;
    margin: 0 0 5px;
    color: #6A6251;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .1em;
  }
  #root .profile-dashboard .profile-user-info h3 {
    margin: 0;
    color: #292820;
    font-size: 21px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -.05em;
  }
  #root .profile-dashboard .profile-user-details {
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 0;
    margin: 0;
    padding: 14px 0 0;
    border-top: 1px solid rgba(214,180,63,.24);
  }
  #root .profile-dashboard .profile-user-details > div {
    display: grid;
    min-width: 0;
    gap: 5px;
    padding: 0 16px;
    border-left: 1px solid rgba(233,223,197,.86);
  }
  #root .profile-dashboard .profile-user-details > div:first-child { padding-left: 0; border-left: 0; }
  #root .profile-dashboard .profile-user-details dt { color: #6A6251; font-size: 9px; font-weight: 750; }
  #root .profile-dashboard .profile-user-details dd {
    min-width: 0;
    margin: 0;
    overflow-wrap: anywhere;
    color: #514C40;
    font-size: 11px;
    font-weight: 750;
  }

  /* Three activity destinations are distinct objects, but belong to the same collection. */
  #root .profile-dashboard .profile-activity-grid {
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 13px;
    width: 100%;
  }
  #root .profile-dashboard .profile-activity-item {
    --activity-color: #B38D19;
    position: relative;
    isolation: isolate;
    display: flex;
    min-width: 0;
    min-height: 184px;
    flex-direction: column;
    align-items: stretch;
    padding: 17px 18px 14px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    border-left: 3px solid #D6B43F;
    border-radius: 15px;
    background: linear-gradient(145deg, rgba(255,255,255,.66), rgba(241,247,242,.34) 58%, rgba(221,233,225,.24));
    box-shadow: 0 4px 11px rgba(41,40,32,.04), 0 11px 22px rgba(41,40,32,.06),
      inset 0 1px 0 rgba(255,255,255,.98);
    color: #292820;
    text-align: left;
    text-decoration: none;
    -webkit-backdrop-filter: blur(22px) saturate(160%);
    backdrop-filter: blur(22px) saturate(160%);
    transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
  }
  #root .profile-dashboard .profile-reviews-link { --activity-color: #88734D; border-left-color: #B79C67; }
  #root .profile-dashboard .profile-liked-reviews-link { --activity-color: #9A6B62; border-left-color: #C18A7E; }
  #root .profile-dashboard .profile-favorites-link { --activity-color: #637D68; border-left-color: #829B87; }
  #root .profile-dashboard .profile-activity-item::before {
    position: absolute;
    z-index: 0;
    inset: 0;
    content: "";
    border-radius: inherit;
    background: linear-gradient(122deg, rgba(255,255,255,.52), transparent 46%, rgba(166,190,172,.07));
    pointer-events: none;
  }
  #root .profile-dashboard .profile-activity-item::after {
    position: absolute;
    z-index: 0;
    top: 1px;
    left: 18px;
    right: 18px;
    height: 1px;
    content: "";
    background: linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent);
    pointer-events: none;
  }
  #root .profile-dashboard .profile-activity-item > * { position: relative; z-index: 1; }
  #root .profile-dashboard .profile-activity-item:hover {
    border-color: rgba(176,196,180,.68);
    border-left-color: var(--activity-color);
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(233,243,236,.48));
    box-shadow: 0 7px 14px rgba(41,40,32,.045), 0 17px 31px rgba(41,40,32,.09),
      inset 0 1px 0 rgba(255,255,255,1);
  }
  #root .profile-dashboard .profile-activity-item:focus-visible {
    outline: 3px solid rgba(179,141,25,.62);
    outline-offset: 3px;
  }
  #root .profile-dashboard .profile-activity-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 0 0 14px;
  }
  #root .profile-dashboard .profile-activity-icon {
    display: grid;
    place-items: center;
    flex: 0 0 37px;
    width: 37px;
    height: 37px;
    border: 1px solid rgba(255,255,255,.92);
    border-radius: 11px;
    background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,250,236,.58));
    box-shadow: 0 4px 9px rgba(41,40,32,.045), inset 0 1px rgba(255,255,255,1);
    color: var(--activity-color);
  }
  #root .profile-dashboard .profile-activity-icon svg { display: block; width: 19px; height: 19px; }
  #root .profile-dashboard .profile-activity-number {
    color: #6A6251;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .12em;
    font-variant-numeric: tabular-nums;
  }
  #root .profile-dashboard .profile-activity-body { display: grid; gap: 8px; }
  #root .profile-dashboard .profile-activity-item h3 {
    margin: 0;
    color: #292820;
    font-size: 12px;
    font-weight: 850;
    letter-spacing: -.02em;
  }
  #root .profile-dashboard .profile-activity-count-row {
    display: inline-flex;
    align-items: baseline;
    align-self: flex-start;
    gap: 6px;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }
  #root .profile-dashboard .profile-activity-count {
    color: #292820;
    font-size: clamp(35px, 3.3vw, 42px);
    font-weight: 900;
    line-height: .98;
    letter-spacing: -.065em;
    font-variant-numeric: tabular-nums;
  }
  #root .profile-dashboard .profile-activity-unit { color: #6A6251; font-size: 10px; font-weight: 750; }
  #root .profile-dashboard .profile-activity-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid rgba(214,180,63,.22);
  }
  #root .profile-dashboard .profile-activity-footer p {
    display: block;
    min-width: 0;
    margin: 0;
    color: #6A6251;
    font-size: 9px;
    font-weight: 650;
    line-height: 1.5;
  }
  #root .profile-dashboard .profile-activity-arrow {
    display: grid;
    place-items: center;
    flex: 0 0 26px;
    width: 26px;
    height: 26px;
    border: 1px solid rgba(233,223,197,.88);
    border-radius: 9px;
    background: rgba(255,254,250,.76);
    color: var(--activity-color);
    font-size: 13px;
    font-weight: 850;
    transition: background 180ms ease, border-color 180ms ease;
  }
  #root .profile-dashboard .profile-activity-item:hover .profile-activity-arrow {
    border-color: rgba(214,180,63,.54);
    background: rgba(255,241,178,.56);
  }

  /* Account deletion is a quiet lower-level action, separated from the activity grid. */
  #root .profile-dashboard .profile-delete-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 17px 4px 0;
    border: 0;
    border-top: 1px solid rgba(229,184,173,.42);
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }
  #root .profile-dashboard .profile-delete-copy .profile-section-label { color: #8C5149; }
  #root .profile-dashboard .profile-delete-copy h2 {
    margin: 0;
    color: #514C40;
    font-size: 12px;
    font-weight: 850;
  }
  #root .profile-dashboard .profile-delete-copy p {
    margin: 5px 0 0;
    color: #6A6251;
    font-size: 10px;
    line-height: 1.55;
  }
  #root .profile-dashboard .profile-delete-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 35px;
    padding: 0 12px;
    border: 1px solid rgba(229,184,173,.72);
    border-radius: 9px;
    background: rgba(255,247,243,.68);
    color: #8C5149;
    font-size: 10px;
    font-weight: 800;
    text-decoration: none;
    box-shadow: inset 0 1px rgba(255,255,255,.9);
    transition: border-color 180ms ease, background 180ms ease;
  }
  #root .profile-dashboard .profile-delete-button:hover {
    border-color: #D69D91;
    background: #FFF1EC;
  }

  /* PROFILE EDIT — separate the portrait task from the personal/security fields. */
  #root .profile-edit-page {
    width: min(1120px, 100%);
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 0 64px;
    background: transparent;
  }
  #root .profile-edit-page .profile-container { display: grid; gap: 17px; }
  #root .profile-edit-page .profile-edit-heading {
    position: relative;
    isolation: isolate;
    min-height: 142px;
    margin: 0 0 3px;
    padding: clamp(24px, 3.5vw, 36px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 7% 0%, rgba(255,255,255,.94), transparent 52%),
      linear-gradient(132deg, rgba(255,255,255,.78), rgba(255,250,236,.54) 65%, rgba(255,243,194,.3));
    box-shadow: var(--momo-profile-shadow);
    -webkit-backdrop-filter: blur(24px) saturate(148%);
    backdrop-filter: blur(24px) saturate(148%);
  }
  #root .profile-edit-page .profile-edit-heading::before {
    position: absolute;
    z-index: 0;
    top: 25px;
    bottom: 25px;
    left: 0;
    width: 3px;
    content: "";
    border-radius: 0 3px 3px 0;
    background: #829A85;
    pointer-events: none;
  }
  #root .profile-edit-page .profile-edit-heading::after {
    position: absolute;
    z-index: 0;
    top: -60%;
    right: -5%;
    width: 48%;
    height: 190%;
    content: "";
    border-left: 1px solid rgba(255,255,255,.36);
    background: linear-gradient(112deg, transparent, rgba(255,255,255,.28), transparent);
    transform: rotate(12deg);
    pointer-events: none;
  }
  #root .profile-edit-page .profile-heading-main { position: relative; z-index: 1; }
  #root .profile-edit-page .profile-edit-card {
    position: relative;
    isolation: isolate;
    padding: clamp(20px, 2.8vw, 31px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 22px;
    background: linear-gradient(145deg, rgba(255,255,255,.74), rgba(255,250,236,.52));
    box-shadow: var(--momo-profile-shadow);
    -webkit-backdrop-filter: blur(28px) saturate(148%);
    backdrop-filter: blur(28px) saturate(148%);
  }
  #root .profile-edit-page .profile-edit-card::before {
    position: absolute;
    z-index: 0;
    inset: 0;
    content: "";
    border-radius: inherit;
    background: linear-gradient(125deg, rgba(255,255,255,.48), transparent 42%, rgba(255,212,59,.045));
    pointer-events: none;
  }
  #root .profile-edit-page .profile-edit-form,
  #root .profile-edit-page .profile-edit-layout { position: relative; z-index: 1; }
  #root .profile-edit-page .profile-edit-form { display: grid; gap: 15px; }
  #root .profile-edit-page .profile-edit-layout {
    display: grid;
    grid-template-columns: minmax(230px, 280px) minmax(0,1fr);
    align-items: stretch;
    gap: 15px;
  }
  #root .profile-edit-page .profile-edit-sidebar { display: flex; min-width: 0; flex-direction: column; gap: 12px; }
  #root .profile-edit-page .profile-edit-photo-card,
  #root .profile-edit-page .profile-edit-details {
    min-width: 0;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 18px;
    background: linear-gradient(145deg, rgba(255,255,255,.74), rgba(255,250,236,.5));
    box-shadow: 0 4px 12px rgba(41,40,32,.04), 0 12px 26px rgba(41,40,32,.06), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
    backdrop-filter: blur(24px) saturate(145%);
  }
  #root .profile-edit-page .profile-edit-photo-card {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 23px 19px 19px;
  }
  #root .profile-edit-page .profile-edit-section-heading { width: 100%; margin: 0 0 17px; }
  #root .profile-edit-page .profile-edit-section-eyebrow {
    display: block;
    margin: 0 0 6px;
    color: #80600E;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: .14em;
  }
  #root .profile-edit-page .profile-edit-section-heading h2 {
    margin: 0;
    color: #292820;
    font-size: 17px;
    font-weight: 850;
    letter-spacing: -.04em;
  }
  #root .profile-edit-page .profile-edit-section-heading p {
    margin: 6px 0 0;
    color: #746D60;
    font-size: 10px;
    line-height: 1.6;
  }
  #root .profile-edit-page .profile-image-preview {
    display: grid;
    place-items: center;
    flex: 0 0 108px;
    width: 108px;
    height: 108px;
    margin: 5px auto 17px;
    overflow: hidden;
    border: 4px solid #FFF3C5;
    border-radius: 50%;
    background: #FFF8E5;
    box-shadow: 0 0 0 1px rgba(214,180,63,.44), 0 9px 20px rgba(41,40,32,.09);
  }
  #root .profile-edit-page .profile-image-preview > *,
  #root .profile-edit-page .profile-image-preview img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }
  #root .profile-edit-page .profile-edit-file-input {
    display: block;
    width: 100%;
    min-width: 0;
    min-height: 40px;
    padding: 6px;
    border: 1px solid rgba(216,201,159,.9);
    border-radius: 10px;
    background: rgba(255,254,250,.86);
    color: #514C40;
    font-size: 10px;
  }
  #root .profile-edit-page .profile-edit-file-input::file-selector-button {
    min-height: 28px;
    margin-right: 8px;
    padding: 0 10px;
    border: 1px solid rgba(214,180,63,.6);
    border-radius: 7px;
    background: rgba(255,241,178,.54);
    color: #66510F;
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
  }
  #root .profile-edit-page .profile-edit-file-help {
    align-self: flex-start;
    margin: 7px 0 0;
    color: #6A6251;
    font-size: 9px;
  }
  #root .profile-edit-page .profile-image-buttons {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }
  #root .profile-edit-page .profile-image-buttons .profile-button {
    flex: 1 1 auto;
    min-height: 37px;
    padding: 0 10px;
    border-radius: 9px;
    font-size: 10px;
    font-weight: 800;
  }
  #root .profile-edit-page .profile-edit-image-save {
    border: 1px solid #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 4px 11px rgba(179,141,25,.12);
  }
  #root .profile-edit-page .profile-edit-image-save:hover:not(:disabled) { background: #F3C51E; }
  #root .profile-edit-page .profile-edit-image-remove {
    border: 1px solid rgba(229,184,173,.72);
    background: rgba(255,247,243,.82);
    color: #8C5149;
  }
  #root .profile-edit-page .profile-edit-sidebar-note {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 13px;
    border: 1px solid rgba(233,223,197,.84);
    border-radius: 12px;
    background: rgba(255,250,236,.5);
    box-shadow: inset 0 1px rgba(255,255,255,.86);
  }
  #root .profile-edit-page .profile-edit-note-mark {
    display: grid;
    place-items: center;
    flex: 0 0 18px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(255,212,59,.35);
    color: #80600E;
    font-size: 10px;
    font-weight: 850;
  }
  #root .profile-edit-page .profile-edit-sidebar-note p { margin: 0; color: #746D60; font-size: 9px; line-height: 1.6; }

  #root .profile-edit-page .profile-edit-details {
    display: grid;
    align-content: start;
    gap: 22px;
    padding: clamp(21px, 2.8vw, 30px);
  }
  #root .profile-edit-page .profile-edit-section { min-width: 0; }
  #root .profile-edit-page .profile-edit-password-section {
    padding-top: 21px;
    border-top: 1px solid rgba(214,180,63,.24);
  }
  #root .profile-edit-page .profile-edit-section .profile-edit-section-heading { margin-bottom: 15px; }
  #root .profile-edit-page .profile-edit-fields {
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 14px 13px;
  }
  #root .profile-edit-page .profile-edit-field { display: grid; min-width: 0; align-content: start; gap: 7px; }
  #root .profile-edit-page .profile-edit-field.is-wide { grid-column: 1 / -1; }
  #root .profile-edit-page .profile-edit-field label { margin: 0; color: #514C40; font-size: 10px; font-weight: 850; }
  #root .profile-edit-page .profile-edit-field input {
    display: block;
    width: 100%;
    min-width: 0;
    min-height: 45px;
    box-sizing: border-box;
    padding: 0 12px;
    border: 1px solid rgba(216,201,159,.88);
    border-radius: 10px;
    outline: none;
    background: rgba(255,254,250,.86);
    color: #292820;
    font-size: 11px;
    transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }
  #root .profile-edit-page .profile-edit-field input:read-only {
    border-color: rgba(233,223,197,.82);
    background: rgba(245,242,235,.76);
    color: #817867;
    cursor: default;
  }
  #root .profile-edit-page .profile-edit-field input:focus {
    border-color: rgba(179,141,25,.72);
    background: rgba(255,255,255,.96);
    box-shadow: 0 0 0 3px rgba(255,212,59,.18), inset 0 1px rgba(255,255,255,.98);
  }
  #root .profile-edit-page .profile-edit-feedback {
    min-height: 13px;
    margin: -1px 1px 0;
    color: #6A6251;
    font-size: 9px;
    font-weight: 650;
    line-height: 1.45;
  }
  #root .profile-edit-page .profile-edit-feedback.is-valid { color: #80600E; }
  #root .profile-edit-page .profile-edit-feedback.is-error { color: #A34D43; }
  #root .profile-edit-page .profile-edit-feedback.is-pending { color: #746D60; }

  #root .profile-edit-page .profile-form-buttons {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    margin: 0;
    padding: 15px 0 0;
    border-top: 1px solid rgba(214,180,63,.24);
  }
  #root .profile-edit-page .profile-form-buttons .profile-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 116px;
    min-height: 44px;
    padding: 0 18px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 850;
    transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
  }
  #root .profile-edit-page .profile-edit-submit {
    border: 1px solid #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 5px 13px rgba(179,141,25,.15), inset 0 1px rgba(255,255,255,.68);
  }
  #root .profile-edit-page .profile-edit-submit:hover:not(:disabled) {
    border-color: #B38D19;
    background: #F3C51E;
    box-shadow: 0 8px 17px rgba(179,141,25,.19), inset 0 1px rgba(255,255,255,.86);
  }
  #root .profile-edit-page .profile-edit-submit:disabled {
    border-color: rgba(214,180,63,.58);
    background: #F5EBC6;
    color: #8B7A4C;
    box-shadow: none;
    opacity: 1;
    cursor: not-allowed;
  }
  #root .profile-edit-page .profile-edit-cancel {
    border: 1px solid rgba(233,223,197,.94);
    background: rgba(255,254,250,.72);
    color: #665D4D;
    box-shadow: inset 0 1px rgba(255,255,255,.96);
  }
  #root .profile-edit-page .profile-edit-cancel:hover:not(:disabled) {
    border-color: rgba(214,180,63,.56);
    background: rgba(255,248,229,.94);
  }

  #root .profile-delete-page-card .profile-delete-button:disabled {
    border-color: #E5B8AD;
    background: #F1EADF;
    color: #776F62;
    opacity: 1;
  }
  #root .profile-delete-page-card .profile-delete-button:not(:disabled) {
    border-color: #E5B8AD;
    background: #FFF1EC;
    color: #8C3F38;
    opacity: 1;
  }

  /* Delete-account route: calm explanation with a separate warning surface. */
  #root .profile-delete-page-card {
    border: 1px solid rgba(229,184,173,.74);
    border-radius: 18px;
    background: linear-gradient(145deg, rgba(255,255,255,.84), rgba(255,247,243,.72));
    box-shadow: var(--momo-profile-shadow);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
    backdrop-filter: blur(24px) saturate(140%);
  }

  @media (max-width: 900px) {
    #root .profile-dashboard,
    #root .profile-edit-page { width: 100%; }
    #root .profile-dashboard .profile-user { grid-template-columns: 74px minmax(0,1fr); gap: 17px; }
    #root .profile-dashboard .profile-avatar { width: 74px; height: 74px; }
    #root .profile-edit-page .profile-edit-layout { grid-template-columns: minmax(210px,245px) minmax(0,1fr); }
  }
  @media (max-width: 700px) {
    #root .profile-dashboard,
    #root .profile-edit-page { width: min(100% - 30px, 560px); padding-bottom: 44px; }
    #root .profile-dashboard .profile-dashboard-heading,
    #root .profile-edit-page .profile-edit-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 13px;
      min-height: 0;
      padding: 24px 21px;
    }
    #root .profile-dashboard .profile-dashboard-edit { align-self: flex-start; }
    #root .profile-dashboard .profile-card { padding: 20px 17px; border-radius: 17px; }
    #root .profile-dashboard .profile-user { grid-template-columns: 1fr; gap: 14px; }
    #root .profile-dashboard .profile-avatar { width: 68px; height: 68px; }
    #root .profile-dashboard .profile-user-details { grid-template-columns: 1fr; gap: 10px; padding-top: 13px; }
    #root .profile-dashboard .profile-user-details > div,
    #root .profile-dashboard .profile-user-details > div:first-child {
      grid-template-columns: 72px minmax(0,1fr);
      gap: 10px;
      padding: 0;
      border: 0;
    }
    #root .profile-dashboard .profile-user-details dd { text-align: right; }
    #root .profile-dashboard .profile-activity-grid { grid-template-columns: 1fr; gap: 10px; }
    #root .profile-dashboard .profile-activity-item { min-height: 144px; padding: 15px 16px 13px; }
    #root .profile-dashboard .profile-activity-top { margin-bottom: 10px; }
    #root .profile-dashboard .profile-delete-section { align-items: flex-start; flex-direction: column; }
    #root .profile-edit-page .profile-edit-layout { grid-template-columns: 1fr; gap: 12px; }
    #root .profile-edit-page .profile-edit-photo-card {
      display: grid;
      grid-template-columns: 92px minmax(0,1fr);
      align-items: center;
      gap: 9px 15px;
      padding: 17px;
    }
    #root .profile-edit-page .profile-edit-photo-card .profile-edit-section-heading { grid-column: 1 / -1; margin-bottom: 2px; }
    #root .profile-edit-page .profile-image-preview {
      grid-row: span 3;
      width: 84px;
      height: 84px;
      margin: 0;
    }
    #root .profile-edit-page .profile-edit-file-input { align-self: start; }
    #root .profile-edit-page .profile-edit-file-help { grid-column: 2; margin: 0; }
    #root .profile-edit-page .profile-image-buttons { grid-column: 1 / -1; margin-top: 5px; }
    #root .profile-edit-page .profile-edit-sidebar-note { display: none; }
    #root .profile-edit-page .profile-edit-details { padding: 19px 16px; border-radius: 17px; }
    #root .profile-edit-page .profile-edit-fields { grid-template-columns: 1fr; gap: 12px; }
    #root .profile-edit-page .profile-edit-field.is-wide { grid-column: auto; }
    #root .profile-edit-page .profile-form-buttons { display: grid; grid-template-columns: 1fr 1fr; }
    #root .profile-edit-page .profile-form-buttons .profile-button { width: 100%; min-width: 0; }
  }
  @media (max-width: 420px) {
    #root .profile-dashboard,
    #root .profile-edit-page { width: calc(100% - 24px); }
    #root .profile-dashboard .profile-card { padding: 18px 15px; }
    #root .profile-dashboard .profile-activity-item { min-height: 136px; }
    #root .profile-edit-page .profile-edit-photo-card { grid-template-columns: 74px minmax(0,1fr); gap: 8px 11px; padding: 14px; }
    #root .profile-edit-page .profile-image-preview { width: 70px; height: 70px; }
    #root .profile-edit-page .profile-edit-details { padding: 17px 13px; }
    #root .profile-edit-page .profile-form-buttons { gap: 7px; }
    #root .profile-edit-page .profile-form-buttons .profile-button { padding: 0 10px; }
  }
  @media (prefers-reduced-motion: reduce) {
    #root .profile-dashboard *,
    #root .profile-edit-page *,
    #root .profile-delete-page-card * {
      animation-duration: .01ms;
      animation-iteration-count: 1;
      transition-duration: .01ms;
      scroll-behavior: auto;
    }
  }
`;

export default ProfileWorkspaceStyles;
