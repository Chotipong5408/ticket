import { createId, createQrToken } from '../lib/ids'
import { nowIso } from '../lib/dates'
import { idbPut, idbGet } from '../lib/indexeddb'
import {
  ordersRepo,
  paymentsRepo,
  slipsRepo,
  reviewsRepo,
  ticketsRepo,
  merchOrdersRepo,
  emailRepo,
  settingsRepo,
  idempotencyRepo,
} from '../repositories'
import { requirePerm } from './authService'
import { logAction } from './auditService'
import { creditTokens } from './tokenService'
import { usersRepo } from '../repositories'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 3 * 1024 * 1024

export function validateSlipFile(file) {
  if (!file) throw new Error('กรุณาเลือกไฟล์สลิป')
  if (!ALLOWED_TYPES.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
    throw new Error('รองรับเฉพาะ JPG, JPEG, PNG และ WebP')
  }
  if (file.size > MAX_SIZE) throw new Error('ไฟล์ใหญ่เกิน 3 MB')
}

export async function submitSlip(user, paymentId, file, confirmed) {
  if (!confirmed) throw new Error('กรุณายืนยันว่าได้ชำระเงินแล้ว')
  validateSlipFile(file)
  const payment = paymentsRepo.findById(paymentId)
  if (!payment) throw new Error('ไม่พบรายการชำระเงิน')
  const order = ordersRepo.findById(payment.orderId)
  if (order.buyerId !== user.id && user.role !== 'super_admin') throw new Error('ไม่มีสิทธิ์ส่งสลิปของรายการนี้')
  if (['approved', 'cancelled'].includes(payment.status)) throw new Error('ไม่สามารถส่งสลิปในสถานะนี้ได้')
  const storageKey = `slip_${paymentId}_${createId('file')}`
  const buffer = await file.arrayBuffer()
  await idbPut(storageKey, { mimeType: file.type, name: file.name, blob: new Blob([buffer], { type: file.type }) })
  const slip = slipsRepo.upsert({
    id: createId('slp'),
    paymentId,
    orderId: order.id,
    fileName: file.name,
    mimeType: file.type,
    storageKey,
    submittedBy: user.id,
    submittedAt: nowIso(),
    status: 'pending',
    rejectionReason: null,
    demoPlaceholder: false,
  })
  const now = nowIso()
  paymentsRepo.upsert({ ...payment, status: 'pending_verification', updatedAt: now })
  ordersRepo.upsert({ ...order, status: 'pending_verification', updatedAt: now })
  logAction({ actor: user, action: 'payment.slip_submit', resourceType: 'payment', resourceId: paymentId, after: { slipId: slip.id } })
  return slip
}

export async function getSlipBlobUrl(storageKey) {
  const rec = await idbGet(storageKey)
  if (!rec) return null
  const blob = rec.blob || rec
  return URL.createObjectURL(blob)
}

