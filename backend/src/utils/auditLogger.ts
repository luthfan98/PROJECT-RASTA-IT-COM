import { pool } from '../config/database.js';
import { FastifyRequest } from 'fastify';

export type AuditModule = 
  | 'AUTH' 
  | 'MEASUREMENT' 
  | 'IMPORT' 
  | 'USER' 
  | 'SENSOR' 
  | 'EQUIPMENT' 
  | 'MAINTENANCE' 
  | 'FAILURE' 
  | 'ANOMALY'
  | 'CONFIGURATION';

export type AuditStatus = 'SUCCESS' | 'FAILED' | 'WARNING';

export interface AuditLogPayload {
  userId?: number | null;
  actorType?: 'USER' | 'SYSTEM';
  actorName?: string | null;
  actorRole?: string | null;
  action: string;
  module: AuditModule;
  entityType?: string | null;
  entityId?: string | null;
  target?: string | null;
  description?: string | null;
  oldValues?: any | null;
  newValues?: any | null;
  reason?: string | null;
  status?: AuditStatus;
  req?: FastifyRequest;
}

/**
 * Remove any passwords, secrets, tokens, or sensitive credentials from values
 */
function sanitizeAuditData(data: any): any {
  if (!data) return null;
  if (typeof data !== 'object') return data;

  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = ['password', 'confirmPassword', 'token', 'accessToken', 'refreshToken', 'secret', 'hash'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeAuditData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Append-Only Audit Logger for RASTA IT COM
 */
export async function logAuditEvent(payload: AuditLogPayload): Promise<void> {
  try {
    const actorType = payload.actorType || (payload.userId ? 'USER' : 'SYSTEM');
    const status = payload.status || 'SUCCESS';
    
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (payload.req) {
      ipAddress = (payload.req.headers['x-forwarded-for'] as string) || payload.req.ip || null;
      userAgent = (payload.req.headers['user-agent'] as string) || null;
    }

    const sanitizedOld = payload.oldValues ? JSON.stringify(sanitizeAuditData(payload.oldValues)) : null;
    const sanitizedNew = payload.newValues ? JSON.stringify(sanitizeAuditData(payload.newValues)) : null;

    await pool.query(`
      INSERT INTO audit_logs (
        user_id, actor_type, actor_name, actor_role, action, module,
        entity_type, entity_id, target, description, old_values, new_values,
        reason, status, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
    `, [
      payload.userId || null,
      actorType,
      payload.actorName || null,
      payload.actorRole || null,
      payload.action,
      payload.module,
      payload.entityType || null,
      payload.entityId || null,
      payload.target || null,
      payload.description || null,
      sanitizedOld,
      sanitizedNew,
      payload.reason || null,
      status,
      ipAddress,
      userAgent
    ]);
  } catch (err: any) {
    // Audit log should never crash the main application request, but must be logged
    console.error('⚠️ Failed to write audit log event:', err.message);
  }
}
