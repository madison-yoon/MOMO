
import { Link, NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #faf9f6;
  color: #292929;
`;

const Header = styled.header`
  height: 72px;
  padding: 0 8%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e5df;
`;

const Logo = styled(Link)`
  color: #292929;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
  text-decoration: none;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 28px;

  a {
    color: #666666;
    text-decoration: none;
    font-size: 14px;
  }

  a.active {
    color: #292929;
    font-weight: 700;
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  box-sizing: border-box;
`;

const Footer = styled.footer`
  padding: 28px 8%;
  background-color: #292929;
  color: #ffffff;
`;

const FooterLogo = styled.div`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const FooterText = styled.p`
  margin: 0;
  color: #c7c7c7;
  font-size: 13px;
  line-height: 1.7;
`;

const Layout = () => {
  return (
    <Container>
      <Header>
        <Logo to="/home">MOMO</Logo>

        <Navigation>
          <NavLink to="/home">홈</NavLink>
          <NavLink to="/board">리뷰 게시판</NavLink>
          <NavLink to="/about">서비스 소개</NavLink>
          <NavLink to="/profile/me">마이페이지</NavLink>
        </Navigation>
      </Header>

      <Main>
        <Outlet />
      </Main>

      <Footer>
        <FooterLogo>MOMO</FooterLogo>
        <FooterText>
          영화에 대한 생각을 기록하는 공간, MOVIEMEMO.
        </FooterText>
        <FooterText>
          나만의 감상과 다른 사람의 시선을 함께 기록하세요.
        </FooterText>
      </Footer>
    </Container>
  );
};

export default Layout;