export async function approvePayment(actor, paymentId, note) {
  requirePerm(actor, 'payment.verify')
  const idem = `approve:${paymentId}`
  if (idempotencyRepo.has(idem)) throw new Error('รายการนี้ได้รับการอนุมัติแล้ว')
  const payment = paymentsRepo.findById(paymentId)
  if (!payment) throw new Error('ไม่พบรายการชำระเงิน')
  if (payment.status === 'approved') throw new Error('อนุมัติไปแล้ว')
  if (payment.status === 'cancelled') throw new Error('รายการถูกยกเลิกแล้ว')
  const order = ordersRepo.findById(payment.orderId)
  const now = nowIso()
  paymentsRepo.upsert({ ...payment, status: 'approved', verifiedBy: actor.id, verifiedAt: now, rejectionReason: null, updatedAt: now })
  ordersRepo.upsert({ ...order, status: 'approved', updatedAt: now })
  reviewsRepo.add({ id: createId('rev'), paymentId, adminId: actor.id, action: 'approve', reason: note || 'ตรวจสอบยอดเงินและอนุมัติด้วยตนเอง', createdAt: now })
  idempotencyRepo.add(idem)

  const tickets = ticketsRepo.byOrder(order.id)
  const issued = tickets.map((t) => {
    if (t.status === 'issued' || t.status === 'used') return t
    return {
      ...t,
      qrToken: t.qrToken || createQrToken(),
      status: 'issued',
      issuedAt: now,
    }
  })
  ticketsRepo.upsertMany(issued)
  logAction({ actor, action: 'payment.approve', resourceType: 'payment', resourceId: paymentId, before: { status: payment.status }, after: { status: 'approved' } })
  logAction({ actor, action: 'ticket.issue', resourceType: 'order', resourceId: order.id, after: { tickets: issued.map((t) => t.id) } })

  const bonusKey = `bonus:${order.id}`
  if (order.expectedBonusToken > 0 && !idempotencyRepo.has(bonusKey)) {
    creditTokens({
      userId: order.buyerId,
      amount: order.expectedBonusToken,
      type: 'bonus',
      referenceType: 'order',
      referenceId: order.id,
      actor,
      note: 'Token โบนัสจากการซื้อบัตรหลังอนุมัติชำระเงิน',
      idempotencyKey: bonusKey,
    })
  }

  const merch = merchOrdersRepo.byOrder(order.id)
  if (merch) merchOrdersRepo.upsert({ ...merch, status: 'confirmed' })

  const buyer = usersRepo.findById(order.buyerId)
  const settings = settingsRepo.get()
  const ticketLines = issued.filter((t) => t.status === 'issued' || t.status === 'used')
  emailRepo.add({
    id: createId('eml'),
    to: buyer.email,
    subject: `ยืนยันการซื้อบัตรงานเลี้ยงรุ่น — คำสั่งซื้อ ${order.id}`,
    orderId: order.id,
    ticketIds: ticketLines.map((t) => t.id),
    status: 'preview_only',
    createdAt: now,
    body: [
      `เรียน ${buyer.fullName}`,
      '',
      `คำสั่งซื้อ ${order.id} ได้รับการอนุมัติแล้ว`,
      `ประเภทและจำนวนบัตร: ${order.ticketQuantity} ใบ`,
      `กรุณาเก็บ QR Ticket เป็นความลับ และแสดงเมื่อเข้างาน`,
      `หากซื้อให้เพื่อน ให้ส่งต่อภาพ QR ด้วยตนเอง`,
      `เว็บไซต์งาน: ${settings.siteUrl}`,
      '',
      'อีเมลนี้เป็นเพียงตัวอย่างในระบบ Demo ยังไม่ได้ส่งออกจริงผ่าน Gmail',
    ].join('\n'),
  })
  return { payment: paymentsRepo.findById(paymentId), order: ordersRepo.findById(order.id), tickets: issued }
}

export function rejectPayment(actor, paymentId, reason) {
  requirePerm(actor, 'payment.verify')
  if (!reason || reason.trim().length < 4) throw new Error('ต้องระบุเหตุผลการปฏิเสธ')
  const payment = paymentsRepo.findById(paymentId)
  if (!payment) throw new Error('ไม่พบรายการ')
  if (payment.status === 'approved') throw new Error('รายการที่อนุมัติแล้วไม่สามารถปฏิเสธได้')
  const order = ordersRepo.findById(payment.orderId)
  const now = nowIso()
  paymentsRepo.upsert({ ...payment, status: 'rejected', verifiedBy: actor.id, verifiedAt: now, rejectionReason: reason.trim(), updatedAt: now })
  ordersRepo.upsert({ ...order, status: 'rejected', updatedAt: now })
  slipsRepo.byPayment(paymentId).forEach((s) => {
    if (s.status === 'pending') slipsRepo.upsert({ ...s, status: 'rejected', rejectionReason: reason.trim() })
  })
  reviewsRepo.add({ id: createId('rev'), paymentId, adminId: actor.id, action: 'reject', reason: reason.trim(), createdAt: now })
  logAction({ actor, action: 'payment.reject', resourceType: 'payment', resourceId: paymentId, after: { reason } })
  return true
}

export function makePlaceholderSlipDataUrl(label, amount) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640">
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <rect x="24" y="24" width="432" height="592" rx="16" fill="#fff" stroke="#cbd5e1"/>
    <text x="240" y="80" text-anchor="middle" font-size="22" fill="#1e3a8a" font-family="sans-serif">สลิปตัวอย่าง Demo</text>
    <text x="240" y="130" text-anchor="middle" font-size="16" fill="#334155" font-family="sans-serif">${label}</text>
    <text x="240" y="180" text-anchor="middle" font-size="28" fill="#0f172a" font-family="sans-serif">${amount} บาท</text>
    <text x="240" y="240" text-anchor="middle" font-size="14" fill="#64748b" font-family="sans-serif">ไม่ใช่หลักฐานการเงินจริง</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
