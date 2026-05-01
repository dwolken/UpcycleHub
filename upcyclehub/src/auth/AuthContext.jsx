/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(credentials) {
    const loggedInUser = await loginUser(credentials)
    setUser(loggedInUser)
    return loggedInUser
  }

  async function register(credentials) {
    const registeredUser = await registerUser(credentials)
    setUser(registeredUser)
    return registeredUser
  }

  async function logout() {
    try {
      await logoutUser()
    } finally {
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden.')
  }

  return context
}
