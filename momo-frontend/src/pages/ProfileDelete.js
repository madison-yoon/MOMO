import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function ProfileDelete() {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleDelete = () => {
    if (!isConfirmed) {
      alert("회원 탈퇴 안내를 확인해 주세요.");
      return;
    }

    // 실제 DB 탈퇴 API는 아직 연결되지 않음
    alert("회원 탈퇴 API가 아직 연결되지 않았습니다.");
  };

  return (
    <main className="profile-page">
      <section className="profile-container">
        <header className="profile-heading">
          <p className="profile-eyebrow">MY MOMO</p>
          <h1>회원 탈퇴</h1>
          <p>탈퇴하기 전에 안내 사항을 확인해 주세요.</p>
        </header>

        <section className="profile-card profile-delete-page-card">
          <h2>정말 탈퇴하시겠습니까?</h2>
          <p>
            현재 회원 탈퇴 기능은 준비 중입니다. 실제 계정 삭제는 백엔드 API
            연결 후 진행할 수 있습니다.
          </p>

          <label className="profile-delete-check">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(event) => setIsConfirmed(event.target.checked)}
            />
            회원 탈퇴 안내를 확인했습니다.
          </label>

          <div className="profile-form-buttons">
            <button
              type="button"
              className="profile-button profile-delete-button"
              onClick={handleDelete}
            >
              탈퇴 진행
            </button>

            <button
              type="button"
              className="profile-button profile-button-secondary"
              onClick={() => navigate("/profile")}
            >
              취소
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProfileDelete;
