import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { AdminLayoutWrapper } from "@/components/admin-layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Panel - Alumni Network",
  description: "System administration and management",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminLayoutWrapper>
      {children}
        </AdminLayoutWrapper>
      </body>
    </html>
  )
}