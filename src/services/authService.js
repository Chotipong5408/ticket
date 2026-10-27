import { z } from 'zod'
import { createId } from '../lib/ids'
import { nowIso } from '../lib/dates'
import { usersRepo, sessionRepo } from '../repositories'
import { hasPermission } from '../data/permissions'
import { logAction } from './auditService'

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'กรุณากรอกชื่อ-นามสกุล'),
  enrollmentYearBE: z.coerce.number().min(2400, 'กรุณากรอก พ.ศ. ที่เข้าเรียน').max(2600),
  faculty: z.string().trim().min(2, 'กรุณากรอกคณะ'),
  major: z.string().trim().min(2, 'กรุณากรอกสาขา'),
  email: z.string().trim().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().trim().regex(/^0\d{8,9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'),
})

export function getSessionUser() {
  const session = sessionRepo.get()
  if (!session?.userId) return null
  return usersRepo.findById(session.userId)
}

export function login(email, password) {
  const user = usersRepo.findByEmail(email)
  if (!user || user.password !== password) {
    throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  }
  if (!user.isActive) throw new Error('บัญชีถูกปิดใช้งาน')
  sessionRepo.save({ userId: user.id, role: user.role, createdAt: nowIso() })
  logAction({ actor: user, action: 'auth.login', resourceType: 'session', resourceId: user.id })
  return user
}

export function logout() {
  const user = getSessionUser()
  sessionRepo.clear()
  if (user) logAction({ actor: user, action: 'auth.logout', resourceType: 'session', resourceId: user.id })
}

export function register(input) {
  const data = registerSchema.parse(input)
  if (usersRepo.findByEmail(data.email)) {
    throw new Error('อีเมลนี้ลงทะเบียนแล้ว')
  }
  const user = {
    id: createId('usr'),
    ...data,
    role: 'user',
    storeId: null,
    isActive: true,
    tokenBalance: 0,
    permissionGrants: [],
    permissionRevokes: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  usersRepo.upsert(user)
  sessionRepo.save({ userId: user.id, role: user.role, createdAt: nowIso() })
  logAction({ actor: user, action: 'register', resourceType: 'user', resourceId: user.id, after: { email: user.email } })
  return user
}

export function updateProfile(userId, patch) {
  const user = usersRepo.findById(userId)
  if (!user) throw new Error('ไม่พบผู้ใช้')
  const next = {
    ...user,
    fullName: patch.fullName ?? user.fullName,
    phone: patch.phone ?? user.phone,
    faculty: patch.faculty ?? user.faculty,
    major: patch.major ?? user.major,
    enrollmentYearBE: patch.enrollmentYearBE ?? user.enrollmentYearBE,
    updatedAt: nowIso(),
  }
  usersRepo.upsert(next)
  return next
}

export function requirePerm(user, perm) {
  if (!hasPermission(user, perm)) {
    throw new Error('คุณไม่มีสิทธิ์ทำรายการนี้')
  }
}

export function setUserRole(actor, userId, role, storeId = null) {
  requirePerm(actor, 'admin.manage')
  const user = usersRepo.findById(userId)
  if (!user) throw new Error('ไม่พบผู้ใช้')
  const next = { ...user, role, storeId: role === 'store_admin' ? storeId : null, updatedAt: nowIso() }
  usersRepo.upsert(next)
  logAction({ actor, action: 'admin.assign_role', resourceType: 'user', resourceId: userId, before: { role: user.role }, after: { role, storeId } })
  return next
}

export function setUserPermissions(actor, userId, grants, revokes) {
  requirePerm(actor, 'permission.manage')
  const user = usersRepo.findById(userId)
  if (!user) throw new Error('ไม่พบผู้ใช้')
  const next = { ...user, permissionGrants: grants, permissionRevokes: revokes, updatedAt: nowIso() }
  usersRepo.upsert(next)
  logAction({ actor, action: 'permission.assign', resourceType: 'user', resourceId: userId, before: { grants: user.permissionGrants, revokes: user.permissionRevokes }, after: { grants, revokes } })
  return next
}

export function setUserActive(actor, userId, isActive) {
  requirePerm(actor, 'admin.manage')
  const user = usersRepo.findById(userId)
  const next = { ...user, isActive, updatedAt: nowIso() }
  usersRepo.upsert(next)
  logAction({ actor, action: isActive ? 'user.enable' : 'user.disable', resourceType: 'user', resourceId: userId })
  return next
}
