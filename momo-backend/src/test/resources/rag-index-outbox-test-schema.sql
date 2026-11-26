CREATE TABLE IF NOT EXISTS review_index_outbox (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    operation VARCHAR(10) NOT NULL,
    status VARCHAR(12) NOT NULL DEFAULT 'PENDING',
    attempt_count INT NOT NULL DEFAULT 0,
    available_at TIMESTAMP(6) NOT NULL,
    locked_until TIMESTAMP(6) NULL,
    claim_token VARCHAR(36) NULL,
    last_error VARCHAR(100) NULL,
    created_at TIMESTAMP(6) NOT NULL,
    completed_at TIMESTAMP(6) NULL
);
