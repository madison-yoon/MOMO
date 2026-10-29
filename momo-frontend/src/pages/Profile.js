import { useEffect, useState } from "react";
import "../App.css";
import { Link } from "react-router-dom";

function Profile() {
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const handleDelete = () => {
    const confirmed = window.confirm(
      "정말 회원 탈퇴하시겠습니까?\n탈퇴 후에는 계정 복구가 어려울 수 있습니다.",
    );

    if (!confirmed) {
      return;
    }

    alert("회원 탈퇴 API가 아직 연결되지 않았습니다.");
  };

  // 브라우저에 저장된 회원 정보 불러오기
  useEffect(() => {
    setUserId(localStorage.getItem("username") || "");
    setNickname(localStorage.getItem("nickname") || "");
    setEmail(localStorage.getItem("email") || "");
  }, []);

  // 프로필 수정 모드
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 프로필 정보 저장
  const handleSave = (event) => {
    event.preventDefault();

    if (!nickname.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    localStorage.setItem("nickname", nickname.trim());
    localStorage.setItem("email", email.trim());

    setNickname(nickname.trim());
    setEmail(email.trim());
    setIsEditing(false);

    alert("프로필 정보가 저장되었습니다.");
  };

  // 수정 취소
  const handleCancel = () => {
    setNickname(localStorage.getItem("nickname") || "");
    setEmail(localStorage.getItem("email") || "");
    setIsEditing(false);
  };

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading">
          <h1>마이페이지</h1>
          <p>나의 계정 정보와 영화 활동을 확인해 보세요.</p>
        </header>

        {/* 회원 프로필 */}
        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <h2>내 프로필</h2>
              <p>나의 회원 정보를 확인할 수 있어요.</p>
            </div>
            <div className="profile-card-actions">
              <Link to="/profile/edit" className="profile-button">
                프로필 수정
              </Link>

              <Link
                to="/profile/delete"
                className="profile-button profile-delete-button"
              >
                회원 탈퇴
              </Link>
            </div>

            <div className="profile-card-actions">
              {!isEditing && (
                <>
                  <button
                    type="button"
                    className="profile-button"
                    onClick={handleEdit}
                  >
                    프로필 수정
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <form className="profile-form" onSubmit={handleSave}>
              <label htmlFor="profile-id">아이디</label>
              <input id="profile-id" type="text" value={userId} readOnly />

              <label htmlFor="profile-nickname">닉네임</label>
              <input
                id="profile-nickname"
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                required
              />

              <label htmlFor="profile-email">이메일</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일을 입력해 주세요."
              />

              <div className="profile-form-buttons">
                <button type="submit" className="profile-button">
                  저장
                </button>

                <button
                  type="button"
                  className="profile-button profile-button-secondary"
                  onClick={handleCancel}
                >
                  취소
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-user">
              <div className="profile-avatar">
                {(nickname || userId || "M").charAt(0).toUpperCase()}
              </div>

              <div className="profile-user-info">
                <h3>{nickname || userId || "로그인 사용자"}</h3>

                <p>
                  <span>아이디</span>
                  {userId || "정보 없음"}
                </p>

                <p>
                  <span>닉네임</span>
                  {nickname || "정보 없음"}
                </p>

                <p>
                  <span>이메일</span>
                  {email || "등록된 이메일 정보 없음"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 영화 활동 */}
        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <h2>나의 영화 활동</h2>
              <p>내가 남긴 영화 기록을 모아볼 수 있어요.</p>
            </div>
          </div>

          <div className="profile-activity">
            <article className="profile-activity-item">
              <span className="profile-activity-icon">✎</span>
              <div>
                <h3>작성한 리뷰</h3>
                <p>내가 작성한 영화 리뷰를 확인할 수 있어요.</p>
              </div>
              <span className="profile-coming">준비 중</span>
            </article>

            <article className="profile-activity-item">
              <span className="profile-activity-icon">♥</span>
              <div>
                <h3>좋아요한 리뷰</h3>
                <p>마음에 들었던 리뷰를 모아볼 수 있어요.</p>
              </div>
              <span className="profile-coming">준비 중</span>
            </article>

            <article className="profile-activity-item">
              <span className="profile-activity-icon">★</span>
              <div>
                <h3>관심 영화</h3>
                <p>관심 있는 영화를 관리할 수 있어요.</p>
              </div>
              <span className="profile-coming">준비 중</span>
            </article>
          </div>
        </section>
        {/* 회원 탈퇴 */}
        <section className="profile-card profile-delete-section">
          <div>
            <h2>회원 탈퇴</h2>
            <p>회원 탈퇴를 진행하면 계정 이용에 제한이 생길 수 있습니다.</p>
          </div>

          <button
            type="button"
            className="profile-button profile-delete-button"
            onClick={handleDelete}
          >
            회원 탈퇴
          </button>
        </section>
      </div>
    </main>
  );
}

export default Profile;
//
