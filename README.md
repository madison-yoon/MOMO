# MOMO — 영화를 메모하다

MOMO는 영화를 찾아보고, 평점과 감상을 남기며 다른 사람의 영화 기록을 살펴보는 팀 미니 프로젝트입니다. React 화면과 Spring Boot API, MySQL을 연결하고 JWT 인증과 WebSocket 공용 채팅을 적용했습니다. 리뷰 검색은 별도 FastAPI·LangGraph 서비스로 분리했습니다.

팀 저장소: [madison-yoon/MOMO](https://github.com/madison-yoon/MOMO)

## 주요 기능과 현재 지원 범위

- 일반 회원가입·로그인·로그아웃·탈퇴, PK 기반 JWT Access/Refresh Token 인증과 회전
- 영화 검색·상세·장르별 목록·박스오피스·추천, 관심 영화와 평점
- 리뷰·댓글과 반응, Firebase 프로필 이미지
- 전체 회원용 WebSocket 공용 채팅, 이력 동기화·본인 메시지 삭제·이미지 첨부
- 리뷰 RAG 색인 상태, 커밋 후 동기화, 운영자 단건·전체 재색인, READY 기반 ALL/MINE 질문 API

RAG는 **문자 2-gram 메모리 StubEngine과 근거 발췌 모의 답변**입니다. 실제 임베딩·LLM·벡터 DB·MongoDB Atlas와 React RAG 질문 화면은 구현 범위가 아닙니다. 검색 근거가 부족하거나 반환 전 원본 검증에 실패하면 답변을 보류합니다.

Kakao·Naver·Google 로그인과 탈퇴 API를 지원하며, 로그인 화면의 공급자 버튼과 `App.js`의 `/oauth/{provider}` 콜백 라우트도 연결되어 있습니다. 프론트는 state·세션 상태를 확인하고 백엔드는 공급자·목적·회원 컨텍스트를 검증합니다. 다만 실제 공급자 앱 등록, Redirect URI·Secret 설정과 외부 실계정 로그인·연결 해제 성공은 아직 검증되지 않았습니다. 설정이 없는 환경에서는 해당 공급자 기능이 실패하도록 유지합니다. 자세한 지원 범위는 [아키텍처](docs/ARCHITECTURE.md)를 참고하세요.

| 구분 | 기술 및 위치 |
|---|---|
| 프론트엔드 | React 18, React Router, Axios, styled-components / `momo-frontend` |
| 백엔드 | Java 21, Spring Boot 4.1.2, Spring Security, JPA, WebSocket / `momo-backend` |
| RAG 서비스 | Python 3.14, FastAPI, LangGraph, 메모리 StubEngine / `MOMO-RAG` |
| 데이터·외부 연동 | MySQL, Caffeine, KOBIS·KMDb·TMDb, Firebase Storage |
| 빌드·검증 | Gradle Wrapper 9.9.0, Yarn 1.22.22, JUnit·Mockito·H2, React Testing Library, Python pytest |

## 기술 문서

- [전체 아키텍처](docs/ARCHITECTURE.md): 인증·회원·OAuth 지원 범위·영화 API/캐시·채팅·장애 경계
- [RAG 1~5차시](docs/RAG.md): API·색인 상태·트랜잭션·복구·운영 설정·검증과 한계
- [RAG 서비스 실행 안내](MOMO-RAG/README.md)

## RAG 5차시 변경

리뷰에 INDEXING·READY·FAILED 상태와 실패 분류·성공 시각을 저장합니다. 작성·수정·삭제는 원본 트랜잭션이 커밋된 뒤 이벤트로 FastAPI를 호출하며 결과 저장은 별도 트랜잭션으로 처리합니다. 후속 색인 실패가 이미 저장된 리뷰의 CRUD·탈퇴를 실패처럼 응답하지 않도록 분리했습니다.

재색인은 기본 비활성화이며 유효한 JWT와 환경별 운영자 PK 허용 목록이 모두 필요합니다. 전체 재색인은 기존 READY를 무효화한 뒤 순차 복구하며, 복구된 READY 리뷰부터 다시 검색합니다. 질문 응답은 최신 원본을 재조회하고 출처 하나라도 부적합하면 답변 전체를 보류합니다.

FastAPI 메모리 색인은 재시작하면 사라집니다. **재시작 후 운영자가 전체 재색인을 수행해야 합니다.** 자동 재시작 감지·영속 큐·분산 잠금·자동 색인 재시도는 없습니다. 원격 HTTP 타임아웃 뒤 작업 순서와 최종 검증 이후의 수정·삭제까지 완전히 보장하지는 않습니다.

## 내려받아 실행하기

### 준비

- Java 21, MySQL 8, Node.js와 Yarn 1.22.22를 준비합니다. 기존 검증의 Node.js는 24.22.1이며 Node 버전 고정 파일은 없습니다.
- DB·영화 API·JWT 설정은 기존 [application.properties](momo-backend/src/main/resources/application.properties)의 주입 방식을 확인합니다. 실제 DB 비밀번호·API Key·JWT 비밀값은 문서나 새 커밋에 넣지 않습니다.
- Firebase 인증 파일은 별도로 준비해 `momo-backend/config/firebase-service-account.json`에 둡니다.
- DB 비밀번호는 `DB_PASSWORD` 환경변수로 전달합니다. 코드에 기본 비밀번호를 두지 않으므로 기존 PC의 실제 값을 IntelliJ Run Configuration 또는 실행 CMD 환경에 설정합니다.
- RAG를 사용할 때는 Python 3.14와 `MOMO-RAG/.venv`를 준비하고 [RAG 실행·설정](docs/RAG.md)을 따릅니다. 기본 `RAG_ENABLED=false`이며 활성화 시 서비스 토큰이 필요합니다.
- 백엔드 기본 포트는 `8111`, React는 `3000`, FastAPI 예시는 `8000`입니다. 원격 PC 접근 시 API 주소와 CORS·WebSocket 허용 Origin을 맞춥니다.

### 기존 DB와 스키마 변경을 먼저 확인

기존 영화 안정화에는 `movies.row_version`, 이번 RAG 변경에는 `reviews.index_status`, `index_error`, `indexed_at`이 필요합니다. 기존 회원·리뷰를 삭제하거나 DB를 초기화하지 않습니다.

**기존 `ddl-auto=update` 설정으로 새 백엔드를 공유 DB에 연결해 먼저 기동하지 마세요.** Hibernate가 승인 전에 스키마를 변경할 수 있습니다. 스키마·백업과 수동 SQL을 먼저 점검하고 승인된 DB 적용을 마친 뒤 최초 실행은 `validate`로 확인합니다. SQL 제공과 실제 공유 DB 적용은 별개이며 이번 작업에서 공유 DB SQL은 실행하지 않았습니다.

- 기존 영화 변경: [수동 SQL](docs/sql/M2-movies-row-version-manual-2026-11-15.sql). `row_version`이 이미 올바르게 존재하면 다시 적용하지 않습니다.
- RAG 변경: [수동 SQL](momo-backend/docs/sql/rag5_index_state.sql). 없는 컬럼만 추가하고 기존 상태를 초기화하지 않습니다. 기존 컬럼 형식과 `updated_at`의 자동 갱신 여부를 확인하고, 적용 전후 원본 보존을 비교합니다. 실제 공유 DB 적용은 아직 실행하지 않았습니다.

### 백엔드 — Windows PowerShell, 저장소 루트

스키마 사전 확인·적용이 끝난 환경에서 실행합니다.

```powershell
.\momo-backend\gradlew.bat -p .\momo-backend bootJar
java -jar .\momo-backend\build\libs\momo-backend-0.0.1-SNAPSHOT.jar --spring.jpa.hibernate.ddl-auto=validate
```

Firebase 파일의 상대 경로 때문에 Java 실행 위치는 저장소 루트로 맞춥니다. IDE도 working directory를 확인합니다. 일반 실행에서는 기존 영화 스케줄러와 외부 API 작업이 동작할 수 있습니다.

### 프론트엔드

```powershell
cd momo-frontend
yarn install --frozen-lockfile
yarn start
```

공통 Axios·채팅 연결은 `REACT_APP_API_BASE_URL` 또는 기본 `http://localhost:8111`을 사용합니다. `package.json`의 개발용 proxy도 같은 백엔드 주소입니다. 일부 PC에서 `options.allowedHosts[0] should be a non-empty string`이 발생하면 아래처럼 로컬 주소를 지정해 확인합니다.

```powershell
$env:HOST = "127.0.0.1"
$env:REACT_APP_API_BASE_URL = "http://localhost:8111"
yarn start
```

기존 공유 접속용 스크립트는 해당 기관의 주소 설정을 확인한 뒤 사용합니다.

## 검증 결과

### API 보안·CRUD 보완 CI — 2026-11-26

최신 확인 커밋 `251fb2ec` 기준 GitHub Actions 결과다. 아래 CI MySQL은 개발 PC의 `momo_db`와 분리된 일회용 컨테이너다.

| 검증 | 결과 |
|---|---|
| Backend Gradle Test | PASS |
| Frontend tests | 29 suites / 189 tests PASS |
| Frontend production build | PASS |
| MOMO-RAG Python tests | 18 PASS |
| Browser E2E | 5 PASS / 1 SKIP |
| Gemini Code Review | PASS |

Browser E2E는 실제 Spring Boot API를 호출해 회원정보 수정·중복 닉네임·비밀번호 변경·탈퇴·Refresh Token 폐기·영화 검색 API·리뷰/댓글 CRUD·반응·평점·관심 영화 흐름을 확인한다. 정상 영화 검색 경로는 격리 CI DB의 검색 캐시 fixture를 사용하므로 KOBIS 호출량을 소비하지 않는다. 1건 SKIP은 개발 PC의 기존 `momo_db` 전용 지속형 Swagger 테스트이며, 로컬 DB 검증 통과를 의미하지 않는다.

- [Build and Test](https://github.com/madison-yoon/MOMO/actions/runs/45739240431)
- [Browser E2E](https://github.com/madison-yoon/MOMO/actions/runs/45739240395)
- [Gemini Code Review](https://github.com/madison-yoon/MOMO/actions/runs/45739240421)


### RAG 5차시 — 2026-11-25

| 검증 | 결과 |
|---|---|
| 백엔드 전체 회귀 | 총 427개: 409 PASS, 실패 0, 18 SKIP |
| SKIP 구분 | 기존 MySQL 조건 17개 + 기본 실행에서 제외되는 실제 FastAPI 통합 1개 |
| Python pytest | 18 PASS, LangSmith 관련 사용 중단 예정 경고 17건 |
| Spring bootJar | PASS |
| 실제 두 서버 통합 | 별도 실행 1 PASS. H2 가상 데이터로 리뷰 CRUD·MINE 질문·삭제 후 ALL 보류·FastAPI 중단 후 CRUD 성공 |
| 후속 격리 MySQL 검증 | 기존17·신규8·관련회귀55 모두 PASS. SQL 최초/재실행·SHA2·시간정밀도 확인. 공유 DB 미적용 |

후속 격리 MySQL8.4.11 검증에서 SQL·SHA2·시간 정밀도를 확인했습니다. 다만 연결풀10개를 원본작업10개가 점유하면 후속 색인 연결 대기가 발생하는 것을 재현했습니다. 운영 동시성·연결 여유 조건과 승인된 공유 DB 적용이 남아 있어 **조건부 상태**를 유지합니다. 프론트엔드 테스트·브라우저·외부 공급자 인증을 이번 RAG 작업에서 새로 확인한 것은 아닙니다. 상세 범위는 [RAG 검증 결과](docs/RAG.md#5차시-검증-결과--2026-11-25)를 참고하세요.

### 이전 안정화 검증 — 2026-11-15

아래 수치는 당시 확인한 이력이며 이번 RAG 작업의 재실행 결과가 아닙니다.

| 검증 | 당시 결과 및 범위 |
|---|---|
| 백엔드 자동화 | 282 PASS, 실패·오류·제외 0. 격리 MySQL 8.0.46 영화 동시성 13개 포함 |
| 프론트엔드 자동화 | 68 PASS, 14개 스위트, 실패·제외 0 |
| 합계 | 350 PASS |
| 실제 브라우저 | 회원가입·로그인·인증 페이지·로그아웃, 테스트 영화 검색·상세·박스오피스, 리뷰·댓글 CRUD, 두 회원 양방향 채팅과 이미지 CRUD, 탈퇴 세션 차단·업로드 빈도 제한 |

당시 브라우저 검증은 격리 테스트 DB와 합성 이미지로 진행했고 삭제·탈퇴 확인창에는 사용자 수동 처리가 포함됐습니다. 영화 화면은 준비한 데이터·캐시 기준입니다. 실제 외부 공급자 응답·Firebase 업로드·다중 서버·고부하·모든 토큰 변조를 검증한 것은 아닙니다. 타인 리뷰·댓글은 조작 버튼 비노출을 확인한 범위입니다.

## 기존 안정화와 인계 시 주의사항

2026-11-14~15에는 회원 PK 기반 토큰, 이전 세션 응답 격리, 사용자 장르·추천 요청과 카탈로그 배치 분리, 영화 낙관적 잠금·작업별 저장, 리뷰·댓글 소유권과 채팅 인증, 이미지 검증·저장 제한, 안전한 프론트 오류 요약을 보완했습니다. 11월 13일에 이미 커밋된 추천 재조회와 Firebase 파일 경로 변경은 별도 기존 작업입니다.

- 공용 채팅은 최근 1,000개 메시지를 메모리에 보관하고 재시작 시 초기화됩니다. 메시지·이미지 메타데이터 DB 영속화는 없습니다.
- 채팅 이미지는 기본 `${user.home}/momo-data/chat-images`, 프로필 이미지는 Firebase Storage입니다. 채팅 이미지는 장당 5MiB의 JPEG·PNG·WebP, 회원별 60초 10회 업로드 시도와 폴더 총 1GiB 제한을 적용합니다. 쓰기 권한·여유 공간이 필요합니다.
- 알려진 미전송 이미지는 30분 이후 후속 정리에서 삭제하고 실패는 재시도합니다. 불명확한 기존 파일은 용량에 포함하지만 일괄 삭제하지 않습니다. 이미 내려받은 파일의 회수와 다중 서버 공통 제한은 없습니다.
- WebP 지원 의존성 `com.twelvemonkeys.imageio:imageio-webp:3.15.3` 및 테스트 fixture·라이선스를 함께 유지합니다.
- `ver=2` 전환 이전 JWT는 거부됩니다. 새 코드와 구버전 영화 writer를 동시에 실행하지 않습니다.
- 팀 코드 반영은 기존 변경을 무조건 덮어쓰기보다 전체 차이를 비교합니다. 과거 개인 안정화본에서 인계할 때는 `FirebaseConfig.java`와 `MovieServiceRecommendationRefreshTest.java`의 선행 차이도 확인하던 이력이 있습니다. 현재 RAG 변경은 최신 팀 main을 기준으로 비교합니다.

세부 구조·한계는 [아키텍처](docs/ARCHITECTURE.md)와 [RAG 운영 문서](docs/RAG.md)에 모았습니다. 기능 구현과 문서 변경은 별도 커밋으로 관리합니다.
