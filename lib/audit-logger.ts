"use client"

export interface AuditLogEntry {
  id: string
  timestamp: string
  adminId: string
  adminName: string
  action: string
  category:
    | "User Management"
    | "Content Moderation"
    | "System Settings"
    | "Authentication"
    | "System Maintenance"
    | "Security"
  target: string
  targetId: string
  details: string
  ipAddress: string
  userAgent: string
  severity: "low" | "medium" | "high" | "critical"
  status: "success" | "failed" | "warning"
  changes?: {
    before: Record<string, any>
    after: Record<string, any>
  }
  metadata?: Record<string, any>
}

export class AuditLogger {
  private static instance: AuditLogger
  private logs: AuditLogEntry[] = []

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  private generateId(): string {
    return `AL${Date.now().toString().slice(-6)}`
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString().replace("T", " ").slice(0, 19)
  }

  private getClientInfo() {
    return {
      ipAddress: "192.168.1.100", // In real app, get from request
      userAgent: navigator.userAgent,
    }
  }

  public log(entry: Omit<AuditLogEntry, "id" | "timestamp" | "ipAddress" | "userAgent">): void {
    const clientInfo = this.getClientInfo()

    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: this.getCurrentTimestamp(),
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    }

    this.logs.push(auditEntry)

    // In a real application, you would send this to your backend
    console.log("Audit Log Entry:", auditEntry)

    // Store in localStorage for demo purposes
    const existingLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    existingLogs.push(auditEntry)
    localStorage.setItem("auditLogs", JSON.stringify(existingLogs))
  }

  public getLogs(): AuditLogEntry[] {
    // In a real application, fetch from backend
    const storedLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    return [...this.logs, ...storedLogs]
  }

  // Convenience methods for common actions
  public logUserAction(
    adminId: string,
    adminName: string,
    action: string,
    targetUser: string,
    targetUserId: string,
    details: string,
    changes?: { before: Record<string, any>; after: Record<string, any> },
    severity: "low" | "medium" | "high" = "medium",
  ) {
    this.log({
      adminId,
      adminName,
      action,
      category: "User Management",
      target: targetUser,
      targetId: targetUserId,
      details,
      severity,
      status: "success",
      changes,
    })
  }

  public logContentAction(
    adminId: string,
    adminName: string,
    action: string,
    targetContent: string,
    targetContentId: string,
    details: string,
    changes?: { before: Record<string, any>; after: Record<string, any> },
    severity: "low" | "medium" | "high" = "medium",
  ) {
    this.log({
      adminId,
      adminName,
      action,
      category: "Content Moderation",
      target: targetContent,
      targetId: targetContentId,
      details,
      severity,
      status: "success",
      changes,
    })
  }

  public logSystemAction(
    adminId: string,
    adminName: string,
    action: string,
    target: string,
    targetId: string,
    details: string,
    changes?: { before: Record<string, any>; after: Record<string, any> },
    severity: "low" | "medium" | "high" = "low",
  ) {
    this.log({
      adminId,
      adminName,
      action,
      category: "System Settings",
      target,
      targetId,
      details,
      severity,
      status: "success",
      changes,
    })
  }

  public logSecurityEvent(
    adminId: string,
    adminName: string,
    action: string,
    details: string,
    status: "success" | "failed" | "warning" = "warning",
    severity: "high" | "critical" = "high",
  ) {
    this.log({
      adminId,
      adminName,
      action,
      category: "Security",
      target: "Security Event",
      targetId: "security_event",
      details,
      severity,
      status,
    })
  }

  public logAuthenticationEvent(
    adminId: string,
    adminName: string,
    action: string,
    details: string,
    status: "success" | "failed" | "warning",
    severity: "medium" | "high" = "high",
  ) {
    this.log({
      adminId,
      adminName,
      action,
      category: "Authentication",
      target: "Authentication Event",
      targetId: "auth_event",
      details,
      severity,
      status,
    })
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()
