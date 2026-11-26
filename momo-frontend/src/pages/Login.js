import { safeRequestFailure } from "../utils/safeRequestFailure";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AxiosApi, { storeLoginTokens } from "../api/AxiosApi";
import { prepareSocialLogin } from "../auth/socialOAuthFlow";
import ArchiveAuthFrame from "../components/redesign/ArchiveAuthFrame";
import {
  SocialLoginArea,
  KakaoLoginButton,
  NaverLoginButton,
  GoogleLoginButton,
} from "../styles/redesign/SocialLogin.styles";

function Login() {
  const [inputId, setInputId] = useState("");
  const [inputPwd, setInputPwd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [socialError, setSocialError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // 아이디와 비밀번호 입력 여부 확인
  const isValid = inputId.trim() !== "" && inputPwd !== "" && !isLoading;

  const navigateAfterLogin = () => {
    const requestedPath = location.state?.from?.pathname;
    navigate(requestedPath && requestedPath !== "/login" ? requestedPath : "/", {
      replace: true,
    });
  };

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

      const loginId = response.data.loginId || inputId.trim();
      const nickname = response.data.nickname || "회원";
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;

      // 토큰 발급 여부 확인
      if (!accessToken || !refreshToken) {
        alert("로그인 토큰을 발급받지 못했습니다.");
        return;
      }

      localStorage.setItem("username", loginId);
      localStorage.setItem("nickname", nickname);
      storeLoginTokens(accessToken, refreshToken);

      window.dispatchEvent(
        new CustomEvent("momo-toast", {
          detail: { nickname },
        }),
      );

      navigateAfterLogin();
    } catch (error) {
      console.error("로그인 에러:", safeRequestFailure(error));

      const message =
        error.response?.data?.message ||
        "아이디 또는 비밀번호가 올바르지 않습니다.";

      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // 공급자 인증 시작 주소는 백엔드에서 발급하고 state 검증 정보를 함께 보관한다.
  const onSocialLogin = async (provider) => {
    setSocialLoading(provider);
    setSocialError("");

    try {
      const authorizationUrl = await prepareSocialLogin(provider);
      window.location.assign(authorizationUrl);
    } catch (error) {
      setSocialError(
        error?.response?.data?.message ||
          error?.message ||
          "소셜 로그인을 시작하지 못했습니다. 설정을 확인해 주세요.",
      );
      setSocialLoading("");
    }
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
        <p>간편 로그인</p>
        {socialError && <p role="alert">{socialError}</p>}
        <KakaoLoginButton type="button" disabled={Boolean(socialLoading)} onClick={() => onSocialLogin("kakao")}>
          {socialLoading === "kakao" ? "카카오 연결 중..." : "카카오로 로그인"}
        </KakaoLoginButton>
        <NaverLoginButton type="button" disabled={Boolean(socialLoading)} onClick={() => onSocialLogin("naver")}>
          {socialLoading === "naver" ? "네이버 연결 중..." : "네이버로 로그인"}
        </NaverLoginButton>
        <GoogleLoginButton type="button" disabled={Boolean(socialLoading)} onClick={() => onSocialLogin("google")}>
          {socialLoading === "google" ? "Google 연결 중..." : "Google로 로그인"}
        </GoogleLoginButton>
      </SocialLoginArea>
      <div className="signup-footer"><span>아직 계정이 없으신가요?</span><Link to="/signup">회원가입</Link></div>
    </section></section>
  </main></ArchiveAuthFrame>;
}

export default Login;
