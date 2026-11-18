import styled from "styled-components";

/* 홈은 큰 장식보다 영화 발견과 기록 흐름을 먼저 보여준다. */
export const HomePage = styled.div.attrs({ className: "home-page" })`
  display: flex;
  flex-direction: column;
  gap: clamp(38px, 4.6vw, 62px);
  width: 100%;
  padding-bottom: 48px;
  color: var(--momo-text);
  perspective: 1200px;
  animation: momo-home-enter .52s cubic-bezier(.2,.72,.2,1) both;
  @keyframes momo-home-enter {
    from { opacity: 0; transform: translate3d(0, 12px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  > section, > div { min-width: 0; }
  .home-favorites-empty {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 22px;
    background:
      radial-gradient(ellipse at 50% -18%, rgba(255,255,255,.96), transparent 58%),
      linear-gradient(145deg, rgba(255,255,255,.68), rgba(255,250,236,.42)),
      rgba(255,250,236,.38);
    box-shadow:
      0 2px 5px rgba(68,55,27,.035),
      0 16px 34px rgba(68,55,27,.075),
      inset 0 1px 0 rgba(255,255,255,.98),
      inset 0 -1px 0 rgba(216,201,159,.22);
    backdrop-filter: blur(28px) saturate(155%);
    -webkit-backdrop-filter: blur(28px) saturate(155%);
  }
  .home-favorites-empty::before {
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    content: "";
    background: linear-gradient(90deg, transparent 4%, rgba(255,255,255,1) 50%, transparent 96%);
    pointer-events: none;
  }
  .home-favorites-empty > * { position: relative; }
  .home-favorites-more {
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 999px;
    background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(255,250,236,.58));
    box-shadow: 0 5px 12px rgba(53,43,24,.07), 0 1px 2px rgba(53,43,24,.04), inset 0 1px rgba(255,255,255,1);
    backdrop-filter: blur(18px) saturate(145%);
    -webkit-backdrop-filter: blur(18px) saturate(145%);
    transition: transform 220ms cubic-bezier(.2,.72,.2,1), box-shadow 220ms ease;
    &:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 12px 24px rgba(53,43,24,.12), inset 0 1px rgba(255,255,255,1); }
  }
`;

export const FeatureSection = styled.section`
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(260px, .72fr) minmax(0, 1.28fr);
  min-height: 350px;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.94);
  border-radius: 26px;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(255,255,255,.88), transparent 42%),
    linear-gradient(132deg, rgba(255,255,255,.65), rgba(255,250,236,.42) 58%, rgba(255,243,194,.32));
  box-shadow: 0 3px 8px rgba(39,43,39,.035), 0 20px 46px rgba(68,53,22,.11), inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.2);
  backdrop-filter: blur(28px) saturate(155%);
  -webkit-backdrop-filter: blur(28px) saturate(155%);
  transition: box-shadow 300ms ease, transform 300ms ease, border-color 300ms ease;
  &:hover {
    border-color: rgba(214,180,63,.48);
    box-shadow: 0 6px 12px rgba(39,43,39,.04), 0 30px 64px rgba(68,53,22,.16), inset 0 1px rgba(255,255,255,1);
    transform: perspective(1200px) translateY(-5px) rotateX(.6deg);
  }
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

export const FeatureInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: clamp(28px, 3.2vw, 44px);
  background: linear-gradient(145deg, rgba(255,255,255,.56), rgba(255,250,236,.3));
  backdrop-filter: blur(22px) saturate(145%);
  -webkit-backdrop-filter: blur(22px) saturate(145%);
  @media (max-width: 760px) { padding: 26px 24px 22px; }
`;

export const Eyebrow = styled.span`
  display: block;
  width: fit-content;
  margin-bottom: 14px;
  padding: 6px 10px;
  color: #4D6255;
  background: rgba(101,126,111,.13);
  border: 1px solid rgba(101,126,111,.24);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
`;

