# 팀 PC 및 배포 환경 OAuth 적용 안내

## 적용 범위

Cinema Charcoal은 기존 팀 PR #85에서 통합됐다. 이번 전달은 카카오·네이버·Google OAuth와 로그인 버튼 스타일,
환경설정 분리 및 SQL·문서에 집중한다. 팀 README나 기존 다른 기능은 개인 프로젝트 버전으로 덮어쓰지 않는다.
TokenProvider·RefreshTokenService의 JWT 숫자 userId/회전 정책을 유지한다.

## 1. 변경 전 백업 및 스키마 확인

DB 담당자가 users 및 refresh_token을 안전한 위치에 백업한다. 덤프에는 회원정보·비밀번호 해시·토큰이 있으므로 Git에 올리지 않는다.
현재 users의 provider/provider_id/email 및 uk_users_provider_identity 존재 여부를 먼저 확인한다.
기존 회원 PK·관계·토큰 행을 삭제하거나 초기화하지 않는다.

- provider/provider_id가 없는 기존 팀 DB: docs/sql/kakao_oauth.sql 적용 후 docs/sql/social_oauth_provider_id.sql 적용.
- 카카오용 provider/provider_id와 UNIQUE가 있는 DB: 첫 SQL은 건너뛰고 두 번째 SQL만 필요한 경우 적용.
- 이미 provider_id VARCHAR(255), utf8mb4_bin이고 UNIQUE(provider,provider_id)가 있는 DB: 두 SQL 모두 재실행하지 않는다.
- 컬럼이 일부만 존재하거나 UNIQUE 충돌·예상 밖의 기존 계정이 있으면 임의로 진행하지 말고 DB 담당자와 확인한다.

최종 상태: provider VARCHAR(20) NOT NULL DEFAULT LOCAL, provider_id VARCHAR(255) NULL/utf8mb4_bin,
UNIQUE(provider,provider_id), email VARCHAR(254) NULL. 일반 회원가입의 이메일 필수 검증은 유지한다.
각 SQL은 수동 적용용이며 자동 마이그레이션이 아니다. DDL은 MySQL에서 자동 커밋되므로 전체 백업을 먼저 확인한다.
변경 후 회원 수·기존 행·Refresh Token·UNIQUE와 대소문자 구분을 비교한다. 애플리케이션의 ddl-auto만으로 collation이 보장되지 않는다.

## 2. 비밀 설정

momo-backend/.env.example을 .env로 복사하고 DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET,
KOBIS_API, KMDB_API, TMDB_API를 각자 설정한다. 기존 DB 연결값·서명키는 팀 관리값을 사용한다.
OAuth 키: KAKAO_CLIENT_ID/KAKAO_CLIENT_SECRET, NAVER_CLIENT_ID/NAVER_CLIENT_SECRET,
GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET. 실제 값은 공유 문서·PR·React에 넣지 않는다.
.env는 Spring Config import가 읽는 properties 형식의 KEY=value를 사용하며 따옴표 없이 작성한다.
Google에서 다운로드한 client_secret JSON은 업로드하지 않는다. 백엔드는 필요한 client_id/secret만 .env에서 읽는다.
.env.example에는 공개 로컬 주소와 빈 값만 들어 있다.

## 3. 공급자 콘솔 — 로컬 환경

프론트 실행 origin을 localhost:3000으로 통일한다. localhost와 127.0.0.1을 섞으면 state 쿠키가 전달되지 않을 수 있다.

| 공급자 | 콘솔에서 등록할 Redirect URI | 백엔드 설정 |
|---|---|---|
| 카카오 | http://localhost:3000/oauth/kakao | kakao.redirect-uri |
| 네이버 | http://localhost:3000/oauth/naver | NAVER_REDIRECT_URI |
| Google | http://localhost:3000/oauth/google | GOOGLE_REDIRECT_URI |

- 카카오: 앱의 REST API 키 및 활성 Client Secret을 사용한다. 카카오 로그인 활성화·웹 플랫폼·Redirect URI를 확인한다.
- 네이버: 네이버 로그인 사용 API에 필요한 서비스 URL과 위 Callback URL을 등록한다. 개발 상태에서 허용 계정을 확인한다.
- Google: OAuth 클라이언트 유형은 웹 애플리케이션. 승인된 리디렉션 URI에 위 주소를 정확히 등록한다.
  JavaScript 원본을 등록한다면 http://localhost:3000이며 콜백 경로를 원본 필드에 넣지 않는다.
  동의 화면의 공개 범위·테스트 사용자와 openid/email/profile 범위를 확인한다. 서비스 계정 키는 사용하지 않는다.

## 4. 배포 환경은 별도 설정

로컬 주소를 그대로 배포하지 않는다. 실제 HTTPS 프론트 주소의 /oauth/kakao, /oauth/naver, /oauth/google을 각 콘솔에 등록한다.
NAVER_REDIRECT_URI/GOOGLE_REDIRECT_URI를 HTTPS 주소로 설정한다.
카카오는 실행 옵션 --kakao.redirect-uri=https://실제프론트호스트/oauth/kakao로 같은 주소를 지정할 수 있다.
MOMO_CORS_ALLOWED_ORIGINS와 프론트의 기존 API 호스트 설정도 실제 배포 주소에 맞춘다.
시작·교환 요청은 withCredentials:true다. 현재 state 쿠키는 HttpOnly, SameSite=Lax이고 HTTPS에서는 Secure다.
프론트와 API가 서로 다른 사이트인 배포 구조는 쿠키 정책을 별도 검토해야 한다. 이 PR이 모든 교차 사이트 배포를 검증한 것은 아니다.

## 5. 실행

Java 21/MySQL 및 기존 Firebase 로컬 설정을 준비한다. Firebase 키 파일과 설정은 팀 관리 방식을 유지한다.
백엔드 폴더에서 Windows .\gradlew.bat bootRun, React 폴더에서 기존 설치된 의존성으로 yarn start를 실행한다.
인증 API는 기존 localhost:8111, React는 localhost:3000 기준이다. 서버가 이미 실행 중이면 중복 실행하지 않는다.
SQL을 먼저 적용한 다음 변경된 백엔드를 실행한다. React만 갱신하면 새 OAuth API는 생기지 않는다.

## 6. 테스트 및 수동 확인

백엔드 .\gradlew.bat build, 프론트 CI=true yarn test --watchAll=false --runInBand 및 yarn build.
실제 DB를 비우는 테스트는 개발 DB에서 실행하지 않는다. 기존 별도 MySQL 동시성 테스트 13개는 지정된 폐기용 환경에서만 활성화한다.
독립 Headless 검증은 모의 공급자/API와 실제 인증을 구분한다.

실제 확인: 일반 로그인 → 로그아웃 → 카카오/네이버/Google 각 최초 로그인 → 재로그인 시 회원 재사용 확인.
Network에서 GET /api/auth/{provider}/authorize 200, POST /api/auth/{provider} 200, 이후 MOMO JWT 인증을 확인한다.
각 호출에 쿠키가 포함되어야 한다. state 만료·취소 시 다시 시작하는 안내가 표시되는지 확인한다.
실제 로그인은 회원 생성·Refresh Token 교체가 발생한다. 운영 회원정보를 삭제하거나 이메일로 임의 연결하지 않는다.
사용자는 세 공급자의 실제 로그인을 직접 확인했다고 보고했으며, Codex의 자동 테스트 결과와 구분한다.
