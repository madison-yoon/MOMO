import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import '../App.css';
import logoImage from '../textlogo.png'; 


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;

function SignUp() {
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
    if (!formData.id.trim()) {
      newErrors.id = "아이디를 입력해 주세요.";
    }

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
            loginId: formData.id,
            email: formData.email,
            password: formData.password,
            nickname: formData.nickname,
          }),
        });

        if (response.ok) {
          setMessage("회원가입이 완료되었습니다!");
            setTimeout(() => {
            navigate("/login");
          }, 1000);        } else {
          setMessage("회원가입에 실패했습니다. 입력한 정보를 확인해 주세요.");
        }
      } catch (error) {
        setMessage("서버와 통신하는 중 오류가 발생했습니다.");
      }
    }
  };
  
  return (
    <main className="signup-page">
      <section className="signup-wrapper">
        {/* 상단 브랜드 영역 */}
        <Link to="/" className="signup-brand">
          <img src={logoImage} alt="MOMO 로고" />
          <span>MOVIE MEMO</span>
        </Link>

        {/* 회원가입 카드 */}
        <section className="signup-card">
          <div className="signup-card-heading">
            <span className="signup-eyebrow">YOUR MOVIE JOURNAL</span>
            <h1>
              나만의 영화 메모를
              <br />
              시작해 볼까요?
            </h1>
            <p>
              좋아하는 영화도, 마음에 남은 장면도
              <br />
              편하게 기록해 보세요.
            </p>

            <div className="signup-note-label">
              <span>MY MOVIE NOTE</span>
              <span>JOIN MOMO</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="signup-field">
              <label htmlFor="signup-id">아이디</label>
              <input
                id="signup-id"
                name="id"
                type="text"
                placeholder="사용할 아이디를 입력해 주세요"
                value={formData.id}
                onChange={handleChange}
                autoComplete="username"
              />
              {errors.id && (
                <p className="signup-error">{errors.id}</p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">이메일</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="이메일 주소를 입력해 주세요"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && (
                <p className="signup-error">{errors.email}</p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">비밀번호</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                placeholder="8~20자 비밀번호를 입력해 주세요"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <p className="signup-hint">
                영문 대문자·소문자·숫자·특수문자를 포함해 주세요.
              </p>
              {errors.password && (
                <p className="signup-error">{errors.password}</p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="signup-passwordConfirm">
                비밀번호 확인
              </label>
              <input
                id="signup-passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력해 주세요"
                value={formData.passwordConfirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.passwordConfirm && (
                <p className="signup-error">
                  {errors.passwordConfirm}
                </p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="signup-nickname">닉네임</label>
              <input
                id="signup-nickname"
                name="nickname"
                type="text"
                placeholder="영화 메모에 표시할 이름"
                value={formData.nickname}
                onChange={handleChange}
                autoComplete="nickname"
              />
              <p className="signup-hint">
                한글·영문·숫자로 2~10자까지 입력할 수 있어요.
              </p>
              {errors.nickname && (
                <p className="signup-error">{errors.nickname}</p>
              )}
            </div>

            <button type="submit" className="signup-submit">
              무료 회원가입하고 영화 메모하러 가기
              <span aria-hidden="true">▶</span>
            </button>

            {message && (
              <p className="signup-message" role="status">
                {message}
              </p>
            )}
          </form>

          <div className="signup-footer">
            <span>이미 계정이 있으신가요?</span>
            <Link to="/login">로그인</Link>
          </div>
        </section>

        <p className="signup-bottom-caption">
          YOUR MOVIES, YOUR MEMORIES.
        </p>
      </section>
    </main>
  );
}

export default SignUp;
