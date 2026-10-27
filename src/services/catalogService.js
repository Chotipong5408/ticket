import { z } from 'zod'
import { createId } from '../lib/ids'
import { nowIso } from '../lib/dates'
import { ticketTypesRepo, merchRepo, settingsRepo } from '../repositories'
import { requirePerm } from './authService'
import { logAction } from './auditService'

export const ticketTypeSchema = z.object({
  name: z.string().trim().min(2, 'กรุณากรอกชื่อบัตร'),
  price: z.coerce.number().min(0, 'ราคาไม่ถูกต้อง'),
  bonusToken: z.coerce.number().min(0),
  description: z.string().optional().default(''),
  stockLimit: z.union([z.coerce.number().min(0), z.literal(''), z.null()]).optional(),
  saleStart: z.string().optional().nullable(),
  saleEnd: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export function listActiveTicketTypes() {
  const now = new Date()
  return ticketTypesRepo.all().filter((t) => {
    if (!t.isActive) return false
    if (t.saleStart && new Date(t.saleStart) > now) return false
    if (t.saleEnd && new Date(t.saleEnd) < now) return false
    if (t.stockLimit != null && t.soldCount >= t.stockLimit) return false
    return true
  })
}

export function saveTicketType(actor, input, id) {
  requirePerm(actor, 'ticket.manage')
  const data = ticketTypeSchema.parse(input)
  const existing = id ? ticketTypesRepo.findById(id) : null
  const item = {
    id: existing?.id || createId('tkt'),
    name: data.name,
    price: data.price,
    bonusToken: data.bonusToken,
    description: data.description || '',
    stockLimit: data.stockLimit === '' || data.stockLimit == null ? null : Number(data.stockLimit),
    soldCount: existing?.soldCount || 0,
    saleStart: data.saleStart || null,
    saleEnd: data.saleEnd || null,
    isActive: data.isActive,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  ticketTypesRepo.upsert(item)
  logAction({ actor, action: existing ? 'ticket_type.update' : 'ticket_type.create', resourceType: 'ticket_type', resourceId: item.id, before: existing, after: item })
  return item
}

export const merchSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().optional().default(''),
  price: z.coerce.number().min(0),
  isActive: z.boolean().optional().default(true),
  stockEnabled: z.boolean().optional().default(false),
})

export function saveMerchandise(actor, input, id) {
  requirePerm(actor, 'merchandise.manage')
  const data = merchSchema.parse(input)
  const existing = id ? merchRepo.findById(id) : null
  const item = {
    id: existing?.id || createId('mer'),
    name: data.name,
    description: data.description,
    imageKind: existing?.imageKind || 'navy',
    sizes: existing?.sizes || ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    price: data.price,
    stockEnabled: data.stockEnabled,
    stockBySize: existing?.stockBySize || { S: 0, M: 0, L: 0, XL: 0, '2XL': 0, '3XL': 0 },
    isActive: data.isActive,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  merchRepo.upsert(item)
  logAction({ actor, action: existing ? 'merchandise.update' : 'merchandise.create', resourceType: 'merchandise', resourceId: item.id })
  return item
}

export function saveSettings(actor, patch) {
  requirePerm(actor, 'admin.manage')
  const current = settingsRepo.get()
  const next = { ...current, ...patch }
  settingsRepo.save(next)
  if (patch.reentryPolicy && patch.reentryPolicy !== current.reentryPolicy) {
    logAction({ actor, action: 'settings.reentry_policy', resourceType: 'settings', resourceId: 'reentry', before: current.reentryPolicy, after: patch.reentryPolicy })
  }
  if (patch.tokenPriceTHB != null || patch.tokenPackages) {
    logAction({ actor, action: 'token.price.update', resourceType: 'settings', resourceId: 'token', before: current, after: next })
  }
  return next
}
