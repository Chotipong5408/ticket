import { z } from 'zod'
import { createId } from '../lib/ids'
import { nowIso } from '../lib/dates'
import {
  cartsRepo,
  ticketTypesRepo,
  merchRepo,
  ordersRepo,
  paymentsRepo,
  ticketsRepo,
  merchOrdersRepo,
  settingsRepo,
} from '../repositories'
import { logAction } from './auditService'

const shippingSchema = z.object({
  recipientName: z.string().trim().min(2, 'กรอกชื่อผู้รับ'),
  phone: z.string().trim().regex(/^0\d{8,9}$/, 'เบอร์โทรไม่ถูกต้อง'),
  address: z.string().trim().min(5, 'กรอกที่อยู่'),
  province: z.string().trim().min(2, 'กรอกจังหวัด'),
  postalCode: z.string().trim().regex(/^\d{5}$/, 'รหัสไปรษณีย์ 5 หลัก'),
})

export function getCart(userId) {
  return cartsRepo.get(userId)
}

export function addTicketToCart(userId, ticketTypeId, quantity) {
  const type = ticketTypesRepo.findById(ticketTypeId)
  if (!type || !type.isActive) throw new Error('บัตรนี้ปิดขายแล้ว')
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw new Error('จำนวนบัตรไม่ถูกต้อง')
  const cart = cartsRepo.get(userId)
  const i = cart.tickets.findIndex((t) => t.ticketTypeId === ticketTypeId)
  if (i >= 0) cart.tickets[i].quantity += qty
  else cart.tickets.push({ ticketTypeId, quantity: qty })
  return cartsRepo.save(userId, cart)
}

export function addMerchToCart(userId, productId, size, quantity) {
  const product = merchRepo.findById(productId)
  if (!product || !product.isActive) throw new Error('สินค้านี้ปิดขายแล้ว')
  if (!product.sizes.includes(size)) throw new Error('ขนาดไม่ถูกต้อง')
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) throw new Error('จำนวนไม่ถูกต้อง')
  if (product.stockEnabled && (product.stockBySize[size] || 0) < qty) {
    throw new Error('สต็อกไม่เพียงพอ')
  }
  const cart = cartsRepo.get(userId)
  const i = cart.merchandise.findIndex((m) => m.productId === productId && m.size === size)
  if (i >= 0) cart.merchandise[i].quantity += qty
  else cart.merchandise.push({ productId, size, quantity: qty })
  return cartsRepo.save(userId, cart)
}

export function updateCart(userId, cart) {
  return cartsRepo.save(userId, cart)
}

export function quoteCart(userId) {
  const cart = cartsRepo.get(userId)
  const settings = settingsRepo.get()
  const ticketLines = cart.tickets.map((line) => {
    const type = ticketTypesRepo.findById(line.ticketTypeId)
    if (!type) throw new Error('ไม่พบประเภทบัตร')
    return {
      kind: 'ticket',
      ticketTypeId: type.id,
      name: type.name,
      unitPrice: type.price,
      bonusToken: type.bonusToken,
      quantity: line.quantity,
      lineTotal: type.price * line.quantity,
      bonusTotal: type.bonusToken * line.quantity,
    }
  })
  const merchLines = cart.merchandise.map((line) => {
    const product = merchRepo.findById(line.productId)
    if (!product) throw new Error('ไม่พบสินค้า')
    return {
      kind: 'merchandise',
      productId: product.id,
      name: product.name,
      size: line.size,
      unitPrice: product.price,
      quantity: line.quantity,
      lineTotal: product.price * line.quantity,
    }
  })
  const subtotalTickets = ticketLines.reduce((s, l) => s + l.lineTotal, 0)
  const subtotalMerchandise = merchLines.reduce((s, l) => s + l.lineTotal, 0)
  const hasMerch = merchLines.length > 0
  const shippingMethod = hasMerch ? cart.shippingMethod || 'pickup' : null
  const shippingFee = hasMerch && shippingMethod === 'delivery' ? Number(settings.shippingFee || 0) : 0
  const totalAmount = subtotalTickets + subtotalMerchandise + shippingFee
  const expectedBonusToken = ticketLines.reduce((s, l) => s + l.bonusTotal, 0)
  return {
    cart,
    ticketLines,
    merchLines,
    items: [...ticketLines, ...merchLines],
    subtotalTickets,
    subtotalMerchandise,
    shippingFee,
    shippingMethod,
    shipping: cart.shipping,
    totalAmount,
    expectedBonusToken,
    ticketQuantity: ticketLines.reduce((s, l) => s + l.quantity, 0),
  }
}

