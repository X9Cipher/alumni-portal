"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuditLogger } from "@/hooks/use-audit-logger"

interface AuditLoggerWrapperProps {
  children: React.ReactNode
}

export function AuditLoggerWrapper({ children }: AuditLoggerWrapperProps) {
  const { logAuthEvent, logSecurityEvent } = useAuditLogger()

  useEffect(() => {
    // Log page access
    logSecurityEvent("PAGE_ACCESS", `Admin accessed ${window.location.pathname}`, "success", "high")

    // Monitor for suspicious activity
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent("SESSION_HIDDEN", "Admin session moved to background", "warning", "high")
      } else {
        logSecurityEvent("SESSION_VISIBLE", "Admin session returned to foreground", "success", "high")
      }
    }

    // Monitor for page unload
    const handleBeforeUnload = () => {
      logAuthEvent("SESSION_END", "Admin session ended", "success", "medium")
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [logAuthEvent, logSecurityEvent])

  return <>{children}</>
}
