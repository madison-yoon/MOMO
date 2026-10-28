import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../App.css';
import logoImage from '../textlogo.png'; 

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!emailRegex.test(email.trim())) {
      newErrors.email = "올바른 이메일 형식을 입력해 주세요.";
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
            loginId: email, // 백엔드 LoginRequest의 필드명에 맞춤
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
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-logo">
          <img src={logoImage} alt="MOMO 로고" style={{ height: '32px' }} /> 
        </Link>
        <br/>
      

        <p className="auth-description">
          로그인하고 영화 리뷰를 확인해 보세요.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">이메일</label>


            <input
              id="login-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
                setMessage("");
              }}
            />

            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>
          <br/>


          <div className="auth-field">
            <label htmlFor="login-password">비밀번호</label>
          <br/>


            <input
              id="login-password"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
                setMessage("");
              }}
            />

            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>
          <br/>

          <button type="submit" className="auth-submit">
            로그인
          </button>

          {message && <p className="auth-notice">{message}</p>}
        </form>
          <br/>


        <p className="auth-footer">
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
