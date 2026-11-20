# MOMO — 영화를 메모하다

MOMO는 영화를 찾아보고, 평점과 감상을 남기며 다른 사람의 영화 기록을 살펴보는 팀 미니 프로젝트입니다. React 화면과 Spring Boot API, MySQL을 연결하고 JWT 인증과 WebSocket 실시간 채팅을 적용했습니다.

이 저장소는 **개인 작업 및 안정화 완료본을 공유하는 저장소**입니다. 팀원들이 내려받아 확인한 뒤 조장이 [팀 저장소](https://github.com/madison-yoon/MOMO)에 수동 반영하는 기존 협업 방식을 유지합니다.

## 주요 기능과 구성

- 회원가입·로그인·로그아웃·탈퇴, JWT Access/Refresh Token 인증
- 영화 검색·상세·장르별 목록·박스오피스·추천, 관심 영화
- 영화 평점, 리뷰·댓글과 반응, 회원 프로필 이미지
- 전체 회원이 함께 사용하는 WebSocket 공용 채팅과 이미지 첨부

| 구분 | 기술 및 위치 |
|---|---|
| 프론트엔드 | React 18, React Router, Axios, styled-components / `momo-frontend` |
| 백엔드 | Java 21, Spring Boot 4.1.2, Spring Security, JPA, WebSocket / `momo-backend` |
| 데이터·외부 연동 | MySQL, KOBIS·KMDb·TMDb, Firebase Storage |
| 빌드·검증 | Gradle Wrapper 9.9.0, Yarn 1.22.22, JUnit·Mockito·H2 및 격리 MySQL, React Testing Library |

## 제3자 로그인 — Kakao / Naver / Google

세 공급자의 로그인·신규 회원 자동 등록을 지원합니다. 공통 `OAuthController`·`OAuthStateService`·`SocialLoginService`로 처리하며, 인증 성공 후 LOCAL 로그인과 같은 `LoginSessionService`에서 MOMO JWT·Refresh Token을 발급합니다. 공급자별 코드 교환·신원 검증과 Google PKCE·nonce·ID Token 검증은 유지합니다.

- 회원은 `provider + providerId`로 식별하며 이메일이 같아도 LOCAL·소셜 계정을 자동 연결하지 않습니다.
- 소셜 회원은 이메일 없이도 닉네임을 수정할 수 있습니다. 공급자 이메일은 읽기 전용이며 MOMO 비밀번호 변경·확인은 제공하지 않습니다.
- 탈퇴 시 카카오는 서버 Admin Key로 연결을 해제합니다. 네이버·Google은 연결된 동일 계정으로 다시 인증해 얻은 토큰으로 해제하며, 화면에서 추가 계정 확인과 후속 자동 탈퇴를 안내합니다. 공급자 계정 자체는 삭제하지 않습니다.
- 외부 해제 성공 후 기존 회원·연관 데이터·MOMO Refresh Token을 삭제합니다. 공급자 Access/Refresh Token은 장기 저장하지 않습니다.
- LOGIN/DELETE 목적·공급자·대상 회원을 서버 state로 구분합니다. 외부 해제 실패·결과 불명 시 삭제하지 않으며, 해제 성공 후 DB 삭제는 롤백이 확인된 잠금 오류만 제한적으로 재시도합니다. 서버 재시작 후 부분 실패의 자동 복구는 지원하지 않습니다.

### OAuth 개발환경 설정

백엔드 `.env.example`을 참고해 Git에서 제외되는 `.env` 또는 실행 환경에 설정합니다. 실제 값·인증 JSON·토큰은 공유 커밋에 넣지 않습니다.

| 환경변수 | 용도 |
|---|---|
| `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET` | 카카오 앱의 REST API 키와 Client Secret |
| `KAKAO_REDIRECT_URI` | 카카오 Callback 주소. 미설정 시 기존 localhost 주소 사용 |
| `KAKAO_ADMIN_KEY` | 서버의 카카오 탈퇴 연결 해제 전용 키. 해당 앱의 API 권한 확인 필요 |
| `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `NAVER_REDIRECT_URI` | 네이버 앱 자격 정보와 Callback 주소 |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google 웹 OAuth 클라이언트 자격 정보와 Callback 주소 |

공급자 콘솔에 `/oauth/kakao`, `/oauth/naver`, `/oauth/google`의 실제 HTTPS 프론트 Callback 주소를 등록합니다. 프론트와 API가 같은 사이트에서 state 쿠키를 전달할 수 있어야 합니다. Google revoke는 같은 Google 프로젝트의 다른 OAuth 클라이언트 권한에도 영향을 줄 수 있으므로 배포 전에 공유 프로젝트 구성을 확인합니다.

기존 DB는 백업 후 `users.provider`, `provider_id`의 대소문자 구분·복합 UNIQUE, nullable email 상태를 먼저 확인합니다. 필요한 경우에만 [소셜 회원 준비 SQL](momo-backend/docs/sql/kakao_oauth.sql)과 [provider_id 호환 SQL](momo-backend/docs/sql/social_oauth_provider_id.sql)을 검토해 적용합니다. 이미 적용된 DB에는 재실행하지 않으며 자동 마이그레이션이나 DB 초기화는 하지 않습니다.

## 기능 안정화 — 2026.11.14~11.15

초기 점검 대상으로는 박스오피스 표시 문제와 장르별 목록의 개봉일 누락이 전달됐습니다. 관련 영화 조회·저장 흐름을 따라가면서 인증, 동시 저장, 화면의 비동기 처리, 채팅 이미지까지 안정성 점검 범위가 넓어졌습니다. 초기 증상 각각의 재현 자료가 모두 남아 있지는 않아, 아래에는 코드와 검증 기록으로 확인한 변경을 중심으로 정리했습니다.

**11월 13일에 이미 커밋된 추천 재조회 보완과 Firebase 인증 파일의 참조 경로 변경은 기존 작업**입니다. 이를 14~15일에 새로 구현한 기능으로 합산하지 않습니다. 이번 안정화는 기존 기능을 유지하면서 확인된 결함을 수정하고 회귀 검증을 보강한 작업입니다.

| 영역 | 기존 문제 → 선택한 해결 방향과 실제 변경 → 개선 결과 |
|---|---|
| 회원 인증·JWT | 탈퇴 후 같은 아이디로 재가입하면 과거 토큰이 다른 회원을 가리킬 수 있었습니다. 변경되지 않는 회원 PK를 Access/Refresh Token의 subject로 사용하고 `ver=2`를 검사합니다. 인증 이후 회원 조회·소유권 검사·WebSocket도 PK를 사용해 계정 재가입에 따른 식별 혼동을 막습니다. 로그인·재발급 응답 형식은 유지했습니다. |
| 로그인 세션·API 연동 | 이전 세션의 늦은 재발급·로그아웃·탈퇴 결과가 새 로그인 상태를 지울 수 있었습니다. 세션 버전을 비교하고 실제 재전송 직전에도 확인하도록 했습니다. 같은 세션의 동시 401은 Refresh Promise를 공유하며, 네트워크·5xx 오류만으로 인증정보를 삭제하지 않습니다. |
| 영화 조회·외부 호출 | 장르·추천 요청이 KOBIS 전체 목록 수집으로 이어질 수 있었습니다. 사용자 요청은 지원 장르 검증 후 DB 페이지 조회를 사용하고, 수집은 기존 카탈로그 배치에 맡깁니다. 지원 장르의 빈 결과는 `200 []`, 미지원 장르는 `400`을 반환합니다. 요청별 전체 목록 HTTP 시도를 배치·비동기 호출과 구분하는 계측도 추가했습니다. |
| 영화 데이터 동시성 | 실제 격리 MySQL에서 오래된 상세·메타데이터·주간 저장이 최신 포스터·일간 순위를 덮는 문제를 재현했습니다. `row_version` 낙관적 잠금과 갱신 의도별 저장을 함께 적용하고 DB 작업만 제한적으로 재시도합니다. 직접 UPDATE·포스터 claim 처리도 버전과 트랜잭션 규칙을 맞춰 기존 값의 유실·복원을 방지했습니다. |
| 리뷰·댓글·회원 화면 | PK 기준 작성자 비교를 일관되게 적용하고 댓글 권한 위반을 `403`으로 처리합니다. 프론트 오류 로그는 토큰·비밀번호·요청 본문 대신 안전한 요약을 남기며 사용자에게 필요한 오류 안내는 유지했습니다. |
| WebSocket 공용 채팅 | 연결 때뿐 아니라 명령 처리와 방송 직전에도 회원 존재·토큰을 확인합니다. 탈퇴한 회원의 기존 연결이 메시지를 계속 송수신하지 못하도록 했습니다. 새로운 프로젝트별 역할이나 방 구조는 도입하지 않았습니다. |
| 이미지 검증·저장소 | 프로필 이미지의 잘못된 크기 상수를 5MiB로 바로잡았습니다. 채팅 JPEG·PNG·WebP는 실제 내용·디코딩·픽셀 크기를 검사하며 WebP의 손상·위장·과도한 프레임 입력을 거부합니다. 채팅 업로드 시도는 회원별 60초당 10회, 실제 저장 폴더는 1GiB로 제한하고 디스크 여유도 확인합니다. 같은 인스턴스의 동시 업로드는 저장 경계 안에서 검사하며 조회 실패 시 신규 저장을 거부합니다. |
| 프론트엔드 오류 처리 | 영화 목록·자동완성·포스터 상태·관심 영화·프로필 조회의 원시 오류 객체가 로그에 출력되던 경로를 공통 안전 요약으로 바꿨습니다. 기존 포스터 표시·대기·재조회 흐름과 사용자 오류 안내는 유지합니다. |

대표 변경 위치: [JWT 인증](momo-backend/src/main/java/com/momo/backend/security/TokenProvider.java), [영화 저장](momo-backend/src/main/java/com/momo/backend/service/MoviePersistenceWriter.java), [프론트 인증 연동](momo-frontend/src/api/AxiosApi.js), [채팅 이미지](momo-backend/src/main/java/com/momo/backend/service/ChatImageStorageService.java).

## 검증 결과

다음은 **2026년 11월 15일 안정화 검증에서 확인한 결과**입니다. README 작성·GitHub 반영 단계에서 테스트를 새로 실행한 수치가 아닙니다.

| 검증 | 결과 및 범위 |
|---|---|
| 백엔드 자동화 | **282 PASS**, 실패·오류·제외 0. 격리 MySQL 8.0.46에서 실행한 영화 동시성 13개 포함 |
| 프론트엔드 자동화 | **68 PASS**, 14개 스위트, 실패·제외 0 |
| 합계 | **350 PASS** |
| 실제 브라우저 | 회원가입·로그인·인증 페이지·로그아웃, 테스트 영화의 검색·상세·박스오피스, 리뷰·댓글 작성·수정·삭제, 두 회원의 양방향 채팅, 이미지 전송·조회·삭제, 탈퇴 세션 차단, 업로드 11번째 차단과 60초 경과 후 재시도 확인 |

브라우저 검증은 격리 테스트 DB와 합성 이미지로 진행했으며 삭제·탈퇴 확인창에는 사용자의 수동 처리가 포함됐습니다. 영화 화면은 준비한 테스트 데이터·캐시 기준입니다. 실제 외부 공급자의 응답, Firebase 프로필 업로드, 다중 서버·고부하, 모든 토큰 재사용·직접 변조 요청을 이번 E2E로 검증한 것은 아닙니다. 타인 리뷰·댓글의 브라우저 검증은 조작 버튼 비노출을 확인한 범위입니다. 기존에 내려받은 이미지의 캐시 회수와 탈퇴 후 새 수신·조회 차단도 구분합니다.

## 내려받아 실행하기

### 준비

- Java 21, MySQL 8, Node.js와 Yarn 1.22.22를 준비합니다. 최근 브라우저 검증의 Node.js는 24.22.1이며 프로젝트에 Node 버전 고정 파일은 없습니다.
- 기존 `momo_db` 및 팀에서 사용하던 DB·영화 API·JWT 설정을 준비합니다. [application.properties](momo-backend/src/main/resources/application.properties)가 읽는 환경변수나 백엔드 `.env`에 설정합니다. `JWT_SECRET` 등 기존 실행 환경은 유지하며 OAuth 추가 설정은 위 안내를 따릅니다.
- Firebase 인증 파일은 별도로 준비해 `momo-backend/config/firebase-service-account.json`에 둡니다. 개인 인증 파일은 새 커밋에 포함하지 않습니다.
- 백엔드 기본 포트는 `8111`, React는 `3000`입니다. 원격 PC에서 접속할 때는 API 주소와 기존 CORS·WebSocket 허용 origin 설정을 맞춰야 합니다.

### 기존 DB 확인

영화 동시성 처리를 위해 `movies.row_version BIGINT NOT NULL DEFAULT 0`이 추가됐습니다. 이번 안정화 코드의 의도적인 스키마 변경은 이 컬럼 하나입니다.

```sql
SHOW COLUMNS FROM momo_db.movies LIKE 'row_version';
```

기존 `ddl-auto=update`는 새 엔티티 매핑에 따라 컬럼을 생성할 수 있으므로, 백업·DB 확인 없이 서버부터 켜지 않습니다. 컬럼이 없으면 기존 영화 writer·배치를 모두 중지하고 백업한 뒤 [수동 SQL](docs/sql/M2-movies-row-version-manual-2026-11-15.sql)을 확인해 적용합니다. **이미 올바르게 존재하면 재실행하지 않습니다.** 이 SQL은 자동 실행되지 않으며 DB 초기화·기존 데이터 삭제도 하지 않습니다. 최초 기동은 아래처럼 `validate`로 구조를 확인하는 것을 권장합니다.

### 백엔드 — Windows PowerShell, 저장소 루트 기준

```powershell
.\momo-backend\gradlew.bat -p .\momo-backend bootJar
java -jar .\momo-backend\build\libs\momo-backend-0.0.1-SNAPSHOT.jar --spring.jpa.hibernate.ddl-auto=validate
```

Firebase 파일의 상대 경로 때문에 Java 실행 위치는 저장소 루트로 맞춥니다. IDE를 사용한다면 working directory도 확인합니다. 일반 실행에서는 기존 스케줄러와 외부 영화 API 작업이 동작할 수 있습니다.

### 프론트엔드

```powershell
cd momo-frontend
yarn install --frozen-lockfile
yarn start
```

`package.json`의 `"proxy": "http://localhost:8111"`는 유지했습니다. 공통 Axios·채팅 연결은 `REACT_APP_API_BASE_URL` 또는 기본 `http://localhost:8111`을 사용합니다. 최근 격리 브라우저 검증은 아래 로컬 설정으로 실행했습니다.

```powershell
$env:HOST = "127.0.0.1"
$env:REACT_APP_API_BASE_URL = "http://localhost:8111"
yarn start
```

일부 PC의 react-scripts 개발 서버에서 `options.allowedHosts[0] should be a non-empty string`가 발생하면 위 HOST 지정 방식으로 확인합니다. 검증 환경과 다른 PC의 일반 `yarn start`까지 모두 확인한 것은 아닙니다. 기존 공유 접속용 스크립트는 해당 기관의 주소 설정을 확인한 뒤 사용합니다.

## 현재 구조와 인계 시 주의사항

- 채팅은 **전체 회원용 공용방 하나**입니다. 메시지는 서버 메모리에 최근 1,000개까지 보관하며 재시작하면 초기화됩니다. 메시지·이미지 메타데이터의 DB 영속화는 추가하지 않았습니다.
- 채팅 이미지는 기본 `${user.home}/momo-data/chat-images`에 저장합니다. 프로필 이미지는 기존 Firebase Storage 구조를 유지합니다. 채팅 이미지 폴더에 쓰기 권한과 여유 공간이 필요합니다.
- 채팅 이미지는 한 장 5MiB, JPEG·PNG·WebP를 지원합니다. 회원별 60초 10회는 실패한 검증·저장도 포함한 업로드 시도 기준이며 서버 재시작 시 빈도 기록은 초기화됩니다. 폴더 1GiB 제한은 재시작 후에도 실제 파일을 다시 합산합니다.
- 알려진 미전송 이미지는 30분 후 다음 업로드 등에서 정리하고, 삭제 실패는 후속 요청에서 재시도합니다. 불명확한 기존 파일도 전체 용량에는 포함하지만 자동 일괄 삭제하지 않습니다. 한도 도달 시 신규 업로드가 차단될 수 있습니다.
- 업로드 제한·잠금은 단일 서버 인스턴스 기준입니다. 이미 내려받은 이미지의 회수, 다중 서버 공통 한도, 회원별 누적 100MiB·미전송 3개 제한은 이번 범위가 아닙니다.
- WebP 처리를 위해 `build.gradle`의 `com.twelvemonkeys.imageio:imageio-webp:3.15.3`을 함께 반영해야 합니다. 테스트 리소스의 WebP fixture·README·라이선스도 유지합니다.
- JWT 전환 이전의 토큰은 거부되므로 기존 사용자는 다시 로그인해야 합니다. 새 코드와 구버전 영화 writer를 동시에 실행하지 않습니다.
- 조장은 **파일을 무조건 덮어쓰기보다 팀 코드와 비교해 수동 병합**합니다. 개인 저장소는 팀 기준 `735a3175dec2a74ce271ffd3b6915dc7249dab74` 이후의 기존 2개 커밋도 포함합니다. 안정화 직전 개인 기준은 `2849493ae5c9ef5a01731366ff075ed09014218d`입니다.
- 위 기존 커밋에 포함된 `FirebaseConfig.java`와 `MovieServiceRecommendationRefreshTest.java`도 팀 기준과 차이가 있습니다. 이번 신규 변경 파일 목록만 복사하면 이 기존 차이를 놓칠 수 있으므로 최종 저장소 전체 비교에 포함합니다. 기존 파일을 삭제해야 하는 안정화 변경은 없습니다.

과거의 상세 작업 이력·개인 PC 설정·검증 로그·DB 백업은 이번 반영에서 제외했습니다. 이 README와 소스·회귀 테스트·수동 SQL을 기준으로 팀원 환경에서 확인한 뒤 팀 저장소에 반영합니다.
