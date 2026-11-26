# OAuth 구조 개선 및 소셜 회원 기능

## 1. 개선 전 문제와 처리 결과

카카오와 네이버·Google의 Controller·브라우저 Flow·Callback 중복을 통합했다. 공급자와 무관한 회원 처리·state 클래스는 SocialLoginService·OAuthStateService로 정리했다. 이메일이 없는 소셜 회원의 닉네임 수정, 소셜 이메일 읽기 전용, 비밀번호 UI·우회 변경 차단, 자동 연결 해제 탈퇴를 지원한다.

일반 회원의 이메일·비밀번호 요구와 소셜 계정의 provider + providerId 식별은 유지한다. 이메일로 계정을 자동 연결하지 않는다. providerId와 공급자 토큰은 회원 응답에 추가하지 않으며 provider만 추가한다.

## 2. 클래스별 역할

| 클래스 | 역할 |
| --- | --- |
| OAuthController | 기존 세 공급자 로그인 URL, 목적별 state 쿠키와 탈퇴 Callback API |
| OAuthStateService | 300초·최대 1,000개 일회용 context, LOGIN/DELETE·공급자·탈퇴 대상 바인딩 |
| KakaoOAuthService | 카카오 코드 교환·신원 검증, Admin Key 연결 해제 |
| SocialOAuthService | 네이버·Google 코드 교환·신원 검증, 탈퇴 시 토큰 일시 유지와 revoke |
| GoogleIdentityVerifier | 기존 서명·issuer·audience·만료·nonce·sub·iat·azp 검증 유지 |
| OAuthHttpSupport | HTTP 시간 제한과 비밀값 없는 외부 오류 변환 |
| SocialLoginService | 공급자·ID 조회·가입 및 기존 동시 가입 재시도 |
| LoginSessionService | 일반·소셜 공통 JWT 생성 → Refresh Token 저장·교체 → LoginResponse |
| AccountDeletionService | 회원·동의 검증, 외부 해제, 새 트랜잭션 DB 삭제와 제한적 재시도 |
| AuthService | 기존 LOCAL 비밀번호 인증·프로필 정책, 공통 연관 데이터 삭제 |

## 3. API 및 처리 흐름

기존 공개 로그인 API와 콜백 주소는 유지한다.

- `GET /api/auth/{kakao|naver|google}/authorize`
- `POST /api/auth/{kakao|naver|google}`: `{code,state}`
- React: `/oauth/kakao`, `/oauth/naver`, `/oauth/google`

로그인: state 발급 → 공급자 인증 → 쿠키·LOGIN 목적 확인·일회 소비 → 공급자별 신원 검증 → 회원 조회/가입 → 공통 MOMO 토큰 발급 → 기존 completeLogin.

탈퇴 API는 MOMO JWT 인증이 필요하다. 공급자는 요청 본문이 아닌 DB에서 판단한다.

| API | 입력 / 처리 |
| --- | --- |
| `DELETE /api/auth/me` | LOCAL은 기존 `{password}`. KAKAO는 `{agreed:true,confirmation:"MOMO 회원 탈퇴"}` 후 DB providerId로 Admin Key Unlink |
| `POST /api/auth/{naver|google}/delete/authorize` | `{agreed:true,confirmation:"MOMO 회원 탈퇴"}`. DELETE 목적·인증 회원 바인딩 |
| `POST /api/auth/{naver|google}/delete/complete` | `{code,state,agreed:true,confirmation:"MOMO 회원 탈퇴"}`. 목적·현재 회원·공급자·외부 ID 일치 후 revoke·내부 삭제 |

DELETE에서는 회원가입·MOMO 토큰 발급을 실행하지 않는다. 정상 로그인 쿠키 `momo_{provider}_state`는 유지하고 탈퇴 쿠키 `momo_{provider}_delete_state`를 분리한다. React도 목적별 pending state·시도 Promise를 분리한다. 공급자 취소·계정 불일치·실패는 탈퇴 완료로 표시하지 않는다.

공급자 Access Token은 외부 인증과 revoke를 수행하는 서버 요청 동안만 참조한다. DB나 브라우저에 새로 저장하지 않는다. OAuthAuthenticationResult는 토큰 직렬화를 차단하고 toString을 가린다. JVM 메모리의 즉시 물리적 소거를 보장한다는 의미는 아니다.

## 4. 일반 로그인·JWT 호환성

TokenProvider·RefreshTokenService·GoogleIdentityVerifier의 구현은 변경하지 않았다. JWT의 내부 숫자 userId, 유형·만료·서명, Refresh Token의 해시 저장·Rotation·회원별 한 개 정책과 회원→토큰 잠금 순서를 유지한다. 소셜 신규 가입 트랜잭션에 공통 발급 서비스가 참여하므로 회원 생성과 토큰 저장이 같이 커밋된다.

