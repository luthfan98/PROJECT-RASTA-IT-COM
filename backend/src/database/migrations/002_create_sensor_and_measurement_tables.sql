-- ==============================================================================
-- RASTA IT COM: NORMALISASI SKEMA DATABASE ASSET, SENSOR, PROVENANCE & ML
-- Menyempurnakan pemisahan antara Slot Logis Stasiun dan Unit Fisik Peralatan
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ml_predictions;
DROP TABLE IF EXISTS maintenance_events;
DROP TABLE IF EXISTS failure_events;
DROP TABLE IF EXISTS sensor_measurements;
DROP TABLE IF EXISTS sensors;
DROP TABLE IF EXISTS pump_operating_logs;
DROP TABLE IF EXISTS station_measurements;
DROP TABLE IF EXISTS measurement_sessions;
DROP TABLE IF EXISTS data_imports;
DROP TABLE IF EXISTS pump_installations;
DROP TABLE IF EXISTS pumps;
DROP TABLE IF EXISTS pump_slots;
DROP TABLE IF EXISTS stations;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Master Stations
CREATE TABLE stations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NULL,
    description TEXT NULL,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Pump Slots (Posisi / Slot Logis Stasiun)
CREATE TABLE pump_slots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT UNSIGNED NOT NULL,
    slot_code VARCHAR(50) NOT NULL,               -- 'A', 'B', 'C', 'D'
    name VARCHAR(150) NOT NULL,                    -- 'Booster Pump Slot A'
    description TEXT NULL,
    status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_station_slot (station_id, slot_code),
    CONSTRAINT fk_slots_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Pumps (Unit Fisik Aset Riil)
