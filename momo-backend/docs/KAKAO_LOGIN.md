# MOMO 카카오 로그인 — 백엔드 연동 안내

## 범위

카카오 인가 코드를 서버에서 교환하고, 카카오의 사용자 ID를 확인한 뒤 기존 MOMO JWT를 발급한다.
JWT의 주체는 기존 숫자 `userId`이며 카카오 Access Token은 저장·반환하지 않는다.
React 카카오 버튼·콜백을 연결했다. Firebase 설정·기존 TokenProvider·RefreshTokenService는 변경하지 않았다.

교수님 PDF와 `mini-prj-SpringBoot`의 RestClient 흐름을 참고했다. 예제의 이메일 기반 JWT,
가짜 이메일, 평문 Refresh Token 저장 및 불일치 시 삭제 방식은 도입하지 않았다.

## 환경설정

- 기존 `momo-backend/.env`의 `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`을 재사용한다.
- Redirect URI는 `application.properties`에 사용자가 설정한 값을 그대로 사용한다.
- Spring Config import로 백엔드 폴더 및 프로젝트 루트 실행 시 `.env`를 읽는다.
- 현재 파일처럼 따옴표 없는 `KEY=value` properties 형식을 사용한다. 키와 비밀번호를 Git에 추가하지 않는다.
- 환경설정이 없으면 일반 회원 기능은 유지하고 카카오 시작/교환 요청만 503으로 거부한다.
- 인가 요청과 코드 교환은 동일한 서버 설정 Redirect URI를 사용한다. 카카오 콘솔과 정확히 일치해야 한다.

## DB 적용 — 2026-11-19 로컬 momo_db 적용 완료

회원·Refresh Token 테이블을 접근 제한된 프로젝트 외부 폴더에 백업하고 검증한 뒤 적용했다.
기존 이메일 컬럼은 이미 nullable이어서 유지했고 공급자 컬럼 2개와 복합 UNIQUE만 추가했다.
기존 회원 5명을 LOCAL로 유지했으며 기존 컬럼의 행 해시와 Refresh Token 데이터를 비교해 보존을 확인했다.
실제 카카오 계정 생성·재로그인은 아직 실행하지 않았다. 아래 SQL을 같은 DB에 다시 실행하지 않는다.

적용 SQL: `docs/sql/kakao_oauth.sql`.

1. DB 백업과 기존 컬럼·제약 존재 여부를 확인한다.
2. `users.provider`(LOCAL 기본값), `provider_id`, 공급자+ID unique 제약을 추가한다.
3. 이메일 미동의 소셜 회원을 위해 `users.email`의 NOT NULL만 해제한다.
4. 기존 회원은 LOCAL로 유지한다. `user_id`·외래키·기존 회원 데이터는 변경하지 않는다.
5. SQL을 한 번 적용한 뒤 새 백엔드를 배포한다. SQL은 자동 실행되지 않는다.

일반 회원가입의 이메일 필수 검증은 기존 SignupRequest에서 유지한다.
`password_hash` NOT NULL 제약도 유지하며 소셜 회원에는 알 수 없는 난수의 BCrypt 해시를 저장한다.
소셜 회원은 AuthService에서 일반 비밀번호 로그인을 명시적으로 거부한다.

## 연결된 React API 계약

### 1. 로그인 시작

`GET /api/auth/kakao/authorize` — MOMO JWT 불필요.

브라우저는 Axios `withCredentials: true` 등 쿠키를 포함하는 방식으로 요청한다.

```json
{
  "authorizationUrl": "https://kauth.kakao.com/oauth/authorize?...",
  "expiresIn": 300
}
```

응답은 `HttpOnly`, `SameSite=Lax`, `/api/auth/kakao` 경로의 일회용 바인딩 쿠키도 설정한다.
HTTPS 환경에서는 Secure를 적용한다. 프론트는 응답 URL로 이동한다.
카카오 로그인 후 등록된 프론트 콜백 주소에 `code`와 `state`가 전달된다.
URL의 값을 새로 만들거나 쿠키를 JS에서 읽지 않는다.

### 2. 코드 교환

`POST /api/auth/kakao` — MOMO JWT 불필요, 위 브라우저 쿠키 필요.

```json
{"code":"카카오가_전달한_인가코드","state":"콜백의_state"}
```

성공 응답은 기존 일반 로그인과 같은 LoginResponse다.

```json
{
  "userId": 123,
  "loginId": "서버가_생성한_소셜_로그인ID",
  "nickname": "저장된_닉네임",
  "profileImage": null,
  "accessToken": "MOMO_ACCESS_TOKEN",
  "refreshToken": "MOMO_REFRESH_TOKEN",
  "tokenType": "Bearer"
}
```

