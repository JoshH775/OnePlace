import React, { createContext, useState, useContext, useEffect } from 'react'
import { api } from '../utils'

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  loginContext: () => void
  logoutContext: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true, // Initially loading
  loginContext: () => {},
  logoutContext: () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { status } = await api('/auth/check-session')

        if (status === 200) {
          setIsAuthenticated(true)
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
    console.log('Logged in')
    setIsAuthenticated(true)
  }

  const logoutContext = async () => {
    console.log('Logged out')
    setIsAuthenticated(false)
    // window.location.href = '/login'
    
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  )
}
