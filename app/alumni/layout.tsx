"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="w-full px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
