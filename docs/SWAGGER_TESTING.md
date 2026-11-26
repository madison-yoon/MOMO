# MOMO Swagger — 기존 momo_db 지속형 검증

## 검증 대상

이 절차는 새 테스트 DB나 Docker MySQL을 만들지 않는다. 개발 PC에서 MOMO 백엔드가 실제로 사용하는 **기존 `momo_db`** 에 직접 연결한다.

- 데이터베이스를 생성·삭제·초기화하지 않는다.
- 회원은 고정 테스트 계정 1개만 최초 1회 생성한다. 다음 실행부터는 같은 계정으로 로그인한다.
- 영화는 이미 `movies` 테이블에 존재하는 코드를 지정한다. 테스트용 영화를 INSERT하지 않는다.
- QA 계정의 리뷰·댓글은 최초 1회 생성한 뒤 같은 ID를 업데이트한다.
- 리뷰 반응·댓글 반응·영화 평점·관심 영화도 동일한 회원/영화 키로 재사용한다.
- 테스트 종료 시 회원·리뷰·댓글·반응·평점·관심 영화를 삭제하지 않는다. 로그아웃으로 Refresh Token만 폐기한다.

GitHub Actions의 일회용 MySQL 결과는 코드 회귀 검증용일 뿐, 아래의 실제 `momo_db` 검증을 대체하지 않는다.

## 1. 실제 DB 연결 확인

MySQL CMD에서 실제 프로젝트 DB를 선택한 뒤 대상 스키마와 버전을 확인한다.

```sql
USE momo_db;
SELECT DATABASE() AS target_schema, VERSION() AS mysql_version;
SELECT COUNT(*) AS movie_count FROM movies;
SELECT movie_code, title
FROM movies
WHERE movie_code REGEXP '^[A-Za-z0-9]{8}$'
ORDER BY movie_code
LIMIT 20;
SHOW CREATE TABLE reviews;
SELECT column_name, column_type, is_nullable, column_default, extra
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'reviews'
  AND column_name IN ('index_status', 'index_error', 'indexed_at', 'updated_at');
```

여기서 출력된 `movie_code` 중 하나를 아래 `MOMO_SWAGGER_MOVIE_CODE` 값으로 사용한다. 이는 기존 Movie 행인지 평점 조회로 확인하며, 테스트 코드가 새로운 영화 행을 만들지 않는다.

## 2. RAG 색인 상태 컬럼 확인

저장소의 실제 파일 이름은 `momo-backend/docs/sql/rag5_index_state.sql`이다. 요청에서 언급된 `rag5_index_status.sql`이 아니라 `rag5_index_state.sql`로 저장되어 있다.

이 SQL은 `reviews`에 `index_status`, `index_error`, `indexed_at` 컬럼을 추가하는 수동 스크립트다. 위 사전 조회로 컬럼과 `updated_at` 설정을 먼저 확인한다. 특히 `updated_at`에 `ON UPDATE CURRENT_TIMESTAMP`가 있으면 스크립트 주석대로 실행을 중단하고 원본 시각 보존 방식을 먼저 확인한다.

세 컬럼이 이미 올바른 타입으로 존재하면 다시 실행할 필요가 없다. 누락된 경우에만 백업 및 DDL 잠금 영향을 확인하고 승인된 절차로 실행한다. 이 스크립트는 기존 READY/FAILED 상태를 초기화하거나 기존 리뷰를 삭제하지 않는다.

## 3. 백엔드 실행

IntelliJ의 MOMO 백엔드 Run Configuration이 실제 `momo_db`를 가리키는지 확인한다. SQL 적용과 전체 스키마 확인이 끝났다면 다음 값을 환경변수로 지정해 Hibernate가 스키마를 자동 변경하지 않고 검증하도록 한다.

```cmd
set "DB_URL=jdbc:mysql://localhost:3306/momo_db?serverTimezone=Asia/Seoul"
set "DB_USERNAME=root"
set "DB_PASSWORD=실제_DB_비밀번호"
set "JPA_DDL_AUTO=validate"
set "RAG_ENABLED=false"
```

현재 PC에서 이미 정상 실행 중인 백엔드가 있다면 재시작할 필요 없이 그 인스턴스를 그대로 사용해도 된다. 기본 API 주소는 `http://127.0.0.1:8111`이다. 실제 DB 이름이 `momo_db`인지 Swagger 테스트 전에 한 번 더 확인한다.

## 4. 테스트 계정과 기존 영화 지정

CMD에서 계정 식별자와 비밀번호, 기존 DB에 있는 영화 코드 및 실제 영화 제목을 지정한다. 비밀번호는 Git에 저장하지 않고 현재 CMD 세션의 환경변수로만 전달한다. 비밀번호는 회원가입 DTO 기준으로 영문자·숫자·특수문자(`!@#$%^&*`)를 각각 하나 이상 포함한 8~20자여야 한다.

