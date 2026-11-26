import { safeRequestFailure } from "../utils/safeRequestFailure";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArchiveAuthFrame from "../components/redesign/ArchiveAuthFrame";
import AxiosApi from "../api/AxiosApi";

/* 정규식 */

// 이메일: 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// 비밀번호: 영문, 숫자, 특수문자 포함 8~20자
const PWD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

// 닉네임: 한글, 영문, 숫자 2~12자
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,12}$/;

function SignUp() {
  // 입력값
  const [inputId, setInputId] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPwd, setInputPwd] = useState("");
  const [inputPwdCheck, setInputPwdCheck] = useState("");
  const [inputNickname, setInputNickname] = useState("");

  // 아이디 중복 확인 상태
  const [idStatus, setIdStatus] = useState("idle");

  const nav = useNavigate();

  // 입력값 유효성 검사
  const isId = inputId.trim().length >= 4 && inputId.trim().length <= 20;
  const isEmail = EMAIL_REGEX.test(inputEmail);
  const isPwd = PWD_REGEX.test(inputPwd);
  const isPwdCheck = inputPwdCheck !== "" && inputPwd === inputPwdCheck;
  const isNickname = NICKNAME_REGEX.test(inputNickname);

  /*
   * 아이디 중복 확인
   * 입력이 멈춘 뒤 0.5초 후 서버에 요청
   */
  useEffect(() => {
    if (!isId) {
      setIdStatus("idle");
      return;
    }

    setIdStatus("checking");

    let ignore = false;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await AxiosApi.memberIdExist(
          inputId.trim(),
          controller.signal,
        );

        if (ignore) return;

        // 이미 존재하는 아이디면 true
        setIdStatus(response.data === true ? "duplicate" : "available");
      } catch (error) {
        if (!ignore) {
          setIdStatus("error");
        }
      }
    }, 500);

    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [inputId, isId]);

  // 아이디 중복 확인 통과 + 나머지 입력값 유효성 검사
  const isIdOk = isId && idStatus === "available";

  const isAllValid = isIdOk && isEmail && isPwd && isPwdCheck && isNickname;

  // 아이디 메시지
  const getIdMessage = () => {
    if (!inputId) return "";
    if (!isId) return "아이디는 4~20자로 입력해 주세요.";

    switch (idStatus) {
      case "checking":
        return "아이디 중복 확인 중...";
      case "available":
        return "사용 가능한 아이디입니다.";
      case "duplicate":
        return "이미 사용 중인 아이디입니다.";
      case "error":
        return "아이디 중복 확인 중 오류가 발생했습니다.";
      default:
        return "";
    }
  };

  // 회원가입 요청
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isAllValid) return;

    try {
      const response = await AxiosApi.memberSignup(
        inputId.trim(),
        inputPwd,
        inputNickname.trim(),
        inputEmail.trim(),
      );
      // 백엔드에서 HTTP 201을 반환하면 회원가입 성공
      if (response.status === 201) {
        alert(`${inputNickname}님, 회원가입이 완료되었습니다.`);
        nav("/login", { replace: true });
      } else {
        alert("회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 오류:", safeRequestFailure(error));
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return <ArchiveAuthFrame><main className="signup-page" data-archive-page="signup">
    <section className="signup-wrapper"><section className="signup-card">
      <div className="signup-card-heading"><h1>MOMO와 함께 시작해요.</h1><p>좋아하는 영화를 나만의 기록으로 남겨보세요.</p></div>
      <form onSubmit={onSubmit}>
        <div className="signup-field"><label htmlFor="signupId">아이디</label><input id="signupId" type="text" name="id" value={inputId} placeholder="아이디를 입력해 주세요." onChange={(event) => setInputId(event.target.value)} required /><p className="signup-message" style={{ color: isIdOk ? "var(--momo-success)" : "var(--momo-error)" }}>{getIdMessage()}</p></div>
        <div className="signup-field"><label htmlFor="signupEmail">이메일</label><input id="signupEmail" type="email" name="email" value={inputEmail} placeholder="이메일을 입력해 주세요." onChange={(event) => setInputEmail(event.target.value.trim())} required /><p className="signup-message" style={{ color: isEmail ? "var(--momo-success)" : "var(--momo-error)" }}>{inputEmail && (isEmail ? "올바른 이메일 형식입니다." : "이메일 형식이 올바르지 않습니다.")}</p></div>
        <div className="signup-field"><label htmlFor="signupPassword">비밀번호</label><input id="signupPassword" type="password" name="password" value={inputPwd} placeholder="영문·숫자·특수문자 8~20자" onChange={(event) => setInputPwd(event.target.value)} required autoComplete="new-password" /><p className="signup-message" style={{ color: isPwd ? "var(--momo-success)" : "var(--momo-error)" }}>{inputPwd && (isPwd ? "사용 가능한 비밀번호입니다." : "영문, 숫자, 특수문자를 포함한 8~20자로 입력하세요.")}</p></div>
        <div className="signup-field"><label htmlFor="signupPasswordCheck">비밀번호 확인</label><input id="signupPasswordCheck" type="password" value={inputPwdCheck} placeholder="비밀번호를 다시 입력해 주세요." onChange={(event) => setInputPwdCheck(event.target.value)} required autoComplete="new-password" /><p className="signup-message" style={{ color: isPwdCheck ? "var(--momo-success)" : "var(--momo-error)" }}>{inputPwdCheck && (isPwdCheck ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다.")}</p></div>
        <div className="signup-field"><label htmlFor="signupNickname">닉네임</label><input id="signupNickname" type="text" value={inputNickname} placeholder="닉네임을 입력해 주세요." onChange={(event) => setInputNickname(event.target.value.trim())} required /><p className="signup-message" style={{ color: isNickname ? "var(--momo-success)" : "var(--momo-error)" }}>{inputNickname && (isNickname ? "사용 가능한 닉네임입니다." : "한글, 영문, 숫자로 2~12자 입력하세요.")}</p></div>
        <button type="submit" className="signup-submit" disabled={!isAllValid}>회원가입</button>
      </form>
      <div className="signup-footer"><span>이미 계정이 있으신가요?</span><Link to="/login">로그인</Link></div>
    </section></section>
  </main></ArchiveAuthFrame>;
}

export default SignUp;
