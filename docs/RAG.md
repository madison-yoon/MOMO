# MOMO RAG — 1~5차시

MOMO RAG는 리뷰를 청킹해 검색하는 FastAPI 서비스와 이를 조정하는 Spring Boot 기능이다. 원본 회원·리뷰·권한·색인 상태는 MySQL에 두고, Python은 Spring이 허용한 리뷰 ID 안에서만 검색한다. 현재 엔진은 **메모리 StubEngine**이다. 실제 임베딩, 벡터 DB, LLM 답변 생성, MongoDB Atlas는 도입하지 않았다.

5차시에는 색인 상태·커밋 후 이벤트·수동 재색인·회원 탈퇴 청크 삭제·ALL/MINE 질문 API와 반환 전 검증을 추가한다. 기존 LangGraph의 최대 1회 재검색은 유지한다. React RAG 질문 화면은 이번 범위가 아니다.

전체 구성은 [아키텍처](ARCHITECTURE.md), 프로젝트 실행은 [README](../README.md)를 참고한다.

## 서비스와 코드의 역할

| 위치 | 책임 |
|---|---|
| `rag/client/RagClient` | HTTP·내부 DTO·서비스 인증·색인/질문별 타임아웃 |
| `rag/event/ReviewIndexEvent` | 리뷰 ID와 UPSERT/DELETE 작업 전달 |
| `rag/event/ReviewIndexListener` | AFTER_COMMIT 처리, 최상위 장애 격리, 탈퇴 삭제 등록 |
| `rag/service/ReviewIndexService` | 최신 원본 색인·삭제·단건/전체 재색인 조정 |
| `rag/service/ReviewIndexTransactions` | 최신 원본 조회·수동 INDEXING 전환·결과 기록의 분리된 트랜잭션 |
| `rag/service/ReviewLocks` | 고정 256개 stripe 잠금, 결과 기록과 전체 무효화의 세대 조정 |
| `rag/service/RagQueryService` | 질문 검증·허용 목록·HTTP·최신 출처 검증 |
| `rag/service/RagQueryReader` | 독립 읽기 트랜잭션에서 READY 원본 식별 정보 조회 |
| `MOMO-RAG/app.py` | FastAPI lifespan·서비스 인증·색인/삭제/질문 API |
| `MOMO-RAG/engine.py` | 청킹·메모리 저장·2-gram 검색·규칙 재작성·근거 발췌 |
| `MOMO-RAG/graph.py` | LangGraph 검색·평가·재검색·생성/보류·출처 정리 |

기존 Review·ReviewRepository·ReviewService·AuthService의 위치는 유지한다. 이전 RagClient의 TransactionSynchronization 콜백은 커밋 후 이벤트로 대체하며, 두 방식으로 중복 호출하지 않는다. 이벤트에 엔티티 전체나 작성자 개인정보를 담지 않는다.

## 통신과 설정

Spring과 FastAPI는 사용자 JWT와 별개인 `X-Service-Token`으로 인증한다. FastAPI의 `SERVICE_TOKEN`과 Spring의 `RAG_SERVICE_TOKEN`은 같은 비밀값을 별도로 주입한다. 실제 값은 코드·문서·오류 정보·로그에 넣지 않는다. FastAPI는 비어 있는 토큰으로 기동하지 않고 Spring도 토큰 없이 RAG를 활성화하면 기동을 거부한다.

| Spring 설정 | 기본값 | 의미 |
|---|---|---|
| `RAG_ENABLED` | `false` | RAG 전체 활성화 |
| `RAG_BASE_URL` | `http://127.0.0.1:8000` | FastAPI 주소 |
| `RAG_SERVICE_TOKEN` | 없음 | 서비스 인증 비밀값 |
| `RAG_CONNECT_TIMEOUT_MS` | `500` | 색인·삭제 연결 제한 |
| `RAG_READ_TIMEOUT_MS` | `1000` | 색인·삭제 읽기 제한 |
| `RAG_QUERY_CONNECT_TIMEOUT_MS` | `500` | 질문 연결 제한 |
| `RAG_QUERY_READ_TIMEOUT_MS` | `10000` | 질문 읽기 제한 |
| `rag.reindex.enabled` | `false` | 운영자 재색인 기능 활성화 |
| `rag.reindex.operator-ids` | 빈 목록 | 재색인 허용 숫자 회원 PK, 쉼표 구분 |
| `rag.index.lock-wait-ms` | `2000` | 리뷰 stripe 잠금 대기 제한 |
| `rag.purge.queue-capacity` | `100` | 탈퇴 청크 삭제 작업 큐 크기 |
| `rag.query.top-k` | `5` | 검색 청크 수, 1~20 |
| `rag.query.max-allowed-reviews` | `5000` | 질문 허용 리뷰 수 상한 |

