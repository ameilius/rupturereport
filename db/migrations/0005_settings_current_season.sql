-- 0005: site settings (key/value). current_season drives the home page (/) and admin defaults.
-- Idempotent: table is created only if absent; the default is inserted only if the key is missing.
SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS settings (
  k           VARCHAR(64) NOT NULL PRIMARY KEY,
  v           VARCHAR(255) NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO settings (k, v) VALUES ('current_season', '2026');
