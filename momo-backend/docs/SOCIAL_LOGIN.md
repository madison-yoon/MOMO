# MOMO 네이버·Google 로그인 연동

## 범위와 실행 방법

기존 카카오의 state 쿠키, 공급자+ID 기반 회원 생성, 숫자 userId JWT와 RefreshTokenService를 재사용한다.
일반 로그인과 카카오 API 경로·응답 계약은 유지했다. 네이버·Google 실제 계정 로그인은 사용자가 직접 확인한다.
변경된 백엔드 코드가 적용되도록 기존 실행 방식으로 백엔드를 다시 시작하고 React를 실행한다.
이 작업에서는 사용자가 실행 중인 서버를 종료·재시작하지 않았다.

## API 계약

| 공급자 | 시작 GET | 코드 교환 POST | React 콜백 |
| --- | --- | --- | --- |
| 카카오 (기존) | /api/auth/kakao/authorize | /api/auth/kakao | /oauth/kakao |
| 네이버 | /api/auth/naver/authorize | /api/auth/naver | /oauth/naver |
| Google | /api/auth/google/authorize | /api/auth/google | /oauth/google |

시작과 교환 모두 `withCredentials: true`가 필요하다.
시작 응답은 `{ authorizationUrl, expiresIn: 300 }`이다.
교환 본문은 `{ code, state }`이며 응답은 기존 LoginResponse의
`userId, loginId, nickname, profileImage, accessToken, refreshToken, tokenType`을 유지한다.
외부 공급자의 토큰은 반환하지 않는다. React는 기존 completeLogin을 통해 MOMO 토큰만 저장한다.
요청/응답 형식이 같은 기존 KakaoLoginRequest/KakaoAuthorizeResponse DTO를 재사용하며 이름 변경은 하지 않았다.

## 환경설정과 콘솔

백엔드 `.env`의 다음 키를 기존 Spring Config import로 읽는다. 실제 값은 문서에 넣지 않는다.
- NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_REDIRECT_URI
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
- 기존 KAKAO 설정은 유지

설정 경로는 `naver.oauth.*`, `google.oauth.*`이다. 설정 누락 시 해당 공급자 요청만 503으로 거부한다.
확인한 로컬 Redirect URI는 각각 `http://localhost:3000/oauth/naver`, `http://localhost:3000/oauth/google`이다.
공급자 콘솔에도 정확히 같은 주소를 등록해야 한다. 콘솔 등록 상태는 직접 열람하지 않았다.
Google 앱이 테스트 상태이면 로그인 계정을 OAuth 동의 화면의 테스트 사용자로 등록해야 할 수 있다.
Client Secret·Google 인증 JSON은 React에 넣지 않는다. 프로젝트 루트 .gitignore에 제외 규칙을 추가했다.

## 인증·회원 보호

- 서버 메모리에서 공급자별 state를 5분간 최대 1,000건 보관하고 HttpOnly 쿠키와 일치할 때 한 번만 소비한다.
- Google은 nonce와 PKCE(S256)를 함께 적용한다. code_verifier는 서버에만 보관한다.
- Google 공식 GoogleIdTokenVerifier로 서명, issuer, audience, 만료를 검증한다. 추가로 필수 exp/iat/sub, nonce, azp를 확인한다.
- Google 공개키 캐시는 서비스 인스턴스에서 공유한다. 키 검증 실패 시 로그인은 거부한다.
- 네이버는 서버가 받은 Access Token으로 사용자 정보 API의 성공 코드와 고유 ID를 확인한다.
- 회원 조회 기준은 provider + 원본 providerId이다. 이메일이 같아도 자동 연결하지 않는다.
- 일반 회원 로그인 아이디 길이 규칙은 바꾸지 않는다. 소셜 회원의 내부 로그인 아이디만 기존 DB 길이에 맞춰 생성한다.
- 소셜 회원의 일반 비밀번호 로그인을 차단하는 기존 AuthService 정책을 유지한다.
- 외부 프로필 URL은 Firebase 파일 식별자와 다르므로 기존 기본 아바타를 유지한다.
- React 콜백 중복 요청은 Promise를 공유하고 다른 로그인·로그아웃 뒤 도착한 응답은 현재 세션을 덮어쓰지 않는다.
- OAuth 401은 JWT 자동 재발급 대상에서 제외하여 기존 세션을 삭제하거나 반복 재발급하지 않는다.
- 서버 재시작/다중 서버에서 state 공유는 지원하지 않는다. 재시작 중이던 인증은 처음부터 다시 시작한다.

