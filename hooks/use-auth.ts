import { useState, useEffect, useCallback } from 'react'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  userType: 'student' | 'alumni' | 'admin'
  avatar?: string
  company?: string
  title?: string
  sessionId?: string
  // Privacy settings
  showEmailInProfile?: boolean
  showPhoneInProfile?: boolean
}

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  refreshAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
        // If verification fails, try to clear any stale cookies
        if (response.status === 401) {
          // Clear any existing session cookies
          document.cookie = 'current-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          // Clear any old auth-token cookies
          document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          // Clear any session-specific auth-token cookies
          const cookies = document.cookie.split(';')
          cookies.forEach(cookie => {
            const [name] = cookie.trim().split('=')
            if (name.startsWith('auth-token-')) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            }
          })
        }
      }
    } catch (err) {
      setError('Failed to check authentication')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshAuth = useCallback(async () => {
    await checkAuth()
  }, [checkAuth])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      // Clear any remaining cookies
      document.cookie = 'current-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      // Clear any session-specific auth-token cookies
      const cookies = document.cookie.split(';')
      cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=')
        if (name.startsWith('auth-token-')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
    } catch (err) {
      console.error('Logout error:', err)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Add event listener for storage changes (when another tab logs in/out)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-change') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events within the same window
    const handleAuthChange = () => {
      checkAuth()
    }
    
    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [checkAuth])

  return { user, loading, error, refreshAuth, logout }
}



