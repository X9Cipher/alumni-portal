import { ObjectId } from 'mongodb'

export interface Message {
  _id?: ObjectId
  senderId: ObjectId
  recipientId: ObjectId
  senderType: 'student' | 'alumni'
  recipientType: 'student' | 'alumni'
  content: string
  messageType: 'text' | 'image' | 'file' | 'connection_request' | 'system'
  isRead: boolean
  readAt?: Date
  createdAt: Date
  updatedAt: Date
  // For file/image messages
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  // For connection requests
  connectionId?: ObjectId
}

export interface Conversation {
  _id?: ObjectId
  participants: ObjectId[]
  participantTypes: ('student' | 'alumni')[]
  lastMessage?: Message
  lastMessageAt?: Date
  unreadCount: number
  // The user who currently has unread messages in this conversation
  unreadFor?: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface SendMessageRequest {
  recipientId: string
  content: string
  messageType?: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
}

export interface MessageResponse {
  success: boolean
  message?: Message
  error?: string
}

export interface ConversationResponse {
  success: boolean
  conversations?: Conversation[]
  error?: string
}   success: boolean
  conversations?: Conversation[]
  error?: string
} 