export const FeatureTitle = styled.h1`
  margin: 0;
  font-size: clamp(30px, 3.3vw, 46px);
  line-height: 1.2;
  letter-spacing: -.045em;
  font-weight: 850;
  color: var(--momo-text);
  word-break: keep-all;
`;

export const FeatureDescription = styled.p`
  margin: 16px 0 0;
  color: #59615A;
  max-width: 30rem;
  font-size: 14px;
  line-height: 1.8;
  word-break: keep-all;
`;

export const FeatureVisual = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 350px;
  overflow: hidden;
  background: #3A352A;
  .recommend-banner {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-height: 100%;
    overflow: hidden;
    border-radius: 0;
  }
  .recommend-poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-height: 100%;
    display: block;
    object-fit: cover;
    object-position: center 28%;
    transition: transform .55s cubic-bezier(.2,.7,.2,1);
  }
  .recommend-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(90deg, rgba(20,18,14,.72), rgba(20,18,14,.24) 62%, rgba(20,18,14,.02)),
      linear-gradient(0deg, rgba(20,18,14,.3), transparent 55%);
  }
  .recommend-content {
    position: absolute;
    z-index: 2;
    left: clamp(20px, 2.6vw, 34px);
    bottom: clamp(20px, 2.6vw, 34px);
    width: min(76%, 500px);
    padding: 20px 22px 19px;
    color: #fff;
    border: 1px solid rgba(255,255,255,.62);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(255,255,255,.31), rgba(255,250,230,.14)),
      rgba(31,27,21,.2);
    box-shadow: 0 16px 42px rgba(0,0,0,.24), 0 3px 8px rgba(0,0,0,.12), inset 0 1px rgba(255,255,255,.58);
    backdrop-filter: blur(22px) saturate(155%);
    -webkit-backdrop-filter: blur(18px) saturate(145%);
    animation: momo-glass-arrive .7s cubic-bezier(.2,.7,.2,1) both;
    &::before {
      position: absolute;
      top: -8px;
      right: 28px;
      width: 58px;
      height: 16px;
      content: "";
      border: 1px solid rgba(255,255,255,.3);
      background: rgba(255,255,255,.18);
      transform: rotate(3deg);
      pointer-events: none;
    }
    @keyframes momo-glass-arrive {
      from { opacity: 0; transform: translate3d(0, 14px, 0) scale(.985); }
      to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
    }
  }
  .recommend-label {
    display: inline-block;
    margin-bottom: 9px;
    padding: 5px 9px;
    border-radius: 999px;
    background: rgba(255, 212, 59, .96);
    box-shadow: 0 3px 12px rgba(0,0,0,.12);
    color: var(--momo-accent-ink);
    font-size: 11px;
    font-weight: 850;
  }
  .recommend-title {
    margin: 0;
    font-size: clamp(24px, 2.7vw, 36px);
    font-weight: 850;
    line-height: 1.2;
    letter-spacing: -.035em;
    word-break: keep-all;
  }
  .recommend-info {
    margin: 8px 0 13px;
    color: rgba(255,255,255,.82);
    font-size: 13px;
  }
  .recommend-button {
    min-height: 40px;
    padding: 9px 15px;
    border: 1px solid var(--momo-accent);
    background: var(--momo-accent);
    color: var(--momo-accent-ink);
    font-size: 12px;
    font-weight: 850;
    border-radius: 7px;
    cursor: pointer;
    border-radius: 999px;
    box-shadow: 0 5px 16px rgba(0,0,0,.16), inset 0 1px rgba(255,255,255,.55);
    transition: background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
  }
  .recommend-button:hover {
    background: var(--momo-accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,.2);
  }
  .recommend-state {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #F0EBDD;
    color: var(--momo-muted);
    font-size: 14px;
    font-weight: 650;
  }
  &::after {
    position: absolute;
    z-index: 1;
    inset: 0;
    content: "";
    pointer-events: none;
    background: linear-gradient(115deg, transparent 25%, rgba(255,255,255,.13) 45%, transparent 63%);
    transform: translateX(-110%);
    transition: transform .9s cubic-bezier(.2,.7,.2,1);
  }
  &:hover .recommend-poster { transform: scale(1.055); }
  &:hover .recommend-content { box-shadow: 0 18px 44px rgba(0,0,0,.22), inset 0 1px rgba(255,255,255,.5); }
  &:hover::after { transform: translateX(110%); }
  @media (max-width: 760px) {
    min-height: 300px;
    height: 300px;
    .recommend-content {
      left: 14px;
      bottom: 14px;
      width: calc(100% - 28px);
      padding: 16px;
      box-sizing: border-box;
    }
    .recommend-title { font-size: 26px; }
  }
