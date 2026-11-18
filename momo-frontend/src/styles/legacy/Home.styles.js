import styled from "styled-components";

/* Home is an editorial cinema foyer: one feature story, then a browsable film shelf. */
export const HomePage = styled.div.attrs({ className: "home-page" })`
  --home-ink: #292820;
  --home-muted: #746D60;
  display: flex;
  flex-direction: column;
  gap: clamp(40px, 5.2vw, 72px);
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 0 28px;
  color: var(--home-ink);

  .home-favorites-empty {
    position: relative;
    display: grid;
    gap: 8px;
    min-height: 104px;
    align-content: center;
    padding: 22px 26px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.88);
    border-radius: 18px;
    background: linear-gradient(112deg, rgba(255,255,255,.82), rgba(255,250,236,.62));
    box-shadow: 0 3px 8px rgba(41,40,32,.035), 0 12px 28px rgba(41,40,32,.055), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(22px) saturate(145%);
    backdrop-filter: blur(22px) saturate(145%);
  }
  .home-favorites-empty::before {
    position: absolute; top: 18px; bottom: 18px; left: 0; width: 3px;
    content: ""; border-radius: 0 3px 3px 0; background: #859B89;
  }
  .home-favorites-empty strong { font-size: 15px; font-weight: 800; }
  .home-favorites-empty p { margin: 0; color: var(--home-muted); font-size: 13px; line-height: 1.7; }
  .home-favorites-more {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 40px; padding: 0 15px; border: 1px solid rgba(255,255,255,.92);
    border-radius: 999px; background: linear-gradient(145deg, rgba(255,255,255,.9), rgba(255,250,236,.64));
    box-shadow: 0 3px 8px rgba(41,40,32,.045), inset 0 1px rgba(255,255,255,1);
    color: #554718; font-size: 12px; font-weight: 800; cursor: pointer;
    -webkit-backdrop-filter: blur(18px) saturate(145%); backdrop-filter: blur(18px) saturate(145%);
    transition: border-color 200ms ease, box-shadow 200ms ease, background 200ms ease;
  }
  .home-favorites-more:hover {
    border-color: rgba(214,180,63,.7); background: rgba(255,255,255,.92);
    box-shadow: 0 7px 16px rgba(41,40,32,.085), inset 0 1px rgba(255,255,255,1);
  }
  @media (prefers-reduced-motion: reduce) {
    &, & * { scroll-behavior: auto; animation-duration: .01ms; animation-iteration-count: 1; transition-duration: .01ms; }
  }
`;

export const FeatureSection = styled.section.attrs({ className: "home-feature-section" })`
  position: relative; isolation: isolate; display: grid;
  grid-template-columns: minmax(310px, .82fr) minmax(0, 1.18fr);
  min-height: clamp(390px, 38vw, 500px); overflow: hidden;
  border: 1px solid rgba(255,255,255,.92); border-radius: 28px;
  background:
    radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.94), transparent 48%),
    linear-gradient(135deg, rgba(255,255,255,.78), rgba(255,250,236,.48) 56%, rgba(255,243,194,.34));
  box-shadow: 0 2px 5px rgba(41,40,32,.03), 0 24px 56px rgba(41,40,32,.095),
    inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(216,201,159,.18);
  -webkit-backdrop-filter: blur(28px) saturate(150%); backdrop-filter: blur(28px) saturate(150%);
  &::before {
    position: absolute; z-index: 3; inset: 0; content: ""; border-radius: inherit;
    background: linear-gradient(118deg, rgba(255,255,255,.2), transparent 36%, transparent 72%, rgba(255,255,255,.12));
    pointer-events: none;
  }
  @media (max-width: 820px) { grid-template-columns: 1fr; min-height: auto; }
`;

export const FeatureInfo = styled.div.attrs({ className: "home-feature-info" })`
  position: relative; z-index: 2; display: flex; flex-direction: column;
  justify-content: center; align-items: flex-start; padding: clamp(30px, 4.4vw, 62px);
  background: linear-gradient(145deg, rgba(255,255,255,.5), rgba(255,250,236,.22));
  border-right: 1px solid rgba(255,255,255,.55);
  &::after {
    position: absolute; right: 0; top: 16%; bottom: 16%; width: 1px;
    content: ""; background: linear-gradient(transparent, rgba(255,255,255,.94), transparent);
  }
  @media (max-width: 820px) { padding: 30px 28px 22px; border-right: 0; }
  @media (max-width: 420px) { padding: 25px 21px 18px; }
`;

