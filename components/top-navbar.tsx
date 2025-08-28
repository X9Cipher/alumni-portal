"use client"

import { useState, useEffect } from "react"
import { Search, Bell, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  userType: string
}

export function TopNavbar() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Logged out successfully')
        router.push('/auth/login')
      } else {
        toast.error('Failed to logout')
      }
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleViewProfile = () => {
    if (user?.userType === 'alumni') {
      router.push('/alumni/profile')
    } else if (user?.userType === 'student') {
      router.push('/student/profile')
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U'
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'Unknown User'
    return `${firstName} ${lastName}`
  }

  return (
    <header className="border-b border-gray-200 bg-white px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md min-w-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search alumni, companies, skills..." 
              className="pl-10 bg-gray-50 border-gray-200 text-sm" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" className="relative p-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-2 min-w-0">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                  <AvatarImage src={(user as any)?.profilePicture || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>
                    {user && !loading ? getInitials(user.firstName, user.lastName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {user && !loading ? getFullName(user.firstName, user.lastName) : 'Loading...'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleViewProfile}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
