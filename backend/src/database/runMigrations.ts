import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Running database migration: 002_create_sensor_and_measurement_tables.sql ...');
  
  const migrationFile = path.resolve(__dirname, 'migrations', '002_create_sensor_and_measurement_tables.sql');
  const sql = fs.readFileSync(migrationFile, 'utf-8');

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true
  });

  try {
    await connection.query(sql);
    console.log(`✅ Successfully executed migration script.`);
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES;');
    console.log('📋 Existing tables in database:', tables);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
