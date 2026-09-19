import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { pool } from '../../config/database.js';
import { RowDataPacket } from 'mysql2';

export async function dashboardRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.get('/stats', async (_request, reply) => {
    try {
      // Total files and size
      const [storageStats] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total_files, COALESCE(SUM(file_size), 0) as total_bytes FROM media_uploads`
      );

      // Breakdown by media type
      const [typeBreakdown] = await pool.query<RowDataPacket[]>(
        `SELECT media_type, COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_size 
         FROM media_uploads GROUP BY media_type`
      );

      // Total users
      const [userStats] = await pool.query<RowDataPacket[]>(
        `SELECT role, COUNT(*) as count FROM users GROUP BY role`
      );

      // Recent uploads
      const [recentUploads] = await pool.query<RowDataPacket[]>(
        `SELECT m.id, m.original_name, m.stored_name, m.media_type, m.file_size, m.created_at, m.file_url,
                u.name as uploader_name, u.role as uploader_role
         FROM media_uploads m
         LEFT JOIN users u ON m.uploaded_by = u.id
         ORDER BY m.created_at DESC LIMIT 6`
      );

      return reply.send({
        success: true,
        stats: {
          totalFiles: storageStats[0]?.total_files || 0,
          totalBytes: storageStats[0]?.total_bytes || 0,
          typeBreakdown,
          userStats,
          recentUploads,
        },
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Gagal memuat statistik dashboard',
        error: error.message,
      });
    }
  });
}
