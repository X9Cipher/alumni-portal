"use client"

import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { FaLinkedin } from "react-icons/fa"
import { signIn } from "next-auth/react"

interface OAuthButtonsProps {
  userType: 'student' | 'alumni' | 'admin'
}

export default function OAuthButtons({ userType }: OAuthButtonsProps) {
  if (userType === 'admin') return null

  const startOAuth = async (provider: "google" | "linkedin") => {
    // Store intended userType so NextAuth callback can create minimal user if needed
    try {
      document.cookie = `oauth-userType=${userType}; path=/; max-age=600`
    } catch {}
    const dest = userType === 'student' ? '/student' : '/alumni'
    const callbackUrl = `/api/auth/bridge?redirect=${encodeURIComponent(dest)}`
    await signIn(provider, { callbackUrl })
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full" onClick={() => startOAuth("google")}> 
        <FcGoogle className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
      <Button variant="outline" className="w-full" onClick={() => startOAuth("linkedin")}> 
        <FaLinkedin className="w-5 h-5 mr-2 text-blue-600" />
        Continue with LinkedIn
      </Button>
    </div>
  )
}


