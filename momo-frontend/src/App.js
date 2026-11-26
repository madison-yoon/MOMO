import React, { useEffect, useState } from "react";
import ArchivePagesStyles from "./styles/redesign/ArchivePages.styles";
import CinemaCharcoalStyles from "./styles/redesign/CinemaCharcoal.styles";
import GlobalStyles from "./styles/GlobalStyles";
import ToastNotification from "./components/common/ToastNotification";

import { BrowserRouter, Navigate, Routes, Route, useParams, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Layout from "./pages/Layout";
import SocialOAuthCallback from "./pages/SocialOAuthCallback";

import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileDelete from "./pages/ProfileDelete";

import Search from "./pages/Search";
import AllReviews from "./pages/AllReviews";
import ReviewDetail from "./pages/ReviewDetail";
import MyReviews from "./pages/MyReviews";
import LikedReviews from "./pages/LikedReviews";
import FavoriteMovies from "./pages/FavoriteMovies";
import PersonDetail from "./pages/PersonDetail";

// 화면 접근 흐름을 로그인 상태와 동기화한다. API 권한 검사는 백엔드가 최종 담당한다.
function RequireAuth({ children }) {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(localStorage.getItem("accessToken")),
  );

  useEffect(() => {
    const syncAuthentication = () => {
      setAuthenticated(Boolean(localStorage.getItem("accessToken")));
    };

    window.addEventListener("momo-auth-changed", syncAuthentication);
    window.addEventListener("storage", syncAuthentication);
    return () => {
      window.removeEventListener("momo-auth-changed", syncAuthentication);
      window.removeEventListener("storage", syncAuthentication);
    };
  }, []);

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function LegacyMovieRedirect() {
  const { tmdbId } = useParams();
  return <Navigate to={`/movie/${encodeURIComponent(tmdbId)}`} replace />;
}

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || "/"}>
      <GlobalStyles />
      <ArchivePagesStyles />
      <CinemaCharcoalStyles />
      <ToastNotification />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* 기존 TMDb 전용 주소는 통합 영화 주소로 이동한다. */}
          <Route path="/movie/tmdb/:tmdbId" element={<LegacyMovieRedirect />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/search" element={<Search />} />

          {/* 전체 공개 리뷰 */}
          <Route path="/reviews" element={<AllReviews />} />
          <Route path="/reviews/movie/:movieCode" element={<AllReviews />} />
          <Route path="/reviews/:reviewId" element={<ReviewDetail />} />

          {/* 회원 전용 화면 */}
          <Route path="/profile/liked-reviews" element={<RequireAuth><LikedReviews /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/profile/reviews" element={<RequireAuth><MyReviews /></RequireAuth>} />
          <Route path="/profile/edit" element={<RequireAuth><ProfileEdit /></RequireAuth>} />
          <Route path="/profile/delete" element={<RequireAuth><ProfileDelete /></RequireAuth>} />
          <Route path="/profile/favorites" element={<RequireAuth><FavoriteMovies /></RequireAuth>} />

          {/* 인물 상세 */}
          <Route path="/person/:type/:identifier" element={<PersonDetail />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* 각 공급자의 실제 Redirect URI에 등록할 공통 콜백 */}
        <Route path="/oauth/kakao" element={<SocialOAuthCallback provider="kakao" />} />
        <Route path="/oauth/naver" element={<SocialOAuthCallback provider="naver" />} />
        <Route path="/oauth/google" element={<SocialOAuthCallback provider="google" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
