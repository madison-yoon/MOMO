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

  /* Keep the existing MOMO page canvas from GlobalTokensStyles visible underneath the glass. */

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

  /* Home sections are actual styled components; make each glass plane legible. */
  #root main.momo-app-main > .home-page > .home-section {
    position: relative !important;
    isolation: isolate !important;
    padding: clamp(20px, 2.5vw, 30px) !important;
    border: 1px solid rgba(255,255,255,.64) !important;
    border-radius: 24px !important;
    background: linear-gradient(128deg, rgba(255,255,255,.30), rgba(211,224,218,.20) 48%, rgba(218,207,224,.16) 76%, rgba(235,222,202,.14)) !important;
    box-shadow: 0 4px 10px rgba(43,48,46,.04), 0 16px 34px rgba(43,48,46,.07), inset 0 1px 0 rgba(255,255,255,.82), inset 0 -1px 0 rgba(105,122,115,.12) !important;
    -webkit-backdrop-filter: blur(28px) saturate(165%) !important;
    backdrop-filter: blur(28px) saturate(165%) !important;
  }

  #root main.momo-app-main > .home-page > .home-section::after {
    background: linear-gradient(112deg, transparent 4%, rgba(255,255,255,.22) 23%, transparent 42%, rgba(191,211,220,.12) 59%, rgba(220,195,220,.12) 75%, transparent 91%) !important;
    opacity: 1 !important;
  }

  /* The section heading is a separate glass layer, not plain text on a divider. */
  #root main.momo-app-main > .home-page > .home-section .home-section-heading {
    position: relative !important;
    isolation: isolate !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 18px !important;
    min-height: 76px !important;
    margin: 0 0 22px !important;
    padding: 16px 19px 15px !important;
    overflow: hidden !important;
    border: 1px solid rgba(255,255,255,.62) !important;
    border-bottom: 1px solid rgba(255,255,255,.62) !important;
    border-radius: 17px !important;
    background:
      linear-gradient(118deg,
        rgba(255,255,255,.27) 0%,
        rgba(224,232,228,.16) 42%,
        rgba(211,215,231,.13) 72%,
        rgba(238,226,214,.12) 100%
      ) !important;
    box-shadow:
      0 3px 9px rgba(43,48,46,.035),
      0 10px 22px rgba(43,48,46,.045),
      inset 0 1px 0 rgba(255,255,255,.78),
      inset 0 -1px 0 rgba(112,126,121,.09) !important;
    -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
    backdrop-filter: blur(24px) saturate(160%) !important;
  }

  #root main.momo-app-main > .home-page > .home-section .home-section-heading::after {
    position: absolute !important;
    z-index: 0 !important;
    inset: 0 !important;
    content: "" !important;
    border-radius: inherit !important;
    background:
      linear-gradient(108deg,
        transparent 4%,
        rgba(255,255,255,.24) 22%,
        transparent 41%,
        rgba(190,211,220,.13) 61%,
        rgba(216,196,224,.12) 77%,
        transparent 94%
      ),
      radial-gradient(ellipse at 96% 0%, rgba(255,255,255,.17), transparent 42%) !important;
    pointer-events: none !important;
  }

  #root main.momo-app-main > .home-page > .home-section .home-section-heading > * {
    position: relative !important;
    z-index: 1 !important;
  }

  #root main.momo-app-main > .home-page > .home-section .home-section-heading h2 {
    color: #343936 !important;
    text-shadow: 0 1px 0 rgba(255,255,255,.34) !important;
  }

  #root main.momo-app-main > .home-page > .home-section .home-section-heading p {
    color: #69716D !important;
  }

  #root main.momo-app-main > .home-page > .home-section .home-section-heading > span,
  #root main.momo-app-main > .home-page > .home-section .home-section-heading .home-more-text {
    border: 1px solid rgba(255,255,255,.54) !important;
    border-radius: 999px !important;
    background: linear-gradient(135deg, rgba(255,255,255,.24), rgba(211,222,218,.13)) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.68) !important;
    color: #68716D !important;
    padding: 7px 11px !important;
  }

  @media (max-width: 520px) {
    #root main.momo-app-main > .home-page > .home-section .home-section-heading {
      align-items: flex-start !important;
      flex-direction: column !important;
      gap: 9px !important;
      min-height: 0 !important;
      margin-bottom: 17px !important;
      padding: 15px 16px !important;
    }
  }

  #root main.momo-app-main > .home-page > .home-brand-line {
    min-height: 116px !important;
    border: 1px solid rgba(255,255,255,.72) !important;
    border-radius: 24px !important;
    background: linear-gradient(112deg, rgba(255,255,255,.34), rgba(211,226,220,.22) 42%, rgba(207,198,224,.18) 68%, rgba(237,220,200,.16)) !important;
    box-shadow: 0 5px 14px rgba(43,48,46,.05), 0 18px 38px rgba(43,48,46,.08), inset 0 1px 0 rgba(255,255,255,.88), inset 0 -1px 0 rgba(105,122,115,.14) !important;
    -webkit-backdrop-filter: blur(32px) saturate(170%) !important;
    backdrop-filter: blur(32px) saturate(170%) !important;
  }

  #root main.momo-app-main > .home-page > .home-brand-line::before {
    display: none !important;
    content: none !important;
  }

  #root main.momo-app-main > .home-page > .home-brand-line::after {
    background: linear-gradient(108deg, transparent 3%, rgba(255,255,255,.24) 25%, transparent 44%, rgba(191,211,220,.14) 61%, rgba(220,195,220,.13) 77%, transparent 94%) !important;
    opacity: 1 !important;
  }

  #root main.momo-app-main > .home-page > .home-brand-line h2 {
    color: #343A36 !important;
  }

  #root main.momo-app-main > .home-page > .home-brand-line p {
    color: #69716D !important;
  }

  #root main.momo-app-main > .profile-dashboard .profile-card.profile-overview-card,
  #root main.momo-app-main > .profile-dashboard .profile-card.profile-activity-section {
    background: linear-gradient(132deg, rgba(255,255,255,.31), rgba(210,225,218,.20) 54%, rgba(218,205,224,.15)) !important;
    border-color: rgba(255,255,255,.68) !important;
    box-shadow: 0 5px 14px rgba(43,48,46,.045), 0 16px 36px rgba(43,48,46,.07), inset 0 1px 0 rgba(255,255,255,.84) !important;
  }

  #root main.momo-app-main > .profile-dashboard .profile-activity-item {
    background: linear-gradient(135deg, rgba(255,255,255,.28), rgba(207,223,216,.18) 58%, rgba(216,201,222,.13)) !important;
    border-color: rgba(255,255,255,.62) !important;
    box-shadow: 0 5px 16px rgba(43,48,46,.05), inset 0 1px 0 rgba(255,255,255,.78) !important;
  }

  #root main.momo-app-main > .profile-dashboard .profile-delete-section {
    border-top: 1px solid rgba(255,255,255,.48) !important;
    background: linear-gradient(110deg, rgba(255,255,255,.17), rgba(211,224,218,.11)) !important;
    border-radius: 16px !important;
    padding: 18px 20px !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.56) !important;
  }

  @media (max-width: 700px) {
    #root main.momo-app-main > .home-page > .home-section {
      padding: 18px !important;
      border-radius: 19px !important;
    }
  }
`;


export default MomoPrismGlassRefinementStyles;