질문 타임아웃은 기존 색인·삭제 타임아웃과 분리한다. 5,000개 허용 목록은 현재 개발 환경의 초기 안전장치이며 부하 시험으로 확정한 운영 수치가 아니다. 운영자 PK는 환경별로 관리한다. DB 초기화·회원 ID 재사용이 발생하면 허용 목록을 다시 확인해야 한다. 문서에 임의 운영자 ID를 기본값으로 등록하지 않는다.

Python 설정은 `settings.py`와 추적하지 않는 `.env` 또는 환경변수에서 읽는다.

| Python 설정 | 기본값 | 의미 |
|---|---|---|
| `SERVICE_TOKEN` | 없음 | 필수 서비스 인증값 |
| `CHUNK_SIZE` | `500` | 청크 본문 크기 |
| `CHUNK_OVERLAP` | `80` | 인접 청크 겹침 |
| `STUB_MIN_SCORE` | `0.3` | 2-gram 검색 최소 점수 |
| `MAX_REWRITES` | `1` | 최초 검색 이후 재작성 횟수, 0 또는 1 |

## 색인 상태와 기존 데이터

별도 색인 상태 테이블 대신 `reviews`에 다음 컬럼을 둔다.

| 컬럼 | 형식 | 정책 |
|---|---|---|
| `index_status` | VARCHAR(20), NOT NULL | 문자열 Enum, 초기 `INDEXING` |
| `index_error` | VARCHAR(500), nullable | 실패 분류만 최대 500자 |
| `indexed_at` | DATETIME(6), nullable | 성공한 색인 시각 |

| 상태 | 오류 | 성공 시각 | 검색 |
|---|---|---|---|
| `INDEXING` | null | null | 제외 |
| `READY` | null | 성공 시각 | 허용 |
| `FAILED` | 정제한 실패 분류 | null | 제외 |

`INDEXING`은 미색인·대기·진행을 함께 나타낸다. PENDING은 추가하지 않는다. 신규 리뷰와 기존 미색인 리뷰는 실제 색인 성공 전 READY가 될 수 없다. 비활성화 중의 작성·수정도 INDEXING으로 남기며 외부 호출과 인위적인 FAILED 기록을 하지 않는다.

기존 리뷰는 보존한다. [수동 SQL](../momo-backend/docs/sql/rag5_index_state.sql)은 MySQL 8.x 기준으로 컬럼 존재 여부를 확인해 없는 컬럼만 추가한다. 재실행 시 기존 READY·FAILED·성공 시각을 초기화하지 않으며, 이미 존재하는 컬럼의 타입·기본값을 임의 보정하지 않는다. 최초 적용의 기존 행은 INDEXING/null/null로 시작한다.

적용 전 대상 DB·MySQL 버전·테이블 정의·백업·DDL 잠금 영향을 확인하고, 특히 `updated_at`에 `ON UPDATE CURRENT_TIMESTAMP`가 있으면 중단해 원본 시각 보존 정책부터 확인한다. SQL 실행 후 컬럼 형식·상태별 건수와 적용 전 원본 행 수·제목·본문·updatedAt을 비교한다. SQL은 자동 실행되지 않는다.

**기존 설정은 `ddl-auto=update`이므로 SQL 사전 점검과 승인된 적용 전에 새 백엔드를 공유 DB에 연결해 기동하지 않는다.** Hibernate가 기동 중 스키마를 변경할 수 있기 때문이다. 승인된 변경 후 최초 기동은 `ddl-auto=validate`로 확인한다. 이번 작업에서 공유 DB SQL을 실행하거나 실데이터를 변경하지 않았다. 따라서 실제 공유 DB 적용·재실행·기존 데이터 보존은 아직 검증하지 않은 조건부 항목이다.

## 작성·수정과 AFTER_COMMIT

