import { pool } from '../../config/database.js';
export async function auditRoutes(fastify, _opts) {
    // 1. List Audit Logs with Filters & Pagination (Append-Only Reader)
    fastify.get('/', async (request, reply) => {
        const { search, userId, role, module: auditModule, action, status, startDate, endDate, page = '1', limit = '25' } = request.query;
        try {
            let query = `
        SELECT 
          id, user_id, actor_type, actor_name, actor_role, action, module,
          entity_type, entity_id, target, description, old_values, new_values,
          reason, status, ip_address, user_agent, created_at
        FROM audit_logs
        WHERE 1=1
      `;
            const params = [];
            if (search && search.trim()) {
                query += ` AND (
          actor_name LIKE ? OR 
          target LIKE ? OR 
          entity_id LIKE ? OR 
          description LIKE ? OR 
          action LIKE ?
        )`;
                const term = `%${search.trim()}%`;
                params.push(term, term, term, term, term);
            }
            if (userId && userId !== 'all') {
                query += ` AND user_id = ?`;
                params.push(userId);
            }
            if (role && role !== 'all') {
                query += ` AND actor_role = ?`;
                params.push(role);
            }
            if (auditModule && auditModule !== 'all') {
                query += ` AND module = ?`;
                params.push(auditModule);
            }
            if (action && action !== 'all') {
                query += ` AND action = ?`;
                params.push(action);
            }
            if (status && status !== 'all') {
                query += ` AND status = ?`;
                params.push(status);
            }
            if (startDate) {
                query += ` AND created_at >= ?`;
                params.push(`${startDate} 00:00:00`);
            }
            if (endDate) {
                query += ` AND created_at <= ?`;
                params.push(`${endDate} 23:59:59`);
            }
            // Count query for pagination
            const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_records;`;
            const [countRows] = await pool.query(countQuery, params);
            const total = countRows[0]?.total || 0;
            query += ` ORDER BY created_at DESC`;
            const p = Math.max(1, parseInt(page) || 1);
            const l = Math.max(1, Math.min(100, parseInt(limit) || 25));
            const offset = (p - 1) * l;
            query += ` LIMIT ? OFFSET ?`;
            params.push(l, offset);
            const [logs] = await pool.query(query, params);
            // Parse JSON diff fields if needed
            const formatted = logs.map((log) => {
                let oldParsed = log.old_values;
                let newParsed = log.new_values;
                if (typeof oldParsed === 'string') {
                    try {
                        oldParsed = JSON.parse(oldParsed);
                    }
                    catch { }
                }
                if (typeof newParsed === 'string') {
                    try {
                        newParsed = JSON.parse(newParsed);
                    }
                    catch { }
                }
                return {
                    ...log,
                    old_values: oldParsed,
                    new_values: newParsed,
                };
            });
            return reply.send({
                success: true,
                data: {
                    logs: formatted,
                    pagination: {
                        total,
                        page: p,
                        limit: l,
                        totalPages: Math.ceil(total / l)
                    }
                }
            });
        }
        catch (err) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    });
    // 2. Get Single Detailed Audit Entry
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const [rows] = await pool.query(`
        SELECT 
          id, user_id, actor_type, actor_name, actor_role, action, module,
          entity_type, entity_id, target, description, old_values, new_values,
          reason, status, ip_address, user_agent, created_at
        FROM audit_logs
        WHERE id = ?
        LIMIT 1;
      `, [id]);
            if (rows.length === 0) {
                return reply.code(404).send({ success: false, message: 'Audit record tidak ditemukan' });
            }
            const log = rows[0];
            let oldParsed = log.old_values;
            let newParsed = log.new_values;
            if (typeof oldParsed === 'string') {
                try {
                    oldParsed = JSON.parse(oldParsed);
                }
                catch { }
            }
            if (typeof newParsed === 'string') {
                try {
                    newParsed = JSON.parse(newParsed);
                }
                catch { }
            }
            return reply.send({
                success: true,
                data: {
                    ...log,
                    old_values: oldParsed,
                    new_values: newParsed,
                }
            });
        }
        catch (err) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    });
}
