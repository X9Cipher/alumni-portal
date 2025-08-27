"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  UserPlus,
  Bell,
  Search,
  GraduationCap,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface HorizontalNavProps {
  userType: 'student' | 'alumni' | 'admin'
  userId: string
  userFirstName: string
  userLastName: string
  profilePicture?: string
}

export default function HorizontalNav({ userType, userId, userFirstName, userLastName, profilePicture }: HorizontalNavProps) {
  const pathname = usePathname() || ''
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const getMenuItems = () => {
    if (userType === 'student') {
      return [
        { title: "Home", url: "/student", icon: Home },
        { title: "Alumni Directory", url: "/student/alumni", icon: Users },
        { title: "Connections", url: "/student/connections", icon: UserPlus },
        { title: "Job Opportunities", url: "/student/jobs", icon: Briefcase },
        { title: "Events & Workshops", url: "/student/events", icon: Calendar },
        { title: "Messages", url: "/student/messages", icon: MessageCircle },
      ]
    } else if (userType === 'alumni') {
      return [
        { title: "Home", url: "/alumni", icon: Home },
        { title: "Alumni Directory", url: "/alumni/directory", icon: Users },
        { title: "Student Requests", url: "/alumni/connections", icon: Users },
        { title: "Jobs & Internships", url: "/alumni/jobs", icon: Briefcase },
        { title: "Events", url: "/alumni/events", icon: Calendar },
        { title: "Messages", url: "/alumni/messages", icon: MessageCircle },
      ]
    } else if (userType === 'admin') {
      return [
        { title: "Dashboard", url: "/admin", icon: Home },
        { title: "Alumni Management", url: "/admin/alumni", icon: GraduationCap },
        { title: "Student Management", url: "/admin/students", icon: UserPlus },
        { title: "Job Posts", url: "/admin/jobs", icon: Briefcase },
        { title: "Events", url: "/admin/events", icon: Calendar },
        { title: "Messages", url: "/admin/messages", icon: MessageCircle },
      ]
    }
    return []
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${userType}/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const menuItems = getMenuItems()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left Section - Logo and Search */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href={`/${userType}`} className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">Alumni Portal</span>
                
              </div>
            </Link>

            
          </div>

          {/* Middle Section - Main Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex flex-col items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mb-1" />
                  <span className="text-xs">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Section - Community Feed, Notifications, Profile, and Logout */}
          <div className="flex items-center space-x-3">
            

            {/* Notifications */}
            <Link 
              href={`/${userType}/notifications`} 
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Bell className="w-4 h-4" />
            </Link>

            

            
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 text-xs px-2 py-1 h-8"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-200 bg-gray-50">
        <nav className="flex items-center justify-around py-2">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`flex flex-col items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4 mb-1" />
                <span className="text-center text-xs">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