탈퇴는 기존 Refresh Token·반응·댓글·리뷰·영화 평가·관심 영화·회원 삭제 순서를 공유한다. 이미지 삭제는 DB 커밋 후 수행한다. 탈퇴 커밋 후 JwtFilter의 회원 존재 검사로 기존 Access Token 인증도 거부된다.

Axios 공개 인증 제외는 정확한 URL 경로로 판정한다. 탈퇴 요청에는 Bearer와 세션 가드를 적용하며, 공급자 인증 오류는 403, 외부 해제 실패/불명은 502, 해제 후 내부 삭제 실패/불명은 503으로 구분한다. JWT 인증 실패 401은 state 소비 전에 발생하므로 이 경우에만 기존 재발급 흐름을 적용한다.

## 5. 실패·재시도 경계

외부 호출 중 회원 행 잠금과 DB 쓰기 트랜잭션을 유지하지 않는다. 외부 해제 실패·타임아웃·해석 불가 응답에서는 DB 삭제를 시작하지 않고 외부 요청을 자동 반복하지 않는다.

해제 성공 뒤의 삭제는 매번 `REQUIRES_NEW` 트랜잭션에서 회원을 다시 조회한다. 쓰기 단계에서 실패하고 명시적 rollback이 성공했으며, Spring PessimisticLockingFailureException과 JDBC MySQL 잠금 코드가 모두 일치할 때만 총 3회까지 시도한다. 대상은 deadlock 1213/40001, lock timeout 1205/HY000 또는 드라이버 호환 41000이다. commit 호출 후 오류·연결 오류·제약 위반·rollback 실패는 자동 재시도하지 않는다. 성공한 Unlink는 같은 처리 안에서 다시 호출하지 않는다.

실패 로그에는 확인 번호, 공급자, 내부 회원 ID, 단계, 시도 횟수, 예외 종류와 정제된 SQLState·vendor code만 기록한다. SQL·토큰·요청 본문·외부 예외 메시지는 기록하지 않는다.

## 6. 환경설정 및 DB

기존 OAuth 설정과 Redirect URI는 유지한다. 카카오 자동 해제용 `KAKAO_ADMIN_KEY`만 서버 `.env`에 추가하고 앱의 해당 API 사용 권한을 확인한다. 또는 Spring 속성 `kakao.admin-key`를 사용한다. 실제 키는 소스·React·Git에 넣지 않는다. 미설정이면 카카오 탈퇴만 503으로 중단하고 로그인 설정은 그대로 사용한다. `.env.example`에는 빈 항목만 추가했다.

이번 개선에 스키마 변경은 없다. 기존 SQL·실제 .env·개발 MySQL·회원 데이터는 변경하지 않았다. 기존 DB에 스키마 SQL을 재실행하지 않는다.

## 7. 검증과 알려진 한계

최종 자동화 실행 결과와 변경 파일 목록은 아래 실행 기록에 정리한다. 테스트는 H2·모의 HTTP·JSDOM 기반이며 실제 공급자 OAuth·Unlink와 개발 MySQL을 검증한 결과가 아니다.

- 서버 재시작·영구 DB 실패 시 이미 성공한 외부 해제를 자동 복구하는 저장소·큐는 없다. 재시작 후 이전 Unlink 성공도 기억하지 않는다.
- 외부 해제와 DB 삭제는 원자적이지 않다. commit 결과가 불명확하면 실제 삭제되었더라도 완료라고 단정하지 않는다.
- 서버 내 고정 개수 잠금은 단일 프로세스의 동시 탈퇴만 방어한다. 다중 인스턴스·진행 중 로그인과 삭제의 전역 경합 차단을 보장하지 않는다.
- Google 계정 선택은 비밀번호 재입력 강제가 아니다. revoke의 프로젝트 전체 권한 철회 범위와 반영 지연을 실제 앱 환경에서 확인해야 한다.
- 이미 해제된 카카오 -101 및 네이버 200의 의미는 공식 계약에 따라 처리한다. 다른 4xx·유사 코드를 성공으로 확대하지 않는다. 실제 앱 키 권한과 응답은 미검증이다.
- MySQL vendor 오류 분류·재시도는 모의 오류와 실제 H2 rollback 경계로 검증했다. 실제 MySQL lock 오류 및 기존 collation·DDL 상태는 확인하지 않았다.

## 공식 근거

