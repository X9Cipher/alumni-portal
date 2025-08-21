"use client"

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
  MoreHorizontal,
  Download,
  Eye,
  Flag,
  Trash2,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuditLogger } from "@/hooks/use-audit-logger"

export default function MessagesManagement() {
  const { logContentAction } = useAuditLogger()

  const handleMessageAction = (action: string, message: any) => {
    logContentAction(
      action,
      `Message from ${message.sender}`,
      message.id.toString(),
      `${action.replace("_", " ").toLowerCase()} message from ${message.sender}`,
      {
        before: { status: message.status },
        after: {
          status: action === "FLAG_MESSAGE" ? "flagged" : action === "DELETE_MESSAGE" ? "deleted" : message.status,
        },
      },
      action === "DELETE_MESSAGE" ? "high" : "medium",
    )
  }

  const messages = [
    {
      id: 1,
      sender: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      senderType: "Student",
      recipient: "Sarah Mitchell",
      recipientAvatar: "/placeholder.svg?height=40&width=40",
      recipientType: "Alumni",
      subject: "Internship Opportunity Inquiry",
      content:
        "Hi Sarah, I saw your profile and I'm very interested in learning more about your experience at Google. I'm currently looking for internship opportunities...",
      timestamp: "2024-01-15 10:30 AM",
      status: "Delivered",
      priority: "Normal",
      category: "Career",
      flagged: false,
      read: true,
      replied: false,
    },
    {
      id: 2,
      sender: "Emma Wilson",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      senderType: "Student",
      recipient: "David Chen",
      recipientAvatar: "/placeholder.svg?height=40&width=40",
      recipientType: "Alumni",
      subject: "Networking Event Follow-up",
      content:
        "Thank you for the great conversation at the networking event last week. I'd love to continue our discussion about product management...",
      timestamp: "2024-01-14 3:45 PM",
      status: "Read",
      priority: "Normal",
      category: "Networking",
      flagged: false,
      read: true,
      replied: true,
    },
    {
      id: 3,
      sender: "Anonymous User",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      senderType: "Unknown",
      recipient: "Lisa Park",
      recipientAvatar: "/placeholder.svg?height=40&width=40",
      recipientType: "Alumni",
      subject: "Inappropriate Content",
      content: "This message contains inappropriate content that violates community guidelines...",
      timestamp: "2024-01-13 11:20 AM",
      status: "Flagged",
      priority: "High",
      category: "Report",
      flagged: true,
      read: false,
      replied: false,
    },
    {
      id: 4,
      sender: "Michael Rodriguez",
      senderAvatar: "/placeholder.svg?height=40&width=40",
      senderType: "Alumni",
      recipient: "Student Group",
      recipientAvatar: "/placeholder.svg?height=40&width=40",
      recipientType: "Group",
      subject: "Mentorship Program Announcement",
      content:
        "I'm excited to announce the launch of our new mentorship program. This initiative will connect experienced alumni with current students...",
      timestamp: "2024-01-12 9:15 AM",
      status: "Delivered",
      priority: "Normal",
      category: "Announcement",
      flagged: false,
      read: true,
      replied: false,
    },
  ]

  const stats = [
    { title: "Total Messages", value: "12,456", change: "+15%", icon: MessageSquare, color: "text-[#a41a2f]" },
    { title: "Active Conversations", value: "3,234", change: "+22%", icon: TrendingUp, color: "text-green-600" },
    { title: "Flagged Messages", value: "23", change: "-8%", icon: AlertTriangle, color: "text-red-600" },
    { title: "Response Rate", value: "87%", change: "+5%", icon: CheckCircle, color: "text-blue-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#a41a2f] mb-2">Messages Management</h1>
          <p className="text-gray-600">Monitor communications, moderate content, and ensure platform safety</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Messages
          </Button>
          <Button className="bg-[#a41a2f] hover:bg-red-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Announcement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#a41a2f]">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                  <div className={`text-sm font-medium ${stat.color}`}>{stat.change} from last month</div>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            All Messages
          </TabsTrigger>
          <TabsTrigger value="flagged" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Flagged
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="conversations"
            className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white"
          >
            Conversations
          </TabsTrigger>
          <TabsTrigger
            value="announcements"
            className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white"
          >
            Announcements
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search messages by sender, recipient, or content..." className="pl-10" />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Message Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          <div className="space-y-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`hover:shadow-lg transition-shadow ${message.flagged ? "border-red-200 bg-red-50" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-[#a41a2f] text-white">
                          {message.sender
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{message.sender}</span>
                          <Badge
                            variant="outline"
                            className={
                              message.senderType === "Alumni"
                                ? "border-blue-200 text-blue-700"
                                : message.senderType === "Student"
                                  ? "border-green-200 text-green-700"
                                  : "border-gray-200 text-gray-700"
                            }
                          >
                            {message.senderType}
                          </Badge>
                          <span className="text-sm text-gray-500">→</span>
                          <span className="font-medium">{message.recipient}</span>
                          <Badge
                            variant="outline"
                            className={
                              message.recipientType === "Alumni"
                                ? "border-blue-200 text-blue-700"
                                : message.recipientType === "Student"
                                  ? "border-green-200 text-green-700"
                                  : "border-purple-200 text-purple-700"
                            }
                          >
                            {message.recipientType}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{message.subject}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{message.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{message.timestamp}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {message.category}
                          </Badge>
                          {message.priority === "High" && (
                            <Badge className="bg-red-100 text-red-800 text-xs">High Priority</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          message.status === "Read"
                            ? "bg-green-100 text-green-800"
                            : message.status === "Delivered"
                              ? "bg-blue-100 text-blue-800"
                              : message.status === "Flagged"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }
                      >
                        {message.status}
                      </Badge>
                      {message.flagged && <Flag className="w-4 h-4 text-red-500" />}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Conversation</DropdownMenuItem>
                          <DropdownMenuItem>Contact Sender</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-yellow-600"
                            onClick={() => handleMessageAction("FLAG_MESSAGE", message)}
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Flag Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleMessageAction("DELETE_MESSAGE", message)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      {message.read && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>Read</span>
                        </div>
                      )}
                      {message.replied && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <MessageSquare className="w-3 h-3" />
                          <span>Replied</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent"
                      >
                        View Thread
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#a41a2f] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Flagged Messages ({messages.filter((m) => m.flagged).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages
                  .filter((m) => m.flagged)
                  .map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-red-500 text-white">
                            {message.sender
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-red-800">{message.subject}</div>
                          <div className="text-sm text-red-600">
                            From: {message.sender} → {message.recipient}
                          </div>
                          <div className="text-xs text-red-500">{message.timestamp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">Flagged</Badge>
                        <Button size="sm" variant="outline" className="hover:bg-red-100 bg-transparent">
                          Review
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          Take Action
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#a41a2f]">Active Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">3,234</div>
                  <div className="text-sm text-gray-600">Active Conversations</div>
                  <div className="text-xs text-blue-500">+22% this month</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                  <div className="text-xs text-green-500">+5% improvement</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">2.3h</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                  <div className="text-xs text-purple-500">-15% faster</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Recent Conversations</h3>
                {messages
                  .filter((m) => m.replied)
                  .map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          <Avatar className="w-8 h-8 border-2 border-white">
                            <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-[#a41a2f] text-white text-xs">
                              {message.sender
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="w-8 h-8 border-2 border-white">
                            <AvatarImage src={message.recipientAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {message.recipient
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {message.sender} ↔ {message.recipient}
                          </div>
                          <div className="text-sm text-gray-500">{message.subject}</div>
                          <div className="text-xs text-gray-400">Last message: {message.timestamp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent"
                        >
                          View Thread
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#a41a2f]">Messages by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: "Career", count: 456, percentage: 65 },
                    { category: "Networking", count: 234, percentage: 42 },
                    { category: "Announcement", count: 123, percentage: 28 },
                    { category: "Report", count: 23, percentage: 8 },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-[#a41a2f] h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#a41a2f]">Communication Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { pattern: "Student → Alumni", count: 567 },
                    { pattern: "Alumni → Student", count: 234 },
                    { pattern: "Alumni → Alumni", count: 189 },
                    { pattern: "Student → Student", count: 123 },
                    { pattern: "Group Messages", count: 89 },
                  ].map((item) => (
                    <div key={item.pattern} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.pattern}</span>
                      <Badge variant="outline" className="border-[#a41a2f] text-[#a41a2f]">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
