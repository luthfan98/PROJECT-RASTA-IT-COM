import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function seedUsersAndAudit() {
    console.log('🚀 Running Migration 003 & Seeding Users + Audit Logs...');
    const connection = await mysql.createConnection({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        multipleStatements: true,
    });
    try {
        // 1. Run Migration 003
        const migrationFile = path.resolve(__dirname, '..', 'migrations', '003_create_audit_and_extend_users.sql');
        if (fs.existsSync(migrationFile)) {
            const sql = fs.readFileSync(migrationFile, 'utf-8');
            await connection.query(sql);
            console.log('✅ Migration 003 executed successfully.');
        }
        // 2. Hash default passwords
        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin123', salt);
        const engPass = await bcrypt.hash('engineer123', salt);
        const opPass = await bcrypt.hash('operator123', salt);
        // 3. Seed Users
        const usersToSeed = [
            {
                username: 'admin',
                name: 'Administrator Utama',
                email: 'admin@rasta.it',
                password: adminPass,
                role: 'admin',
                status: 'active',
                last_login_at: '2026-09-19 14:15:00',
            },
            {
                username: 'engineer',
                name: 'Ferry Hartanto, S.T.',
                email: 'ferry.eng@rasta.it',
                password: engPass,
                role: 'engineer',
                status: 'active',
                last_login_at: '2026-09-18 18:30:00',
            },
            {
                username: 'andi01',
                name: 'Andi Pratama',
                email: 'andi@rasta.it',
                password: opPass,
                role: 'operator',
                status: 'active',
                last_login_at: '2026-09-19 14:02:00',
            },
            {
                username: 'budi02',
                name: 'Budi Santoso',
                email: 'budi@rasta.it',
                password: opPass,
                role: 'operator',
                status: 'active',
                last_login_at: '2026-09-19 13:48:00',
            },
            {
                username: 'citra03',
                name: 'Citra Lestari',
                email: 'citra@rasta.it',
                password: opPass,
                role: 'operator',
                status: 'active',
                last_login_at: '2026-09-17 11:20:00',
            },
            {
                username: 'dani04',
                name: 'Dani Setiawan',
                email: 'dani@rasta.it',
                password: opPass,
                role: 'operator',
                status: 'active',
                last_login_at: '2026-09-16 09:15:00',
            },
            {
                username: 'eko05',
                name: 'Eko Wahyudi',
                email: 'eko@rasta.it',
                password: opPass,
                role: 'operator',
                status: 'inactive',
                last_login_at: '2026-09-02 16:40:00',
            },
            {
                username: 'fajar06',
                name: 'Fajar Nugroho',
                email: 'fajar@rasta.it',
                password: opPass,
                role: 'operator',
                status: 'active',
                last_login_at: '2026-09-18 15:10:00',
            },
            {
                username: 'hendro_spv',
                name: 'Hendro Wijaya',
                email: 'hendro.spv@rasta.it',
                password: engPass,
                role: 'engineer',
                status: 'active',
                last_login_at: '2026-09-15 08:25:00',
            },
            {
                username: 'tamu01',
                name: 'Tamu Auditor Eksternal',
                email: 'auditor@mitra.it',
                password: opPass,
                role: 'operator',
                status: 'inactive',
                last_login_at: '2026-08-20 10:00:00',
            }
        ];
        for (const u of usersToSeed) {
            await connection.query(`INSERT INTO users (username, name, email, password, role, status, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           email = VALUES(email),
           role = VALUES(role),
           status = VALUES(status),
           last_login_at = VALUES(last_login_at);`, [u.username, u.name, u.email, u.password, u.role, u.status, u.last_login_at]);
        }
        console.log('✅ Users seeded successfully.');
        // Fetch user IDs
        const [userRows] = await connection.query('SELECT id, username, name, role FROM users;');
        const userMap = {};
        for (const row of userRows) {
            userMap[row.username] = { id: row.id, name: row.name, role: row.role };
        }
        // 4. Seed Audit Logs
        const andi = userMap['andi01'] || { id: 3, name: 'Andi Pratama', role: 'operator' };
        const admin = userMap['admin'] || { id: 1, name: 'Administrator Utama', role: 'admin' };
        const ferry = userMap['engineer'] || { id: 2, name: 'Ferry Hartanto, S.T.', role: 'engineer' };
        const budi = userMap['budi02'] || { id: 4, name: 'Budi Santoso', role: 'operator' };
        const auditEvents = [
            {
                user_id: andi.id,
                actor_type: 'USER',
                actor_name: andi.name,
                actor_role: andi.role,
                action: 'MEASUREMENT_UPDATED',
                module: 'MEASUREMENT',
                entity_type: 'MEASUREMENT',
                entity_id: 'MSR-000182',
                target: 'Pump C / Pump Drive End Horizontal',
                description: 'Koreksi nilai getaran abnormal akibat salah input angka pada perangkat lapangan',
                old_values: JSON.stringify({ value: 1.82, quality: 'SUSPECT', unit: 'mm/s' }),
                new_values: JSON.stringify({ value: 1.28, quality: 'GOOD', unit: 'mm/s' }),
                reason: 'Incorrect field entry (koma tergeser saat input cepat)',
                status: 'SUCCESS',
                ip_address: '192.168.1.104',
                user_agent: 'Mobile Safari / Chrome Android Pixel 9',
                created_at: '2026-09-19 14:07:22'
            },
            {
                user_id: andi.id,
                actor_type: 'USER',
                actor_name: andi.name,
                actor_role: andi.role,
                action: 'MEASUREMENT_CREATED',
                module: 'MEASUREMENT',
                entity_type: 'MEASUREMENT',
                entity_id: 'MSR-000182',
                target: 'Pump C / Pump Drive End Horizontal',
                description: 'Pengukuran manual tri-axial horizontal bantalan pompa Drive End (1.82 mm/s - WARNING)',
                old_values: null,
                new_values: JSON.stringify({ value: 1.82, unit: 'mm/s', quality: 'ACTUAL', source: 'MANUAL' }),
                reason: null,
                status: 'WARNING',
                ip_address: '192.168.1.104',
                user_agent: 'Mobile Safari / Chrome Android Pixel 9',
                created_at: '2026-09-19 14:03:10'
            },
            {
                user_id: andi.id,
                actor_type: 'USER',
                actor_name: andi.name,
                actor_role: andi.role,
                action: 'MEASUREMENT_CREATED',
                module: 'MEASUREMENT',
                entity_type: 'MEASUREMENT',
                entity_id: 'MSR-000181',
                target: 'Pump C / Pump Drive End Vertical',
                description: 'Pengukuran manual vertikal bantalan pompa Drive End (0.74 mm/s - NORMAL)',
                old_values: null,
                new_values: JSON.stringify({ value: 0.74, unit: 'mm/s', quality: 'ACTUAL', source: 'MANUAL' }),
                reason: null,
                status: 'SUCCESS',
                ip_address: '192.168.1.104',
                user_agent: 'Mobile Safari / Chrome Android Pixel 9',
                created_at: '2026-09-19 14:01:45'
            },
            {
                user_id: andi.id,
                actor_type: 'USER',
                actor_name: andi.name,
                actor_role: andi.role,
                action: 'LOGIN_SUCCESS',
                module: 'AUTH',
                entity_type: 'USER',
                entity_id: String(andi.id),
                target: andi.name,
                description: 'Autentikasi sesi operator lapangan berhasil',
                old_values: null,
                new_values: null,
                reason: null,
                status: 'SUCCESS',
                ip_address: '192.168.1.104',
                user_agent: 'Mobile Safari / Chrome Android Pixel 9',
                created_at: '2026-09-19 13:52:12'
            },
            {
                user_id: admin.id,
                actor_type: 'USER',
                actor_name: admin.name,
                actor_role: admin.role,
                action: 'USER_UPDATED',
                module: 'USER',
                entity_type: 'USER',
                entity_id: String(budi.id),
                target: budi.name,
                description: 'Pembaruan email operasional dan penugasan regu shift',
                old_values: JSON.stringify({ email: 'budi.old@rasta.it' }),
                new_values: JSON.stringify({ email: 'budi@rasta.it' }),
                reason: 'Penyeragaman domain email resmi perusahaan',
                status: 'SUCCESS',
                ip_address: '127.0.0.1',
                user_agent: 'RASTA Admin Workstation (Desktop Windows 11)',
                created_at: '2026-09-19 12:45:00'
            },
            {
                user_id: ferry.id,
                actor_type: 'USER',
                actor_name: ferry.name,
                actor_role: ferry.role,
                action: 'SENSOR_REPLACED',
                module: 'SENSOR',
                entity_type: 'SENSOR',
                entity_id: 'SNS-C-PDE-H-021',
                target: 'Pump C / Pump DE Horizontal',
                description: 'Penggantian sensor piezo-elektrik lama karena thermal drift',
                old_values: JSON.stringify({ sensor_code: 'SNS-C-PDE-H-001', status: 'REPLACED' }),
                new_values: JSON.stringify({ sensor_code: 'SNS-C-PDE-H-021', status: 'ACTIVE', calibration_date: '2026-03-12' }),
                reason: 'Sensor malfunction & baseline drift',
                status: 'SUCCESS',
                ip_address: '192.168.1.55',
                user_agent: 'Engineering Laptop',
                created_at: '2026-09-19 10:30:00'
            },
            {
                user_id: admin.id,
                actor_type: 'USER',
                actor_name: admin.name,
                actor_role: admin.role,
                action: 'PUMP_REPLACED',
                module: 'EQUIPMENT',
                entity_type: 'PUMP',
                entity_id: 'L4-BTG-003',
                target: 'Booster Pump Batang HO / Slot C',
                description: 'Pergantian unit pompa fisik cadangan ke Slot Operasi C',
                old_values: JSON.stringify({ asset_code: 'L4-BTG-001', slot: 'C', status: 'MAINTENANCE' }),
                new_values: JSON.stringify({ asset_code: 'L4-BTG-003', slot: 'C', status: 'ACTIVE' }),
                reason: 'Overhaul berkala unit fisik 001',
                status: 'SUCCESS',
                ip_address: '127.0.0.1',
                user_agent: 'RASTA Admin Workstation',
                created_at: '2026-09-18 16:20:00'
            },
            {
                user_id: admin.id,
                actor_type: 'USER',
                actor_name: admin.name,
                actor_role: admin.role,
                action: 'IMPORT_COMPLETED',
                module: 'IMPORT',
                entity_type: 'DATA_IMPORT',
                entity_id: 'IMP-20260918-01',
                target: 'RASTA_Training_1Year_Hourly_Final.csv',
                description: 'Import histori baseline telemetri 1 tahun stasiun booster pump',
                old_values: null,
                new_values: JSON.stringify({ total_rows: 35040, success_count: 35040, failed_count: 0, data_type: 'SYNTHETIC' }),
                reason: 'Model retraining & comparative baseline',
                status: 'SUCCESS',
                ip_address: '127.0.0.1',
                user_agent: 'RASTA Admin Workstation',
                created_at: '2026-09-18 14:30:00'
            },
            {
                user_id: ferry.id,
                actor_type: 'USER',
                actor_name: ferry.name,
                actor_role: ferry.role,
                action: 'MAINTENANCE_CREATED',
                module: 'MAINTENANCE',
                entity_type: 'MAINTENANCE_EVENT',
                entity_id: 'WO-202609-004',
                target: 'Pump B / Slot B',
                description: 'Pelumasan bearing motor dan inspeksi baut fleksibel kopling',
                old_values: null,
                new_values: JSON.stringify({ type: 'PREVENTIVE', target: 'Pump B', scheduled: '2026-09-19' }),
                reason: 'Jadwal rutin bulanan',
                status: 'SUCCESS',
                ip_address: '192.168.1.55',
                user_agent: 'Engineering Laptop',
                created_at: '2026-09-18 11:20:00'
            },
            {
                user_id: null,
                actor_type: 'SYSTEM',
                actor_name: 'RASTA ML Engine',
                actor_role: 'SYSTEM',
                action: 'ANOMALY_DETECTED',
                module: 'CONFIGURATION',
                entity_type: 'ML_PREDICTION',
                entity_id: 'PRED-C-003',
                target: 'Pump C / Leistritz L4',
                description: 'AI model mendeteksi anomali misalignment kopling dengan confidence 82%',
                old_values: JSON.stringify({ risk: 35, stage: 'NORMAL' }),
                new_values: JSON.stringify({ risk: 71, stage: 'WARNING', rul_hours: 46, cause: 'Coupling Misalignment' }),
                reason: 'Harmonic vibration shift exceeding 1.80 mm/s',
                status: 'WARNING',
                ip_address: '127.0.0.1',
                user_agent: 'Background Predictor Cron Daemon',
                created_at: '2026-09-17 03:00:00'
            },
            {
                user_id: null,
                actor_type: 'USER',
                actor_name: 'unknown_operator',
                actor_role: 'operator',
                action: 'LOGIN_FAILED',
                module: 'AUTH',
                entity_type: 'USER',
                entity_id: 'unknown',
                target: 'unknown_operator',
                description: 'Percobaan login gagal: kredensial tidak cocok',
                old_values: null,
                new_values: null,
                reason: 'Invalid credentials',
                status: 'FAILED',
                ip_address: '192.168.1.189',
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                created_at: '2026-09-17 08:02:11'
            }
        ];
        // Clear old audit logs if re-seeding
        await connection.query('DELETE FROM audit_logs WHERE id > 0;');
        for (const ev of auditEvents) {
            await connection.query(`
        INSERT INTO audit_logs (
          user_id, actor_type, actor_name, actor_role, action, module,
          entity_type, entity_id, target, description, old_values, new_values,
          reason, status, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
                ev.user_id,
                ev.actor_type,
                ev.actor_name,
                ev.actor_role,
                ev.action,
                ev.module,
                ev.entity_type,
                ev.entity_id,
                ev.target,
                ev.description,
                ev.old_values,
                ev.new_values,
                ev.reason,
                ev.status,
                ev.ip_address,
                ev.user_agent,
                ev.created_at
            ]);
        }
        console.log(`✅ Seeded ${auditEvents.length} realistic audit log records.`);
    }
    catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
    finally {
        await connection.end();
    }
}
seedUsersAndAudit().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