```text
원본 쓰기 트랜잭션
  리뷰 저장/수정 + INDEXING + UPSERT 이벤트 발행
  COMMIT
    ↓
AFTER_COMMIT 리스너
  리뷰 stripe 잠금
  별도 읽기 트랜잭션으로 최신 원본 스냅샷 조회 → 종료
  FastAPI /index 호출
  별도 REQUIRES_NEW 결과 트랜잭션 → 조건부 READY/FAILED 기록
```

원본 트랜잭션이 롤백되면 이벤트에 의한 HTTP 호출은 없다. 일반 작성·수정에서 INDEXING을 이미 기록했으므로 같은 상태를 불필요하게 다시 UPDATE하지 않는다. 수동 재색인은 INDEXING 전환을 먼저 별도 트랜잭션으로 커밋한다.

HTTP는 새 DB 읽기·쓰기 트랜잭션 밖에서 실행한다. DB 경계는 별도 빈을 통해 적용해 self-invocation으로 REQUIRES_NEW가 무효화되지 않게 한다. 다만 일반 CRUD의 AFTER_COMMIT 리스너는 동기식이므로 커밋 후 원본 트랜잭션 자원이 아직 해제되기 전일 수 있고, 원격 대기만큼 사용자 응답이 늦어질 수 있다.

리스너는 최신 원본 조회·잠금·HTTP·결과 기록·DELETE·비동기 등록에서 발생하는 처리 가능한 RuntimeException을 격리한다. 이미 커밋된 CRUD가 RAG 후속 실패 때문에 실패처럼 응답하지 않도록 하기 위해서다. JVM 치명적 Error까지 무조건 삼키지 않는다. 상태 기록 자체가 실패하면 리뷰 ID와 예외 유형만 안전하게 경고한다. 오류에는 HTTP 상태 또는 예외 클래스 기반 분류를 사용하며 외부 응답 원문·JWT·비밀값·리뷰 본문은 기록하지 않는다.

### 최신 원본 보호와 잠금

UPSERT·DELETE·단건 재색인·전체 재색인은 같은 256개 stripe 잠금을 공유한다. 잠금 객체가 리뷰 수에 비례해 늘지 않으며 서로 다른 리뷰가 같은 stripe로 매핑되면 순차 처리될 수 있다. 기본 2초 안에 잠금을 얻지 못하면 경로별 실패·건너뜀 처리를 한다.

색인 결과 저장 시 현재 행을 잠그고, 전송한 ID·영화 코드·updatedAt·제목·본문과 현재 원본이 모두 일치하며 현재 상태가 INDEXING인지 확인한다. 시각 정밀도만으로 같은 순간의 수정을 판별하지 않는다. 제목·본문은 Java 문자열 동등성을 비교해 DB collation의 대소문자·후행 공백 비교 영향을 피한다. 삭제되거나 더 최신 원본으로 바뀐 리뷰에는 오래된 READY/FAILED를 쓰지 않는다.

색인 상태 전용 UPDATE는 사용자 원본의 `updatedAt`을 바꾸지 않는다. 전체 무효화와 결과 기록은 별도 세대·모니터 경계로 조정해 이전 세대 작업의 늦은 상태 기록을 차단한다. 이 잠금은 단일 Spring 인스턴스 안에서만 유효하다.

## 삭제와 회원 탈퇴

리뷰 삭제는 기존 소유권 확인과 DB 삭제 후 DELETE 이벤트를 발행한다. 커밋 후 공통 삭제 로직으로 `DELETE /index/{review_id}`를 호출한다. DB 롤백 시 원격 삭제는 수행하지 않는다. 이미 없는 청크 삭제는 0개 삭제로 정상 처리한다.

회원 탈퇴는 bulk 삭제 전에 본인 리뷰 ID만 확보해 `ReviewPurgeEvent`로 전달한다. 커밋 후 전용 단일 스레드·유한 큐에 작업 하나를 등록하고, 각 리뷰 ID를 순서대로 공통 삭제한다. 개별 실패 뒤에도 다음 ID를 계속 처리한다. 큐가 가득 차면 AbortPolicy로 등록을 거부하고 요청 스레드에서 원격 삭제를 대신 실행하지 않는다. 등록·실행 실패도 탈퇴 응답에 전파하지 않는다. Firebase 프로필 정리와 기존 소셜 탈퇴 정책은 유지한다.

