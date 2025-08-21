"use client"

import { useCallback } from "react"
import { auditLogger } from "@/lib/audit-logger"

export function useAuditLogger() {
  const logUserAction = useCallback(
    (
      action: string,
      targetUser: string,
      targetUserId: string,
      details: string,
      changes?: { before: Record<string, any>; after: Record<string, any> },
      severity: "low" | "medium" | "high" = "medium",
    ) => {
      // In a real app, get current admin from auth context
      const currentAdmin = {
        id: "admin001",
        name: "Current Admin",
      }

      auditLogger.logUserAction(
        currentAdmin.id,
        currentAdmin.name,
        action,
        targetUser,
        targetUserId,
        details,
        changes,
        severity,
      )
    },
    [],
  )

  const logContentAction = useCallback(
    (
      action: string,
      targetContent: string,
      targetContentId: string,
      details: string,
      changes?: { before: Record<string, any>; after: Record<string, any> },
      severity: "low" | "medium" | "high" = "medium",
    ) => {
      const currentAdmin = {
        id: "admin001",
        name: "Current Admin",
      }

      auditLogger.logContentAction(
        currentAdmin.id,
        currentAdmin.name,
        action,
        targetContent,
        targetContentId,
        details,
        changes,
        severity,
      )
    },
    [],
  )

  const logSystemAction = useCallback(
    (
      action: string,
      target: string,
      targetId: string,
      details: string,
      changes?: { before: Record<string, any>; after: Record<string, any> },
      severity: "low" | "medium" | "high" = "low",
    ) => {
      const currentAdmin = {
        id: "admin001",
        name: "Current Admin",
      }

      auditLogger.logSystemAction(
        currentAdmin.id,
        currentAdmin.name,
        action,
        target,
        targetId,
        details,
        changes,
        severity,
      )
    },
    [],
  )

  const logSecurityEvent = useCallback(
    (
      action: string,
      details: string,
      status: "success" | "failed" | "warning" = "warning",
      severity: "high" | "critical" = "high",
    ) => {
      const currentAdmin = {
        id: "admin001",
        name: "Current Admin",
      }

      auditLogger.logSecurityEvent(currentAdmin.id, currentAdmin.name, action, details, status, severity)
    },
    [],
  )

  const logAuthEvent = useCallback(
    (
      action: string,
      details: string,
      status: "success" | "failed" | "warning",
      severity: "medium" | "high" = "high",
    ) => {
      const currentAdmin = {
        id: "admin001",
        name: "Current Admin",
      }

      auditLogger.logAuthenticationEvent(currentAdmin.id, currentAdmin.name, action, details, status, severity)
    },
    [],
  )

  return {
    logUserAction,
    logContentAction,
    logSystemAction,
    logSecurityEvent,
    logAuthEvent,
  }
}
