import { createId, createQrToken } from '../lib/ids'
import { nowIso } from '../lib/dates'
import { storesRepo, productsRepo, requestsRepo, usersRepo } from '../repositories'
import { requirePerm } from './authService'
import { logAction } from './auditService'
import { debitTokens } from './tokenService'
import { hasPermission } from '../data/permissions'

export function saveStore(actor, input, id) {
  requirePerm(actor, 'store.manage')
  const existing = id ? storesRepo.findById(id) : null
  const item = {
    id: existing?.id || createId('str'),
    name: input.name,
    description: input.description || '',
    category: input.category || 'ทั่วไป',
    assignedAdminId: input.assignedAdminId || null,
    isActive: input.isActive !== false,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  storesRepo.upsert(item)
  if (item.assignedAdminId) {
    const admin = usersRepo.findById(item.assignedAdminId)
    if (admin) usersRepo.upsert({ ...admin, role: 'store_admin', storeId: item.id, updatedAt: nowIso() })
  }
  logAction({ actor, action: existing ? 'store.update' : 'store.create', resourceType: 'store', resourceId: item.id })
  return item
}

export function saveProduct(actor, storeId, patch) {
  const store = storesRepo.findById(storeId)
  if (!store) throw new Error('ไม่พบร้านค้า')
  const isOwner = actor.role === 'store_admin' && actor.storeId === storeId
  if (!isOwner) requirePerm(actor, 'store.manage')
  const existing = productsRepo.byStore(storeId)[0]
  const item = {
    id: existing?.id || createId('prd'),
    storeId,
    name: patch.name || existing?.name || store.name,
    priceToken: Number(patch.priceToken),
    description: patch.description ?? existing?.description ?? '',
    isActive: patch.isActive ?? existing?.isActive ?? true,
    updatedAt: nowIso(),
  }
  if (!Number.isFinite(item.priceToken) || item.priceToken < 0) throw new Error('ราคา Token ไม่ถูกต้อง')
  productsRepo.upsert(item)
  logAction({ actor, action: 'store.price.update', resourceType: 'store_product', resourceId: item.id, after: item })
  return item
}

export function createPaymentRequest(actor, { storeId, productId, quantity }) {
  requirePerm(actor, 'store.payment.manage')
  if (actor.role === 'store_admin' && actor.storeId !== storeId) throw new Error('เข้าถึงร้านอื่นไม่ได้')
  const store = storesRepo.findById(storeId)
  if (!store?.isActive) throw new Error('ร้านค้าปิดใช้งาน')
  const product = productsRepo.findById(productId)
  if (!product?.isActive) throw new Error('สินค้าไม่พร้อมขาย')
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) throw new Error('จำนวนไม่ถูกต้อง')
  const amountToken = product.priceToken * qty
  const req = {
    id: createId('req'),
    storeId,
    productId,
    productName: product.name,
    quantity: qty,
    unitPrice: product.priceToken,
    amountToken,
    status: 'open',
    qrToken: createQrToken(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    paidBy: null,
    paidAt: null,
    createdBy: actor.id,
    createdAt: nowIso(),
  }
  requestsRepo.upsert(req)
  logAction({ actor, action: 'store.payment_request', resourceType: 'store_payment_request', resourceId: req.id, after: { amountToken } })
  return req
}

export function payStoreRequest(user, requestId) {
  const req = requestsRepo.findById(requestId)
  if (!req) throw new Error('ไม่พบคำขอชำระ')
  if (req.status === 'paid') throw new Error('รายการนี้ชำระแล้ว')
  if (req.status !== 'open') throw new Error('คำขอนี้ใช้ไม่ได้')
  if (new Date(req.expiresAt) < new Date()) {
    requestsRepo.upsert({ ...req, status: 'expired' })
    throw new Error('QR หมดอายุแล้ว')
  }
  const store = storesRepo.findById(req.storeId)
  if (!store?.isActive) throw new Error('ร้านค้าปิดใช้งาน')
  debitTokens({
    userId: user.id,
    amount: req.amountToken,
    referenceType: 'store_payment',
    referenceId: req.id,
    actor: user,
    note: `${req.productName} x${req.quantity} ที่${store.name}`,
    idempotencyKey: `spend:${req.id}`,
  })
  requestsRepo.upsert({ ...req, status: 'paid', paidBy: user.id, paidAt: nowIso() })
  return requestsRepo.findById(req.id)
}

export function assertStoreAccess(user, storeId) {
  if (hasPermission(user, 'store.manage')) return true
  if (user.role === 'store_admin' && user.storeId === storeId) return true
  throw new Error('เข้าถึงร้านนี้ไม่ได้')
}