영속 큐가 없으므로 프로세스 종료·실행 거부 시 미완료 삭제가 유실될 수 있다. 삭제에 실패한 원격 청크가 남더라도 현재 MySQL READY 허용 목록에 없는 리뷰는 질문 검색에서 제외한다. 남은 청크를 자동 전수 정리하는 기능은 없다.

## 단건·전체 재색인

| Spring API | 인증 및 결과 |
|---|---|
| `POST /api/rag/reindex/{reviewId}` | JWT 운영자 전용. `reviewId`, `result`(READY/FAILED/SKIPPED) |
| `POST /api/rag/reindex/all` | JWT 운영자 전용. `total`, `success`, `failed`, `skipped` |

두 API는 유효한 JWT의 숫자 PK, 현재 회원 존재, 재색인 기능 플래그, 운영자 허용 목록, 전체 RAG 활성화를 모두 검사한다. 클라이언트가 보낸 userId는 권한 근거로 사용하지 않는다. 미인증은 401, 비활성 재색인·일반 회원은 403, 허용된 운영자의 전체 RAG 비활성은 503이다. 없는 리뷰의 단건 재색인은 404다.

단건 재색인은 READY·FAILED·INDEXING 어느 상태라도 공통 색인으로 복구할 수 있다. 전체 재색인은 READY를 포함한 모든 ID를 확보해 순차 처리하고, 개별 실패가 다음 리뷰를 중단시키지 않게 집계한다. 자동 재시도·병렬 실행·FAILED 전용 일괄 API는 추가하지 않는다.

전체 재색인은 단일 인스턴스 실행 가드로 중복을 409로 거부하고 예외가 나도 가드를 해제한다. 시작 시 기존 READY를 INDEXING으로 일괄 무효화한다. 이 커밋이 실패하면 순차 작업을 시작하지 않는다. 원본과 updatedAt은 변경하지 않는다. 이후 각 리뷰가 READY로 복구되는 대로 질문에 다시 포함된다. 전체 재색인 중이라는 이유로 질문 전체를 막지 않고 현재 READY만 허용한다.

### StubEngine 재시작 복구

1. FastAPI를 단일 worker로 실행하고 `/health` 및 서비스 인증 연결을 확인한다.
2. Spring의 RAG 활성화·서비스 토큰과 환경별 재색인 운영자 설정을 확인한다.
3. 허용된 운영자의 MOMO Access Token으로 전체 재색인 API를 호출한다.
4. `total/success/failed/skipped`와 안전한 서버 로그를 확인한다. 실패·건너뜀은 원인을 해결한 뒤 단건 또는 전체 재색인으로 복구한다.
5. 현재 READY 데이터로 질문을 확인한다. 운영에 필요하지 않으면 재색인 기능을 다시 비활성화한다.

FastAPI 재시작은 메모리 청크를 없애지만 MySQL READY를 자동 변경하지 않는다. 자동 재시작 감지 기능이 없으므로 재시작·엔진 교체 후 전체 재색인이 필요하다. 기존 READY 무효화는 위 전체 재색인 시작 시 수행된다. 서버 프로세스가 바뀐 사실만으로 자동 복구됐다고 판단하지 않는다.

## 질문 API와 READY 허용 목록

`POST /api/rag/query`는 ALL·MINE 모두 현재 회원의 JWT가 필요하다.

```json
{"question":"이 영화의 연출은 어떤가요?","scope":"ALL"}
```

질문은 앞뒤 공백 제거 후 1~500자이며 scope는 정확히 `ALL` 또는 `MINE`이다. null·공백·길이 초과·알 수 없는 scope는 400으로 거부한다. 리뷰 ID 목록과 회원 ID는 서버가 결정한다.

- ALL: 현재 READY인 모든 회원의 리뷰.
- MINE: 인증된 회원 PK가 작성자인 READY 리뷰만.

허용 목록은 상한+1개만 조회한다. 빈 목록이면 FastAPI를 호출하지 않고 보류한다. 상한을 넘으면 임의로 일부를 잘라 검색하지 않고 안내와 `abstained=true`, 빈 sources/trace를 반환한다. 클라이언트 `top_k`를 신뢰하지 않고 서버 설정을 사용한다.

