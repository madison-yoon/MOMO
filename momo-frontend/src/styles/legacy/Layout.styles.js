import styled from "styled-components";
import { Link } from "react-router-dom";
import { archivePageTheme } from "../redesign/ArchivePages.styles";
import { homeRedesignTheme, cinemaCharcoalTheme } from "../redesign/HomeTheme.styles";
import { cinemaCharcoalTokens, cinemaCharcoalControls } from "../redesign/CinemaCharcoal.tokens";

// 원본 테마를 남기고 홈과 지정한 리디자인 화면에서만 새 디자인 변수를 활성화한다.
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--momo-bg, #303030);
  color: var(--momo-text, #F0ECE6);
  letter-spacing: -0.01em;

  ${({ $homeRedesign }) => $homeRedesign && homeRedesignTheme}
  ${({ $archiveRedesign }) => $archiveRedesign && archivePageTheme}
  ${({ $homeRedesign }) => $homeRedesign && cinemaCharcoalTheme}
  ${({ $homeRedesign }) => !$homeRedesign && cinemaCharcoalTokens}
  ${({ $homeRedesign }) => !$homeRedesign && cinemaCharcoalControls}
`;

// ========================================
// 헤더
// ========================================

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: var(--home-header-height, 76px);
  padding: var(--home-header-padding, 0 8%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background-color: var(--home-header-bg, #ffffff);
  border-bottom: 1px solid var(--home-header-border, #e2dbd0);
  box-sizing: border-box;
  box-shadow: 0 4px 20px -4px rgba(45, 38, 26, 0.03);
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const LogoImage = styled.img`
  display: block;
  width: auto;
  height: 38px;
  filter: var(--home-logo-filter, none);
  object-fit: contain;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 24px;

  a {
    color: var(--home-nav-color, #787062);
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: color 0.15s ease;

    &:hover {
      color: var(--home-nav-active, #1c1a17);
    }
  }

  a.active {
    color: var(--home-nav-active, #1c1a17);
    font-weight: 800;
  }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap;
  font-size: 14px;
  color: var(--home-nav-color, #1c1a17);
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid var(--home-action-border, #e2dbd0);
  border-radius: 8px;
  background-color: var(--home-action-bg, #ffffff);
  color: var(--home-action-color, #1c1a17);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--home-action-hover, #fffaec);
    border-color: var(--home-action-border, #ffd43b);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: var(--home-main-padding, 40px 8%);
  width: var(--home-main-width, 100%);
  max-width: var(--home-main-max, none);
  margin: 0 auto;
  box-sizing: border-box;
`;

// ========================================
// 푸터
// ========================================

const Footer = styled.footer`
  padding: var(--home-footer-padding, 44px 8%);
  background-color: var(--home-footer-bg, #efe8da);
  color: var(--home-footer-text, #595042);
  border-top: 1px solid var(--home-footer-border, #e2dbd0);
  box-sizing: border-box;
  width: 100%;
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--home-footer-border, #e2dbd0);
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const FooterLogo = styled.img`
  display: block;
  width: auto;
  height: 28px;
  object-fit: contain;
  filter: var(--home-footer-logo-filter, none);
  flex-shrink: 0;
`;

const FooterDesc = styled.p`
  margin: 0;
  color: var(--home-footer-text, #787062);
  font-size: 13px;
  line-height: 1.5;
  max-width: 380px;
  word-break: keep-all;
  border-left: 1px solid var(--home-footer-border, #e2dbd0);
  padding-left: 20px;

  @media (max-width: 600px) {
    border-left: none;
    padding-left: 0;
  }
`;

const FooterRight = styled.div`
  display: flex;
  gap: 48px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  h4 {
    margin: 0 0 4px;
    font-size: 13px;
    font-weight: 800;
    color: var(--home-footer-heading, #1c1a17);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  span,
  a {
    color: var(--home-footer-text, #787062);
    font-size: 13px;
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
      color: var(--home-footer-heading, #1c1a17);
    }
  }
`;

const FooterBottom = styled.div`
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--home-footer-text, #948b7c);
  box-sizing: border-box;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
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
