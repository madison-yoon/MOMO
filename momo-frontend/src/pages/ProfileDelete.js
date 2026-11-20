import { safeRequestFailure } from "../utils/safeRequestFailure";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosApi, { clearAuthSession, getAuthSessionVersion, isAuthSessionCurrent, getAuthSessionIdentity, isAuthIdentityCurrent } from "../api/AxiosApi";
import { prepareSocialDelete, DELETE_CONFIRMATION } from "../auth/socialOAuthFlow";

function ProfileDelete() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const isSocial = provider !== null && provider !== "LOCAL";
  // 추가 계정 확인이 필요한 두 공급자는 안내와 버튼 문구를 공유한다.
  const verificationProvider = { NAVER: "네이버", GOOGLE: "Google" }[provider];
  const deleteButtonLabel = verificationProvider ? `${verificationProvider} 계정 확인 후 탈퇴` : "회원 탈퇴";

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const version = getAuthSessionVersion();
    AxiosApi.memberMe(controller.signal).then(({data}) => {
      if (active && isAuthSessionCurrent(version)) setProvider(data.provider || "LOCAL");
    }).catch(error => {
      if (active && error.code !== "ERR_CANCELED") setLoadError(error.response?.data?.message || "회원 정보를 확인하지 못했습니다. 다시 접속해 주세요.");
    });
    return () => { active = false; controller.abort(); };
  }, []);

  const handleDelete = async () => {
    if (!provider || busy || !isConfirmed) return;
    if (!isSocial && !password.trim()) { alert("비밀번호를 입력해 주세요."); return; }
    if (isSocial && confirmation !== DELETE_CONFIRMATION) { alert("탈퇴 확인 문구를 정확하게 입력해 주세요."); return; }
    if (!window.confirm("정말 회원 탈퇴하시겠습니까?")) return;
    const sessionVersion = getAuthSessionVersion();
    const identity = getAuthSessionIdentity();
    const current = () => isAuthSessionCurrent(sessionVersion) && (!identity || isAuthIdentityCurrent(identity));
    try {
      setBusy(true);
      const agreement = {agreed:true, confirmation};
      if (isSocial && provider !== "KAKAO") {
        const url = await prepareSocialDelete(provider.toLowerCase(), agreement);
        if (current()) window.location.assign(url);
        return;
      }
      if (isSocial) await AxiosApi.socialMemberDelete(agreement);
      else await AxiosApi.memberDelete(password);
      if (!current() || !clearAuthSession(sessionVersion)) return;
      localStorage.removeItem("password");
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/login", { replace: true });
    } catch (error) {
      if (!current() || error.code === "MOMO_AUTH_SESSION_CHANGED" || error.momoAuthExpiredHandled) return;
      console.error("회원 탈퇴 실패:", safeRequestFailure(error));
      alert(error.response?.data?.message || (typeof error.response?.data === "string" ? error.response.data : "회원 탈퇴 중 오류가 발생했습니다."));
    } finally { setBusy(false); }
  };

  return <main className="profile-page" data-archive-page="delete"><section className="profile-container">
    <header className="profile-heading"><h1>회원 탈퇴</h1><p>탈퇴하기 전에 안내 사항을 확인해 주세요.</p></header>
    <section className="profile-card profile-delete-page-card">
      <h2>정말 탈퇴하시겠습니까?</h2>
      <p>탈퇴하면 회원 정보와 작성한 기록이 삭제되며 복구할 수 없습니다.</p>
      {loadError ? <p role="alert">{loadError}</p> : provider === null ? <p role="status">회원 정보를 확인하고 있어요.</p> : <>
        {verificationProvider ? <>
          <p>회원 탈퇴를 완료하려면 외부 계정 확인이 한 번 더 필요합니다.</p>
          <p>탈퇴 버튼을 누르면 {verificationProvider} 로그인·계정 선택 화면으로 이동합니다. 현재 MOMO에 연결된 동일한 계정으로 인증해 주세요.</p>
          <p>인증이 완료되면 외부 연결 해제와 MOMO 회원 탈퇴가 자동으로 진행됩니다.</p>
          <p>{verificationProvider} 계정 자체는 삭제되지 않습니다.</p>
        </> : <p>{isSocial ? "소셜 계정 연결 해제 후 MOMO 회원 정보를 삭제합니다." : "계정을 삭제하려면 본인 확인을 위해 현재 비밀번호를 입력해 주세요."}</p>}
        <div style={{margin:"20px 0"}}>
          <label style={{display:"block",marginBottom:"8px",fontWeight:"bold"}} htmlFor={isSocial ? "delete-confirmation" : "delete-password"}>{isSocial ? "탈퇴 확인 문구" : "현재 비밀번호"}</label>
          {isSocial ? <><p>아래에 ‘MOMO 회원 탈퇴’를 정확하게 입력해 주세요.</p><input style={{width:"100%",padding:"10px",boxSizing:"border-box"}} id="delete-confirmation" value={confirmation} onChange={event=>setConfirmation(event.target.value)} disabled={busy} autoComplete="off" /></>
            : <input style={{width:"100%",padding:"10px",boxSizing:"border-box"}} id="delete-password" type="password" value={password} onChange={event=>setPassword(event.target.value)} placeholder="비밀번호를 입력해 주세요." autoComplete="current-password" disabled={busy} />}
        </div>
        <label className="profile-delete-check"><input type="checkbox" checked={isConfirmed} onChange={event=>setIsConfirmed(event.target.checked)} disabled={busy} />회원 탈퇴 안내를 확인했습니다.</label>
      </>}
      <div className="profile-form-buttons" style={{marginTop:"20px"}}>
        <button type="button" className="profile-button profile-delete-button" onClick={handleDelete} disabled={!provider || !isConfirmed || busy || (isSocial && confirmation !== DELETE_CONFIRMATION)}>{busy ? "처리 중..." : deleteButtonLabel}</button>
        <button type="button" className="profile-button profile-button-secondary" onClick={()=>navigate("/profile")} disabled={busy}>취소</button>
      </div>
    </section>
  </section></main>;
}
export default ProfileDelete;
