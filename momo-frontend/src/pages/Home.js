import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

// 💡 어제 날짜를 YYYYMMDD 형식으로 계산하는 함수 (박스오피스는 전날 데이터가 확실하게 나옵니다)
function getYesterdayDateString() {
  const date = new Date();
  date.setDate(date.getDate() - 1); // 하루 전(어제)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// 🎯 백엔드 BoxOfficeController의 실제 주소(/api/boxoffice/daily)와 targetDate 파라미터 조합
const API_URL = `http://localhost:8111/api/boxoffice/daily?targetDate=${getYesterdayDateString()}`;

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ko-KR");
}

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [likes, setLikes] = useState({});
  const [failedPosters, setFailedPosters] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  // 1. 로그인한 유저 이름 상태 및 로그아웃 기능 추가
  const [username, setUsername] = useState("");

  useEffect(() => {
    // localStorage에서 저장된 닉네임 불러오기
    const savedUser = localStorage.getItem("username");
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
  };

  useEffect(() => {
    let cancelled = false;
    async function loadMovies() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("영화 정보를 불러오지 못했어요.");
        }
        
        const data = await response.json();
        
        // 💡 백엔드가 주는 배열 형태([...]) 또는 객체 형태 모두 대응할 수 있도록 안전하게 처리
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.movies)
          ? data.movies
          : Array.isArray(data.dailyBoxOfficeList)
          ? data.dailyBoxOfficeList
          : [];

        // 💡 백엔드 BoxOfficeResponse DTO 필드명(movieCode, title, releaseDate, audienceCount 등)에 매핑
        const formattedMovies = list.map((movie, index) => ({
          id: movie.movieCode ?? movie.id ?? `movie-${index}`,
          title: movie.title ?? "제목 없음",
          rank: Number(movie.rank || 0),
          audience: Number(movie.audienceCount ?? movie.audience ?? 0),
          totalAudience: Number(movie.totalAudience ?? 0),
          openDate: movie.releaseDate ?? movie.openDate ?? "",
          posterUrl: movie.posterUrl || "",
        }));

        if (!cancelled) {
          setMovies(formattedMovies);
          if (formattedMovies.length === 0) {
            setError("불러온 영화가 없어요. API 응답을 확인해 주세요.");
          }
        }
      } catch (err) {
        console.error("영화 목록 불러오기 실패:", err);
        if (!cancelled) {
          setError("영화 정보를 불러오지 못했어요. API 서버가 실행 중인지 확인해 주세요.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadMovies();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMovies = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return movies;
    return movies.filter((movie) => movie.title.toLowerCase().includes(keyword));
  }, [movies, search]);

  const recentReviews = reviews.slice(0, 3);
  const popularMovies = movies.slice(0, 5);

  function openReview(movie) {
    setSelectedMovie(movie);
    setReviewText("");
    setRating(5);
  }

  function closeReview() {
    setSelectedMovie(null);
    setReviewText("");
    setRating(5);
  }

  function addReview(event) {
    event.preventDefault();
    if (!selectedMovie || !reviewText.trim()) return;
    const newReview = {
      id: `${Date.now()}-${Math.random()}`,
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      text: reviewText.trim(),
      rating,
      date: new Date().toLocaleDateString("ko-KR"),
    };
    setReviews((previous) => [newReview, ...previous]);
    closeReview();
  }

  function toggleLike(movieId) {
    setLikes((previous) => ({
      ...previous,
      [movieId]: !previous[movieId],
    }));
  }

  function scrollToSection(id) {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }

  function handlePosterError(movieId) {
    setFailedPosters((previous) => ({
      ...previous,
      [movieId]: true,
    }));
  }

  function renderPoster(movie, extraClass = "") {
    const hasPoster = movie.posterUrl && !failedPosters[movie.id];
    return (
      <div className={`poster-frame ${extraClass}`}>
        {hasPoster ? (
          <img
            className="movie-poster"
            src={movie.posterUrl}
            alt={`${movie.title} 영화 포스터`}
            loading="lazy"
            onError={() => handlePosterError(movie.id)}
          />
        ) : (
          <div className="poster-placeholder">
            <span className="placeholder-mark">M</span>
            <span className="placeholder-title">{movie.title}</span>
            <small>포스터 준비 중</small>
          </div>
        )}
        <span className="poster-rank">
          {String(movie.rank).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div className="app" id="home">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="MOMO 홈">
          <span className="brand-icon">M</span>
          <span className="brand-name">MOMO</span>
          <span className="brand-subtitle">MOVIE COMMUNITY</span>
        </a>
        <nav className="main-nav" aria-label="주 메뉴">
          <button type="button" className="nav-link" onClick={() => scrollToSection("home")}>
            홈
          </button>
          <button type="button" className="nav-link" onClick={() => scrollToSection("movies")}>
            영화
          </button>
          <button type="button" className="nav-link" onClick={() => scrollToSection("reviews")}>
            리뷰
          </button>
        </nav>
        <div className="header-actions">
          <label className="header-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="영화 제목 검색"
              aria-label="영화 제목 검색"
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch("")}
                aria-label="검색어 지우기"
              >
                ×
              </button>
            )}
          </label>
          <button
            type="button"
            className="primary-button header-review-button"
            onClick={() => {
              if (movies.length > 0) {
                openReview(movies[0]);
              } else {
                scrollToSection("movies");
              }
            }}
          >
            <span aria-hidden="true">✎</span> 리뷰 작성
          </button>

          {/* 2. 로그인 상태에 따라 이름 및 로그아웃 버튼 표시 */}
          {username ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>{username}님</span>
              <button
                type="button"
                className="outline-button"
                onClick={handleLogout}
                style={{ padding: "6px 10px", fontSize: "13px", cursor: "pointer" }}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link to="/login" className="primary-button header-login-button">
              로그인
            </Link>
          )}
        </div>
      </header>

      <main className="page-container">
        <section className="hero-banner">
          <div className="hero-content">
            <p className="eyebrow">MOVIES BRING US TOGETHER</p>
            <h1>
              좋은 영화는 <br /> 언제나 우리를 설레게 해요.
            </h1>
            <p className="hero-description">
              오늘의 박스오피스와 다양한 영화 리뷰를 만나보세요.
            </p>
            <button
              type="button"
              className="primary-button hero-button"
              onClick={() => scrollToSection("movies")}
            >
              영화 둘러보기 <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-ticket">M</div>
            <span className="hero-sparkle sparkle-one">✦</span>
            <span className="hero-sparkle sparkle-two">✧</span>
          </div>
        </section>

        <div className="content-layout">
          <div className="main-column">
            <section id="movies" className="section-block">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">DAILY BOX OFFICE</p>
                  <h2>오늘의 박스오피스</h2>
                  <p className="section-description">
                    지금 관객들이 많이 찾는 영화를 확인해 보세요.
                  </p>
                </div>
                <span className="section-count"> 총 {filteredMovies.length}편 </span>
              </div>

              {loading && (
                <div className="state-message">
                  <span className="loading-dot" /> 영화 정보를 불러오는 중이에요...
                </div>
              )}

              {!loading && error && (
                <div className="state-message error-state">
                  <p>{error}</p>
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => window.location.reload()}
                  >
                    다시 불러오기
                  </button>
                </div>
              )}

              {!loading && !error && filteredMovies.length === 0 && (
                <div className="state-message">
                  {movies.length === 0
                    ? "표시할 영화가 아직 없어요."
                    : "검색 결과가 없어요. 다른 제목을 입력해 보세요."}
                </div>
              )}

              {!loading && !error && filteredMovies.length > 0 && (
                <div className="movie-grid">
                  {filteredMovies.map((movie) => {
                    const movieReviews = reviews.filter(
                      (review) => review.movieId === movie.id
                    );
                    return (
                      <article className="movie-card" key={movie.id}>
                        <button
                          type="button"
                          className="poster-button"
                          onClick={() => openReview(movie)}
                          aria-label={`${movie.title} 리뷰 작성`}
                        >
                          {renderPoster(movie)}
                        </button>
                        <div className="movie-info">
                          <div className="movie-title-line">
                            <h3>{movie.title}</h3>
                            <span className="rank-label">{movie.rank}위</span>
                          </div>
                          <p className="release-date">
                            {movie.openDate
                              ? `${movie.openDate} 개봉`
                              : "박스오피스 상영작"}
                          </p>
                          <div className="movie-rating">
                            <span className="gold-star">★</span>
                            <span>리뷰 {movieReviews.length}개</span>
                          </div>
                          <div className="movie-stats">
                            <span>누적 관객</span>
                            <strong> {formatNumber(movie.totalAudience)}명 </strong>
                          </div>
                          <div className="movie-stats">
                            <span>오늘 관객</span>
                            <strong>{formatNumber(movie.audience)}명</strong>
                          </div>
                          <div className="movie-card-actions">
                            <button
                              type="button"
                              className="outline-button review-action"
                              onClick={() => openReview(movie)}
                            >
                              리뷰 보기
                            </button>
                            <button
                              type="button"
                              className={`like-button ${
                                likes[movie.id] ? "is-liked" : ""
                              }`}
                              onClick={() => toggleLike(movie.id)}
                              aria-label={
                                likes[movie.id] ? "좋아요 취소" : "좋아요"
                              }
                              aria-pressed={Boolean(likes[movie.id])}
                            >
                              {likes[movie.id] ? "♥" : "♡"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section id="reviews" className="section-block recent-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">COMMUNITY</p>
                  <h2>최근 리뷰</h2>
                  <p className="section-description">
                    다른 사람들과 영화 감상을 나눠보세요.
                  </p>
                </div>
              </div>

              {recentReviews.length === 0 ? (
                <div className="empty-review-panel">
                  <div className="empty-review-icon">✎</div>
                  <h3>첫 번째 리뷰를 남겨보세요</h3>
                  <p>
                    영화를 보고 느낀 감상을 나누면 <br /> MOMO의 영화 이야기가 시작돼요.
                  </p>
                  {movies.length > 0 && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => openReview(movies[0])}
                    >
                      리뷰 작성하기
                    </button>
                  )}
                </div>
              ) : (
                <div className="review-grid">
                  {recentReviews.map((review) => (
                    <article className="community-review" key={review.id}>
                      <div className="review-movie-heading">
                        <div className="review-mini-poster">M</div>
                        <div className="review-movie-text">
                          <h3>{review.movieTitle}</h3>
                          <div className="review-stars">
                            {"★".repeat(review.rating)}
                            <span className="empty-stars">
                              {"☆".repeat(5 - review.rating)}
                            </span>
                          </div>
                          <p>모모 회원 · {review.date}</p>
                        </div>
                      </div>
                      <p className="review-preview">{review.text}</p>
                      <div className="review-card-footer">
                        <span>영화 감상 리뷰</span>
                        <span>별점 {review.rating}.0 / 5.0</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="sidebar">
            <section className="sidebar-panel">
              <h3>영화 찾기</h3>
              <label className="sidebar-search">
                <span aria-hidden="true">⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="영화 제목을 검색하세요"
                  aria-label="영화 찾기"
                />
              </label>
              <div className="sidebar-divider" />
              <h4>박스오피스 순위</h4>
              {popularMovies.map((movie) => (
                <button
                  type="button"
                  className="popular-search"
                  key={movie.id}
                  onClick={() => {
                    setSearch(movie.title);
                    scrollToSection("movies");
                  }}
                >
                  <span>{String(movie.rank).padStart(2, "0")}</span>
                  <span>{movie.title}</span>
                </button>
              ))}
              {!loading && popularMovies.length === 0 && (
                <p className="sidebar-empty">
                  영화 정보를 불러오면 여기에 표시돼요.
                </p>
              )}
            </section>

            <section className="sidebar-promo">
              <div className="promo-icon">✦</div>
              <h3>
                당신의 영화 이야기를 <br /> 들려주세요.
              </h3>
              <p>
                인상 깊었던 장면부터 <br /> 솔직한 감상까지 자유롭게 나눠요.
              </p>
              <button
                type="button"
                className="primary-button promo-button"
                onClick={() => {
                  if (movies.length > 0) openReview(movies[0]);
                  else scrollToSection("movies");
                }}
              >
                리뷰 작성하기 →
              </button>
            </section>
          </aside>
        </div>
      </main>

      <footer className="site-footer">
        <a href="#home" className="footer-brand">
          <span className="brand-icon">M</span> MOMO
        </a>
        <span>영화를 좋아하는 사람들의 작은 커뮤니티</span>
        <span>박스오피스 데이터: KOBIS</span>
      </footer>

      {selectedMovie && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReview();
          }}
        >
          <section
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={closeReview}
              aria-label="닫기"
            >
              ×
            </button>
            <p className="eyebrow">MOMO MOVIE REVIEW</p>
            <h2 id="review-title">{selectedMovie.title}</h2>
            <p className="modal-description">
              이 영화에 대한 솔직한 감상을 나눠보세요.
            </p>
            <form onSubmit={addReview}>
              <label className="rating-label">나의 별점</label>
              <div className="rating-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={
                      star <= rating ? "star-button selected" : "star-button"
                    }
                    onClick={() => setRating(star)}
                    aria-label={`${star}점`}
                    aria-pressed={rating === star}
                  >
                    ★
                  </button>
                ))}
                <span>{rating}.0 / 5.0</span>
              </div>
              <label className="textarea-label" htmlFor="review-content">
                리뷰 내용
              </label>
              <textarea
                id="review-content"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="영화를 보고 어떤 생각이 들었나요?"
                rows={5}
                maxLength={1000}
                required
              />
              <div className="character-count">{reviewText.length} / 1000</div>
              <button
                type="submit"
                className="primary-button submit-review"
                disabled={!reviewText.trim()}
              >
                리뷰 등록하기
              </button>
            </form>
            <div className="modal-review-list">
              <h3>이 영화의 리뷰</h3>
              {reviews.filter(
                (review) => review.movieId === selectedMovie.id
              ).length === 0 ? (
                <p>아직 리뷰가 없어요. 첫 리뷰를 남겨보세요!</p>
              ) : (
                reviews
                  .filter((review) => review.movieId === selectedMovie.id)
                  .map((review) => (
                    <article className="modal-review-item" key={review.id}>
                      <div className="review-stars">
                        {"★".repeat(review.rating)}
                        <span className="empty-stars">
                          {"☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p>{review.text}</p>
                      <span>{review.date}</span>
                    </article>
                  ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
