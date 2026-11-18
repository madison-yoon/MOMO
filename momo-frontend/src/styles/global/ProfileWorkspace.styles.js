import { createGlobalStyle } from "styled-components";

const ProfileWorkspaceStyles = createGlobalStyle`
  /* MOMO profile dashboard: warm surfaces, restrained accents, clear hierarchy. */
  #root .profile-dashboard {
    width: min(1080px, calc(100% - 48px));
    max-width: 1080px;
    margin: 0 auto;
    padding: 34px 0 64px;
    border-radius: 0;
    background: transparent;
  }
  #root .profile-dashboard .profile-dashboard-container { display: grid; gap: 18px; }
  #root .profile-dashboard .profile-dashboard-heading {
    position: relative; isolation: isolate;
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 24px; min-height: 132px; margin: 0 0 4px;
    padding: clamp(24px, 3.4vw, 36px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.94); border-radius: 22px;
    background:
      radial-gradient(ellipse at 94% 0%, rgba(255,212,59,.22), transparent 42%),
      linear-gradient(135deg, rgba(255,255,255,.74), rgba(255,250,236,.48));
    box-shadow: 0 2px 5px rgba(68,55,27,.035), 0 18px 38px rgba(68,55,27,.09), inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.2);
    backdrop-filter: blur(28px) saturate(150%);
    -webkit-backdrop-filter: blur(28px) saturate(150%);
  }
  #root .profile-dashboard .profile-dashboard-heading::before {
    position: absolute; inset: 0; content: "";
    background: linear-gradient(112deg, transparent 20%, rgba(255,255,255,.34) 48%, transparent 72%);
    pointer-events: none;
  }
  #root .profile-dashboard .profile-dashboard-heading > * { position: relative; z-index: 1; }
  #root .profile-dashboard .profile-heading-main { min-width: 0; }
  #root .profile-dashboard .profile-heading-eyebrow,
  #root .profile-edit-page .profile-heading-eyebrow {
    display: block; margin: 0 0 9px; color: #8A6A20;
    font-size: 10px; font-weight: 850; letter-spacing: .16em;
  }
  #root .profile-dashboard .profile-heading h1,
  #root .profile-edit-page .profile-heading h1 {
    margin: 0; padding: 0; border: 0; background: none;
    color: #292820; font-size: clamp(29px, 3.2vw, 36px);
    font-weight: 850; line-height: 1.16; letter-spacing: -.055em;
    box-shadow: none;
  }
  #root .profile-dashboard .profile-heading p,
  #root .profile-edit-page .profile-heading p {
    margin: 9px 0 0; color: #6A6251; font-size: 13px; line-height: 1.6;
  }
  #root .profile-dashboard .profile-dashboard-edit {
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    flex: 0 0 auto; min-height: 42px; padding: 0 16px;
    border: 1px solid rgba(214,180,63,.64); border-radius: 11px;
    background: rgba(255,250,236,.86); color: #66510F;
    font-size: 12px; font-weight: 800; text-decoration: none;
    box-shadow: 0 4px 12px rgba(75,61,31,.045);
    transition: background 180ms ease, border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
  }
  #root .profile-dashboard .profile-dashboard-edit:hover {
    border-color: #D6B43F; background: #FFF1B2;
    box-shadow: 0 7px 16px rgba(75,61,31,.075); transform: translateY(-1px);
  }

  #root .profile-dashboard .profile-card {
    position: relative; isolation: isolate; min-width: 0; padding: clamp(22px, 2.8vw, 30px);
    overflow: hidden; border: 1px solid rgba(255,255,255,.94);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 92% 0%, rgba(255,255,255,.76), transparent 46%),
      linear-gradient(145deg, rgba(255,255,255,.66), rgba(255,250,236,.44) 60%, rgba(255,246,218,.36));
    box-shadow: 0 2px 5px rgba(75,61,31,.035), 0 18px 38px rgba(75,61,31,.09), 0 30px 60px rgba(75,61,31,.035), inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.22);
    backdrop-filter: blur(28px) saturate(148%);
    -webkit-backdrop-filter: blur(28px) saturate(148%);
    transition: transform 240ms cubic-bezier(.2,.72,.2,1), box-shadow 240ms ease, border-color 240ms ease;
  }
  #root .profile-dashboard .profile-card::before {
    position: absolute; inset: 0; content: "";
    border-radius: inherit;
    background: linear-gradient(118deg, rgba(255,255,255,.46), transparent 30%, transparent 72%, rgba(255,255,255,.16));
    pointer-events: none;
  }
  #root .profile-dashboard .profile-card > * { position: relative; z-index: 1; }
  #root .profile-dashboard .profile-card:hover {
    border-color: rgba(214,180,63,.52);
    box-shadow: 0 5px 10px rgba(75,61,31,.045), 0 25px 48px rgba(75,61,31,.12), inset 0 1px rgba(255,255,255,1);
    transform: perspective(1200px) translateY(-3px) rotateX(.3deg);
  }
  #root .profile-dashboard .profile-card-heading {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; margin: 0 0 21px;
  }
  #root .profile-dashboard .profile-section-label {
    display: block; margin: 0 0 7px; color: #8A6A20;
    font-size: 9px; font-weight: 850; letter-spacing: .13em;
  }
  #root .profile-dashboard .profile-card-heading h2 {
    margin: 0; color: #292820; font-size: 18px;
    font-weight: 850; letter-spacing: -.035em;
  }
  #root .profile-dashboard .profile-card-heading p {
    margin: 6px 0 0; color: #6A6251; font-size: 12px; line-height: 1.55;
  }

  /* Account identity and member data. */
  #root .profile-dashboard .profile-user {
    display: grid; grid-template-columns: 78px minmax(0, 1fr);
    align-items: center; gap: 22px; min-width: 0; padding: 0;
    border: 0; border-radius: 0; background: transparent; box-shadow: none;
  }
  #root .profile-dashboard .profile-avatar {
    display: grid; place-items: center; width: 78px; height: 78px;
    overflow: hidden; border: 3px solid rgba(255,241,178,.92); border-radius: 50%;
    background: #FFF8E5;
    box-shadow: 0 0 0 1px rgba(214,180,63,.35), 0 8px 18px rgba(75,61,31,.08);
    color: #80600E;
  }
  #root .profile-dashboard .profile-avatar > *,
  #root .profile-dashboard .profile-avatar img {
    display: block; width: 100%; height: 100%; border-radius: inherit; object-fit: cover;
  }
  #root .profile-dashboard .profile-user-info { display: block; width: 100%; min-width: 0; }
  #root .profile-dashboard .profile-user-identity {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 12px; margin: 0 0 16px;
  }
  #root .profile-dashboard .profile-user-kicker {
    display: block; margin: 0 0 5px; color: #8A806D;
    font-size: 9px; font-weight: 800; letter-spacing: .1em;
  }
  #root .profile-dashboard .profile-user-info h3 {
    margin: 0; color: #292820; font-size: 20px; font-weight: 850;
    line-height: 1.2; letter-spacing: -.04em;
  }
  #root .profile-dashboard .profile-user-details {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0; margin: 0; padding: 15px 0 0;
    border-top: 1px solid rgba(233,223,197,.84);
  }
  #root .profile-dashboard .profile-user-details > div {
    display: grid; min-width: 0; gap: 5px; padding: 0 16px;
    border-left: 1px solid rgba(233,223,197,.84);
  }
  #root .profile-dashboard .profile-user-details > div:first-child { padding-left: 0; border-left: 0; }
  #root .profile-dashboard .profile-user-details dt { color: #8A806D; font-size: 10px; font-weight: 700; }
  #root .profile-dashboard .profile-user-details dd {
    min-width: 0; margin: 0; overflow-wrap: anywhere; color: #514833;
    font-size: 12px; font-weight: 700;
  }

  /* Movie activity cards: same surface family; function is carried by the icon. */
  #root .profile-dashboard .profile-activity-section .profile-card-heading { margin-bottom: 20px; }
  #root .profile-dashboard .profile-activity-grid {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px; width: 100%;
  }
  #root .profile-dashboard .profile-activity-item,
  #root .profile-dashboard .profile-activity-item[data-tone="writing"],
  #root .profile-dashboard .profile-activity-item[data-tone="liked"],
  #root .profile-dashboard .profile-activity-item[data-tone="saved"] {
    --activity-ink: #80600E;
    display: flex; position: relative; isolation: isolate; min-width: 0; min-height: 178px;
    flex-direction: column; align-items: stretch; gap: 0; padding: 17px 18px 14px;
    overflow: hidden; border: 1px solid rgba(233,223,197,.9); border-radius: 15px;
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(255,250,236,.48));
    box-shadow: 0 2px 4px rgba(75,61,31,.04), 0 10px 22px rgba(75,61,31,.08), inset 0 1px rgba(255,255,255,1);
    color: #292820; text-align: left; text-decoration: none;
    backdrop-filter: blur(22px) saturate(148%);
    -webkit-backdrop-filter: blur(22px) saturate(148%);
    transition: border-color 180ms ease, background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
  }
  #root .profile-dashboard .profile-activity-item::before {
    position: absolute; inset: 0; content: "";
    border-radius: inherit;
    background: linear-gradient(118deg, rgba(255,255,255,.42), transparent 42%, transparent 76%, rgba(255,255,255,.12));
    pointer-events: none;
  }
  #root .profile-dashboard .profile-activity-item > * { position: relative; z-index: 1; }
  #root .profile-dashboard .profile-activity-item:hover {
    border-color: rgba(214,180,63,.74);
    background: linear-gradient(155deg, #FFFEFA, #FFF8E4);
    box-shadow: 0 11px 22px rgba(75,61,31,.085), inset 0 1px rgba(255,255,255,1);
    transform: perspective(900px) translateY(-4px) rotateX(.45deg);
  }
  #root .profile-dashboard .profile-activity-item:focus-visible {
    outline: 3px solid rgba(198,161,43,.5); outline-offset: 3px;
  }
  #root .profile-dashboard .profile-activity-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; margin: 0 0 15px;
  }
  #root .profile-dashboard .profile-activity-icon {
    display: grid; place-items: center; flex: 0 0 36px; width: 36px; height: 36px;
    border: 1px solid rgba(214,180,63,.3); border-radius: 10px;
    background: rgba(255,241,178,.5); box-shadow: none; color: #80600E;
  }
  #root .profile-dashboard .profile-activity-icon svg { display: block; width: 18px; height: 18px; }
  #root .profile-dashboard .profile-activity-number {
    color: #B5A88D; font-size: 10px; font-weight: 800;
    font-variant-numeric: tabular-nums; letter-spacing: .08em;
  }
  #root .profile-dashboard .profile-activity-body { display: grid; gap: 8px; }
  #root .profile-dashboard .profile-activity-item h3 {
    margin: 0; color: #514833; font-size: 13px; font-weight: 800; letter-spacing: -.02em;
  }
  #root .profile-dashboard .profile-activity-count-row {
    display: inline-flex; align-items: baseline; align-self: flex-start; gap: 6px;
    margin: 0; padding: 0; border: 0; background: transparent; box-shadow: none;
  }
  #root .profile-dashboard .profile-activity-count {
    color: #292820; font-size: clamp(34px, 3.2vw, 40px);
    font-weight: 850; line-height: .98; letter-spacing: -.065em; font-variant-numeric: tabular-nums;
  }
  #root .profile-dashboard .profile-activity-unit { color: #8A806D; font-size: 11px; font-weight: 700; }
  #root .profile-dashboard .profile-activity-footer {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; margin-top: auto; padding-top: 12px;
    border-top: 1px solid rgba(233,223,197,.86);
  }
  #root .profile-dashboard .profile-activity-footer p {
    display: block; min-width: 0; margin: 0; color: #756C5A;
    font-size: 10px; font-weight: 600; line-height: 1.45;
  }
  #root .profile-dashboard .profile-activity-arrow {
    display: grid; place-items: center; flex: 0 0 26px; width: 26px; height: 26px;
    border: 1px solid rgba(233,223,197,.9); border-radius: 8px;
    background: rgba(255,254,250,.82); color: #80600E;
    font-size: 14px; font-weight: 800; line-height: 1;
    transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
  }
  #root .profile-dashboard .profile-activity-item:hover .profile-activity-arrow {
    border-color: rgba(214,180,63,.56); background: #FFF1B2; transform: translate(1px,-1px);
  }

  /* Account deletion remains present without competing with primary activity. */
  #root .profile-dashboard .profile-delete-section {
    display: flex; align-items: center; justify-content: space-between; gap: 20px;
    padding: 18px 3px 0; border: 0; border-top: 1px solid rgba(233,223,197,.9);
    border-radius: 0; background: transparent; box-shadow: none;
  }
  #root .profile-dashboard .profile-delete-copy .profile-section-label { margin-bottom: 5px; color: #9A766D; }
  #root .profile-dashboard .profile-delete-copy h2 {
    margin: 0; color: #514833; font-size: 13px; font-weight: 800;
  }
  #root .profile-dashboard .profile-delete-copy p {
    margin: 5px 0 0; color: #817867; font-size: 11px; line-height: 1.5;
  }
  #root .profile-dashboard .profile-delete-button {
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    min-height: 36px; padding: 0 12px; border: 1px solid rgba(229,184,173,.72);
    border-radius: 9px; background: rgba(255,250,236,.5); box-shadow: none;
    color: #8C5149; font-size: 11px; font-weight: 750; text-decoration: none;
    transition: border-color 180ms ease, background 180ms ease;
  }
  #root .profile-dashboard .profile-delete-button:hover {
    border-color: rgba(214,157,145,.82); background: #FFF1EC; color: #793A34; transform: none;
  }

  /* Profile settings: portrait on the left; clear form sections on the right. */
  #root .profile-edit-page {
    width: min(1080px, calc(100% - 48px)); max-width: 1080px;
    margin: 0 auto; padding: 34px 0 72px; border-radius: 0;
    background: transparent;
  }
  #root .profile-edit-page .profile-container { display: grid; gap: 18px; }
  #root .profile-edit-page .profile-edit-heading {
    position: relative; isolation: isolate; display: block; min-height: 132px;
    margin: 0 0 4px; padding: clamp(24px, 3.4vw, 36px); overflow: hidden;
    border: 1px solid rgba(255,255,255,.94); border-radius: 22px;
    background:
      radial-gradient(ellipse at 94% 0%, rgba(255,212,59,.2), transparent 42%),
      linear-gradient(135deg, rgba(255,255,255,.74), rgba(255,250,236,.48));
    box-shadow: 0 2px 5px rgba(68,55,27,.035), 0 18px 38px rgba(68,55,27,.09), inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.2);
    backdrop-filter: blur(28px) saturate(150%);
    -webkit-backdrop-filter: blur(28px) saturate(150%);
  }
  #root .profile-edit-page .profile-edit-heading::before {
    position: absolute; inset: 0; content: "";
    background: linear-gradient(112deg, transparent 20%, rgba(255,255,255,.34) 48%, transparent 72%);
    pointer-events: none;
  }
  #root .profile-edit-page .profile-edit-heading > * { position: relative; z-index: 1; }
  #root .profile-edit-page .profile-edit-card {
    position: relative; padding: 0; overflow: visible; border: 0; border-radius: 0;
    background: transparent; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  #root .profile-edit-page .profile-edit-form { display: grid; gap: 16px; }
  #root .profile-edit-page .profile-edit-layout {
    display: grid; grid-template-columns: minmax(230px, 276px) minmax(0, 1fr);
    align-items: stretch; gap: 16px;
  }
  #root .profile-edit-page .profile-edit-sidebar { display: flex; min-width: 0; flex-direction: column; gap: 12px; }
  #root .profile-edit-page .profile-edit-photo-card,
  #root .profile-edit-page .profile-edit-details {
    min-width: 0; border: 1px solid rgba(233,223,197,.9); border-radius: 18px;
    background: linear-gradient(145deg, rgba(255,255,255,.72), rgba(255,250,236,.48));
    box-shadow: 0 2px 5px rgba(75,61,31,.035), 0 16px 34px rgba(75,61,31,.09), inset 0 1px rgba(255,255,255,1);
    backdrop-filter: blur(28px) saturate(148%);
    -webkit-backdrop-filter: blur(28px) saturate(148%);
  }
  #root .profile-edit-page .profile-edit-photo-card {
    display: flex; align-items: center; flex-direction: column; padding: 24px 20px 20px;
  }
  #root .profile-edit-page .profile-edit-section-heading { width: 100%; margin: 0 0 21px; }
  #root .profile-edit-page .profile-edit-section-eyebrow {
    display: block; margin: 0 0 7px; color: #8A6A20;
    font-size: 9px; font-weight: 850; letter-spacing: .13em;
  }
  #root .profile-edit-page .profile-edit-section-heading h2 {
    margin: 0; color: #292820; font-size: 17px; font-weight: 850; letter-spacing: -.035em;
  }
  #root .profile-edit-page .profile-edit-section-heading p {
    margin: 7px 0 0; color: #6A6251; font-size: 11px; line-height: 1.6;
  }
  #root .profile-edit-page .profile-image-preview {
    display: grid; place-items: center; flex: 0 0 108px;
    width: 108px; height: 108px; margin: 2px auto 19px; overflow: hidden;
    border: 3px solid #FFF3C5; border-radius: 50%; background: #FFF8E5;
    box-shadow: 0 0 0 1px rgba(214,180,63,.42), 0 8px 18px rgba(75,61,31,.08);
  }
  #root .profile-edit-page .profile-image-preview > *,
  #root .profile-edit-page .profile-image-preview img {
    display: block; width: 100%; height: 100%; border-radius: inherit; object-fit: cover;
  }
  #root .profile-edit-page .profile-edit-file-label {
    display: inline-flex; align-items: center; justify-content: center; align-self: stretch;
    min-height: 40px; margin: 0 0 8px; padding: 0 13px;
    border: 1px solid rgba(214,180,63,.64); border-radius: 10px;
    background: rgba(255,241,178,.48); color: #66510F;
    font-size: 11px; font-weight: 800; cursor: pointer;
  }
  #root .profile-edit-page .profile-edit-file-input {
    display: block; width: 100%; min-width: 0; min-height: 40px;
    padding: 6px; border: 1px solid rgba(233,223,197,.92); border-radius: 10px;
    background: rgba(255,250,236,.72); color: #514833; font-size: 10px;
  }
  #root .profile-edit-page .profile-edit-file-input::file-selector-button {
    min-height: 28px; margin-right: 8px; padding: 0 9px;
    border: 1px solid rgba(214,180,63,.55); border-radius: 7px;
    background: #FFFEFA; color: #66510F; font-size: 10px; font-weight: 750; cursor: pointer;
  }
  #root .profile-edit-page .profile-edit-file-help {
    align-self: flex-start; margin: 7px 0 0; color: #817867; font-size: 10px;
  }
  #root .profile-edit-page .profile-image-buttons {
    display: flex; width: 100%; flex-wrap: wrap; gap: 8px; margin-top: 17px;
  }
  #root .profile-edit-page .profile-image-buttons .profile-button {
    flex: 1 1 auto; min-height: 37px; padding: 0 10px;
    border-radius: 9px; font-size: 10px; font-weight: 800;
  }
  #root .profile-edit-page .profile-edit-image-save {
    border: 1px solid #D6B43F; background: #FFD43B; color: #292820; box-shadow: none;
  }
  #root .profile-edit-page .profile-edit-image-save:hover:not(:disabled) {
    border-color: #B38D19; background: #F3C72E; color: #292820;
  }
  #root .profile-edit-page .profile-edit-image-save:disabled { opacity: .55; cursor: not-allowed; }
  #root .profile-edit-page .profile-edit-image-remove {
    border: 1px solid rgba(229,184,173,.75); background: #FFF7F3; color: #8C5149;
  }
  #root .profile-edit-page .profile-edit-image-remove:hover:not(:disabled) {
    border-color: #D69D91; background: #FFF1EC; color: #793A34;
  }
  #root .profile-edit-page .profile-edit-sidebar-note {
    display: flex; align-items: flex-start; gap: 9px; padding: 13px 14px;
    border: 1px solid rgba(233,223,197,.8); border-radius: 12px;
    background: rgba(255,250,236,.58);
  }
  #root .profile-edit-page .profile-edit-note-mark {
    display: grid; place-items: center; flex: 0 0 18px; width: 18px; height: 18px;
    border-radius: 50%; background: rgba(255,212,59,.32); color: #80600E;
    font-size: 11px; font-weight: 850;
  }
  #root .profile-edit-page .profile-edit-sidebar-note p {
    margin: 0; color: #756C5A; font-size: 10px; line-height: 1.55;
  }

  #root .profile-edit-page .profile-edit-details {
    display: grid; align-content: start; gap: 24px;
    padding: clamp(22px, 2.8vw, 30px);
  }
  #root .profile-edit-page .profile-edit-section { min-width: 0; }
  #root .profile-edit-page .profile-edit-password-section {
    padding-top: 23px; border-top: 1px solid rgba(233,223,197,.92);
  }
  #root .profile-edit-page .profile-edit-section .profile-edit-section-heading { margin-bottom: 17px; }
  #root .profile-edit-page .profile-edit-fields {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px 14px;
  }
  #root .profile-edit-page .profile-edit-field {
    display: grid; min-width: 0; align-content: start; gap: 7px;
  }
  #root .profile-edit-page .profile-edit-field.is-wide { grid-column: 1 / -1; }
  #root .profile-edit-page .profile-edit-field label {
    margin: 0; color: #514833; font-size: 11px; font-weight: 800;
  }
  #root .profile-edit-page .profile-edit-field input {
    display: block; width: 100%; min-width: 0; min-height: 45px;
    box-sizing: border-box; padding: 0 13px;
    border: 1px solid rgba(216,201,159,.9); border-radius: 10px;
    outline: none; background: rgba(255,254,250,.96); color: #292820;
    font-size: 12px; transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }
  #root .profile-edit-page .profile-edit-field input::placeholder { color: #9A907E; }
  #root .profile-edit-page .profile-edit-field input:read-only {
    border-color: rgba(233,223,197,.82); background: #F5F2EB; color: #817867; cursor: default;
  }
  #root .profile-edit-page .profile-edit-field input:focus {
    border-color: rgba(198,161,43,.86); background: #FFFEFA;
    box-shadow: 0 0 0 3px rgba(255,212,59,.2);
  }
  #root .profile-edit-page .profile-edit-feedback {
    min-height: 14px; margin: -1px 1px 0; color: #817867;
    font-size: 10px; font-weight: 650; line-height: 1.45;
  }
  #root .profile-edit-page .profile-edit-feedback.is-valid { color: #80600E; }
  #root .profile-edit-page .profile-edit-feedback.is-error { color: #A34D43; }
  #root .profile-edit-page .profile-edit-feedback.is-pending { color: #6A6251; }

  #root .profile-edit-page .profile-edit-actions {
    display: flex; justify-content: flex-end; gap: 9px; margin: 0;
    padding: 16px 0 0; border: 0;
  }
  #root .profile-edit-page .profile-edit-actions .profile-button {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 112px; min-height: 44px; padding: 0 18px;
    border-radius: 10px; font-size: 12px; font-weight: 800;
    transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
  }
  #root .profile-edit-page .profile-edit-submit {
    border: 1px solid #D6B43F; background: #FFD43B; color: #292820;
    box-shadow: 0 5px 14px rgba(179,141,25,.14);
  }
  #root .profile-edit-page .profile-edit-submit:hover:not(:disabled) {
    border-color: #B38D19; background: #F3C72E;
    box-shadow: 0 8px 18px rgba(179,141,25,.18); transform: translateY(-1px);
  }
  #root .profile-edit-page .profile-edit-submit:disabled {
    border-color: rgba(214,180,63,.5); background: #F5EBC6;
    color: #8B7A4C; box-shadow: none; opacity: 1; cursor: not-allowed;
  }
  #root .profile-edit-page .profile-edit-cancel {
    border: 1px solid rgba(233,223,197,.95); background: rgba(255,250,236,.7);
    color: #665D4D; box-shadow: none;
  }
  #root .profile-edit-page .profile-edit-cancel:hover:not(:disabled) {
    border-color: rgba(214,180,63,.6); background: #FFF8E5; transform: translateY(-1px);
  }

  /* Standalone member deletion uses the same account surface. */
  #root .profile-delete-page-card {
    border: 1px solid rgba(255,255,255,.9); border-radius: 20px;
    background: linear-gradient(145deg, rgba(255,255,255,.68), rgba(255,250,236,.52));
    box-shadow: 0 2px 5px rgba(75,61,31,.035), 0 16px 34px rgba(75,61,31,.09), inset 0 1px rgba(255,255,255,1);
  }
  #root .profile-delete-page-card h2 { color: #292820; font-size: 19px; font-weight: 850; }
  #root .profile-delete-page-card > p { color: #6A6251; line-height: 1.7; }

  @media (max-width: 900px) {
    #root .profile-edit-page .profile-edit-layout { grid-template-columns: minmax(200px, 240px) minmax(0, 1fr); }
    #root .profile-dashboard .profile-user { grid-template-columns: 70px minmax(0, 1fr); gap: 17px; }
    #root .profile-dashboard .profile-avatar { width: 70px; height: 70px; }
  }
  @media (max-width: 700px) {
    #root .profile-dashboard,
    #root .profile-edit-page {
      width: min(100% - 32px, 560px); padding-top: 24px; padding-bottom: 48px;
    }
    #root .profile-dashboard .profile-dashboard-heading { align-items: flex-start; flex-direction: column; gap: 14px; }
    #root .profile-dashboard .profile-dashboard-edit { align-self: flex-start; }
    #root .profile-dashboard .profile-card { padding: 21px 18px; border-radius: 17px; }
    #root .profile-dashboard .profile-user { grid-template-columns: 1fr; gap: 16px; }
    #root .profile-dashboard .profile-avatar { width: 68px; height: 68px; }
    #root .profile-dashboard .profile-user-details {
      grid-template-columns: 1fr; gap: 10px; padding-top: 14px;
    }
    #root .profile-dashboard .profile-user-details > div,
    #root .profile-dashboard .profile-user-details > div:first-child {
      grid-template-columns: 72px minmax(0, 1fr); gap: 12px; padding: 0; border: 0;
    }
    #root .profile-dashboard .profile-user-details dd { text-align: right; }
    #root .profile-dashboard .profile-activity-grid { grid-template-columns: 1fr; gap: 10px; }
    #root .profile-dashboard .profile-activity-item { min-height: 146px; padding: 15px 16px 13px; }
    #root .profile-dashboard .profile-activity-top { margin-bottom: 10px; }
    #root .profile-dashboard .profile-delete-section { align-items: flex-start; flex-direction: column; }
    #root .profile-edit-page .profile-edit-layout { grid-template-columns: 1fr; gap: 12px; }
    #root .profile-edit-page .profile-edit-photo-card {
      display: grid; grid-template-columns: 92px minmax(0, 1fr);
      align-items: center; gap: 9px 16px; padding: 18px;
    }
    #root .profile-edit-page .profile-edit-photo-card .profile-edit-section-heading {
      grid-column: 1 / -1; margin-bottom: 4px;
    }
    #root .profile-edit-page .profile-image-preview {
      grid-row: span 3; width: 88px; height: 88px; margin: 0;
    }
    #root .profile-edit-page .profile-edit-file-label { align-self: end; margin: 0; }
    #root .profile-edit-page .profile-edit-file-input { align-self: start; }
    #root .profile-edit-page .profile-edit-file-help { grid-column: 2; margin: 0; }
    #root .profile-edit-page .profile-image-buttons { grid-column: 1 / -1; margin-top: 6px; }
    #root .profile-edit-page .profile-edit-sidebar-note { display: none; }
    #root .profile-edit-page .profile-edit-details { padding: 20px 17px; border-radius: 17px; }
    #root .profile-edit-page .profile-edit-fields { grid-template-columns: 1fr; gap: 12px; }
    #root .profile-edit-page .profile-edit-field.is-wide { grid-column: auto; }
    #root .profile-edit-page .profile-edit-actions { display: grid; grid-template-columns: 1fr 1fr; }
    #root .profile-edit-page .profile-edit-actions .profile-button { width: 100%; min-width: 0; }
  }
  @media (max-width: 420px) {
    #root .profile-dashboard,
    #root .profile-edit-page { width: calc(100% - 24px); }
    #root .profile-dashboard .profile-card { padding: 18px 15px; }
    #root .profile-dashboard .profile-activity-item { min-height: 138px; }
    #root .profile-edit-page .profile-edit-photo-card {
      grid-template-columns: 76px minmax(0, 1fr); gap: 8px 12px; padding: 15px;
    }
    #root .profile-edit-page .profile-image-preview { width: 72px; height: 72px; }
    #root .profile-edit-page .profile-edit-file-input { font-size: 9px; }
    #root .profile-edit-page .profile-edit-details { padding: 18px 14px; }
  }
  @media (prefers-reduced-motion: reduce) {
    #root .profile-dashboard *,
    #root .profile-edit-page * {
      transition-duration: .01ms; animation-duration: .01ms;
    }
  }
`;

export default ProfileWorkspaceStyles;
