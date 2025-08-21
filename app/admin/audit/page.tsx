import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Users,
  FileText,
  Clock,
  MapPin,
  Shield,
} from "lucide-react"

export default function AuditLogs() {
  const auditLogs = [
    {
      id: "AL001",
      timestamp: "2024-12-12 14:30:25",
      admin: "John Admin",
      adminId: "admin001",
      action: "USER_APPROVED",
      category: "User Management",
      target: "David Wilson (STU2024001)",
      targetId: "user_456",
      details: "Approved student registration for Computer Science department",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0.0.0",
      severity: "medium",
      status: "success",
      changes: {
        before: { status: "pending", approved: false },
        after: { status: "active", approved: true, approvedBy: "admin001" },
      },
    },
    {
      id: "AL002",
      timestamp: "2024-12-12 14:25:15",
      admin: "Sarah Admin",
      adminId: "admin002",
      action: "CONTENT_DELETED",
      category: "Content Moderation",
      target: "Job Post: Senior Developer",
      targetId: "job_789",
      details: "Deleted inappropriate job posting due to policy violation",
      ipAddress: "192.168.1.101",
      userAgent: "Firefox 121.0.0.0",
      severity: "high",
      status: "success",
      changes: {
        before: { status: "active", visible: true },
        after: { status: "deleted", visible: false, deletedBy: "admin002", reason: "policy_violation" },
      },
    },
    {
      id: "AL003",
      timestamp: "2024-12-12 14:20:10",
      admin: "John Admin",
      adminId: "admin001",
      action: "SETTINGS_UPDATED",
      category: "System Settings",
      target: "Platform Configuration",
      targetId: "settings_general",
      details: "Updated platform registration settings",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0.0.0",
      severity: "medium",
      status: "success",
      changes: {
        before: { registrationEnabled: true, approvalRequired: false },
        after: { registrationEnabled: true, approvalRequired: true },
      },
    },
    {
      id: "AL004",
      timestamp: "2024-12-12 14:15:05",
      admin: "Mike Admin",
      adminId: "admin003",
      action: "LOGIN_FAILED",
      category: "Authentication",
      target: "Admin Login Attempt",
      targetId: "auth_login",
      details: "Failed login attempt with incorrect credentials",
      ipAddress: "192.168.1.102",
      userAgent: "Safari 17.0.0.0",
      severity: "high",
      status: "failed",
      changes: {
        before: { loginAttempts: 2 },
        after: { loginAttempts: 3, lastFailedAttempt: "2024-12-12 14:15:05" },
      },
    },
    {
      id: "AL005",
      timestamp: "2024-12-12 14:10:30",
      admin: "Sarah Admin",
      adminId: "admin002",
      action: "USER_SUSPENDED",
      category: "User Management",
      target: "Alex Johnson (alumni)",
      targetId: "user_123",
      details: "Suspended user account for violating community guidelines",
      ipAddress: "192.168.1.101",
      userAgent: "Firefox 121.0.0.0",
      severity: "high",
      status: "success",
      changes: {
        before: { status: "active", suspended: false },
        after: {
          status: "suspended",
          suspended: true,
          suspendedBy: "admin002",
          suspensionReason: "community_violation",
        },
      },
    },
    {
      id: "AL006",
      timestamp: "2024-12-12 14:05:20",
      admin: "John Admin",
      adminId: "admin001",
      action: "BACKUP_CREATED",
      category: "System Maintenance",
      target: "Database Backup",
      targetId: "backup_20241212",
      details: "Manual database backup created successfully",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0.0.0",
      severity: "low",
      status: "success",
      changes: {
        before: { lastBackup: "2024-12-11 02:00:00" },
        after: { lastBackup: "2024-12-12 14:05:20", backupSize: "2.3GB", backupType: "manual" },
      },
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Eye className="w-4 h-4 text-gray-600" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "User Management":
        return <Users className="w-4 h-4" />
      case "Content Moderation":
        return <FileText className="w-4 h-4" />
      case "System Settings":
        return <Settings className="w-4 h-4" />
      case "Authentication":
        return <Shield className="w-4 h-4" />
      case "System Maintenance":
        return <Settings className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const stats = [
    { title: "Total Actions", value: "1,247", change: "+12%", color: "text-[#a41a2f]" },
    { title: "Failed Actions", value: "23", change: "-5%", color: "text-red-600" },
    { title: "High Severity", value: "45", change: "+8%", color: "text-orange-600" },
    { title: "Active Admins", value: "8", change: "0%", color: "text-green-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#a41a2f] mb-2">Audit Logs</h1>
          <p className="text-gray-600">Comprehensive tracking of all administrative actions and system events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button className="bg-[#a41a2f] hover:bg-red-700">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-[#a41a2f]">{stat.title}</div>
              <div className={`text-xs ${stat.color}`}>{stat.change} from last week</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            All Logs
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            User Actions
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Content
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            System
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Security
          </TabsTrigger>
          <TabsTrigger value="failed" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Failed Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search logs by action, admin, or target..." className="pl-10" />
                  </div>
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="user">User Management</SelectItem>
                    <SelectItem value="content">Content Moderation</SelectItem>
                    <SelectItem value="system">System Settings</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Entries */}
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-lg">
                        {getCategoryIcon(log.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{log.action.replace(/_/g, " ")}</h3>
                          <Badge className={getSeverityColor(log.severity)}>{log.severity.toUpperCase()}</Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(log.status)}
                            <span className="text-sm text-gray-500 capitalize">{log.status}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{log.details}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Admin: {log.admin}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{log.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>IP: {log.ipAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>ID: {log.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent">
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>

                  {/* Target Information */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Target: </span>
                        <span className="text-sm text-gray-900">{log.target}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {log.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Changes Information */}
                  {log.changes && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Changes Made:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-50 rounded-lg p-3">
                          <h5 className="font-medium text-red-800 mb-2">Before:</h5>
                          <pre className="text-xs text-red-700 whitespace-pre-wrap">
                            {JSON.stringify(log.changes.before, null, 2)}
                          </pre>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <h5 className="font-medium text-green-800 mb-2">After:</h5>
                          <pre className="text-xs text-green-700 whitespace-pre-wrap">
                            {JSON.stringify(log.changes.after, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Metadata */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>User Agent: {log.userAgent}</span>
                      <span>Admin ID: {log.adminId}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#a41a2f]">User Management Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs
                  .filter((log) => log.category === "User Management")
                  .map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback className="bg-[#a41a2f] text-white text-xs">
                            {log.admin
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm">{log.action.replace(/_/g, " ")}</div>
                          <div className="text-xs text-gray-500">
                            {log.admin} • {log.timestamp}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                        {getStatusIcon(log.status)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#a41a2f]">
                <Shield className="w-5 h-5" />
                Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs
                  .filter((log) => log.category === "Authentication" || log.severity === "high")
                  .map((log) => (
                    <div key={log.id} className="border-l-4 border-red-500 pl-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-red-800">{log.action.replace(/_/g, " ")}</div>
                        <Badge className="bg-red-100 text-red-800">{log.severity.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{log.details}</p>
                      <div className="text-xs text-gray-500">
                        {log.admin} • {log.timestamp} • IP: {log.ipAddress}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#a41a2f]">
                <XCircle className="w-5 h-5" />
                Failed Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs
                  .filter((log) => log.status === "failed")
                  .map((log) => (
                    <div key={log.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-red-800">{log.action.replace(/_/g, " ")}</div>
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-sm text-red-700 mb-2">{log.details}</p>
                      <div className="text-xs text-red-600">
                        {log.admin} • {log.timestamp} • IP: {log.ipAddress}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Showing 1-6 of 1,247 audit logs</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-[#a41a2f] text-white">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
