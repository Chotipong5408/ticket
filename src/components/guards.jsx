import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function RequireRole({ roles, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/account" replace />
  return children
}

export function RequirePerm({ perm, children }) {
  const { user, can } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!can(perm)) return <Navigate to="/account" replace />
  return children
}
