"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import HorizontalNav from "./horizontal-nav"

interface AlumniLayoutWrapperProps {
  children: React.ReactNode
}

export function AlumniLayoutWrapper({ children }: AlumniLayoutWrapperProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

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

  // Only lock body scroll on desktop for /alumni and /alumni/messages
  const isFixedRoute = pathname === '/alumni' || pathname.startsWith('/alumni/messages')

  return (
    <div className={`min-h-screen bg-white prevent-overflow flex flex-col ${isFixedRoute ? 'lg:h-screen lg:overflow-hidden' : ''}`}>
      <HorizontalNav
        userType="alumni"
        userId={user._id}
        userFirstName={user.firstName}
        userLastName={user.lastName}
        profilePicture={user.profilePicture}
      />
      <main className={`pt-1 sm:pt-1 pb-0 ${isFixedRoute ? 'lg:flex-1 lg:min-h-0 lg:overflow-hidden' : ''}`}>
        <div className={`max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-8 w-full pb-0 ${isFixedRoute ? 'lg:h-full lg:overflow-hidden' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
