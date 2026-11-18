import styled from "styled-components";

/* A film-search desk: focused controls above a quiet, tactile poster library. */
const SearchPage = styled.div.attrs({ className: "search-page" })`
  --search-ink: #292820;
  --search-muted: #6A6251;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding-bottom: 60px;
  color: var(--search-ink);
`;

const SearchHeading = styled.div.attrs({ className: "search-page-heading" })`
  position: relative;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  min-height: 148px;
  margin-bottom: 28px;
  padding: clamp(24px, 3.4vw, 38px);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 22px;
  background:
    radial-gradient(ellipse at 8% 0%, rgba(255,255,255,.92), transparent 48%),
    linear-gradient(128deg, rgba(232,238,239,.82), rgba(255,250,236,.58));
  box-shadow: 0 2px 5px rgba(41,40,32,.03), 0 16px 38px rgba(41,40,32,.065), inset 0 1px rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(26px) saturate(145%);
  backdrop-filter: blur(26px) saturate(145%);
  &::before {
    position: absolute;
    top: 25px;
    bottom: 25px;
    left: 0;
    width: 3px;
    content: "";
    border-radius: 0 3px 3px 0;
    background: #748A91;
  }
  > * { position: relative; z-index: 1; min-width: 0; }
  h1 {
    margin: 0 0 8px;
    color: #292820;
    font-size: clamp(28px, 3.2vw, 39px);
    font-weight: 850;
    line-height: 1.15;
    letter-spacing: -.052em;
  }
  p { margin: 0; color: #6D6D64; font-size: 13px; line-height: 1.7; }
  @media (max-width: 600px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    padding: 25px 22px;
  }
`;

const SearchInput = styled.input`
  display: block;
  width: 100%;
  min-height: 62px;
  padding: 0 22px;
  box-sizing: border-box;
  border: 1px solid rgba(255,255,255,.94);
  border-radius: 17px;
  background:
    linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,250,236,.7));
  color: #292820;
  font: inherit;
  font-size: 15px;
  box-shadow: 0 3px 8px rgba(41,40,32,.035), 0 10px 26px rgba(41,40,32,.06),
    inset 0 1px rgba(255,255,255,1), inset 0 -1px rgba(216,201,159,.16);
  -webkit-backdrop-filter: blur(22px) saturate(145%);
  backdrop-filter: blur(22px) saturate(145%);
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  &:focus {
    border-color: rgba(179,141,25,.62);
    background: rgba(255,255,255,.94);
    box-shadow: 0 0 0 4px rgba(255,212,59,.16), 0 12px 28px rgba(41,40,32,.075),
      inset 0 1px rgba(255,255,255,1);
  }
  &::placeholder { color: #6A6251; }
`;

const MovieGrid = styled.div.attrs({ className: "search-movie-grid" })`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 23px 18px;
  margin-top: 30px;
  @media (max-width: 1080px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (max-width: 760px) { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 17px 12px; }
  @media (max-width: 480px) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 10px; }
`;

const MovieCard = styled.div.attrs({ className: "search-movie-card" })`
  position: relative;
  min-width: 0;
  padding: 7px 7px 11px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.86);
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(255,255,255,.7), rgba(255,250,236,.43));
  box-shadow: 0 3px 8px rgba(41,40,32,.04), 0 10px 20px rgba(41,40,32,.055), inset 0 1px rgba(255,255,255,.96);
  text-align: left;
  cursor: pointer;
  outline-offset: 4px;
  -webkit-backdrop-filter: blur(20px) saturate(145%);
  backdrop-filter: blur(20px) saturate(145%);
  animation: momo-search-in 260ms ease both;
  @keyframes momo-search-in { from { opacity: 0; } to { opacity: 1; } }
  transition: border-color 220ms ease, box-shadow 220ms ease, background 220ms ease;
  &:hover {
    border-color: rgba(255,255,255,1);
    background: linear-gradient(145deg, rgba(255,255,255,.86), rgba(255,250,236,.58));
    box-shadow: 0 6px 12px rgba(41,40,32,.05), 0 16px 30px rgba(41,40,32,.09),
      inset 0 1px rgba(255,255,255,1);
  }
  &:focus-visible { outline: 3px solid rgba(179,141,25,.68); }
  @media (prefers-reduced-motion: reduce) { animation: none; transition-duration: .01ms; }
`;

const Poster = styled.div.attrs({ className: "search-poster-frame" })`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 2.86;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.7);
  border-radius: 11px;
  background: linear-gradient(145deg, #EAE4D7, #F8F4EA);
  box-shadow: 0 5px 13px rgba(41,40,32,.09), inset 0 1px rgba(255,255,255,.8);
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: filter 220ms ease;
  }
  ${MovieCard}:hover & { box-shadow: 0 8px 18px rgba(41,40,32,.14), inset 0 1px rgba(255,255,255,.9); }
`;

const MovieInfo = styled.div`
  min-width: 0;
  padding: 11px 4px 0;
  h3 {
    margin: 0;
    overflow: hidden;
    color: #292820;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -.025em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p { margin: 5px 0 0; color: #6A6251; font-size: 11px; line-height: 1.5; }
`;

const SearchMessage = styled.div`
  display: grid;
  place-items: center;
  min-height: 220px;
  margin-top: 22px;
  padding: 32px;
  border: 1px solid rgba(255,255,255,.88);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(255,255,255,.78), rgba(255,250,236,.6));
  box-shadow: 0 8px 24px rgba(41,40,32,.055), inset 0 1px rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  backdrop-filter: blur(22px) saturate(140%);
  color: #6A6251;
  text-align: center;
  font-size: 14px;
  line-height: 1.8;
`;

const LoadingMessage = styled.div`
  padding: 35px 0;
  color: #6A6251;
  text-align: center;
  font-size: 13px;
`;

const RetryButton = styled.button`
  min-height: 40px;
  margin-top: 12px;
  padding: 0 16px;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 999px;
  background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,250,236,.68));
  box-shadow: 0 3px 8px rgba(41,40,32,.045), inset 0 1px rgba(255,255,255,.98);
  color: #66551A;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 180ms ease, box-shadow 180ms ease;
  &:hover { border-color: rgba(179,141,25,.6); box-shadow: 0 7px 15px rgba(41,40,32,.075), inset 0 1px rgba(255,255,255,1); }
`;

const ScrollSentinel = styled.div`
  width: 100%;
  height: 1px;
`;

export { SearchPage };
export { SearchHeading };
export { SearchInput };
export { MovieGrid };
export { MovieCard };
export { Poster };
export { MovieInfo };
export { SearchMessage };
export { LoadingMessage };
export { RetryButton };
export { ScrollSentinel };
