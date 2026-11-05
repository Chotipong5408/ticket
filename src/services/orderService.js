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
  usersRepo,
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

/**
 * Save attendee list for a ticket type into the cart.
 * Each attendee: { fullName, faculty, major, enrollmentYearBE, email, phone, isOwner }
 * This replaces (or sets) the attendees array for that ticketTypeId.
 */
export function setTicketAttendees(userId, ticketTypeId, attendees) {
  const type = ticketTypesRepo.findById(ticketTypeId)
  if (!type || !type.isActive) throw new Error('บัตรนี้ปิดขายแล้ว')
  if (!Array.isArray(attendees) || attendees.length < 1) throw new Error('ต้องมีผู้ร่วมงานอย่างน้อย 1 คน')
  if (attendees.length > 20) throw new Error('จำกัดไม่เกิน 20 ที่นั่งต่อประเภทบัตร')
  const cart = cartsRepo.get(userId)
  const i = cart.tickets.findIndex((t) => t.ticketTypeId === ticketTypeId)
  const item = { ticketTypeId, quantity: attendees.length, attendees }
  if (i >= 0) cart.tickets[i] = item
  else cart.tickets.push(item)
  return cartsRepo.save(userId, cart)
}

export function addMerchToCart(userId, productId, size, quantity) {
  const product = merchRepo.findById(productId)
  if (!product || !product.isActive) throw new Error('สินค้านี้ปิดขายแล้ว')
  if (!product.sizes.includes(size)) throw new Error('ขนาดไม่ถูกต้อง')
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) throw new Error('จำนวนไม่ถูกต้อง')
  const cart = cartsRepo.get(userId)
  const i = cart.merchandise.findIndex((m) => m.productId === productId && m.size === size)
  const inCart = i >= 0 ? cart.merchandise[i].quantity : 0
  if (product.stockEnabled && (product.stockBySize[size] || 0) < inCart + qty) {
    const avail = product.stockBySize[size] || 0
    throw new Error(`สต็อกไซส์ ${size} มีเหลือเพียง ${avail} ชิ้น${inCart > 0 ? ` (ในตะกร้ามีแล้ว ${inCart} ชิ้น)` : ''}`)
  }
  if (i >= 0) cart.merchandise[i].quantity += qty
  else cart.merchandise.push({ productId, size, quantity: qty })
  return cartsRepo.save(userId, cart)
}

export function updateCart(userId, cart) {
  return cartsRepo.save(userId, cart)
}

export function clearCart(userId) {
  return cartsRepo.clear(userId)
}

export function removeTicketFromCart(userId, ticketTypeId) {
  const cart = cartsRepo.get(userId)
  cart.tickets = cart.tickets.filter((t) => t.ticketTypeId !== ticketTypeId)
  return cartsRepo.save(userId, cart)
}

export function updateTicketQuantity(userId, ticketTypeId, quantity) {
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    return removeTicketFromCart(userId, ticketTypeId)
  }
  if (qty > 20) throw new Error('จำกัดไม่เกิน 20 ใบต่อประเภท')
  const cart = cartsRepo.get(userId)
  const item = cart.tickets.find((t) => t.ticketTypeId === ticketTypeId)
  if (item) {
    item.quantity = qty
    return cartsRepo.save(userId, cart)
  }
}

export function removeMerchFromCart(userId, productId, size) {
  const cart = cartsRepo.get(userId)
  cart.merchandise = cart.merchandise.filter(
    (m) => !(m.productId === productId && m.size === size)
  )
  return cartsRepo.save(userId, cart)
}

export function updateMerchQuantity(userId, productId, size, quantity) {
  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty < 1) {
    return removeMerchFromCart(userId, productId, size)
  }
  const product = merchRepo.findById(productId)
  if (product && product.stockEnabled && (product.stockBySize[size] || 0) < qty) {
    throw new Error(`สต็อกไซส์ ${size} มีเหลือเพียง ${product.stockBySize[size] || 0} ชิ้น`)
  }
  const cart = cartsRepo.get(userId)
  const item = cart.merchandise.find(
    (m) => m.productId === productId && m.size === size
  )
  if (item) {
    item.quantity = qty
    return cartsRepo.save(userId, cart)
  }
}

export function quoteCart(userId) {
  const cart = cartsRepo.get(userId)
  const settings = settingsRepo.get()
  const ticketLines = cart.tickets.map((line) => {
    const type = ticketTypesRepo.findById(line.ticketTypeId)
    if (!type) throw new Error('ไม่พบประเภทบัตร')
    // quantity is derived from attendees array when present
    const qty = Array.isArray(line.attendees) && line.attendees.length > 0
      ? line.attendees.length
      : (line.quantity || 1)
    return {
      kind: 'ticket',
      ticketTypeId: type.id,
      name: type.name,
      unitPrice: type.price,
      bonusToken: type.bonusToken,
      quantity: qty,
      attendees: line.attendees || null,
      lineTotal: type.price * qty,
      bonusTotal: type.bonusToken * qty,
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
  const shippingMethod = hasMerch ? (cart.shippingMethod === 'pickup' && !cart.shipping?.address ? 'delivery' : cart.shippingMethod || 'delivery') : null
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
    shipping:
      quote.shippingMethod === 'delivery'
        ? quote.shipping
        : quote.shippingMethod === 'pickup'
          ? {
              recipientName: quote.shipping?.recipientName || user.fullName,
              phone: quote.shipping?.phone || user.phone,
              address: quote.shipping?.address || '',
              province: quote.shipping?.province || '',
              postalCode: quote.shipping?.postalCode || '',
            }
          : null,
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
    const attendees = line.attendees
    for (let i = 0; i < line.quantity; i += 1) {
      let attendeeUserId = user.id
      let attendeeName = user.fullName

      // If attendee info is provided for this slot, resolve / create account
      if (Array.isArray(attendees) && attendees[i]) {
        const a = attendees[i]
        if (a.isOwner) {
          // Slot belongs to the buyer themselves
          attendeeUserId = user.id
          attendeeName = user.fullName
        } else {
          // Friend — find or create user account
          let friendUser = usersRepo.findByEmail(a.email)
          if (!friendUser) {
            const now2 = nowIso()
            friendUser = {
              id: createId('usr'),
              fullName: a.fullName,
              enrollmentYearBE: Number(a.enrollmentYearBE),
              faculty: a.faculty,
              major: a.major,
              email: a.email,
              phone: a.phone,
              // Auto-generated password: phone number (buyer told to share)
              password: a.phone,
              role: 'user',
              storeId: null,
              isActive: true,
              tokenBalance: 0,
              permissionGrants: [],
              permissionRevokes: [],
              createdAt: now2,
              updatedAt: now2,
            }
            usersRepo.upsert(friendUser)
            logAction({
              actor: user,
              action: 'register',
              resourceType: 'user',
              resourceId: friendUser.id,
              after: { email: friendUser.email, createdByBuyer: user.id },
            })
          }
          attendeeUserId = friendUser.id
          attendeeName = friendUser.fullName
        }
      }

      tickets.push({
        id: createId('tic'),
        orderId,
        buyerId: user.id,
        attendeeId: attendeeUserId,
        attendeeName,
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
      shippingMethod: quote.shippingMethod || 'delivery',
      recipientName: order.shipping?.recipientName || user.fullName,
      phone: order.shipping?.phone || user.phone,
      address: order.shipping?.address || quote.shipping?.address || '',
      province: order.shipping?.province || quote.shipping?.province || '',
      postalCode: order.shipping?.postalCode || quote.shipping?.postalCode || '',
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
