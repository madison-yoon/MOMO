import { safeRequestFailure } from "../utils/safeRequestFailure";
import React, { useEffect, useState } from "react";
import SafeImage from "../components/common/SafeImage";
import { useNavigate } from "react-router-dom";
import BoxOfficeCarousel from "../components/home/BoxOfficeCarousel";
import GenrePreview from "../components/home/GenrePreview";
import ScrollToTop from "../components/home/ScrollToTop";
import RecentReviews from "../components/home/RecentReviews";
import cinemaAtmosphere from "../assets/cinema-atmosphere.png";
import TodayRecommend from "../components/common/TodayRecommend";
import FavoriteStar from "../components/common/FavoriteStar";
import { getFavoriteMovies } from "../utils/favorites";
import AxiosApi from "../api/AxiosApi";
import { resolvePosterUrl } from "../utils/mediaUrl";
import { getPosterPollDelay } from "../utils/posterPolling";

import {
  HomePage,
  HomeState,
  FeatureSection,
  HeroBackdrop,
  Section,
  SectionHeading,
  MoreText,
  MovieGrid,
  MovieCard,
  PosterWrap,
  MovieInfo,
  BrandLine,
  EmptyPoster,
} from "../styles/redesign/Home.styles";

// 어제 날짜를 YYYYMMDD 형식으로 반환
const getYesterdayDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

