import { KEYS } from '../data/keys'
import { readJson, writeJson } from '../lib/storage'
import { notifyData } from '../lib/events'

function repo(key, fallback) {
  return {
    all() {
      return readJson(key, fallback)
    },
    save(value) {
      writeJson(key, value)
      notifyData()
      return value
    },
  }
}

export const usersRepo = {
  ...repo(KEYS.users, []),
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  findByEmail(email) {
    return this.all().find((x) => x.email.toLowerCase() === String(email).toLowerCase()) || null
  },
  upsert(user) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === user.id)
    if (i >= 0) list[i] = user
    else list.push(user)
    this.save(list)
    return user
  },
}

export const ticketTypesRepo = {
  ...repo(KEYS.ticketTypes, []),
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const ticketsRepo = {
  ...repo(KEYS.tickets, []),
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  findByQr(token) {
    return this.all().find((x) => x.qrToken === token) || null
  },
  byOrder(orderId) {
    return this.all().filter((x) => x.orderId === orderId)
  },
  byBuyer(userId) {
    return this.all().filter((x) => x.buyerId === userId)
  },
  upsertMany(items) {
    const list = this.all()
    items.forEach((item) => {
      const i = list.findIndex((x) => x.id === item.id)
      if (i >= 0) list[i] = item
      else list.push(item)
    })
    this.save(list)
  },
  upsert(item) {
    this.upsertMany([item])
    return item
  },
}

export const ordersRepo = {
  ...repo(KEYS.orders, []),
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  byBuyer(userId) {
    return this.all().filter((x) => x.buyerId === userId)
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const paymentsRepo = {
  ...repo(KEYS.payments, []),
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  findByOrder(orderId) {
    return this.all().find((x) => x.orderId === orderId) || null
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const slipsRepo = {
  ...repo(KEYS.paymentSlips, []),
  byPayment(paymentId) {
    return this.all().filter((x) => x.paymentId === paymentId)
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const reviewsRepo = {
  ...repo(KEYS.paymentReviews, []),
  add(item) {
    const list = this.all()
    list.push(item)
    this.save(list)
    return item
  },
}

export const merchRepo = {
  ...repo(KEYS.merchandise, []),
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const merchOrdersRepo = {
  ...repo(KEYS.merchandiseOrders, []),
  byOrder(orderId) {
    return this.all().find((x) => x.orderId === orderId) || null
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const tokensRepo = {
  ...repo(KEYS.tokenTransactions, []),
  byUser(userId) {
    return this.all().filter((x) => x.userId === userId)
  },
  hasIdempotency(key) {
    return this.all().some((x) => x.idempotencyKey === key)
  },
  add(item) {
    const list = this.all()
    list.push(item)
    this.save(list)
    return item
  },
}

export const storesRepo = {
  ...repo(KEYS.stores, []),
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const productsRepo = {
  ...repo(KEYS.storeProducts, []),
  byStore(storeId) {
    return this.all().filter((x) => x.storeId === storeId)
  },
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const requestsRepo = {
  ...repo(KEYS.paymentRequests, []),
  findById(id) {
    return this.all().find((x) => x.id === id) || null
  },
  findByQr(token) {
    return this.all().find((x) => x.qrToken === token) || null
  },
  byStore(storeId) {
    return this.all().filter((x) => x.storeId === storeId)
  },
  upsert(item) {
    const list = this.all()
    const i = list.findIndex((x) => x.id === item.id)
    if (i >= 0) list[i] = item
    else list.push(item)
    this.save(list)
    return item
  },
}

export const checkinsRepo = {
  ...repo(KEYS.checkins, []),
  byTicket(ticketId) {
    return this.all().filter((x) => x.ticketId === ticketId)
  },
  add(item) {
    const list = this.all()
    list.push(item)
    this.save(list)
    return item
  },
}

export const auditRepo = {
  ...repo(KEYS.auditLogs, []),
  add(item) {
    const list = this.all()
    list.unshift(item)
    this.save(list)
    return item
  },
}

export const emailRepo = {
  ...repo(KEYS.emailOutbox, []),
  add(item) {
    const list = this.all()
    list.unshift(item)
    this.save(list)
    return item
  },
}

export const settingsRepo = {
  get() {
    return readJson(KEYS.settings, {})
  },
  save(value) {
    writeJson(KEYS.settings, value)
    notifyData()
    return value
  },
}

export const cartsRepo = {
  get(userId) {
    const all = readJson(KEYS.carts, {})
    return all[userId] || { tickets: [], merchandise: [], shippingMethod: 'pickup', shipping: null }
  },
  save(userId, cart) {
    const all = readJson(KEYS.carts, {})
    all[userId] = cart
    writeJson(KEYS.carts, all)
    notifyData()
    return cart
  },
  clear(userId) {
    const all = readJson(KEYS.carts, {})
    delete all[userId]
    writeJson(KEYS.carts, all)
    notifyData()
  },
}

export const sessionRepo = {
  get() {
    return readJson(KEYS.sessions, null)
  },
  save(session) {
    writeJson(KEYS.sessions, session)
    notifyData()
    return session
  },
  clear() {
    writeJson(KEYS.sessions, null)
    notifyData()
  },
}

export const idempotencyRepo = {
  has(key) {
    return readJson(KEYS.idempotency, []).includes(key)
  },
  add(key) {
    const list = readJson(KEYS.idempotency, [])
    if (!list.includes(key)) {
      list.push(key)
      writeJson(KEYS.idempotency, list)
    }
  },
}
