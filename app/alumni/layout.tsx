import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { AlumniLayoutWrapper } from "@/components/alumni-layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Alumni Portal - Alumni Network",
  description: "Connect with students and share opportunities",
}

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AlumniLayoutWrapper>
          {children}
        </AlumniLayoutWrapper>
      </body>
    </html>
  )
}