예시는 형식 설명이며 실제 회원·토큰 데이터가 아니다.
교환 성공 후 쿠키를 만료시킨다. state는 5분 이내 한 번만 사용할 수 있다.
교환 실패·재사용·서버 재시작 후에는 로그인 시작부터 다시 진행한다.

프론트 Axios는 위 두 경로를 자동 Refresh에서 제외하고 두 요청에 쿠키를 포함한다.
현재 탭의 sessionStorage state와 서버 HttpOnly 쿠키를 함께 사용한다.
같은 code/state 요청은 Promise를 공유해 StrictMode에서도 한 번만 교환한다.
이후 로그인 완료 처리는 일반 로그인과 같은 completeLogin 함수를 사용한다.

### 오류

- 400: 빈 code, 잘못된 state 형식 등 입력 오류
- 401: 쿠키/state 불일치·만료·재사용, 카카오 인가 코드 거부/식별정보 누락
- 409: 제한된 재시도 후에도 회원 저장 제약 충돌
- 502: 카카오 서버/네트워크/응답 처리 오류
- 503: 키 또는 Redirect URI 설정 누락·오류

인가 코드·카카오 토큰·Client Secret·MOMO 토큰을 로그나 오류 안내에 출력하지 않는다.

## 회원 생성·재로그인 정책

- `provider=KAKAO` + `provider_id`만으로 조회한다. 이메일이 같은 일반 회원에 자동 연결하지 않는다.
- 최초 가입 시 기존 길이·unique 제약을 지키는 loginId와 닉네임을 생성한다.
- 카카오에서 검증된 이메일을 제공한 경우만 저장하고 미동의·미검증이면 null로 둔다.
- 재로그인 시 기존 MOMO 닉네임·이메일을 임의로 덮어쓰지 않는다.
- 현재 profileImage는 Firebase 파일 식별자이므로 카카오 URL을 넣지 않고 기본 아바타를 유지한다.
- 동시 최초 로그인은 DB unique 제약과 새 트랜잭션 재조회로 회원 중복을 방지한다.
- 자체 JWT·계정당 활성 Refresh Token 1개·해시 저장·Rotation·불일치 시 현재 토큰 보존을 재사용한다.

## 검증 결과와 한계 (2026-11-19)

- Gradle 전체 build 성공.
- 전체 295개 중 282 통과, 실패 0, MySQL 조건부 테스트 13개 건너뜀.
- 새 카카오 테스트 13개 모두 통과: 모의 HTTP, 실제 Security 필터/MVC, state, 격리 H2 회원/토큰·동시성.
- MySQL 스키마 적용 및 기존 데이터 보존을 검증했다. 실제 MySQL에서의 카카오 회원 생성·동시 로그인은 미검증이다.
- 기존 키를 로딩한 실제 Spring Boot에서 시작 API 200, Redirect URI 일치, 쿠키·CORS, 미인증 거부를 확인했다.
- 실제 카카오 인증/Client Secret 유효성/동의 항목은 미검증이다.
- React 전체 Jest 155개 통과 및 프로덕션 빌드 성공. 독립 Headless Chrome의 모의 API 화면 검증 16개 통과.
- 실제 일반 회원의 MySQL 로그인·회원가입은 실행하지 않았다. 정상 로그인은 H2·모의 UI로, 실제 API 입력 거부는 개발 DB 연결 서버로 검증했다.
- state 저장은 단일 서버 메모리다. 다중 서버 배포 시 공유 저장소 또는 요청 고정이 필요하다.
- 쿠키 방식은 프론트/API가 같은 사이트라는 조건으로 설계했다. 서로 다른 사이트 배포는 쿠키 정책을 별도 검토한다.
- 기존 비밀번호 확인 기반 프로필 변경·회원탈퇴를 소셜 회원용으로 우회하지 않았다.
  소셜 회원의 비밀번호 없는 계정 관리·카카오 연결 해제/재가입 정책은 다음 단계에서 별도로 정해야 한다.

실행 명령: `gradlew.bat build --offline --no-daemon`.
자동화 테스트는 H2/모의 HTTP이다. 별도의 실제 서버 확인에서는 MySQL 스키마 validate와 쓰기가 없는 API 경계만 확인했다.
영화 수집·포스터 재시도 작업은 실행 인자로 끄고 실제 영화 API는 호출하지 않았다.

## 이번 React 연동 변경 파일

