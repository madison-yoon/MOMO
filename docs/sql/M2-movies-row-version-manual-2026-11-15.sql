-- MANUAL ONLY. This file is outside application resources and is never auto-applied.
-- Development/production application requires separate approval and a verified backup.
-- Stop ALL old Movie writers before applying; do not mix unversioned and versioned applications.
-- Verify SELECT DATABASE(), @@port, @@datadir before execution.
-- Apply ONCE to the confirmed target. Existing rows receive version 0.
ALTER TABLE movies
    ADD COLUMN row_version BIGINT NOT NULL DEFAULT 0;
-- Verify: SHOW COLUMNS FROM movies LIKE 'row_version';
-- Do not drop row_version to roll back while any versioned writer is running.
