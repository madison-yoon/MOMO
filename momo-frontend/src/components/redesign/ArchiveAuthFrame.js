import React from "react";
import { Link } from "react-router-dom";
import MovieSearchAutocomplete from "../common/MovieSearchAutocomplete";
import logo from "../../textlogo.png";
import { Container, Header, Logo, LogoImage, Navigation, Main, Footer, FooterContainer, FooterLeft, FooterLogo, FooterDesc, FooterBottom } from "../../styles/legacy/Layout.styles";

// 인증 요청을 수행하는 Layout을 중복 실행하지 않고 기존 시각 요소만 인증 화면에 재사용한다.
export default function ArchiveAuthFrame({ children }) {
  return <Container $archiveRedesign>
    <Header><Logo to="/"><LogoImage src={logo} alt="MOMO" /></Logo><MovieSearchAutocomplete /><Navigation><Link to="/">홈</Link><Link to="/reviews">전체 리뷰</Link></Navigation></Header>
    <Main as="div">{children}</Main>
    <Footer><FooterContainer><FooterLeft><FooterLogo src={logo} alt="MOMO" /><FooterDesc>영화를 메모하다. 보고, 느끼고, 남기는 나만의 영화 기록.</FooterDesc></FooterLeft></FooterContainer><FooterBottom><p>© 2026 MOMO. All rights reserved.</p><p>Movie Memo</p></FooterBottom></Footer>
  </Container>;
}
