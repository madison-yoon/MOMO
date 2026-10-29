import { useState, useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import styled from "styled-components";
import textlogo from "../textlogo.png";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #faf9f6;
  color: #292929;
`;

const Header = styled.header`
  min-height: 72px;
  padding: 0 8%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e5df;
  box-sizing: border-box;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const LogoImage = styled.img`
  display: block;
  width: auto;
  height: 40px;
  object-fit: contain;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background-color: #faf9f6;
  border: 1px solid #e8e5df;
  border-radius: 20px;
  padding: 6px 14px;
  width: 320px;
  max-width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: #292929; /* 포커스 시 테두리 진하게 */
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #292929;

  &::placeholder {
    color: #999999;
  }
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666666;
  padding: 0;
  margin-left: 8px;

  &:hover {
    color: #292929;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 24px;

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

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
  font-size: 14px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e8e5df;
  border-radius: 6px;
  background-color: #ffffff;
  color: #292929;
  cursor: pointer;

  &:hover {
    background-color: #faf9f6;
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

const FooterLogo = styled.img`
  display: block;
  width: auto;
  height: 32px;
  object-fit: contain;
  margin-bottom: 12px;
`;

const FooterText = styled.p`
  margin: 0;
  color: #c7c7c7;
  font-size: 13px;
  line-height: 1.7;
`;

function Layout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");

  const [nickname, setNickname] = useState(
    localStorage.getItem("username") || "",
  );

  useEffect(() => {
    const savedNickname = localStorage.getItem("username") || "";
    setNickname(savedNickname);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    // 엔터나 검색 버튼을 누르면 검색 결과 페이지로 이동 (예: /search?keyword=사랑)
    navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setNickname("");
    navigate("/login");
  };

  return (
    <Container>
      <Header>
        <Logo to="/" aria-label="MOMO 홈">
          <LogoImage src={textlogo} alt="MOMO" />
        </Logo>

        <SearchForm onSubmit={handleSearchSubmit}>
          <SearchInput
            type="text"
            placeholder="영화 제목 또는 키워드 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <SearchButton type="submit">검색</SearchButton>
        </SearchForm>

        <Navigation>
          {nickname ? (
            <UserArea>
              <NavLink to="/profile/me">{nickname}님</NavLink>
              <ActionButton onClick={handleLogout}>로그아웃</ActionButton>
            </UserArea>
          ) : (
            <UserArea>
              <NavLink to="/login">로그인</NavLink>
              <NavLink to="/signup">회원가입</NavLink>
            </UserArea>
          )}
        </Navigation>
      </Header>

      <Main>
        <Outlet />
      </Main>

      <Footer>
        <FooterLogo src={textlogo} alt="MOMO" />
        <FooterText>영화에 대한 생각을 기록하는 공간, MOVIEMEMO.</FooterText>
        <FooterText>
          나만의 감상과 다른 사람의 시선을 함께 기록하세요.
        </FooterText>
      </Footer>
    </Container>
  );
}

export default Layout;
