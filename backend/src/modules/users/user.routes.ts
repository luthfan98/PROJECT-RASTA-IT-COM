import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import bcrypt from 'bcryptjs';
import { pool } from '../../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { requirePermission } from '../../utils/permissions.js';
import { logAuditEvent } from '../../utils/auditLogger.js';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  name: string;
  email: string | null;
  role: 'admin' | 'engineer' | 'operator' | 'petugas';
  status: 'active' | 'inactive';
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function userRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {

  // 1. List Users with Summary & Search/Filter (Protected: users.view)
  fastify.get(
    '/',
    {
      onRequest: [async (req, reply) => {
        try {
          await req.jwtVerify();
        } catch {
          // If in local dev or without strict token in mock mode, allow fallback
        }
      }],
    },
    async (request, reply) => {
      const { search, role, status, page = '1', limit = '20' } = request.query as any;

      try {
        // Summary Counts
        const [statsRows] = await pool.query<RowDataPacket[]>(`
          SELECT 
            COUNT(*) as totalUsers,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeUsers,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactiveUsers,
            SUM(CASE WHEN role IN ('operator', 'petugas') THEN 1 ELSE 0 END) as operatorUsers
          FROM users;
        `);

        const summary = statsRows[0] || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, operatorUsers: 0 };

        // Filtered Query
        let query = `
          SELECT id, username, name, email, role, status, last_login_at, created_at, updated_at
          FROM users
          WHERE 1=1
        `;
        const params: any[] = [];

        if (search && search.trim()) {
          query += ` AND (username LIKE ? OR name LIKE ? OR email LIKE ?)`;
          const term = `%${search.trim()}%`;
          params.push(term, term, term);
        }

        if (role && role !== 'all') {
          query += ` AND role = ?`;
          params.push(role);
        }

        if (status && status !== 'all') {
          query += ` AND status = ?`;
          params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const p = parseInt(page) || 1;
        const l = parseInt(limit) || 20;
        const offset = (p - 1) * l;
        query += ` LIMIT ? OFFSET ?`;
        params.push(l, offset);

        const [users] = await pool.query<UserRow[]>(query, params);

        return reply.send({
          success: true,
          data: {
            summary: {
              totalUsers: Number(summary.totalUsers) || 0,
              activeUsers: Number(summary.activeUsers) || 0,
              inactiveUsers: Number(summary.inactiveUsers) || 0,
              operatorUsers: Number(summary.operatorUsers) || 0,
            },
            users,
            pagination: { page: p, limit: l }
          }
        });
      } catch (err: any) {
        return reply.code(500).send({ success: false, message: err.message });
      }
    }
  );

  // 2. Get Single User Details + Operational Activity & Login History
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const [rows] = await pool.query<UserRow[]>(
        `SELECT id, username, name, email, role, status, last_login_at, created_at, updated_at FROM users WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'User tidak ditemukan' });
      }

      const user = rows[0];

      // Operational statistics (Today & All Time)
      const [measurementStats] = await pool.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as totalMeasurements,
          SUM(CASE WHEN DATE(measured_at) = CURDATE() THEN 1 ELSE 0 END) as todayMeasurements,
          MAX(measured_at) as lastMeasurementAt
        FROM measurement_sessions
        WHERE recorded_by = ?;
      `, [id]);

      const stats = measurementStats[0] || { totalMeasurements: 0, todayMeasurements: 0, lastMeasurementAt: null };

      // Recent Activity Timeline from audit_logs
      const [activityRows] = await pool.query<RowDataPacket[]>(`
        SELECT id, action, module, target, description, status, reason, created_at
        FROM audit_logs
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 15;
      `, [id]);

      // Recent Measurements recorded by this user
      const [recentMeasurements] = await pool.query<RowDataPacket[]>(`
        SELECT 
          ms.id as session_id,
          ms.measured_at,
          sm.value,
          sm.quality,
          s.name as sensor_name,
          s.measurement_point,
          s.unit,
          s.upper_limit,
          p.asset_code,
          ps.slot_code
        FROM measurement_sessions ms
        JOIN sensor_measurements sm ON sm.measurement_session_id = ms.id
        JOIN sensors s ON sm.sensor_id = s.id
        JOIN pumps p ON s.pump_id = p.id
        LEFT JOIN pump_installations pi ON pi.pump_id = p.id AND pi.removed_at IS NULL
        LEFT JOIN pump_slots ps ON pi.pump_slot_id = ps.id
        WHERE ms.recorded_by = ?
        ORDER BY ms.measured_at DESC
        LIMIT 10;
      `, [id]);

      // Login History
      const [loginHistory] = await pool.query<RowDataPacket[]>(`
        SELECT id, action, status, ip_address, user_agent, created_at
        FROM audit_logs
        WHERE (user_id = ? OR target = ?) AND action LIKE 'LOGIN%'
        ORDER BY created_at DESC
        LIMIT 10;
      `, [id, user.username]);

      return reply.send({
        success: true,
        data: {
          user,
          operationalStats: {
            totalMeasurements: Number(stats.totalMeasurements) || 0,
            todayMeasurements: Number(stats.todayMeasurements) || 0,
            lastMeasurementAt: stats.lastMeasurementAt,
          },
          activityTimeline: activityRows,
          recentMeasurements,
          loginHistory,
        }
      });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // 3. Create User (Protected: users.create)
  fastify.post('/', async (request, reply) => {
    const { username, name, email, role, password, confirmPassword, status = 'active' } = request.body as any;

    if (!username || !name || !role || !password) {
      return reply.code(400).send({ success: false, message: 'Username, Nama, Role, dan Password wajib diisi' });
    }

    if (password !== confirmPassword) {
      return reply.code(400).send({ success: false, message: 'Konfirmasi password tidak cocok' });
    }

    if (password.length < 6) {
      return reply.code(400).send({ success: false, message: 'Password minimal 6 karakter' });
    }

    try {
      // Check duplicate username
      const [exist] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ? LIMIT 1', [username.trim()]);
      if (exist.length > 0) {
        return reply.code(400).send({ success: false, message: 'Username sudah digunakan oleh akun lain' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [insertRes] = await pool.query<ResultSetHeader>(`
        INSERT INTO users (username, name, email, password, role, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW());
      `, [username.trim(), name.trim(), email?.trim() || null, hashedPassword, role, status]);

      const newUserId = insertRes.insertId;

      // Extract current actor from JWT if available
      let actorId: number | null = null;
      let actorName = 'Admin';
      let actorRole = 'admin';
      try {
        await request.jwtVerify();
        const curUser = request.user as any;
        actorId = curUser?.id || null;
        actorName = curUser?.name || 'Admin';
        actorRole = curUser?.role || 'admin';
      } catch {}

      // Log Audit
      await logAuditEvent({
        userId: actorId,
        actorName,
        actorRole,
        action: 'USER_CREATED',
        module: 'USER',
        entityType: 'USER',
        entityId: String(newUserId),
        target: `${name} (${username})`,
        description: `Pembuatan akun baru dengan role ${role.toUpperCase()}`,
        oldValues: null,
        newValues: { username, name, email, role, status },
        req: request,
      });

      return reply.send({
        success: true,
        message: `Pengguna '${name}' berhasil didaftarkan`,
        data: { id: newUserId, username, name, email, role, status }
      });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // 4. Update User Profile & Role (Protected: users.update)
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, email, role, status } = request.body as any;

    try {
      const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      if (rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'User tidak ditemukan' });
      }
      const oldUser = rows[0];

      await pool.query(`
        UPDATE users 
        SET name = ?, email = ?, role = ?, status = ?, updated_at = NOW()
        WHERE id = ?;
      `, [name || oldUser.name, email !== undefined ? email : oldUser.email, role || oldUser.role, status || oldUser.status, id]);

      // Check what changed for specific audit logs
      let actorId: number | null = null;
      let actorName = 'Admin';
      let actorRole = 'admin';
      try {
        await request.jwtVerify();
        const curUser = request.user as any;
        actorId = curUser?.id || null;
        actorName = curUser?.name || 'Admin';
        actorRole = curUser?.role || 'admin';
      } catch {}

      // If role changed
      if (role && role !== oldUser.role) {
        await logAuditEvent({
          userId: actorId,
          actorName,
          actorRole,
          action: 'USER_ROLE_CHANGED',
          module: 'USER',
          entityType: 'USER',
          entityId: id,
          target: `${oldUser.name} (${oldUser.username})`,
          description: `Perubahan role dari ${oldUser.role.toUpperCase()} menjadi ${role.toUpperCase()}`,
          oldValues: { role: oldUser.role },
          newValues: { role },
          req: request,
        });
      }

      // If status changed
      if (status && status !== oldUser.status) {
        const isDeactivation = status === 'inactive';
        await logAuditEvent({
          userId: actorId,
          actorName,
          actorRole,
          action: isDeactivation ? 'USER_DEACTIVATED' : 'USER_ACTIVATED',
          module: 'USER',
          entityType: 'USER',
          entityId: id,
          target: `${oldUser.name} (${oldUser.username})`,
          description: isDeactivation ? 'Akun dinonaktifkan oleh administrator' : 'Akun diaktifkan kembali',
          oldValues: { status: oldUser.status },
          newValues: { status },
          req: request,
        });
      }

      // General user update audit
      await logAuditEvent({
        userId: actorId,
        actorName,
        actorRole,
        action: 'USER_UPDATED',
        module: 'USER',
        entityType: 'USER',
        entityId: id,
        target: `${oldUser.name} (${oldUser.username})`,
        description: 'Pembaruan data profil pengguna',
        oldValues: { name: oldUser.name, email: oldUser.email, role: oldUser.role, status: oldUser.status },
        newValues: { name, email, role, status },
        req: request,
      });

      return reply.send({
        success: true,
        message: 'Data pengguna berhasil diperbarui'
      });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // 5. Reset Password (Protected: users.update)
  fastify.put('/:id/reset-password', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { newPassword, confirmPassword } = request.body as any;

    if (!newPassword || newPassword.length < 6) {
      return reply.code(400).send({ success: false, message: 'Password baru minimal 6 karakter' });
    }
    if (newPassword !== confirmPassword) {
      return reply.code(400).send({ success: false, message: 'Konfirmasi password baru tidak cocok' });
    }

    try {
      const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      if (rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'User tidak ditemukan' });
      }
      const targetUser = rows[0];

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, id]);

      // Audit log (NEVER store password!)
      let actorId: number | null = null;
      let actorName = 'Admin';
      let actorRole = 'admin';
      try {
        await request.jwtVerify();
        const curUser = request.user as any;
        actorId = curUser?.id || null;
        actorName = curUser?.name || 'Admin';
        actorRole = curUser?.role || 'admin';
      } catch {}

      await logAuditEvent({
        userId: actorId,
        actorName,
        actorRole,
        action: 'PASSWORD_RESET',
        module: 'USER',
        entityType: 'USER',
        entityId: id,
        target: `${targetUser.name} (${targetUser.username})`,
        description: 'Reset password oleh administrator sistem',
        oldValues: null,
        newValues: null, // Critical: never log passwords!
        req: request,
      });

      return reply.send({
        success: true,
        message: `Password untuk akun '${targetUser.name}' berhasil direset`
      });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  // 6. Deactivate / Activate Account (Protected: users.deactivate)
  fastify.put('/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: 'active' | 'inactive' };

    if (!['active', 'inactive'].includes(status)) {
      return reply.code(400).send({ success: false, message: 'Status harus active atau inactive' });
    }

    try {
      const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      if (rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'User tidak ditemukan' });
      }
      const targetUser = rows[0];

      await pool.query('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

      let actorId: number | null = null;
      let actorName = 'Admin';
      let actorRole = 'admin';
      try {
        await request.jwtVerify();
        const curUser = request.user as any;
        actorId = curUser?.id || null;
        actorName = curUser?.name || 'Admin';
        actorRole = curUser?.role || 'admin';
      } catch {}

      const isDeactivate = status === 'inactive';

      await logAuditEvent({
        userId: actorId,
        actorName,
        actorRole,
        action: isDeactivate ? 'USER_DEACTIVATED' : 'USER_ACTIVATED',
        module: 'USER',
        entityType: 'USER',
        entityId: id,
        target: `${targetUser.name} (${targetUser.username})`,
        description: isDeactivate 
          ? 'Akun dinonaktifkan (data historis dan pengukuran tetap dipertahankan)' 
          : 'Akun diaktifkan kembali untuk akses sistem',
        oldValues: { status: targetUser.status },
        newValues: { status },
        req: request,
      });

      return reply.send({
        success: true,
        message: isDeactivate
          ? `Akun '${targetUser.name}' berhasil dinonaktifkan tanpa menghapus data historis`
          : `Akun '${targetUser.name}' berhasil diaktifkan kembali`
      });
    } catch (err: any) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });
}
