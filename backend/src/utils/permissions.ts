import { FastifyRequest, FastifyReply } from 'fastify';

export type UserRole = 'admin' | 'engineer' | 'operator' | 'petugas';

export type AppPermission =
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.deactivate'
  | 'measurements.view'
  | 'measurements.create'
  | 'measurements.update'
  | 'imports.view'
  | 'imports.create'
  | 'equipment.view'
  | 'equipment.manage'
  | 'sensors.view'
  | 'sensors.manage'
  | 'maintenance.view'
  | 'maintenance.manage'
  | 'failures.view'
  | 'failures.manage'
  | 'predictions.view'
  | 'audit.view'
  | 'settings.manage';

export const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  admin: [
    'users.view',
    'users.create',
    'users.update',
    'users.deactivate',
    'measurements.view',
    'measurements.create',
    'measurements.update',
    'imports.view',
    'imports.create',
    'equipment.view',
    'equipment.manage',
    'sensors.view',
    'sensors.manage',
    'maintenance.view',
    'maintenance.manage',
    'failures.view',
    'failures.manage',
    'predictions.view',
    'audit.view',
    'settings.manage',
  ],
  engineer: [
    'measurements.view',
    'measurements.update',
    'imports.view',
    'equipment.view',
    'equipment.manage',
    'sensors.view',
    'sensors.manage',
    'maintenance.view',
    'maintenance.manage',
    'failures.view',
    'failures.manage',
    'predictions.view',
    'audit.view',
  ],
  operator: [
    'measurements.view',
    'measurements.create',
    'equipment.view',
    'sensors.view',
    'predictions.view',
  ],
  petugas: [
    'measurements.view',
    'measurements.create',
    'equipment.view',
    'sensors.view',
    'predictions.view',
  ]
};

export function hasPermission(role: UserRole | string, permission: AppPermission): boolean {
  const normRole = (role?.toLowerCase() || 'operator') as UserRole;
  const permissions = ROLE_PERMISSIONS[normRole] || [];
  return permissions.includes(permission);
}

/**
 * Fastify Middleware to enforce RBAC permissions
 */
export function requirePermission(permission: AppPermission) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({
        success: false,
        message: 'Akses ditolak: Token autentikasi tidak valid atau kadaluarsa',
      });
    }

    const user = request.user as { id: number; username: string; role: string };
    if (!user || !hasPermission(user.role, permission)) {
      return reply.code(403).send({
        success: false,
        message: `Akses ditolak: Role '${user?.role}' tidak memiliki izin '${permission}'`,
      });
    }
  };
}
