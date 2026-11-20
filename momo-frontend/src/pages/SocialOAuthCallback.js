import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ArchiveAuthFrame from "../components/redesign/ArchiveAuthFrame";
import { getSocialCallbackAttempt, clearSocialCallbackState, socialProviderName } from "../auth/socialOAuthFlow";
import { isAuthSessionCurrent, isAuthIdentityCurrent, clearAuthSession, getAuthSessionMarker } from "../api/AxiosApi";
import { completeLogin } from "../utils/completeLogin";

// 세 공급자의 콜백을 공유하되 탈퇴 응답에는 로그인 완료 처리를 절대 적용하지 않는다.
export default function SocialOAuthCallback({ provider }) {
  const name = socialProviderName(provider);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const code = params.get("code");
  const state = params.get("state");
  const providerError = params.get("error");

  useEffect(() => {
    let active = true;
    // 일회용 코드가 주소창과 참조 URL에 남지 않도록 즉시 제거한다.
    window.history.replaceState(window.history.state, "", window.location.pathname);
    if (providerError) {
      clearSocialCallbackState(provider, state);
      setMessage(providerError === "access_denied" ? `${name} 인증이 취소되었습니다.` : `${name} 인증을 완료하지 못했습니다. 다시 시도해 주세요.`);
      return () => { active = false; };
    }
    try {
      const attempt = getSocialCallbackAttempt(provider, code, state);
      attempt.promise.then(({ data }) => {
        if (!active || attempt.completed) return;
        if (!isAuthSessionCurrent(attempt.sessionVersion) || getAuthSessionMarker() !== attempt.sessionMarker || (attempt.purpose === "DELETE" && !isAuthIdentityCurrent(attempt.identity)))
          throw new Error("인증 상태가 변경되었습니다. 다시 시작해 주세요.");
        if (attempt.purpose === "DELETE") {
          if (!clearAuthSession(attempt.sessionVersion)) return;
          window.alert("회원 탈퇴가 완료되었습니다.");
        } else completeLogin(data);
        attempt.completed = true;
        clearSocialCallbackState(provider, state);
        navigate(attempt.purpose === "DELETE" ? "/login" : "/", { replace: true });
      }).catch(error => {
        if (!active) return;
        clearSocialCallbackState(provider, state);
        setMessage(error?.response?.data?.message || error?.message || `${name} 인증을 완료하지 못했습니다. 다시 시작해 주세요.`);
      });
    } catch (error) { setMessage(error.message); }
    return () => { active = false; };
  }, [code, state, providerError, navigate, provider, name]);

  return <ArchiveAuthFrame><main data-archive-page="login" className="signup-page">
    <section className="signup-wrapper"><section className="signup-card login-card">
      <div className="signup-card-heading"><h1>{name} 인증</h1></div>
      {message ? <><p role="alert">{message}</p><div className="signup-footer"><Link to="/login">로그인으로 돌아가기</Link></div></>
        : <p role="status">{name} 인증을 확인하고 있어요.</p>}
    </section></section>
  </main></ArchiveAuthFrame>;
}
