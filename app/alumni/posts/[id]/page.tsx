"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import PostDetail from "@/components/post-detail"

export default function AlumniPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify')
        if (!res.ok) {
          router.push('/auth/login')
          return
        }
        const data = await res.json()
        if (data.user.userType !== 'alumni') {
          router.push('/auth/login')
          return
        }
      } catch {
        router.push('/auth/login')
      }
    }
    checkAuth()
  }, [params.id, router])
  return <PostDetail postId={params.id} />
}


