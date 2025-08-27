"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        
        if (!response.ok) {
          router.push("/auth/login")
          return
        }
        
        const data = await response.json()
        const userType = data.user.userType

        if (!userType || !allowedRoles.includes(userType)) {
          router.push("/auth/login")
          return
        }

        setIsAuthorized(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
