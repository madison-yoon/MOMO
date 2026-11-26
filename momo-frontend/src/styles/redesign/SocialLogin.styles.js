import styled from "styled-components";

// 카드와 일반 로그인 디자인은 유지하고 공급자 버튼만 별도 영역으로 분리한다.
export const SocialLoginArea = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid var(--momo-border);
  p { margin: 0; font-size: 13px; color: var(--momo-muted); }
  [role="alert"] { color: var(--momo-error); line-height: 1.6; }
`;

export const KakaoLoginButton = styled.button`
  --social-background: #fee500;
  --social-border: #fee500;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  padding: 12px 16px;
  border: 1px solid var(--social-border);
  border-radius: 7px;
  background: var(--social-background);
  color: #191919;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  img { width: 20px; height: 20px; object-fit: contain; }
  // 공급자 브랜드색과 불투명도를 유지하고 세 버튼에 동일한 내부 테두리로 호버를 알린다.
  &:hover:not(:disabled) {
    background: var(--social-background);
    border-color: var(--social-border);
    opacity: 1;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .16);
  }
  &:focus-visible { outline: 2px solid var(--momo-text); outline-offset: 3px; }
  &:disabled { opacity: .6; cursor: wait; }
`;

// 공급자 로고는 원본 파일을 사용하고 버튼 크기는 기존 카카오 버튼과 동일하게 유지한다.
export const NaverLoginButton = styled(KakaoLoginButton)`
  --social-background: #03c75a; --social-border: #03c75a;
  background: var(--social-background); border-color: var(--social-border); color: #fff;
  // 공식 PNG의 내부 여백을 고려해 N 심볼을 16px 이상 확보하고 버튼 높이는 유지한다.
  // 공식 로고의 녹색 바탕만 버튼색과 합성하고 흰색 N 심볼은 유지한다.
  img { width: 44px; height: 44px; margin: -10px; object-fit: contain; mix-blend-mode: lighten; }

`;
export const GoogleLoginButton = styled(KakaoLoginButton)`
  --social-background: #fff; --social-border: #747775;
  background: var(--social-background); border-color: var(--social-border); color: #1f1f1f; font-weight: 500;
  img { width: 20px; height: 20px; object-fit: contain; }

`;
