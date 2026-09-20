-- 004_create_anomalies_and_seed_data.sql
-- Create anomalies table and seed synthetic telemetry records into MySQL database

CREATE TABLE IF NOT EXISTS anomalies (
  id BIGINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  anomaly_code VARCHAR(100) NOT NULL UNIQUE,
  pump_id BIGINT UNSIGNED NOT NULL,
  slot_code VARCHAR(10) NOT NULL,
  measurement_point VARCHAR(100) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  anomaly_type VARCHAR(255) NOT NULL,
  severity ENUM('CRITICAL', 'WARNING', 'MODERATE', 'RESOLVED') NOT NULL DEFAULT 'WARNING',
  anomaly_score DECIMAL(6,4) NOT NULL DEFAULT 0.5000,
  detected_at DATETIME NOT NULL,
  resolved_at DATETIME NULL,
  status ENUM('OPEN', 'INVESTIGATING', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
  evidence_metric TEXT NOT NULL,
  ai_confidence INT NOT NULL DEFAULT 80,
  assigned_to VARCHAR(150) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_anomalies_pump (pump_id),
  INDEX idx_anomalies_slot (slot_code),
  INDEX idx_anomalies_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Synthetic Anomaly Incidents into MySQL
INSERT INTO anomalies (
  anomaly_code, pump_id, slot_code, measurement_point, location_name,
  anomaly_type, severity, anomaly_score, detected_at, status, evidence_metric, ai_confidence, assigned_to
) VALUES
(
  'ANOM-BTG-003-01',
  3,
  'C',
  'PUMP-DE-H',
  'Pump DE (Sisi Poros Input Dekat Kopling)',
  'Coupling Misalignment (Harmonisa 2X RPM Spike)',
  'CRITICAL',
  0.8920,
  '2026-09-19 13:00:00',
  'INVESTIGATING',
  'Getaran horizontal melonjak ke 1.82 mm/s (+237%), suhu bantalan naik ke 67.2°C',
  89,
  'Ferry Hartanto, S.T.'
),
(
  'ANOM-BTG-002-01',
  2,
  'B',
  'ELMOT-DE-H',
  'Motor DE (Sisi Poros Penggerak)',
  'Degradasi Bantalan Dini (High Spectral Kurtosis)',
  'WARNING',
  0.6840,
  '2026-09-18 09:30:00',
  'OPEN',
  'Pola noise frekuensi tinggi terdeteksi saat uji beban rotasi sebelum standby',
  74,
  'Belum ditugaskan'
),
(
  'ANOM-BTG-003-02',
  3,
  'C',
  'TEMP-PUMP-DE',
  'Sensor Suhu Bantalan Pump DE',
  'Elevated Temperature Gradient (>0.4°C/jam)',
  'WARNING',
  0.6400,
  '2026-09-19 11:15:00',
  'INVESTIGATING',
  'Suhu stabil sebelumnya 52.0°C merangkak naik hingga menyentuh 67.2°C',
  82,
  'Ferry Hartanto, S.T.'
),
(
  'ANOM-BTG-001-01',
  1,
  'A',
  'ELMOT-NDE-H',
  'Motor NDE Horizontal',
  'Transient Grid Voltage Fluctuation Spike',
  'MODERATE',
  0.3120,
  '2026-09-17 16:40:00',
  'RESOLVED',
  'Spike sesaat 0.81 mm/s mereda kembali ke baseline 0.42 mm/s dalam 3 menit',
  91,
  'Selesai (Auto-Recovered)'
),
(
  'ANOM-BTG-004-01',
  4,
  'D',
  'PUMP-DE-H',
  'Pump DE Horizontal',
  'Baseline Standby Idle Drift',
  'MODERATE',
  0.1850,
  '2026-09-16 04:20:00',
  'RESOLVED',
  'Fluktuasi latar seismik 0.08 mm/s terdeteksi saat unit lain beroperasi',
  95,
  'Selesai (Inspected Normal)'
)
ON DUPLICATE KEY UPDATE
  severity = VALUES(severity),
  anomaly_score = VALUES(anomaly_score),
  status = VALUES(status),
  evidence_metric = VALUES(evidence_metric);

-- Seed Synthetic ML Prognostics & Predictions into MySQL ml_predictions
INSERT INTO ml_predictions (
  pump_id, model_name, model_version, health_prediction,
  anomaly_score, failure_probability, predicted_failure_mode,
  predicted_hours_to_failure, predicted_failure_at, confidence_score, created_at
) VALUES
(
  1,
  'RASTA-PdM DeepVibe',
  'v2.4-Transformer',
  'HEALTHY',
  0.042000,
  0.080000,
  'Parameter vibrasi & temperatur stabil normal',
  NULL,
  NULL,
  0.940000,
  NOW()
),
(
  2,
  'RASTA-PdM DeepVibe',
  'v2.4-Transformer',
  'DEGRADING',
  0.684000,
  0.740000,
  'Bearing Degradation (Fase degradasi inner-race)',
  184,
  DATE_ADD(NOW(), INTERVAL 184 HOUR),
  0.860000,
  NOW()
),
(
  3,
  'RASTA-PdM DeepVibe',
  'v2.4-Transformer',
  'NEAR_FAIL',
  0.892000,
  0.890000,
  'Coupling Misalignment (Harmonisa 2X RPM tinggi)',
  42,
  DATE_ADD(NOW(), INTERVAL 42 HOUR),
  0.920000,
  NOW()
),
(
  4,
  'RASTA-PdM DeepVibe',
  'v2.4-Transformer',
  'HEALTHY',
  0.091000,
  0.120000,
  'Tekanan barrier seal Plan 53B stabil normal',
  NULL,
  NULL,
  0.910000,
  NOW()
)
ON DUPLICATE KEY UPDATE
  health_prediction = VALUES(health_prediction),
  anomaly_score = VALUES(anomaly_score),
  failure_probability = VALUES(failure_probability),
  predicted_failure_mode = VALUES(predicted_failure_mode),
  confidence_score = VALUES(confidence_score);

-- Seed Synthetic Maintenance Records into MySQL maintenance_events
INSERT INTO maintenance_events (
  pump_id, failure_event_id, maintenance_type, started_at, completed_at,
  description, action_taken, performed_by, recorded_by, created_at
) VALUES
(
  2,
  1,
  'CORRECTIVE',
  '2025-12-11 08:00:00',
  '2025-12-11 20:00:00',
  'Penggantian Deep Groove Ball Bearing DE & NDE pasca kegagalan EVT-B-001.',
  'Mengganti bearing SKF 7312 BECBM, lubrikasi ulang grease Polyrex EM, periksa run-out shaft.',
  'Tim Mekanik Harnet (Agus & Budi)',
  1,
  NOW()
),
(
  3,
  2,
  'CORRECTIVE',
  '2026-02-09 08:00:00',
  '2026-02-09 16:00:00',
  'Re-alignment poros motor dan pompa setelah insiden EVT-C-001.',
  'Laser shaft alignment dengan toleransi < 0.05 mm, penggantian elastomeric flexible insert.',
  'Teknisi Reliability (Rian)',
  1,
  NOW()
),
(
  4,
  3,
  'PREVENTIVE',
  '2026-04-22 10:00:00',
  '2026-04-22 17:00:00',
  'Flushing & recharging nitrogen accumulator barrier seal Plan 53B (EVT-D-001).',
  'Pengisian ulang oli sintetis ISO VG 32 dan pengisian nitrogen bladder ke 5.5 bar.',
  'Mekanik Instrumentasi (Dani)',
  1,
  NOW()
);