## DB 변경 — 승인 후 2026-11-19 적용 완료

`docs/sql/social_oauth_provider_id.sql`: provider_id VARCHAR(100) → VARCHAR(255), utf8mb4_unicode_ci → utf8mb4_bin.
다른 컬럼, 회원 데이터, Refresh Token 행, 공급자+ID 복합 UNIQUE는 변경하지 않았다.
변경 전 대상 UNIQUE 구성과 중복 부재를 확인하고 users/refresh_token을 접근 제한된 외부 폴더에 백업했다.
변경 전후 전체 행 해시 비교 결과 회원 6명 및 Refresh Token 2개가 동일했다.
실제 MySQL 비교에서 AbC와 abc가 다르게 판정됨도 확인했다.

다른 DB에 배포할 때에는 먼저 백업·현재 제약·중복 여부를 점검하고 이 SQL을 적용한다.
JPA의 length=255만으로 MySQL 대소문자 구분이 자동 설정되는 것은 아니다.
새 DB라면 기존 카카오 스키마 준비 후 이 SQL도 적용한다. 개발 DB에 테스트용 회원을 자동 생성하지 않는다.

## 검증

실행 결과 상세는 프로젝트 외부 `MOMO_Naver_Google_20261119` 폴더에 보관한다.
- Gradle 전체 build: 성공. JUnit 312개 중 299개 성공, 실패 0, 건너뜀 13.
- 13개는 MovieMySqlLostUpdateTest: 폐기 가능한 별도 MySQL과 MOMO_M2_EPHEMERAL_SERVER/MOMO_M2_ISOLATED_URL 조건이 필요한 기존 테스트다.
- 소셜 회원 최초 생성·재로그인·JWT/Refresh 회전·일반 로그인·카카오 회귀는 격리 H2/모의 HTTP로 검증했다.
- Google 로컬 RSA 서명으로 정상 토큰과 위조 서명·발급자·대상·만료·nonce·azp 오류 거부를 검증했다.
- React 프로덕션 빌드 성공. Jest 전체 결과와 추가 테스트 결과는 외부 완료 보고서를 따른다.
- 독립 Headless Chrome PC 1440x1000: 모의 API/공급자 화면 기준 19개 확인 통과, 브라우저 오류 0.
- 실제 네이버/Google 계정 인증 및 실제 공급자의 첫 회원 생성·재로그인은 미실시.
- 카카오 실제 성공은 사용자가 제공한 기존 확인 결과이며 이번 작업의 실제 인증 결과로 재사용하지 않는다.

## 사용자 실제 확인 순서

1. 백엔드 재시작 후 기존 일반 로그인과 카카오 로그인을 확인한다.
2. 네이버 버튼 → 동의 → /oauth/naver → 홈 이동을 확인한다.
3. Google 버튼 → 동의 → /oauth/google → 홈 이동을 확인한다.
4. 각 공급자로 재로그인 시 같은 회원으로 표시되는지 확인한다.
5. Network에서 시작 200, 코드 교환 200 및 MOMO JWT 사용을 확인한다. 토큰·인가 코드 화면은 공유하지 않는다.
실제 로그인은 신규 회원/Refresh Token을 저장·갱신한다. 기존 회원을 삭제하거나 이메일로 합치지 않는다.

## 공식 참고

- https://developers.naver.com/docs/login/devguide/devguide.md
- https://developers.google.com/identity/openid-connect/openid-connect
- https://developers.naver.com/docs/login/bi/bi.md
- https://developers.google.com/identity/branding-guidelines
