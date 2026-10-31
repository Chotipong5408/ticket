export const PERMS = {
  USER_READ: 'user.read',
  TICKET_READ: 'ticket.read',
  TICKET_MANAGE: 'ticket.manage',
  PAYMENT_VERIFY: 'payment.verify',
  MERCH_MANAGE: 'merchandise.manage',
  STORE_MANAGE: 'store.manage',
  STORE_PAYMENT: 'store.payment.manage',
  TOKEN_READ: 'token.read',
  TOKEN_TOPUP: 'token.topup',
  REPORT_READ: 'report.read',
  REPORT_EXPORT: 'report.export',
  CHECKIN_SCAN: 'checkin.scan',
  ADMIN_MANAGE: 'admin.manage',
  PERMISSION_MANAGE: 'permission.manage',
  AUDIT_READ: 'audit.read',
}

export const ROLE_LABELS = {
  user: 'ผู้ใช้',
  super_admin: 'Super Admin',
  token_admin: 'Event Admin',
  store_admin: 'Store Admin',
}

export const ROLE_PERMISSIONS = {
  user: [PERMS.TICKET_READ, PERMS.TOKEN_READ],
  super_admin: Object.values(PERMS),
  token_admin: [PERMS.USER_READ, PERMS.TOKEN_READ, PERMS.TOKEN_TOPUP, PERMS.REPORT_READ, PERMS.CHECKIN_SCAN],
  store_admin: [PERMS.STORE_PAYMENT, PERMS.TOKEN_READ, PERMS.REPORT_READ],
}

export function hasPermission(user, permission) {
  if (!user || user.isActive === false) return false
  const grants = new Set(user.permissionGrants || [])
  const revokes = new Set(user.permissionRevokes || [])
  if (user.role === 'super_admin') return !revokes.has(permission)
  const base = ROLE_PERMISSIONS[user.role] || []
  if (revokes.has(permission)) return false
  return base.includes(permission) || grants.has(permission)
}
