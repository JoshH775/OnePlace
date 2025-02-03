import React, { createContext, useState, useContext, useEffect, useMemo } from 'react'
import { User } from '../utils/types'
import api from '../utils/api'

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginContext: () => void
  logoutContext: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Initially loading
  loginContext: () => {},
  logoutContext: () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { status } = await api.req('/auth/check-session')

        if (status === 200) {
          setIsAuthenticated(true)
          const user = await api.getUser()
          setUser(user)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false) // Stop loading after checking
      }
    }

    checkAuthStatus()
  }, [])

  const loginContext = async () => {
    setIsAuthenticated(true)
    const user = await api.getUser()
    setUser(user)

  }

  const logoutContext = async () => {
    setIsAuthenticated(false)
    
  }

  const authValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      loginContext,
      logoutContext
    }),
    [isAuthenticated, isLoading, user]
  )

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}