export const Eyebrow = styled.span`
  display: inline-flex; align-items: center; gap: 9px; width: fit-content;
  margin-bottom: 22px; padding: 7px 11px;
  border: 1px solid rgba(183,151,50,.24); border-radius: 999px;
  background: rgba(255,212,59,.18); color: #75601D;
  font-size: 10px; font-weight: 850; letter-spacing: .13em;
  &::before {
    width: 6px; height: 6px; content: ""; border-radius: 50%;
    background: #C29B27; box-shadow: 0 0 0 3px rgba(255,212,59,.2);
  }
`;

export const FeatureTitle = styled.h1`
  margin: 0; color: #292820; font-size: clamp(31px, 3.6vw, 49px);
  font-weight: 850; line-height: 1.16; letter-spacing: -.058em; word-break: keep-all;
  & + & { margin-top: 2px; }
  &:last-of-type { color: #75601D; }
`;

export const FeatureDescription = styled.p`
  max-width: 28rem; margin: 20px 0 0; color: #635C50;
  font-size: 14px; line-height: 1.9; word-break: keep-all;
  br { display: block; content: ""; margin-top: 3px; }
`;

export const FeatureVisual = styled.div.attrs({ className: "home-feature-visual" })`
  position: relative; z-index: 1; min-width: 0; min-height: 390px;
  overflow: hidden; background: #24251F;
  .recommend-banner {
    position: absolute; inset: 0; width: 100%; min-height: 100%;
    overflow: hidden; border-radius: 0; background: #24251F;
  }
  .recommend-poster {
    position: absolute; inset: 0; width: 100%; height: 100%;
    display: block; object-fit: cover; object-position: center 28%;
    filter: saturate(.9); transition: filter 400ms ease, transform 650ms cubic-bezier(.2,.7,.2,1);
  }
  .recommend-overlay {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(90deg, rgba(20,20,17,.08), rgba(20,20,17,.12) 38%, rgba(20,20,17,.54)),
      linear-gradient(0deg, rgba(20,20,17,.52), transparent 64%);
  }
  .recommend-content {
    position: absolute; z-index: 2; right: clamp(22px, 4vw, 48px); bottom: clamp(22px, 4vw, 48px);
    width: min(78%, 450px); padding: clamp(20px, 2.4vw, 30px); color: #fff;
    border: 1px solid rgba(255,255,255,.56); border-radius: 21px;
    background: linear-gradient(140deg, rgba(255,255,255,.32), rgba(255,250,236,.12) 45%, rgba(255,255,255,.08)), rgba(31,30,25,.32);
    box-shadow: 0 16px 42px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.66), inset 0 -1px 0 rgba(255,255,255,.1);
    -webkit-backdrop-filter: blur(26px) saturate(155%); backdrop-filter: blur(26px) saturate(155%);
    &::before {
      position: absolute; inset: 1px; content: ""; border-radius: inherit;
      border-top: 1px solid rgba(255,255,255,.45); pointer-events: none;
    }
  }
  .recommend-label {
    display: inline-flex; align-items: center; min-height: 25px; margin-bottom: 12px; padding: 0 10px;
    border: 1px solid rgba(255,255,255,.38); border-radius: 999px; background: rgba(255,212,59,.94);
    color: #292820; font-size: 10px; font-weight: 850; letter-spacing: .05em;
  }
  .recommend-title {
    margin: 0; color: #fff; font-size: clamp(25px, 2.8vw, 36px); font-weight: 850;
    line-height: 1.18; letter-spacing: -.05em; word-break: keep-all; text-shadow: 0 2px 16px rgba(0,0,0,.18);
  }
  .recommend-info { margin: 9px 0 13px; color: rgba(255,255,255,.78); font-size: 12px; font-weight: 600; }
  .recommend-description { margin: 0 0 16px; color: rgba(255,255,255,.84); font-size: 12px; line-height: 1.75; }
  .recommend-button {
    min-height: 42px; padding: 0 16px; border: 1px solid rgba(255,255,255,.86); border-radius: 999px;
    background: linear-gradient(145deg, #FFE078, #FFD43B); color: #292820;
    font-size: 12px; font-weight: 850; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,.16), inset 0 1px rgba(255,255,255,.72);
    transition: box-shadow 180ms ease, filter 180ms ease;
  }
  .recommend-button:hover { filter: brightness(1.035) saturate(1.04); box-shadow: 0 8px 19px rgba(0,0,0,.23), inset 0 1px rgba(255,255,255,.92); }
  .recommend-state {
    position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; padding: 24px;
    background: linear-gradient(145deg, #35352E, #20211D); color: rgba(255,255,255,.76);
    text-align: center; font-size: 13px;
  }
  &:hover .recommend-poster { filter: saturate(1.02); }
  &:hover .recommend-content { border-color: rgba(255,255,255,.78); }
  @media (max-width: 820px) { min-height: 330px; height: 330px; }
  @media (max-width: 480px) {
    min-height: 340px; height: 340px;
    .recommend-content { left: 15px; right: 15px; bottom: 15px; width: auto; padding: 18px; }
    .recommend-title { font-size: 27px; }
    .recommend-description { display: none; }
  }
`;

