import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { StudentSidebar } from "@/components/student-sidebar"
import { TopNavbar } from "@/components/top-navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Student Portal - Alumni Network",
  description: "Connect with alumni and explore opportunities",
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider defaultOpen={true}>
          <div className="min-h-screen w-full flex overflow-hidden">
            <StudentSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <main className="flex-1 overflow-auto">
                <div className="p-4 md:p-6 w-full">{children}</div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
