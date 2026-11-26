import { safeRequestFailure } from "../utils/safeRequestFailure";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavoriteMovies } from "../utils/favorites";
import AxiosApi from "../api/AxiosApi";
import ProfileAvatar from "../components/ProfileAvatar";
import { ProfileDeleteLink } from "../styles/legacy/Profile.styles";

function Profile() {
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState("LOCAL");
  const [profileUserId, setProfileUserId] = useState(null);
  const [hasProfileImage, setHasProfileImage] = useState(false);

  // 영화 활동 개수
  const [favoriteCount, setFavoriteCount] = useState(
    () => getFavoriteMovies().length,
  );
  const [reviewCount, setReviewCount] = useState(null);
  const [likedReviewCount, setLikedReviewCount] = useState(null);

  // 브라우저에 저장된 회원 정보 불러오기
  useEffect(() => {
    setUserId(localStorage.getItem("username") || "");
    setNickname(localStorage.getItem("nickname") || "");
  }, []);

  // 관심 영화 등록 및 해제 상태 감지
  useEffect(() => {
    const updateFavorites = (event) => {
      const favorites = event.detail || getFavoriteMovies();
      setFavoriteCount(favorites.length);
    };

    window.addEventListener("momo-favorites-changed", updateFavorites);

    return () => {
      window.removeEventListener("momo-favorites-changed", updateFavorites);
    };
  }, []);

  // 프로필 및 영화 활동 정보 조회
  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        const response = await AxiosApi.memberMe(controller.signal);

        if (controller.signal.aborted) return;

        // 캐시된 표시값보다 현재 회원 조회의 실제 값을 우선해 빈 이메일·오래된 닉네임을 피한다.
        setUserId(response.data.loginId ?? localStorage.getItem("username") ?? "");
        setNickname(response.data.nickname ?? localStorage.getItem("nickname") ?? "");
        // 이메일이 응답에 없을 때 계정 구분 없는 로컬 값을 노출하지 않는다.
        setEmail(response.data.email || "");
        setProvider(response.data.provider || "LOCAL");
        setProfileUserId(response.data.userId || null);
        setHasProfileImage(Boolean(response.data.profileImage));
      } catch (error) {
        if (error.code !== "ERR_CANCELED" && error.name !== "CanceledError") {
          console.error("프로필 정보 조회 실패:", safeRequestFailure(error));
        }
      }
    };

    // 작성한 리뷰와 좋아요한 리뷰의 전체 개수 조회
    const loadReviewCounts = async () => {
      const [myReviewsResult, likedReviewsResult] = await Promise.allSettled([
        AxiosApi.myReviews(0, controller.signal),
        AxiosApi.myLikedReviews(0, controller.signal),
      ]);

      if (controller.signal.aborted) return;

      // Spring Data Page 응답의 전체 데이터 개수 추출
      const getTotalCount = (result) => {
        if (result.status !== "fulfilled") return null;

        const data = result.value.data;

        return data.page?.totalElements ?? data.totalElements ?? null;
      };

      const myCount = getTotalCount(myReviewsResult);
      const likedCount = getTotalCount(likedReviewsResult);

      if (myCount !== null) {
        setReviewCount(myCount);
      }

      if (likedCount !== null) {
        setLikedReviewCount(likedCount);
      }

      if (myReviewsResult.status === "rejected") {
        console.error("작성한 리뷰 개수 조회 실패:", safeRequestFailure(myReviewsResult.reason));
      }

      if (likedReviewsResult.status === "rejected") {
        console.error(
          "좋아요한 리뷰 개수 조회 실패:",
          safeRequestFailure(likedReviewsResult.reason),
        );
      }
    };

    loadProfile();
    loadReviewCounts();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="profile-page" data-archive-page="profile">
      <div className="profile-container">
        {/* 페이지 제목 */}
        <header className="profile-heading">
          <h1>마이페이지</h1>
          <p>나의 계정 정보와 영화 활동을 확인해 보세요.</p>
        </header>

        {/* 내 프로필 */}
        <section className="profile-card compact-profile-card">
          <div className="profile-card-heading">
            <div>
              <h2>내 프로필</h2>
            </div>

            <div className="profile-card-actions">
              <Link to="/profile/edit" className="profile-button">
                프로필 수정
              </Link>
            </div>
          </div>

          <div className="profile-user">
            <div className="profile-avatar">
              <ProfileAvatar
                userId={profileUserId}
                hasImage={hasProfileImage}
                alt="프로필 이미지"
              />
            </div>

            <div className="profile-user-info">
              <h3>{nickname || userId || "로그인 사용자"}</h3>

              <dl className="compact-profile-fields">
                <div><dt><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="6" r="3" /><path d="M4 18v-2a6 6 0 0 1 12 0v2" /></svg>아이디</dt><dd>{userId || "정보 없음"}</dd></div>
                <div><dt><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><rect x="2" y="4" width="16" height="12" rx="2" /><path d="m2 5 8 6 8-6" /></svg>이메일</dt><dd>{email || (provider === "LOCAL" ? "이메일 조회 정보 없음" : "미등록")}</dd></div>
              </dl>
            </div>
          </div>
        </section>

        {/* 나의 영화 활동 */}
        <section className="profile-card archive-activity-section">
          <div className="profile-card-heading">
            <div>
              <h2>나의 영화 활동</h2>
              <p>내가 남긴 영화 기록을 모아볼 수 있어요.</p>
            </div>
          </div>

          {/* 영화 활동 3개 가로 배치 */}
          <div className="profile-activity-grid">
            {/* 작성한 리뷰 */}
            <Link
              to="/profile/reviews"
              className="profile-activity-item profile-reviews-link"
            >
              <span className="profile-activity-icon">✎</span>
              <h3>작성한 리뷰</h3>
              <strong>{reviewCount === null ? "-" : reviewCount} 개</strong>
              <p>작성한 리뷰 보기 →</p>
            </Link>

            {/* 좋아요한 리뷰 */}
            <Link
              to="/profile/liked-reviews"
              className="profile-activity-item profile-liked-reviews-link"
            >
              <span className="profile-activity-icon">♥</span>
              <h3>좋아요한 리뷰</h3>
              <strong>
                {likedReviewCount === null ? "-" : likedReviewCount} 개
              </strong>
              <p>좋아요한 리뷰 보기 →</p>
            </Link>

            {/* 관심 영화 */}
            <Link
              to="/profile/favorites"
              className="profile-activity-item profile-favorites-link"
            >
              <span className="profile-activity-icon">★</span>
              <h3>관심 영화</h3>
              <strong>{favoriteCount} 편</strong>
              <p>관심 영화 보기 →</p>
            </Link>
          </div>
        </section>

        {/* 회원 탈퇴 */}
        <section className="profile-card profile-delete-section">
          <div>
            <h2>회원 탈퇴</h2>
            <p>회원 탈퇴를 진행하면 계정 이용에 제한이 생길 수 있습니다.</p>
          </div>

          <ProfileDeleteLink
            to="/profile/delete"
            className="profile-button profile-delete-button"
          >
            회원 탈퇴
          </ProfileDeleteLink>
        </section>
      </div>
    </main>
  );
}

export default Profile;