```cmd
set "MOMO_API_BASE_URL=http://127.0.0.1:8111"
set "MOMO_SWAGGER_LOGIN_ID=momoSwaggerQA"
set "MOMO_SWAGGER_PASSWORD=테스트_계정용_비밀번호"
set "MOMO_SWAGGER_NICKNAME=MomoSwQA"
set "MOMO_SWAGGER_EMAIL=momo.swagger.qa@example.com"
set "MOMO_SWAGGER_MOVIE_CODE=유지형_QA_리뷰에_사용할_기존_영화코드"
set "MOMO_SWAGGER_MOVIE_TITLE=위에서_조회한_실제_영화명"
set "MOMO_SWAGGER_DELETE_MOVIE_CODE=삭제_API_검증에_사용할_다른_기존_영화코드"
set "MOMO_SWAGGER_DELETE_MOVIE_TITLE=삭제_API_검증용_영화의_실제_영화명"
set "MOMO_SWAGGER_UPDATED_NICKNAME=기존_회원과_중복되지_않는_2~12자_닉네임"
```

`MOMO_SWAGGER_LOGIN_ID`가 DB에 없으면 테스트가 회원가입 API로 한 번만 생성한다. 이미 존재하면 재가입 없이 로그인한다. 이미 계정이 존재하지만 비밀번호가 다르면 로그인은 실패하므로, 기존 계정을 쓸 때는 정확한 비밀번호를 지정한다. 닉네임 또는 이메일이 다른 회원과 중복되면 처음 생성할 때만 환경변수 값을 바꾼다. 테스트 계정이 아직 없더라도 영화 코드·제목과 비밀번호 형식을 먼저 확인하므로, 설정 오류 때문에 회원만 생성하고 실패하는 상황을 막는다. 첫 실행 이후에는 QA 리뷰에 기록된 영화 코드와 `MOMO_SWAGGER_MOVIE_CODE`가 같아야 한다.

## 5. Playwright 설치 및 Swagger 검증 실행

별도 프론트엔드 서버를 띄우지 않아도 Swagger 주소로 직접 접속한다.

```cmd
cd momo-frontend
npm install --no-save --package-lock=false @playwright/test
npx playwright install chromium
npx playwright test e2e/swagger-persistent.spec.js --workers=1
```

테스트 항목:

1. `/v3/api-docs`의 OpenAPI 버전과 Bearer 인증 스키마
2. 공개·인증 API의 operation 단위 보안 표시
3. Swagger UI 화면과 공개 리뷰 목록의 Try it out
4. 비로그인 차단, 고정 QA 계정 최초 생성/반복 로그인, 회원정보 수정 후 원래 값 복구, 비밀번호 확인
5. 기존 영화 제목으로 실제 영화 검색, 검색 응답 구조 및 잘못된 검색 입력값 검증
6. 유지형 QA 리뷰 생성/수정/중복 거부/목록·상세/제목 검색, 별도 임시 리뷰 삭제 후 404 확인
7. 유지형 QA 댓글 생성/수정/반응, 별도 임시 댓글 삭제와 댓글 목록에서 제거 확인
8. 영화 평점과 관심 영화의 반복 upsert
9. 포스터 상태, 잘못된 요청값, 카탈로그 상태·예산 조회
10. 로그아웃 후 Refresh Token 재발급 거부

## 6. 유지되는 데이터

첫 성공 실행 후 실제 `momo_db`에는 다음 QA 레코드가 남는다.

- `momoSwaggerQA` 회원 1명
- 지정한 기존 영화 코드에 연결한 QA 리뷰 1건
- 해당 리뷰의 QA 댓글 1건
- QA 회원의 리뷰/댓글 반응, 영화 평점, 관심 영화

다음 실행은 회원가입 대신 로그인하고, 유지형 QA 리뷰·댓글은 기존 PK로 UPDATE한다. 평점과 관심 영화는 동일한 회원/영화 조합으로 upsert한다. 회원·유지형 QA 리뷰·유지형 QA 댓글은 삭제하지 않는다. DELETE API 검증을 위해 별도 임시 리뷰 1건과 임시 댓글 1건을 생성 직후 삭제한다. 테스트 중단으로 임시 행이 남아 다음 실행에서 발견되면, 리뷰는 댓글·반응이 모두 없는 경우에만, 댓글은 QA 계정 소유이며 반응이 없는 경우에만 정리한다. 일반 회원·일반 리뷰·일반 댓글은 수정하거나 삭제하지 않는다.

테스트 대상 계정과 레코드를 지우고 싶을 때만 실제 DB에서 별도 승인 후 수동으로 정리한다. 자동 정리 기능은 제공하지 않는다.

## 실행 결과 해석

- 이 테스트를 실행한 로그의 API 주소와 DB 연결이 `momo_db`로 확인된 경우에만 실제 DB 검증으로 기록한다.
- GitHub Actions의 컨테이너 MySQL 테스트는 코드 CI로 별도 기록한다.
- 영화 검색 검증은 실제 /api/movies/search를 호출한다. 캐시 MISS이면 KOBIS 공급자 요청이 발생하고, 검색 결과는 애플리케이션 동작에 따라 검색 캐시·Movie 마스터에 저장되며 포스터 수집이 대기열에 등록될 수 있다. 임의의 테스트 영화 행은 INSERT하지 않는다. 호출 전 API 사용량·공급자 키 상태를 확인한다.
- 실 OAuth 공급자 계정, Firebase 이미지 저장소 및 별도 RAG 서비스 연결은 별도 자격정보와 실행 환경이 준비되지 않으면 이 테스트에서 검증하지 않는다.
