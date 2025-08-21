import {
  Home,
  GraduationCap,
  UserCheck,
  Briefcase,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  Database,
} from "lucide-react"
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

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Alumni Management",
    url: "/admin/alumni",
    icon: GraduationCap,
  },
  {
    title: "Student Management",
    url: "/admin/students",
    icon: UserCheck,
  },
  {
    title: "Job Posts",
    url: "/admin/jobs",
    icon: Briefcase,
  },
  {
    title: "Events",
    url: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: MessageSquare,
  },
]

const systemItems = [
  {
    title: "System Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Security",
    url: "/admin/security",
    icon: Shield,
  },
  {
    title: "Alerts",
    url: "/admin/alerts",
    icon: AlertTriangle,
  },
]

export function AdminSidebar() {
  return (
    <Sidebar className="border-r border-gray-200 w-64 flex-shrink-0 bg-white">
      <SidebarHeader className="p-4 border-b border-gray-100 bg-[#a41a2f]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[#a41a2f]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white truncate">Admin Panel</h2>
            <p className="text-xs text-red-100 truncate">System Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#a41a2f] font-semibold">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 w-full hover:bg-red-50 hover:text-[#a41a2f] transition-colors"
                    >
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
          <SidebarGroupLabel className="text-[#a41a2f] font-semibold">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 w-full hover:bg-red-50 hover:text-[#a41a2f] transition-colors"
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">© 2024 Admin Panel</div>
      </SidebarFooter>
    </Sidebar>
  )
}
