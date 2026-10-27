import { createId } from '../lib/ids'
import { nowIso } from '../lib/dates'
import { ticketsRepo, checkinsRepo, paymentsRepo, settingsRepo } from '../repositories'
import { requirePerm } from './authService'
import { logAction } from './auditService'
import { decodeQr } from '../lib/qr'

export function inspectTicket(rawOrId) {
  let ticket = ticketsRepo.findById(rawOrId)
  const decoded = decodeQr(rawOrId)
  if (!ticket && decoded?.type === 'ticket') ticket = ticketsRepo.findByQr(decoded.token)
  if (!ticket) ticket = ticketsRepo.findByQr(rawOrId)
  if (!ticket) return { result: 'invalid', message: 'ไม่พบบัตรนี้', ticket: null }
  if (ticket.status === 'cancelled' || ticket.status === 'disabled') {
    return { result: 'disabled', message: 'บัตรถูกปิดใช้งาน', ticket }
  }
  if (ticket.status === 'unconfirmed' || !ticket.qrToken) {
    return { result: 'unconfirmed', message: 'บัตรยังไม่ได้รับการยืนยันการชำระเงิน', ticket }
  }
  const payment = paymentsRepo.findByOrder(ticket.orderId)
  if (payment?.status !== 'approved') {
    return { result: 'unconfirmed', message: 'การชำระเงินยังไม่อนุมัติ', ticket }
  }
  if (ticket.status === 'used' || ticket.checkedInAt) {
    return { result: 'already_used', message: `บัตรถูกใช้แล้วเมื่อ ${ticket.checkedInAt}`, ticket }
  }
  return { result: 'valid', message: 'บัตรถูกต้อง พร้อมเข้างาน', ticket }
}

export function scanTicket(actor, rawOrId, { forceReentry = false } = {}) {
  requirePerm(actor, 'checkin.scan')
  const inspected = inspectTicket(rawOrId)
  const { result, ticket } = inspected
  if (result === 'invalid') {
    checkinsRepo.add({ id: createId('chk'), ticketId: rawOrId, scannedBy: actor.id, result: 'invalid', scannedAt: nowIso(), note: inspected.message })
    logAction({ actor, action: 'checkin.scan', resourceType: 'ticket', resourceId: rawOrId, result: 'invalid' })
    return inspected
  }
  if (result === 'already_used') {
    const settings = settingsRepo.get()
    if (forceReentry && actor.role === 'super_admin' && settings.reentryPolicy === 'allow_admin') {
      ticketsRepo.upsert({ ...ticket, status: 'issued', checkedInAt: null, checkedInBy: null })
      logAction({ actor, action: 'checkin.reentry_reset', resourceType: 'ticket', resourceId: ticket.id })
      return scanTicket(actor, ticket.id)
    }
    checkinsRepo.add({ id: createId('chk'), ticketId: ticket.id, scannedBy: actor.id, result: 'already_used', scannedAt: nowIso(), note: inspected.message })
    logAction({ actor, action: 'checkin.duplicate', resourceType: 'ticket', resourceId: ticket.id, result: 'already_used' })
    return inspected
  }
  if (result !== 'valid') {
    checkinsRepo.add({ id: createId('chk'), ticketId: ticket.id, scannedBy: actor.id, result, scannedAt: nowIso(), note: inspected.message })
    logAction({ actor, action: 'checkin.scan', resourceType: 'ticket', resourceId: ticket.id, result })
    return inspected
  }
  const now = nowIso()
  ticketsRepo.upsert({ ...ticket, status: 'used', checkedInAt: now, checkedInBy: actor.id })
  checkinsRepo.add({ id: createId('chk'), ticketId: ticket.id, scannedBy: actor.id, result: 'valid', scannedAt: now, note: 'เข้างานครั้งแรก' })
  logAction({ actor, action: 'checkin.scan', resourceType: 'ticket', resourceId: ticket.id, before: { status: ticket.status }, after: { status: 'used' }, result: 'valid' })
  return { ...inspected, ticket: ticketsRepo.findById(ticket.id) }
}