- [카카오 연결 해제 요청·응답](https://developers.kakao.com/docs/ko/kakaologin/rest-api#unlink)
- [카카오 오류 코드](https://developers.kakao.com/docs/ko/rest-api/error-code)
- [네이버 재인증·토큰 폐기](https://developers.naver.com/docs/login/devguide/devguide.md)
- [네이버 revoke 요청·성공·실패](https://developers.naver.com/docs/login/api/api.md)
- [Google revoke·범위·지연](https://developers.google.com/identity/protocols/oauth2/web-server#tokenrevoke)
- [MySQL 잠금 오류 코드](https://dev.mysql.com/doc/mysql-errors/8.4/en/server-error-reference.html)


## 8. 이번 실행 결과 (2026-11-20, Asia/Seoul)

| 검증 | 결과 |
| --- | --- |
| `SPRING_PROFILES_ACTIVE=test`, Java 21, `gradlew.bat build --console=plain` | PASS, bootJar 포함 |
| JUnit 전체 | 69 suites / 342건: 329 PASS, 0 FAIL, 13 SKIP |
| SKIP 사유 | 기존 MovieMySqlLostUpdateTest: 별도 폐기용 MySQL 환경이 없어 비활성 |
| `CI=true npm test -- --watchAll=false --runInBand` | 29 suites / 205 PASS |
| `CI=true npm run build` | PASS |
| `git diff --check` | PASS |
| 실제 공급자 로그인·Unlink / 실제 MySQL | 미실행 |

H2에서 회원 생성·재로그인·Rotation·동시 가입·소셜 프로필·탈퇴·옛 JWT 거부·동일 소셜 재가입과 전체 삭제 rollback 후 새 트랜잭션 재시도를 확인했다. 모의 HTTP에서 세 공급자 해제 성공·거부·타임아웃·카카오 ID 불일치·명세상 이미 해제 응답·Google PKCE/nonce 경로 및 Access Token 필수 검사를 확인했다. JSDOM·Axios adapter에서 목적 혼용·중복 교환·JWT 재발급·계정 전환과 전체 페이지 이동 후 늦은 Callback 차단을 확인했다.

독립 검토에서 LOGIN의 페이지 이동 후 세션 바인딩 누락을 발견해 회귀 테스트로 보완했다. 진단용 DB 오류는 비밀값을 출력하지 않고 SQLState/vendor code만 남기도록 검증했다. 외부 호출 실성공이나 MySQL 실동작으로 확대해서 해석하지 않는다. 빌드에는 기존 JVM CDS 및 Node fs.F_OK 사용 관련 안내가 있었고 오류는 없었다.

Git은 `feature/ui-redesign`, HEAD `bc51514`를 유지한다. 시작 전 변경은 없었으며 이번 변경은 모두 로컬 미커밋 상태다. Commit·Push·PR·Merge, 실제 .env·DB·SQL 변경을 수행하지 않았다.

## 9. 변경 파일 전체 목록

이름 변경은 Git stage 전이므로 삭제/추가 쌍으로 표시될 수 있다. `M` 수정, `D` 삭제·통합, `A` 신규·이름 변경 결과다. 경로는 프로젝트 루트 기준이다.

- `M` `momo-backend/.env.example`
- `M` `momo-backend/docs/KAKAO_LOGIN.md`
- `M` `momo-backend/docs/OAUTH_TEAM_SETUP.md`
- `M` `momo-backend/docs/SOCIAL_LOGIN.md`
- `M` `momo-backend/src/main/java/com/momo/backend/config/SecurityConfig.java`
- `M` `momo-backend/src/main/java/com/momo/backend/controller/AuthController.java`
- `D` `momo-backend/src/main/java/com/momo/backend/controller/KakaoAuthController.java`
- `D` `momo-backend/src/main/java/com/momo/backend/controller/SocialAuthController.java`
- `D` `momo-backend/src/main/java/com/momo/backend/dto/auth/KakaoAuthorizeResponse.java`
- `D` `momo-backend/src/main/java/com/momo/backend/dto/auth/KakaoLoginRequest.java`
- `D` `momo-backend/src/main/java/com/momo/backend/dto/auth/KakaoUserInfo.java`
- `M` `momo-backend/src/main/java/com/momo/backend/dto/auth/LoginResponse.java`
- `M` `momo-backend/src/main/java/com/momo/backend/dto/auth/OAuthRequestContext.java`
- `M` `momo-backend/src/main/java/com/momo/backend/dto/auth/UserDeleteRequest.java`
- `M` `momo-backend/src/main/java/com/momo/backend/dto/auth/UserResponse.java`
- `M` `momo-backend/src/main/java/com/momo/backend/dto/auth/UserUpdateRequest.java`
- `M` `momo-backend/src/main/java/com/momo/backend/service/AuthService.java`
- `D` `momo-backend/src/main/java/com/momo/backend/service/KakaoLoginService.java`
- `M` `momo-backend/src/main/java/com/momo/backend/service/KakaoOAuthService.java`
- `D` `momo-backend/src/main/java/com/momo/backend/service/KakaoStateService.java`
- `M` `momo-backend/src/main/java/com/momo/backend/service/SocialOAuthService.java`
- `M` `momo-backend/src/test/java/com/momo/backend/controller/KakaoAuthControllerTest.java`
- `M` `momo-backend/src/test/java/com/momo/backend/controller/SocialAuthControllerTest.java`
- `M` `momo-backend/src/test/java/com/momo/backend/security/H1IdentityIntegrationTest.java`
- `M` `momo-backend/src/test/java/com/momo/backend/service/AuthServiceAccountDeletionTest.java`
- `D` `momo-backend/src/test/java/com/momo/backend/service/KakaoLoginIntegrationTest.java`
- `D` `momo-backend/src/test/java/com/momo/backend/service/KakaoStateServiceTest.java`
- `M` `momo-backend/src/test/java/com/momo/backend/service/SocialOAuthServiceTest.java`
- `M` `momo-backend/src/test/java/com/momo/backend/service/SocialOAuthStateTest.java`
- `M` `momo-frontend/src/App.js`
- `M` `momo-frontend/src/api/AxiosApi.js`
- `M` `momo-frontend/src/api/AxiosApi.session.test.js`
- `M` `momo-frontend/src/api/AxiosApi.test.js`
- `D` `momo-frontend/src/auth/kakaoFlow.js`
- `D` `momo-frontend/src/auth/kakaoFlow.test.js`
- `M` `momo-frontend/src/auth/socialOAuthFlow.js`
- `M` `momo-frontend/src/auth/socialOAuthFlow.test.js`
- `M` `momo-frontend/src/pages/ArchiveRevision.test.js`
- `M` `momo-frontend/src/pages/AuthSessionActions.test.js`
- `D` `momo-frontend/src/pages/KakaoCallback.js`
- `D` `momo-frontend/src/pages/KakaoCallback.test.js`
- `M` `momo-frontend/src/pages/Login.js`
- `M` `momo-frontend/src/pages/Profile.js`
- `M` `momo-frontend/src/pages/ProfileDelete.js`
- `M` `momo-frontend/src/pages/ProfileEdit.js`
- `M` `momo-frontend/src/pages/SocialOAuthCallback.js`
- `M` `momo-frontend/src/pages/SocialOAuthCallback.test.js`
- `M` `momo-frontend/src/setupTests.js`
- `M` `momo-frontend/src/utils/completeLogin.js`
- `A` `docs/superpowers/plans/2026-11-20-oauth-improvement.md`
- `A` `momo-backend/docs/OAUTH_IMPROVEMENT.md`
- `A` `momo-backend/src/main/java/com/momo/backend/controller/OAuthController.java`
- `A` `momo-backend/src/main/java/com/momo/backend/dto/auth/OAuthAuthenticationResult.java`
- `A` `momo-backend/src/main/java/com/momo/backend/dto/auth/OAuthAuthorizeResponse.java`
- `A` `momo-backend/src/main/java/com/momo/backend/dto/auth/OAuthDeleteRequest.java`
- `A` `momo-backend/src/main/java/com/momo/backend/dto/auth/OAuthLoginRequest.java`
- `A` `momo-backend/src/main/java/com/momo/backend/dto/auth/OAuthPurpose.java`
- `A` `momo-backend/src/main/java/com/momo/backend/service/AccountDeletionService.java`
- `A` `momo-backend/src/main/java/com/momo/backend/service/LoginSessionService.java`
- `A` `momo-backend/src/main/java/com/momo/backend/service/OAuthHttpSupport.java`
- `A` `momo-backend/src/main/java/com/momo/backend/service/OAuthStateService.java`
- `A` `momo-backend/src/main/java/com/momo/backend/service/SocialLoginService.java`
- `A` `momo-backend/src/test/java/com/momo/backend/controller/OAuthDeletionControllerTest.java`
- `A` `momo-backend/src/test/java/com/momo/backend/service/AccountDeletionServiceTest.java`
- `A` `momo-backend/src/test/java/com/momo/backend/service/OAuthDeletionStateTest.java`
- `A` `momo-backend/src/test/java/com/momo/backend/service/OAuthStateServiceTest.java`
- `A` `momo-backend/src/test/java/com/momo/backend/service/SocialLoginIntegrationTest.java`
- `A` `momo-backend/src/test/java/com/momo/backend/service/SocialProfilePolicyTest.java`
- `A` `momo-backend/src/test/java/com/momo/backend/service/SocialUnlinkContractTest.java`
- `A` `momo-frontend/src/pages/SocialProfile.test.js`
