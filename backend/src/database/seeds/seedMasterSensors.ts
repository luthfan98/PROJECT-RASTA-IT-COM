import { pool } from '../../config/database.js';

interface SensorDef {
  measurementPoint: string;
  nameSuffix: string;
  measurementType: 'VIBRATION' | 'TEMPERATURE' | 'PRESSURE' | 'OTHER';
  component: 'ELMOT' | 'PUMP' | 'OTHER';
  position: 'DE' | 'NDE' | 'OTHER';
  axis: 'H' | 'V' | 'A' | 'NONE';
  unit: string;
  upperLimit?: number;
}

const SENSOR_DEFINITIONS: SensorDef[] = [
  // Vibration Sensors (mm/s)
  { measurementPoint: 'ELMOT-DE-H', nameSuffix: 'Elmot DE Horizontal Vibration', measurementType: 'VIBRATION', component: 'ELMOT', position: 'DE', axis: 'H', unit: 'mm/s', upperLimit: 4.5 },
  { measurementPoint: 'ELMOT-DE-V', nameSuffix: 'Elmot DE Vertical Vibration', measurementType: 'VIBRATION', component: 'ELMOT', position: 'DE', axis: 'V', unit: 'mm/s', upperLimit: 4.5 },
  { measurementPoint: 'ELMOT-DE-A', nameSuffix: 'Elmot DE Axial Vibration', measurementType: 'VIBRATION', component: 'ELMOT', position: 'DE', axis: 'A', unit: 'mm/s', upperLimit: 4.5 },
  
  { measurementPoint: 'ELMOT-NDE-H', nameSuffix: 'Elmot NDE Horizontal Vibration', measurementType: 'VIBRATION', component: 'ELMOT', position: 'NDE', axis: 'H', unit: 'mm/s', upperLimit: 4.5 },
  { measurementPoint: 'ELMOT-NDE-V', nameSuffix: 'Elmot NDE Vertical Vibration', measurementType: 'VIBRATION', component: 'ELMOT', position: 'NDE', axis: 'V', unit: 'mm/s', upperLimit: 4.5 },
  { measurementPoint: 'ELMOT-NDE-A', nameSuffix: 'Elmot NDE Axial Vibration', measurementType: 'VIBRATION', component: 'ELMOT', position: 'NDE', axis: 'A', unit: 'mm/s', upperLimit: 4.5 },

  { measurementPoint: 'PUMP-DE-H', nameSuffix: 'Pump DE Horizontal Vibration', measurementType: 'VIBRATION', component: 'PUMP', position: 'DE', axis: 'H', unit: 'mm/s', upperLimit: 7.1 },
  { measurementPoint: 'PUMP-DE-V', nameSuffix: 'Pump DE Vertical Vibration', measurementType: 'VIBRATION', component: 'PUMP', position: 'DE', axis: 'V', unit: 'mm/s', upperLimit: 7.1 },
  { measurementPoint: 'PUMP-DE-A', nameSuffix: 'Pump DE Axial Vibration', measurementType: 'VIBRATION', component: 'PUMP', position: 'DE', axis: 'A', unit: 'mm/s', upperLimit: 7.1 },

  { measurementPoint: 'PUMP-NDE-H', nameSuffix: 'Pump NDE Horizontal Vibration', measurementType: 'VIBRATION', component: 'PUMP', position: 'NDE', axis: 'H', unit: 'mm/s', upperLimit: 7.1 },
  { measurementPoint: 'PUMP-NDE-V', nameSuffix: 'Pump NDE Vertical Vibration', measurementType: 'VIBRATION', component: 'PUMP', position: 'NDE', axis: 'V', unit: 'mm/s', upperLimit: 7.1 },
  { measurementPoint: 'PUMP-NDE-A', nameSuffix: 'Pump NDE Axial Vibration', measurementType: 'VIBRATION', component: 'PUMP', position: 'NDE', axis: 'A', unit: 'mm/s', upperLimit: 7.1 },

  // Temperature Sensors (°C)
  { measurementPoint: 'TEMP-ELMOT-DE', nameSuffix: 'Elmot DE Temperature', measurementType: 'TEMPERATURE', component: 'ELMOT', position: 'DE', axis: 'NONE', unit: 'CELSIUS', upperLimit: 85.0 },
  { measurementPoint: 'TEMP-ELMOT-NDE', nameSuffix: 'Elmot NDE Temperature', measurementType: 'TEMPERATURE', component: 'ELMOT', position: 'NDE', axis: 'NONE', unit: 'CELSIUS', upperLimit: 85.0 },
  { measurementPoint: 'TEMP-PUMP-DE', nameSuffix: 'Pump DE Temperature', measurementType: 'TEMPERATURE', component: 'PUMP', position: 'DE', axis: 'NONE', unit: 'CELSIUS', upperLimit: 90.0 },
  { measurementPoint: 'TEMP-PUMP-NDE', nameSuffix: 'Pump NDE Temperature', measurementType: 'TEMPERATURE', component: 'PUMP', position: 'NDE', axis: 'NONE', unit: 'CELSIUS', upperLimit: 90.0 },
];

