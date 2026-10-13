-- =========================================================
-- AUTH & USER MANAGEMENT SCHEMA
-- Mật Mã Thăng Long
-- =========================================================

USE mat_ma_thang_long;

-- =========================================================
-- 1. USERS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(50)  NOT NULL UNIQUE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,           -- bcrypt hash
  display_name    VARCHAR(100) NOT NULL,
  avatar_url      VARCHAR(500) NULL,
  role            ENUM('player','admin','guest') NOT NULL DEFAULT 'player',
  status          ENUM('active','banned','pending') NOT NULL DEFAULT 'active',
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_username (username),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 2. USER SESSIONS (JWT refresh tokens / remember-me)
-- =========================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  token_hash    VARCHAR(255) NOT NULL,             -- hash of refresh token
  device_info   VARCHAR(255) NULL,
  ip_address    VARCHAR(45) NULL,
  expires_at    DATETIME NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at    DATETIME NULL,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_token (token_hash),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 3. PASSWORD RESET TOKENS (forgot password)
-- =========================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME NOT NULL,
  used_at     DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reset_token (token_hash),
  INDEX idx_reset_user (user_id),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. LOGIN ATTEMPTS (chống brute-force)
-- =========================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  identifier   VARCHAR(255) NOT NULL,              -- username hoặc IP
  success      BOOLEAN NOT NULL,
  ip_address   VARCHAR(45) NULL,
  user_agent   VARCHAR(500) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attempts_identifier (identifier, created_at),
  INDEX idx_attempts_ip (ip_address, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. AUDIT LOG (admin theo dõi hành động)
-- =========================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  action      VARCHAR(100) NOT NULL,               -- LOGIN, LOGOUT, REGISTER, UPDATE_PROFILE, ...
  entity      VARCHAR(50) NULL,                    -- user, mission, collectible, ...
  entity_id   VARCHAR(100) NULL,
  metadata    JSON NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id, created_at),
  INDEX idx_audit_action (action, created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 6. USER GAME PROGRESS (tiến trình chơi — gắn với user)
-- =========================================================
CREATE TABLE IF NOT EXISTS user_progress (
  user_id                INT PRIMARY KEY,
  total_xp               INT NOT NULL DEFAULT 0,
  checkpoints_completed  TINYINT NOT NULL DEFAULT 0,
  collectibles_found     SMALLINT NOT NULL DEFAULT 0,
  clues_found            SMALLINT NOT NULL DEFAULT 0,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. SEED DATA — tài khoản demo
-- Mật khẩu gốc (plain):
--   player / 123456
--   admin  / admin123
--   guest  / guest
-- Password hash dưới đây là bcrypt (cost 10).
-- =========================================================
INSERT INTO users (username, email, password_hash, display_name, role, email_verified, status) VALUES
  ('player', 'player@matmathanglong.vn', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sĩ Tử',          'player', TRUE, 'active'),
  ('admin',  'admin@matmathanglong.vn',  '$2b$10$eImiTXuWVxfM37uY4JANjQ==.IiJ0m8sMKMmVz0z0z0z0z0z0z0z0', 'Quản Trị Viên', 'admin',  TRUE, 'active'),
  ('guest',  'guest@matmathanglong.vn',  '$2b$10$guestHASHplaceholderxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Khách',         'guest',  TRUE, 'active')
ON DUPLICATE KEY UPDATE username = username;

-- Seed progress rows
INSERT INTO user_progress (user_id, total_xp, checkpoints_completed, collectibles_found, clues_found)
SELECT id, 0, 0, 0, 0 FROM users
ON DUPLICATE KEY UPDATE user_id = user_id;

-- =========================================================
-- 8. VIEW: user summary cho admin dashboard
-- =========================================================
CREATE OR REPLACE VIEW v_user_summary AS
SELECT
  u.id,
  u.username,
  u.email,
  u.display_name,
  u.role,
  u.status,
  u.email_verified,
  u.last_login_at,
  u.created_at,
  COALESCE(p.total_xp, 0)              AS total_xp,
  COALESCE(p.checkpoints_completed, 0) AS checkpoints_completed,
  COALESCE(p.collectibles_found, 0)    AS collectibles_found,
  COALESCE(p.clues_found, 0)           AS clues_found
FROM users u
LEFT JOIN user_progress p ON p.user_id = u.id;