Spring은 질문 처리의 상위 트랜잭션을 NOT_SUPPORTED로 중단하고, 최초 허용 목록과 최종 출처를 각각 별도 REQUIRES_NEW 읽기에서 조회한다. HTTP 대기 동안 DB 트랜잭션을 유지하지 않는다. 최초 원본 식별 정보는 ID·작성자 PK·updatedAt·제목/본문/영화 코드의 길이 접두어 기반 SHA-256 지문이다. 본문 전체를 허용 목록에 적재하지 않으면서 시각 정밀도·collation 영향을 줄인다. MySQL 경로는 `SHA2`를 사용하고 H2 테스트는 H2 전용 해시식으로 같은 지문 계약을 확인한다. 실제 MySQL의 SHA2 실행·시간 정밀도·문자열 변경은 하단의 별도 격리 MySQL 검증에서 확인했다. H2 통과 기록과 구분한다.

FastAPI에는 `question`, `review_ids`, `top_k`만 전달한다. 작성자 이메일·닉네임·MOMO JWT는 전달하지 않는다. 반환은 `answer`, `abstained`, `sources`, `trace`이며 출처 필드는 `review_id`, `title`, `snippet`, `score`다.

### 응답 재검증 B안

Spring은 출처 ID가 최초 허용 목록에 포함되는지 확인한 뒤 새 DB 조회에서 현재 READY·존재·원본 식별 정보 일치와 MINE의 현재 소유자를 확인한다. 잘못된 응답 구조, 근거 없는 비보류 응답, 알 수 없는 trace도 보류한다. trace는 정해진 그래프 노드 이름만 허용한다.

하나라도 검증에 실패하면 **답변 전체를 안전한 보류 문구로 교체하고 sources·trace를 비운다.** 잘못된 출처만 제거해도 답변 본문에 이전 내용이 남을 수 있기 때문이다. 검증 실패 뒤 자동 재검색·재생성은 하지 않는다. 기존 그래프의 근거 부족 재검색 1회와 이 반환 검증은 별개의 정책이다. FastAPI 연결·읽기 제한 또는 실행 오류는 내부 메시지 없이 503으로 반환한다.

최종 검증 이후에도 실제 응답 전송 직전 리뷰가 수정·삭제될 가능성은 남는다. 분산 스냅샷·원격 작업 버전 프로토콜을 도입하지 않았으므로 이 창을 완전히 없앤다고 보장하지 않는다.

## Python 내부 API와 검색

| API | 입력과 동작 |
|---|---|
| `GET /health` | 공개 상태 응답. 그래프 준비 완료를 별도로 보장하는 상세 진단은 아님 |
| `POST /index` | 서비스 인증. `review_id`, `movie_code`, `title`, `content` → ID와 청크 수 |
| `DELETE /index/{review_id}` | 서비스 인증. 양수 리뷰 ID → ID와 삭제 수 |
| `POST /query` | 서비스 인증. `question`, `review_ids`, `top_k` → 모의 답변·보류·출처·trace |

이 API는 Spring 전용 내부 통신이다. 직접 호출의 질문 길이 상한은 Python DTO에서 2,000자이며 사용자용 Spring API는 500자다. 기존 `board_ids` 입력은 호환하되 `review_ids`가 함께 있으면 이를 우선한다.

StubEngine은 RecursiveCharacterTextSplitter로 본문을 기본 500자·80자 겹침으로 나누고 각 청크에 제목을 붙인다. 같은 리뷰 ID의 UPSERT는 청크 전체를 교체한다. 저장·검색 후보 복사·삭제는 프로세스 내 RLock으로 보호한다. 공백·기호를 제거한 문자 2-gram의 질문 대비 겹침 비율을 점수로 계산하고 최소 0.3 이상만 top-k로 반환한다. 의미 임베딩과 벡터 유사도 점수가 아니다.

```mermaid
flowchart LR
    retrieve --> grade
    grade -->|근거 있음| generate
    grade -->|근거 없음 · 재검색 가능| rewrite
    rewrite --> retrieve
    grade -->|근거 없음 · 횟수 소진| abstain
    generate --> format
    abstain --> format
```

`grade`는 엔진이 적용한 임계값을 재계산하지 않고 근거 유무로 분기한다. `rewrite`는 요청 표현·물음표를 제거하는 규칙이며 LLM을 호출하지 않는다. 기본 최초 검색+재검색까지 최대 2번 검색한다. 빈 허용 목록은 엔진 검색·재작성 없이 보류한다. `generate`는 가장 높은 청크의 본문 일부를 발췌하고, `format`은 리뷰별 최고 점수 청크 하나와 최대 120자 snippet을 출처로 남긴다. 여러 리뷰를 종합하거나 새로운 사실을 추론하지 않는다.

