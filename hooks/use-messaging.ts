import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Message, Conversation } from '@/lib/models/Message'

interface UseMessagingProps {
  userId?: string
  userType?: 'student' | 'alumni'
  token?: string
}

interface UseMessagingReturn {
  socket: Socket | null
  isConnected: boolean
  messages: Message[]
  conversations: Conversation[]
  sendMessage: (recipientId: string, content: string) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  markConversationAsRead: (otherUserId: string) => Promise<void>
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
  error: string | null
  clearError: () => void
  setMessages: (messages: Message[]) => void
  loadMessages: (otherUserId: string) => Promise<void>
  conversationsLoading: boolean
  refreshConversations: () => Promise<void>
}

export const useMessaging = ({ userId, userType, token }: UseMessagingProps): UseMessagingReturn => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recentMessageKeysRef = useRef<Set<string>>(new Set())

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const makeMessageKey = (m: Partial<Message> & { senderId: any; recipientId: any; content: string; createdAt?: any }) => {
    try {
      const s = m.senderId?.toString?.() ?? String(m.senderId)
      const r = m.recipientId?.toString?.() ?? String(m.recipientId)
      const t = (m.createdAt ? new Date(m.createdAt) : new Date()).getTime()
      return `${s}|${r}|${m.content}|${t}`
    } catch {
      return `${m.senderId}|${m.recipientId}|${m.content}|${Date.now()}`
    }
  }

  // Initialize socket connection
  useEffect(() => {
    console.log('useMessaging: useEffect called with userId:', userId, 'userType:', userType)
    
    if (!userId) {
      console.log('useMessaging: No userId provided, skipping connection')
      return
    }

    // Fetch token from server
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/token')
        if (!response.ok) {
          console.log('useMessaging: Failed to fetch token, status:', response.status)
          return null
        }
        const data = await response.json()
        return data.token
      } catch (error) {
        console.error('useMessaging: Error fetching token:', error)
        return null
      }
    }

    // Initialize connection
    const initConnection = async () => {
      const authToken = await fetchToken()
      
      if (!authToken) {
        console.log('useMessaging: No auth token found, skipping connection')
        return
      }

      console.log('Attempting Socket.IO connection with token:', authToken ? 'present' : 'missing')
      console.log('Socket URL:', process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
      console.log('Socket path:', '/api/socketio')

      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        path: '/api/socketio',
        auth: { token: authToken }
      })

      console.log('useMessaging: registering socket listeners')

      newSocket.onAny((event, ...args) => {
        console.log('useMessaging: onAny event:', event, args)
      })

      newSocket.on('connect', () => {
        console.log('Connected to messaging server')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from messaging server')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setError(`Connection failed: ${error.message}`)
      })

      newSocket.on('error', (error) => {
        console.error('Socket error:', error)
        setError(`Socket error: ${error.message}`)
      })

      newSocket.on('new-message', (data) => {
        console.log('useMessaging: New message received:', data)
        const incoming = (data && (data as any).message) ? (data as any).message : data

        const normalizeId = (v: any): string => {
          if (v == null) return ''
          if (typeof v === 'string') return v
          // MongoDB ObjectId or similar
          if (typeof v === 'object') {
            // Some backends wrap ids
            // @ts-ignore
            if (v.$oid && typeof v.$oid === 'string') return v.$oid
            // @ts-ignore
            if (v._id && v._id.toString) return v._id.toString()
          }
          try {
            // @ts-ignore
            if (v.toString) return v.toString()
          } catch {}
          try {
            return String(v)
          } catch { return '' }
        }

        // Check if this message is already in our messages array (defensively normalize ids)
        setMessages(prev => {
          const exists = prev.some(m => {
            const mId = m?._id?.toString?.()
            const inId = incoming?._id?.toString?.()
            if (mId && inId && mId === inId) return true

            const mS = normalizeId((m as any).senderId)
            const mR = normalizeId((m as any).recipientId)
            const iS = normalizeId((incoming as any).senderId)
            const iR = normalizeId((incoming as any).recipientId)

            if (!mS || !mR || !iS || !iR) return false

            const samePair = mS === iS && mR === iR
            const sameContent = (m as any).content === (incoming as any).content
            const mT = new Date((m as any).createdAt ?? 0).getTime()
            const iT = new Date((incoming as any).createdAt ?? 0).getTime()
            const closeInTime = Math.abs(mT - iT) < 5000
            return samePair && sameContent && closeInTime
          })

          if (exists) {
            console.log('useMessaging: message already exists, skipping')
            return prev
          }

          const updated = [...prev, incoming]
          return updated
        })

        // Refresh conversations to update the conversation list
        refreshConversations()
      })

      newSocket.on('message-sent', (data) => {
        console.log('useMessaging: Message sent confirmation received:', data)
        const incoming = (data && (data as any).message) ? (data as any).message : data

        const normalizeId = (v: any): string => {
          if (v == null) return ''
          if (typeof v === 'string') return v
          if (typeof v === 'object') {
            // @ts-ignore
            if (v.$oid && typeof v.$oid === 'string') return v.$oid
            // @ts-ignore
            if (v._id && v._id.toString) return v._id.toString()
          }
          try {
            // @ts-ignore
            if (v.toString) return v.toString()
          } catch {}
          try { return String(v) } catch { return '' }
        }

        // Check if this message is already in our messages array
        setMessages(prev => {
          const exists = prev.some(m => {
            const mId = m?._id?.toString?.()
            const inId = incoming?._id?.toString?.()
            if (mId && inId && mId === inId) return true

            const mS = normalizeId((m as any).senderId)
            const mR = normalizeId((m as any).recipientId)
            const iS = normalizeId((incoming as any).senderId)
            const iR = normalizeId((incoming as any).recipientId)

            if (!mS || !mR || !iS || !iR) return false

            const samePair = mS === iS && mR === iR
            const sameContent = (m as any).content === (incoming as any).content
            const mT = new Date((m as any).createdAt ?? 0).getTime()
            const iT = new Date((incoming as any).createdAt ?? 0).getTime()
            const closeInTime = Math.abs(mT - iT) < 5000
            return samePair && sameContent && closeInTime
          })

          if (exists) {
            console.log('useMessaging: message already exists, skipping')
            return prev
          }

          const updated = [...prev, incoming]
          return updated
        })

        // Refresh conversations to update the conversation list
        refreshConversations()
      })

      newSocket.on('user-status-change', (data) => {
        console.log('useMessaging: User status change:', data)
        // You can use this to update online status in the UI
        // For now, we'll just log it
      })

      newSocket.on('message-read', ({ messageId }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id?.toString() === messageId 
              ? { ...msg, isRead: true, readAt: new Date() }
              : msg
          )
        )
      })

      newSocket.on('user-typing', ({ userId: typingUserId }) => {
        // Handle typing indicator from other user
        console.log(`User ${typingUserId} is typing`)
      })

      newSocket.on('user-stopped-typing', ({ userId: typingUserId }) => {
        // Handle typing stop from other user
        console.log(`User ${typingUserId} stopped typing`)
      })

      newSocket.on('conversation-updated', (data) => {
        console.log('useMessaging: Conversation updated:', data)
        // Refresh conversations to update the chat list
        refreshConversations()
      })

      newSocket.on('connection-request', ({ connection }) => {
        console.log('New connection request received', connection)
      })

      newSocket.on('connection-response', ({ connection }) => {
        console.log('Connection response received', connection)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }

    initConnection()
  }, [userId, token])

  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    console.log('sendMessage called with:', { recipientId, content, isConnected, hasSocket: !!socket })
    
    if (!socket || !isConnected) {
      console.error('Cannot send message: not connected')
      setError('Not connected to messaging server')
      return
    }

    try {
      console.log('Emitting send-message event')
      socket.emit('send-message', {
        recipientId,
        content,
        messageType: 'text'
      })
      console.log('send-message event emitted successfully')
    } catch (err: any) {
      console.error('Error in sendMessage:', err)
      setError(err.message)
    }
  }, [socket, isConnected])

  const markAsRead = useCallback(async (messageId: string) => {
    if (!socket || !isConnected) return

    try {
      socket.emit('mark-read', { messageId })
    } catch (err: any) {
      setError(err.message)
    }
  }, [socket, isConnected])

  const markConversationAsRead = useCallback(async (otherUserId: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark-conversation-read',
          otherUserId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark conversation as read')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  const handleTyping = useCallback((recipientId: string, typing: boolean) => {
    if (!socket || !isConnected) return

    if (typing) {
      socket.emit('typing-start', { recipientId })
    } else {
      socket.emit('typing-stop', { recipientId })
    }
  }, [socket, isConnected])

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      if (!userId) return
      
      setConversationsLoading(true)
      try {
        console.log('useMessaging: Loading conversations for user:', userId)
        const response = await fetch('/api/messages?type=conversations')
        if (response.ok) {
          const data = await response.json()
          console.log('useMessaging: Loaded conversations:', data.conversations)
          setConversations(data.conversations || [])
        } else {
          console.error('useMessaging: Failed to load conversations, status:', response.status)
          setError('Failed to load conversations')
        }
      } catch (err: any) {
        console.error('useMessaging: Error loading conversations:', err)
        setError(err.message)
      } finally {
        setConversationsLoading(false)
      }
    }

    loadConversations()
  }, [userId])

  const refreshConversations = useCallback(async () => {
    if (!userId) return
    
    setConversationsLoading(true)
    try {
      console.log('useMessaging: Refreshing conversations for user:', userId)
      const response = await fetch('/api/messages?type=conversations')
      if (response.ok) {
        const data = await response.json()
        console.log('useMessaging: Refreshed conversations:', data.conversations)
        console.log('useMessaging: Current user ID:', userId)
        console.log('useMessaging: Conversations participants:', data.conversations?.map(c => ({
          id: c._id,
          participants: c.participants?.map(p => p.toString()),
          includesCurrentUser: c.participants?.some(p => p.toString() === userId)
        })))
        setConversations(data.conversations || [])
      } else {
        console.error('useMessaging: Failed to refresh conversations, status:', response.status)
      }
    } catch (err: any) {
      console.error('useMessaging: Error refreshing conversations:', err)
    } finally {
      setConversationsLoading(false)
    }
  }, [userId])

  const loadMessages = useCallback(async (otherUserId: string) => {
    try {
      console.log('useMessaging: loadMessages called for user:', otherUserId)
      const response = await fetch(`/api/messages?type=messages&userId=${otherUserId}`)
      console.log('useMessaging: loadMessages response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('useMessaging: Loaded messages for user:', otherUserId, data.messages)
        if (data.messages && Array.isArray(data.messages)) {
          console.log('useMessaging: Setting messages array to:', data.messages)
          setMessages(data.messages)
        } else {
          console.log('useMessaging: No messages array in response or not an array')
        }
      } else {
        console.error('useMessaging: Failed to load messages, status:', response.status)
      }
    } catch (error) {
      console.error('useMessaging: Failed to load messages for user:', error)
    }
  }, [])

  return {
    socket,
    isConnected,
    messages,
    conversations,
    conversationsLoading,
    sendMessage,
    markAsRead,
    markConversationAsRead,
    refreshConversations,
    isTyping,
    setIsTyping: (typing: boolean) => {
      setIsTyping(typing)
      // Handle typing indicators
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      if (typing) {
        // Start typing indicator
        // You would need to pass recipientId here
      } else {
        // Stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          // Stop typing indicator
        }, 1000)
      }
    },
    error,
    clearError,
    setMessages: (messages: Message[]) => {
      setMessages(messages)
    },
    loadMessages
  }
} 