"use client"

import { Home, Users, Briefcase, Calendar, MessageCircle, User, Settings, LogOut, UserPlus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const menuItems = [
  {
    title: "Home",
    url: "/student",
    icon: Home,
  },
  {
    title: "Alumni Directory",
    url: "/student/alumni",
    icon: Users,
  },
  {
    title: "Connections",
    url: "/student/connections",
    icon: UserPlus,
  },
  {
    title: "Job Opportunities",
    url: "/student/jobs",
    icon: Briefcase,
  },
  {
    title: "Events & Workshops",
    url: "/student/events",
    icon: Calendar,
  },
  {
    title: "Messages",
    url: "/student/messages",
    icon: MessageCircle,
  },
]

const profileItems = [
  {
    title: "Profile",
    url: "/student/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/student/settings",
    icon: Settings,
  },
]

export function StudentSidebar() {
  const router = useRouter()

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

  return (
    <Sidebar className="border-r border-gray-200 w-64 flex-shrink-0">
      <SidebarHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 truncate">Student Portal</h2>
            <p className="text-xs text-gray-500 truncate">Connect & Learn</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Student Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 w-full hover:bg-red-50 hover:text-red-600">
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">© 2024 Student Portal</div>
      </SidebarFooter>
    </Sidebar>
  )
}