-- =========================================================================
-- RASTA IT COM — Migration 003: Extend Users Table & Create Audit Logs
-- =========================================================================

-- 1. Extend Users Table: Support 'admin', 'engineer', 'operator', 'petugas'
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'engineer', 'operator', 'petugas') NOT NULL DEFAULT 'operator';

-- Add last_login_at column if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL AFTER status;

-- 2. Create Audit Logs Table (Append-Only System Audit Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NULL,
    actor_type ENUM('USER', 'SYSTEM') NOT NULL DEFAULT 'USER',
    actor_name VARCHAR(100) NULL,
    actor_role VARCHAR(50) NULL,
    action VARCHAR(100) NOT NULL,
    module ENUM('AUTH', 'MEASUREMENT', 'IMPORT', 'USER', 'SENSOR', 'EQUIPMENT', 'MAINTENANCE', 'FAILURE', 'CONFIGURATION') NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id VARCHAR(100) NULL,
    target VARCHAR(255) NULL,
    description TEXT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    reason TEXT NULL,
    status ENUM('SUCCESS', 'FAILED', 'WARNING') NOT NULL DEFAULT 'SUCCESS',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_audit_created_at (created_at),
    INDEX idx_audit_user_id (user_id),
    INDEX idx_audit_module (module),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_status (status),

    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
