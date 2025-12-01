import { useState, useEffect } from 'react'
import { authService } from '../services/auth'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session, error } = await authService.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signIn(email, password)
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await authService.signOut()
      if (!error) {
        setUser(null)
        setSession(null)
      }
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }
}