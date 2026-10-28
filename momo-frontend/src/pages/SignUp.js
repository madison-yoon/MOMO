import { useState } from "react";
import { Link } from "react-router-dom";
import '../App.css';
import logoImage from '../textlogo.png'; 


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;

function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해 주세요.";
    }

    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "8~20자, 영문 대문자·소문자·숫자·특수문자를 포함해 주세요.";
    }

    if (formData.passwordConfirm !== formData.password) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    if (!nicknameRegex.test(formData.nickname)) {
      newErrors.nickname = "닉네임은 한글·영문·숫자로 2~10자 입력해 주세요.";
    }

    setErrors(newErrors);
    setMessage("");

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loginId: formData.email,
            email: formData.email,
            password: formData.password,
            nickname: formData.nickname,
          }),
        });

        if (response.ok) {
          setMessage("회원가입이 완료되었습니다!");
          // 필요하다면 로그인 페이지로 이동: navigate('/login') 등
        } else {
          setMessage("회원가입에 실패했습니다. 입력한 정보를 확인해 주세요.");
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

        <h1>회원가입</h1>
        <p className="auth-description">
          회원가입하고 다양한 영화 리뷰를 만나 보세요.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="signup-email">EMAIL</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="이메일을 입력해 주세요"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">비밀번호</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-passwordConfirm">비밀번호 확인</label>
            <input
              id="signup-passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력해 주세요"
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
            {errors.passwordConfirm && (
              <p className="auth-error">{errors.passwordConfirm}</p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="signup-nickname">닉네임</label>
            <input
              id="signup-nickname"
              name="nickname"
              type="text"
              placeholder="닉네임을 입력해 주세요"
              value={formData.nickname}
              onChange={handleChange}
            />
            {errors.nickname && <p className="auth-error">{errors.nickname}</p>}
          </div>

          <button type="submit" className="auth-submit">
            회원가입
          </button>

          {message && <p className="auth-notice">{message}</p>}
        </form>

        <p className="auth-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </section>
    </main>
  );
}

export default SignUp;
