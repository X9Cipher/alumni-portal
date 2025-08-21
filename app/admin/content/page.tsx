"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  Flag,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  MessageSquare,
  ImageIcon,
  Video,
  Link,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuditLogger } from "@/hooks/use-audit-logger"

export default function ContentModeration() {
  const { logContentAction } = useAuditLogger()

  const handleContentAction = (action: string, content: any) => {
    logContentAction(
      action,
      content.title || `${content.type} by ${content.author}`,
      content.id.toString(),
      `${action.replace("_", " ").toLowerCase()} content: ${content.title || content.type}`,
      {
        before: { status: content.status },
        after: {
          status: action === "APPROVE_CONTENT" ? "approved" : action === "REJECT_CONTENT" ? "rejected" : content.status,
        },
      },
      action === "DELETE_CONTENT" ? "high" : "medium",
    )
  }

  const contentItems = [
    {
      id: 1,
      type: "Post",
      title: "My Journey from Student to Software Engineer",
      content:
        "I wanted to share my experience transitioning from college to my first job at Google. The journey wasn't easy, but with persistence and the right mentorship...",
      author: "Sarah Mitchell",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      authorType: "Alumni",
      timestamp: "2024-01-15 2:30 PM",
      status: "Published",
      category: "Career",
      likes: 45,
      comments: 12,
      shares: 8,
      reports: 0,
      flagged: false,
      hasImage: true,
      hasVideo: false,
      hasLink: true,
      priority: "Normal",
    },
    {
      id: 2,
      type: "Comment",
      title: "Re: Internship Opportunities at Netflix",
      content:
        "This is amazing! I've been looking for opportunities in the entertainment industry. Would love to connect and learn more about your experience...",
      author: "John Doe",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      authorType: "Student",
      timestamp: "2024-01-14 4:45 PM",
      status: "Published",
      category: "Networking",
      likes: 8,
      comments: 3,
      shares: 1,
      reports: 0,
      flagged: false,
      hasImage: false,
      hasVideo: false,
      hasLink: false,
      priority: "Normal",
    },
    {
      id: 3,
      type: "Post",
      title: "Inappropriate Content Warning",
      content:
        "This post contains content that may violate community guidelines regarding professional conduct and appropriate language...",
      author: "Anonymous User",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      authorType: "Unknown",
      timestamp: "2024-01-13 11:20 AM",
      status: "Flagged",
      category: "Report",
      likes: 0,
      comments: 0,
      shares: 0,
      reports: 5,
      flagged: true,
      hasImage: false,
      hasVideo: false,
      hasLink: false,
      priority: "High",
    },
    {
      id: 4,
      type: "Event Post",
      title: "Tech Career Fair 2024 - Registration Open",
      content:
        "Excited to announce our annual tech career fair! Join us for networking opportunities with top companies including Google, Microsoft, Netflix, and more...",
      author: "David Chen",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      authorType: "Alumni",
      timestamp: "2024-01-12 9:15 AM",
      status: "Pending",
      category: "Event",
      likes: 23,
      comments: 7,
      shares: 15,
      reports: 0,
      flagged: false,
      hasImage: true,
      hasVideo: true,
      hasLink: true,
      priority: "Normal",
    },
    {
      id: 5,
      type: "Job Post",
      title: "Senior Software Engineer - Remote",
      content:
        "We're hiring a senior software engineer to join our growing team. This is a fully remote position with competitive salary and excellent benefits...",
      author: "Lisa Park",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      authorType: "Alumni",
      timestamp: "2024-01-11 1:30 PM",
      status: "Published",
      category: "Job",
      likes: 67,
      comments: 23,
      shares: 34,
      reports: 1,
      flagged: false,
      hasImage: false,
      hasVideo: false,
      hasLink: true,
      priority: "Normal",
    },
  ]

  const stats = [
    { title: "Total Content", value: "8,456", change: "+18%", icon: FileText, color: "text-[#a41a2f]" },
    { title: "Pending Review", value: "23", change: "-12%", icon: Clock, color: "text-yellow-600" },
    { title: "Flagged Content", value: "8", change: "-25%", icon: AlertTriangle, color: "text-red-600" },
    { title: "Engagement Rate", value: "92%", change: "+8%", icon: TrendingUp, color: "text-green-600" },
  ]

  const moderationRules = [
    {
      id: 1,
      rule: "No Spam or Self-Promotion",
      description: "Content should not be primarily promotional or spam-like",
      violations: 12,
      severity: "Medium",
    },
    {
      id: 2,
      rule: "Professional Language Only",
      description: "All content must maintain professional standards",
      violations: 5,
      severity: "High",
    },
    {
      id: 3,
      rule: "No Inappropriate Content",
      description: "Content must be appropriate for professional networking",
      violations: 3,
      severity: "High",
    },
    {
      id: 4,
      rule: "Accurate Information",
      description: "All shared information must be factual and verifiable",
      violations: 8,
      severity: "Medium",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#a41a2f] mb-2">Content Moderation</h1>
          <p className="text-gray-600">Monitor, review, and moderate user-generated content across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
          <Button className="bg-[#a41a2f] hover:bg-red-700">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Review Queue
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
            All Content
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Pending
          </TabsTrigger>
          <TabsTrigger value="flagged" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Flagged
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Reports
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-[#a41a2f] data-[state=active]:text-white">
            Rules
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
                    <Input placeholder="Search content by title, author, or keywords..." className="pl-10" />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                    <SelectItem value="job">Job Posts</SelectItem>
                    <SelectItem value="event">Event Posts</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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

          {/* Content List */}
          <div className="space-y-4">
            {contentItems.map((item) => (
              <Card
                key={item.id}
                className={`hover:shadow-lg transition-shadow ${item.flagged ? "border-red-200 bg-red-50" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={item.authorAvatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-[#a41a2f] text-white">
                          {item.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{item.author}</span>
                          <Badge
                            variant="outline"
                            className={
                              item.authorType === "Alumni"
                                ? "border-blue-200 text-blue-700"
                                : item.authorType === "Student"
                                  ? "border-green-200 text-green-700"
                                  : "border-gray-200 text-gray-700"
                            }
                          >
                            {item.authorType}
                          </Badge>
                          <Badge variant="outline" className="border-purple-200 text-purple-700">
                            {item.type}
                          </Badge>
                          {item.priority === "High" && <Badge className="bg-red-100 text-red-800">High Priority</Badge>}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.content}</p>

                        <div className="flex items-center gap-4 mb-3">
                          {item.hasImage && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <ImageIcon className="w-3 h-3" />
                              <span>Image</span>
                            </div>
                          )}
                          {item.hasVideo && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Video className="w-3 h-3" />
                              <span>Video</span>
                            </div>
                          )}
                          {item.hasLink && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Link className="w-3 h-3" />
                              <span>Link</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.timestamp}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          item.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.status === "Flagged"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.status}
                      </Badge>
                      {item.flagged && <Flag className="w-4 h-4 text-red-500" />}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Content
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Author Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Engagement</DropdownMenuItem>
                          {item.status === "Pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleContentAction("APPROVE_CONTENT", item)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleContentAction("REJECT_CONTENT", item)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-yellow-600"
                            onClick={() => handleContentAction("FLAG_CONTENT", item)}
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Flag Content
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleContentAction("DELETE_CONTENT", item)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Content
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span className="font-medium">{item.likes}</span>
                        <span>likes</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{item.comments}</span>
                        <span>comments</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span className="font-medium">{item.shares}</span>
                        <span>shares</span>
                      </div>
                      {item.reports > 0 && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">{item.reports}</span>
                          <span>reports</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#a41a2f] flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Review ({contentItems.filter((c) => c.status === "Pending").length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentItems
                  .filter((c) => c.status === "Pending")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={item.authorAvatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-yellow-500 text-white">
                            {item.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-yellow-800">{item.title}</div>
                          <div className="text-sm text-yellow-600">
                            By: {item.author} • {item.type}
                          </div>
                          <div className="text-xs text-yellow-500">{item.timestamp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-600 bg-transparent"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#a41a2f] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Flagged Content ({contentItems.filter((c) => c.flagged).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentItems
                  .filter((c) => c.flagged)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={item.authorAvatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-red-500 text-white">
                            {item.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-red-800">{item.title}</div>
                          <div className="text-sm text-red-600">
                            By: {item.author} • {item.reports} reports
                          </div>
                          <div className="text-xs text-red-500">{item.timestamp}</div>
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

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#a41a2f]">Community Guidelines & Moderation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {moderationRules.map((rule) => (
                    <div key={rule.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{rule.rule}</h3>
                        <Badge
                          className={
                            rule.severity === "High"
                              ? "bg-red-100 text-red-800"
                              : rule.severity === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {rule.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">{rule.violations} violations this month</div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-50 hover:text-[#a41a2f] bg-transparent"
                        >
                          Edit Rule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Add New Moderation Rule</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                      <Input placeholder="Enter rule name..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <Textarea placeholder="Describe the rule and its purpose..." rows={3} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="bg-[#a41a2f] hover:bg-red-700 mt-6">Add Rule</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#a41a2f]">Content by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "Posts", count: 3456, percentage: 75 },
                    { type: "Comments", count: 2134, percentage: 46 },
                    { type: "Job Posts", count: 567, percentage: 12 },
                    { type: "Event Posts", count: 234, percentage: 5 },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.type}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-[#a41a2f] h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#a41a2f]">Moderation Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Approved", count: 1234 },
                    { action: "Flagged", count: 45 },
                    { action: "Rejected", count: 23 },
                    { action: "Deleted", count: 12 },
                    { action: "Warnings Issued", count: 8 },
                  ].map((item) => (
                    <div key={item.action} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.action}</span>
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
