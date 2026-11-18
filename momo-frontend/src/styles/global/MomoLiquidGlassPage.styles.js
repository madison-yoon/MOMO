import { createGlobalStyle } from "styled-components";

/*
 * MOMO Cinema Archive
 * Quiet cinema-inspired surfaces: restrained color, real translucent glass,
 * editorial hierarchy and poster-led composition. No decorative bubbles or tape.
 */
const MomoLiquidGlassPageStyles = createGlobalStyle`
  :root {
    --momo-glass-ink: #292820;
    --momo-glass-muted: #6A6251;
    --momo-glass-edge: rgba(255,255,255,.84);
    --momo-glass-surface: rgba(255,250,236,.76);
    --momo-glass-shadow: 0 12px 30px rgba(39,43,39,.075), inset 0 1px rgba(255,255,255,.9);
    --momo-glass-ease: cubic-bezier(.2,.72,.2,1);
    --momo-tone-film: #637A72;
    --momo-tone-write: #8A7652;
    --momo-tone-like: #8A6967;
    --momo-tone-search: #667983;
  }

  /* Quiet canvas: remove notebook grid and ambient bubble gradients. */
  html, body {
    background: var(--momo-bg);
    background-image: none;
  }
  body {
    color: var(--momo-glass-ink);
  }
  #root > div::before {
    content: none;
    display: none;
  }

  /* The app header is a restrained sheet of glass, not another decoration panel. */
  #root .momo-app-header {
    border-bottom: 1px solid rgba(233,223,197,.72);
    background: rgba(255,250,236,.88);
    box-shadow: 0 7px 22px rgba(75,61,31,.065), inset 0 1px rgba(255,255,255,.92);
    backdrop-filter: blur(24px) saturate(112%);
    -webkit-backdrop-filter: blur(24px) saturate(112%);
  }
  #root .momo-app-header::after {
    content: none;
    display: none;
  }
  #root .momo-app-header::before {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.92), transparent);
    opacity: .7;
  }
  #root .momo-app-header nav a {
    min-height: 38px;
    padding: 0 13px;
    border: 1px solid rgba(233,223,197,.78);
    border-radius: 11px;
    background: rgba(255,250,236,.74);
    box-shadow: inset 0 1px rgba(255,255,255,.82);
    color: #514A36;
    font-size: 12px;
    font-weight: 750;
    transition: background 180ms ease, color 180ms ease, border-color 180ms ease, transform 180ms ease;
  }
  #root .momo-app-header nav a:hover {
    border-color: rgba(214,180,63,.48);
    background: rgba(255,212,59,.2);
    color: #51400F;
    transform: translateY(-1px);
    box-shadow: 0 5px 12px rgba(39,43,39,.06), inset 0 1px rgba(255,255,255,.95);
  }
  #root .momo-app-header nav a.active {
    border-color: rgba(214,180,63,.58);
    background: rgba(255,212,59,.3);
    color: #51400F;
    box-shadow: inset 0 1px rgba(255,255,255,.84);
  }
  #root .momo-app-header button {
    min-height: 38px;
    padding: 0 15px;
    border: 1px solid rgba(214,180,63,.5);
    border-radius: 11px;
    background: rgba(255,212,59,.26);
    box-shadow: inset 0 1px rgba(255,255,255,.92);
    color: #51400F;
    font-size: 12px;
    font-weight: 800;
  }
  #root .momo-app-header button:hover:not(:disabled) {
    border-color: rgba(179,141,25,.72);
    background: rgba(255,212,59,.44);
    box-shadow: 0 5px 12px rgba(39,43,39,.07), inset 0 1px rgba(255,255,255,.9);
  }

  /* Common translucent surfaces. Content stays opaque enough to remain readable. */
  #root .profile-card,
  #root .all-reviews-card,
  #root .my-reviews-card,
  #root .liked-reviews-card,
  #root .review-detail-card,
  #root .review-comment-card,
  #root .detail-content-section,
  #root .signup-card,
  #root .favorite-page-empty {
    border: 1px solid var(--momo-glass-edge);
    border-radius: 19px;
    background: rgba(249,248,243,.68);
    box-shadow: var(--momo-glass-shadow);
    backdrop-filter: blur(20px) saturate(108%);
    -webkit-backdrop-filter: blur(20px) saturate(108%);
  }
  #root .profile-card::before,
  #root .profile-card::after,
  #root .review-detail-card::before,
  #root .review-detail-card::after,
  #root .signup-card::before,
  #root .signup-card::after {
    content: none;
    display: none;
  }
  #root .profile-card,
  #root .all-reviews-card,
  #root .my-reviews-card,
  #root .liked-reviews-card,
  #root .review-detail-card,
  #root .review-comment-card,
  #root .detail-content-section {
    transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms var(--momo-glass-ease);
  }

  /* Route headers: the accent is a slim editorial rule, never a glowing orb. */
  #root .all-reviews-heading,
  #root .my-reviews-heading,
  #root .liked-reviews-heading,
  #root .search-page-heading,
  #root .favorite-page-heading {
    --page-accent: #718075;
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 154px;
    margin: 0 0 24px;
    padding: clamp(26px, 3.6vw, 38px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.78);
    border-radius: 21px;
    background: linear-gradient(132deg, rgba(250,249,245,.82), rgba(240,239,232,.62));
    box-shadow: 0 12px 30px rgba(39,43,39,.065), inset 0 1px rgba(255,255,255,.92);
    backdrop-filter: blur(26px) saturate(112%);
    -webkit-backdrop-filter: blur(26px) saturate(112%);
  }
  #root .all-reviews-heading { --page-accent: #88795F; }
  #root .my-reviews-heading { --page-accent: #6C806F; }
  #root .liked-reviews-heading { --page-accent: #896B69; }
  #root .search-page-heading { --page-accent: #667983; }
  #root .favorite-page-heading { --page-accent: #627B72; }
  #root .all-reviews-heading::before,
  #root .my-reviews-heading::before,
  #root .liked-reviews-heading::before,
  #root .search-page-heading::before,
  #root .favorite-page-heading::before {
    position: absolute;
    z-index: 0;
    top: 28px;
    bottom: 28px;
    left: 0;
    width: 3px;
    height: auto;
    content: "";
    border-radius: 0 3px 3px 0;
    background: var(--page-accent);
    box-shadow: none;
    transform: none;
    animation: none;
    pointer-events: none;
  }
  #root .all-reviews-heading::after,
  #root .my-reviews-heading::after,
  #root .liked-reviews-heading::after,
  #root .search-page-heading::after,
  #root .favorite-page-heading::after {
    content: none;
    display: none;
    animation: none;
  }
  #root .all-reviews-heading > div,
  #root .my-reviews-heading > div,
  #root .liked-reviews-heading > div,
  #root .search-page-heading > div,
  #root .favorite-page-heading > div {
    position: relative;
    z-index: 1;
    min-width: 0;
  }
  #root .all-reviews-heading h1,
  #root .my-reviews-heading h1,
  #root .liked-reviews-heading h1,
  #root .search-page-heading h1,
  #root .favorite-page-heading h1 {
    margin: 0 0 8px;
    color: #292D2B;
    font-size: clamp(27px, 3.2vw, 36px);
    font-weight: 850;
    line-height: 1.18;
    letter-spacing: -.048em;
    text-shadow: none;
  }
  #root .all-reviews-heading p,
  #root .my-reviews-heading p:not(.my-reviews-eyebrow),
  #root .liked-reviews-heading p,
  #root .search-page-heading p,
  #root .favorite-page-heading p {
    margin: 0;
    color: #565D57;
    font-size: 13px;
    font-weight: 550;
    line-height: 1.7;
  }
  #root .my-reviews-heading .my-reviews-eyebrow,
  #root .liked-reviews-heading .liked-reviews-eyebrow,
  #root .favorite-page-heading .favorite-page-eyebrow {
    display: inline-flex;
    align-items: center;
    margin: 0 0 11px;
    color: var(--page-accent);
    font-size: 10px;
    font-weight: 850;
    letter-spacing: .13em;
  }
  #root .favorite-page-heading .favorite-page-eyebrow::before {
    width: 5px;
    height: 13px;
    margin-right: 8px;
    content: "";
    border-radius: 1px;
    background: var(--page-accent);
    box-shadow: none;
  }
  #root .page-back-link,
  #root .favorite-back-button,
  #root .review-detail-back {
    position: relative;
    z-index: 2;
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0 15px;
    border: 1px solid rgba(255,255,255,.84);
    border-radius: 11px;
    background: rgba(249,248,243,.62);
    box-shadow: 0 4px 12px rgba(39,43,39,.055), inset 0 1px rgba(255,255,255,.94);
    color: #424A44;
    font-size: 12px;
    font-weight: 750;
    text-decoration: none;
    white-space: nowrap;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  #root .page-back-link:hover,
  #root .favorite-back-button:hover,
  #root .review-detail-back:hover {
    background: rgba(255,255,255,.84);
    box-shadow: 0 7px 16px rgba(39,43,39,.09), inset 0 1px rgba(255,255,255,.98);
    transform: translateY(-1px);
  }

  /* Each route has a restrained color atmosphere beyond its title panel. */
  #root .favorite-page {
    background: linear-gradient(180deg, rgba(99,122,114,.105), rgba(99,122,114,.035) 300px, transparent 620px);
  }
  #root .profile-page {
    background: linear-gradient(180deg, rgba(108,128,111,.075), transparent 460px);
  }
  #root .all-reviews-page {
    background: linear-gradient(180deg, rgba(136,121,95,.07), transparent 440px);
  }
  #root .my-reviews-page {
    background: linear-gradient(180deg, rgba(108,128,111,.075), transparent 440px);
  }
  #root .liked-reviews-page,
  #root .liked-reviews-container {
    background: linear-gradient(180deg, rgba(137,107,105,.075), transparent 440px);
  }
  #root .search-page {
    background: linear-gradient(180deg, rgba(102,121,131,.075), transparent 440px);
  }
  #root .all-reviews-heading {
    background: linear-gradient(112deg, rgba(238,234,224,.88), rgba(250,249,245,.74) 72%);
  }
  #root .my-reviews-heading {
    background: linear-gradient(112deg, rgba(232,238,231,.88), rgba(250,249,245,.74) 72%);
  }
  #root .liked-reviews-heading {
    background: linear-gradient(112deg, rgba(241,232,229,.9), rgba(250,249,245,.74) 72%);
  }
  #root .search-page-heading {
    background: linear-gradient(112deg, rgba(231,237,239,.9), rgba(250,249,245,.74) 72%);
  }
  #root .favorite-page-heading {
    background: linear-gradient(112deg, rgba(226,235,229,.9), rgba(250,249,245,.72) 78%);
  }

  /* Favorites page: poster collection carries the strongest visual identity. */
  #root .favorite-page {
    min-height: 100vh;
    padding: 22px 0 72px;
    background: linear-gradient(180deg, rgba(99,122,114,.105), rgba(99,122,114,.035) 300px, transparent 620px);
  }
  #root .favorite-page-container {
    width: min(1240px, calc(100% - 48px));
    max-width: 1240px;
    margin: 0 auto;
  }
  #root .favorite-page-heading {
    min-height: 156px;
    margin-bottom: 22px;
  }
  #root .favorite-page-heading h1 {
    font-size: clamp(29px, 3.4vw, 38px);
  }
  #root .favorite-page .favorite-list-toolbar {
    min-height: 42px;
    margin: 0 0 18px;
    padding: 0 2px 12px;
    border-bottom: 1px solid rgba(107,119,110,.18);
  }
  #root .favorite-page .favorite-list-toolbar > span {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 11px;
    border: 1px solid rgba(110,129,116,.22);
    border-radius: 8px;
    background: rgba(105,128,115,.1);
    box-shadow: none;
    color: #41594B;
    font-size: 11px;
    font-weight: 750;
  }
  #root .favorite-page .favorite-page-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 22px 18px;
  }
  #root .favorite-page .favorite-page-card {
    position: relative;
    min-width: 0;
    padding: 8px;
    border: 1px solid rgba(255,255,255,.78);
    border-radius: 15px;
    background: rgba(248,247,242,.58);
    box-shadow: 0 7px 18px rgba(39,43,39,.055), inset 0 1px rgba(255,255,255,.86);
    backdrop-filter: blur(18px) saturate(108%);
    -webkit-backdrop-filter: blur(18px) saturate(108%);
    transition: transform 220ms var(--momo-glass-ease), box-shadow 220ms ease, border-color 220ms ease;
  }
  #root .favorite-page .favorite-page-card:nth-child(3n + 2) {
    background: rgba(244,241,235,.62);
  }
  #root .favorite-page .favorite-page-card:nth-child(3n) {
    background: rgba(239,243,237,.62);
  }
  #root .favorite-page .favorite-page-card:hover {
    border-color: rgba(255,255,255,.96);
    box-shadow: 0 13px 24px rgba(39,43,39,.09), inset 0 1px rgba(255,255,255,.96);
    transform: translateY(-3px);
  }
  #root .favorite-page .favorite-page-poster {
    padding: 4px;
    border: 1px solid rgba(255,255,255,.72);
    border-radius: 10px;
    background: rgba(255,255,255,.46);
    box-shadow: 0 4px 10px rgba(35,39,35,.1);
    backdrop-filter: blur(12px);
  }
  #root .favorite-page .favorite-page-poster > .favorite-page-open-button,
  #root .favorite-page .favorite-page-poster img {
    border-radius: 7px;
  }
  #root .favorite-page .favorite-page-movie-info {
    padding: 11px 3px 3px;
  }
  #root .favorite-page .favorite-page-movie-info h3 {
    color: #303633;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -.02em;
  }
  #root .favorite-page .favorite-page-movie-info p {
    color: #626A63;
    font-size: 11px;
    font-weight: 600;
  }
  #root .favorite-page .favorite-page-empty {
    padding: 52px 22px;
    background: rgba(248,247,242,.72);
    text-align: center;
  }
  #root .favorite-page .favorite-empty-symbol {
    color: #647B70;
    filter: none;
  }
  #root .favorite-page .favorite-page-empty h2 {
    color: #303633;
    font-weight: 800;
  }
  #root .favorite-page .favorite-page-empty p {
    color: #626A63;
  }
  #root .favorite-page .favorite-browse-button {
    min-height: 42px;
    padding: 0 18px;
    border: 1px solid rgba(95,119,104,.32);
    border-radius: 11px;
    background: rgba(101,126,111,.14);
    box-shadow: none;
    color: #41594B;
    font-weight: 800;
  }

  /* Profile activity is a set of glass archive entries, not paper stickers. */
  #root .profile-page .profile-card:has(.profile-activity-grid) {
    display: block;
    width: 100%;
    padding: clamp(22px, 3vw, 32px);
    border: 1px solid rgba(255,255,255,.8);
    border-radius: 20px;
    background: rgba(248,247,242,.68);
    box-shadow: var(--momo-glass-shadow);
    backdrop-filter: blur(22px) saturate(110%);
    -webkit-backdrop-filter: blur(22px) saturate(110%);
  }
  #root .profile-page .profile-card:has(.profile-activity-grid)::before,
  #root .profile-page .profile-card:has(.profile-activity-grid)::after {
    content: none;
    display: none;
  }
  #root .profile-page .profile-card:has(.profile-activity-grid) > .profile-card-heading {
    margin-bottom: 22px;
  }
  #root .profile-page .profile-card:has(.profile-activity-grid) > .profile-card-heading h2 {
    color: #303633;
    font-size: 21px;
    font-weight: 850;
    letter-spacing: -.04em;
  }
  #root .profile-page .profile-card:has(.profile-activity-grid) > .profile-card-heading p {
    color: #626A63;
  }
  #root .profile-page .profile-activity-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  #root .profile-page .profile-activity-item {
    --activity-ink: #756346;
    display: flex;
    position: relative;
    isolation: isolate;
    min-width: 0;
    min-height: 184px;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 19px 19px 15px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.8);
    border-left: 3px solid var(--activity-ink);
    border-radius: 15px;
    background: rgba(245,243,235,.66);
    box-shadow: 0 6px 16px rgba(39,43,39,.045), inset 0 1px rgba(255,255,255,.88);
    color: #303633;
    text-align: left;
    text-decoration: none;
    backdrop-filter: blur(22px) saturate(108%);
    -webkit-backdrop-filter: blur(22px) saturate(108%);
    transition: transform 210ms var(--momo-glass-ease), box-shadow 210ms ease, border-color 210ms ease;
  }
  #root .profile-page .profile-activity-item[data-tone="writing"] {
    --activity-ink: #887653;
    background: rgba(243,239,229,.74);
  }
  #root .profile-page .profile-activity-item[data-tone="liked"] {
    --activity-ink: #896B69;
    background: rgba(243,236,233,.74);
  }
  #root .profile-page .profile-activity-item[data-tone="saved"] {
    --activity-ink: #5F796B;
    background: rgba(235,241,235,.76);
  }
  #root .profile-page .profile-activity-item::before,
  #root .profile-page .profile-activity-item::after {
    content: none;
    display: none;
  }
  #root .profile-page .profile-activity-item:hover {
    border-color: rgba(255,255,255,.98);
    border-left-color: var(--activity-ink);
    box-shadow: 0 11px 22px rgba(39,43,39,.08), inset 0 1px rgba(255,255,255,.96);
    transform: translateY(-3px);
  }
  #root .profile-page .profile-activity-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 38px;
    margin-bottom: 13px;
  }
  #root .profile-page .profile-activity-kicker {
    color: var(--activity-ink);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .035em;
  }
  #root .profile-page .profile-activity-icon {
    display: grid;
    place-items: center;
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255,255,255,.78);
    border-radius: 10px;
    background: rgba(255,255,255,.44);
    box-shadow: inset 0 1px rgba(255,255,255,.9);
    color: var(--activity-ink);
  }
  #root .profile-page .profile-activity-icon svg {
    display: block;
    width: 19px;
    height: 19px;
  }
  #root .profile-page .profile-activity-item h3 {
    margin: 0 0 9px;
    color: #303633;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: -.025em;
  }
  #root .profile-page .profile-activity-count-row {
    display: inline-flex;
    align-items: baseline;
    align-self: flex-start;
    gap: 6px;
    min-height: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }
  #root .profile-page .profile-activity-count {
    color: #303633;
    font-size: clamp(34px, 3.2vw, 41px);
    font-weight: 850;
    line-height: 1;
    letter-spacing: -.06em;
    font-variant-numeric: tabular-nums;
  }
  #root .profile-page .profile-activity-unit {
    color: #616962;
    font-size: 11px;
    font-weight: 700;
  }
  #root .profile-page .profile-activity-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
    padding-top: 13px;
    border-top: 1px solid rgba(79,91,81,.14);
  }
  #root .profile-page .profile-activity-footer p {
    display: block;
    margin: 0;
    color: #5B635D;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.5;
  }
  #root .profile-page .profile-activity-arrow {
    color: var(--activity-ink);
    font-size: 17px;
    font-weight: 700;
    transition: transform 180ms ease;
  }
  #root .profile-page .profile-activity-item:hover .profile-activity-arrow {
    transform: translate(2px,-2px);
  }

  /* Movie detail: glass is visible in the material, not in decorative circles. */
  #root .movie-detail-page {
    max-width: 1240px;
    padding-bottom: 72px;
  }
  #root .movie-detail-page .movie-detail-header {
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(220px, .55fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(26px, 3.5vw, 46px);
    min-height: 410px;
    padding: clamp(24px, 3.6vw, 42px);
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 24px;
    background: linear-gradient(132deg, rgba(251,250,246,.78), rgba(237,238,231,.58));
    box-shadow: 0 18px 42px rgba(39,43,39,.095), inset 0 1px rgba(255,255,255,.92);
    backdrop-filter: blur(28px) saturate(114%);
    -webkit-backdrop-filter: blur(28px) saturate(114%);
  }
  #root .movie-detail-page .movie-detail-header::before {
    content: none;
    display: none;
  }
  #root .movie-detail-page .movie-detail-header::after {
    position: absolute;
    z-index: 0;
    inset: 0;
    content: "";
    border-radius: inherit;
    background: linear-gradient(118deg, rgba(255,255,255,.22), transparent 38%);
    pointer-events: none;
  }
  #root .movie-detail-page .movie-detail-poster {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 320px;
    padding: 7px;
    border: 1px solid rgba(255,255,255,.86);
    border-radius: 16px;
    background: rgba(250,249,245,.48);
    box-shadow: 0 16px 30px rgba(30,34,30,.18), inset 0 1px rgba(255,255,255,.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transform: none;
  }
  #root .movie-detail-page .movie-detail-poster:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 34px rgba(30,34,30,.2), inset 0 1px rgba(255,255,255,.96);
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
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 9px;
  }
  #root .movie-detail-page .movie-detail-info .detail-rank {
    display: inline-flex;
    align-items: center;
    min-height: 29px;
    margin: 0 0 3px;
    padding: 0 10px;
    border: 1px solid rgba(98,122,109,.26);
    border-radius: 7px;
    background: rgba(101,126,111,.1);
    box-shadow: none;
    color: #4C6657;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .045em;
    backdrop-filter: blur(12px);
  }
  #root .movie-detail-page .movie-detail-info .detail-rank::before {
    content: none;
    display: none;
  }
  #root .movie-detail-page .movie-detail-info h1 {
    flex: 0 0 100%;
    width: 100%;
    margin: 0 0 6px;
    color: #292D2B;
    font-size: clamp(29px, 3.8vw, 42px);
    font-weight: 850;
    line-height: 1.14;
    letter-spacing: -.05em;
    overflow-wrap: anywhere;
    text-shadow: none;
  }
  #root .movie-detail-page .movie-detail-info > p {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    min-height: 32px;
    margin: 0;
    padding: 6px 10px;
    border: 1px solid rgba(255,255,255,.7);
    border-radius: 9px;
    background: rgba(250,249,245,.48);
    box-shadow: inset 0 1px rgba(255,255,255,.84);
    color: #525B54;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.5;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  #root .movie-detail-page .movie-detail-header-no-poster {
    grid-template-columns: minmax(0, 1fr);
    min-height: 320px;
  }
  #root .movie-detail-page .movie-detail-header-no-poster .movie-detail-info {
    max-width: 900px;
  }
  #root .movie-detail-page > .detail-content-section {
    margin-top: 22px;
    border: 1px solid rgba(255,255,255,.78);
    border-radius: 19px;
    background: rgba(248,247,242,.67);
    box-shadow: var(--momo-glass-shadow);
    backdrop-filter: blur(20px) saturate(108%);
    -webkit-backdrop-filter: blur(20px) saturate(108%);
  }
  #root .movie-detail-page > .detail-content-section > h2 {
    color: #303633;
    font-weight: 850;
    letter-spacing: -.035em;
  }
  #root .movie-detail-page > .detail-content-section > p {
    color: #535B55;
    line-height: 1.8;
  }

  /* Audience feedback uses calm positive / critical hues, not saturated status colors. */
  #root .movie-detail-page .movie-rating-panel {
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 18px;
    background: rgba(248,247,242,.72);
    box-shadow: var(--momo-glass-shadow);
    backdrop-filter: blur(22px) saturate(110%);
    -webkit-backdrop-filter: blur(22px) saturate(110%);
  }
  #root .movie-detail-page .movie-rating-panel::before {
    content: none;
    display: none;
  }
  #root .movie-detail-page .rating-panel-eyebrow,
  #root .movie-detail-page .rating-panel-stamp {
    color: #66746A;
  }
  #root .movie-detail-page .rating-label,
  #root .movie-detail-page .movie-score-value strong {
    color: #303633;
  }
  #root .movie-detail-page .rating-panel-description,
  #root .movie-detail-page .rating-score-caption,
  #root .movie-detail-page .rating-vote-summary,
  #root .movie-detail-page .rating-distribution-heading,
  #root .movie-detail-page .rating-distribution-legend {
    color: #58615A;
  }
  #root .movie-detail-page .movie-score-display,
  #root .movie-detail-page .rating-distribution {
    border: 1px solid rgba(255,255,255,.8);
    border-radius: 12px;
    background: rgba(255,255,255,.42);
    box-shadow: inset 0 1px rgba(255,255,255,.9);
  }
  #root .movie-detail-page .rating-distribution-track {
    border-color: rgba(90,105,94,.16);
    background: rgba(111,126,115,.13);
    box-shadow: none;
  }
  #root .movie-detail-page .rating-distribution-track span {
    background: #718578;
    box-shadow: none;
  }
  #root .movie-detail-page .rating-vote-button {
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 10px;
    background: rgba(255,255,255,.52);
    box-shadow: 0 4px 10px rgba(39,43,39,.045), inset 0 1px rgba(255,255,255,.9);
    color: #48534B;
  }
  #root .movie-detail-page .rating-vote-button.is-like,
  #root .movie-detail-page .rating-vote-button.selected-like {
    border-color: rgba(96,125,103,.3);
    background: rgba(117,145,122,.14);
    color: #405D47;
  }
  #root .movie-detail-page .rating-vote-button.is-dislike,
  #root .movie-detail-page .rating-vote-button.selected-dislike {
    border-color: rgba(148,108,103,.28);
    background: rgba(160,121,114,.12);
    color: #76524F;
  }
  #root .movie-detail-page .rating-vote-button strong {
    color: inherit;
  }
  #root .movie-detail-page .rating-vote-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 7px 14px rgba(39,43,39,.07), inset 0 1px rgba(255,255,255,.94);
  }
  #root .movie-detail-page .rating-unavailable {
    border-color: rgba(98,122,109,.24);
    border-radius: 10px;
    background: rgba(101,126,111,.08);
    color: #55635A;
  }

  /* Film-ticket control: the perforated ticket is the actual action symbol. */
  #root .favorite-star {
    position: absolute;
    top: 11px;
    right: 11px;
    z-index: 5;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid rgba(255,255,255,.58);
    border-radius: 12px;
    background: rgba(29,36,32,.52);
    box-shadow: 0 7px 17px rgba(18,24,20,.2), inset 0 1px rgba(255,255,255,.28);
    color: rgba(255,255,255,.96);
    backdrop-filter: blur(18px) saturate(115%);
    -webkit-backdrop-filter: blur(18px) saturate(115%);
    transition: transform 180ms ease, background 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }
  #root .favorite-star .favorite-film-ticket-icon {
    display: block;
    width: 24px;
    height: 24px;
  }
  #root .favorite-star .favorite-film-ticket-icon path,
  #root .favorite-star .favorite-film-ticket-icon rect,
  #root .favorite-star .favorite-film-ticket-icon line {
    vector-effect: non-scaling-stroke;
  }
  #root .favorite-star:hover:not(:disabled) {
    border-color: rgba(255,255,255,.88);
    background: rgba(29,36,32,.72);
    box-shadow: 0 10px 20px rgba(18,24,20,.24), inset 0 1px rgba(255,255,255,.42);
    transform: translateY(-2px);
  }
  #root .favorite-star.is-active {
    border-color: rgba(255,255,255,.76);
    background: rgba(94,119,103,.94);
    color: #FFFFFF;
    box-shadow: 0 7px 18px rgba(36,58,44,.24), inset 0 1px rgba(255,255,255,.26);
  }
  #root .favorite-star:focus-visible {
    outline: 3px solid rgba(92,119,102,.5);
    outline-offset: 3px;
  }

  /* Recommendation and ranking labels use one compact archive language. */
  #root .recommend-content .recommend-label {
    display: inline-flex;
    align-items: center;
    min-height: 25px;
    margin: 0 0 10px;
    padding: 3px 9px;
    border: 1px solid rgba(255,255,255,.5);
    border-radius: 5px;
    background: rgba(34,40,36,.44);
    box-shadow: none;
    color: rgba(255,255,255,.96);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .03em;
    transform: none;
    backdrop-filter: blur(12px);
  }
  #root .recommend-content .recommend-label::before {
    content: "FILM";
    margin-right: 7px;
    color: rgba(255,255,255,.78);
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .12em;
  }
  #root .recommend-content::before,
  #root .recommend-content .recommend-label::after {
    content: none;
    display: none;
  }
  #root .recommend-content .recommend-info,
  #root .recommend-content .recommend-description {
    color: rgba(255,255,255,.94);
    text-shadow: 0 1px 2px rgba(0,0,0,.38);
  }
  #root .recommend-content .recommend-button {
    min-height: 40px;
    padding: 0 15px;
    border: 1px solid rgba(255,255,255,.72);
    border-radius: 10px;
    background: rgba(239,238,229,.92);
    box-shadow: 0 5px 13px rgba(0,0,0,.16), inset 0 1px rgba(255,255,255,.9);
    color: #354139;
    font-size: 12px;
    font-weight: 800;
  }
  #root .recommend-content .recommend-button:hover {
    background: #FFFFFF;
    transform: translateY(-1px);
  }
  #root .home-page .movie-info h3 { color: #303633; }
  #root .home-page .movie-info p { color: #626A63; }
  #root .home-page .poster-rank,
  #root .home-page .rank {
    border: 1px solid rgba(255,255,255,.76);
    border-radius: 7px;
    background: rgba(38,48,42,.72);
    box-shadow: none;
    color: #FFFFFF;
  }

  /* Shared buttons: consistent shape, low-contrast surface, dark readable text. */
  #root .profile-button,
  #root .page-back-link,
  #root .favorite-back-button,
  #root .detail-back-button,
  #root .review-detail-back,
  #root .people-more-button,
  #root .person-bio-toggle,
  #root .home-favorites-more {
    min-height: 40px;
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 10px;
    background: rgba(249,248,243,.68);
    box-shadow: 0 4px 11px rgba(39,43,39,.045), inset 0 1px rgba(255,255,255,.9);
    color: #465149;
    font-size: 12px;
    font-weight: 750;
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
  }
  #root .profile-button:hover,
  #root .page-back-link:hover,
  #root .favorite-back-button:hover,
  #root .detail-back-button:hover,
  #root .review-detail-back:hover,
  #root .people-more-button:hover,
  #root .person-bio-toggle:hover,
  #root .home-favorites-more:hover {
    border-color: rgba(99,124,108,.35);
    background: rgba(255,255,255,.86);
    box-shadow: 0 7px 15px rgba(39,43,39,.075), inset 0 1px rgba(255,255,255,.96);
    transform: translateY(-1px);
  }

  /* Search, archive lists and forms inherit the same calm material. */
  #root .all-reviews-search-label {
    color: #526258;
  }
  #root .all-reviews-search-select,
  #root .all-reviews-search-input,
  #root .momo-search-form,
  #root .search-page input,
  #root .search-page select,
  #root main > input[type="search"],
  #root .review-title-field input,
  #root .review-content-field textarea,
  #root .review-edit-title,
  #root .review-edit-area textarea,
  #root .review-comment-form textarea,
  #root .signup-field input,
  #root .profile-form input,
  #root .profile-form textarea,
  #root .profile-delete-page-card input {
    border: 1px solid rgba(103,120,108,.25);
    border-radius: 10px;
    background: rgba(250,249,245,.76);
    box-shadow: inset 0 1px rgba(255,255,255,.9);
    color: #303833;
  }
  #root input::placeholder,
  #root textarea::placeholder {
    color: #737B73;
  }
  #root input:focus,
  #root textarea:focus,
  #root select:focus {
    border-color: rgba(93,122,104,.56);
    outline: none;
    background: rgba(255,255,255,.9);
    box-shadow: 0 0 0 3px rgba(93,122,104,.13), 0 5px 14px rgba(39,43,39,.045);
  }
  #root .momo-search-form:focus-within {
    border-color: rgba(93,122,104,.48);
    box-shadow: 0 0 0 3px rgba(93,122,104,.12), 0 10px 22px rgba(39,43,39,.065);
    transform: translateY(-1px);
  }
  #root .momo-search-dropdown {
    border: 1px solid rgba(255,255,255,.86);
    border-radius: 15px;
    background: rgba(249,248,243,.92);
    box-shadow: 0 16px 36px rgba(39,43,39,.12), inset 0 1px rgba(255,255,255,.94);
    backdrop-filter: blur(22px) saturate(108%);
    -webkit-backdrop-filter: blur(22px) saturate(108%);
  }
  #root .momo-search-result:hover {
    background: rgba(101,126,111,.09);
  }
  #root .all-reviews-search-panel,
  #root .all-reviews-search-form,
  #root .all-reviews-search-toolbar {
    border-color: rgba(255,255,255,.78);
    border-radius: 14px;
    background: rgba(247,246,240,.68);
    box-shadow: inset 0 1px rgba(255,255,255,.88);
    backdrop-filter: blur(18px) saturate(108%);
    -webkit-backdrop-filter: blur(18px) saturate(108%);
  }
  #root .all-reviews-table-wrap {
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 13px;
    background: rgba(248,247,242,.62);
    box-shadow: 0 8px 18px rgba(39,43,39,.045);
  }
  #root .all-reviews-table thead th {
    border-bottom: 1px solid rgba(96,117,103,.2);
    background: rgba(104,128,112,.12);
    color: #4D6254;
  }
  #root .all-reviews-table tbody tr,
  #root .all-reviews-table tbody tr:nth-child(even) {
    background: rgba(250,249,245,.64);
  }
  #root .all-reviews-table tbody tr:hover {
    background: rgba(105,128,114,.09);
  }
  #root .my-review-item,
  #root .liked-review-item,
  #root .all-reviews-mobile-item {
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 13px;
    background: rgba(248,247,242,.68);
    box-shadow: 0 6px 15px rgba(39,43,39,.045), inset 0 1px rgba(255,255,255,.9);
  }
  #root .my-review-item:hover,
  #root .liked-review-item:hover,
  #root .all-reviews-mobile-item:hover {
    background: rgba(255,255,255,.82);
    box-shadow: 0 10px 20px rgba(39,43,39,.075);
    transform: translateY(-2px);
  }
  #root .liked-review-unlike {
    border: 1px solid rgba(137,107,105,.25);
    border-radius: 9px;
    background: rgba(137,107,105,.1);
    color: #765855;
  }
  #root .liked-review-unlike:hover:not(:disabled) {
    background: rgba(137,107,105,.16);
    box-shadow: 0 5px 12px rgba(39,43,39,.05);
  }
  #root .profile-user {
    border: 1px solid rgba(255,255,255,.8);
    border-radius: 14px;
    background: rgba(250,249,245,.62);
    box-shadow: inset 0 1px rgba(255,255,255,.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  #root .person-chip {
    border-color: rgba(255,255,255,.82);
    background: rgba(249,248,243,.66);
    box-shadow: 0 3px 9px rgba(39,43,39,.045), inset 0 1px rgba(255,255,255,.9);
    color: #4C5750;
  }
  #root .person-chip:hover {
    background: rgba(255,255,255,.86);
    box-shadow: 0 6px 13px rgba(39,43,39,.07);
  }
  #root .signup-card {
    border: 1px solid rgba(255,255,255,.82);
    border-radius: 20px;
    background: rgba(248,247,242,.78);
    box-shadow: 0 16px 38px rgba(39,43,39,.085), inset 0 1px rgba(255,255,255,.94);
    backdrop-filter: blur(22px) saturate(108%);
    -webkit-backdrop-filter: blur(22px) saturate(108%);
  }
  #root .signup-card-heading h1 {
    color: #303833;
  }
  #root .signup-submit,
  #root .all-reviews-search-submit {
    min-height: 44px;
    border: 1px solid rgba(94,119,103,.32);
    border-radius: 10px;
    background: rgba(101,126,111,.15);
    box-shadow: 0 5px 12px rgba(39,43,39,.055), inset 0 1px rgba(255,255,255,.88);
    color: #40574A;
    font-weight: 800;
  }
  #root .signup-submit:hover:not(:disabled),
  #root .all-reviews-search-submit:hover:not(:disabled) {
    background: rgba(101,126,111,.22);
    box-shadow: 0 8px 16px rgba(39,43,39,.075), inset 0 1px rgba(255,255,255,.94);
    transform: translateY(-1px);
  }
  #root .signup-note-label {
    border-color: rgba(101,126,111,.22);
    background: rgba(101,126,111,.1);
    color: #4D6254;
  }
  #root .review-write-toggle:hover {
    background: rgba(101,126,111,.1);
  }
  #root .review-title-field input:focus,
  #root .review-content-field textarea:focus,
  #root .review-edit-title:focus,
  #root .review-edit-area textarea:focus,
  #root .review-comment-form textarea:focus,
  #root .signup-field input:focus,
  #root .profile-form input:focus,
  #root .profile-form textarea:focus {
    border-color: rgba(93,122,104,.56);
    box-shadow: 0 0 0 3px rgba(93,122,104,.13);
  }

  /* Small text is never faded into the glass. */
  #root .profile-heading p,
  #root .profile-card-heading p,
  #root .movie-detail-info > p:not(.eyebrow),
  #root .detail-section-count,
  #root .all-reviews-description,
  #root .my-reviews-heading p,
  #root .liked-reviews-heading p,
  #root .favorite-page-heading p,
  #root .favorite-page-empty p,
  #root .search-page-heading p,
  #root .favorite-page-movie-info p {
    color: #59615A;
  }

  /* Mobile rhythm. Keep every activity description visible. */
  @media (max-width: 1050px) {
    #root .favorite-page .favorite-page-grid {
      grid-template-columns: repeat(4, minmax(0,1fr));
    }
  }
  @media (max-width: 860px) {
    #root .profile-page .profile-activity-grid {
      grid-template-columns: repeat(2, minmax(0,1fr));
    }
  }
  @media (max-width: 760px) {
    #root .all-reviews-heading,
    #root .my-reviews-heading,
    #root .liked-reviews-heading,
    #root .search-page-heading,
    #root .favorite-page-heading {
      align-items: flex-start;
      flex-direction: column;
      min-height: 0;
      gap: 17px;
      padding: 24px 21px;
      border-radius: 17px;
    }
    #root .all-reviews-heading::before,
    #root .my-reviews-heading::before,
    #root .liked-reviews-heading::before,
    #root .search-page-heading::before,
    #root .favorite-page-heading::before {
      top: 22px;
      bottom: 22px;
    }
    #root .favorite-page-container { width: calc(100% - 36px); }
    #root .favorite-page .favorite-page-grid {
      grid-template-columns: repeat(3, minmax(0,1fr));
      gap: 17px 12px;
    }
    #root .movie-detail-page .movie-detail-header {
      grid-template-columns: minmax(0,1fr);
      min-height: 0;
      gap: 23px;
      padding: 24px 20px;
      border-radius: 19px;
    }
    #root .movie-detail-page .movie-detail-poster {
      width: min(58%, 240px);
      margin: 0 auto;
    }
    #root .movie-detail-page .movie-detail-info { gap: 8px; }
    #root .movie-detail-page .rating-panel-main { grid-template-columns: 1fr; }
    #root .profile-page .profile-card:has(.profile-activity-grid) { padding: 22px 17px; }
  }
  @media (max-width: 600px) {
    #root .favorite-page-container { width: calc(100% - 28px); }
    #root .favorite-page .favorite-page-grid {
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 16px 10px;
    }
    #root .favorite-page .favorite-page-card { padding: 6px; border-radius: 12px; }
    #root .favorite-page .favorite-page-poster { padding: 3px; }
    #root .favorite-page .favorite-page-movie-info { padding: 9px 2px 3px; }
    #root .favorite-page .favorite-page-movie-info h3 { font-size: 12px; }
    #root .favorite-page .favorite-page-movie-info p { font-size: 10px; }
    #root .profile-page .profile-activity-grid {
      grid-template-columns: 1fr;
      gap: 11px;
    }
    #root .profile-page .profile-activity-item {
      min-height: 168px;
      padding: 17px 16px 14px;
    }
    #root .movie-detail-page .movie-detail-header { padding: 21px 16px; }
    #root .movie-detail-page .movie-detail-info h1 { font-size: 29px; }
    #root .movie-detail-page .movie-detail-info > p { font-size: 11px; }
    #root .movie-detail-page .rating-panel-heading { flex-direction: column; align-items: flex-start; }
    #root .movie-detail-page .detail-reaction-counts { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 380px) {
    #root .movie-detail-page .detail-reaction-counts { grid-template-columns: 1fr; }
  }

    /* Profile edit: shaped memo paper with MOMO's original cream and highlighter yellow. */
  #root .profile-edit-page {
    max-width: 1080px;
    padding: clamp(24px, 3.6vw, 42px) 0 76px;
    border-radius: 18px;
    background:
      linear-gradient(135deg, rgba(255,212,59,.16), transparent 44%),
      #F5F2EB;
  }
  #root .profile-edit-page .profile-container {
    gap: 21px;
  }

  /* The heading is a memo sheet with a folded corner, not a generic rounded card. */
  #root .profile-edit-page .profile-edit-heading {
    position: relative;
    isolation: isolate;
    display: flex;
    min-height: 164px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
    margin: 0 12px 2px 0;
    padding: 31px 44px 29px 58px;
    overflow: visible;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }
  #root .profile-edit-page .profile-edit-heading::before {
    position: absolute;
    z-index: 0;
    inset: 9px 0 0;
    content: "";
    background-color: #FFFAEC;
    background-image:
      linear-gradient(90deg, transparent 0 31px, rgba(196, 99, 82, .2) 31px 32px, transparent 32px),
      repeating-linear-gradient(0deg, transparent 0 30px, rgba(127, 151, 177, .105) 30px 31px, transparent 31px 32px);
    clip-path: polygon(0 0, calc(100% - 43px) 0, 100% 43px, 100% 100%, 0 100%);
    filter: drop-shadow(0 10px 14px rgba(75, 61, 31, .13));
    pointer-events: none;
  }
  #root .profile-edit-page .profile-edit-heading::after {
    position: absolute;
    z-index: 0;
    top: 9px;
    right: 0;
    width: 43px;
    height: 43px;
    content: "";
    border-left: 1px solid rgba(147, 111, 27, .28);
    border-bottom: 1px solid rgba(147, 111, 27, .28);
    background: linear-gradient(135deg, #FFE98F 0%, #FFD43B 70%, #E8B91D 100%);
    clip-path: polygon(0 0, 100% 100%, 100% 0);
    pointer-events: none;
  }
  #root .profile-edit-page .profile-edit-eyebrow {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    min-height: 23px;
    margin: 0 0 4px;
    padding: 0 9px;
    border: 1px solid #E2BE39;
    border-radius: 2px;
    background: #FFD43B;
    color: #292820;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: .13em;
  }
  #root .profile-edit-page .profile-edit-heading h1 {
    position: relative;
    z-index: 1;
    display: inline-block;
    width: fit-content;
    margin: 0;
    padding: 0 .08em .09em 0;
    background: linear-gradient(transparent 61%, rgba(255,212,59,.9) 61% 92%, transparent 92%);
    color: #292820;
    font-size: clamp(29px, 3.2vw, 37px);
    font-weight: 900;
    line-height: 1.18;
    letter-spacing: -.05em;
  }
  #root .profile-edit-page .profile-edit-heading p {
    position: relative;
    z-index: 1;
    margin: 3px 0 0;
    color: #625A45;
    font-size: 13px;
    font-weight: 650;
    line-height: 1.55;
  }

  #root .profile-edit-page .profile-edit-card {
    position: relative;
    padding: clamp(22px, 3.2vw, 36px);
    overflow: hidden;
    border: 1px solid #E9DFC5;
    border-left: 5px solid #FFD43B;
    border-radius: 4px 18px 4px 18px;
    background: rgba(255,250,236,.96);
    box-shadow: 0 14px 30px rgba(75, 61, 31, .075), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(18px) saturate(108%);
    -webkit-backdrop-filter: blur(18px) saturate(108%);
  }
  #root .profile-edit-page .profile-edit-card::before {
    content: none;
    display: none;
  }
  #root .profile-edit-page .profile-edit-form {
    display: grid;
    gap: 10px;
  }
  #root .profile-edit-page .profile-edit-image-kicker {
    margin: 0 0 2px;
    color: #76601F;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .16em;
  }
  #root .profile-edit-page .profile-image-edit {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 11px;
    width: 100%;
    margin: 0 0 14px;
    padding: 22px 18px 20px;
    border: 1px solid #E3CE83;
    border-radius: 5px 15px 5px 15px;
    background:
      linear-gradient(90deg, #FFD43B 0 8px, transparent 8px),
      linear-gradient(115deg, #FFF0AD 0%, #FFFAEC 68%, #F5F2EB 100%);
    box-shadow: inset 0 1px rgba(255,255,255,.96), 0 5px 14px rgba(75, 61, 31, .055);
  }
  #root .profile-edit-page .profile-image-preview {
    width: 116px;
    height: 116px;
    margin: 0;
    border: 5px solid #FFD43B;
    border-radius: 50%;
    background: #FFFAEC;
    box-shadow: 0 7px 17px rgba(75, 61, 31, .16), 0 0 0 4px rgba(255,212,59,.2);
  }
  #root .profile-edit-page .profile-image-preview img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }
  #root .profile-edit-page .profile-image-input-wrapper {
    margin: 2px 0 0;
  }
  #root .profile-edit-page #profile-image-input {
    width: min(100%, 410px);
    min-height: 44px;
    padding: 5px;
    border: 1px solid #E9DFC5;
    border-radius: 8px;
    background: rgba(255,250,236,.92);
    color: #514A36;
    font-size: 12px;
  }
  #root .profile-edit-page #profile-image-input::file-selector-button {
    min-height: 32px;
    margin-right: 10px;
    padding: 0 12px;
    border: 1px solid #D6B43F;
    border-radius: 4px;
    background: #FFD43B;
    color: #292820;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
  }
  #root .profile-edit-page .profile-image-buttons {
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 1px;
  }
  #root .profile-edit-page .profile-image-buttons .profile-button {
    min-height: 38px;
    padding: 0 15px;
    border-radius: 7px;
    font-size: 11px;
    font-weight: 800;
  }
  #root .profile-edit-page .profile-edit-image-save {
    border: 1px solid #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 4px 10px rgba(126, 98, 15, .14);
  }
  #root .profile-edit-page .profile-edit-image-save:hover:not(:disabled) {
    border-color: #B38D19;
    background: #F3C72E;
    color: #292820;
  }
  #root .profile-edit-page .profile-edit-image-remove {
    border: 1px solid #E1CFC0;
    background: #F6EDE4;
    color: #795B4D;
  }
  #root .profile-edit-page .profile-edit-image-remove:hover:not(:disabled) {
    border-color: #D1B4A0;
    background: #EFE0D3;
    color: #62483D;
  }

  #root .profile-edit-page .profile-edit-form > label {
    margin-top: 7px;
    color: #514A36;
    font-size: 12px;
    font-weight: 850;
    letter-spacing: -.01em;
  }
  #root .profile-edit-page .profile-edit-form > input {
    min-height: 47px;
    padding: 11px 14px;
    border: 1px solid #E9DFC5;
    border-radius: 7px;
    background: #FFFEFA;
    box-shadow: inset 0 1px 2px rgba(75, 61, 31, .035);
    color: #292820;
    font-size: 14px;
    transition: border-color 170ms ease, box-shadow 170ms ease, background 170ms ease;
  }
  #root .profile-edit-page .profile-edit-form > input:read-only {
    border-color: #E9DFC5;
    background: #F5F2EB;
    color: #6D6654;
  }
  #root .profile-edit-page .profile-edit-form > input:focus {
    border-color: #C6A12B;
    outline: none;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(255,212,59,.24);
  }
  #root .profile-edit-page .profile-edit-form > .signup-message {
    min-height: 15px;
    margin: -4px 0 1px;
    padding-left: 2px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.45;
  }
  #root .profile-edit-page .profile-edit-divider {
    height: 2px;
    margin: 26px 0 13px;
    border: 0;
    background: linear-gradient(90deg, #FFD43B 0%, #E9DFC5 56%, rgba(233,223,197,0) 100%);
  }
  #root .profile-edit-page .profile-edit-section-title {
    position: relative;
    margin: 0 0 4px;
    padding: 13px 16px;
    border-left: 4px solid #FFD43B;
    border-radius: 0 8px 8px 0;
    background: #F5F2EB;
    color: #292820;
    font-size: 16px;
    font-weight: 900;
    letter-spacing: -.025em;
  }
  #root .profile-edit-page .profile-edit-section-description {
    margin: 0 0 10px;
    color: #6A6251;
    font-size: 12px;
    line-height: 1.6;
  }
  #root .profile-edit-page .profile-form-buttons {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid #E9DFC5;
  }
  #root .profile-edit-page .profile-edit-submit,
  #root .profile-edit-page .profile-edit-cancel {
    min-width: 112px;
    min-height: 46px;
    padding: 0 22px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 850;
    transition: transform 170ms ease, box-shadow 170ms ease, background 170ms ease;
  }
  #root .profile-edit-page .profile-edit-submit {
    border: 1px solid #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 6px 15px rgba(126, 98, 15, .16);
  }
  #root .profile-edit-page .profile-edit-submit:hover:not(:disabled) {
    border-color: #B38D19;
    background: #F3C72E;
    color: #292820;
    box-shadow: 0 9px 18px rgba(126, 98, 15, .2);
    transform: translateY(-1px);
  }
  #root .profile-edit-page .profile-edit-submit:disabled {
    border-color: #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: none;
    opacity: .56;
  }
  #root .profile-edit-page .profile-edit-cancel {
    border: 1px solid #E9DFC5;
    background: #F5F2EB;
    color: #514A36;
    box-shadow: none;
  }
  #root .profile-edit-page .profile-edit-cancel:hover:not(:disabled) {
    border-color: #D8C99F;
    background: #EEE8DA;
    color: #292820;
    transform: translateY(-1px);
  }

  @media (max-width: 600px) {
    #root .profile-edit-page {
      padding: 18px 0 48px;
    }
    #root .profile-edit-page .profile-edit-heading {
      min-height: 145px;
      margin-right: 5px;
      padding: 28px 26px 24px 49px;
    }
    #root .profile-edit-page .profile-edit-heading::before {
      inset: 8px 0 0;
      background:
        linear-gradient(90deg, transparent 0 25px, rgba(196, 99, 82, .2) 25px 26px, transparent 26px),
        repeating-linear-gradient(0deg, transparent 0 27px, rgba(127, 151, 177, .105) 27px 28px, transparent 28px 29px),
        #FFFAEC;
      clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%);
    }
    #root .profile-edit-page .profile-edit-heading::after {
      top: 8px;
      width: 32px;
      height: 32px;
    }
    #root .profile-edit-page .profile-edit-card {
      padding: 20px 16px 18px;
      border-radius: 4px 14px 4px 14px;
    }
    #root .profile-edit-page .profile-image-edit {
      padding: 20px 12px 17px;
    }
    #root .profile-edit-page .profile-form-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    #root .profile-edit-page .profile-edit-submit,
    #root .profile-edit-page .profile-edit-cancel {
      width: 100%;
      min-width: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #root *,
    #root *::before,
    #root *::after {
      animation-duration: .01ms;
      animation-iteration-count: 1;
      transition-duration: .01ms;
    }
  }

  /* =========================================================
     MOMO Brand Consistency — final cascade
     Warm cream / memo ivory / highlighter yellow / warm ink.
     Neutralizes legacy sage-gray page overrides.
  ========================================================= */

  :root {
    --momo-glass-ink: #292820;
    --momo-glass-muted: #6A6251;
    --momo-glass-edge: rgba(233,223,197,.9);
    --momo-glass-surface: rgba(255,250,236,.86);
    --momo-glass-shadow: 0 14px 34px rgba(75,61,31,.085), inset 0 1px rgba(255,255,255,.96);
    --momo-tone-film: #B38D19;
    --momo-tone-write: #B38D19;
    --momo-tone-like: #A85E54;
    --momo-tone-search: #8A6A20;
  }

  /* Shared reading surfaces */
  #root .profile-card,
  #root .all-reviews-card,
  #root .my-reviews-card,
  #root .liked-reviews-card,
  #root .review-detail-card,
  #root .review-comment-card,
  #root .detail-content-section,
  #root .signup-card,
  #root .favorite-page-empty,
  #root .all-reviews-search-panel,
  #root .all-reviews-search-form,
  #root .all-reviews-search-toolbar {
    border-color: rgba(233,223,197,.9);
    background: rgba(255,250,236,.88);
    box-shadow: 0 12px 30px rgba(75,61,31,.065), inset 0 1px rgba(255,255,255,.96);
  }

  /* Header navigation remains quiet; active navigation receives the accent. */
  #root .momo-app-header nav a {
    border-color: rgba(233,223,197,.82);
    background: rgba(255,250,236,.74);
    color: #514833;
  }
  #root .momo-app-header nav a:hover {
    border-color: rgba(214,180,63,.58);
    background: rgba(255,212,59,.16);
    color: #66510F;
  }
  #root .momo-app-header nav a.active {
    border-color: rgba(214,180,63,.68);
    background: rgba(255,212,59,.26);
    color: #66510F;
  }
  #root .momo-app-header .momo-logout-button {
    min-height: 36px;
    padding: 0 13px;
    border: 1px solid rgba(233,223,197,.9);
    border-radius: 10px;
    background: rgba(255,250,236,.78);
    box-shadow: none;
    color: #6A6251;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: -.01em;
  }
  #root .momo-app-header .momo-logout-button:hover:not(:disabled) {
    border-color: rgba(214,180,63,.62);
    background: rgba(255,212,59,.16);
    color: #66510F;
    box-shadow: 0 4px 10px rgba(75,61,31,.06);
    transform: none;
  }

  /* Page title panels share one warm paper treatment. */
  #root .all-reviews-heading,
  #root .my-reviews-heading,
  #root .liked-reviews-heading,
  #root .search-page-heading,
  #root .favorite-page-heading {
    --page-accent: #D6B43F;
    border-color: rgba(233,223,197,.92);
    background: linear-gradient(135deg, rgba(255,254,250,.96), rgba(255,250,236,.9));
    box-shadow: 0 14px 32px rgba(75,61,31,.07), inset 0 1px rgba(255,255,255,.98);
  }
  #root .all-reviews-heading h1,
  #root .my-reviews-heading h1,
  #root .liked-reviews-heading h1,
  #root .search-page-heading h1,
  #root .favorite-page-heading h1 {
    color: #292820;
  }
  #root .all-reviews-heading p,
  #root .my-reviews-heading p,
  #root .liked-reviews-heading p,
  #root .search-page-heading p,
  #root .favorite-page-heading p {
    color: #6A6251;
  }
  #root .my-reviews-heading .my-reviews-eyebrow,
  #root .liked-reviews-heading .liked-reviews-eyebrow,
  #root .favorite-page-heading .favorite-page-eyebrow {
    color: #80600E;
  }
  #root .page-back-link,
  #root .favorite-back-button,
  #root .review-detail-back {
    border-color: rgba(233,223,197,.9);
    background: rgba(255,250,236,.88);
    color: #514833;
  }

  /* Favorites gallery: one consistent ivory surface, without gray/green variants. */
  #root .favorite-page {
    background: linear-gradient(180deg, rgba(255,212,59,.13), rgba(255,212,59,.035) 320px, transparent 620px), var(--momo-bg);
  }
  #root .favorite-page-heading {
    border-color: rgba(233,223,197,.92);
    background: linear-gradient(135deg, rgba(255,254,250,.97), rgba(255,250,236,.9));
  }
  #root .favorite-page .favorite-list-toolbar {
    border-bottom-color: rgba(214,180,63,.32);
  }
  #root .favorite-page .favorite-list-toolbar > span {
    border-color: rgba(214,180,63,.52);
    background: rgba(255,241,178,.58);
    color: #66510F;
  }
  #root .favorite-page .favorite-page-card,
  #root .favorite-page .favorite-page-card:nth-child(3n + 2),
  #root .favorite-page .favorite-page-card:nth-child(3n) {
    border-color: #E9DFC5;
    background: rgba(255,250,236,.9);
    box-shadow: 0 8px 20px rgba(75,61,31,.065), inset 0 1px rgba(255,255,255,.98);
  }
  #root .favorite-page .favorite-page-card:hover {
    border-color: rgba(214,180,63,.62);
    box-shadow: 0 14px 26px rgba(75,61,31,.1), inset 0 1px rgba(255,255,255,.98);
  }
  #root .favorite-page .favorite-page-poster {
    border-color: rgba(233,223,197,.74);
    background: rgba(255,254,250,.72);
  }
  #root .favorite-page .favorite-page-movie-info h3,
  #root .favorite-page .favorite-page-empty h2 {
    color: #292820;
  }
  #root .favorite-page .favorite-page-movie-info p,
  #root .favorite-page .favorite-page-empty p {
    color: #6A6251;
  }
  #root .favorite-page .favorite-empty-symbol {
    color: #B38D19;
  }
  #root .favorite-page .favorite-page-empty {
    border-color: rgba(214,180,63,.5);
    background: rgba(255,250,236,.92);
  }
  #root .favorite-page .favorite-browse-button {
    border-color: #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 5px 12px rgba(179,141,25,.14);
  }
  #root .favorite-page .favorite-browse-button:hover {
    background: #F3C72E;
    color: #292820;
  }

  /* Profile activity cards: one memo-paper family, not three unrelated colors. */
  #root .profile-page .profile-card:has(.profile-activity-grid) {
    border-color: rgba(233,223,197,.92);
    background: rgba(255,250,236,.9);
  }
  #root .profile-page .profile-card:has(.profile-activity-grid) > .profile-card-heading h2 {
    color: #292820;
  }
  #root .profile-page .profile-card:has(.profile-activity-grid) > .profile-card-heading p {
    color: #6A6251;
  }
  #root .profile-page .profile-activity-item,
  #root .profile-page .profile-activity-item[data-tone="writing"],
  #root .profile-page .profile-activity-item[data-tone="liked"],
  #root .profile-page .profile-activity-item[data-tone="saved"] {
    --activity-ink: #B38D19;
    border-color: rgba(233,223,197,.92);
    border-left: 3px solid #D6B43F;
    border-radius: 15px;
    background:
      linear-gradient(90deg, transparent 0 25px, rgba(197,112,101,.11) 25px 26px, transparent 26px),
      repeating-linear-gradient(0deg, transparent 0 29px, rgba(198,161,43,.11) 30px, transparent 31px),
      linear-gradient(145deg, #FFFEFA, #FFFAEC);
    color: #292820;
    box-shadow: 0 8px 20px rgba(75,61,31,.065), inset 0 1px rgba(255,255,255,.98);
  }
  #root .profile-page .profile-activity-item::before,
  #root .profile-page .profile-activity-item::after {
    content: "";
    display: block;
  }
  #root .profile-page .profile-activity-item:hover {
    border-color: rgba(214,180,63,.7);
    border-left-color: #D6B43F;
    box-shadow: 0 14px 26px rgba(75,61,31,.105), inset 0 1px rgba(255,255,255,1);
  }
  #root .profile-page .profile-activity-icon {
    border-color: rgba(233,223,197,.88);
    background: rgba(255,254,250,.88);
    color: #80600E;
  }
  #root .profile-page .profile-activity-item[data-tone="liked"] .profile-activity-icon {
    color: #A85E54;
  }
  #root .profile-page .profile-activity-item h3,
  #root .profile-page .profile-activity-count {
    color: #292820;
  }
  #root .profile-page .profile-activity-unit,
  #root .profile-page .profile-activity-footer p {
    color: #6A6251;
  }
  #root .profile-page .profile-activity-footer {
    border-top-color: rgba(214,180,63,.3);
  }
  #root .profile-page .profile-activity-arrow {
    border-color: rgba(233,223,197,.9);
    background: rgba(255,254,250,.88);
    color: #80600E;
  }
  #root .profile-page .profile-activity-item:hover .profile-activity-arrow {
    background: #FFF1B2;
  }

  /* Member deletion: clear destructive action, never a competing primary CTA. */
  #root .profile-page .profile-delete-section {
    border-color: rgba(229,184,173,.78);
    background: rgba(255,250,236,.92);
  }
  #root .profile-delete-page-card {
    border-color: rgba(229,184,173,.72);
    background: linear-gradient(145deg, rgba(255,254,250,.96), rgba(255,250,236,.9));
  }
  #root .profile-delete-page-card h2 {
    margin: 0 0 8px;
    color: #292820;
    font-size: 20px;
    font-weight: 850;
  }
  #root .profile-delete-page-card > p {
    color: #6A6251;
    line-height: 1.7;
  }
  #root .profile-delete-page-card #delete-password {
    min-height: 46px;
    border: 1px solid #E9DFC5;
    border-radius: 10px;
    background: #FFFEFA;
    color: #292820;
  }
  #root .profile-delete-check { color: #514833; }
  #root .profile-delete-check input { accent-color: #D6B43F; }
  #root .profile-delete-button {
    border: 1px solid #E5B8AD;
    border-radius: 10px;
    background: #FFF1EC;
    color: #8C3F38;
    box-shadow: none;
  }
  #root .profile-delete-button:hover:not(:disabled) {
    border-color: #D69D91;
    background: #FFE5DC;
    color: #793A34;
  }
  #root .profile-delete-button:disabled {
    opacity: .62;
    border-color: #E9DFC5;
    background: #F1EADF;
    color: #776F62;
  }

  /* Movie detail and audience rating: visible, layered glass in cream and yellow. */
  #root .movie-detail-page .movie-detail-header {
    border-color: rgba(233,223,197,.92);
    background: linear-gradient(135deg, rgba(255,254,250,.96), rgba(255,250,236,.86));
    box-shadow: 0 18px 42px rgba(75,61,31,.085), inset 0 1px rgba(255,255,255,.98);
  }
  #root .movie-detail-page .movie-detail-info .detail-rank {
    border-color: rgba(214,180,63,.58);
    background: rgba(255,241,178,.58);
    color: #66510F;
  }
  #root .movie-detail-page .movie-detail-info h1 { color: #292820; }
  #root .movie-detail-page .movie-detail-info > p {
    border-color: rgba(233,223,197,.78);
    background: rgba(255,250,236,.78);
    color: #514833;
  }
  #root .movie-detail-page > .detail-content-section {
    border-color: rgba(233,223,197,.9);
    background: rgba(255,250,236,.88);
  }
  #root .movie-detail-page > .detail-content-section > h2 { color: #292820; }
  #root .movie-detail-page > .detail-content-section > p { color: #514833; }
  #root .movie-detail-page .movie-rating-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 240px;
    border: 1px solid rgba(214,180,63,.52);
    border-radius: 19px;
    background: rgba(255,250,236,.9);
    box-shadow: 0 14px 32px rgba(75,61,31,.085), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(22px) saturate(125%);
    -webkit-backdrop-filter: blur(22px) saturate(125%);
  }
  #root .movie-detail-page .movie-rating-panel::before {
    content: "";
    display: block;
    top: 8px;
    right: 34px;
    background: rgba(255,212,59,.5);
    border-color: rgba(214,180,63,.35);
  }
  #root .movie-detail-page .rating-panel-heading {
    border-bottom-color: rgba(214,180,63,.34);
  }
  #root .movie-detail-page .rating-panel-eyebrow,
  #root .movie-detail-page .rating-panel-stamp { color: #80600E; }
  #root .movie-detail-page .rating-panel-stamp {
    border-color: rgba(214,180,63,.58);
    background: rgba(255,241,178,.64);
  }
  #root .movie-detail-page .rating-label,
  #root .movie-detail-page .movie-score-value strong { color: #292820; }
  #root .movie-detail-page .rating-panel-description,
  #root .movie-detail-page .rating-score-caption,
  #root .movie-detail-page .rating-vote-summary,
  #root .movie-detail-page .rating-distribution-heading,
  #root .movie-detail-page .rating-distribution-legend { color: #6A6251; }
  #root .movie-detail-page .movie-score-display,
  #root .movie-detail-page .rating-distribution {
    border-color: rgba(233,223,197,.82);
    background: rgba(255,254,250,.78);
  }
  #root .movie-detail-page .rating-distribution-track {
    border-color: rgba(214,180,63,.46);
    background: rgba(233,223,197,.5);
  }
  #root .movie-detail-page .rating-distribution-track span {
    background: linear-gradient(90deg, #D6A91B, #FFD43B);
    box-shadow: 0 0 10px rgba(214,169,27,.18);
  }
  #root .movie-detail-page .rating-vote-button {
    border-color: rgba(233,223,197,.9);
    background: rgba(255,254,250,.86);
    color: #514833;
  }
  #root .movie-detail-page .rating-vote-button.is-like,
  #root .movie-detail-page .rating-vote-button.selected-like {
    border-color: rgba(214,180,63,.7);
    background: rgba(255,212,59,.22);
    color: #66510F;
  }
  #root .movie-detail-page .rating-vote-button.is-dislike,
  #root .movie-detail-page .rating-vote-button.selected-dislike {
    border-color: rgba(229,184,173,.85);
    background: rgba(255,241,236,.92);
    color: #8B4F47;
  }
  #root .movie-detail-page .rating-vote-button.selected-like {
    background: linear-gradient(145deg, #FFF1B2, #FFE58A);
  }
  #root .movie-detail-page .rating-vote-button.selected-dislike {
    background: linear-gradient(145deg, #FFF1EC, #FFE5DC);
  }
  #root .movie-detail-page .rating-unavailable {
    border-color: rgba(214,180,63,.55);
    background: rgba(255,241,178,.42);
    color: #66510F;
  }
  #root .movie-detail-page .rating-unavailable > span {
    border-color: rgba(214,180,63,.4);
    background: rgba(255,254,250,.9);
    color: #80600E;
  }

  /* Warm inputs, search controls, tables and page metadata. */
  #root .all-reviews-search-label { color: #66510F; }
  #root .all-reviews-search-select,
  #root .all-reviews-search-input,
  #root .momo-search-form,
  #root .search-page input,
  #root .search-page select,
  #root main > input[type="search"],
  #root .review-title-field input,
  #root .review-content-field textarea,
  #root .review-edit-title,
  #root .review-edit-area textarea,
  #root .review-comment-form textarea,
  #root .signup-field input,
  #root .profile-form input,
  #root .profile-form textarea,
  #root .profile-delete-page-card input {
    border-color: rgba(216,201,159,.9);
    background: rgba(255,254,250,.9);
    color: #292820;
  }
  #root input::placeholder,
  #root textarea::placeholder { color: #776F62; }
  #root input:focus,
  #root textarea:focus,
  #root select:focus,
  #root .momo-search-form:focus-within {
    border-color: rgba(198,161,43,.82);
    box-shadow: 0 0 0 3px rgba(255,212,59,.2), 0 6px 16px rgba(75,61,31,.055);
  }
  #root .momo-search-dropdown {
    border-color: rgba(233,223,197,.92);
    background: rgba(255,250,236,.96);
  }
  #root .momo-search-result:hover { background: rgba(255,241,178,.38); }
  #root .all-reviews-table thead th {
    border-bottom-color: rgba(214,180,63,.4);
    background: rgba(255,241,178,.52);
    color: #66510F;
  }
  #root .all-reviews-table tbody tr:hover,
  #root .my-review-item:hover,
  #root .liked-review-item:hover,
  #root .all-reviews-mobile-item:hover,
  #root .review-comment-item:hover { background: rgba(255,241,178,.28); }
  #root .home-page .movie-info h3 { color: #292820; }
  #root .home-page .movie-info p,
  #root .profile-heading p,
  #root .profile-card-heading p,
  #root .favorite-page-movie-info p,
  #root .favorite-page-empty p,
  #root .search-page-heading p,
  #root .all-reviews-description { color: #6A6251; }
  #root .detail-rank,
  #root .all-reviews-page-info,
  #root .favorite-list-toolbar > span {
    border-color: rgba(214,180,63,.5);
    background: rgba(255,241,178,.52);
    color: #66510F;
  }

  /* Footer: the readable back cover of the same warm memo book. */
  #root footer {
    border-top: 1px solid rgba(233,223,197,.96);
    background: linear-gradient(145deg, rgba(255,250,236,.98), rgba(245,242,235,.98));
    color: #514833;
    box-shadow: 0 -8px 24px rgba(75,61,31,.045), inset 0 1px rgba(255,255,255,.96);
  }
  #root footer p,
  #root footer span,
  #root footer a { color: #514833; }
  #root footer h4 { color: #80600E; }
  #root footer a:hover { color: #66510F; }
  #root footer > div:first-child { border-bottom-color: rgba(214,180,63,.32); }
  #root footer [class*="FooterBottom"] { color: #6A6251; }

  @media (max-width: 600px) {
    #root .profile-page .profile-activity-grid { grid-template-columns: 1fr; }
    #root .profile-page .profile-activity-item { min-height: 190px; }
    #root .movie-detail-page .rating-panel-main { grid-template-columns: 1fr; }
    #root .movie-detail-page .rating-vote-button { min-height: 54px; }
    #root footer { padding-top: 32px; }
  }


  /* Remaining shared components: bookmarks, forms, archives and reaction actions. */
  #root .favorite-star {
    border-color: rgba(233,223,197,.96);
    background: rgba(255,250,236,.94);
    color: #80600E;
    box-shadow: 0 7px 17px rgba(75,61,31,.16), inset 0 1px rgba(255,255,255,.98);
  }
  #root .favorite-star:hover:not(:disabled) {
    border-color: #D6B43F;
    background: #FFF1B2;
    color: #66510F;
  }
  #root .favorite-star.is-active {
    border-color: rgba(214,180,63,.9);
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 7px 18px rgba(179,141,25,.2), inset 0 1px rgba(255,255,255,.8);
  }
  #root .favorite-star:focus-visible {
    outline-color: rgba(198,161,43,.56);
  }
  #root .recommend-content .recommend-label {
    border-color: rgba(255,255,255,.58);
    background: rgba(41,40,32,.62);
    color: #FFF1B2;
  }
  #root .recommend-content .recommend-button {
    border-color: #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 6px 14px rgba(75,61,31,.15), inset 0 1px rgba(255,255,255,.82);
  }
  #root .recommend-content .recommend-button:hover {
    background: #F3C72E;
    color: #292820;
  }
  #root .home-page .poster-rank,
  #root .home-page .rank {
    border-color: rgba(255,250,236,.8);
    background: rgba(41,40,32,.84);
    color: #FFF1B2;
  }

  #root .profile-button,
  #root .page-back-link,
  #root .favorite-back-button,
  #root .detail-back-button,
  #root .review-detail-back,
  #root .people-more-button,
  #root .person-bio-toggle,
  #root .home-favorites-more {
    border-color: rgba(233,223,197,.94);
    background: rgba(255,250,236,.9);
    color: #514833;
  }
  #root .profile-button:hover:not(:disabled),
  #root .page-back-link:hover,
  #root .favorite-back-button:hover,
  #root .detail-back-button:hover,
  #root .review-detail-back:hover,
  #root .people-more-button:hover,
  #root .person-bio-toggle:hover,
  #root .home-favorites-more:hover {
    border-color: rgba(214,180,63,.7);
    background: rgba(255,241,178,.56);
    color: #66510F;
  }
  #root .all-reviews-search-label { color: #66510F; }
  #root .all-reviews-table-wrap,
  #root .my-review-item,
  #root .liked-review-item,
  #root .all-reviews-mobile-item {
    border-color: rgba(233,223,197,.92);
    background: rgba(255,250,236,.88);
    color: #292820;
  }
  #root .all-reviews-table tbody tr,
  #root .all-reviews-table tbody tr:nth-child(even) {
    background: rgba(255,250,236,.76);
  }
  #root .all-reviews-table thead th {
    border-bottom-color: rgba(214,180,63,.4);
    background: rgba(255,241,178,.56);
    color: #66510F;
  }
  #root .all-reviews-table tbody tr:hover,
  #root .my-review-item:hover,
  #root .liked-review-item:hover,
  #root .all-reviews-mobile-item:hover {
    background: rgba(255,241,178,.32);
  }
  #root .liked-review-unlike {
    border-color: rgba(229,184,173,.82);
    background: rgba(255,241,236,.9);
    color: #8B4F47;
  }
  #root .liked-review-unlike:hover:not(:disabled) {
    background: #FFE5DC;
  }
  #root .profile-user {
    border-color: rgba(233,223,197,.9);
    background: rgba(255,250,236,.88);
  }
  #root .person-chip {
    border-color: rgba(233,223,197,.9);
    background: rgba(255,250,236,.86);
    color: #514833;
  }
  #root .person-chip:hover {
    background: rgba(255,241,178,.5);
  }
  #root .signup-card {
    border-color: rgba(233,223,197,.94);
    background: rgba(255,250,236,.92);
  }
  #root .signup-card-heading h1 { color: #292820; }
  #root .signup-submit,
  #root .all-reviews-search-submit {
    border-color: #D6B43F;
    background: #FFD43B;
    color: #292820;
    box-shadow: 0 5px 13px rgba(179,141,25,.14), inset 0 1px rgba(255,255,255,.84);
  }
  #root .signup-submit:hover:not(:disabled),
  #root .all-reviews-search-submit:hover:not(:disabled) {
    background: #F3C72E;
    color: #292820;
  }
  #root .signup-note-label {
    border-color: rgba(214,180,63,.48);
    background: rgba(255,241,178,.55);
    color: #66510F;
  }
  #root .review-write-toggle:hover {
    background: rgba(255,241,178,.42);
  }
  #root .review-like-button,
  #root .comment-like-button {
    border-color: var(--momo-like-border);
    background: var(--momo-like-bg);
    color: var(--momo-like-text);
  }
  #root .review-dislike-button,
  #root .comment-dislike-button {
    border-color: var(--momo-dislike-border);
    background: var(--momo-dislike-bg);
    color: var(--momo-dislike-text);
  }
  #root .review-like-button:hover:not(:disabled),
  #root .comment-like-button:hover:not(:disabled) {
    background: var(--momo-like-bg-hover);
  }
  #root .review-dislike-button:hover:not(:disabled),
  #root .comment-dislike-button:hover:not(:disabled) {
    background: var(--momo-dislike-bg-hover);
  }
  #root .profile-heading h1,
  #root .profile-card-heading h2,
  #root .all-reviews-card-heading h2,
  #root .my-reviews-card-heading h2,
  #root .liked-reviews-card-heading h2 {
    color: #292820;
  }
  #root .profile-heading p,
  #root .profile-card-heading p,
  #root .all-reviews-card-heading p,
  #root .my-reviews-card-heading p,
  #root .liked-reviews-card-heading p {
    color: #6A6251;
  }
  #root a:focus-visible,
  #root button:focus-visible,
  #root input:focus-visible,
  #root textarea:focus-visible,
  #root select:focus-visible {
    outline-color: rgba(198,161,43,.62);
  }


  /* Preserve danger semantics after the shared profile-button rule. */
  #root .profile-page .profile-delete-button {
    border-color: #E5B8AD;
    background: #FFF1EC;
    color: #8C3F38;
    box-shadow: none;
  }
  #root .profile-page .profile-delete-button:hover:not(:disabled) {
    border-color: #D69D91;
    background: #FFE5DC;
    color: #793A34;
  }
  #root .profile-page .profile-delete-button:disabled {
    border-color: #E9DFC5;
    background: #F1EADF;
    color: #776F62;
    opacity: .62;
  }
  #root .profile-page .profile-delete-button:not(:disabled) {
    border-color: #E5B8AD;
    background: #FFF1EC;
    color: #8C3F38;
    opacity: 1;
    cursor: pointer;
  }


  /* The desktop rating metrics must use the complete card width, not a narrow content column. */
  #root .movie-detail-page .rating-panel-main {
    display: grid;
    width: 100%;
    max-width: none;
    align-self: stretch;
    grid-template-columns: minmax(200px, .82fr) minmax(0, 1.18fr);
  }
  @media (max-width: 600px) {
    #root .movie-detail-page .rating-panel-main {
      width: 100%;
      grid-template-columns: minmax(0, 1fr);
    }
  }

`;

export default MomoLiquidGlassPageStyles;
