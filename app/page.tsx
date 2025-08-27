"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        
        if (!response.ok) {
          router.push("/auth/login")
          return
        }
        
        const data = await response.json()
        const userType = data.user.userType

        // Redirect based on user type
        switch (userType) {
          case "admin":
            router.push("/admin")
            break
          case "student":
            router.push("/student")
            break
          case "alumni":
            router.push("/alumni")
            break
          default:
            router.push("/auth/login")
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push("/auth/login")
      }
    }

    checkAuthAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  )
}
