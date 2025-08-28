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
import { User } from '@/lib/models/User'
import { useSearchParams } from 'next/navigation'
import { 
  Send, 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Users, 
  UserPlus,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { UserSearch } from '@/components/user-search'
import { useRouter } from 'next/navigation'

interface ExtendedUser {
  _id?: string
  firstName?: string
  lastName?: string
  fullName: string
  email?: string
  userType?: 'student' | 'alumni' | 'admin'
  department?: string
  currentCompany?: string
  currentPosition?: string
  graduationYear?: number
  currentYear?: number
  linkedinUrl?: string
  profilePicture?: string
  isOnline?: boolean
}

function AlumniMessagesContent() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [availableUsers, setAvailableUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [connectionRequests, setConnectionRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [currentView, setCurrentView] = useState<'conversations' | 'chat' | 'newChat'>('conversations')

  // Load current user from auth
  const { user: currentUser, loading: userLoading } = useAuth()

  const { 
    socket, 
    isConnected, 
    messages, 
    conversations, 
    conversationsLoading,
    sendMessage, 
    markAsRead, 
    markConversationAsRead,
    refreshConversations,
    error,
    clearError,
    setMessages,
    loadMessages
  } = useMessaging({
    userId: currentUser?._id,
    userType: currentUser?.userType as 'student' | 'alumni' | undefined,
  })

  // Chat-only mode when arriving from Student Requests → Show
  const chatOnlyMode = !!searchParams?.get('request')

  // Keep mobile view in sync: on small screens, switch panes based on selection
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (selectedUser) {
        setCurrentView('chat')
      } else if (showNewChat) {
        setCurrentView('newChat')
      } else {
        setCurrentView('conversations')
      }
    }
  }, [selectedUser, showNewChat])

  // Always load thread for the currently selected user so switching is instant
  useEffect(() => {
    if (selectedUser?._id) {
      loadMessages(selectedUser._id)
    }
  }, [selectedUser?._id])

  // Handle URL parameters to open specific chat or request
  useEffect(() => {
    const userId = searchParams?.get('user')
    const userType = searchParams?.get('type')
    const requestId = searchParams?.get('request')
    
    // Prefer request-review mode if requestId param is present.
    // This ensures coming from Student Requests → Show immediately opens the review UI
    // even if availableUsers has not finished loading yet.
    if (requestId) {
      // If pending requests are not loaded yet, load them first and wait for next effect tick
      if (!connectionRequests || connectionRequests.length === 0) {
        loadConnectionRequests()
        return
      }
      const req = connectionRequests.find(r => r._id?.toString() === requestId)
      if (req) {
        setSelectedRequest(req)
        const reqUserId = (req.requesterId?.toString?.() || req.requester?._id?.toString?.() || userId) as string
        setSelectedUser({
          _id: reqUserId,
          firstName: req.requester?.firstName,
          lastName: req.requester?.lastName,
          fullName: `${req.requester?.firstName || ''} ${req.requester?.lastName || ''}`.trim(),
          userType: 'student',
          isOnline: false
        } as any)
        if (reqUserId) {
          // Ensure the thread loads so the prompted message shows immediately
          loadMessages(reqUserId)
        }
        setSelectedConversation(null)
        setShowNewChat(false)
        return
      }
      // If request data not ready yet, wait for connectionRequests to update (dependency below)
    }

    if (userId && userType && availableUsers.length > 0) {
      console.log('AlumniMessages: URL params detected:', { userId, userType })
      
      // Find the user in available users
      const targetUser = availableUsers.find(user => 
        user._id?.toString() === userId && user.userType === userType
      )
      
      if (targetUser) {
        console.log('AlumniMessages: Found target user:', targetUser)
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

        // If a requestId is present, select request review mode
        if (requestId) {
          const req = connectionRequests.find(r => r._id?.toString() === requestId)
          if (req) {
            setSelectedRequest(req)
          }
        } else {
          // If navigating to a user without an explicit request, ensure request-review mode is cleared
          if (selectedRequest) setSelectedRequest(null)
        }
      }
    }
  }, [searchParams, availableUsers, conversations, loadMessages, connectionRequests, selectedRequest])

  // Debug logging
  useEffect(() => {
    console.log('AlumniMessages: currentUser changed:', currentUser?._id, currentUser?.userType)
  }, [currentUser])

  // Debug logging for messages
  useEffect(() => {
    console.log('AlumniMessages: messages array updated:', messages)
    console.log('AlumniMessages: currentUser._id:', currentUser?._id)
    console.log('AlumniMessages: selectedUser._id:', selectedUser?._id)
    
    // Log the structure of the first few messages to debug
    if (messages.length > 0) {
      console.log('AlumniMessages: First message structure:', {
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
      loadAvailableUsers()
      loadConnectionRequests()
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
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      }
    }
    
    // Use setTimeout to ensure DOM is updated
    setTimeout(scrollToBottom, 100)
  }, [messages])

  const loadAvailableUsers = async () => {
    try {
      console.log('AlumniMessages: Starting to load available users...')
      
      // Load both students and other alumni
      const [studentsResponse, alumniResponse] = await Promise.all([
        fetch('/api/student/directory'),
        fetch('/api/alumni/directory')
      ])
      
      console.log('AlumniMessages: API responses:', {
        studentsStatus: studentsResponse.status,
        alumniStatus: alumniResponse.status
      })
      
      let allUsers: ExtendedUser[] = []
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        console.log('AlumniMessages: Students data:', studentsData)
        allUsers = [...allUsers, ...(studentsData.students || [])]
      } else {
        console.error('AlumniMessages: Failed to load students:', studentsResponse.status, studentsResponse.statusText)
      }
      
      if (alumniResponse.ok) {
        const alumniData = await alumniResponse.json()
        console.log('AlumniMessages: Alumni data:', alumniData)
        // Filter out current user
        const otherAlumni = (alumniData.alumni || []).filter((user: any) => {
          const currId = currentUser?._id?.toString()
          const userId = user?._id?.toString()
          return !currId || userId !== currId
        })
        allUsers = [...allUsers, ...otherAlumni]
      } else {
        console.error('AlumniMessages: Failed to load alumni:', alumniResponse.status, alumniResponse.statusText)
      }
      
      console.log('AlumniMessages: Final available users:', allUsers)
      setAvailableUsers(allUsers)
    } catch (error) {
      console.error('AlumniMessages: Failed to load available users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserInfo = async (userId: string) => {
    try {
      console.log('AlumniMessages: Loading user info for:', userId)
      
      // Try to find user in availableUsers first
      let user = availableUsers.find(u => u._id?.toString() === userId)
      
      if (!user) {
        console.log('AlumniMessages: User not found in availableUsers, trying to fetch...')
        
        // Try to fetch from search API as fallback
        const response = await fetch(`/api/search?q=${userId}&type=all&limit=1`)
        if (response.ok) {
          const data = await response.json()
          if (data.users && data.users.length > 0) {
            user = {
              ...data.users[0],
              fullName: `${data.users[0].firstName} ${data.users[0].lastName}`.trim(),
              linkedinUrl: data.users[0].linkedinUrl || '',
              isOnline: data.users[0].isOnline || false
            }
            console.log('AlumniMessages: Fetched user info:', user)
          }
        }
      }
      
      return user
    } catch (error) {
      console.error('AlumniMessages: Failed to load user info:', error)
      return null
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return

    try {
      await sendMessage(selectedUser._id!.toString(), messageInput)
      setMessageInput('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleUserSelect = (user: any) => {
    if (selectedRequest) setSelectedRequest(null)
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

  // Load connection requests for alumni
  async function loadConnectionRequests() {
    if (currentUser?.userType !== 'alumni') return
    
    try {
      const response = await fetch('/api/connections?type=pending&withUserInfo=true')
      if (response.ok) {
        const data = await response.json()
        const incomingRequests = (data.connections || []).filter((c: any) => 
          c.recipientId?.toString() === currentUser?._id?.toString()
        )
        setConnectionRequests(incomingRequests)
      }
    } catch (error) {
      console.error('Failed to load connection requests:', error)
    }
  }

  // Handle connection request response
  const handleConnectionResponse = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/messages/connection-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, status })
      })

      if (response.ok) {
        toast({
          title: `Connection ${status}`,
          description: status === 'accepted' ? 'You can now message freely!' : 'Connection request declined.',
        })
        
        // Reload connection requests and conversations
        loadConnectionRequests()
        refreshConversations()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to handle connection request',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to handle connection request',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="flex h-full w-full bg-gray-50 overflow-hidden flex-col lg:flex-row pt-0 min-h-0">
      {/* Mobile Header - Only visible on small screens */}
      <div className="lg:hidden w-full bg-white border-b border-gray-200 px-3 py-1">
        <div className="flex items-center justify-between">
          {currentView === 'conversations' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <Button
                size="sm"
                onClick={() => {
                  setCurrentView('newChat')
                  setShowNewChat(true)
                }}
                className="bg-[#a41a2f] hover:bg-red-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </>
          )}
          
          {currentView === 'chat' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('conversations')}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={(selectedUser as any)?.profilePicture || selectedUser?.linkedinUrl || '/placeholder-user.jpg'} />
                  <AvatarFallback className="bg-[#a41a2f] text-white text-[10px]">
                    {selectedUser?.firstName?.[0]}{selectedUser?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm leading-none text-gray-900">
                    {selectedUser?.fullName}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/alumni/profile/${selectedUser?._id}`)}>
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>Block User</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          {currentView === 'newChat' && (
            <>
              <h3 className="text-lg font-semibold text-gray-900">New Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentView('conversations')
                  setShowNewChat(false)
                }}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Conversations Pane - Full width on mobile, sidebar on desktop */}
        {!chatOnlyMode && (
        <div className={`${currentView === 'conversations' ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col min-h-0 overflow-hidden`}>
            {/* Header */}
          <div className="hidden lg:block px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                <Button
                  size="sm"
                onClick={() => { 
                  setSelectedRequest(null); 
                  setShowNewChat(!showNewChat);
                  setCurrentView('newChat');
                }}
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

            {/* Conversations List */}
          <ScrollArea className="flex-1 overflow-y-auto h-full min-h-0">
            <div className="p-4 pb-24 lg:pb-8 space-y-2">
                {/* Connection Requests for Alumni */}
                {currentUser?.userType === 'alumni' && connectionRequests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Connection Requests</h3>
                    {connectionRequests.map((request) => (
                      <div
                        key={request._id}
                        className={`flex items-center gap-3 p-3 rounded-lg mb-2 cursor-pointer ${
                          selectedRequest?._id?.toString() === request._id?.toString()
                            ? 'bg-blue-100 border border-blue-300'
                            : 'bg-blue-50 border border-blue-200'
                        }`}
                        onClick={() => {
                          setSelectedRequest(request)
                          setSelectedUser({
                            _id: request.requester?._id?.toString(),
                            firstName: request.requester?.firstName,
                            lastName: request.requester?.lastName,
                            fullName: `${request.requester?.firstName || ''} ${request.requester?.lastName || ''}`.trim(),
                            userType: 'student',
                            isOnline: false
                          } as any)
                          const reqUserId = request.requesterId?.toString() || request.requester?._id?.toString()
                          if (reqUserId) {
                            loadMessages(reqUserId)
                          setCurrentView('chat')
                          }
                        }}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={request.requester?.profilePicture} />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {request.requester?.firstName?.[0]}{request.requester?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900">
                            {request.requester?.firstName} {request.requester?.lastName}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1">Student</p>
                          {request.message && (
                            <p className="text-xs text-gray-700 italic">
                              "{request.message}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={async () => {
                              await handleConnectionResponse(request._id, 'accepted')
                              const reqUserId = request.requesterId?.toString() || request.requester?._id?.toString()
                              setSelectedRequest(null)
                              if (reqUserId) {
                                refreshConversations()
                                loadMessages(reqUserId)
                              setCurrentView('chat')
                              }
                            }}
                            className="h-6 w-6 p-0 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={async () => {
                              await handleConnectionResponse(request._id, 'rejected')
                              setSelectedRequest(null)
                              await loadConnectionRequests()
                            }}
                          className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Regular Conversations */}
                <div className="text-xs uppercase tracking-wide text-gray-500 mt-2 mb-1">Conversations</div>
                {conversations.map((conversation) => {
                console.log('AlumniMessages: Processing conversation:', {
                  conversationId: conversation._id,
                  participants: conversation.participants,
                  participantsAsStrings: conversation.participants.map(p => p.toString()),
                  currentUserId: currentUser._id?.toString(),
                  currentUserType: typeof currentUser._id
                })
                
                const otherParticipant = conversation.participants.find(p => p.toString() !== currentUser._id?.toString())

                  // Hide conversations if there is a pending request from the same user to avoid duplicate entries
                  const hasPendingFromOther = connectionRequests.some(req =>
                    req.requesterId?.toString() === otherParticipant?.toString() &&
                  req.recipientId?.toString() === currentUser._id?.toString()
                  )
                  if (hasPendingFromOther) return null
                  
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
                
                console.log('AlumniMessages: Conversation mapping:', {
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
                  availableUsersCount: availableUsers.length,
                  availableUserIds: availableUsers.map(u => u._id?.toString())
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
                      if (selectedRequest) setSelectedRequest(null)
                      console.log('AlumniMessages: Conversation clicked:', {
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
                        console.log('AlumniMessages: Loading real user info...')
                        const loadedUser = await loadUserInfo(otherParticipant.toString())
                        if (loadedUser) {
                          finalOtherUser = loadedUser
                        }
                      }
                      
                      // Validate that we're not trying to load messages for ourselves
                      if (finalOtherUser?._id?.toString() === currentUser._id?.toString()) {
                        console.error('AlumniMessages: Cannot load messages for current user!')
                        toast({
                          title: "Error",
                          description: "Cannot load messages for yourself",
                          variant: "destructive"
                        })
                        return
                      }
                      
                      setSelectedConversation(conversation)
                      setSelectedUser(finalOtherUser || null)
                      if (finalOtherUser?._id) {
                        console.log('AlumniMessages: Loading messages for user:', finalOtherUser._id)
                        loadMessages(finalOtherUser._id)
                        
                        // Mark conversation as read when opened
                        if (conversation.unreadCount > 0) {
                          try {
                            await markConversationAsRead(finalOtherUser._id)
                            console.log('AlumniMessages: Marked conversation as read for user:', finalOtherUser._id)
                          } catch (error) {
                            console.error('AlumniMessages: Failed to mark conversation as read:', error)
                          }
                        }
                        
                        // Switch to chat view on mobile
                        setCurrentView('chat')
                      } else {
                        console.log('AlumniMessages: No otherUser found, cannot load messages')
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
                        <div 
                          className="font-medium text-sm truncate hover:text-blue-600 cursor-pointer transition-colors"
                          onClick={() => router.push(`/alumni/profile/${otherUser?._id}`)}
                        >
                          {otherUser?.fullName || 'Unknown User'}
                        </div>
                        {(() => {
                          const isUnreadForMeExplicit = (conversation.unreadCount > 0) && (
                            (conversation as any).unreadFor?.toString?.() === currentUser._id?.toString()
                          )
                          const isUnreadByInference = (conversation.unreadCount > 0) && (!('unreadFor' in (conversation as any)) || !(conversation as any).unreadFor) && (conversation.lastMessage?.senderId?.toString?.() !== currentUser._id?.toString())
                          return isUnreadForMeExplicit || isUnreadByInference
                        })() && (
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
        )}

      {/* Chat Area - Full width on mobile, right side on desktop */}
      <div className={`${currentView === 'chat' ? 'block' : 'hidden'} lg:block flex-1 flex flex-col min-h-0 overflow-hidden`}>
          {selectedUser ? (
            <>
            {/* Chat Header - Desktop only */}
            <div className="hidden lg:block px-4 py-2 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                    <AvatarImage src={(selectedUser as any).profilePicture || selectedUser?.linkedinUrl || '/placeholder-user.jpg'} />
                      <AvatarFallback className="bg-[#a41a2f] text-white">
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                    <div 
                      className="font-semibold hover:text-blue-600 cursor-pointer transition-colors"
                      onClick={() => router.push(`/alumni/profile/${selectedUser._id}`)}
                    >
                      {selectedUser.fullName}
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
                    <DropdownMenuItem onClick={() => router.push(`/alumni/profile/${selectedUser._id}`)}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>Block User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 h-full min-h-0 p-4 pb-32 overflow-y-auto">
                <div className="space-y-4">
                {/* Removed UI debug info */}

                  {messages
                    .filter(msg => {
                      if (!selectedUser?._id) return false
                    if (!msg.senderId || !msg.recipientId) {
                      console.log('AlumniMessages: Message missing senderId or recipientId:', msg)
                      return false
                    }
                      
                      const isRelevant = (msg.senderId.toString() === selectedUser._id.toString() && 
                     msg.recipientId.toString() === currentUser._id?.toString()) ||
                    (msg.senderId.toString() === currentUser._id?.toString() && 
                       msg.recipientId.toString() === selectedUser._id.toString())
                      
                    console.log('AlumniMessages: Message filter check:', {
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
              </ScrollArea>

              {/* Bottom Actions */}
              {selectedRequest ? (
              <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-2 justify-end sticky bottom-0 z-10">
                  <Button 
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      handleConnectionResponse(selectedRequest._id, 'rejected')
                      setSelectedRequest(null)
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Decline
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      await handleConnectionResponse(selectedRequest._id, 'accepted')
                      const newUserId = selectedRequest.requesterId?.toString()
                      setSelectedRequest(null)
                      if (newUserId) {
                        setTimeout(() => {
                          refreshConversations()
                          loadMessages(newUserId)
                        }, 500)
                      }
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Accept
                  </Button>
                </div>
              ) : (
              <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
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
                      disabled={!messageInput.trim()}
                      className="bg-[#a41a2f] hover:bg-red-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
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

      {/* New Chat Pane - Full width on mobile, right side on desktop */}
      {!chatOnlyMode && (
        <div className={`${currentView === 'newChat' ? 'block' : 'hidden'} ${showNewChat ? 'lg:block' : 'lg:hidden'} w-full lg:w-80 bg-white border-l border-gray-200 flex flex-col min-h-0 overflow-hidden`}>
          <div className="hidden lg:block px-4 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">New Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                onClick={() => {
                  setShowNewChat(false)
                  setCurrentView('conversations')
                }}
                className="lg:block hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <UserSearch 
              onUserSelect={(user) => {
                handleUserSelect(user)
                setCurrentView('chat')
              }}
                excludeCurrentUser={true}
              currentUserId={currentUser._id}
                currentUserType={currentUser?.userType as 'student' | 'alumni'}
              />
            </div>
            
          <ScrollArea className="flex-1 overflow-y-auto h-full min-h-0">
            <div className="p-4 pb-24 lg:pb-8 space-y-2">
                {availableUsers.map((user) => {
                
                  return (
                    <div key={user._id?.toString()} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={(user as any).profilePicture || user.linkedinUrl || '/placeholder-user.jpg'} />
                          <AvatarFallback className="bg-[#a41a2f] text-white">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div 
                            className="font-medium text-sm hover:text-blue-600 cursor-pointer transition-colors"
                            onClick={() => router.push(`/alumni/profile/${user._id}`)}
                          >
                            {user.fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.userType === 'student'
                              ? [
                                  ((user as any).degree || ''),
                                  (user.department || ''),
                                  ((user as any).currentYear ? `Year ${(user as any).currentYear}` : '')
                                ].filter(Boolean).join(' • ') || 'Student'
                              : [
                                  (user.currentCompany || ''),
                                // include batch for alumni if available
                                  ((user as any).graduationYear ? `Class of ${(user as any).graduationYear}` : '')
                                ].filter(Boolean).join(' • ') || 'Alumni'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                        aria-label="Message"
                        onClick={() => {
                          handleUserSelect(user)
                          setCurrentView('chat')
                        }}
                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0 rounded-full flex items-center justify-center"
                      >
                        <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}
    </div>
  )
}

export default function AlumniMessages() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlumniMessagesContent />
    </Suspense>
  )
} 
 