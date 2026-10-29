import { useEffect, useState } from "react";
import "../App.css";

// 어제 날짜를 YYYYMMDD 형식으로 만들기
function getYesterdayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

// 관객 수에 쉼표 표시하기
function formatNumber(number) {
  return Number(number || 0).toLocaleString("ko-KR");
}

function Home() {
  // 영화 목록
  const [movies, setMovies] = useState([]);

  // 영화 검색어
  const [search, setSearch] = useState("");

  // 영화 정보를 불러오는 상태
  const [loading, setLoading] = useState(true);

  // 오류 메시지
  const [error, setError] = useState("");

  // 최근 리뷰 목록
  const [reviews, setReviews] = useState([]);

  // 좋아요 상태
  const [likes, setLikes] = useState({});

  // 리뷰 작성 대상 영화
  const [selectedMovie, setSelectedMovie] = useState(null);

  // 리뷰 내용
  const [reviewText, setReviewText] = useState("");

  // 별점
  const [rating, setRating] = useState(5);

  // 백엔드에서 영화 목록 가져오기
  useEffect(() => {
    async function getMovies() {
      try {
        setLoading(true);
        setError("");

        const targetDate = getYesterdayDate();

        const response = await fetch(
          `http://localhost:8111/api/boxoffice/daily?targetDate=${targetDate}`,
        );

        if (!response.ok) {
          throw new Error("영화 정보를 불러오지 못했습니다.");
        }

        const data = await response.json();

        // 백엔드 응답에서 영화 배열 찾기
        let movieList = [];

        if (Array.isArray(data)) {
          movieList = data;
        } else if (Array.isArray(data.movies)) {
          movieList = data.movies;
        } else if (Array.isArray(data.dailyBoxOfficeList)) {
          movieList = data.dailyBoxOfficeList;
        }

        // 화면에서 사용할 영화 정보 정리
        const formattedMovies = movieList.map((movie, index) => ({
          id: movie.movieCode || movie.id || index,
          title: movie.title || movie.movieNm || "제목 없음",
          rank: Number(movie.rank || 0),
          audience: Number(
            movie.audienceCount || movie.audience || movie.audiCnt || 0,
          ),
          totalAudience: Number(movie.totalAudience || movie.audiAcc || 0),
          releaseDate: movie.releaseDate || movie.openDate || "",
          posterUrl: movie.posterUrl || "",
        }));

        setMovies(formattedMovies);
      } catch (err) {
        console.error(err);
        setError(
          "영화 정보를 불러오지 못했습니다. 백엔드 서버를 확인해 주세요.",
        );
      } finally {
        setLoading(false);
      }
    }

    getMovies();
  }, []);

  // 검색어에 맞는 영화만 골라내기
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // 리뷰 작성창 열기
  function openReview(movie) {
    setSelectedMovie(movie);
    setReviewText("");
    setRating(5);
  }

  // 리뷰 작성창 닫기
  function closeReview() {
    setSelectedMovie(null);
    setReviewText("");
    setRating(5);
  }

  // 리뷰 등록하기
  function addReview(event) {
    event.preventDefault();

    if (reviewText.trim() === "") {
      return;
    }

    const newReview = {
      id: Date.now(),
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      text: reviewText.trim(),
      rating: rating,
      date: new Date().toLocaleDateString("ko-KR"),
    };

    setReviews([newReview, ...reviews]);
    closeReview();
  }

  // 좋아요 누르기
  function toggleLike(movieId) {
    setLikes({
      ...likes,
      [movieId]: !likes[movieId],
    });
  }

  // 영화 목록으로 이동하기
  function goToMovies() {
    document.getElementById("movies").scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <div className="home-page">
      {/* 1. 홈 소개 영역 */}
      <section className="hero-banner">
        <div className="hero-content">
          <p className="eyebrow">MOVIE MEMO</p>

          <h1>
            영화를 보고 난 뒤,
            <br />
            당신의 생각을 기록하세요.
          </h1>

          <p className="hero-description">
            오늘의 영화부터 다른 사람들의 감상까지.
            <br />
            MOMO에서 영화 이야기를 시작해 보세요.
          </p>

          <button type="button" className="primary-button" onClick={goToMovies}>
            영화 둘러보기 →
          </button>
        </div>
      </section>

      {/* 2. 영화 목록 영역 */}
      <section id="movies" className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">DAILY BOX OFFICE</p>
            <h2>오늘의 박스오피스</h2>
            <p className="section-description">
              관객들이 많이 찾은 영화를 확인해 보세요.
            </p>
          </div>

          <span>총 {filteredMovies.length}편</span>
        </div>

        {/* 영화 검색 */}
        <div className="home-search">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="영화 제목 검색"
          />
        </div>

        {/* 로딩 중 */}
        {loading && (
          <div className="state-message">영화 정보를 불러오는 중입니다.</div>
        )}

        {/* 오류 발생 */}
        {!loading && error !== "" && (
          <div className="state-message">
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

        {/* 검색 결과가 없는 경우 */}
        {!loading && error === "" && filteredMovies.length === 0 && (
          <div className="state-message">검색 결과가 없습니다.</div>
        )}

        {/* 영화 카드 */}
        {!loading && error === "" && filteredMovies.length > 0 && (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <article className="movie-card" key={movie.id}>
                <div className="poster-frame">
                  {movie.posterUrl ? (
                    <img
                      className="movie-poster"
                      src={movie.posterUrl}
                      alt={`${movie.title} 영화 포스터`}
                    />
                  ) : (
                    <div className="poster-placeholder">
                      <span className="placeholder-mark">M</span>
                      <span>{movie.title}</span>
                      <small>포스터 준비 중</small>
                    </div>
                  )}

                  <span className="poster-rank">{movie.rank}위</span>
                </div>

                <div className="movie-info">
                  <h3>{movie.title}</h3>

                  <p>
                    {movie.releaseDate
                      ? `${movie.releaseDate} 개봉`
                      : "박스오피스 상영작"}
                  </p>

                  <p>오늘 관객 {formatNumber(movie.audience)}명</p>

                  <p>누적 관객 {formatNumber(movie.totalAudience)}명</p>

                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => openReview(movie)}
                  >
                    리뷰 작성
                  </button>

                  <button
                    type="button"
                    className="like-button"
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

      {/* 3. 최근 리뷰 영역 */}
      <section id="reviews" className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMMUNITY</p>
            <h2>최근 리뷰</h2>
            <p className="section-description">
              다른 사람들과 영화 감상을 나눠보세요.
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-review-panel">
            <h3>첫 번째 리뷰를 남겨보세요.</h3>
            <p>영화를 보고 느낀 감상을 기록해 보세요.</p>
          </div>
        ) : (
          <div className="review-grid">
            {reviews.slice(0, 3).map((review) => (
              <article className="community-review" key={review.id}>
                <h3>{review.movieTitle}</h3>

                <p>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>

                <p>{review.text}</p>
                <small>{review.date}</small>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. 리뷰 작성창 */}
      {selectedMovie !== null && (
        <div className="modal-backdrop">
          <section className="review-modal">
            <button type="button" className="modal-close" onClick={closeReview}>
              닫기
            </button>

            <h2>{selectedMovie.title} 리뷰 작성</h2>

            <form onSubmit={addReview}>
              <label>별점</label>

              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                <option value={1}>1점</option>
                <option value={2}>2점</option>
                <option value={3}>3점</option>
                <option value={4}>4점</option>
                <option value={5}>5점</option>
              </select>

              <label htmlFor="review-content">리뷰 내용</label>

              <textarea
                id="review-content"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="영화를 보고 어떤 생각이 들었나요?"
                rows={5}
                maxLength={1000}
                required
              />

              <p>{reviewText.length} / 1000자</p>

              <button
                type="submit"
                className="primary-button"
                disabled={reviewText.trim() === ""}
              >
                리뷰 등록
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Home;
