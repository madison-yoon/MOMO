import styled from "styled-components";

/* MOMO 홈: 12-column spatial Bento. DOM 순서는 유지하고 화면에서 정보 우선순위에 맞게 재배치한다. */
export const HomePage = styled.div`
  --home-gap: clamp(14px, 1.55vw, 24px);
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: var(--home-gap);
  width: 100%;
  padding: 8px 0 clamp(56px, 7vw, 104px);
  color: var(--momo-text);

  > section:nth-of-type(1) {
    grid-column: 1 / span 7;
    grid-row: 1 / span 2;
  }

  > section:nth-of-type(2) {
    grid-column: 8 / -1;
    grid-row: 1;
  }

  > section:nth-of-type(3) {
    grid-column: 8 / -1;
    grid-row: 2;
  }

  > section:nth-of-type(4) {
    grid-column: 1 / -1;
    grid-row: 3;
  }

  > div:last-child {
    grid-column: 1 / -1;
    grid-row: 4;
  }

  > section:not(:first-child) {
    position: relative;
    min-width: 0;
    padding: clamp(20px, 2.2vw, 30px);
    overflow: hidden;
    border: 1px solid rgba(229, 222, 209, .86);
    border-radius: 24px;
    background:
      linear-gradient(145deg, rgba(255,255,255,.94), rgba(255,250,236,.82));
    box-shadow: 0 16px 38px rgba(54, 45, 28, .055), inset 0 1px 0 rgba(255,255,255,.95);
    backdrop-filter: blur(18px) saturate(125%);
  }

  > section:nth-of-type(2) {
    background:
      radial-gradient(ellipse at 100% 0%, rgba(255,212,59,.19), transparent 55%),
      linear-gradient(145deg, #FFFEFA, #F9F3E7);
  }

  > section:nth-of-type(3) {
    background:
      radial-gradient(ellipse at 0% 100%, rgba(214,166,20,.13), transparent 60%),
      rgba(255,254,250,.86);
  }

  > section:nth-of-type(2) > div:nth-child(2) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 12px;
  }

  > section:nth-of-type(4) > div:nth-child(2) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  @media (max-width: 1050px) {
    > section:nth-of-type(1) { grid-column: 1 / -1; grid-row: 1; }
    > section:nth-of-type(2) { grid-column: 1 / span 7; grid-row: 2; }
    > section:nth-of-type(3) { grid-column: 8 / -1; grid-row: 2; }
    > section:nth-of-type(4) { grid-column: 1 / -1; grid-row: 3; }
    > div:last-child { grid-row: 4; }
    > section:nth-of-type(2) > div:nth-child(2) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding-top: 0;

    > section:nth-of-type(1),
    > section:nth-of-type(2),
    > section:nth-of-type(3),
    > section:nth-of-type(4),
    > div:last-child {
      grid-column: 1;
      grid-row: auto;
    }

    > section:not(:first-child) {
      padding: 20px 16px;
      border-radius: 20px;
    }

    > section:nth-of-type(2) > div:nth-child(2) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    > section:nth-of-type(4) > div:nth-child(2) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;

export const FeatureSection = styled.section`
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(250px, .78fr) minmax(0, 1.22fr);
  min-height: clamp(520px, 48vw, 690px);
  align-items: stretch;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.82);
  border-radius: 30px;
  background:
    radial-gradient(circle at 12% 14%, rgba(255,212,59,.28), transparent 22rem),
    repeating-linear-gradient(0deg, rgba(126,103,55,.025) 0 1px, transparent 1px 5px),
    linear-gradient(145deg, #FFFDF7 0%, #F4EBD8 100%);
  box-shadow: 0 28px 70px rgba(54,45,28,.12), inset 0 1px 0 rgba(255,255,255,.9);

  &::before {
    content: "M";
    position: absolute;
    z-index: -1;
    left: -34px;
    bottom: -138px;
    color: rgba(214,166,20,.075);
    font-family: Georgia, serif;
    font-size: clamp(260px, 32vw, 470px);
    font-weight: 700;
    line-height: .8;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    z-index: 3;
    top: 18px;
    left: 18px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--momo-accent);
    box-shadow: 0 0 0 5px rgba(255,212,59,.18), 0 0 0 10px rgba(255,212,59,.08);
    pointer-events: none;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    min-height: auto;
    border-radius: 24px;
  }
