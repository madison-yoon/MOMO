-- 네이버·구글 적용 전 회원·Refresh Token 테이블 백업 및 현재 스키마를 먼저 확인한다.
-- 이미 동일한 구조이면 실행하지 않는다. 실제 대상 DB의 컬럼·정렬 규칙을 먼저 확인한다.
-- provider, provider_id 및 uk_users_provider_identity가 이미 있는 카카오 적용 DB 대상이다.
-- 식별자는 대소문자를 구분하며 기존 회원·토큰 행 및 복합 UNIQUE는 변경하지 않는다.
SET SESSION lock_wait_timeout = 5;
ALTER TABLE users
    MODIFY COLUMN provider_id VARCHAR(255)
    CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL;
