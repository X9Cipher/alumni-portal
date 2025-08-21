import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Send, MoreVertical, Phone, Video, Star, Archive, Users, MessageSquare, Filter } from "lucide-react"

export default function Messages() {
  const conversations = [
    {
      id: 1,
      name: "Sarah Mitchell",
      lastMessage: "Thanks for the referral! I got the interview.",
      time: "2m ago",
      unread: 2,
      online: true,
      avatar: "/placeholder.svg?height=40&width=40",
      type: "alumni",
      company: "Google",
      isStarred: true,
      isPriority: true,
    },
    {
      id: 2,
      name: "Tech Alumni Group",
      lastMessage: "Alex: Anyone interested in the startup event?",
      time: "1h ago",
      unread: 0,
      online: false,
      avatar: "/placeholder.svg?height=40&width=40",
      isGroup: true,
      members: 45,
      isStarred: false,
      isPriority: false,
    },
    {
      id: 3,
      name: "Raj Kumar",
      lastMessage: "Let's schedule a call to discuss the opportunity",
      time: "3h ago",
      unread: 1,
      online: true,
      avatar: "/placeholder.svg?height=40&width=40",
      type: "alumni",
      company: "TechStart Inc.",
      isStarred: false,
      isPriority: true,
    },
    {
      id: 4,
      name: "Lisa Park",
      lastMessage: "Great meeting you at the event yesterday!",
      time: "1d ago",
      unread: 0,
      online: false,
      avatar: "/placeholder.svg?height=40&width=40",
      type: "alumni",
      company: "Netflix",
      isStarred: true,
      isPriority: false,
    },
    {
      id: 5,
      name: "Career Mentors",
      lastMessage: "New mentorship opportunities available",
      time: "2d ago",
      unread: 3,
      online: false,
      avatar: "/placeholder.svg?height=40&width=40",
      isGroup: true,
      members: 23,
      isStarred: false,
      isPriority: false,
    },
  ]

  const currentMessages = [
    {
      id: 1,
      sender: "Sarah Mitchell",
      message: "Hi John! I hope you're doing well.",
      time: "10:30 AM",
      isMe: false,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      sender: "Me",
      message: "Hey Sarah! I'm great, thanks for asking. How's the new job at Google?",
      time: "10:32 AM",
      isMe: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      sender: "Sarah Mitchell",
      message:
        "It's been amazing! The team is fantastic and I'm learning so much. Actually, I wanted to thank you for that referral you gave me last year.",
      time: "10:35 AM",
      isMe: false,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      sender: "Me",
      message: "That's wonderful to hear! I'm so glad it worked out. You deserved that opportunity.",
      time: "10:37 AM",
      isMe: true,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      sender: "Sarah Mitchell",
      message: "Thanks for the referral! I got the interview.",
      time: "10:40 AM",
      isMe: false,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const quickStats = [
    { label: "Total Conversations", value: 24 },
    { label: "Unread Messages", value: 6 },
    { label: "Alumni Connections", value: 18 },
    { label: "Group Chats", value: 5 },
  ]

  const suggestedConnections = [
    {
      name: "Alex Morgan",
      title: "Product Manager at Meta",
      mutualConnections: 12,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Emily Rodriguez",
      title: "Engineering Manager at Tesla",
      mutualConnections: 8,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Message Stats */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Message Stats
                </h3>
                <div className="space-y-3">
                  {quickStats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className="font-semibold text-blue-600">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    New Group Chat
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Star className="w-4 h-4 mr-2" />
                    Starred Messages
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Archive className="w-4 h-4 mr-2" />
                    Archived Chats
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Message Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Messaging Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-blue-800">💬 Messaging Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Be professional and respectful</li>
                  <li>• Introduce yourself clearly</li>
                  <li>• Be specific about your requests</li>
                  <li>• Follow up appropriately</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="h-[calc(100vh-8rem)]">
              <div className="flex h-full gap-6">
                {/* Conversations List */}
                <div className="w-1/2">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Messages</CardTitle>
                        <Button size="sm">New Chat</Button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Search conversations..." className="pl-10" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                      <Tabs defaultValue="all" className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-4 mx-4">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="alumni">Alumni</TabsTrigger>
                          <TabsTrigger value="starred">Starred</TabsTrigger>
                          <TabsTrigger value="archived">Archived</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="flex-1 overflow-y-auto mt-4">
                          <div className="space-y-1">
                            {conversations.map((conversation) => (
                              <div
                                key={conversation.id}
                                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                                  conversation.id === 1 ? "border-blue-500 bg-blue-50" : "border-transparent"
                                } ${conversation.isPriority ? "bg-yellow-50" : ""}`}
                              >
                                <div className="relative">
                                  <Avatar>
                                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>
                                      {conversation.isGroup
                                        ? "GC"
                                        : conversation.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  {conversation.online && !conversation.isGroup && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-sm truncate">{conversation.name}</h4>
                                      {conversation.isStarred && (
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      )}
                                      {conversation.isPriority && (
                                        <Badge variant="outline" className="text-xs">
                                          Priority
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">{conversation.time}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2">
                                      {conversation.type === "alumni" && (
                                        <Badge variant="outline" className="text-xs">
                                          Alumni
                                        </Badge>
                                      )}
                                      {conversation.isGroup && (
                                        <Badge variant="outline" className="text-xs">
                                          {conversation.members} members
                                        </Badge>
                                      )}
                                      {conversation.company && (
                                        <span className="text-xs text-gray-500">{conversation.company}</span>
                                      )}
                                    </div>
                                    {conversation.unread > 0 && (
                                      <Badge className="bg-blue-600 text-white text-xs">{conversation.unread}</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="alumni" className="flex-1 overflow-y-auto mt-4">
                          <div className="space-y-1">
                            {conversations
                              .filter((c) => c.type === "alumni")
                              .map((conversation) => (
                                <div
                                  key={conversation.id}
                                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                                >
                                  <Avatar>
                                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>
                                      {conversation.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm">{conversation.name}</h4>
                                    <p className="text-xs text-gray-500">{conversation.company}</p>
                                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="starred" className="flex-1 overflow-y-auto mt-4">
                          <div className="space-y-1">
                            {conversations
                              .filter((c) => c.isStarred)
                              .map((conversation) => (
                                <div
                                  key={conversation.id}
                                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                                >
                                  <Avatar>
                                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>
                                      {conversation.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-sm">{conversation.name}</h4>
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="archived" className="flex-1 overflow-y-auto mt-4">
                          <div className="text-center py-8">
                            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Archived Chats</h3>
                            <p className="text-gray-600">Archived conversations will appear here</p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                {/* Chat Area */}
                <div className="flex-1">
                  <Card className="h-full flex flex-col">
                    {/* Chat Header */}
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback>SM</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">Sarah Mitchell</h3>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-500">Senior Software Engineer at Google</p>
                              <Badge variant="outline" className="text-xs">
                                Alumni
                              </Badge>
                            </div>
                            <p className="text-xs text-green-600">Online</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Star className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="flex-1 p-4 overflow-y-auto">
                      <div className="space-y-4">
                        {currentMessages.map((message) => (
                          <div key={message.id} className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`flex gap-3 max-w-xs lg:max-w-md ${message.isMe ? "flex-row-reverse" : ""}`}
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {message.isMe
                                    ? "Me"
                                    : message.sender
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`px-4 py-2 rounded-lg ${
                                  message.isMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-xs mt-1 ${message.isMe ? "text-blue-100" : "text-gray-500"}`}>
                                  {message.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Type a message..." className="flex-1" />
                        <Button size="icon">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>💡 Tip: Be professional when messaging alumni</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Suggested Connections */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Start New Conversations
                </h3>
                <div className="space-y-3">
                  {suggestedConnections.map((person, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={person.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {person.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{person.name}</h4>
                        <p className="text-xs text-gray-600 truncate">{person.title}</p>
                        <p className="text-xs text-gray-500">{person.mutualConnections} mutual connections</p>
                        <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                          Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  Find More Alumni
                </Button>
              </CardContent>
            </Card>

            {/* Message Guidelines */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-green-800">📋 Message Guidelines</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Introduce yourself clearly</li>
                  <li>• Mention your college connection</li>
                  <li>• Be specific about your request</li>
                  <li>• Respect their time and expertise</li>
                  <li>• Follow up appropriately</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