export async function seedMasterSensors() {
  console.log('🌱 Starting Master Seeding: Station, Pump Slots, Physical Pumps, Installations, and Sensors...');
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Seed Station: BATANG
    await conn.query(`
      INSERT INTO stations (code, name, location, description, status)
      VALUES ('BATANG', 'Booster Pump Batang Station', 'Batang, Jawa Tengah', 'Stasiun Booster Pump Utama RASTA Batang', 'ACTIVE')
      ON DUPLICATE KEY UPDATE name = VALUES(name), location = VALUES(location);
    `);

    const [stationRows]: any = await conn.query(`SELECT id FROM stations WHERE code = 'BATANG' LIMIT 1;`);
    const stationId = stationRows[0].id;
    console.log(`✅ Station BATANG ensured (ID: ${stationId})`);

    // 2. Seed Pump Slots: A, B, C, D
    const slotCodes = ['A', 'B', 'C', 'D'];
    const slotMap = new Map<string, number>();

    for (const code of slotCodes) {
      await conn.query(`
        INSERT INTO pump_slots (station_id, slot_code, name, description, status)
        VALUES (?, ?, ?, ?, 'ACTIVE')
        ON DUPLICATE KEY UPDATE name = VALUES(name);
      `, [stationId, code, `Booster Pump Slot ${code}`, `Posisi operasi pompa slot ${code} di Batang Station`]);

      const [sRows]: any = await conn.query(`SELECT id FROM pump_slots WHERE station_id = ? AND slot_code = ? LIMIT 1;`, [stationId, code]);
      slotMap.set(code, sRows[0].id);
      console.log(`📍 Slot ${code} ensured (ID: ${sRows[0].id})`);
    }

    // 3. Seed Physical Pumps: PUMP-L4-BTG-001 s/d 004
    const pumpUnits = [
      { num: '001', slot: 'A', serial: 'SN-LZ-2023-0801' },
      { num: '002', slot: 'B', serial: 'SN-LZ-2023-0802' },
      { num: '003', slot: 'C', serial: 'SN-LZ-2023-0803' },
      { num: '004', slot: 'D', serial: 'SN-LZ-2023-0804' },
    ];
    const physicalPumpMap = new Map<string, number>(); // slotCode -> pumpId

    for (const unit of pumpUnits) {
      const assetCode = `PUMP-L4-BTG-${unit.num}`;
      const pumpName = `Leistritz L4 Unit #${unit.num}`;
      const qrCode = `QR-${assetCode}`;

      await conn.query(`
        INSERT INTO pumps (asset_code, serial_number, name, manufacturer, model, qr_code, status, installed_at)
        VALUES (?, ?, ?, 'Sulzer / Leistritz', 'Centrifugal L4 Multi-Stage', ?, 'ACTIVE', '2024-01-01')
        ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status);
      `, [assetCode, unit.serial, pumpName, qrCode]);

      const [pRows]: any = await conn.query(`SELECT id FROM pumps WHERE asset_code = ? LIMIT 1;`, [assetCode]);
      const pumpId = pRows[0].id;
      physicalPumpMap.set(unit.slot, pumpId);
      console.log(`⚙️ Physical Pump ${assetCode} ensured (ID: ${pumpId})`);

      // 4. Seed Installation (Slot <-> Physical Pump)
      const slotId = slotMap.get(unit.slot)!;
      const [existingInstall]: any = await conn.query(`
        SELECT id FROM pump_installations 
        WHERE pump_slot_id = ? AND pump_id = ? AND removed_at IS NULL LIMIT 1;
      `, [slotId, pumpId]);

      if (!existingInstall.length) {
        await conn.query(`
          INSERT INTO pump_installations (pump_slot_id, pump_id, installed_at, notes)
          VALUES (?, ?, '2024-01-01 00:00:00', 'Pemasangan awal unit pompa baru di Slot');
        `, [slotId, pumpId]);
        console.log(`🔗 Linked Slot ${unit.slot} <-> Pump ${assetCode} (Installation Active)`);
      }
    }

    // 5. Seed 16 Physical Sensors for each physical pump unit (Total 64 Sensors)
    let totalSensors = 0;
    for (const unit of pumpUnits) {
      const pumpId = physicalPumpMap.get(unit.slot)!;

      for (const def of SENSOR_DEFINITIONS) {
        const sensorCode = `SNS-BTG-${unit.num}-${def.measurementPoint}`;
        const sensorName = `Unit #${unit.num} ${def.nameSuffix}`;
        const qrCode = `QR-SNS-BTG-${unit.num}-${def.measurementPoint}`;

        await conn.query(`
          INSERT INTO sensors (
            pump_id, measurement_point, sensor_code, serial_number, name,
            measurement_type, component, position, axis, unit, upper_limit, qr_code, status, installed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', '2024-01-01 00:00:00')
          ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            measurement_point = VALUES(measurement_point),
            measurement_type = VALUES(measurement_type),
            component = VALUES(component),
            position = VALUES(position),
            axis = VALUES(axis),
            unit = VALUES(unit),
            upper_limit = VALUES(upper_limit),
            qr_code = VALUES(qr_code),
            status = VALUES(status);
        `, [
          pumpId, def.measurementPoint, sensorCode, `SN-SNS-${unit.num}-${def.measurementPoint}`,
          sensorName, def.measurementType, def.component, def.position, def.axis, def.unit,
          def.upperLimit || null, qrCode
        ]);
        totalSensors++;
      }
    }

    await conn.commit();
    console.log(`🎉 Master Seeding Selesai: 1 Station, 4 Slots, 4 Physical Pumps, 4 Installations, ${totalSensors} Sensors.`);
    return { stationId, slotMap, physicalPumpMap, totalSensors };
  } catch (error) {
    await conn.rollback();
    console.error('❌ Failed seeding master sensors:', error);
    throw error;
  } finally {
    conn.release();
  }
}

// Allow direct execution
if (process.argv[1]?.includes('seedMasterSensors')) {
  seedMasterSensors()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
