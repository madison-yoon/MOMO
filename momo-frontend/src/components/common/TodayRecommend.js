import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SafeImage from "./SafeImage";
import AxiosApi from "../../api/AxiosApi";
import { getFavoriteMovies } from "../../utils/favorites";
import { resolvePosterUrl } from "../../utils/mediaUrl";
import { getPosterPollDelay } from "../../utils/posterPolling";
import { safeRequestFailure } from "../../utils/safeRequestFailure";

const isValidMovieCode = (code) => /^[A-Za-z0-9]{8}$/.test(String(code || ""));

// 기존 취향·미평가 영화 선택 규칙을 유지하면서 최대 네 편을 한 번만 준비한다.
export default function TodayRecommend() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [timerVersion, setTimerVersion] = useState(0);
  const progressTrack = useRef(null);
  const clock = useRef({ elapsed: 0 });

  useEffect(() => {
    const controller = new AbortController();
    const timers = new Set();
    const alive = () => !controller.signal.aborted;
    const checked = new Set();
    const selected = [];

    const refreshPoster = (movieCode, attempt = 0) => {
      if (!alive() || attempt >= 3) return;
      const timer = window.setTimeout(async () => {
        timers.delete(timer);
        try {
          const response = await AxiosApi.moviePosterStatuses([movieCode], controller.signal);
          if (!alive()) return;
          const status = Array.isArray(response.data) ? response.data.find((item) => item.movieCode === movieCode) : null;
          if (status?.status === "SUCCESS" && status.posterUrl) {
            setMovies((current) => current.map((item) => item.movieCode === movieCode ? { ...item, posterUrl: status.posterUrl } : item));
            return;
          }
          if (!["PENDING", "PROCESSING"].includes(status?.status)) return;
        } catch (requestError) {
          if (!alive()) return;
          console.warn("추천 포스터 상태 조회 실패:", safeRequestFailure(requestError));
        }
        refreshPoster(movieCode, attempt + 1);
      }, getPosterPollDelay(attempt));
      timers.add(timer);
    };
    const enrich = async (candidate) => {
      let movie = { ...candidate };
      try {
        const detail = await AxiosApi.movieDetail(candidate.movieCode, controller.signal);
        // DTO가 실제 제공하는 보조 정보만 사용하고 빈 값은 화면에서 생략한다.
        movie = { ...movie, titleEn: detail.data?.titleEn || "", runningTime: detail.data?.runningTime || "", genre: detail.data?.genre || movie.genre, overview: String(detail.data?.overview || "").trim() };
      } catch (requestError) {
        if (!alive()) throw requestError;
        console.warn("추천 영화 상세 조회 실패:", safeRequestFailure(requestError));
      }
      if (!movie.posterUrl) {
        try {
          const poster = await AxiosApi.moviePoster(movie.movieCode, controller.signal);
          movie.posterUrl = poster.data?.posterUrl || "";
        } catch (requestError) {
          if (!alive()) throw requestError;
          console.warn("추천 포스터 조회 실패:", safeRequestFailure(requestError));
        }
      }
      return movie;
    };
    const choose = async (candidates, excluded) => {
      for (const candidate of Array.isArray(candidates) ? candidates : []) {
        if (!alive() || selected.length >= 4) break;
        const code = String(candidate?.movieCode || "");
        if (!isValidMovieCode(code) || !candidate.title?.trim() || !/^\d{8}$/.test(candidate.releaseDate || "") || excluded.has(code) || checked.has(code)) continue;
        checked.add(code);
        try {
          const rating = await AxiosApi.movieRating(code, controller.signal);
          if (alive() && (rating.data?.myRating ?? null) === null) selected.push(candidate);
        } catch (requestError) {
          if (!alive()) throw requestError;
          // 평가 여부를 확인하지 못한 영화는 기존 정책처럼 후보에서 제외한다.
        }
      }
    };
    const load = async () => {
      try {
        const favorites = getFavoriteMovies();
        let liked = [];
        if (localStorage.getItem("accessToken")) {
          try {
            const response = await AxiosApi.myLikedMovies(controller.signal);
            liked = Array.isArray(response.data) ? response.data : [];
          } catch (requestError) {
            if (!alive()) throw requestError;
            console.warn("좋아요 영화 조회 실패. 관심 영화로 대체합니다.", safeRequestFailure(requestError));
          }
        }
        const excluded = new Set([...favorites, ...liked].map((item) => String(item.movieCode)));
        const seed = liked[0] || favorites[favorites.length - 1];
        let preferred = seed?.genre || "";
        if (!preferred && isValidMovieCode(seed?.movieCode)) {
          try { preferred = (await AxiosApi.movieDetail(seed.movieCode, controller.signal)).data?.genre || ""; }
          catch (requestError) { if (!alive()) throw requestError; }
        }
        const genre = preferred.split(",").map((item) => item.trim()).find(Boolean);
        if (genre) {
          try { await choose((await AxiosApi.boxOfficeRecommendations(genre, controller.signal)).data, excluded); }
          catch (requestError) {
            if (!alive()) throw requestError;
            console.warn("장르 추천 조회 실패. 전체 후보로 전환합니다.", safeRequestFailure(requestError));
          }
        }
        // 장르 후보가 부족하면 전체 이력에서 보충하되 같은 영화의 평가는 다시 조회하지 않는다.
        if (selected.length < 4) {
          try { await choose((await AxiosApi.boxOfficeRecommendations(null, controller.signal)).data, excluded); }
          catch (requestError) { if (!selected.length || !alive()) throw requestError; }
        }
        if (!alive()) return;
        const prepared = await Promise.all(selected.map(enrich));
        if (!alive()) return;
        setMovies(prepared);
        prepared.filter((item) => !item.posterUrl).forEach((item) => refreshPoster(item.movieCode));
      } catch (requestError) {
        if (alive()) { setError(true); console.error("오늘의 추천작 조회 실패:", safeRequestFailure(requestError)); }
      } finally { if (alive()) setLoading(false); }
    };
    load();
    return () => { controller.abort(); timers.forEach(window.clearTimeout); };
  }, []);

  // 수동 이동과 새 영화 선택은 진행률·시간을 동시에 0으로 돌린다.
  useEffect(() => {
    clock.current.elapsed = 0;
    progressTrack.current?.style.setProperty("--slide-progress", "0");
  }, [index, movies.length, timerVersion]);

  // 표시와 전환 완료가 같은 시작 시각을 사용하므로 별도의 CSS 시계와 어긋나지 않는다.
  // 정지할 때 경과 시간을 보존하고 재생할 때 남은 시간만 예약한다.
  useEffect(() => {
    if (movies.length < 2 || paused || hovered || focused) return;
    const clockState = clock.current;
    const track = progressTrack.current;
    const elapsed = clockState.elapsed;
    const started = performance.now();
    let frame;
    const paint = () => {
      const current = Math.min(10000, elapsed + performance.now() - started);
      track?.style.setProperty("--slide-progress", String(current / 10000));
      frame = window.requestAnimationFrame(paint);
    };
    frame = window.requestAnimationFrame(paint);
    const timer = window.setTimeout(() => {
      track?.style.setProperty("--slide-progress", "1");
      setIndex((current) => (current + 1) % movies.length);
    }, Math.max(0, 10000 - elapsed));
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      clockState.elapsed = Math.min(10000, elapsed + performance.now() - started);
      track?.style.setProperty("--slide-progress", String(clockState.elapsed / 10000));
    };
  }, [index, movies.length, paused, hovered, focused, timerVersion]);
  const move = (step) => {
    setIndex((current) => (current + step + movies.length) % movies.length);
    setTimerVersion((version) => version + 1);
  };
  const movie = movies[index];
  const openMovie = () => { if (isValidMovieCode(movie?.movieCode)) navigate(`/movie/${encodeURIComponent(movie.movieCode)}`); };
  return <section className="recommend-banner" aria-label="오늘의 추천 영화" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    {loading || error || !movie ? <div className="recommend-state" role={error ? "alert" : "status"}>
      <h1>영화를 기억하는<br />가장 따뜻한 방법</h1>
      <p>{loading ? "오늘의 추천작을 불러오는 중입니다." : error ? "추천 영화 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : "현재 추천할 수 있는 영화가 없습니다."}</p>
    </div> : <div className="recommend-layout" key={movie.movieCode}>
      <div className="recommend-content">
        <p className="recommend-label">오늘 기억하고 싶은 영화</p>
        <h1 className="recommend-title">{movie.title}</h1>
        <p className="recommend-subtitle">{[movie.titleEn, movie.releaseDate?.slice(0, 4)].filter(Boolean).join(" · ")}</p>
        <p className="recommend-info">{[movie.genre, movie.runningTime && `${movie.runningTime}분`].filter(Boolean).join(" · ")}</p>
        {movie.overview && <p className="recommend-description">{movie.overview}</p>}
        <button className="recommend-button" type="button" onClick={openMovie}>영화 자세히 보기</button>
      </div>
      <button className="recommend-poster-link" type="button" aria-label={`${movie.title} 상세 페이지`} onClick={openMovie}>
        <SafeImage className="recommend-poster" src={resolvePosterUrl(movie.posterUrl)} alt={movie.title} fallback={<div className="recommend-poster poster-placeholder">포스터 준비 중</div>} />
      </button>
    </div>}
    <div className="recommend-footer">
      <p>영화를 보고, 느끼고, 남기는 나만의 영화 기록</p>
      <div className="recommend-controls" aria-label="추천 영화 전환">
        <button type="button" aria-label="이전 추천 영화" disabled={movies.length < 2} onClick={() => move(-1)}>‹</button>
        <div className="recommend-dots" ref={progressTrack}>{movies.map((item, i) => <button key={item.movieCode} type="button" aria-label={`${i + 1}번째 추천 영화`} aria-current={i === index ? "true" : undefined}
          onClick={() => { setIndex(i); setTimerVersion((version) => version + 1); }}><span><i /></span></button>)}</div>
        <span className="recommend-counter" aria-live={paused || focused ? "polite" : "off"}>{String(movie ? index + 1 : 0).padStart(2, "0")} / {String(movies.length).padStart(2, "0")}</span>
        <button type="button" aria-label="다음 추천 영화" disabled={movies.length < 2} onClick={() => move(1)}>›</button>
        <button type="button" aria-label={paused ? "추천 자동 전환 재생" : "추천 자동 전환 일시정지"} disabled={movies.length < 2} onClick={() => setPaused((current) => !current)}>{paused ? "▶" : "Ⅱ"}</button>
      </div>
    </div>
  </section>;
}
