# MOMO 리뷰 보완 작업 기록

기준 저장소: `madison-yoon/MOMO`  
기준 브랜치: `main`  
기준 커밋: `9ab3340`  
작업 브랜치: `fix/security-api-integrity-pages`

## 이번 PR에 포함한 변경

| 리뷰 항목 | 변경 내용 | 상태 |
| --- | --- | --- |
| 외부 API 공개 호출 통제 | 외부 조회 진입점에 IP별 분당 요청 제한 추가, 포스터 대량 요청은 별도 한도 적용 | 반영 |
| 검색 입력 상한 | 키워드 길이, 페이지, 결과 개수, 인물 식별자 검증 | 반영 |
| 자동완성 요청 크기 | 자동완성 100개 요청을 20개로 축소 | 반영 |
| 영화·리뷰 정합성 | 리뷰 영화 코드를 8자리 영숫자로 검증하고 Movie 등록 여부 확인 | 반영 |
| 등록되지 않은 영화 평점 | 평점 GET이 외부 영화 상세 수집을 유발하지 않도록 변경 | 반영 |
| Swagger 인증 표시 | 전역 Bearer 강제를 제거하고 실제 공개·인증 경로에 맞춰 Operation 단위로 보안 적용 | 반영 |
| 입력 오류 응답 | 잘못된 JSON과 컨트롤러 파라미터 검증 실패를 400으로 통일 | 반영 |
| 회원가입 중복 응답 | 사전 중복 검사와 DB unique 충돌을 모두 409로 통일 | 반영 |
| 회원정보 중복 닉네임 | 기존 회원이 다른 회원의 닉네임으로 변경할 때도 409 Conflict 반환 | 반영 |
| 비밀번호 변경 세션 보안 | 비밀번호 변경 트랜잭션 안에서 기존 Refresh Token 폐기 | 반영 |
| 실제 API CRUD 회귀 | 격리 MySQL을 사용하는 Playwright API E2E로 회원·리뷰·댓글·반응·평점·관심 영화 흐름 호출 | 반영 |
| 카탈로그 오류 노출 | DB 상태에는 안전한 오류 코드만 보관하고 공개 응답에는 고정 메시지 전달 | 반영 |
| OAuth 화면 연결 | 로그인 화면에 카카오·네이버·Google 진입 버튼 추가, 콜백 경로 연결 | 반영 |
| 회원 전용 화면 | 프로필·내 리뷰·관심 영화 경로에 프론트 라우트 가드 추가 | 반영 |
| GitHub Pages | React 빌드 후 `momo-frontend/build`만 배포하고 SPA 경로 복구 파일 생성 | 반영 |

공개 영화 조회 요청 제한의 기본값은 IP별 분당 60회, 포스터 일괄 수집은 IP별 분당 5회다. 값은 환경변수로 조정할 수 있다. 현재 제한 카운터는 Caffeine 인메모리이므로 단일 백엔드 인스턴스 기준이다. 신뢰 프록시 또는 다중 인스턴스 환경에서는 전달 IP 검증과 공유 제한 저장소가 필요하다.

포스터 일괄 수집의 기존 중복 제거 및 요청당 최대 20개 제한은 유지한다. 영화 API 일일 예산 기본값 0의 의미도 변경하지 않았다.

## 프로젝트 설정

- 데이터베이스 비밀번호는 `DB_PASSWORD`로 전달하고 기본 비밀번호를 코드에 두지 않는다.
- SQL 출력은 기본적으로 비활성화한다.
- `JPA_DDL_AUTO`는 실행환경에서 설정할 수 있다. 현재 기본값은 기존 학원용 MySQL 스키마와의 호환성을 위해 `update`로 유지했다.
- `.env.example`은 변수명 참고용이다. Spring Boot가 `.env` 파일을 자동으로 읽는 것은 아니므로 IntelliJ Run Configuration의 Environment variables 또는 실제 실행 환경에 설정해야 한다.
- 소셜 로그인은 백엔드 속성 `KAKAO_*`, `NAVER_*`, `GOOGLE_*`를 설정해야 한다. 공급자 콘솔의 Redirect URI는 실제 프론트 콜백 경로와 완전히 일치해야 한다.
- GitHub Pages 배포 전 저장소 Variables에 `MOMO_API_BASE_URL`을 등록해야 한다. 값은 외부에서 접근 가능한 HTTPS 백엔드 주소여야 하며, 설정하지 않거나 localhost/http 주소이면 workflow가 의도적으로 실패한다.
- Pages 배포 주소가 `https://madison-yoon.github.io/MOMO/`라면 OAuth Redirect URI도 `https://madison-yoon.github.io/MOMO/oauth/kakao`, `.../oauth/naver`, `.../oauth/google` 형태로 공급자 콘솔과 백엔드 설정에 동일하게 등록해야 한다.

## 프로젝트 결정으로 제외한 항목

학원 프로젝트에서 KOBIS·KMDb·TMDb API Key를 공용으로 사용하는 현재 방식을 유지한다. 이 PR은 해당 키의 폐기·재발급, 소스의 키 참조 방식 변경, Git 이력 정리를 수행하지 않는다.

