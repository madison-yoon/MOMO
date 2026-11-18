import { createGlobalStyle } from "styled-components";

const MovieSearchAutocompleteStyles = createGlobalStyle`
  /* 검색 영역 */
  .momo-search-area {
    position: relative;
    flex-shrink: 0;
    width: clamp(260px, 28vw, 380px);
    max-width: 100%;
  }

  /* 검색 폼 */
  .momo-search-form {
    display: flex;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    min-height: 44px;
    padding: 6px 16px;
    background:
      linear-gradient(145deg, rgba(255,255,255,.72), rgba(239,244,240,.38) 54%, rgba(255,255,255,.34));
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 16px;
    box-shadow: 0 7px 18px rgba(54,45,28,.07), inset 0 1px rgba(255,255,255,.98), inset 0 -1px rgba(190,172,135,.12);
    backdrop-filter: blur(16px) saturate(145%);
    -webkit-backdrop-filter: blur(16px) saturate(145%);
    transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  }

  .momo-search-form:focus-within {
    border-color: rgba(214, 166, 20, .72);
    background: rgba(255, 255, 255, .9);
    box-shadow: 0 0 0 3px rgba(255, 212, 59, 0.17), 0 12px 26px rgba(54,45,28,.1), inset 0 1px rgba(255,255,255,.98);
  }

  /* 검색 입력 */
  .momo-search-input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--momo-text);
    font-size: 14px;
  }

  .momo-search-input::placeholder {
    color: var(--momo-placeholder);
  }

  /* 검색 버튼 */
  .momo-search-button {
    flex-shrink: 0;
    margin-left: 6px;
    padding: 2px 4px;
    border: none;
    background: transparent;
    color: var(--momo-accent-ink);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .momo-search-button:hover {
    color: var(--momo-text);
  }

  /* 자동완성 목록 */
  .momo-search-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 200;
    width: 100%;
    max-height: 390px;
    overflow-y: auto;
    box-sizing: border-box;
    background:
      linear-gradient(90deg, transparent 0 24px, rgba(201,117,104,.13) 24px 25px, transparent 25px),
      repeating-linear-gradient(0deg, transparent 0 30px, rgba(117,145,177,.07) 31px, transparent 32px),
      rgba(255,254,249,.88);
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 17px;
    box-shadow: 0 24px 56px rgba(54,45,28,.17), 0 3px 8px rgba(54,45,28,.045), inset 0 1px rgba(255,255,255,.98);
    backdrop-filter: blur(24px) saturate(145%);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
  }

  /* 영화 검색 결과 */
  .momo-search-result {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 88px;
    padding: 10px 14px;
    border: none;
    border-bottom: 1px solid rgba(177,158,119,.22);
    background: rgba(255,254,249,.58);
    text-align: left;
    cursor: pointer;
    transition: background 160ms ease, padding-left 160ms ease;
  }

  .momo-search-result:last-child {
    border-bottom: none;
  }

  .momo-search-result:hover,
  .momo-search-result:focus-visible,
  .momo-search-result.is-active {
    background: rgba(255,247,222,.92);
    padding-left: 18px;
    outline: none;
  }

  /* 포스터 */
  .momo-search-poster {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 42px;
    height: 60px;
    overflow: hidden;
    padding: 3px;
    border: 1px solid rgba(255,255,255,.98);
    border-radius: 7px;
    background: rgba(255,255,255,.72);
    box-shadow: 0 3px 8px rgba(54,45,28,.1), inset 0 1px rgba(255,255,255,.98);
  }

  .momo-search-poster img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .momo-search-poster-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--momo-placeholder);
    font-size: 18px;
  }

  /* 영화 정보 */
  .momo-search-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    gap: 5px;
  }

  .momo-search-title {
    overflow: hidden;
    color: var(--momo-text);
    font-size: 13px;
    font-weight: 850;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .momo-search-meta {
    overflow: hidden;
    color: var(--momo-placeholder);
    font-size: 11px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* 검색 상태 */
  .momo-search-message {
    padding: 20px 12px;
    color: var(--momo-muted);
    font-size: 13px;
    text-align: center;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .momo-search-area {
      width: 280px;
    }
  }

  @media (max-width: 600px) {
    .momo-search-area {
      width: 100%;
    }

    .momo-search-dropdown {
      max-height: 320px;
    }
  }
`;

export default MovieSearchAutocompleteStyles;
