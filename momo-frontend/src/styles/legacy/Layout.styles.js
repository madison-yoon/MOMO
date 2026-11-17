import styled from "styled-components";
import { Link } from "react-router-dom";

const Container = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: clip;
  isolation: isolate;
  background:
    radial-gradient(ellipse at 8% 4%, rgba(255,212,59,.16), transparent 34rem),
    radial-gradient(ellipse at 94% 42%, rgba(194,177,139,.13), transparent 36rem),
    repeating-linear-gradient(0deg, rgba(91,78,50,.018) 0 1px, transparent 1px 4px),
    var(--momo-bg);
  color: var(--momo-text);
  letter-spacing: -.012em;

  &::before {
    content: "";
    position: fixed;
    z-index: -1;
    top: 0;
    right: max(2vw, 18px);
    width: 1px;
    height: 100vh;
    background: linear-gradient(transparent, rgba(118,90,10,.16), transparent);
    pointer-events: none;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 12px;
  z-index: 100;
  display: grid;
  grid-template-columns: auto minmax(220px, 1fr) auto;
  align-items: center;
  gap: clamp(16px, 2.2vw, 34px);
  width: calc(100% - 2 * clamp(12px, 3vw, 44px));
  max-width: 1500px;
  min-height: 82px;
  margin: 14px auto 0;
  padding: 12px clamp(18px, 2.4vw, 36px);
  box-sizing: border-box;
  border: 1px solid rgba(255,255,255,.88);
  border-radius: 20px;
  background: rgba(255,254,250,.76);
  box-shadow: 0 14px 38px rgba(54,45,28,.075), inset 0 1px 0 rgba(255,255,255,.95);
  backdrop-filter: blur(24px) saturate(145%);
  -webkit-backdrop-filter: blur(24px) saturate(145%);

  @media (max-width: 980px) {
    grid-template-columns: auto minmax(180px, 1fr);
    gap: 12px;
  }

  @media (max-width: 680px) {
    position: relative;
    top: 0;
    grid-template-columns: 1fr auto;
    width: calc(100% - 20px);
    min-height: 0;
    margin-top: 10px;
    padding: 13px 15px;
    gap: 12px;
    border-radius: 17px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-right: clamp(12px, 1.8vw, 26px);
  border-right: 1px solid rgba(229,222,209,.9);

  @media (max-width: 680px) { border-right: 0; padding-right: 0; }
`;

const LogoImage = styled.img`
  display: block;
  width: auto;
  height: 38px;
  object-fit: contain;
  filter: drop-shadow(0 2px 1px rgba(41,40,32,.04));

  @media (max-width: 680px) { height: 32px; }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;

  a {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 13px;
    border-radius: 7px;
    color: var(--momo-muted);
    text-decoration: none;
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
    transition: color .2s ease, background .2s ease, transform .2s ease;
  }

  a:hover { color: var(--momo-text); background: rgba(255,212,59,.17); }
  a.active { color: var(--momo-accent-ink); background: rgba(255,212,59,.34); }
  a.active::after { content: ""; position: absolute; left: 13px; right: 13px; bottom: 5px; height: 2px; border-radius: 2px; background: var(--momo-accent-ink); }

  @media (max-width: 980px) {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: center;
    padding-top: 7px;
    border-top: 1px solid rgba(229,222,209,.65);
  }

  @media (max-width: 680px) {
    grid-column: 1 / -1;
    grid-row: 3;
    justify-content: flex-start;
    overflow-x: auto;
    padding-top: 8px;
    margin: 0 -2px -2px;
    border-top: 1px solid rgba(229,222,209,.65);
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    a { min-height: 36px; padding: 0 11px; font-size: 11px; }
  }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  white-space: nowrap;
  font-size: 12px;

  p { margin: 0 0 0 4px; color: var(--momo-muted); }
  p strong { color: var(--momo-text); font-weight: 850; }

  @media (max-width: 680px) {
    grid-column: 2;
    grid-row: 1;
    gap: 5px;
    p { display: none; }
    a { min-height: 34px; padding: 0 9px; font-size: 11px; }
  }
`;

const ActionButton = styled.button`
  min-height: 40px;
  padding: 0 17px;
  border: 1px solid #D6AD27;
  border-radius: 7px;
  background: linear-gradient(135deg, #FFE47C, #FFD43B);
  color: #594400;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: -.01em;
  cursor: pointer;
  box-shadow: 0 5px 12px rgba(140,105,0,.13), inset 0 1px 0 rgba(255,255,255,.72);
  transition: transform .2s ease, box-shadow .2s ease;

  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(140,105,0,.19); }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { cursor: not-allowed; opacity: .55; }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
  padding: clamp(28px, 3.3vw, 52px) clamp(18px, 4.1vw, 64px) clamp(68px, 7vw, 104px);
  box-sizing: border-box;

  @media (max-width: 680px) { padding: 22px 14px 56px; }
`;

const Footer = styled.footer`
  position: relative;
  padding: 58px clamp(18px, 5vw, 80px) 26px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 88% 0%, rgba(255,212,59,.17), transparent 28rem),
    linear-gradient(135deg, #292820, #403B2E);
  color: #FFFAEC;
  border-top: 1px solid rgba(255,255,255,.12);
  box-sizing: border-box;

  &::before {
    content: "MOMO";
    position: absolute;
    right: 4%;
    top: -72px;
    color: rgba(255,250,236,.035);
    font: 900 clamp(100px, 18vw, 250px)/1 Arial,sans-serif;
    letter-spacing: -.1em;
    pointer-events: none;
  }
`;

const FooterContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto 36px;
  padding-bottom: 34px;
  border-bottom: 1px solid rgba(255,250,236,.17);
  box-sizing: border-box;

  @media (max-width: 768px) { flex-direction: column; gap: 28px; }
`;

const FooterLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
`;

const FooterLogo = styled.img`
  display: block;
  width: auto;
  height: 30px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: .92;
`;

const FooterDesc = styled.p`
  max-width: 400px;
  margin: 0;
  color: rgba(255,250,236,.66);
  font-size: 13px;
  line-height: 1.8;
  word-break: keep-all;
`;

const FooterRight = styled.div`
  display: flex;
  gap: clamp(28px, 5vw, 76px);
  @media (max-width: 480px) { flex-wrap: wrap; gap: 26px; }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;

  h4 { margin: 0 0 5px; color: #FFD43B; font: 800 10px/1.2 ui-monospace,monospace; letter-spacing: .15em; text-transform: uppercase; }
  span, a { color: rgba(255,250,236,.66); font-size: 12px; text-decoration: none; transition: color .18s ease; }
  a:hover { color: #FFD43B; }
`;

const FooterBottom = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  color: rgba(255,250,236,.42);
  font: 10px/1.5 ui-monospace,monospace;
  letter-spacing: .04em;
  box-sizing: border-box;

  p { margin: 0; }
  @media (max-width: 600px) { flex-direction: column; align-items: flex-start; gap: 7px; }
`;

export { Container, Header, Logo, LogoImage, Navigation, UserArea, ActionButton, Main, Footer, FooterContainer, FooterLeft, FooterLogo, FooterDesc, FooterRight, FooterColumn, FooterBottom };