export function checkout(user) {
  const quote = quoteCart(user.id)
  if (quote.items.length === 0) throw new Error('ยังไม่มีรายการในตะกร้า')
  if (quote.shippingMethod === 'delivery') {
    shippingSchema.parse(quote.shipping || {})
  }
  const orderId = createId('ord')
  const paymentId = createId('pay')
  const now = nowIso()
  const order = {
    id: orderId,
    buyerId: user.id,
    items: quote.items,
    ticketQuantity: quote.ticketQuantity,
    merchandiseItems: quote.merchLines,
    subtotalTickets: quote.subtotalTickets,
    subtotalMerchandise: quote.subtotalMerchandise,
    shippingFee: quote.shippingFee,
    shippingMethod: quote.shippingMethod,
    shipping: quote.shippingMethod === 'delivery' ? quote.shipping : quote.shippingMethod === 'pickup' ? { recipientName: user.fullName, phone: user.phone } : null,
    totalAmount: quote.totalAmount,
    expectedBonusToken: quote.expectedBonusToken,
    paymentId,
    status: 'awaiting_payment',
    createdAt: now,
    updatedAt: now,
  }
  const payment = {
    id: paymentId,
    orderId,
    method: 'thai_qr',
    amount: quote.totalAmount,
    status: 'awaiting_payment',
    reference: `DEMO-THAI-QR|${orderId}|${quote.totalAmount}`,
    verifiedBy: null,
    verifiedAt: null,
    rejectionReason: null,
    createdAt: now,
    updatedAt: now,
  }
  const tickets = []
  quote.ticketLines.forEach((line) => {
    for (let i = 0; i < line.quantity; i += 1) {
      tickets.push({
        id: createId('tic'),
        orderId,
        buyerId: user.id,
        ticketTypeId: line.ticketTypeId,
        name: line.name,
        price: line.unitPrice,
        bonusToken: line.bonusToken,
        qrToken: null,
        status: 'unconfirmed',
        checkedInAt: null,
        checkedInBy: null,
        createdAt: now,
        issuedAt: null,
      })
    }
    const type = ticketTypesRepo.findById(line.ticketTypeId)
    ticketTypesRepo.upsert({ ...type, soldCount: (type.soldCount || 0) + line.quantity, updatedAt: now })
  })
  if (quote.merchLines.length) {
    merchOrdersRepo.upsert({
      id: createId('mord'),
      orderId,
      userId: user.id,
      items: quote.merchLines,
      shippingMethod: quote.shippingMethod,
      recipientName: order.shipping?.recipientName || user.fullName,
      phone: order.shipping?.phone || user.phone,
      address: order.shipping?.address || '',
      province: order.shipping?.province || '',
      postalCode: order.shipping?.postalCode || '',
      status: 'pending_payment',
      fulfillmentStatus: quote.shippingMethod === 'delivery' ? 'awaiting_shipment' : 'awaiting_pickup',
      createdAt: now,
    })
    quote.merchLines.forEach((line) => {
      const product = merchRepo.findById(line.productId)
      if (product.stockEnabled) {
        const stock = { ...product.stockBySize }
        stock[line.size] = Math.max(0, (stock[line.size] || 0) - line.quantity)
        merchRepo.upsert({ ...product, stockBySize: stock, updatedAt: now })
      }
    })
  }
  ordersRepo.upsert(order)
  paymentsRepo.upsert(payment)
  ticketsRepo.upsertMany(tickets)
  cartsRepo.clear(user.id)
  logAction({ actor: user, action: 'order.create', resourceType: 'order', resourceId: orderId, after: { totalAmount: order.totalAmount } })
  return { order, payment }
}

export function cancelUnpaidOrder(user, orderId) {
  const order = ordersRepo.findById(orderId)
  if (!order) throw new Error('ไม่พบคำสั่งซื้อ')
  if (order.buyerId !== user.id && user.role !== 'super_admin') throw new Error('ไม่มีสิทธิ์ยกเลิกรายการนี้')
  if (order.status !== 'awaiting_payment') throw new Error('ยกเลิกได้เฉพาะรายการที่ยังไม่ชำระเงิน')
  const now = nowIso()
  ordersRepo.upsert({ ...order, status: 'cancelled', updatedAt: now })
  const payment = paymentsRepo.findByOrder(orderId)
  if (payment) paymentsRepo.upsert({ ...payment, status: 'cancelled', updatedAt: now })
  ticketsRepo.byOrder(orderId).forEach((t) => ticketsRepo.upsert({ ...t, status: 'cancelled' }))
  const merch = merchOrdersRepo.byOrder(orderId)
  if (merch) merchOrdersRepo.upsert({ ...merch, status: 'cancelled' })
  logAction({ actor: user, action: 'order.cancel', resourceType: 'order', resourceId: orderId })
  return true
}