export const Section = styled.section.attrs({ className: "home-section" })`
  min-width: 0; margin: 0; animation: momo-section-in 420ms cubic-bezier(.2,.7,.2,1) both;
  @keyframes momo-section-in { from { opacity: 0; transform: translate3d(0, 7px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
  &:nth-of-type(2) { animation-delay: 45ms; }
  &:nth-of-type(3) { animation-delay: 90ms; }
  &:nth-of-type(4) { animation-delay: 135ms; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const SectionHeading = styled.div.attrs({ className: "home-section-heading" })`
  display: flex; align-items: end; justify-content: space-between; gap: 20px;
  margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid rgba(154,138,101,.24);
  h2 { margin: 0; color: #292820; font-size: clamp(21px, 2.2vw, 27px); font-weight: 850; letter-spacing: -.045em; }
  p { margin: 6px 0 0; color: #6A6251; font-size: 12px; line-height: 1.6; }
  @media (max-width: 520px) { align-items: flex-start; flex-direction: column; gap: 9px; margin-bottom: 16px; }
`;

export const MoreText = styled.span`
  display: inline-flex; align-items: center; min-height: 28px; padding: 0 9px;
  border-left: 2px solid rgba(214,180,63,.72); color: #6A6251; font-size: 11px; font-weight: 700; white-space: nowrap;
`;

export const MovieGrid = styled.div.attrs({ className: "home-movie-grid" })`
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 22px 18px;
  @media (max-width: 1100px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (max-width: 760px) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px 12px; }
  @media (max-width: 480px) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 11px; }
`;

export const MovieCard = styled.div.attrs({ className: "home-movie-card" })`
  position: relative; min-width: 0; cursor: pointer; border-radius: 15px; outline-offset: 4px;
  transition: filter 240ms ease;
  &:hover { filter: drop-shadow(0 9px 12px rgba(41,40,32,.13)); }
  &:focus-visible { outline: 3px solid rgba(179,141,25,.7); }
`;

export const PosterWrap = styled.div.attrs({ className: "momo-home-poster-frame" })`
  position: relative; width: 100%; aspect-ratio: 2 / 2.86; overflow: hidden;
  border: 1px solid rgba(255,255,255,.88); border-radius: 13px;
  background: linear-gradient(145deg, #EAE4D7, #F8F4EA);
  box-shadow: 0 3px 7px rgba(41,40,32,.05), 0 12px 24px rgba(41,40,32,.11), inset 0 1px rgba(255,255,255,.98);
  transition: border-color 240ms ease, box-shadow 240ms ease;
  &::after {
    position: absolute; z-index: 1; inset: 0; content: ""; border-radius: inherit;
    background: linear-gradient(130deg, rgba(255,255,255,.2), transparent 38%, transparent 72%, rgba(0,0,0,.08));
    pointer-events: none;
  }
  img { display: block; width: 100%; height: 100%; object-fit: cover; transition: filter 260ms ease; }
  &:hover {
    border-color: rgba(255,255,255,1);
    box-shadow: 0 5px 10px rgba(41,40,32,.08), 0 16px 30px rgba(41,40,32,.14), inset 0 1px rgba(255,255,255,1);
  }
`;

export const Rank = styled.span`
  position: absolute; z-index: 3; left: 9px; bottom: 9px; display: grid; place-items: center;
  min-width: 31px; height: 31px; padding: 0 6px; border: 1px solid rgba(255,255,255,.62);
  border-radius: 9px; background: rgba(28,29,25,.62); box-shadow: 0 4px 10px rgba(0,0,0,.18), inset 0 1px rgba(255,255,255,.25);
  color: #fff; font-size: 13px; font-weight: 850; font-variant-numeric: tabular-nums;
  -webkit-backdrop-filter: blur(14px) saturate(135%); backdrop-filter: blur(14px) saturate(135%);
`;

export const MovieInfo = styled.div`
  min-width: 0; padding: 11px 2px 0;
  h3 { margin: 0; overflow: hidden; color: #292820; font-size: 13px; font-weight: 800; letter-spacing: -.025em; text-overflow: ellipsis; white-space: nowrap; }
  p { margin: 5px 0 0; color: #6A6251; font-size: 11px; font-weight: 550; }
`;

export const GenreList = styled.div.attrs({ className: "home-genre-list" })`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px;
  button {
    position: relative; display: flex; align-items: center; justify-content: space-between; gap: 10px;
    min-width: 0; min-height: 58px; padding: 0 17px; border: 1px solid rgba(255,255,255,.88);
    border-radius: 14px; background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(255,250,236,.54));
    box-shadow: 0 3px 8px rgba(41,40,32,.035), inset 0 1px rgba(255,255,255,.98), inset 0 -1px rgba(216,201,159,.12);
    color: #514C40; font-size: 13px; font-weight: 750; text-align: left; cursor: pointer;
    -webkit-backdrop-filter: blur(20px) saturate(140%); backdrop-filter: blur(20px) saturate(140%);
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
    &::after { content: "↗"; color: #80600E; font-size: 13px; }
    &:hover {
      border-color: rgba(214,180,63,.76);
      background: linear-gradient(145deg, rgba(255,255,255,.96), rgba(255,248,223,.74));
      box-shadow: 0 7px 16px rgba(41,40,32,.075), inset 0 1px rgba(255,255,255,1);
    }
    &:focus-visible { outline: 3px solid rgba(179,141,25,.7); outline-offset: 3px; }
  }
  @media (max-width: 680px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 360px) { gap: 8px; button { min-height: 52px; padding: 0 12px; font-size: 12px; } }
`;

export const BrandLine = styled.div.attrs({ className: "home-brand-line" })`
  position: relative; display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: clamp(22px, 3vw, 32px); overflow: hidden; border: 1px solid rgba(255,255,255,.92); border-radius: 22px;
  background: radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.9), transparent 55%), linear-gradient(125deg, rgba(255,250,236,.72), rgba(255,255,255,.52));
  box-shadow: 0 3px 8px rgba(41,40,32,.035), 0 16px 34px rgba(41,40,32,.07), inset 0 1px rgba(255,255,255,1);
  -webkit-backdrop-filter: blur(24px) saturate(145%); backdrop-filter: blur(24px) saturate(145%);
  &::before { position: absolute; top: 22px; bottom: 22px; left: 0; width: 3px; content: ""; border-radius: 0 3px 3px 0; background: var(--momo-accent); }
  h2 { margin: 0; color: #292820; font-size: clamp(18px, 2.3vw, 25px); font-weight: 850; letter-spacing: -.04em; }
  p { margin: 6px 0 0; color: #6A6251; font-size: 12px; line-height: 1.7; }
  @media (max-width: 600px) { align-items: flex-start; flex-direction: column; gap: 12px; }
`;

export const EmptyPoster = styled.div`
  display: flex; width: 100%; height: 100%; align-items: center; justify-content: center;
  color: #6A6251; background: linear-gradient(145deg, rgba(255,255,255,.35), rgba(229,222,207,.62));
  font-size: 12px; font-weight: 650;
`;
