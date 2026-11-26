# OAuth 구조 개선 Implementation Plan

> **For agentic workers:** Use subagent-driven-development; 현재 체크아웃에서 백엔드는 직접 실행하고 프론트엔드 구현과 독립 검토를 위임한다. 사용자 지시에 따라 Commit·Push·PR·DB 변경은 하지 않는다.

**Goal:** 정상 소셜 로그인 보존, 공통 OAuth 구조 및 소셜 프로필·자동 연결 해제 탈퇴 지원.

**Architecture:** OAuthController / OAuthStateService는 세 공급자의 진입·목적·회원 바인딩을 공유한다. 기존 공급자 인증 서비스와 GoogleIdentityVerifier는 검증을 유지한다. SocialLoginService는 LoginSessionService로 토큰 발급을 위임하고, AccountDeletionService는 외부 해제 후 기존 AuthService 삭제를 새 트랜잭션으로 실행한다.

**Tech Stack:** 기존 React / Spring Boot / Java 21 / H2 테스트, 의존성 추가 없음.

**Spec:** 사용자 첨부 구현 요청 및 MOMO-Redesign_OAuth_Architecture_Specification.pdf. 요청이 문서보다 우선한다.

## Global Constraints
- 현재 feature/ui-redesign 사용, 기존 API·Redirect URI·JWT·Refresh Token 정책 유지.
- 공급자 토큰은 서버 요청 안에서만 사용하고 응답·로그·DB에 노출하지 않음.
- 일반 회원 정책 보존. 소셜 식별은 provider + providerId, 이메일 자동 연결 금지.
- 신규 주요 메서드·복잡한 로직 한글 주석. 기존 Cinema Charcoal UI 유지.
- 테스트는 H2·모의 HTTP만 사용, 개발 MySQL·실제 Unlink 호출 금지.

## Review Focus
- LOGIN/DELETE state 혼용·다른 회원·공급자 인증으로 삭제 불가.
- Axios 공개 경로 부분 일치로 탈퇴 Bearer 누락 및 소비된 코드 401 재전송 방지.
- 외부 해제 성공 후 DB 실패는 삭제만 재시도. 커밋 불명·영구 오류는 재시도하지 않음.
- 이메일 null 소셜 닉네임 수정과 이메일·비밀번호 우회 변경 차단.
- StrictMode·계정 전환·로그아웃·전체 페이지 OAuth 이동 후 세션 격리.

## Tasks
- [x] 1. 프로필: AuthService / UserUpdateRequest / UserResponse / ProfileEdit. 소셜 null 이메일 저장, 불법 변경, LOCAL 이메일 필수 테스트 RED→GREEN.
- [x] 2. 공통 OAuth: Controller·DTO·State·SocialLoginService 중립 명칭. 기존 로그인 계약 테스트 유지, 목적·회원 바인딩 실패 테스트 추가.
- [x] 3. 프론트 Flow·Callback·Login·Axios 통합. 세 공급자 단일 경로, 목적별 저장, DELETE 인증 헤더·세션 충돌 테스트.
- [x] 4. LoginSessionService.issue(User): 기존 토큰 생성·saveOrReplace·응답 공통화, 가입 트랜잭션 및 동시 가입 테스트.
- [x] 5. 탈퇴: AccountDeletionService.delete/start/complete, 동의·확인 문구 MOMO 회원 탈퇴, 카카오 Admin Key·네이버/Google 신규 토큰 revoke 모의 계약 테스트.
- [x] 6. 삭제 재시도: REQUIRES_NEW 경계, 롤백이 확인된 MySQL deadlock/lock timeout만 총 3회, 커밋 단계·연결 오류 제외 테스트.
- [x] 7. 전체 Java·React 테스트 및 빌드, 최종 독립 코드 검토·수정, 미검증 외부 API/MySQL/재시작 복구 한계 보고.

## Execution ledger
- 사전 확인: D:/Dev/Back/SpringBoot/MOMO-Redesign, feature/ui-redesign, bc51514, clean.
- 구현 선택: 추가 탈퇴 API는 PDF 제안 경로를 사용한다. 확인 문구는 MOMO 회원 탈퇴. 기존 쿠키·state 로그인 키는 유지하고 DELETE 키만 분리한다.
- DB 재시도는 Spring 예외 이름만 믿지 않고 JDBC 원인 코드·SQLState와 명시적 롤백 성공을 함께 확인한다.

- 완료: 프로필 정책 실패 재현 후 수정, 공급자 중립 Controller·State·DTO·회원 서비스 통합, 공통 토큰 발급, 세 공급자 Unlink와 확인된 롤백의 삭제 전용 재시도 구현.
- 독립 검토: OAuth 리다이렉트 후 오래된 LOGIN이 다른 탭 세션을 덮어쓰는 문제를 회귀 테스트로 재현·수정. SQLState/vendor code만 정제 기록하도록 보완하고 비밀값 비노출 테스트 통과.
- 선택 기록: 확인 문구·API 경로는 PDF 구체화안을 채택. Google은 계정 선택을 제공하며 비밀번호 재입력 강제를 주장하지 않음. 단일 서버 메모리·재시작 복구 한계는 보고 문서에 명시.
- 검증: Java 전체 build, JUnit 329 PASS / 0 FAIL / 13 조건부 SKIP. React 전체 205 PASS 및 production build. 실제 공급자·MySQL 미실행. Git commit/push/PR 없음.
