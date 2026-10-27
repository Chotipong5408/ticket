import { createId } from '../lib/ids'
import { nowIso } from '../lib/dates'
import { tokensRepo, usersRepo, idempotencyRepo } from '../repositories'
import { requirePerm } from './authService'
import { logAction } from './auditService'

export function recomputeBalance(userId) {
  const txs = tokensRepo.byUser(userId)
  return txs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
}

export function creditTokens({ userId, amount, type, referenceType, referenceId, actor, note, idempotencyKey }) {
  if (amount <= 0) throw new Error('จำนวน Token ต้องมากกว่า 0')
  if (idempotencyKey && (idempotencyRepo.has(idempotencyKey) || tokensRepo.hasIdempotency(idempotencyKey))) {
    throw new Error('รายการนี้ถูกบันทึกแล้ว ไม่สามารถทำซ้ำได้')
  }
  const user = usersRepo.findById(userId)
  if (!user) throw new Error('ไม่พบผู้ใช้')
  const before = recomputeBalance(userId)
  const after = before + amount
  const tx = tokensRepo.add({
    id: createId('tok'),
    userId,
    type,
    amount,
    balanceBefore: before,
    balanceAfter: after,
    referenceType,
    referenceId,
    actorId: actor?.id || userId,
    note,
    idempotencyKey,
    createdAt: nowIso(),
  })
  if (idempotencyKey) idempotencyRepo.add(idempotencyKey)
  usersRepo.upsert({ ...user, tokenBalance: after, updatedAt: nowIso() })
  logAction({ actor: actor || user, action: `token.${type}`, resourceType: 'token_transaction', resourceId: tx.id, after: { amount, after } })
  return tx
}

export function debitTokens({ userId, amount, referenceType, referenceId, actor, note, idempotencyKey }) {
  if (amount <= 0) throw new Error('จำนวน Token ต้องมากกว่า 0')
  if (idempotencyKey && (idempotencyRepo.has(idempotencyKey) || tokensRepo.hasIdempotency(idempotencyKey))) {
    throw new Error('รายการนี้ถูกหัก Token แล้ว')
  }
  const user = usersRepo.findById(userId)
  if (!user) throw new Error('ไม่พบผู้ใช้')
  const before = recomputeBalance(userId)
  if (before < amount) throw new Error('Token ไม่เพียงพอ')
  const after = before - amount
  const tx = tokensRepo.add({
    id: createId('tok'),
    userId,
    type: 'spend',
    amount: -amount,
    balanceBefore: before,
    balanceAfter: after,
    referenceType,
    referenceId,
    actorId: actor?.id || userId,
    note,
    idempotencyKey,
    createdAt: nowIso(),
  })
  if (idempotencyKey) idempotencyRepo.add(idempotencyKey)
  usersRepo.upsert({ ...user, tokenBalance: after, updatedAt: nowIso() })
  logAction({ actor: actor || user, action: 'token.spend', resourceType: 'token_transaction', resourceId: tx.id, after: { amount: -amount, after } })
  return tx
}

export function topupTokens(actor, { userId, tokens, cashReceived, note }) {
  requirePerm(actor, 'token.topup')
  if (actor.role === 'store_admin') throw new Error('Store Admin ไม่สามารถเติม Token ได้')
  const qty = Number(tokens)
  if (!Number.isInteger(qty) || qty <= 0) throw new Error('จำนวน Token ไม่ถูกต้อง')
  return creditTokens({
    userId,
    amount: qty,
    type: 'topup',
    referenceType: 'topup',
    referenceId: createId('top'),
    actor,
    note: note || `เติมหน้างาน รับเงิน ${cashReceived || '-'} บาท`,
    idempotencyKey: `topup:${createId('idem')}:${userId}:${qty}:${Date.now()}`,
  })
}

export function walletSummary(userId) {
  const txs = tokensRepo.byUser(userId)
  const bonus = txs.filter((t) => t.type === 'bonus').reduce((s, t) => s + t.amount, 0)
  const topup = txs.filter((t) => t.type === 'topup').reduce((s, t) => s + t.amount, 0)
  const spent = txs.filter((t) => t.type === 'spend').reduce((s, t) => s + Math.abs(t.amount), 0)
  return { balance: recomputeBalance(userId), bonus, topup, spent, txs: txs.slice().reverse() }
}
