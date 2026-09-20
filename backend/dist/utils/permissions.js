export const ROLE_PERMISSIONS = {
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
export function hasPermission(role, permission) {
    const normRole = (role?.toLowerCase() || 'operator');
    const permissions = ROLE_PERMISSIONS[normRole] || [];
    return permissions.includes(permission);
}
/**
 * Fastify Middleware to enforce RBAC permissions
 */
export function requirePermission(permission) {
    return async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            return reply.code(401).send({
                success: false,
                message: 'Akses ditolak: Token autentikasi tidak valid atau kadaluarsa',
            });
        }
        const user = request.user;
        if (!user || !hasPermission(user.role, permission)) {
            return reply.code(403).send({
                success: false,
                message: `Akses ditolak: Role '${user?.role}' tidak memiliki izin '${permission}'`,
            });
        }
    };
}
