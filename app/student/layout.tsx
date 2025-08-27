import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { StudentLayoutWrapper } from "@/components/student-layout-wrapper"

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
        <StudentLayoutWrapper>
          {children}
        </StudentLayoutWrapper>
      </body>
    </html>
  )
}
