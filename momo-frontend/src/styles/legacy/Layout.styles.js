import styled from "styled-components";
import { Link } from "react-router-dom";

/* Shared shell: a stable glass masthead, roomy canvas and restrained archive footer. */
const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: clip;
  isolation: isolate;
  color: var(--momo-text);
  background: transparent;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(12px, 1.6vw, 24px);
  width: 100%;
  min-height: 78px;
  padding: 0 clamp(18px, 4vw, 52px);
  box-sizing: border-box;
  border-bottom: 1px solid rgba(255,255,255,.86);
  background:
    linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,250,236,.66));
  box-shadow: 0 8px 28px rgba(41,40,32,.065), inset 0 1px 0 rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(30px) saturate(155%);
  backdrop-filter: blur(30px) saturate(155%);
  &::before {
    position: absolute;
    bottom: 0;
    left: clamp(20px, 4vw, 52px);
    right: clamp(20px, 4vw, 52px);
    height: 1px;
    content: "";
    background: linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent);
    pointer-events: none;
  }
  @media (max-width: 980px) {
    min-height: 72px;
    padding: 10px 20px;
    flex-wrap: wrap;
    gap: 9px 16px;
  }
  @media (max-width: 600px) {
    padding: 10px 14px 8px;
    gap: 8px 10px;
  }
`;

const Logo = styled(Link)`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  text-decoration: none;
  outline-offset: 5px;
  transition: filter 180ms ease;
  &:hover { filter: drop-shadow(0 3px 5px rgba(66,52,29,.14)); }
  &:focus-visible { outline: 3px solid rgba(179,141,25,.68); border-radius: 5px; }
`;

const LogoImage = styled.img`
  display: block;
  width: auto;
  height: 34px;
  object-fit: contain;
  @media (max-width: 600px) { height: 29px; }
`;

const Navigation = styled.nav`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 1 auto;
  min-width: 0;
  gap: 5px;
  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 39px;
    padding: 0 13px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    color: #635C50;
    text-decoration: none;
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
    transition: color 180ms ease, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
    &:hover {
      color: #51400F;
      border-color: rgba(255,255,255,.88);
      background: rgba(255,255,255,.56);
      box-shadow: inset 0 1px rgba(255,255,255,.98), 0 3px 10px rgba(41,40,32,.045);
    }
    &:focus-visible { outline: 3px solid rgba(179,141,25,.68); outline-offset: 2px; }
  }
  a.active {
    color: #51400F;
    border-color: rgba(214,180,63,.38);
    background: rgba(255,212,59,.22);
    box-shadow: inset 0 1px rgba(255,255,255,.9);
    font-weight: 850;
  }
  @media (max-width: 980px) {
    order: 4;
    flex: 1 0 100%;
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding: 5px 0 2px;
    border-top: 1px solid rgba(229,222,207,.58);
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    a { min-height: 34px; padding: 0 12px; }
  }
  @media (max-width: 600px) { gap: 2px; a { font-size: 11px; padding: 0 10px; } }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  white-space: nowrap;
  font-size: 12px;
  p { margin: 0 2px 0 5px; color: #6A6251; }
  p strong { color: #292820; font-weight: 850; }
  @media (max-width: 600px) { margin-left: auto; gap: 5px; font-size: 11px; p { display: none; } }
`;

const ActionButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 15px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.88);
  border-radius: 999px;
  background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,250,236,.68));
  color: #514C40;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(41,40,32,.04), inset 0 1px rgba(255,255,255,.98);
  transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease;
  &::before {
    position: absolute;
    top: 1px;
    left: 15%;
    width: 70%;
    height: 1px;
    content: "";
    background: linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent);
    pointer-events: none;
  }
  &:hover:not(:disabled) {
    border-color: rgba(214,180,63,.58);
    background: rgba(255,255,255,.94);
    color: #66510F;
    box-shadow: 0 5px 13px rgba(41,40,32,.075), inset 0 1px rgba(255,255,255,1);
  }
  &:active:not(:disabled) { transform: scale(.985); box-shadow: inset 0 2px 4px rgba(41,40,32,.08); }
  &:focus-visible { outline: 3px solid rgba(179,141,25,.68); outline-offset: 3px; }
  &:disabled { cursor: not-allowed; opacity: .58; }
  &.momo-logout-button {
    min-height: 33px;
    padding: 0 12px;
    border-color: rgba(216,201,159,.58);
    background: rgba(255,254,250,.34);
    color: #6A6251;
    font-size: 10px;
    font-weight: 700;
    box-shadow: inset 0 1px rgba(255,255,255,.82);
  }
  &.momo-logout-button:hover:not(:disabled) {
    border-color: rgba(179,141,25,.45);
    background: rgba(255,250,236,.86);
    color: #514C40;
    box-shadow: 0 4px 10px rgba(41,40,32,.055), inset 0 1px rgba(255,255,255,.98);
  }
  @media (max-width: 600px) { min-height: 34px; padding: 0 11px; }
`;

const Main = styled.main`
  position: relative;
  flex: 1;
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: clamp(28px, 3.7vw, 52px) var(--momo-page-gutter) 80px;
  box-sizing: border-box;
  @media (max-width: 600px) { padding-top: 22px; padding-bottom: 48px; }
`;

const Footer = styled.footer`
  position: relative;
  width: 100%;
  padding: 42px var(--momo-page-gutter) 24px;
  overflow: hidden;
  box-sizing: border-box;
  isolation: isolate;
  border-top: 1px solid rgba(255,255,255,.88);
  background: linear-gradient(135deg, rgba(255,255,255,.62), rgba(247,249,246,.46) 52%, rgba(238,241,234,.48));
  color: #292820;
  box-shadow: 0 -8px 26px rgba(41,40,32,.045), inset 0 1px rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(28px) saturate(145%);
  backdrop-filter: blur(28px) saturate(145%);
  &::before { display: none; }
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 36px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,.64);
  box-sizing: border-box;
  @media (max-width: 768px) { flex-direction: column; align-items: flex-start; gap: 22px; }
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  @media (max-width: 600px) { flex-direction: column; align-items: flex-start; gap: 11px; }
`;

const FooterLogo = styled.img`
  display: block;
  width: auto;
  height: 27px;
  object-fit: contain;
  flex-shrink: 0;
`;

const FooterDesc = styled.p`
  max-width: 420px;
  margin: 0;
  color: #514C40;
  font-size: 12px;
  line-height: 1.75;
`;

const FooterRight = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 38px;
  @media (max-width: 600px) { gap: 32px; }
`;

const FooterColumn = styled.div`
  display: grid;
  align-content: start;
  gap: 9px;
  min-width: 105px;
  h4 { margin: 0 0 4px; color: #292820; font-size: 11px; font-weight: 850; letter-spacing: .08em; }
  a {
    width: fit-content;
    color: #514C40;
    font-size: 11px;
    text-decoration: none;
    transition: color 150ms ease;
    &:hover { color: #66510F; text-decoration: underline; text-underline-offset: 3px; }
    &:focus-visible { outline: 2px solid rgba(179,141,25,.68); outline-offset: 3px; }
  }
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  color: #514C40;
  font-size: 10px;
  p { margin: 0; }
  @media (max-width: 600px) { flex-direction: column; gap: 7px; text-align: center; }
`;

export { Container };
export { Header };
export { Logo };
export { LogoImage };
export { Navigation };
export { UserArea };
export { ActionButton };
export { Main };
export { Footer };
export { FooterContainer };
export { FooterLeft };
export { FooterLogo };
export { FooterDesc };
export { FooterRight };
export { FooterColumn };
export { FooterBottom };