## 실제 MySQL·Swagger 검증

개발 PC의 기존 `momo_db`를 대상으로 하는 지속형 검증은 `momo-frontend/e2e/swagger-persistent.spec.js`다. 이 테스트는 `MOMO_SWAGGER_LOGIN_ID` 계정을 최초 실행 때 한 번만 만들고 이후 로그인으로 재사용한다. 기존 `movies.movie_code` 두 개를 지정해 임의의 Movie 행을 만들지 않는다. 유지형 QA 리뷰·댓글은 최초 1회 생성한 뒤 같은 ID를 갱신하며 보존한다. 회원 및 유지형 QA 리뷰·댓글·반응·평점·관심 영화는 삭제하지 않는다. DELETE 동작은 별도 임시 QA 리뷰 1건과 댓글 1건만 대상으로 실행하고, 소유자·하위 댓글·반응을 확인한 뒤 삭제한다. 일반 회원과 일반 커뮤니티 데이터는 수정하거나 삭제하지 않는다.

CI의 `momo-frontend/e2e/api-crud.spec.js`는 GitHub Actions의 별도 일회용 MySQL에 실제 API를 호출한다. 여기서는 격리된 테스트 회원과 리뷰·댓글을 생성·수정·삭제한다. 이 데이터는 workflow 컨테이너와 함께 폐기되며 개발 PC의 DB와 공유되지 않는다.

두 테스트의 실행 환경과 데이터는 분리된다. CI 격리 DB 성공은 로컬 `momo_db` 성공으로 간주하지 않는다. 실제 DB 연결·기존 스키마·인덱스·제약조건 검증은 사용자의 PC에서 지속형 테스트와 SQL 사전 점검을 실행한 뒤 별도로 기록한다.

## 후속 작업으로 남긴 항목

| 리뷰 항목 | 남은 이유 및 다음 작업 |
| --- | --- |
| JPA 자동 스키마 변경을 마이그레이션으로 전환 | 현재 저장소에는 전체 기존 MySQL 스키마를 재현하는 초기 Flyway migration이 없다. 임의의 baseline이나 ddl-auto 변경은 기존 `momo_db` 실행을 깨뜨릴 수 있으므로, 실제 테이블·인덱스·제약조건을 추출하고 기존 DB와 신규 DB 양쪽을 검증한 뒤 별도 작업으로 전환해야 한다. |
| 실제 RAG 엔진 | 현재 `MOMO-RAG/engine.py`는 메모리 2-gram StubEngine이다. 실제 임베딩·벡터 저장소·LLM 추론은 아직 구현되지 않았다. MOMO 내부 RAG 서비스의 검색 품질·영속성·모델 도입은 현재 Stub 동작과 별도 검증을 거쳐 단계적으로 진행해야 한다. |
| RAG 커밋 후 처리 지연 | `ReviewIndexListener`는 AFTER_COMMIT에서 원격 색인 작업을 동기 실행한다. 단순 비동기 전환은 같은 리뷰의 UPSERT/DELETE 순서와 실패 복구를 깨뜨릴 수 있어 Outbox 또는 영속 작업 큐와 함께 바꾸는 것이 안전하다. |
| 대형 서비스·컴포넌트 분리 | MovieService, PersonService, MovieDetail, ReviewDetail, ChatPopup, AxiosApi의 책임을 도메인별로 나누는 작업은 각 경계에 회귀 테스트를 추가하며 별도 단계로 진행한다. |
| 채팅 상태 영속화·다중 인스턴스 | 현재 메시지·접속 상태는 메모리 기반이다. MySQL 메시지 이력, Redis Pub/Sub 또는 WebSocket 브로커, 공유 이미지 저장소와 재접속 커서 정책을 함께 설계해야 한다. |
| 프로필 이미지 API 실환경 검증 | 파일 유효성·권한 테스트는 존재하지만 실제 Firebase Storage 자격정보로 업로드·조회·삭제하는 통합 검증은 별도 환경에서 수행해야 한다. |
| 회원 탈퇴 API 통합 검증 | CI의 일회용 두 번째 회원으로 `DELETE /api/auth/me` 비밀번호 확인·탈퇴 응답·탈퇴 후 로그인 거부를 검증한다. 소셜 공급자 실제 연결 해제는 공급자 자격정보가 필요한 별도 검증이다. |

## 검증

PR 생성 후 GitHub Actions의 백엔드 Gradle 테스트, 프론트엔드 테스트·프로덕션 빌드, 브라우저 E2E 결과를 확인한다. GitHub Pages workflow는 `main` 배포용이며 `MOMO_API_BASE_URL` 저장소 변수가 필요하다. 외부 OAuth 공급자 실계정 로그인, 실제 공개 백엔드 주소를 이용한 Pages E2E, 실제 RAG/LLM 연결은 별도 환경 없이는 이 PR만으로 통과했다고 주장하지 않는다.
