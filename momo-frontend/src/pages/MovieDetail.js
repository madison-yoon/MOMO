import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ko-KR");
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

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Home에서 전달받은 영화 정보 또는 기본값 설정
  const movie = location.state?.movie || {
    id,
    title: "영화 정보",
    rank: 1,
    releaseDate: "",
    audience: 0,
    totalAudience: 0,
    directors: [],
    cast: [],
  };

  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reaction, setReaction] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const movieReviews = reviews.filter((r) => r.movieId === movie.id);
  const likeCount = movieReviews.filter((r) => r.reaction === "like").length;
  const dislikeCount = movieReviews.filter(
    (r) => r.reaction === "dislike",
  ).length;
  const totalReactions = likeCount + dislikeCount;
  const rating =
    totalReactions > 0
      ? ((likeCount / totalReactions) * 10).toFixed(1)
      : "평가 없음";

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
      movieId: movie.id,
      text: reviewText.trim(),
      reaction,
      date: new Date().toLocaleDateString("ko-KR"),
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewText("");
    setReaction("");
    setIsReviewOpen(false);
  }

  const directors = normalizePeople(movie.directors);
  const actors = normalizePeople(movie.cast);

  return (
    <main className="movie-detail-page">
      <button className="detail-back-button" onClick={() => navigate("/")}>
        ← 메인으로 돌아가기
      </button>

      <section className="movie-detail-header">
        <div className="movie-detail-poster">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} />
          ) : (
            <div className="poster-placeholder">
              <span>🎬</span>
              <p>{movie.title}</p>
            </div>
          )}
        </div>

        <div className="movie-detail-info">
          <span className="detail-rank">BOX OFFICE {movie.rank}위</span>
          <h1>{movie.title}</h1>
          <p>개봉일: {movie.releaseDate || "정보 없음"}</p>
          <p>일일 관객수: {formatNumber(movie.audience)}명</p>
          <p>누적 관객수: {formatNumber(movie.totalAudience)}명</p>
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
                onClick={() => setSelectedPerson({ ...person, type: "감독" })}
              >
                {person.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="people-empty">감독 정보가 아직 연결되지 않았습니다.</p>
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
                onClick={() => setSelectedPerson({ ...person, type: "배우" })}
              >
                {person.name}
                {person.role && (
                  <span className="person-role">({person.role})</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="people-empty">배우 정보가 아직 연결되지 않았습니다.</p>
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
            <span>{movie.title}</span>
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

export default MovieDetail;
