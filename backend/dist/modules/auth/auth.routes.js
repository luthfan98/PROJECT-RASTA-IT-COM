import bcrypt from 'bcryptjs';
import { pool } from '../../config/database.js';
import { logAuditEvent } from '../../utils/auditLogger.js';
export async function authRoutes(fastify, _opts) {
    // Login Endpoint
    fastify.post('/login', async (request, reply) => {
        const { username, password, role } = request.body;
        if (!username || !password) {
            return reply.code(400).send({
                success: false,
                message: 'Username dan password wajib diisi',
            });
        }
        try {
            let query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
            const [rows] = await pool.query(query, [username]);
            if (rows.length === 0) {
                await logAuditEvent({
                    userId: null,
                    actorType: 'USER',
                    actorName: username,
                    actorRole: role || 'unknown',
                    action: 'LOGIN_FAILED',
                    module: 'AUTH',
                    entityType: 'USER',
                    entityId: 'unknown',
                    target: username,
                    description: 'Percobaan login gagal: Username tidak ditemukan',
                    reason: 'User not found',
                    status: 'FAILED',
                    req: request,
                });
                return reply.code(401).send({
                    success: false,
                    message: 'Username atau password salah',
                });
            }
            const user = rows[0];
            // Verifikasi role jika disertakan (normalizing petugas = operator)
            if (role) {
                const reqRole = role.toLowerCase();
                const userRole = user.role.toLowerCase();
                const isOperatorEquiv = (reqRole === 'operator' || reqRole === 'petugas') && (userRole === 'operator' || userRole === 'petugas');
                if (reqRole !== userRole && !isOperatorEquiv) {
                    await logAuditEvent({
                        userId: user.id,
                        actorType: 'USER',
                        actorName: user.name,
                        actorRole: user.role,
                        action: 'LOGIN_FAILED',
                        module: 'AUTH',
                        entityType: 'USER',
                        entityId: String(user.id),
                        target: user.username,
                        description: `Percobaan login ditolak: Role akun (${user.role.toUpperCase()}) tidak sesuai portal ${role.toUpperCase()}`,
                        reason: 'Role mismatch',
                        status: 'FAILED',
                        req: request,
                    });
                    return reply.code(403).send({
                        success: false,
                        message: `Akun ini tidak memiliki akses sebagai ${role.toUpperCase()}`,
                    });
                }
            }
            if (user.status !== 'active') {
                await logAuditEvent({
                    userId: user.id,
                    actorType: 'USER',
                    actorName: user.name,
                    actorRole: user.role,
                    action: 'LOGIN_FAILED',
                    module: 'AUTH',
                    entityType: 'USER',
                    entityId: String(user.id),
                    target: user.username,
                    description: 'Percobaan login ditolak: Akun dalam status NONAKTIF',
                    reason: 'Account inactive',
                    status: 'FAILED',
                    req: request,
                });
                return reply.code(403).send({
                    success: false,
                    message: 'Akun Anda sedang nonaktif. Hubungi administrator sistem.',
                });
            }
            // Validasi password murni menggunakan bcrypt terhadap hash terenkripsi di database MySQL
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                await logAuditEvent({
                    userId: user.id,
                    actorType: 'USER',
                    actorName: user.name,
                    actorRole: user.role,
                    action: 'LOGIN_FAILED',
                    module: 'AUTH',
                    entityType: 'USER',
                    entityId: String(user.id),
                    target: user.username,
                    description: 'Percobaan login gagal: Password salah',
                    reason: 'Invalid password',
                    status: 'FAILED',
                    req: request,
                });
                return reply.code(401).send({
                    success: false,
                    message: 'Username atau password salah',
                });
            }
            // Update last_login_at
            await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?;', [user.id]);
            // Log LOGIN_SUCCESS
            await logAuditEvent({
                userId: user.id,
                actorType: 'USER',
                actorName: user.name,
                actorRole: user.role,
                action: 'LOGIN_SUCCESS',
                module: 'AUTH',
                entityType: 'USER',
                entityId: String(user.id),
                target: `${user.name} (${user.username})`,
                description: `Autentikasi sesi berhasil untuk role ${user.role.toUpperCase()}`,
                status: 'SUCCESS',
                req: request,
            });
            // Generate JWT Token
            const token = fastify.jwt.sign({
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
            });
            return reply.send({
                success: true,
                message: 'Login berhasil',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    last_login_at: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Terjadi kesalahan pada server saat login',
                error: error.message,
            });
        }
    });
    // Logout Endpoint
    fastify.post('/logout', async (request, reply) => {
        try {
            await request.jwtVerify();
            const user = request.user;
            if (user) {
                await logAuditEvent({
                    userId: user.id,
                    actorType: 'USER',
                    actorName: user.name || user.username,
                    actorRole: user.role,
                    action: 'LOGOUT',
                    module: 'AUTH',
                    entityType: 'USER',
                    entityId: String(user.id),
                    target: user.username,
                    description: 'Pengguna mengakhiri sesi kerja (logout)',
                    status: 'SUCCESS',
                    req: request,
                });
            }
        }
        catch { }
        return reply.send({ success: true, message: 'Logout berhasil' });
    });
    // Get current authenticated user
    fastify.get('/me', {
        onRequest: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                }
                catch (err) {
                    reply.send(err);
                }
            }],
    }, async (request, reply) => {
        const decoded = request.user;
        const [rows] = await pool.query('SELECT id, username, name, email, role, status, last_login_at FROM users WHERE id = ?', [decoded.id]);
        if (rows.length === 0) {
            return reply.code(404).send({ success: false, message: 'User tidak ditemukan' });
        }
        return reply.send({
            success: true,
            user: rows[0],
        });
    });
}
