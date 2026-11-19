import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ArchiveAuthFrame from "../components/redesign/ArchiveAuthFrame";
import { getKakaoCallbackAttempt, KAKAO_STATE_KEY } from "../auth/kakaoFlow";
import { isAuthSessionCurrent } from "../api/AxiosApi";
import { completeLogin } from "../utils/completeLogin";

// 카카오 콜백을 기존 MOMO 로그인 완료 흐름으로 연결한다. 카카오 토큰 자체는 프론트에서 다루지 않는다.
export default function KakaoCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const code = params.get("code");
  const state = params.get("state");
  const providerError = params.get("error");

  useEffect(() => {
    let active = true;
    // 일회용 인가 코드가 주소창·이후 이동의 참조 URL에 남지 않도록 즉시 제거한다.
    window.history.replaceState(window.history.state, "", window.location.pathname);
    if (providerError) {
      if (sessionStorage.getItem(KAKAO_STATE_KEY) === state) sessionStorage.removeItem(KAKAO_STATE_KEY);
      setMessage(providerError === "access_denied" ? "카카오 로그인이 취소되었습니다." : "카카오 인증을 완료하지 못했습니다. 다시 시도해 주세요.");
      return () => { active = false; };
    }
    try {
      const attempt = getKakaoCallbackAttempt(code, state);
      attempt.promise.then(({ data }) => {
        if (!active || attempt.completed) return;
        // 다른 로그인이나 로그아웃 이후 도착한 이전 콜백이 현재 세션을 덮어쓰지 못하게 한다.
        if (!isAuthSessionCurrent(attempt.sessionVersion)) throw new Error("인증 상태가 변경되었습니다. 로그인을 다시 시작해 주세요.");
        completeLogin(data);
        attempt.completed = true;
        navigate("/", { replace: true });
      }).catch(error => {
        if (!active) return;
        if (sessionStorage.getItem(KAKAO_STATE_KEY) === state) sessionStorage.removeItem(KAKAO_STATE_KEY);
        setMessage(error?.response?.data?.message || error?.message || "카카오 로그인을 완료하지 못했습니다. 다시 시작해 주세요.");
      });
    } catch (error) {
      setMessage(error.message);
    }
    return () => { active = false; };
  }, [code, state, providerError, navigate]);

  return <ArchiveAuthFrame><main data-archive-page="login" className="signup-page">
    <section className="signup-wrapper"><section className="signup-card login-card">
      <div className="signup-card-heading"><h1>카카오 로그인</h1></div>
      {message ? <><p role="alert">{message}</p><div className="signup-footer"><Link to="/login">로그인으로 돌아가기</Link></div></>
        : <p role="status">카카오 인증을 확인하고 있어요.</p>}
    </section></section>
  </main></ArchiveAuthFrame>;
}
