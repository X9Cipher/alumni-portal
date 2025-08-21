"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMessaging } from '@/hooks/use-messaging'
import { useAuth } from '@/hooks/use-auth'
import { Message, Conversation } from '@/lib/models/Message'
import { Connection } from '@/lib/models/Connection'
import { User } from '@/lib/models/User'
import { useSearchParams } from 'next/navigation'
import { 
  Send, 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Users, 
  UserPlus,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { UserSearch } from '@/components/user-search'

interface ExtendedUser {
  _id?: string
  firstName?: string
  lastName?: string
  fullName: string
  email?: string
  userType?: 'student' | 'alumni' | 'admin'
  department?: string
  currentCompany?: string
  currentRole?: string
  graduationYear?: number
  currentYear?: number
  linkedinUrl?: string
  profilePicture?: string
  isOnline?: boolean
}

function StudentMessagesContent() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingConnections, setPendingConnections] = useState<any[]>([])
  const [availableUsers, setAvailableUsers] = useState<ExtendedUser[]>([])
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Get current user from auth context
  const { user: currentUser, loading: userLoading } = useAuth()

  const { 
    socket, 
    isConnected, 
    messages, 
    conversations, 
    sendMessage, 
    markAsRead, 
    markConversationAsRead,
    error,
    clearError,
    setMessages,
    loadMessages
  } = useMessaging({
    userId: currentUser?._id,
    userType: currentUser?.userType as 'student' | 'alumni' | undefined,
  })

  // Handle URL parameters to open specific chat
  useEffect(() => {
    const userId = searchParams?.get('user')
    const userType = searchParams?.get('type')
    
    if (userId && userType && availableUsers.length > 0) {
      console.log('StudentMessages: URL params detected:', { userId, userType })
      
      // Find the user in available users
      const targetUser = availableUsers.find(user => 
        user._id?.toString() === userId && user.userType === userType
      )
      
      if (targetUser) {
        console.log('StudentMessages: Found target user:', targetUser)
        setSelectedUser(targetUser)
        setShowNewChat(true)
        
        // Load existing messages with this user
        loadMessages(userId)
        
        // Find existing conversation or create new one
        const existingConversation = conversations.find(conv => 
          conv.participants.some(p => p.toString() === userId)
        )
        
        if (existingConversation) {
          setSelectedConversation(existingConversation)
        }
      }
    }
  }, [searchParams, availableUsers, conversations, loadMessages])

  // Debug logging
  useEffect(() => {
    console.log('StudentMessages: currentUser changed:', currentUser?._id, currentUser?.userType)
  }, [currentUser])

  // Debug logging for messages
  useEffect(() => {
    console.log('StudentMessages: messages array updated:', messages)
    console.log('StudentMessages: currentUser._id:', currentUser?._id)
    console.log('StudentMessages: selectedUser._id:', selectedUser?._id)
    
    // Log the structure of the first few messages to debug
    if (messages.length > 0) {
      console.log('StudentMessages: First message structure:', {
        message: messages[0],
        senderId: messages[0].senderId,
        recipientId: messages[0].recipientId,
        senderIdType: typeof messages[0].senderId,
        recipientIdType: typeof messages[0].recipientId
      })
    }
  }, [messages, currentUser, selectedUser])

  useEffect(() => {
    if (currentUser) {
      loadConnections()
      loadPendingConnections()
      loadAvailableUsers()
    }
  }, [currentUser])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      })
      clearError()
    }
  }, [error, toast, clearError])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      console.log('StudentMessages: Auto-scroll triggered, messages count:', messages.length)
      
      if (scrollAreaRef.current) {
        console.log('StudentMessages: scrollAreaRef found, scrolling to bottom')
        console.log('StudentMessages: Current scrollTop:', scrollAreaRef.current.scrollTop, 'scrollHeight:', scrollAreaRef.current.scrollHeight)
        
        // Simple scroll to bottom
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      } else {
        console.log('StudentMessages: scrollAreaRef not found')
      }
    }
    
    // Use multiple timeouts to ensure DOM is updated
    setTimeout(scrollToBottom, 100)
    setTimeout(scrollToBottom, 300)
  }, [messages])

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/connections?type=accepted')
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
    }
  }

  const loadPendingConnections = async () => {
    try {
      const response = await fetch('/api/connections?type=pending&withUserInfo=true')
      if (response.ok) {
        const data = await response.json()
        setPendingConnections(data.connections || [])
        
        // Also load sent pending requests
        const sentResponse = await fetch('/api/connections?type=pending')
        if (sentResponse.ok) {
          const sentData = await sentResponse.json()
          const sentRequests = sentData.connections
            .filter((conn: any) => conn.requesterId.toString() === currentUser?._id)
            .map((conn: any) => conn.recipientId.toString())
          setPendingRequests(new Set(sentRequests))
        }
      }
    } catch (error) {
      console.error('Failed to load pending connections:', error)
    }
  }

  const loadUserInfo = async (userId: string): Promise<ExtendedUser | null> => {
    try {
      // Try to find in available users first
      const existingUser = availableUsers.find(u => u._id?.toString() === userId)
      if (existingUser) return existingUser
      
      // If not found, try to fetch from API
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        return userData.user
      }
      
      return null
    } catch (error) {
      console.error('Failed to load user info:', error)
      return null
    }
  }

  const loadAvailableUsers = async () => {
    try {
      // Load both students and alumni for complete user coverage
      const [studentsResponse, alumniResponse] = await Promise.all([
        fetch('/api/student/directory'),
        fetch('/api/alumni/directory')
      ])
      
      let allUsers: ExtendedUser[] = []
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        allUsers = [...allUsers, ...(studentsData.students || [])]
      }
      
      if (alumniResponse.ok) {
        const alumniData = await alumniResponse.json()
        allUsers = [...allUsers, ...(alumniData.alumni || [])]
      }
      
      console.log('StudentMessages: Loaded all available users:', allUsers)
      setAvailableUsers(allUsers)
    } catch (error) {
      console.error('Failed to load available users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return

    try {
      // Check if this is a student trying to message an alumni
      if (currentUser?.userType === 'student' && selectedUser.userType === 'alumni') {
        // Check if they have an accepted connection
        const hasConnection = await checkConnectionStatus(selectedUser._id!.toString())
        
        if (!hasConnection) {
          // Send connection request with initial message
          const response = await fetch('/api/messages/connection-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientId: selectedUser._id!.toString(),
              content: messageInput,
              messageType: 'text'
            })
          })

          if (response.ok) {
            toast({
              title: "Connection Request Sent",
              description: "Your message has been sent with a connection request. You'll be able to message freely once the alumni accepts your request.",
            })
            setMessageInput('')
            // Add to pending requests
            setPendingRequests(prev => new Set(prev).add(selectedUser._id!.toString()))
            loadConnections()
            loadPendingConnections()
            return
          } else {
            const errorData = await response.json()
            toast({
              title: "Error",
              description: errorData.error || "Failed to send connection request",
              variant: "destructive"
            })
            return
          }
        }
      }

      // Regular message sending for connected users or other scenarios
      await sendMessage(selectedUser._id!.toString(), messageInput)
      setMessageInput('')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  // Helper function to check connection status
  const checkConnectionStatus = async (otherUserId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/connections/status?userId=${otherUserId}`)
      if (response.ok) {
        const data = await response.json()
        return data.status === 'accepted'
      }
      return false
    } catch (error) {
      console.error('Failed to check connection status:', error)
      return false
    }
  }

  const handleSendConnectionRequest = async (recipientId: string) => {
    if (!currentUser) return
    
    // Prevent self-connections
    if (recipientId === currentUser._id) {
      toast({
        title: "Error",
        description: "Cannot send connection request to yourself",
        variant: "destructive"
      })
      return
    }

    // Get recipient user type to check if they're alumni
    try {
      const userResponse = await fetch(`/api/users/${recipientId}`)
      if (!userResponse.ok) {
        toast({
          title: "Error",
          description: "Could not verify user type",
          variant: "destructive"
        })
        return
      }
      
      const userData = await userResponse.json()
      if (userData.user.userType !== 'alumni') {
        toast({
          title: "Error",
          description: "Students can only send connection requests to alumni",
          variant: "destructive"
        })
        return
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not verify user type",
        variant: "destructive"
      })
      return
    }
    
    try {
      console.log('🎓 Student sending connection request to:', recipientId)
      
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          recipientType: 'alumni'
        })
      })

      console.log('🎓 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🎓 Success response:', data)
        // Add to pending requests
        setPendingRequests(prev => new Set(prev).add(recipientId))
        toast({
          title: "Connection Request Sent",
          description: "Your connection request has been sent successfully.",
        })
        loadConnections()
        loadPendingConnections()
      } else {
        const error = await response.json()
        console.log('🎓 Error response:', error)
        toast({
          title: "Error",
          description: error.error || "Failed to send connection request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.log('🎓 Request failed:', error)
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      })
    }
  }

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          status: 'accepted'
        })
      })

      if (response.ok) {
        // Remove from pending requests if it was there
        const connection = await response.json()
        if (connection.connection && currentUser?._id) {
          const otherUserId = connection.connection.requesterId.toString() === currentUser._id 
            ? connection.connection.recipientId.toString() 
            : connection.connection.requesterId.toString()
          setPendingRequests(prev => {
            const newSet = new Set(prev)
            newSet.delete(otherUserId)
            return newSet
          })
        }
        toast({
          title: "Connection Accepted",
          description: "You can now message this user.",
        })
        loadConnections()
        loadPendingConnections()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive"
      })
    }
  }

  const handleRejectConnection = async (connectionId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          status: 'rejected'
        })
      })

      if (response.ok) {
        // Remove from pending requests if it was there
        const connection = await response.json()
        if (connection.connection && currentUser?._id) {
          const otherUserId = connection.connection.requesterId.toString() === currentUser._id 
            ? connection.connection.requesterId.toString() 
            : connection.connection.recipientId.toString()
          setPendingRequests(prev => {
            const newSet = new Set(prev)
            newSet.delete(otherUserId)
            return newSet
          })
        }
        toast({
          title: "Connection Rejected",
          description: "Connection request has been rejected.",
        })
        loadConnections()
        loadPendingConnections()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject connection",
        variant: "destructive"
      })
    }
  }

  const getConnectionStatus = (userId: string) => {
    return connections.find(conn => 
      conn.requesterId.toString() === userId || 
      conn.recipientId.toString() === userId
    )
  }

  const isConnectionRequestPending = (userId: string) => {
    return pendingRequests.has(userId)
  }

  const canMessage = (userId: string) => {
    const connection = getConnectionStatus(userId)
    return connection?.status === 'accepted'
  }

  const handleConnectRequest = async (userId: string, userType: 'student' | 'alumni') => {
    console.log('🎓 handleConnectRequest called with:', userId, userType);
    console.log('🎓 currentUser:', currentUser);
    
    if (!currentUser) {
      console.log('🎓 No currentUser, returning early');
      return
    }
    
    // Prevent self-connections
    if (userId === currentUser._id) {
      toast({
        title: "Error",
        description: "Cannot send connection request to yourself",
        variant: "destructive"
      })
      return
    }
    
    try {
      console.log('🎓 Student UserSearch sending connection request to:', userId, userType)
      
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: userId,
          recipientType: userType
        })
      })

      console.log('🎓 UserSearch Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🎓 UserSearch Success response:', data)
        // Add to pending requests
        setPendingRequests(prev => new Set(prev).add(userId))
        toast({
          title: "Success",
          description: "Connection request sent successfully",
        })
        loadConnections()
        loadPendingConnections()
      } else {
        const error = await response.json()
        console.log('🎓 UserSearch Error response:', error)
        toast({
          title: "Error",
          description: error.error || "Failed to send connection request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('🎓 UserSearch Request failed:', error)
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      })
    }
  }

  const handleUserSelect = (user: any) => {
    // Handle user selection for messaging
    setSelectedUser(user)
    setShowNewChat(false)
    loadMessages(user._id!)
  }

  // Loading and auth checks
  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#a41a2f]"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access messages.</p>
        </div>
      </div>
    )
  }

  // pendingConnections is now loaded separately with user info

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            <Button
              size="sm"
              onClick={() => setShowNewChat(!showNewChat)}
              className="bg-[#a41a2f] hover:bg-red-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
          </div>
          
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
        </div>

        {/* Pending Connections block removed per request */}

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {conversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.toString() !== currentUser._id?.toString())
              
              // Try to find user in availableUsers first
              let otherUser = availableUsers.find(u => u._id?.toString() === otherParticipant?.toString())
              
              // If not found, create a placeholder user with the ID
              if (!otherUser && otherParticipant) {
                otherUser = {
                  _id: otherParticipant.toString(),
                  fullName: `User ${otherParticipant.toString().slice(-4)}`,
                  firstName: `User`,
                  lastName: otherParticipant.toString().slice(-4),
                  userType: conversation.participantTypes?.includes('alumni') ? 'alumni' : 'student',
                  isOnline: false
                } as ExtendedUser
              }
              
              console.log('StudentMessages: Conversation mapping:', {
                conversationId: conversation._id,
                participants: conversation.participants.map(p => p.toString()),
                currentUserId: currentUser._id?.toString(),
                otherParticipant: otherParticipant?.toString(),
                otherUser: otherUser ? {
                  _id: otherUser._id,
                  fullName: otherUser.fullName,
                  firstName: otherUser.firstName,
                  lastName: otherUser.lastName
                } : null,
                availableUsersCount: availableUsers.length
              })
              
              return (
                <div
                  key={conversation._id?.toString()}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?._id?.toString() === conversation._id?.toString() 
                      ? 'bg-gray-100' 
                      : ''
                  }`}
                  onClick={async () => {
                    console.log('StudentMessages: Conversation clicked:', {
                      conversationId: conversation._id,
                      otherUser: otherUser ? {
                        _id: otherUser._id,
                        fullName: otherUser.fullName
                      } : null,
                      currentUserId: currentUser._id?.toString()
                    })
                    
                    // If otherUser is not found or is a placeholder, try to load real user info
                    let finalOtherUser: ExtendedUser | null = otherUser || null
                    if ((!otherUser || otherUser.fullName?.startsWith('User ')) && otherParticipant) {
                      console.log('StudentMessages: Loading real user info...')
                      const loadedUser = await loadUserInfo(otherParticipant.toString())
                      if (loadedUser) {
                        finalOtherUser = loadedUser
                      }
                    }
                    
                    setSelectedConversation(conversation)
                    setSelectedUser(finalOtherUser || null)
                    if (finalOtherUser?._id) {
                      console.log('StudentMessages: Loading messages for user:', finalOtherUser._id)
                      loadMessages(finalOtherUser._id)
                      
                      // Mark conversation as read when opened
                      if (conversation.unreadCount > 0) {
                        try {
                          await markConversationAsRead(finalOtherUser._id)
                          console.log('StudentMessages: Marked conversation as read for user:', finalOtherUser._id)
                        } catch (error) {
                          console.error('StudentMessages: Failed to mark conversation as read:', error)
                        }
                      }
                    } else {
                      console.log('StudentMessages: No otherUser found, cannot load messages')
                      toast({
                        title: "Error",
                        description: "User information not available",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={(otherUser as any)?.profilePicture || otherUser?.linkedinUrl || '/placeholder-user.jpg'} />
                    <AvatarFallback className="bg-[#a41a2f] text-white">
                      {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">
                        {otherUser?.fullName || 'Unknown User'}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-[#a41a2f] text-white text-xs">
                          {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    <div className="text-xs text-gray-500 truncate">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
          </div>

          {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
              {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={(selectedUser as any).profilePicture || selectedUser.linkedinUrl || '/placeholder-user.jpg'} />
                    <AvatarFallback className="bg-[#a41a2f] text-white">
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </AvatarFallback>
                    </Avatar>
                    <div>
                    <div className="font-semibold">{selectedUser.fullName}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      {selectedUser.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Block User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                  </div>
                </div>

              {/* Messages */}
            <div ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                {/* Debug info removed */}
                
                {messages
                  .filter(msg => {
                    if (!selectedUser?._id) return false
                    if (!msg.senderId || !msg.recipientId) {
                      console.log('StudentMessages: Message missing senderId or recipientId:', msg)
                      return false
                    }
                    
                    const isRelevant = (msg.senderId.toString() === selectedUser._id.toString() && 
                     msg.recipientId.toString() === currentUser._id?.toString()) ||
                    (msg.senderId.toString() === currentUser._id?.toString() && 
                     msg.recipientId.toString() === selectedUser._id.toString())
                    
                    console.log('StudentMessages: Message filter check:', {
                      messageId: msg._id,
                      messageContent: msg.content,
                      msgSenderId: msg.senderId?.toString(),
                      msgRecipientId: msg.recipientId?.toString(),
                      selectedUserId: selectedUser._id?.toString(),
                      currentUserId: currentUser._id?.toString(),
                      isRelevant,
                      totalMessages: messages.length
                    })
                    
                    return isRelevant
                  })
                  // Ensure chronological order (oldest first) so new messages appear at the bottom
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((message) => (
                    <div
                      key={message._id?.toString()}
                      className={`flex ${message.senderId?.toString() === currentUser._id?.toString() ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId?.toString() === currentUser._id?.toString()
                          ? 'bg-[#a41a2f] text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        <div className="text-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.senderId?.toString() === currentUser._id?.toString()
                            ? 'text-red-100'
                            : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {message.isRead && message.senderId?.toString() === currentUser._id?.toString() && (
                            <span className="ml-2">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

              {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                  <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                    className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !selectedUser || !canMessage(selectedUser._id!.toString())}
                  className="bg-[#a41a2f] hover:bg-red-700"
                  title={!selectedUser ? 'Select a user' : (!canMessage(selectedUser._id!.toString()) ? 'Connection must be accepted before messaging' : '')}
                >
                    <Send className="w-4 h-4" />
                  </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
                        )}
                      </div>

      {/* New Chat Sidebar */}
      {showNewChat && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Search Users</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewChat(false)}
              >
                <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              <UserSearch
                onConnectRequest={handleConnectRequest}
                onUserSelect={handleUserSelect}
                excludeCurrentUser={true}
                currentUserId={currentUser._id}
                currentUserType={currentUser.userType as 'student' | 'alumni'}
                getConnectionStatus={getConnectionStatus}
                isConnectionRequestPending={isConnectionRequestPending}
              />
            </div>
          </ScrollArea>
              </div>
      )}
    </div>
  )
}

export default function StudentMessages() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentMessagesContent />
    </Suspense>
  )
}
