import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FailureTracker {
  failureCode: string;
  pumpId: number;
  failureMode: string;
  degradationStartedAt: string | null;
  warningStartedAt: string | null;
  criticalStartedAt: string | null;
  failureAt: string | null;
  resolvedAt: string | null;
}

const SENSOR_COLUMNS = [
  { index: 11, point: 'ELMOT-DE-H' },
  { index: 12, point: 'ELMOT-DE-V' },
  { index: 13, point: 'ELMOT-DE-A' },
  { index: 14, point: 'ELMOT-NDE-H' },
  { index: 15, point: 'ELMOT-NDE-V' },
  { index: 16, point: 'ELMOT-NDE-A' },
  { index: 17, point: 'PUMP-DE-H' },
  { index: 18, point: 'PUMP-DE-V' },
  { index: 19, point: 'PUMP-DE-A' },
  { index: 20, point: 'PUMP-NDE-H' },
  { index: 21, point: 'PUMP-NDE-V' },
  { index: 22, point: 'PUMP-NDE-A' },
  { index: 24, point: 'TEMP-ELMOT-DE' },
  { index: 25, point: 'TEMP-ELMOT-NDE' },
  { index: 26, point: 'TEMP-PUMP-DE' },
  { index: 27, point: 'TEMP-PUMP-NDE' }
];

