import { createContext, useContext, useMemo } from 'react'
import { getSessionUser, login as doLogin, logout as doLogout, register as doRegister } from '../services/authService'
import { hasPermission } from '../data/permissions'
import { useLiveData } from '../hooks/useLiveData'
import { bootstrapDemo } from '../services/demoService'

bootstrapDemo()

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  useLiveData()
  const user = getSessionUser()
  const value = useMemo(
    () => ({
      user,
      login: doLogin,
      logout: doLogout,
      register: doRegister,
      can: (perm) => hasPermission(user, perm),
    }),
    [user],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
