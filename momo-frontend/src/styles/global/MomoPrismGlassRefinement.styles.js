import { createGlobalStyle } from "styled-components";

/*
 * Final MOMO glass pass.
 * This stylesheet is intentionally mounted after the legacy material layers
 * so translucent surfaces and the neutral canvas have one predictable owner.
 */
const MomoPrismGlassRefinementStyles = createGlobalStyle`
  :root {
    --momo-prism-surface: linear-gradient(
      132deg,
      rgba(255, 255, 255, .24) 0%,
      rgba(255, 255, 255, .12) 34%,
      rgba(226, 232, 231, .10) 64%,
      rgba(238, 226, 218, .10) 100%
    );
    --momo-prism-edge: rgba(255, 255, 255, .58);
    --momo-prism-shadow:
      0 2px 7px rgba(43, 48, 46, .035),
      0 14px 34px rgba(43, 48, 46, .075),
      inset 0 1px 0 rgba(255, 255, 255, .76),
      inset 0 -1px 0 rgba(116, 129, 126, .10);
    --momo-prism-blur: blur(28px) saturate(155%);
  }

  /* A quiet mineral-grey canvas replaces the ruled memo-paper background. */
  body {
    background-color: #E8E8E4 !important;
    background-image:
      radial-gradient(ellipse at 12% 0%, rgba(255,255,255,.52), transparent 42rem),
      radial-gradient(ellipse at 88% 12%, rgba(214,220,218,.24), transparent 40rem),
      linear-gradient(145deg, #ECECE8 0%, #E7E8E4 52%, #E2E4E0 100%) !important;
    background-attachment: fixed !important;
  }

  #root .momo-app-main {
    background: transparent !important;
  }

  /* Primary glass planes: genuinely translucent, with the page visible through. */
  #root .home-feature-section,
  #root .home-feature-info,
  #root .home-section,
  #root .home-brand-line,
  #root .home-favorites-empty,
  #root .profile-dashboard-heading,
  #root .profile-dashboard .profile-card,
  #root .profile-dashboard .profile-delete-section,
  #root .profile-edit-heading,
  #root .profile-edit-card,
  #root .profile-edit-photo-card,
  #root .profile-edit-details,
  #root .profile-delete-page-card,
  #root .favorite-page-heading,
  #root .favorite-page-card,
  #root .favorite-page-empty,
  #root .all-reviews-heading,
  #root .all-reviews-card,
  #root .all-reviews-search,
  #root .my-reviews-heading,
  #root .my-reviews-card,
  #root .liked-reviews-heading,
  #root .liked-reviews-card,
  #root .review-detail-card,
  #root .review-detail-content,
  #root .review-detail-movie,
  #root .review-comment-card,
  #root .review-comment-form,
  #root .movie-detail-page .movie-detail-header,
  #root .movie-detail-page > .detail-content-section,
  #root .movie-detail-page .movie-rating-panel,
  #root .person-detail-page .person-detail-header,
  #root .person-detail-page .person-filmography,
  #root .signup-page .signup-card,
  #root .login-page .login-card {
    position: relative;
    isolation: isolate;
    border: 1px solid var(--momo-prism-edge) !important;
    background: var(--momo-prism-surface) !important;
    box-shadow: var(--momo-prism-shadow) !important;
    -webkit-backdrop-filter: var(--momo-prism-blur) !important;
    backdrop-filter: var(--momo-prism-blur) !important;
  }

  /* Thin spectral reflection. It is restrained and never paints the glass white. */
  #root .home-feature-section::after,
  #root .home-feature-info::after,
  #root .home-section::after,
  #root .home-brand-line::after,
  #root .home-favorites-empty::after,
  #root .profile-dashboard .profile-card::after,
  #root .profile-dashboard .profile-delete-section::after,
  #root .profile-edit-card::after,
  #root .profile-edit-photo-card::after,
  #root .profile-edit-details::after,
  #root .profile-delete-page-card::after,
  #root .favorite-page-card::after,
  #root .favorite-page-empty::after,
  #root .all-reviews-card::after,
  #root .my-reviews-card::after,
  #root .liked-reviews-card::after,
  #root .review-detail-card::after,
  #root .review-comment-card::after,
  #root .movie-detail-page .movie-detail-header::after,
  #root .movie-detail-page > .detail-content-section::after,
  #root .movie-detail-page .movie-rating-panel::after {
    position: absolute;
    z-index: 0;
    inset: 0;
    content: "";
    border-radius: inherit;
    background:
      linear-gradient(112deg,
        transparent 0%,
        rgba(255,255,255,.16) 24%,
        transparent 43%,
        rgba(205,216,224,.075) 58%,
        rgba(226,205,220,.065) 72%,
        transparent 88%
      ),
      radial-gradient(ellipse at 92% 4%, rgba(255,255,255,.14), transparent 38%);
    opacity: .82;
    pointer-events: none;
  }

  #root .home-feature-section > *,
  #root .home-feature-info > *,
  #root .home-section > *,
  #root .home-brand-line > *,
  #root .home-favorites-empty > *,
  #root .profile-dashboard .profile-card > *,
  #root .profile-dashboard .profile-delete-section > *,
  #root .profile-edit-card > *,
  #root .profile-edit-photo-card > *,
  #root .profile-edit-details > *,
  #root .profile-delete-page-card > *,
  #root .favorite-page-card > *,
  #root .favorite-page-empty > *,
  #root .all-reviews-card > *,
  #root .my-reviews-card > *,
  #root .liked-reviews-card > *,
  #root .review-detail-card > *,
  #root .review-comment-card > *,
  #root .movie-detail-page .movie-detail-header > *,
  #root .movie-detail-page > .detail-content-section > *,
  #root .movie-detail-page .movie-rating-panel > * {
    position: relative;
    z-index: 1;
  }

  /* Remove the old memo-pad marker from the brand strip. */
  #root .home-brand-line::before {
    display: none !important;
    content: none !important;
  }

  /* Profile sub-panels stay distinct without turning into opaque white cards. */
  #root .profile-dashboard .profile-card.profile-overview-card,
  #root .profile-dashboard .profile-card.profile-activity-section,
  #root .profile-dashboard .profile-activity-item,
  #root .profile-dashboard .profile-stat-card {
    border-color: rgba(255,255,255,.52) !important;
    background: linear-gradient(138deg, rgba(255,255,255,.20), rgba(221,229,226,.11) 62%, rgba(231,220,214,.09)) !important;
    box-shadow: 0 5px 16px rgba(43,48,46,.045), inset 0 1px 0 rgba(255,255,255,.68) !important;
    -webkit-backdrop-filter: blur(22px) saturate(150%) !important;
    backdrop-filter: blur(22px) saturate(150%) !important;
  }

  /* Controls share the same transparent material language. */
  #root .momo-app-main button,
  #root .momo-app-main [role="button"],
  #root .momo-app-header button,
  #root .momo-app-footer button,
  #root .momo-chat-launcher,
  #root .signup-page button,
  #root .login-page button {
    border: 1px solid rgba(255,255,255,.62) !important;
    background: linear-gradient(145deg, rgba(255,255,255,.30), rgba(216,225,221,.16) 58%, rgba(231,220,214,.12)) !important;
    box-shadow: 0 3px 9px rgba(43,48,46,.055), inset 0 1px 0 rgba(255,255,255,.76), inset 0 -1px 0 rgba(110,125,120,.09) !important;
    -webkit-backdrop-filter: blur(20px) saturate(155%) !important;
    backdrop-filter: blur(20px) saturate(155%) !important;
    transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease !important;
  }

  #root .momo-app-main button:hover:not(:disabled),
  #root .momo-app-main [role="button"]:hover,
  #root .momo-app-header button:hover:not(:disabled),
  #root .momo-app-footer button:hover:not(:disabled),
  #root .momo-chat-launcher:hover,
  #root .signup-page button:hover:not(:disabled),
  #root .login-page button:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(255,255,255,.86) !important;
    background: linear-gradient(145deg, rgba(255,255,255,.42), rgba(225,231,225,.22) 58%, rgba(238,225,215,.16)) !important;
    box-shadow: 0 7px 16px rgba(43,48,46,.075), inset 0 1px 0 rgba(255,255,255,.88) !important;
  }

  /* Primary actions keep a muted champagne highlight instead of a yellow slab. */
  #root .momo-app-main button[class*="primary"],
  #root .momo-app-main button[class*="submit"],
  #root .momo-app-main .all-reviews-search-submit,
  #root .momo-app-main .profile-edit-submit,
  #root .momo-app-main .favorite-browse-button,
  #root .momo-app-main .recommend-button,
  #root .signup-page .signup-submit,
  #root .login-page .login-submit {
    color: #51451F !important;
    background: linear-gradient(140deg, rgba(255,255,255,.42), rgba(245,225,175,.28) 54%, rgba(214,190,132,.18)) !important;
  }

  /* Recessed translucent form fields. */
  #root .momo-app-main input:not([type="checkbox"]):not([type="radio"]),
  #root .momo-app-main textarea,
  #root .momo-app-main select,
  #root .momo-app-header input,
  #root .signup-page input,
  #root .login-page input {
    border: 1px solid rgba(255,255,255,.58) !important;
    background: linear-gradient(180deg, rgba(255,255,255,.30), rgba(211,222,216,.17)) !important;
    box-shadow: inset 0 2px 6px rgba(43,48,46,.045), inset 0 1px 0 rgba(255,255,255,.68) !important;
    -webkit-backdrop-filter: blur(18px) saturate(150%) !important;
    backdrop-filter: blur(18px) saturate(150%) !important;
  }

  @media (max-width: 700px) {
    #root .home-section,
    #root .home-brand-line,
    #root .profile-dashboard .profile-card,
    #root .profile-dashboard .profile-delete-section,
    #root .profile-edit-card,
    #root .profile-delete-page-card {
      border-radius: 18px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #root .momo-app-main button,
    #root .momo-app-header button,
    #root .momo-app-footer button {
      transition-duration: .01ms !important;
    }
  }

  /* Give the real Home styled sections a visible glass plane and usable inset. */
  #root main.momo-app-main > .home-page > .home-section {
    padding: clamp(20px, 2.5vw, 30px) !important;
    border: 1px solid rgba(255,255,255,.56) !important;
    border-radius: 24px !important;
    background: linear-gradient(128deg, rgba(255,255,255,.27), rgba(221,230,226,.17) 48%, rgba(224,211,221,.13) 76%, rgba(232,224,207,.12)) !important;
    box-shadow: 0 3px 8px rgba(43,48,46,.035), 0 15px 32px rgba(43,48,46,.055), inset 0 1px 0 rgba(255,255,255,.72), inset 0 -1px 0 rgba(113,127,122,.10) !important;
    -webkit-backdrop-filter: blur(26px) saturate(158%) !important;
    backdrop-filter: blur(26px) saturate(158%) !important;
  }
  #root main.momo-app-main > .home-page > .home-section .home-section-heading {
    border-bottom-color: rgba(255,255,255,.30) !important;
  }
  #root main.momo-app-main > .home-page > .home-section .home-section-heading h2 { color: #343936 !important; }
  #root main.momo-app-main > .home-page > .home-section .home-section-heading p { color: #69716D !important; }
  #root main.momo-app-main > .home-page > .home-brand-line {
    min-height: 116px !important;
    border-color: rgba(255,255,255,.64) !important;
    background: linear-gradient(112deg, rgba(255,255,255,.31), rgba(221,231,227,.19) 42%, rgba(216,208,226,.15) 68%, rgba(236,224,207,.14)) !important;
    box-shadow: 0 4px 12px rgba(43,48,46,.045), 0 18px 36px rgba(43,48,46,.07), inset 0 1px 0 rgba(255,255,255,.82), inset 0 -1px 0 rgba(105,122,115,.12) !important;
    -webkit-backdrop-filter: blur(30px) saturate(165%) !important;
    backdrop-filter: blur(30px) saturate(165%) !important;
  }
  #root main.momo-app-main > .home-page > .home-brand-line h2 { color: #343A36 !important; }
  #root main.momo-app-main > .home-page > .home-brand-line p { color: #69716D !important; }
  #root main.momo-app-main > .profile-dashboard .profile-card.profile-overview-card,
  #root main.momo-app-main > .profile-dashboard .profile-card.profile-activity-section {
    background: linear-gradient(132deg, rgba(255,255,255,.29), rgba(219,229,224,.17) 54%, rgba(225,213,224,.13)) !important;
    border-color: rgba(255,255,255,.64) !important;
    box-shadow: 0 4px 12px rgba(43,48,46,.04), 0 16px 34px rgba(43,48,46,.06), inset 0 1px 0 rgba(255,255,255,.78) !important;
  }
  #root main.momo-app-main > .profile-dashboard .profile-activity-item {
    background: linear-gradient(135deg, rgba(255,255,255,.25), rgba(216,228,222,.14) 58%, rgba(223,211,224,.11)) !important;
    border-color: rgba(255,255,255,.58) !important;
    box-shadow: 0 5px 16px rgba(43,48,46,.045), inset 0 1px 0 rgba(255,255,255,.72) !important;
  }
  #root main.momo-app-main > .profile-dashboard .profile-delete-section {
    border-top-color: rgba(255,255,255,.42) !important;
    background: linear-gradient(110deg, rgba(255,255,255,.13), rgba(218,226,221,.08)) !important;
    border-radius: 16px !important;
    padding: 18px 20px !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.48) !important;
  }
  @media (max-width: 700px) {
    #root main.momo-app-main > .home-page > .home-section { padding: 18px !important; border-radius: 19px !important; }
  }
\`;


export default MomoPrismGlassRefinementStyles;
