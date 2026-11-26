import { safeRequestFailure } from "../utils/safeRequestFailure";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AxiosApi from "../api/AxiosApi";
import { completeLogin } from "../utils/completeLogin";
import { prepareSocialLogin, socialProviderName } from "../auth/socialOAuthFlow";
import kakaoLogo from "../assets/oauth/kakao.svg";
import naverLogo from "../assets/oauth/naver.png";
import googleLogo from "../assets/oauth/google.png";
import { SocialLoginArea, KakaoLoginButton, NaverLoginButton, GoogleLoginButton } from "../styles/redesign/SocialLogin.styles";
import ArchiveAuthFrame from "../components/redesign/ArchiveAuthFrame";

function Login() {
  const [inputId, setInputId] = useState("");
  const [inputPwd, setInputPwd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [socialError, setSocialError] = useState("");
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const navigate = useNavigate();

  // 아이디와 비밀번호 입력 여부 확인
  const isValid = inputId.trim() !== "" && inputPwd !== "" && !isLoading && !socialLoading;

  // 로그인 요청
  const onSubmit = async (event) => {
    event.preventDefault();

    if (!isValid) return;

    setIsLoading(true);

    try {
      const response = await AxiosApi.memberLogin(inputId.trim(), inputPwd);

      if (response.status !== 200 || !response.data) {
        alert("아이디 또는 비밀번호가 틀립니다.");
        return;
      }

      completeLogin(response.data, inputId.trim());

      navigate("/", { replace: true });
    } catch (error) {
      console.error("로그인 에러:", safeRequestFailure(error));

      const message =
        (error.code === "MOMO_INVALID_LOGIN_RESPONSE" ? error.message : error.response?.data?.message) ||
        "아이디 또는 비밀번호가 올바르지 않습니다.";

      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // 일반 로그인과 동시 제출하지 않고 서버가 발급한 state·바인딩 쿠키로 인증을 시작한다.
  const onSocialLogin = async provider => {
    if (isLoading || socialLoading) return;
    setSocialLoading(provider); setSocialError("");
    try {
      const url = await prepareSocialLogin(provider);
      if (mounted.current) window.location.assign(url);
    } catch (error) {
      if (mounted.current) setSocialError(error?.response?.data?.message || `${socialProviderName(provider)} 로그인에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.`);
    } finally { if (mounted.current) setSocialLoading(""); }
  };

  return <ArchiveAuthFrame><main data-archive-page="login" className="signup-page">
    <section className="signup-wrapper"><section className="signup-card login-card">
      <div className="signup-card-heading"><h1>다시 만나서 반가워요.</h1><p>당신의 영화 기록이 기다리고 있어요.</p></div>
      <form onSubmit={onSubmit}>
        <div className="signup-field"><label htmlFor="loginId">아이디</label><input id="loginId" type="text" value={inputId} placeholder="아이디를 입력해 주세요." onChange={(event) => setInputId(event.target.value)} autoComplete="username" /></div>
        <div className="signup-field"><label htmlFor="loginPassword">비밀번호</label><input id="loginPassword" type="password" value={inputPwd} placeholder="비밀번호를 입력해 주세요." onChange={(event) => setInputPwd(event.target.value)} autoComplete="current-password" /></div>
        <button type="submit" className="signup-submit" disabled={!isValid}>{isLoading ? "로그인 중..." : "로그인"}</button>
      </form>
      <SocialLoginArea aria-label="소셜 로그인">
        <p>또는 소셜 계정으로 시작하기</p>
        <KakaoLoginButton type="button" data-provider="kakao" onClick={() => onSocialLogin("kakao")} disabled={isLoading || !!socialLoading} aria-busy={socialLoading === "kakao"}>
          <img src={kakaoLogo} alt="" aria-hidden="true" />
          {socialLoading === "kakao" ? "카카오 연결 중..." : "카카오로 로그인"}
        </KakaoLoginButton>
        <NaverLoginButton type="button" data-provider="naver" onClick={() => onSocialLogin("naver")} disabled={isLoading || !!socialLoading} aria-busy={socialLoading === "naver"}>
          <img src={naverLogo} alt="" aria-hidden="true" />{socialLoading === "naver" ? "네이버 연결 중..." : "네이버로 로그인"}
        </NaverLoginButton>
        <GoogleLoginButton type="button" data-provider="google" onClick={() => onSocialLogin("google")} disabled={isLoading || !!socialLoading} aria-busy={socialLoading === "google"}>
          <img src={googleLogo} alt="" aria-hidden="true" />{socialLoading === "google" ? "구글 연결 중..." : "Google 계정으로 로그인"}
        </GoogleLoginButton>
        {socialError && <p role="alert">{socialError}</p>}
      </SocialLoginArea>
      <div className="signup-footer"><span>아직 계정이 없으신가요?</span><Link to="/signup">회원가입</Link></div>
    </section></section>
  </main></ArchiveAuthFrame>;
}

export default Login;
