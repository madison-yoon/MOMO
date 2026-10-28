import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../App.css';
import logoImage from '../textlogo.png'; 

function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!id.trim()) {
      newErrors.id = "아이디를 입력해 주세요.";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해 주세요.";
    }

    setErrors(newErrors);
    setMessage("");

    if (Object.keys(newErrors).length === 0) {
      try {
        // 2. 백엔드 서버로 로그인 요청 전송
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loginId: id.trim(), // 백엔드 LoginRequest의 필드명에 맞춤
            password: password,
          }),
        });

        if (response.ok) {
          const data = await response.json(); // 백엔드가 보내주는 유저 데이터
          
          // 백엔드 응답 구조에 맞춰 닉네임이나 이름 저장 (예: data.nickname 또는 data.name 등)
          localStorage.setItem("username", data.nickname || data.name || "모모회원");
          setMessage("로그인에 성공했습니다!");
            setTimeout(() => {
            navigate("/home");
          }, 500);
        } else {
          setMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
      } catch (error) {
        setMessage("서버와 통신하는 중 오류가 발생했습니다.");
      }
    }
  };


return (
  <main className="signup-page">
    <section className="signup-wrapper">
      <Link to="/" className="signup-brand">
        <img src={logoImage} alt="MOMO 로고" />
        <span>MOVIE MEMO</span>
      </Link>

      <section className="signup-card login-card">
        <div className="signup-card-heading">
          <span className="signup-eyebrow">WELCOME BACK</span>
          <h1>
            다시, 나만의 영화 메모로
            <br />
            돌아오셨네요.
          </h1>
          <p>
            로그인하고 마음에 남는 영화와
            <br />
            다양한 리뷰를 만나 보세요.
          </p>
          <div className="signup-note-label">
            <span>MY MOVIE NOTE</span>
            <span>LOGIN TO MOMO</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="signup-field">
            <label htmlFor="login-id">아이디</label>
            <input
              id="login-id"
              type="text"
              placeholder="아이디를 입력해 주세요"
              value={id}
              autoComplete="username"
              onChange={(e) => {
                setId(e.target.value);
                setErrors((prev) => ({ ...prev, id: "" }));
                setMessage("");
              }}
            />
            {errors.id && (
              <p className="signup-error">{errors.id}</p>
            )}
          </div>


          <div className="signup-field">
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
                setMessage("");
              }}
            />
            {errors.password && (
              <p className="signup-error">{errors.password}</p>
            )}
          </div>

          <button type="submit" className="signup-submit">
            로그인
            <span aria-hidden="true">→</span>
          </button>

          {message && (
            <p className="signup-message" role="status">
              {message}
            </p>
          )}
        </form>

        <div className="signup-footer">
          <span>아직 회원이 아니신가요?</span>
          <Link to="/signup">회원가입</Link>
        </div>
      </section>

      <p className="signup-bottom-caption">
        YOUR MOVIES, YOUR MEMORIES.
      </p>
    </section>
  </main>
);

}

export default Login;