| 경로 | 목적 |
| --- | --- |
| momo-frontend/src/pages/Login.js | 기존 폼 아래 카카오 시작 버튼·로딩·실패 안내 |
| momo-frontend/src/pages/KakaoCallback.js | 콜백, 취소·실패 안내, 세션 변경 보호 |
| momo-frontend/src/auth/kakaoFlow.js | state 저장·인가 주소 검증·코드 교환 중복 방지 |
| momo-frontend/src/utils/completeLogin.js | 기존 로그인 저장·이벤트·토스트 처리 재사용 |
| momo-frontend/src/styles/redesign/SocialLogin.styles.js | Cinema Charcoal 내 소셜 버튼 영역 |
| momo-frontend/src/api/AxiosApi.js | 쿠키 포함 API 2개·재발급 제외 |
| momo-frontend/src/App.js | /oauth/kakao 라우트 |
| momo-frontend/src/pages/KakaoCallback.test.js | StrictMode·취소·실패·세션 변경 검증 |
| momo-frontend/src/auth/kakaoFlow.test.js | 시작 주소·state·중복 요청 검증 |
| momo-frontend/src/utils/completeLogin.test.js | 일반/카카오 공통 로그인 완료 검증 |
| momo-frontend/src/api/AxiosApi.test.js | 쿠키·401 재발급 제외 검증 |
| momo-frontend/src/pages/ArchiveRedesign.test.js | 일반 버튼과 카카오 버튼 선택 구분 |
| momo-frontend/src/pages/AuthSessionActions.test.js | JSDOM 스타일과 세션 핸들러 검증 분리 |

## 변경 파일 (MOMO-Redesign 기준)

### 기존 파일 5개

| 경로 | 변경 목적 |
| --- | --- |
| momo-backend/src/main/java/com/momo/backend/entity/User.java | 공급자·고유 ID·복합 unique, 소셜 이메일 null 허용, 소셜 회원 생성 |
| momo-backend/src/main/java/com/momo/backend/repository/UserRepository.java | 공급자+ID 회원 조회 |
| momo-backend/src/main/java/com/momo/backend/service/AuthService.java | LOCAL 회원만 비밀번호 로그인 허용 |
| momo-backend/src/main/java/com/momo/backend/config/SecurityConfig.java | 카카오 시작 GET과 교환 POST만 공개 |
| momo-backend/src/main/resources/application.properties | 사용자의 기존 설정을 유지하며 .env import·미설정 키 기본값 추가 |

### 신규 파일 14개

| 경로 | 역할 |
| --- | --- |
| momo-backend/src/main/java/com/momo/backend/controller/KakaoAuthController.java | 시작 URL·쿠키, 코드 교환 API |
| momo-backend/src/main/java/com/momo/backend/dto/auth/KakaoAuthorizeResponse.java | 시작 URL·만료시간 응답 |
| momo-backend/src/main/java/com/momo/backend/dto/auth/KakaoLoginRequest.java | code·state 입력 검증 |
| momo-backend/src/main/java/com/momo/backend/dto/auth/KakaoUserInfo.java | 내부 사용자 정보 전달 |
| momo-backend/src/main/java/com/momo/backend/entity/AuthProvider.java | LOCAL/KAKAO 계정 구분 |
| momo-backend/src/main/java/com/momo/backend/service/KakaoLoginService.java | 회원 생성·재조회·자체 JWT 및 Refresh 저장 |
| momo-backend/src/main/java/com/momo/backend/service/KakaoOAuthService.java | 카카오 토큰 교환·사용자 조회, 민감 오류 차단 |
| momo-backend/src/main/java/com/momo/backend/service/KakaoStateService.java | 브라우저 바인딩·5분 만료·일회용 state |
| momo-backend/src/test/java/com/momo/backend/controller/KakaoAuthControllerTest.java | 실제 Security/MVC 계약 검증 |
| momo-backend/src/test/java/com/momo/backend/service/KakaoLoginIntegrationTest.java | H2 회원·JWT·Rotation·동시 최초 로그인 검증 |
| momo-backend/src/test/java/com/momo/backend/service/KakaoOAuthServiceTest.java | 외부 HTTP 모의 검증 |
| momo-backend/src/test/java/com/momo/backend/service/KakaoStateServiceTest.java | state 수명·바인딩·재사용 검증 |
| momo-backend/docs/sql/kakao_oauth.sql | 수동 DB 적용 SQL |
| momo-backend/docs/KAKAO_LOGIN.md | 연동 계약·검증·제한사항 안내 |

## 참고 자료

- 교수님 자료: 카카오_로그인_구현가이드.pdf, mini-prj-SpringBoot 및 hp-router-ex-master
- https://developers.kakao.com/docs/ko/kakaologin/rest-api
- https://docs.spring.io/spring-boot/reference/features/external-config.html