FastAPI는 프로세스 시작 때 엔진·그래프를 한 번 만든다. 그래프 초기화 실패는 색인·삭제까지 중단시키지 않고 질문만 503으로 처리한다. 질문 실행 실패는 내부 정보 없이 500이며 Spring은 이를 사용자용 503으로 변환한다.

## 실행과 검증

저장소 루트의 PowerShell 예시다. 기존 `.venv`가 없으면 먼저 로컬 Python 3.14 환경으로 생성한다. 비밀값은 추적하지 않는 설정에 직접 준비한다.

```powershell
python -m venv .\MOMO-RAG\.venv
.\MOMO-RAG\.venv\Scripts\python.exe -m pip install -r .\MOMO-RAG\requirements.txt
Set-Location MOMO-RAG
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --workers 1
```

```powershell
# 저장소 루트에서 시작, DB 접근 없는 Python 검증
Set-Location MOMO-RAG
.\.venv\Scripts\python.exe -m pytest tests -q
Set-Location ..

# Java 21 환경의 기본 백엔드 회귀
.\momo-backend\gradlew.bat -p momo-backend test

# 명시적으로 선택하는 실제 Spring HTTP ↔ FastAPI 통합, H2 전용
$env:RAG_LIVE_TEST='1'
.\momo-backend\gradlew.bat -p momo-backend test --tests '*RagLiveIntegrationTest'
Remove-Item Env:RAG_LIVE_TEST
```

pytest는 검증 환경에 별도로 필요하며 서비스 실행용 `requirements.txt`와 구분한다. 다른 환경은 `RAG_TEST_PYTHON`에 사용할 Python 절대 경로를 전달할 수 있다. 실제 통합은 임시 H2·가상 회원·가상 영화를 사용하고 종료 시 폐기한다. 공유 MySQL의 기존 회원·리뷰를 테스트 자료로 바꾸지 않는다. 격리 MySQL 검증은 별도 실행 조건과 결과를 확인하고 일반 테스트와 구분한다.

### 5차시 검증 결과 — 2026-11-25

| 검증 | 결과 및 범위 |
|---|---|
| 백엔드 전체 회귀 | 총 427개: 409 PASS, 실패 0, 18 SKIP |
| 기본 실행의 SKIP | 기존 MySQL 조건 17개 + 명시 선택형 실제 FastAPI 통합 1개 |
| Spring bootJar | PASS, 전체 회귀와 함께 빌드 완료 |
| Python pytest (`pytest tests -q`) | 18 PASS. LangSmith 관련 사용 중단 예정 경고 17건은 테스트 실패와 구분 |
| 실제 Spring HTTP ↔ FastAPI 통합 | 별도 선택 실행 1 PASS. 실제 Spring HTTP의 리뷰 CRUD→이벤트→Python 색인→MINE 정상 답변→삭제 후 ALL 보류, FastAPI 중단 뒤 CRUD 성공. H2 가상 회원·리뷰 사용 |
| 공유 MySQL 스키마·수동 SQL 적용 | NOT RUN. 공유 DB 변경 없음 |
| 실제 MySQL SHA2·updatedAt 정밀도·문자셋 | 추가 검증 PASS(MySQL8.4.11 격리 서버). 공유 DB 적용은 별도 |
| React 자동화·브라우저·외부 OAuth·영화 API·Firebase | 이번 RAG 변경의 신규 검증 범위 아님 |
| 실제 LLM·Embedding·Atlas | 도입하지 않아 검증 대상 아님 |

검증 대상에는 커밋/롤백 이벤트, 분리된 결과 트랜잭션, 색인 상태·최신 원본 보호, 재색인 접근 제어·순차 집계·가드, 탈퇴 청크 삭제·장애 격리, ALL/MINE 허용 목록과 응답 전체 보류를 포함한다. 자세한 테스트 조건은 `momo-backend/src/test/java/com/momo/backend/rag` 및 기존 리뷰·인증 회귀를 따른다. 로컬 H2 기반 통과를 공유 MySQL 적용 완료로 확대 해석하지 않는다. 실DB 도입 판정은 공유 스키마 사전 점검·승인된 수동 적용과 연결풀 운영 조건 확정이 남아 있는 조건부다. 격리 MySQL 경로 검증은 완료했다.

