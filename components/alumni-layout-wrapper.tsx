"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import HorizontalNav from "./horizontal-nav"

interface AlumniLayoutWrapperProps {
  children: React.ReactNode
}

export function AlumniLayoutWrapper({ children }: AlumniLayoutWrapperProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        if (!response.ok) {
          router.push('/auth/login')
          return
        }
        
        const data = await response.json()
        if (data.user.userType !== 'alumni') {
          router.push('/auth/login')
          return
        }
        
        setUser(data.user)
      } catch (error) {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HorizontalNav
        userType="alumni"
        userId={user._id}
        userFirstName={user.firstName}
        userLastName={user.lastName}
        profilePicture={user.profilePicture}
      />
      <main className="pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