function Home() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boxOfficeError, setBoxOfficeError] = useState(false);
  const [favoriteMovies, setFavoriteMovies] = useState(() =>
    getFavoriteMovies(),
  );

  // 관심 영화 목록이 바뀌면 화면을 갱신
  useEffect(() => {
    const updateFavorites = (event) => {
      setFavoriteMovies(event.detail || getFavoriteMovies());
    };

    window.addEventListener("momo-favorites-changed", updateFavorites);

    return () => {
      window.removeEventListener("momo-favorites-changed", updateFavorites);
    };
  }, []);

  // 어제 날짜의 박스오피스 목록 조회
  useEffect(() => {
    const targetDate = getYesterdayDate();
    const controller = new AbortController();
    let cancelled = false;
    let refreshTimer = null;

    const refreshPosterStatuses = (movieCodes, attempt = 0) => {
      if (cancelled || attempt >= 3 || movieCodes.length === 0) {
        return;
      }

      refreshTimer = window.setTimeout(async () => {
        try {
          const response = await AxiosApi.moviePosterStatuses(
            movieCodes,
            controller.signal,
          );

          if (cancelled) return;

          const statuses = Array.isArray(response.data) ? response.data : [];
          const statusByCode = new Map(
            statuses.map((item) => [item.movieCode, item]),
          );

          setMovies((currentMovies) =>
            currentMovies.map((movie) => {
              const status = statusByCode.get(movie.movieCode);
              if (status?.status === "SUCCESS" && status.posterUrl) {
                return { ...movie, posterUrl: status.posterUrl };
              }
              return movie;
            }),
          );

          // 수집이 끝난 SUCCESS·FAILED 영화는 다시 조회하지 않는다.
          // 아직 작업 중인 영화만 최대 3회까지 지수형 간격으로 확인한다.
          const hasPendingPosters = movieCodes.some((code) => {
            const status = statusByCode.get(code);
            return status?.status === "PENDING" || status?.status === "PROCESSING";
          });

          if (hasPendingPosters) {
            refreshPosterStatuses(movieCodes, attempt + 1);
          }
        } catch (error) {
          if (
            !cancelled &&
            error.code !== "ERR_CANCELED" &&
            error.name !== "CanceledError"
          ) {
            console.error("포스터 상태 조회 실패:", safeRequestFailure(error));
            refreshPosterStatuses(movieCodes, attempt + 1);
          }
        }
      }, getPosterPollDelay(attempt));
    };

    const loadBoxOffice = async () => {
      try {
        const response = await AxiosApi.dailyBoxOffice(
          targetDate,
          controller.signal,
        );

        if (cancelled) return;

        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data.movies || data.dailyBoxOfficeList || data.boxOfficeList || [];

        const normalized = list.map((movie, index) => ({
          movieCode: movie.movieCode || movie.movieCd || movie.id,
          title: movie.title || movie.movieNm || movie.movieName,
          releaseDate: movie.releaseDate || movie.openDt || "",
          posterUrl:
            movie.posterUrl ||
            movie.posterPath ||
            movie.poster ||
            movie.imageUrl,
          rank: movie.rank || index + 1,
        }));

        setMovies(normalized);

        const missingCodes = normalized
          .filter((movie) => !movie.posterUrl && movie.movieCode)
          .map((movie) => movie.movieCode);

        refreshPosterStatuses(missingCodes);
      } catch (error) {
        if (
          !cancelled &&
          error.code !== "ERR_CANCELED" &&
          error.name !== "CanceledError"
        ) {
          console.error("박스오피스 조회 실패:", safeRequestFailure(error));
          setBoxOfficeError(true);
          setMovies([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBoxOffice();

    return () => {
      cancelled = true;
      controller.abort();
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }
    };
  }, []);

  // 영화 상세 페이지로 이동
  const goToMovie = (movieCode) => {
    if (!movieCode) return;
    navigate("/movie/" + movieCode);
  };

  // Enter 또는 Space 키로 영화 카드 선택
  const handleMovieKeyDown = (event, movieCode) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToMovie(movieCode);
    }
  };

  return (
    <HomePage>
      <FeatureSection aria-label="MOMO 영화 기록 공간">
        <HeroBackdrop src={cinemaAtmosphere} alt="" aria-hidden="true" decoding="async" />
        <TodayRecommend />
      </FeatureSection>

      <Section id="box-office" aria-label="오늘의 박스오피스">
        <SectionHeading>
          <div><h2>오늘의 박스오피스</h2><p>가장 많은 관객이 선택한 영화</p></div>
          <MoreText>일일 관객 순위 · TOP 10</MoreText>
        </SectionHeading>
        {loading ? <HomeState role="status">영화 정보를 불러오는 중입니다.</HomeState>
          : boxOfficeError ? <HomeState role="alert">박스오피스를 불러오지 못했습니다. 잠시 후 다시 방문해 주세요.</HomeState>
          : !movies.length ? <HomeState>현재 표시할 영화가 없습니다.</HomeState>
          : <BoxOfficeCarousel movies={movies} onMovieSelect={goToMovie} />}
      </Section>

      <GenrePreview />

      <RecentReviews />

      <Section aria-label="관심 영화">
        <SectionHeading>
          <div><h2>다시 꺼내 보고 싶은 영화</h2><p>관심 영화에 담아둔, 나만의 작은 상영 목록</p></div>
          <button type="button" className="home-favorites-more" onClick={() => navigate("/profile/favorites")}>전체 보기 →</button>
        </SectionHeading>
        {!favoriteMovies.length ? <div className="home-favorites-empty">
          <strong>아직 관심 영화가 없어요.</strong><p>영화를 둘러보고 마음에 드는 작품을 관심 영화에 담아보세요.</p>
        </div> : <MovieGrid>{favoriteMovies.slice(0, 5).map((movie) => (
          <MovieCard key={movie.movieCode} role="button" tabIndex={0}
            onClick={() => goToMovie(movie.movieCode)} onKeyDown={(event) => handleMovieKeyDown(event, movie.movieCode)}>
            <PosterWrap>
              <SafeImage src={resolvePosterUrl(movie.posterUrl)} alt={movie.title} fallback={<EmptyPoster>포스터 준비 중</EmptyPoster>} />
              <FavoriteStar movie={movie} active={true} />
            </PosterWrap>
            <MovieInfo><h3>{movie.title}</h3><p>{movie.releaseDate || "개봉일 정보 없음"}</p></MovieInfo>
          </MovieCard>
        ))}</MovieGrid>}
      </Section>
      <ScrollToTop />
      <BrandLine><h2>영화는 끝나도, 감상은 남습니다.</h2><p>당신의 영화 기록을 MOMO에 남겨보세요.</p></BrandLine>
    </HomePage>
  );
}

export default Home;
