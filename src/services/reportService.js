import {
  usersRepo,
  ticketsRepo,
  ordersRepo,
  paymentsRepo,
  merchOrdersRepo,
  tokensRepo,
  storesRepo,
  requestsRepo,
  checkinsRepo,
  auditRepo,
} from '../repositories'
import { hasPermission } from '../data/permissions'
import { logAction } from './auditService'
import { toCsv } from '../lib/csv'
import { inDateRange } from '../lib/dates'

export function dashboardStats() {
  const users = usersRepo.all().filter((u) => u.role === 'user')
  const tickets = ticketsRepo.all()
  const payments = paymentsRepo.all()
  const orders = ordersRepo.all()
  const approved = payments.filter((p) => p.status === 'approved')
  const approvedOrders = orders.filter((o) => o.status === 'approved')
  const ticketRevenue = approvedOrders.reduce((s, o) => s + (o.subtotalTickets || 0), 0)
  const merchRevenue = approvedOrders.reduce((s, o) => s + (o.subtotalMerchandise || 0) + (o.shippingFee || 0), 0)
  const txs = tokensRepo.all()
  const bonus = txs.filter((t) => t.type === 'bonus').reduce((s, t) => s + t.amount, 0)
  const topup = txs.filter((t) => t.type === 'topup').reduce((s, t) => s + t.amount, 0)
  const spent = txs.filter((t) => t.type === 'spend').reduce((s, t) => s + Math.abs(t.amount), 0)
  const storeSales = requestsRepo.all().filter((r) => r.status === 'paid').reduce((s, r) => s + r.amountToken, 0)
  return {
    registeredUsers: users.length,
    ticketsSold: tickets.filter((t) => t.status !== 'cancelled').length,
    ticketsApproved: tickets.filter((t) => t.status === 'issued' || t.status === 'used').length,
    pendingVerification: payments.filter((p) => p.status === 'pending_verification').length,
    rejected: payments.filter((p) => p.status === 'rejected').length,
    ticketRevenue,
    merchRevenue,
    bankRevenue: ticketRevenue + merchRevenue,
    bonus,
    topup,
    spent,
    stores: storesRepo.all().length,
    storeSales,
    checkedIn: tickets.filter((t) => t.status === 'used').length,
    unused: tickets.filter((t) => t.status === 'issued').length,
  }
}

export function searchUsers({ q = '', year }) {
  const query = q.trim().toLowerCase()
  let list = usersRepo.all()
  if (year) list = list.filter((u) => String(u.enrollmentYearBE) === String(year))
  if (!query) return list
  const tickets = ticketsRepo.all()
  const orders = ordersRepo.all()
  return list.filter((u) => {
    if (u.fullName.toLowerCase().includes(query)) return true
    if (u.email.toLowerCase().includes(query)) return true
    if (u.phone.includes(query)) return true
    if (tickets.some((t) => t.buyerId === u.id && (t.id.toLowerCase().includes(query) || (t.qrToken || '').includes(query)))) return true
    if (orders.some((o) => o.buyerId === u.id && o.id.toLowerCase().includes(query))) return true
    return false
  })
}

export function exportMerchandiseCsv(actor) {
  if (!hasPermission(actor, 'report.export')) throw new Error('ไม่มีสิทธิ์ส่งออกข้อมูล')
  const rows = merchOrdersRepo.all().map((m) => {
    const order = ordersRepo.findById(m.orderId)
    const user = usersRepo.findById(m.userId)
    const payment = paymentsRepo.findByOrder(m.orderId)
    return m.items.map((item) => ({
      'Order ID': m.orderId,
      ชื่อผู้ซื้อ: user?.fullName || '',
      อีเมล: user?.email || '',
      ขนาด: item.size,
      จำนวน: item.quantity,
      ราคาต่อชิ้น: item.unitPrice,
      ยอดรวม: item.unitPrice * item.quantity,
      วิธีรับสินค้า: m.shippingMethod === 'delivery' ? 'จัดส่ง' : 'รับภายในงาน',
      ชื่อผู้รับ: m.recipientName,
      เบอร์โทรศัพท์: m.phone,
      ที่อยู่: [m.address, m.province, m.postalCode].filter(Boolean).join(' '),
      วันที่สั่งซื้อ: m.createdAt,
      สถานะการชำระเงิน: payment?.status || order?.status,
      สถานะการจัดส่ง: m.fulfillmentStatus,
    }))
  }).flat()
  toCsv(rows, 'merchandise-orders.csv')
  logAction({ actor, action: 'export.csv', resourceType: 'merchandise_order', resourceId: 'all' })
}

export function exportGenericCsv(actor, filename, rows, resourceType) {
  if (!hasPermission(actor, 'report.export')) throw new Error('ไม่มีสิทธิ์ส่งออกข้อมูล')
  toCsv(rows, filename)
  logAction({ actor, action: 'export.csv', resourceType, resourceId: filename })
}

export function filterByDate(list, field, from, to) {
  return list.filter((x) => inDateRange(x[field], from, to))
}

export function storeReport(storeId) {
  const reqs = requestsRepo.byStore(storeId)
  const paid = reqs.filter((r) => r.status === 'paid')
  return {
    requests: reqs.length,
    paid: paid.length,
    tokens: paid.reduce((s, r) => s + r.amountToken, 0),
    items: paid,
  }
}

export function auditList() {
  return auditRepo.all()
}

export function checkinList() {
  return checkinsRepo.all()
}
