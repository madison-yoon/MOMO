-- 기존 데이터 백업 및 컬럼 존재 여부 확인 후 한 번만 수동 적용한다. 이 파일은 자동 실행되지 않는다.
-- 이미 컬럼·제약이 있는 DB에는 재실행하지 않는다. 적용 여부는 대상 DB에서 별도 확인한다.
-- 기존 회원은 LOCAL로 유지하고 이메일 미동의 카카오 회원에만 NULL 이메일을 허용한다.
ALTER TABLE users
    ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    ADD COLUMN provider_id VARCHAR(100) NULL,
    MODIFY COLUMN email VARCHAR(254) NULL,
    ADD CONSTRAINT uk_users_provider_identity UNIQUE (provider, provider_id);
