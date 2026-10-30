import React, { useEffect, useMemo, useState } from "react";
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

function normalizePeople(people) {
  if (!people) return [];

  if (typeof people === "string") {
    return people
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name, role: "", works: [] }));
  }

  if (!Array.isArray(people)) {
    people = [people];
  }

  return people.map((person) => {
    if (typeof person === "string") {
      return { name: person, role: "", works: [] };
    }

    return {
      name:
        person.name ||
        person.peopleNm ||
        person.actorName ||
        person.directorName ||
        "이름 없음",
      role:
        person.role || person.cast || person.character || person.castName || "",
      works: person.works || person.filmography || [],
    };
  });
}

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [reviews, setReviews] = useState([]);
  const [likes, setLikes] = useState({});

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reaction, setReaction] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState(null);

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

  const movieReviews = selectedMovie
    ? reviews.filter((review) => review.movieId === selectedMovie.id)
    : [];

  const likeCount = movieReviews.filter(
    (review) => review.reaction === "like",
  ).length;

  const dislikeCount = movieReviews.filter(
    (review) => review.reaction === "dislike",
  ).length;

  const totalReactions = likeCount + dislikeCount;

  const rating =
    totalReactions > 0
      ? ((likeCount / totalReactions) * 10).toFixed(1)
      : "평가 없음";

  function openMovie(movie) {
    setSelectedMovie(movie);
    setSelectedPerson(null);
    setIsReviewOpen(false);
    setReviewText("");
    setReaction("");
  }

  function goBack() {
    setSelectedMovie(null);
    setSelectedPerson(null);
    setIsReviewOpen(false);
  }

  function addReview() {
    if (!reaction) {
      alert("좋아요 또는 싫어요를 선택해 주세요.");
      return;
    }

    if (!reviewText.trim()) {
      alert("리뷰 내용을 입력해 주세요.");
      return;
    }

    const newReview = {
      id: Date.now(),
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      text: reviewText.trim(),
      reaction,
      date: new Date().toLocaleDateString("ko-KR"),
    };

    setReviews((prev) => [newReview, ...prev]);
    setReviewText("");
    setReaction("");
    setIsReviewOpen(false);
  }

  function toggleLike(movieId) {
    setLikes((prev) => ({
      ...prev,
      [movieId]: !prev[movieId],
    }));
  }

  function getPeople(list) {
    return normalizePeople(list);
  }

  function openPerson(person, type) {
    setSelectedPerson({ ...person, type });
  }

  if (selectedMovie) {
    const directors = getPeople(selectedMovie.directors);
    const actors = getPeople(selectedMovie.cast);

    return (
      <main className="movie-detail-page">
        <button className="detail-back-button" onClick={goBack}>
          ← 메인으로 돌아가기
        </button>

        <section className="movie-detail-header">
          <div className="movie-detail-poster">
            {selectedMovie.posterUrl ? (
              <img src={selectedMovie.posterUrl} alt={selectedMovie.title} />
            ) : (
              <div className="poster-placeholder">
                <span>🎬</span>
                <p>{selectedMovie.title}</p>
              </div>
            )}
          </div>

          <div className="movie-detail-info">
            <span className="detail-rank">
              BOX OFFICE {selectedMovie.rank}위
            </span>

            <h1>{selectedMovie.title}</h1>

            <p>개봉일: {selectedMovie.releaseDate || "정보 없음"}</p>
            <p>일일 관객수: {formatNumber(selectedMovie.audience)}명</p>
            <p>누적 관객수: {formatNumber(selectedMovie.totalAudience)}명</p>
          </div>
        </section>

        <section className="movie-rating-panel">
          <h2>관객 평점</h2>
          <div className="movie-rating-number">{rating}</div>

          <div className="detail-reaction-counts">
            <div className="detail-reaction-count">
              👍 좋아요 <strong>{likeCount}</strong>
            </div>
            <div className="detail-reaction-count">
              👎 싫어요 <strong>{dislikeCount}</strong>
            </div>
          </div>
        </section>

        <section className="detail-content-section">
          <h2>감독</h2>

          {directors.length > 0 ? (
            <div className="people-list">
              {directors.map((person, index) => (
                <button
                  className="person-chip"
                  key={index}
                  onClick={() => openPerson(person, "감독")}
                >
                  {person.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="people-empty">
              감독 정보가 아직 연결되지 않았습니다.
            </p>
          )}
        </section>

        <section className="detail-content-section">
          <h2>출연 배우</h2>

          {actors.length > 0 ? (
            <div className="people-list">
              {actors.map((person, index) => (
                <button
                  className="person-chip"
                  key={index}
                  onClick={() => openPerson(person, "배우")}
                >
                  {person.name}
                  {person.role && (
                    <span className="person-role">({person.role})</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="people-empty">
              배우 정보가 아직 연결되지 않았습니다.
            </p>
          )}
        </section>

        {selectedPerson && (
          <section className="person-filmography">
            <h2>{selectedPerson.name} 필모그래피</h2>
            <p>{selectedPerson.type}</p>

            {selectedPerson.works?.length > 0 ? (
              <ul className="filmography-list">
                {selectedPerson.works.map((work, index) => (
                  <li key={index}>
                    {typeof work === "string"
                      ? work
                      : work.title || work.movieNm || "작품 정보"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>필모그래피 정보가 아직 연결되지 않았습니다.</p>
            )}

            <button onClick={() => setSelectedPerson(null)}>닫기</button>
          </section>
        )}

        <section className="detail-content-section">
          <h2>리뷰</h2>

          <div className="review-write-section">
            <button
              className="review-write-toggle"
              onClick={() => setIsReviewOpen((prev) => !prev)}
            >
              <span>{selectedMovie.title}</span>
              <span className="review-toggle-arrow">
                {isReviewOpen ? "▲" : "▼"}
              </span>
            </button>

            {isReviewOpen && (
              <div className="review-write-content">
                <h3>이 영화는 어떠셨나요?</h3>

                <div className="reaction-buttons">
                  <button
                    className={`reaction-button ${
                      reaction === "like" ? "selected-like" : ""
                    }`}
                    onClick={() => setReaction("like")}
                  >
                    👍 좋아요
                  </button>

                  <button
                    className={`reaction-button ${
                      reaction === "dislike" ? "selected-dislike" : ""
                    }`}
                    onClick={() => setReaction("dislike")}
                  >
                    👎 싫어요
                  </button>
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="영화에 대한 리뷰를 작성해 주세요."
                  maxLength={1000}
                />

                <div className="review-form-actions">
                  <span>{reviewText.length}/1000</span>
                  <button onClick={addReview}>리뷰 등록</button>
                </div>
              </div>
            )}
          </div>

          {movieReviews.length > 0 ? (
            <div className="detail-review-list">
              {movieReviews.map((review) => (
                <article className="detail-review-card" key={review.id}>
                  <div>
                    {review.reaction === "like" ? "👍 좋아요" : "👎 싫어요"}
                    <span>{review.date}</span>
                  </div>
                  <p>{review.text}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="people-empty">아직 작성된 리뷰가 없습니다.</p>
          )}
        </section>
      </main>
    );
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

        {reviews.length > 0 ? (
          <div className="review-grid">
            {reviews.slice(0, 6).map((review) => (
              <article className="review-card" key={review.id}>
                <h3>{review.movieTitle}</h3>
                <p>{review.text}</p>
                <span>
                  {review.reaction === "like" ? "👍 좋아요" : "👎 싫어요"}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="movie-message">
            아직 작성된 리뷰가 없습니다. 첫 리뷰를 작성해 보세요!
          </p>
        )}
      </section>
    </main>
  );
}

export default Home;
