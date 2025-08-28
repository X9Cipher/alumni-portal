"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import HorizontalNav from "./horizontal-nav"

interface StudentLayoutWrapperProps {
  children: React.ReactNode
}

export function StudentLayoutWrapper({ children }: StudentLayoutWrapperProps) {
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
        if (data.user.userType !== 'student') {
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
    <div className="min-h-screen bg-white prevent-overflow">
      <HorizontalNav
        userType="student"
        userId={user._id}
        userFirstName={user.firstName}
        userLastName={user.lastName}
        profilePicture={user.profilePicture}
      />
      <main className="pt-1 sm:pt-1 pb-0">
        <div className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 w-full pb-0">
          {children}
        </div>
      </main>
    </div>
  )
}
