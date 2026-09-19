import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cari file .env di root project
const rootDir = process.cwd().endsWith('backend') 
  ? path.resolve(process.cwd(), '..') 
  : process.cwd();

const rootEnvPath = path.resolve(rootDir, '.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config(); // fallback
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  HOST: process.env.HOST || '0.0.0.0',

  // Database
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'rasta_it_db',

  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_rasta_it_com_2026',

  // Paths & Uploads
  ROOT_DIR: rootDir,
  UPLOAD_DIR: path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads'),
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 50,
};