`;

export const FeatureInfo = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(36px, 4vw, 62px) clamp(24px, 3vw, 44px);
  background: linear-gradient(115deg, rgba(255,254,250,.88), rgba(255,250,236,.38));

  &::after {
    content: "MOVIEMEMO / VOL. 01";
    position: absolute;
    left: clamp(24px, 3vw, 44px);
    bottom: 24px;
    color: rgba(81,76,64,.55);
    font: 700 9px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: .18em;
  }

  @media (max-width: 760px) { padding: 42px 26px 64px; }
`;

export const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  width: fit-content;
  margin-bottom: 22px;
  padding: 9px 13px;
  color: var(--momo-accent-ink);
  background: rgba(255,212,59,.22);
  border: 1px solid rgba(214,166,20,.28);
  border-radius: 6px 14px 14px 6px;
  font: 800 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: .13em;
  text-transform: uppercase;

  &::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--momo-accent-ink); }
`;

export const FeatureTitle = styled.h1`
  margin: 0;
  color: var(--momo-text);
  font-size: clamp(34px, 4.25vw, 62px);
  font-weight: 850;
  line-height: 1.08;
  letter-spacing: -.065em;
  word-break: keep-all;

  & + & { margin-top: 4px; color: #8B6A16; }
`;

export const FeatureDescription = styled.p`
  max-width: 30rem;
  margin: 22px 0 0;
  color: var(--momo-text-soft);
  font-size: 14px;
  line-height: 1.9;
  word-break: keep-all;
`;

export const FeatureVisual = styled.div`
  position: relative;
  min-width: 0;
  min-height: 520px;
  overflow: visible;
  background: #292820;

  .recommend-banner {
    position: absolute;
    inset: 22px 22px 22px -30px;
    width: auto;
    height: auto;
    min-height: 0;
    overflow: hidden;
    border: 8px solid rgba(255,254,250,.92);
    border-radius: 5px;
    background: #292820;
    box-shadow: 0 28px 56px rgba(32,26,15,.28), 0 0 0 1px rgba(41,40,32,.12);
    transform: rotate(1.7deg);
    transition: transform .55s cubic-bezier(.2,.7,.2,1), box-shadow .55s ease;
  }

  .recommend-banner::after {
    content: "MOMO SELECT";
    position: absolute;
    z-index: 4;
    top: 16px;
    right: 16px;
    padding: 7px 9px;
    color: #292820;
    background: rgba(255,250,236,.88);
    border: 1px solid rgba(255,255,255,.7);
    border-radius: 3px;
    font: 800 9px/1 ui-monospace, monospace;
    letter-spacing: .16em;
  }

  .recommend-poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 24%;
    filter: saturate(.86) contrast(1.04);
    transition: transform .8s cubic-bezier(.2,.7,.2,1), filter .5s ease;
  }

  .recommend-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(0deg, rgba(16,14,10,.88) 0%, rgba(16,14,10,.35) 42%, rgba(16,14,10,.04) 75%),
      linear-gradient(90deg, rgba(16,14,10,.28), transparent 70%);
  }

  .recommend-content {
    position: absolute;
    z-index: 2;
    left: 30px;
    right: 26px;
    bottom: 30px;
    width: auto;
    color: white;
  }

  .recommend-label {
    display: inline-flex;
    margin-bottom: 12px;
    padding: 7px 10px;
    border: 1px solid rgba(255,250,236,.42);
    border-radius: 3px;
    background: rgba(255,250,236,.92);
    color: #594400;
    font: 800 10px/1 ui-monospace, monospace;
    letter-spacing: .12em;
  }

  .recommend-title { font-size: clamp(24px, 2.7vw, 38px); line-height: 1.15; letter-spacing: -.04em; }
  .recommend-info { margin: 9px 0 14px; color: rgba(255,255,255,.78); font-size: 12px; }
  .recommend-button {
    min-height: 42px;
    padding: 0 17px;
    border: 1px solid rgba(255,255,255,.4);
    border-radius: 4px;
    color: #292820;
    background: #FFD43B;
    font-size: 12px;
    font-weight: 850;
    cursor: pointer;
    transition: transform .2s ease, background .2s ease;
  }
  .recommend-button:hover { transform: translateY(-2px); background: #FFE27A; }
  .recommend-state { position: absolute; inset: 0; display: grid; place-items: center; background: #E9E1D2; color: #514C40; }

  &:hover .recommend-banner { transform: rotate(0deg) translateY(-4px); box-shadow: 0 36px 68px rgba(32,26,15,.34); }
  &:hover .recommend-poster { transform: scale(1.045); filter: saturate(1); }

  @media (max-width: 760px) {
    min-height: 360px;
    height: 360px;
    .recommend-banner { inset: 14px 16px 20px; transform: rotate(.6deg); border-width: 6px; }
    .recommend-content { left: 20px; right: 18px; bottom: 22px; }
  }
`;

export const Section = styled.section`
  min-width: 0;
  margin: 0;
`;

export const SectionHeading = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;

  h2 { margin: 0; color: var(--momo-text); font-size: clamp(19px, 1.8vw, 25px); font-weight: 850; letter-spacing: -.05em; }
  p { margin: 6px 0 0; color: var(--momo-muted); font-size: 12px; line-height: 1.5; }
  &::after { content: "↗"; flex: 0 0 auto; color: rgba(118,90,10,.45); font-size: 17px; }
`;

export const MoreText = styled.span`
  color: var(--momo-muted);
  font: 700 9px/1.4 ui-monospace, monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px 16px;

  @media (max-width: 1000px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (max-width: 700px) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px 11px; }
  @media (max-width: 430px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

export const MovieCard = styled.div`
  position: relative;
  min-width: 0;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform .35s cubic-bezier(.2,.7,.2,1);

  &:hover { transform: translateY(-7px) rotateX(1.5deg); }
  &:focus-visible { outline: 2px solid var(--momo-link); outline-offset: 5px; border-radius: 10px; }
  &:hover img { transform: scale(1.055); }
`;

export const PosterWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 2.85;
  overflow: hidden;
  background: #E9E1D2;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 7px;
  box-shadow: 0 9px 20px rgba(54,45,28,.11), 0 2px 5px rgba(54,45,28,.06);
  transition: box-shadow .35s ease, border-color .35s ease;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 1px solid rgba(255,255,255,.12);
    background: linear-gradient(145deg, rgba(255,255,255,.13), transparent 32%, transparent 72%, rgba(20,16,8,.12));
  }

  img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .6s cubic-bezier(.2,.7,.2,1); }
  &:hover { box-shadow: 0 20px 34px rgba(54,45,28,.18); }
`;

export const Rank = styled.span`
  position: absolute;
  z-index: 2;
  left: 10px;
  bottom: 8px;
  color: white;
  font: italic 900 clamp(28px, 3vw, 42px)/1 Georgia, serif;
  text-shadow: 0 2px 12px rgba(0,0,0,.72);
`;

export const MovieInfo = styled.div`
  padding: 10px 2px 0;
  h3 { margin: 0; overflow: hidden; color: var(--momo-text); font-size: 13px; font-weight: 800; letter-spacing: -.025em; text-overflow: ellipsis; white-space: nowrap; }
  p { margin: 5px 0 0; color: var(--momo-muted); font: 10px/1.4 ui-monospace, monospace; }
`;

export const GenreList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  button {
    position: relative;
    min-height: 48px;
    padding: 10px 13px;
    overflow: hidden;
    border: 1px solid rgba(229,222,209,.92);
    border-radius: 5px 14px 5px 14px;
    color: var(--momo-text);
    background: linear-gradient(135deg, rgba(255,255,255,.94), rgba(255,250,236,.76));
    font-size: 12px;
    font-weight: 800;
    text-align: left;
    cursor: pointer;
    transition: transform .22s ease, background .22s ease, box-shadow .22s ease;
  }
  button::after { content: "↗"; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: rgba(118,90,10,.55); }
  button:hover { transform: translateY(-3px); background: #FFD43B; box-shadow: 0 8px 18px rgba(54,45,28,.1); }
`;

export const BrandLine = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 132px;
  padding: 28px clamp(24px, 4vw, 54px);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.78);
  border-radius: 22px;
  background:
    radial-gradient(circle at 85% 40%, rgba(255,212,59,.35), transparent 18rem),
    repeating-linear-gradient(90deg, rgba(81,76,64,.035) 0 1px, transparent 1px 6px),
    linear-gradient(115deg, #292820, #514C40);
  box-shadow: 0 22px 46px rgba(41,40,32,.16);
  color: #FFFAEC;

  &::after { content: "M"; position: absolute; right: 5%; bottom: -95px; color: rgba(255,212,59,.13); font: 700 230px/.8 Georgia,serif; pointer-events: none; }
  h2 { position: relative; z-index: 1; margin: 0; color: #FFFAEC; font-size: clamp(20px, 2.6vw, 30px); letter-spacing: -.05em; }
  p { position: relative; z-index: 1; margin: 8px 0 0; color: rgba(255,250,236,.68); font-size: 12px; }
  @media (max-width: 600px) { align-items: flex-start; flex-direction: column; }
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