CREATE TABLE pumps (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(100) NOT NULL UNIQUE,       -- 'PUMP-L4-BTG-001'
    serial_number VARCHAR(100) NULL,               -- Nomor seri fisik pabrik
    name VARCHAR(150) NOT NULL,                    -- 'Sulzer Multi-Stage Unit #01'
    manufacturer VARCHAR(100) NULL,                -- 'Sulzer / Flowserve'
    model VARCHAR(100) NULL,                       -- 'Leistritz L4'
    qr_code VARCHAR(255) NULL UNIQUE,              -- 'QR-PUMP-L4-BTG-001'
    status ENUM(
        'ACTIVE',        -- Sedang terpasang & aktif
        'INACTIVE',      -- Tidak aktif sementara
        'MAINTENANCE',   -- Sedang di bengkel / overhaul
        'SPARE',         -- Unit cadangan siap pasang di gudang
        'RETIRED'        -- Purna tugas / afkir
    ) NOT NULL DEFAULT 'SPARE',
    installed_at DATE NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Pump Installations (Jembatan Sejarah Pemasangan Pompa ke Slot)
CREATE TABLE pump_installations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pump_slot_id BIGINT UNSIGNED NOT NULL,
    pump_id BIGINT UNSIGNED NOT NULL,
    installed_at DATETIME NOT NULL,
    removed_at DATETIME NULL,                      -- NULL = Masih terpasang di slot saat ini
    notes TEXT NULL,
    installed_by INT(11) NULL,
    removed_by INT(11) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_installation_active (pump_slot_id, removed_at),
    CONSTRAINT fk_install_slot FOREIGN KEY (pump_slot_id) REFERENCES pump_slots(id) ON DELETE CASCADE,
    CONSTRAINT fk_install_pump FOREIGN KEY (pump_id) REFERENCES pumps(id) ON DELETE CASCADE,
    CONSTRAINT fk_install_user_in FOREIGN KEY (installed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_install_user_out FOREIGN KEY (removed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Audit Data Imports
CREATE TABLE data_imports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    stored_file VARCHAR(500) NULL,
    import_type ENUM('CSV', 'EXCEL', 'API', 'OTHER') NOT NULL,
    data_type ENUM('ACTUAL', 'SYNTHETIC') NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'PENDING',
    total_rows INT UNSIGNED DEFAULT 0,
    success_rows INT UNSIGNED DEFAULT 0,
    failed_rows INT UNSIGNED DEFAULT 0,
    imported_by INT(11) NULL,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    error_log LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_import_user FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Measurement Sessions (Provenance Core)
CREATE TABLE measurement_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT UNSIGNED NOT NULL,
    measured_at DATETIME NOT NULL,
    source_type ENUM('MANUAL', 'IMPORT', 'SYSTEM') NOT NULL,
    data_type ENUM('ACTUAL', 'SYNTHETIC') NOT NULL DEFAULT 'ACTUAL',
    import_id BIGINT UNSIGNED NULL,
    recorded_by INT(11) NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_measurement_time (measured_at),
    INDEX idx_measurement_source (source_type),
    INDEX idx_measurement_data_type (data_type),

    CONSTRAINT fk_measurement_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    CONSTRAINT fk_measurement_import FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE SET NULL,
    CONSTRAINT fk_measurement_user FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Station Measurements (Pressure & Flow)
CREATE TABLE station_measurements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    measurement_session_id BIGINT UNSIGNED NOT NULL,
    station_id BIGINT UNSIGNED NOT NULL,
    pressure_psi DECIMAL(10,3) NULL,
    flow_value DECIMAL(12,3) NULL,
    flow_unit VARCHAR(30) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_station_session (measurement_session_id, station_id),
    CONSTRAINT fk_station_measurement_session FOREIGN KEY (measurement_session_id) REFERENCES measurement_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_station_measurement_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Pump Operating Logs (Posisi Slot & Unit Fisik)
CREATE TABLE pump_operating_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    measurement_session_id BIGINT UNSIGNED NOT NULL,
    pump_slot_id BIGINT UNSIGNED NOT NULL,
    pump_id BIGINT UNSIGNED NOT NULL,
    sequence_position TINYINT UNSIGNED NULL,
    pump_status ENUM('ON', 'OFF', 'MAINTENANCE', 'UNAVAILABLE') NOT NULL,
    operating_state ENUM(
        'OFF', 'STARTING', 'RUNNING_NORMAL', 'RUNNING_HIGH_LOAD',
        'DEGRADING', 'WARNING', 'CRITICAL', 'FAILURE', 'MAINTENANCE'
    ) NOT NULL,
    load_pct DECIMAL(6,2) NULL,
    running_hours_total DECIMAL(12,2) NULL,
    start_count_total INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_session_slot (measurement_session_id, pump_slot_id),
    INDEX idx_pump_status (pump_id, pump_status),
    INDEX idx_slot_status (pump_slot_id, pump_status),

    CONSTRAINT fk_operating_session FOREIGN KEY (measurement_session_id) REFERENCES measurement_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_operating_slot FOREIGN KEY (pump_slot_id) REFERENCES pump_slots(id) ON DELETE CASCADE,
    CONSTRAINT fk_operating_pump FOREIGN KEY (pump_id) REFERENCES pumps(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Sensors (Aset Sensor Fisik per Titik Ukur)
CREATE TABLE sensors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pump_id BIGINT UNSIGNED NOT NULL,              -- Terpasang di unit fisik pompa mana
    measurement_point VARCHAR(50) NOT NULL,        -- e.g. 'ELMOT-DE-H', 'PUMP-DE-H', 'TEMP-PUMP-DE'
    sensor_code VARCHAR(100) NOT NULL,             -- Unique instance identifier
    serial_number VARCHAR(100) NULL,
    name VARCHAR(150) NOT NULL,
    measurement_type ENUM('VIBRATION', 'TEMPERATURE', 'PRESSURE', 'OTHER') NOT NULL,
    component ENUM('ELMOT', 'PUMP', 'OTHER') NOT NULL,
    position ENUM('DE', 'NDE', 'OTHER') NOT NULL,
    axis ENUM('H', 'V', 'A', 'NONE') NOT NULL DEFAULT 'NONE',
    unit VARCHAR(30) NOT NULL,
    lower_limit DECIMAL(12,4) NULL,
    upper_limit DECIMAL(12,4) NULL,
    qr_code VARCHAR(255) NULL UNIQUE,
    status ENUM('ACTIVE', 'INACTIVE', 'DAMAGED', 'REPLACED') NOT NULL DEFAULT 'ACTIVE',
    installed_at DATETIME NULL,
    replaced_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_pump_point_code (pump_id, sensor_code),
    INDEX idx_point_status (pump_id, measurement_point, status),
    CONSTRAINT fk_sensor_pump FOREIGN KEY (pump_id) REFERENCES pumps(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Sensor Measurements
CREATE TABLE sensor_measurements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    measurement_session_id BIGINT UNSIGNED NOT NULL,
    sensor_id BIGINT UNSIGNED NOT NULL,
    value DECIMAL(14,4) NULL,
    quality ENUM('GOOD', 'SUSPECT', 'INVALID', 'NOT_MEASURED') NOT NULL DEFAULT 'GOOD',
    notes VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_sensor_measurement (measurement_session_id, sensor_id),
    INDEX idx_sensor_history (sensor_id, measurement_session_id),
    CONSTRAINT fk_sensor_measurement_session FOREIGN KEY (measurement_session_id) REFERENCES measurement_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_sensor_measurement_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Failure Events (Terikat ke Unit Fisik Pompa)
CREATE TABLE failure_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pump_id BIGINT UNSIGNED NOT NULL,
    failure_code VARCHAR(100) NULL,
    failure_mode VARCHAR(150) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NULL,
    degradation_started_at DATETIME NULL,
    warning_started_at DATETIME NULL,
    critical_started_at DATETIME NULL,
    failure_at DATETIME NULL,
    resolved_at DATETIME NULL,
    source_type ENUM('MANUAL', 'IMPORT', 'SYSTEM', 'ML_DETECTED') NOT NULL,
    data_type ENUM('ACTUAL', 'SYNTHETIC') NOT NULL DEFAULT 'ACTUAL',
    description TEXT NULL,
    created_by INT(11) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_failure_pump_time (pump_id, failure_at),
    CONSTRAINT fk_failure_pump FOREIGN KEY (pump_id) REFERENCES pumps(id) ON DELETE CASCADE,
    CONSTRAINT fk_failure_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Maintenance Events (Terikat ke Unit Fisik Pompa)
CREATE TABLE maintenance_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pump_id BIGINT UNSIGNED NOT NULL,
    failure_event_id BIGINT UNSIGNED NULL,
    maintenance_type ENUM('INSPECTION', 'PREVENTIVE', 'CORRECTIVE', 'REPLACEMENT', 'OTHER') NOT NULL,
    started_at DATETIME NOT NULL,
    completed_at DATETIME NULL,
    description TEXT NULL,
    action_taken TEXT NULL,
    performed_by VARCHAR(150) NULL,
    recorded_by INT(11) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_maintenance_pump FOREIGN KEY (pump_id) REFERENCES pumps(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_failure FOREIGN KEY (failure_event_id) REFERENCES failure_events(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_user FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. ML Predictions (Terikat ke Unit Fisik Pompa & Sesi)
CREATE TABLE ml_predictions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pump_id BIGINT UNSIGNED NOT NULL,
    measurement_session_id BIGINT UNSIGNED NULL,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    health_prediction ENUM('HEALTHY', 'DEGRADING', 'NEAR_FAIL', 'FAIL') NOT NULL,
    anomaly_score DECIMAL(8,6) NULL,
    failure_probability DECIMAL(8,6) NULL,
    predicted_failure_mode VARCHAR(150) NULL,
    predicted_hours_to_failure INT NULL,
    predicted_failure_at DATETIME NULL,
    confidence_score DECIMAL(8,6) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_prediction_pump (pump_id, created_at),
    CONSTRAINT fk_prediction_pump FOREIGN KEY (pump_id) REFERENCES pumps(id) ON DELETE CASCADE,
    CONSTRAINT fk_prediction_session FOREIGN KEY (measurement_session_id) REFERENCES measurement_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
