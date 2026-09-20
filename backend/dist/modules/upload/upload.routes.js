import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { pool } from '../../config/database.js';
import { env } from '../../config/env.js';
import { prepareStoragePath } from '../../utils/fileStorage.js';
export async function uploadRoutes(fastify, _opts) {
    const baseUploadDir = env.UPLOAD_DIR;
    // POST /api/upload - Menerima upload file tunggal atau jamak
    fastify.post('/single', async (request, reply) => {
        try {
            const data = await request.file();
            if (!data) {
                return reply.code(400).send({
                    success: false,
                    message: 'Tidak ada file yang dikirimkan',
                });
            }
            // Ambil user dari token jika ada
            let userId = null;
            let userRole = null;
            try {
                const decoded = await request.jwtVerify();
                userId = decoded.id;
                userRole = decoded.role;
            }
            catch {
                // Biarkan opsional jika public / guest
            }
            const { targetDir, storedName, mediaType, relativePath } = await prepareStoragePath(baseUploadDir, data.filename, data.mimetype);
            const targetFilePath = path.join(targetDir, storedName);
            // Simpan file ke disk fisik
            await pipeline(data.file, fs.createWriteStream(targetFilePath));
            const stats = await fs.promises.stat(targetFilePath);
            const fileUrl = `/uploads/${relativePath}`;
            // Simpan riwayat ke database MySQL
            const [insertResult] = await pool.query(`INSERT INTO media_uploads 
        (original_name, stored_name, media_type, mime_type, file_size, relative_path, file_url, uploaded_by, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                data.filename,
                storedName,
                mediaType,
                data.mimetype,
                stats.size,
                relativePath,
                fileUrl,
                userId,
                userRole,
            ]);
            return reply.send({
                success: true,
                message: 'File berhasil diunggah dan disimpan terenkripsi',
                data: {
                    id: insertResult.insertId,
                    originalName: data.filename,
                    storedName,
                    mediaType,
                    mimeType: data.mimetype,
                    fileSize: stats.size,
                    relativePath,
                    fileUrl,
                },
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Gagal memproses unggahan file',
                error: error.message,
            });
        }
    });
    // GET /api/upload/list - Mendapatkan riwayat daftar file
    fastify.get('/list', async (request, reply) => {
        try {
            const { mediaType, limit = '50', page = '1' } = request.query;
            const limitNum = parseInt(limit, 10) || 50;
            const pageNum = parseInt(page, 10) || 1;
            const offset = (pageNum - 1) * limitNum;
            let sql = `
        SELECT m.*, u.name as uploader_name, u.username as uploader_username 
        FROM media_uploads m
        LEFT JOIN users u ON m.uploaded_by = u.id
      `;
            const params = [];
            if (mediaType && mediaType !== 'all') {
                sql += ` WHERE m.media_type = ?`;
                params.push(mediaType);
            }
            sql += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
            params.push(limitNum, offset);
            const [rows] = await pool.query(sql, params);
            // Hitung total
            let countSql = `SELECT COUNT(*) as total FROM media_uploads`;
            const countParams = [];
            if (mediaType && mediaType !== 'all') {
                countSql += ` WHERE media_type = ?`;
                countParams.push(mediaType);
            }
            const [countRows] = await pool.query(countSql, countParams);
            return reply.send({
                success: true,
                data: rows,
                pagination: {
                    total: countRows[0]?.total || 0,
                    page: pageNum,
                    limit: limitNum,
                },
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Gagal mengambil riwayat upload',
                error: error.message,
            });
        }
    });
    // DELETE /api/upload/:id - Menghapus file fisik dan record database
    fastify.delete('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const [rows] = await pool.query('SELECT * FROM media_uploads WHERE id = ?', [id]);
            if (rows.length === 0) {
                return reply.code(404).send({ success: false, message: 'Data file tidak ditemukan' });
            }
            const fileRecord = rows[0];
            const physicalPath = path.resolve(baseUploadDir, fileRecord.relative_path);
            // Hapus fisik file jika ada
            if (fs.existsSync(physicalPath)) {
                await fs.promises.unlink(physicalPath);
            }
            // Hapus record database
            await pool.query('DELETE FROM media_uploads WHERE id = ?', [id]);
            return reply.send({
                success: true,
                message: 'File berhasil dihapus dari sistem',
            });
        }
        catch (error) {
            return reply.code(500).send({
                success: false,
                message: 'Gagal menghapus file',
                error: error.message,
            });
        }
    });
}
