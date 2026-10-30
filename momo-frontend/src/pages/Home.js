import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = "http://localhost:8111/api/boxoffice/daily";

function getYesterdayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ko-KR");
}

function getMovieCode(movie) {
  return movie.movieCode || movie.movieCd || movie.id || "";
}

function normalizeMovie(movie, index) {
  return {
    id: getMovieCode(movie) || `movie-${index}`,
    title: movie.title || movie.movieNm || "제목 없음",
    rank: Number(
      movie.rank || movie.rankNo || movie.boxOfficeRank || index + 1,
    ),
    audience: Number(
      movie.audienceCount || movie.audience || movie.audiCnt || 0,
    ),
    totalAudience: Number(movie.totalAudience || movie.audiAcc || 0),
    releaseDate: movie.releaseDate || movie.openDate || "",
    posterUrl: movie.posterUrl || "",
    directors: movie.directors || movie.director || [],
    cast: movie.cast || movie.actors || movie.actorList || [],
  };
}

function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [likes, setLikes] = useState({});

  useEffect(() => {
    const targetDate = getYesterdayDate();

    fetch(`${API_URL}?targetDate=${targetDate}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("영화 정보를 불러오지 못했습니다.");
        }
        return response.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.movies || data.dailyBoxOfficeList || data.boxOfficeList || [];

        const formattedMovies = list
          .map(normalizeMovie)
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 10);

        setMovies(formattedMovies);
        setError("");
      })
      .catch((err) => {
        console.error("영화 데이터 오류:", err);
        setError(
          "영화 정보를 불러오지 못했습니다. 백엔드 서버를 확인해 주세요.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [movies, search]);

  // 영화를 누르면 주소창을 /movie/:id 로 이동시킵니다.
  function openMovie(movie) {
    navigate(`/movie/${movie.id}`, { state: { movie } });
  }

  function toggleLike(movieId) {
    setLikes((prev) => ({
      ...prev,
      [movieId]: !prev[movieId],
    }));
  }

  return (
    <main className="home-page">
      <section className="hero-banner">
        <div>
          <span className="hero-label">MOMO MOVIE</span>
          <h1>오늘의 영화, 오늘의 리뷰</h1>
          <p>영화를 보고 느낀 생각을 자유롭게 나눠보세요.</p>
        </div>
      </section>

      <section className="section-block" id="movies">
        <div className="section-heading">
          <div>
            <span className="section-subtitle">BOX OFFICE</span>
            <h2>일일 박스오피스 TOP 10</h2>
          </div>
        </div>

        <input
          className="movie-search-input"
          type="text"
          placeholder="영화 제목 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="movie-message">영화 정보를 불러오는 중입니다...</p>
        ) : error ? (
          <p className="movie-message error-message">{error}</p>
        ) : filteredMovies.length === 0 ? (
          <p className="movie-message">검색 결과가 없습니다.</p>
        ) : (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <article className="movie-card" key={movie.id}>
                <div className="poster-frame">
                  <span className="poster-rank">{movie.rank}</span>

                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="movie-poster-image"
                    />
                  ) : (
                    <div className="poster-placeholder">
                      <span>🎬</span>
                      <p>{movie.title}</p>
                    </div>
                  )}
                </div>

                <div className="movie-card-content">
                  <h3>{movie.title}</h3>

                  <p className="movie-release-date">
                    개봉일: {movie.releaseDate || "정보 없음"}
                  </p>

                  <div className="movie-audience-info">
                    <p>
                      오늘 관객수{" "}
                      <strong>{formatNumber(movie.audience)}</strong>
                    </p>
                    <p>
                      누적 관객수{" "}
                      <strong>{formatNumber(movie.totalAudience)}</strong>
                    </p>
                  </div>

                  <button
                    className="movie-review-button"
                    onClick={() => openMovie(movie)}
                  >
                    리뷰 작성 →
                  </button>

                  <button
                    className="movie-like-button"
                    onClick={() => toggleLike(movie.id)}
                  >
                    {likes[movie.id] ? "♥ 좋아요" : "♡ 좋아요"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="section-subtitle">COMMUNITY</span>
            <h2>최근 작성된 리뷰</h2>
          </div>
        </div>

        <p className="movie-message">
          아직 작성된 리뷰가 없습니다. 첫 리뷰를 작성해 보세요!
        </p>
      </section>
    </main>
  );
}

export default Home;