export async function importSensorCsv() {
  const startTime = Date.now();
  console.log('🚀 Starting ETL Import for RASTA_Training_1Year_Hourly_Final.csv (Refined Slot & Physical Asset Schema)...');

  const csvPath = path.resolve(__dirname, '../../../RASTA_Training_1Year_Hourly_Final.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  try {
    // 1. Get Station BATANG
    const [stations]: any = await conn.query("SELECT id FROM stations WHERE code = 'BATANG' LIMIT 1;");
    if (!stations.length) {
      throw new Error("Station 'BATANG' not found! Please run seed script first.");
    }
    const stationId = stations[0].id;

    // 2. Map Active Installations per Slot
    // slot_code -> { slotId, pumpId }
    const [installations]: any = await conn.query(`
      SELECT ps.slot_code, ps.id AS slot_id, p.id AS pump_id, p.asset_code
      FROM pump_installations pi
      JOIN pump_slots ps ON pi.pump_slot_id = ps.id
      JOIN pumps p ON pi.pump_id = p.id
      WHERE ps.station_id = ? AND pi.removed_at IS NULL;
    `, [stationId]);

    const slotMap = new Map<string, { slotId: number; pumpId: number; assetCode: string }>();
    for (const inst of installations) {
      slotMap.set(inst.slot_code, {
        slotId: inst.slot_id,
        pumpId: inst.pump_id,
        assetCode: inst.asset_code
      });
    }
    console.log(`📍 Station ID: ${stationId}, Active Installed Pumps per Slot:`, Array.from(slotMap.entries()));

    // 3. Map Active Sensors: key = `${pumpId}_${measurementPoint}` -> sensor_id
    const [sensors]: any = await conn.query("SELECT id, pump_id, measurement_point FROM sensors WHERE status = 'ACTIVE';");
    const sensorMap = new Map<string, number>();
    for (const s of sensors) {
      sensorMap.set(`${s.pump_id}_${s.measurement_point}`, s.id);
    }
    console.log(`📡 Total Active Sensors in DB: ${sensorMap.size}`);

    // 4. Create record in data_imports
    const [adminUser]: any = await conn.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1;");
    const adminId = adminUser.length ? adminUser[0].id : null;

    const [importResult]: any = await conn.query(`
      INSERT INTO data_imports (
        file_name, stored_file, import_type, data_type, status, total_rows, success_rows, imported_by, started_at
      ) VALUES (?, ?, 'CSV', 'SYNTHETIC', 'PROCESSING', 35040, 0, ?, NOW());
    `, ['RASTA_Training_1Year_Hourly_Final.csv', 'RASTA_Training_1Year_Hourly_Final.csv', adminId]);
    
    const importId = importResult.insertId;
    console.log(`📋 Data Import Audit created (Import ID: ${importId})`);

    // Prepare batch buffers
    let stationMeasurementsBatch: any[] = [];
    let pumpLogsBatch: any[] = [];
    let sensorMeasurementsBatch: any[] = [];

    const failureTrackers = new Map<string, FailureTracker>();

    const rl = readline.createInterface({
      input: fs.createReadStream(csvPath),
      crlfDelay: Infinity
    });

    let lineIndex = 0;
    let processedSessions = 0;
    let currentTimestamp = '';
    let currentSessionId = 0;

    // Flush helpers
    const flushStationMeasurements = async () => {
      if (stationMeasurementsBatch.length === 0) return;
      const placeholders = stationMeasurementsBatch.map(() => '(?, ?, ?, ?, ?)').join(',');
      const values: any[] = [];
      for (const row of stationMeasurementsBatch) {
        values.push(row.sessionId, row.stationId, row.pressure, row.flow, row.flowUnit);
      }
      await conn.query(
        `INSERT INTO station_measurements (measurement_session_id, station_id, pressure_psi, flow_value, flow_unit) VALUES ${placeholders}`,
        values
      );
      stationMeasurementsBatch = [];
    };

    const flushPumpLogs = async () => {
      if (pumpLogsBatch.length === 0) return;
      const placeholders = pumpLogsBatch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
      const values: any[] = [];
      for (const row of pumpLogsBatch) {
        values.push(
          row.sessionId, row.slotId, row.pumpId, row.seq, row.status, row.state, row.load, row.runningHours, row.startCount
        );
      }
      await conn.query(
        `INSERT INTO pump_operating_logs (
          measurement_session_id, pump_slot_id, pump_id, sequence_position, pump_status, operating_state, load_pct, running_hours_total, start_count_total
        ) VALUES ${placeholders}`,
        values
      );
      pumpLogsBatch = [];
    };

    const flushSensorMeasurements = async () => {
      if (sensorMeasurementsBatch.length === 0) return;
      const placeholders = sensorMeasurementsBatch.map(() => '(?, ?, ?, ?)').join(',');
      const values: any[] = [];
      for (const row of sensorMeasurementsBatch) {
        values.push(row.sessionId, row.sensorId, row.val, 'GOOD');
      }
      await conn.query(
        `INSERT INTO sensor_measurements (measurement_session_id, sensor_id, value, quality) VALUES ${placeholders}`,
        values
      );
      sensorMeasurementsBatch = [];
    };

    await conn.beginTransaction();

    for await (const line of rl) {
      lineIndex++;
      if (lineIndex === 1) continue; // Skip header

      const cols = line.split(',');
      const timestamp = cols[0];
      const slotCode = cols[2];
      const seq = parseInt(cols[3], 10) || null;
      const pumpStatus = cols[4];
      const opState = cols[5];
      const pressure = parseFloat(cols[6]) || null;
      const flowPct = parseFloat(cols[7]) || null;
      const loadPct = parseFloat(cols[8]) || null;
      const runningHours = parseFloat(cols[9]) || null;
      const startCount = parseInt(cols[10], 10) || null;
      const failureMode = cols[30];
      const eventId = cols[31];

      const slotInfo = slotMap.get(slotCode);
      if (!slotInfo) {
        throw new Error(`Unknown slot code: ${slotCode} at line ${lineIndex}`);
      }

      // If new timestamp, create a new measurement_session
      if (timestamp !== currentTimestamp) {
        currentTimestamp = timestamp;
        
        const [sessResult]: any = await conn.query(`
          INSERT INTO measurement_sessions (
            station_id, measured_at, source_type, data_type, import_id, recorded_by, notes
          ) VALUES (?, ?, 'IMPORT', 'SYNTHETIC', ?, ?, 'Hourly training data 1 year');
        `, [stationId, timestamp, importId, adminId]);

        currentSessionId = sessResult.insertId;
        processedSessions++;

        // Add station measurement for this session
        stationMeasurementsBatch.push({
          sessionId: currentSessionId,
          stationId: stationId,
          pressure: pressure,
          flow: flowPct,
          flowUnit: 'PERCENT'
        });

        if (stationMeasurementsBatch.length >= 1000) {
          await flushStationMeasurements();
        }

        if (processedSessions % 1000 === 0) {
          const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`⏱️ Ingested ${processedSessions} sessions / ${(lineIndex - 1)} rows (${elapsedSec}s elapsed)...`);
        }
      }

      // Add pump operating log (linking both slotId and physical pumpId)
      pumpLogsBatch.push({
        sessionId: currentSessionId,
        slotId: slotInfo.slotId,
        pumpId: slotInfo.pumpId,
        seq: seq,
        status: pumpStatus,
        state: opState,
        load: loadPct,
        runningHours: runningHours,
        startCount: startCount
      });

      if (pumpLogsBatch.length >= 2000) {
        await flushPumpLogs();
      }

      // Add 16 sensor readings for this physical pump
      for (const sc of SENSOR_COLUMNS) {
        const sensorKey = `${slotInfo.pumpId}_${sc.point}`;
        const sensorId = sensorMap.get(sensorKey);
        if (sensorId) {
          const rawVal = cols[sc.index];
          const val = rawVal !== undefined && rawVal !== '' ? parseFloat(rawVal) : null;
          sensorMeasurementsBatch.push({
            sessionId: currentSessionId,
            sensorId: sensorId,
            val: val
          });
        }
      }

      if (sensorMeasurementsBatch.length >= 3200) {
        await flushSensorMeasurements();
      }

      // Track continuous failure events (EVT-*) on the physical pump unit
      if (eventId && eventId.startsWith('EVT-')) {
        if (!failureTrackers.has(eventId)) {
          failureTrackers.set(eventId, {
            failureCode: eventId,
            pumpId: slotInfo.pumpId,
            failureMode: failureMode,
            degradationStartedAt: opState === 'DEGRADING' ? timestamp : null,
            warningStartedAt: opState === 'WARNING' ? timestamp : null,
            criticalStartedAt: opState === 'CRITICAL' ? timestamp : null,
            failureAt: opState === 'FAILURE' ? timestamp : null,
            resolvedAt: timestamp
          });
        } else {
          const tracker = failureTrackers.get(eventId)!;
          tracker.resolvedAt = timestamp;
          if (opState === 'DEGRADING' && !tracker.degradationStartedAt) tracker.degradationStartedAt = timestamp;
          if (opState === 'WARNING' && !tracker.warningStartedAt) tracker.warningStartedAt = timestamp;
          if (opState === 'CRITICAL' && !tracker.criticalStartedAt) tracker.criticalStartedAt = timestamp;
          if (opState === 'FAILURE' && !tracker.failureAt) tracker.failureAt = timestamp;
        }
      }
    }

    // Final flushes
    await flushStationMeasurements();
    await flushPumpLogs();
    await flushSensorMeasurements();

    // Insert failure events linked to physical pumps
    console.log(`⚡ Inserting ${failureTrackers.size} distinct failure events for physical pumps...`);
    for (const [evtId, tracker] of failureTrackers) {
      await conn.query(`
        INSERT INTO failure_events (
          pump_id, failure_code, failure_mode, severity,
          degradation_started_at, warning_started_at, critical_started_at, failure_at, resolved_at,
          source_type, data_type, description, created_by
        ) VALUES (?, ?, ?, 'CRITICAL', ?, ?, ?, ?, ?, 'IMPORT', 'SYNTHETIC', ?, ?);
      `, [
        tracker.pumpId,
        tracker.failureCode,
        tracker.failureMode,
        tracker.degradationStartedAt,
        tracker.warningStartedAt,
        tracker.criticalStartedAt,
        tracker.failureAt,
        tracker.resolvedAt,
        `Event kegagalan teridentifikasi dari dataset training pada unit fisik: ${tracker.failureMode}`,
        adminId
      ]);
    }

    // Update data_imports
    await conn.query(`
      UPDATE data_imports
      SET status = 'COMPLETED',
          success_rows = ?,
          failed_rows = 0,
          completed_at = NOW()
      WHERE id = ?;
    `, [lineIndex - 1, importId]);

    await conn.commit();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n=============================================================`);
    console.log(`🎉 IMPORT FINISHED SUCCESSFULLY in ${duration}s!`);
    console.log(`   - Data Import ID     : ${importId}`);
    console.log(`   - Total CSV Rows     : ${lineIndex - 1}`);
    console.log(`   - Sessions Created   : ${processedSessions}`);
    console.log(`   - Failure Events     : ${failureTrackers.size}`);
    console.log(`=============================================================\n`);

  } catch (error) {
    await conn.rollback();
    console.error('❌ Ingestion failed, rolled back transaction:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

// Direct runner
if (process.argv[1]?.includes('importSensorCsv')) {
  importSensorCsv()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
