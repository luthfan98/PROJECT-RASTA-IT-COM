import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { env } from './config/env.js';
import { testDbConnection } from './config/database.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';

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
      secret: env.JWT_SECRET,
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
      },
    });

    // 2. Static File Serving untuk folder uploads terpusat
    await fastify.register(fastifyStatic, {
      root: env.UPLOAD_DIR,
      prefix: '/uploads/',
      decorateReply: false,
    });

    // 3. Health Check
    fastify.get('/api/health', async () => {
      return {
        status: 'ok',
        service: 'RASTA IT COM Fastify API',
        environment: env.NODE_ENV,
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
    const port = env.PORT;
    const host = env.HOST;

    await fastify.listen({ port, host });
    console.log(`🚀 Fastify Server running at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`📁 Uploads serving from: ${env.UPLOAD_DIR} -> http://localhost:${port}/uploads/`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
