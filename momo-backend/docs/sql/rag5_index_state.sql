-- RAG 5차시: 실제 공유 DB에는 자동 실행하지 않는다.
-- 운영자가 백업/대상 스키마/MySQL 버전/DDL 잠금 시간을 확인한 후 수동 적용한다.
-- MySQL 8.x 기준. INFORMATION_SCHEMA로 컬럼 유무를 확인하므로 재실행 시 기존 상태를 초기화하지 않는다.
SELECT DATABASE() AS target_schema, VERSION() AS mysql_version;
SHOW CREATE TABLE reviews;
-- updated_at에 ON UPDATE CURRENT_TIMESTAMP가 있으면 상태 전용 UPDATE도 원본 시각을 바꾼다.
-- 해당 구성은 현재 JPA 기준과 다르므로 실행을 중단하고 원본 시각 보존 방식을 먼저 확인한다.
SELECT column_name, column_type, is_nullable, column_default, extra
FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'reviews';

-- 아래 SELECT에는 실제 원본이 포함된다. 외부 로그/티켓에 결과를 붙여 넣지 않는다.
-- 적용 전 별도 승인된 백업 절차로 원본 테이블을 보관한다(이 스크립트는 원본을 삭제하지 않는다).
SET @rag5_ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'reviews' AND column_name = 'index_status'),
    'SELECT ''index_status already exists'' AS migration_note',
    'ALTER TABLE reviews ADD COLUMN index_status VARCHAR(20) NOT NULL DEFAULT ''INDEXING''');
PREPARE rag5_stmt FROM @rag5_ddl;
EXECUTE rag5_stmt;
DEALLOCATE PREPARE rag5_stmt;

SET @rag5_ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'reviews' AND column_name = 'index_error'),
    'SELECT ''index_error already exists'' AS migration_note',
    'ALTER TABLE reviews ADD COLUMN index_error VARCHAR(500) NULL');
PREPARE rag5_stmt FROM @rag5_ddl;
EXECUTE rag5_stmt;
DEALLOCATE PREPARE rag5_stmt;

SET @rag5_ddl = IF(EXISTS(SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'reviews' AND column_name = 'indexed_at'),
    'SELECT ''indexed_at already exists'' AS migration_note',
    'ALTER TABLE reviews ADD COLUMN indexed_at DATETIME(6) NULL');
PREPARE rag5_stmt FROM @rag5_ddl;
EXECUTE rag5_stmt;
DEALLOCATE PREPARE rag5_stmt;

-- 기존 컬럼이 다른 타입/기본값으로 존재하면 이 스크립트가 임의 변경하지 않는다. 아래 결과를 확인한다.
SELECT column_name, column_type, is_nullable, column_default, extra
FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'reviews'
  AND column_name IN ('index_status', 'index_error', 'indexed_at', 'updated_at');
SELECT index_status, COUNT(*) AS review_count FROM reviews GROUP BY index_status;
-- 첫 적용의 기존 행은 INDEXING/NULL/NULL이어야 한다. 재실행은 기존 READY/FAILED와 indexed_at을 보존한다.
-- 원본 행 수 및 제목/본문/updated_at은 승인된 적용 전 백업과 비교한다.
