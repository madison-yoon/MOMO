-- MOMO RAG 6차시: AFTER_COMMIT 메모리 이벤트를 위한 영속 MySQL Outbox.
-- 기존 momo_db의 데이터를 삭제·초기화하지 않는다. RAG_ENABLED=true 전에 검토 후 1회 적용한다.
-- 동일 review_id의 미완료 이벤트는 ID 순서로 처리되어 UPSERT/DELETE 순서가 유지된다.
-- FK를 두지 않는 이유: 원본 리뷰가 삭제된 뒤에도 DELETE 작업을 보존해야 한다.

CREATE TABLE IF NOT EXISTS review_index_outbox (
    id BIGINT NOT NULL AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    operation VARCHAR(10) NOT NULL,
    status VARCHAR(12) NOT NULL DEFAULT 'PENDING',
    attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
    available_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    locked_until DATETIME(6) NULL,
    claim_token CHAR(36) NULL,
    last_error VARCHAR(100) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    completed_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY ix_review_index_outbox_claim (status, available_at, id),
    KEY ix_review_index_outbox_review_order (review_id, id, status),
    KEY ix_review_index_outbox_completed (status, completed_at),
    CONSTRAINT ck_review_index_outbox_operation
        CHECK (operation IN ('UPSERT', 'DELETE')),
    CONSTRAINT ck_review_index_outbox_status
        CHECK (status IN ('PENDING', 'PROCESSING', 'DONE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
