import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ProfileEdit() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

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

    localStorage.setItem("nickname", nickname.trim());
    localStorage.setItem("email", email.trim());

    alert("프로필 정보가 저장되었습니다.");
    navigate("/profile");
  };

  return (
    <main className="profile-page">
      <section className="profile-container">
        <header className="profile-heading">
          <p className="profile-eyebrow">MY MOMO</p>
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

            <div className="profile-form-buttons">
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
//

export default ProfileEdit;
