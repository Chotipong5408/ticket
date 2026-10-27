import { createId } from '../lib/ids'
import { nowIso } from '../lib/dates'
import { auditRepo } from '../repositories'

export function logAction({ actor, action, resourceType, resourceId, before = null, after = null, result = 'success' }) {
  return auditRepo.add({
    id: createId('aud'),
    actorId: actor?.id || 'system',
    actorRole: actor?.role || 'system',
    action,
    resourceType,
    resourceId,
    before,
    after,
    result,
    createdAt: nowIso(),
  })
}