## 한계와 다음 단계

- 단일 프로세스 메모리 색인이라 재시작 시 사라지고 여러 worker 간 공유되지 않는다.
- 리뷰 잠금·전체 재색인 가드·state 세대는 단일 Spring 인스턴스 기준이다.
- 영속 큐·Outbox·자동 색인 재시도·자동 재시작 감지·분산 잠금은 없다.
- HTTP 타임아웃은 원격 작업 취소·완료 순서 보장이 아니다. 타임아웃 뒤 늦게 완료된 원격 UPSERT/DELETE는 로컬 잠금만으로 완전히 통제하지 못한다.
- 최종 DB 재검증 이후 전송 사이의 수정·삭제와 외부 서비스가 반환한 모든 답변 문장의 사실성은 완전히 보장하지 않는다.
- 실제 LLM·Embedding·Atlas·React RAG 화면은 후속 작업이다. 향후 도입할 때 모델/엔진 전환, 비용·대기시간, 허용 목록 규모와 삭제·버전 정책을 다시 검토한다.

## 강의 참고 자료

강의 예제는 구조·의도를 확인하는 참고로 읽었으며 해당 저장소를 수정하지 않았다.

- [Spring Boot 예제, e311ccd](https://github.com/JBear-ai/mini-prj-SpringBoot/tree/e311ccd029289992e160e802b7d0016530cca484): AFTER_COMMIT 이벤트·색인 상태·재색인·READY 허용 목록.
- [Python 예제, 7457e9f](https://github.com/JBear-ai/rag-ai-service/tree/7457e9fdca783ca01e81adb7e60fee5eff8a9d0f): FastAPI 서비스 토큰·청킹·StubEngine·LangGraph.

MOMO는 게시글 대신 영화 리뷰 ID·영화 코드를 사용하고 작성자 개인정보를 전송하지 않는다. 예제의 원시 오류 저장·HTTP를 포함한 질문 트랜잭션·응답 출처만 필터링하는 방식은 그대로 복사하지 않고, 장애 격리·트랜잭션 분리·응답 전체 보류 정책으로 보완한다. 예제에 있는 Atlas/OpenAI 구현은 이번 MOMO에 도입하지 않았다.

## 잔여 MySQL·연결풀 검증 — 2026-11-25

초기 전체 회귀427개 기록과 구분하여, 후속 선택 검증80개(기존 MySQL17 + 새 MySQL5 + pool/세대3 + 관련회귀55)가 모두 통과했다. 새 두 MySQL 테스트는 명시 실행 플래그와 임시DB URL 없이는 SKIP한다. Python·프론트 및 전체백엔드 스위트를 이번 후속검증에서 다시 실행하지는 않았다.

별도 임시 datadir·전용포트의 MySQL8.4.11에서 migration SQL 최초/재실행, 가상 기존행3개 원본·INDEXING초기값·READY/FAILED상태 보존, SHA2 UTF-8지문·DATETIME(6)·같은시각의 대소문자/한글/악센트/공백 변경검출·상태변경시각보존을 확인했다. 실제 MySQL에서 세대무효화중 이전 HTTP결과는 SKIPPED, 새결과는 READY가 됐으며 bounded 완료했다. 공유DB는 변경하지 않았다.

**연결풀 한계는 남아 있다.** pool10·동시원본8은535ms에 READY8로 완료했지만, 원본connection10을 barrier로 계속 보유시키면 REQUIRES_NEW가 추가connection을 얻지 못했다. 연결대기를1초로축약한 시험에서1057ms에 예외격리 후 원본commit10/INDEXING10으로 반환했고 수동재색인복구가성공했다. 이는 고갈조건의 재현·격리가 PASS라는 뜻이며 고갈없는 운영을 보장하지 않는다. 기본30초대기나자연발생빈도는실측하지 않았다.

P0-1/P0-2는 격리MySQL범위에서 PASS로갱신한다. P1-1은 운영총동시수·pool여유·대기시간조건이확정되지않아 PARTIAL이다. 동기 AFTER_COMMIT와 REQUIRES_NEW 구조는변경하지 않았으며 운영자원조건합의까지 최종 CONDITIONAL PASS를유지한다. 8/10의관측값을모든환경의안전상한으로일반화하지않는다. Spring의 [REQUIRES_NEW 자원 설명](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html)도참고한다. 공유DB migration은여전히승인후별도절차이다.
