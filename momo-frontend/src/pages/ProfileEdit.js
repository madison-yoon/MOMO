import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ProfileEdit() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  // 비밀번호 변경을 위한 상태 값
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setUserId(localStorage.getItem("username") || "");
    setNickname(localStorage.getItem("nickname") || "");
    setEmail(localStorage.getItem("email") || "");
  }, []);

  const handleSave = (event) => {
    event.preventDefault();

    if (!nickname.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    // 비밀번호 변경 필드 중 하나라도 입력된 경우에만 비밀번호 검사 및 변경 진행
    if (currentPassword || newPassword || confirmPassword) {
      const savedPassword = localStorage.getItem("password") || "1234"; // 임시 기본 비번

      if (!currentPassword) {
        alert("현재 비밀번호를 입력해 주세요.");
        return;
      }

      if (currentPassword !== savedPassword) {
        alert("현재 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (!newPassword) {
        alert("새 비밀번호를 입력해 주세요.");
        return;
      }

      if (newPassword.length < 6) {
        alert("비밀번호는 6자 이상으로 설정해 주세요.");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("새 비밀번호가 일치하지 않습니다.");
        return;
      }

      // 새 비밀번호 저장
      localStorage.setItem("password", newPassword);
    }

    // 닉네임과 이메일 저장
    localStorage.setItem("nickname", nickname.trim());
    localStorage.setItem("email", email.trim());

    alert("프로필 정보가 수정되었습니다.");
    navigate("/profile");
  };

  return (
    <main className="profile-page">
      <section className="profile-container">
        <header className="profile-heading">
          <h1>프로필 수정</h1>
          <p>회원 정보를 수정할 수 있습니다.</p>
        </header>

        <section className="profile-card">
          <form className="profile-form" onSubmit={handleSave}>
            <label htmlFor="edit-userId">아이디</label>
            <input id="edit-userId" type="text" value={userId} readOnly />

            <label htmlFor="edit-nickname">닉네임</label>
            <input
              id="edit-nickname"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              required
            />

            <label htmlFor="edit-email">이메일</label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해 주세요."
            />

            {/* 구분선 및 비밀번호 변경 입력 영역 */}
            <hr
              style={{
                margin: "24px 0",
                border: "0",
                borderTop: "1px solid #eee",
              }}
            />
            <h3 style={{ marginBottom: "16px", fontSize: "1.1rem" }}>
              비밀번호 변경
            </h3>

            <label htmlFor="current-password">현재 비밀번호</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="비밀번호를 변경하려면 입력하세요."
            />

            <label htmlFor="new-password">새 비밀번호</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="새 비밀번호를 입력해 주세요."
            />

            <label htmlFor="confirm-password">새 비밀번호 확인</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="새 비밀번호를 다시 입력해 주세요."
            />

            <div className="profile-form-buttons" style={{ marginTop: "24px" }}>
              <button type="submit" className="profile-button">
                저장
              </button>

              <button
                type="button"
                className="profile-button profile-button-secondary"
                onClick={() => navigate("/profile")}
              >
                취소
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

export default ProfileEdit;
