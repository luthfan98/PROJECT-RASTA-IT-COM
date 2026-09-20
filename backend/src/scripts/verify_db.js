import mysql from 'mysql2/promise';

async function verify() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'rasta_it_db' });

  const tables = [
    'stations', 'pump_slots', 'pumps', 'pump_installations', 'sensors', 'data_imports', 
    'measurement_sessions', 'station_measurements', 
    'pump_operating_logs', 'sensor_measurements', 'failure_events'
  ];

  console.log('--- TABEL ROW COUNTS ---');
  for (const t of tables) {
    const [res] = await conn.query(`SELECT COUNT(*) as cnt FROM ${t};`);
    console.log(`${t.padEnd(25)} : ${res[0].cnt.toLocaleString()} rows`);
  }

  console.log('\n--- SLOTS & PHYSICAL PUMPS INSTALLED ---');
  const [installs] = await conn.query(`
    SELECT 
      ps.slot_code,
      ps.name AS slot_name,
      p.asset_code,
      p.serial_number,
      p.name AS pump_name,
      p.status AS pump_status,
      pi.installed_at,
      pi.removed_at
    FROM pump_installations pi
    JOIN pump_slots ps ON pi.pump_slot_id = ps.id
    JOIN pumps p ON pi.pump_id = p.id;
  `);
  console.table(installs);

  console.log('\n--- SAMPLE SESSION WITH SLOT & PHYSICAL PUMP LOGS ---');
  const [sessionSample] = await conn.query(`
    SELECT 
      ms.id as session_id,
      ms.measured_at,
      ms.source_type,
      ms.data_type,
      st.name as station_name,
      sm.pressure_psi,
      sm.flow_value,
      sm.flow_unit
    FROM measurement_sessions ms
    JOIN stations st ON ms.station_id = st.id
    JOIN station_measurements sm ON sm.measurement_session_id = ms.id
    LIMIT 1;
  `);
  console.log('Session info:', sessionSample[0]);

  const [pumpLogsSample] = await conn.query(`
    SELECT 
      ps.slot_code,
      p.asset_code,
      pol.sequence_position,
      pol.pump_status,
      pol.operating_state,
      pol.load_pct,
      pol.running_hours_total
    FROM pump_operating_logs pol
    JOIN pump_slots ps ON pol.pump_slot_id = ps.id
    JOIN pumps p ON pol.pump_id = p.id
    WHERE pol.measurement_session_id = ?
    ORDER BY ps.slot_code;
  `, [sessionSample[0].session_id]);
  console.log('Pump logs for session:', pumpLogsSample);

  const [sensorSample] = await conn.query(`
    SELECT 
      s.measurement_point,
      s.sensor_code,
      s.qr_code,
      p.asset_code,
      sm.value,
      s.unit
    FROM sensor_measurements sm
    JOIN sensors s ON sm.sensor_id = s.id
    JOIN pumps p ON s.pump_id = p.id
    WHERE sm.measurement_session_id = ?
    LIMIT 6;
  `, [sessionSample[0].session_id]);
  console.log('Sample sensor readings in session:', sensorSample);

  await conn.end();
}

verify().catch(console.error);
