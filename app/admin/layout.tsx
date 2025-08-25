"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  GraduationCap, 
  TrendingUp,
  TrendingDown,
  Briefcase,
  Search,
  Bell,
  User,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Home,
  UserCheck,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Database,
  Settings,
  Shield,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (!response.ok) {
        router.push('/auth/login')
        return
      }
      
      const data = await response.json()
      if (data.user.userType !== 'admin') {
        router.push('/auth/login')
        return
      }
    } catch (error) {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.clear()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path: string) => {
    if (!pathname) return false
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(path)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-[#a41a2f] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#a41a2f]" />
            </div>
            <div>
              <h2 className="font-semibold">Admin Panel</h2>
              <p className="text-sm text-red-100">System Management</p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Main Menu</h3>
            <nav className="space-y-1">
              <Link 
                href="/admin" 
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/admin') 
                    ? 'text-[#a41a2f] bg-red-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              <Link 
                href="/admin/alumni" 
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/admin/alumni') 
                    ? 'text-[#a41a2f] bg-red-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Alumni Management
              </Link>
              <Link 
                href="/admin/students" 
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/admin/students') 
                    ? 'text-[#a41a2f] bg-red-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Student Management
              </Link>
              <Link 
                href="/admin/jobs" 
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/admin/jobs') 
                    ? 'text-[#a41a2f] bg-red-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Job Posts
              </Link>
              <Link 
                href="/admin/events" 
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/admin/events') 
                    ? 'text-[#a41a2f] bg-red-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Events
              </Link>
              <Link 
                href="#" 
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">System</h3>
            <nav className="space-y-1">
              <Link 
                href="/admin/profile" 
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/admin/profile') 
                    ? 'text-[#a41a2f] bg-red-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
              <Link 
                href="#" 
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                System Settings
              </Link>
              <Link 
                href="#" 
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4" />
                Security
              </Link>
              <Link 
                href="#" 
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Alerts
              </Link>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">© 2024 Admin Panel</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search users, content, reports..." 
                  className="pl-10 bg-gray-50 border-gray-200" 
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-[#a41a2f] text-white text-xs flex items-center justify-center">
                  3
                </Badge>
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#a41a2f] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Admin User</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
      {children}
        </main>
      </div>
    </div>
  )
}