import styled from "styled-components";

const SearchPage = styled.div`
  position: relative;
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: clamp(24px, 4vw, 58px);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.82);
  border-radius: 30px;
  background:
    radial-gradient(ellipse at 100% 0%, rgba(255,212,59,.19), transparent 32rem),
    repeating-linear-gradient(0deg, rgba(91,78,50,.018) 0 1px, transparent 1px 5px),
    rgba(255,254,250,.7);
  box-shadow: 0 24px 58px rgba(54,45,28,.075);
  backdrop-filter: blur(18px) saturate(130%);

  &::after {
    content: "DISCOVER";
    position: absolute;
    top: 18px;
    right: 3%;
    color: rgba(118,90,10,.075);
    font: 900 clamp(58px, 10vw, 140px)/1 ui-monospace,monospace;
    letter-spacing: -.09em;
    pointer-events: none;
  }

  @media (max-width: 600px) { padding: 22px 15px; border-radius: 20px; }
`;

const SearchHeading = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0,1fr) minmax(260px,.72fr);
  align-items: end;
  gap: 28px;
  margin-bottom: 34px;

  h1 {
    margin: 0 0 12px;
    font-size: clamp(36px, 5vw, 66px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -.07em;
  }

  p { max-width: 420px; margin: 0; color: var(--momo-muted); font-size: 13px; line-height: 1.8; }

  @media (max-width: 760px) { grid-template-columns: 1fr; gap: 14px; }
`;

const SearchInput = styled.input`
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 60px;
  padding: 0 22px;
  box-sizing: border-box;
  border: 1px solid #D8CEBA;
  border-radius: 8px 18px 8px 18px;
  background: rgba(255,255,255,.9);
  color: var(--momo-text);
  font-size: 15px;
  outline: none;
  box-shadow: 0 12px 26px rgba(54,45,28,.075), inset 0 1px 0 #fff;
  transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;

  &:focus { border-color: #9C791B; box-shadow: 0 0 0 4px rgba(255,212,59,.2), 0 14px 28px rgba(54,45,28,.08); transform: translateY(-1px); }
  &::placeholder { color: var(--momo-placeholder); }
`;

const MovieGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(22px, 2.5vw, 34px) 18px;
  margin-top: 34px;

  @media (max-width: 1100px) { grid-template-columns: repeat(4, minmax(0,1fr)); }
  @media (max-width: 760px) { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 22px 12px; }
  @media (max-width: 430px) { grid-template-columns: repeat(2, minmax(0,1fr)); }
`;

const MovieCard = styled.div`
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  animation: appear .45s cubic-bezier(.2,.7,.2,1) both;
  transform-style: preserve-3d;

  @keyframes appear { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
  &:hover { transform: translateY(-7px) rotate(.6deg); }
  &:hover img { transform: scale(1.055); }
  &:focus-visible { outline: 2px solid var(--momo-link); outline-offset: 5px; border-radius: 8px; }
`;

const Poster = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 2.85;
  overflow: hidden;
  border: 7px solid rgba(255,255,255,.92);
  border-radius: 5px;
  background: #E9E1D2;
  box-shadow: 0 14px 28px rgba(41,40,32,.14), 0 2px 6px rgba(41,40,32,.08);

  img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .65s cubic-bezier(.2,.7,.2,1); }
`;

const MovieInfo = styled.div`
  padding: 12px 3px 0;
  h3 { margin: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--momo-text); font-size: 14px; font-weight: 850; letter-spacing: -.03em; }
  p { margin: 6px 0 0; color: var(--momo-muted); font: 10px/1.5 ui-monospace,monospace; }
`;

const SearchMessage = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  min-height: 260px;
  padding: 35px;
  border: 1px dashed rgba(118,90,10,.26);
  border-radius: 18px;
  background: rgba(255,250,236,.62);
  color: var(--momo-muted);
  font-size: 14px;
  text-align: center;
`;

const LoadingMessage = styled.div`
  padding: 35px 0;
  color: var(--momo-muted);
  font-size: 13px;
  text-align: center;
`;

const RetryButton = styled.button`
  min-height: 42px;
  margin-top: 12px;
  padding: 0 18px;
  border: 1px solid var(--momo-border);
  border-radius: 7px 14px 7px 14px;
  background: var(--momo-surface);
  color: var(--momo-text);
  cursor: pointer;
  &:hover { background: var(--momo-accent); border-color: #D6AD27; }
`;

const ScrollSentinel = styled.div`width: 100%; height: 1px;`;

export { SearchPage, SearchHeading, SearchInput, MovieGrid, MovieCard, Poster, MovieInfo, SearchMessage, LoadingMessage, RetryButton, ScrollSentinel };
