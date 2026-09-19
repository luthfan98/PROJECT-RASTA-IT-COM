import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import dotenv from 'dotenv';
import { testDbConnection } from './config/database.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const fastify = Fastify({
  logger: true,
});

async function main() {
  try {
    // 1. Inisialisasi Plugins Inti
    await fastify.register(cors, {
      origin: true,
      credentials: true,
    });

    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'super_secret_jwt_key_rasta_it_com_2026',
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: 50 * 1024 * 1024, // Maksimal 50MB per file
      },
    });

    // 2. Static File Serving untuk folder uploads
    const uploadsPath = path.resolve(process.cwd(), process.env.UPLOAD_DIR || '../uploads');
    await fastify.register(fastifyStatic, {
      root: uploadsPath,
      prefix: '/uploads/',
      decorateReply: false,
    });

    // 3. Health Check
    fastify.get('/api/health', async () => {
      return {
        status: 'ok',
        service: 'RASTA IT COM Fastify API',
        timestamp: new Date().toISOString(),
      };
    });

    // 4. Registrasi Modul API
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(uploadRoutes, { prefix: '/api/upload' });
    await fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });

    // 5. Test MySQL Connection
    await testDbConnection();

    // 6. Listen Server
    const port = Number(process.env.PORT) || 5000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 Fastify Server running at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`📁 Uploads serving from: ${uploadsPath} -> http://localhost:${port}/uploads/`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
