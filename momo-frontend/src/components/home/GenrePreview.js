import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosApi from "../../api/AxiosApi";
import SafeImage from "../common/SafeImage";
import FavoriteStar from "../common/FavoriteStar";
import { resolvePosterUrl } from "../../utils/mediaUrl";
import { formatReleaseDate } from "../../utils/releaseDate";
import { getPosterPollDelay } from "../../utils/posterPolling";
import { Section, SectionHeading, GenreList, MovieGrid, MovieCard, PosterWrap, MovieInfo, EmptyPoster, HomeState } from "../../styles/redesign/Home.styles";

// 공통 검증 규칙은 그대로 쓰고 홈의 출력 구분자만 바꿔 다른 페이지에 영향을 주지 않는다.
const formatGenreDate = (value) => {
  const date = String(value || "").trim();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.replace(/-/g, "") : date;
  return formatReleaseDate(normalized).replace(/^(\d{4})\.(\d{2})\.(\d{2})$/, "$1-$2-$3");
};

const genres = ["드라마", "액션", "코미디", "스릴러", "로맨스", "공포", "애니메이션", "다큐멘터리"];

// 선택한 장르만 미리 읽고 성공한 응답을 이 홈 화면이 유지되는 동안 재사용한다.
export default function GenrePreview() {
  const navigate = useNavigate();
  const cache = useRef(new Map());
  const [genre, setGenre] = useState("드라마");
  const [state, setState] = useState({ genre: "드라마", loading: true, error: false, movies: [] });
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    const publish = (movies) => {
      if (controller.signal.aborted) return;
      cache.current.set(genre, movies);
      setState({ genre, loading: false, error: false, movies });
    };
    const loadPosters = async (movies, attempt = 0) => {
      const missing = movies.filter((movie) => !movie.posterUrl).map((movie) => movie.movieCode);
      if (!missing.length || controller.signal.aborted) return;
      try {
        // 장르 API가 이미 수집을 예약하므로 별도 수집 등록 대신 상태만 묶어서 확인한다.
        const response = await AxiosApi.moviePosterStatuses(missing, controller.signal);
        if (controller.signal.aborted) return;
        const statuses = new Map((Array.isArray(response.data) ? response.data : []).map((item) => [item.movieCode, item]));
        const updated = movies.map((movie) => ({ ...movie, posterUrl: movie.posterUrl || statuses.get(movie.movieCode)?.posterUrl || "" }));
        publish(updated);
        if (attempt < 2 && [...statuses.values()].some((item) => ["PENDING", "PROCESSING"].includes(item.status))) {
          timer = window.setTimeout(() => loadPosters(updated, attempt + 1), getPosterPollDelay(attempt));
        }
      } catch {
        // 부가 포스터 확인이 실패해도 정상 조회된 영화 목록은 유지한다.
      }
    };
    const load = async () => {
      if (cache.current.has(genre)) {
        const saved = cache.current.get(genre);
        publish(saved);
        // 장르를 바꾸며 취소한 포스터 확인은 복귀 시 이어가고 목록 API는 다시 호출하지 않는다.
        loadPosters(saved);
        return;
      }
      setState({ genre, loading: true, error: false, movies: [] });
      try {
        const response = await AxiosApi.moviesByGenre(genre, 1, controller.signal);
        // 취소 신호를 무시하는 늦은 응답도 이전 effect의 신호로 걸러낸다.
        if (controller.signal.aborted) return;
        const movies = (Array.isArray(response.data) ? response.data : []).filter((item) => item.movieCode && item.title).slice(0, 5);
        publish(movies); loadPosters(movies);
      } catch {
        if (!controller.signal.aborted) setState({ genre, loading: false, error: true, movies: [] });
      }
    };
    load();
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [genre]);
  const pending = state.genre !== genre || state.loading;
  return <Section aria-label="장르로 영화 찾기">
    <SectionHeading><div><h2>오늘은 어떤 영화가 끌리나요?</h2><p>좋아하는 장르에서 다음 이야기를 찾아보세요.</p></div>
      <button type="button" className="home-favorites-more" aria-label="장르 전체 보기" onClick={() => navigate("/search?genre=" + encodeURIComponent(genre))}>전체 보기 →</button>
    </SectionHeading>
    <GenreList>{genres.map((item) => <button key={item} type="button" aria-pressed={item === genre} onClick={() => setGenre(item)}>{item}</button>)}</GenreList>
    {pending ? <HomeState role="status">{genre} 영화를 불러오는 중입니다.</HomeState>
      : state.error ? <HomeState role="alert">{genre} 영화를 불러오지 못했습니다.</HomeState>
      : !state.movies.length ? <HomeState>현재 표시할 {genre} 영화가 없습니다.</HomeState>
      : <MovieGrid>{state.movies.map((movie) => <MovieCard key={movie.movieCode} role="button" tabIndex={0} aria-label={`${movie.title} 상세 페이지`}
        onClick={() => navigate("/movie/" + movie.movieCode)} onKeyDown={(event) => { if (event.target === event.currentTarget && ["Enter", " "].includes(event.key)) { event.preventDefault(); navigate("/movie/" + movie.movieCode); } }}>
        <PosterWrap><SafeImage src={resolvePosterUrl(movie.posterUrl)} alt={movie.title} fallback={<EmptyPoster>포스터 준비 중</EmptyPoster>} /><FavoriteStar movie={movie} /></PosterWrap>
        <MovieInfo><h3>{movie.title}</h3><p>{formatGenreDate(movie.releaseDate)}</p></MovieInfo>
      </MovieCard>)}</MovieGrid>}
  </Section>;
}