`;

export const Section = styled.section`
  min-width: 0;
  margin: 0;
  animation: momo-section-rise .58s cubic-bezier(.2,.7,.2,1) both;
  @keyframes momo-section-rise {
    from { opacity: 0; transform: translate3d(0, 16px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  &:nth-of-type(2) { animation-delay: 70ms; }
  &:nth-of-type(3) { animation-delay: 140ms; }
  &:nth-of-type(4) { animation-delay: 210ms; }
`;

export const SectionHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 18px;
  margin-bottom: 20px;
  padding-bottom: 13px;
  border-bottom: 1px solid rgba(172,153,113,.34);
  position: relative;
  h2 {
    margin: 0;
    font-size: clamp(21px, 2vw, 26px);
    letter-spacing: -.04em;
    font-weight: 850;
    color: var(--momo-text);
  }
  p { margin: 5px 0 0; color: var(--momo-muted); font-size: 13px; }
  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }
`;

export const MoreText = styled.span`
  color: var(--momo-muted);
  font-size: 12px;
  white-space: nowrap;
`;

export const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px 18px;
  @media (max-width: 1050px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (max-width: 720px) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 13px; }
  @media (max-width: 460px) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 12px; }
`;

export const MovieCard = styled.div`
  min-width: 0;
  cursor: pointer;
  transform: translateZ(0);
  transform-style: preserve-3d;
  transition: transform 280ms cubic-bezier(.2,.7,.2,1), filter 280ms ease;
  &:hover { transform: perspective(1000px) translateY(-7px) rotateX(1deg); filter: drop-shadow(0 12px 12px rgba(54,45,28,.08)); }
  &:hover img { transform: scale(1.065); }
  &:focus-visible { outline: 2px solid var(--momo-link); outline-offset: 5px; }
`;

export const PosterWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 2.85;
  overflow: hidden;
  background: var(--momo-note);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.96);
  box-shadow: 0 2px 4px rgba(54,45,28,.06), 0 12px 24px rgba(54,45,28,.13), inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.18);
  transition: border-color 280ms ease, box-shadow 280ms ease, transform 280ms ease;
  transform: perspective(900px) rotateX(0deg) translateZ(0);
  transform-style: preserve-3d;
  &::after {
    position: absolute;
    z-index: 1;
    inset: 0;
    content: "";
    pointer-events: none;
    background: linear-gradient(125deg, rgba(255,255,255,.28), transparent 32%, transparent 68%, rgba(0,0,0,.08));
    opacity: .72;
    transition: opacity 240ms ease;
  }
  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform .42s cubic-bezier(.2,.7,.2,1);
  }
  &:hover {
    border-color: rgba(105,128,115,.55);
    box-shadow: 0 5px 10px rgba(54,45,28,.07), 0 22px 34px rgba(54,45,28,.2), inset 0 1px rgba(255,255,255,1);
    transform: perspective(1000px) rotateX(2deg) translateY(-4px) translateZ(3px);
  }
  &:hover::after { opacity: .28; }
`;

export const Rank = styled.span`
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255,255,255,.58);
  border-radius: 7px;
  background: rgba(29,36,32,.74);
  box-shadow: 0 5px 11px rgba(18,24,20,.2), inset 0 1px rgba(255,255,255,.24);
  color: #FFFFFF;
  font-size: 15px;
  line-height: 1;
  font-weight: 850;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 200ms ease, background 200ms ease;
`;

export const MovieInfo = styled.div`
  padding-top: 10px;
  h3 {
    margin: 0;
    overflow: hidden;
    color: var(--momo-text);
    font-size: 14px;
    font-weight: 780;
    letter-spacing: -.025em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p { margin: 5px 0 0; color: var(--momo-muted); font-size: 12px; }
`;

export const GenreList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 54px;
    padding: 0 16px;
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 16px;
    background:
      linear-gradient(90deg, transparent 0 15px, rgba(201,117,104,.13) 15px 16px, transparent 16px),
      repeating-linear-gradient(0deg, transparent 0 26px, rgba(117,145,177,.08) 27px, transparent 28px),
      radial-gradient(ellipse at 15% 0%, rgba(255,255,255,.98), transparent 58%),
      linear-gradient(145deg, rgba(255,255,255,.66), rgba(255,250,236,.42));
    box-shadow: 0 2px 4px rgba(54,45,28,.04), 0 9px 20px rgba(54,45,28,.09), inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.2);
    backdrop-filter: blur(22px) saturate(150%);
    -webkit-backdrop-filter: blur(22px) saturate(150%);
    transform: perspective(800px) translateZ(0);
    transition: transform 240ms cubic-bezier(.2,.72,.2,1), box-shadow 240ms ease, border-color 240ms ease;
    -webkit-backdrop-filter: blur(10px);
    color: var(--momo-text-soft);
    font-size: 14px;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
    transition: border-color var(--momo-transition-fast), background var(--momo-transition-fast), transform var(--momo-transition-fast);
    &::after { content: "↗"; color: var(--momo-muted); font-size: 13px; }
    &:hover {
      border-color: rgba(214,180,63,.72);
      background:
        linear-gradient(145deg, rgba(255,255,255,.9), rgba(255,248,223,.78)),
        #FFF8DF;
      transform: perspective(800px) translateY(-4px) translateZ(2px);
      box-shadow: 0 3px 7px rgba(54,45,28,.045), 0 15px 26px rgba(54,45,28,.13), inset 0 1px rgba(255,255,255,1);
    }
  }
  @media (max-width: 600px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

export const BrandLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.98);
  border-radius: 22px;
  color: var(--momo-text);
  background:
    linear-gradient(90deg, transparent 0 28px, rgba(201,117,104,.16) 28px 29px, transparent 29px),
    repeating-linear-gradient(0deg, transparent 0 29px, rgba(117,145,177,.09) 30px, transparent 31px),
    radial-gradient(ellipse at 10% 0%, rgba(255,255,255,.95), transparent 48%),
    linear-gradient(145deg, rgba(255,255,255,.66), rgba(255,246,218,.58));
  box-shadow: 0 2px 5px rgba(64,51,30,.035), 0 18px 38px rgba(64,51,30,.12), inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.24);
  backdrop-filter: blur(28px) saturate(150%);
  -webkit-backdrop-filter: blur(28px) saturate(150%);
  transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
  &:hover { transform: perspective(1000px) translateY(-3px) rotateX(.35deg); box-shadow: 0 4px 8px rgba(64,51,30,.04), 0 26px 50px rgba(64,51,30,.16), inset 0 1px rgba(255,255,255,1); }
  h2 {
    margin: 0;
    font-size: clamp(19px, 2.4vw, 25px);
    letter-spacing: -.04em;
    font-weight: 800;
    color: var(--momo-text);
  }
  p { margin: 5px 0 0; color: var(--momo-muted); font-size: 13px; }
  @media (max-width: 600px) { align-items: flex-start; flex-direction: column; padding: 22px; }
`;

export const EmptyPoster = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--momo-muted);
  font-size: 12px;
  font-weight: 600;
`;
