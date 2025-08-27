import { getDatabase } from '@/lib/mongodb'
import { Message, Conversation, SendMessageRequest, MessageResponse, ConversationResponse } from '@/lib/models/Message'
import { ConnectionService } from './connectionService'
import { ObjectId } from 'mongodb'
import { UserService } from './userService'

export class MessageService {
  private static messagesCollection = 'messages'
  private static conversationsCollection = 'conversations'

  static async sendMessage(senderId: string, request: SendMessageRequest): Promise<Message> {
    // Get user types from the database
    const senderType = await this.getUserType(senderId)
    const recipientType = await this.getUserType(request.recipientId)

    // Implement new messaging rules
    if (senderType === 'student' && recipientType === 'student') {
      throw new Error('Students cannot message other students')
    }

    // Check if students need connection for messaging alumni
    if (senderType === 'student' && recipientType === 'alumni') {
      const hasConnection = await ConnectionService.hasAcceptedConnection(senderId, request.recipientId)
      if (!hasConnection) {
        throw new Error('Students must have an accepted connection with alumni before messaging')
      }
    }

    // Alumni can message alumni directly (no connection required)
    // Alumni can message students directly (no connection required)
    // Students need connection to message alumni

    const db = await getDatabase()
    const messagesCollection = db.collection(this.messagesCollection)

    const message: Message = {
      senderId: new ObjectId(senderId),
      recipientId: new ObjectId(request.recipientId),
      senderType: senderType,
      recipientType: recipientType,
      content: request.content,
      messageType: request.messageType || 'text',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fileUrl: request.fileUrl,
      fileName: request.fileName,
      fileSize: request.fileSize,
      mimeType: request.mimeType
    }

    const result = await messagesCollection.insertOne(message)
    message._id = result.insertedId

    // Update or create conversation
    await this.updateConversation(senderId, request.recipientId, message)

    return message
  }

  static async getMessages(userId: string, otherUserId: string, limit: number = 50): Promise<Message[]> {
    console.log('MessageService.getMessages called with:', { userId, otherUserId, limit })
    const db = await getDatabase()
    const collection = db.collection(this.messagesCollection)

    const query = {
      $or: [
        { senderId: new ObjectId(userId), recipientId: new ObjectId(otherUserId) },
        { senderId: new ObjectId(otherUserId), recipientId: new ObjectId(userId) }
      ]
    }
    
    console.log('MessageService.getMessages query:', query)

    const messages = await collection.find(query)
      .sort({ createdAt: 1 })
      .limit(limit)
      .toArray()

    console.log('MessageService.getMessages result:', messages)
    return messages as Message[]
  }

  static async getConversations(userId: string): Promise<Conversation[]> {
    const db = await getDatabase()
    const collection = db.collection(this.conversationsCollection)

    console.log(`Getting conversations for user: ${userId}`)
    
    // Find conversations where the user is a participant
    const conversations = await collection.find({
      participants: { $in: [new ObjectId(userId)] }
    })
    .sort({ lastMessageAt: -1 })
    .toArray()

    // Get user type to determine messaging rules
    const userType = await this.getUserType(userId)
    
    // Filter conversations based on messaging rules
    let filteredConversations = conversations

    if (userType === 'student') {
      // Students can see:
      // 1) Conversations with alumni when connection is accepted
      // 2) Conversations with alumni where the student has a pending request (so they can see their initial note)
      filteredConversations = []
      for (const conv of conversations) {
        const otherParticipantId = conv.participants.find(p => p.toString() !== userId)?.toString()
        if (!otherParticipantId) continue
        const otherUserType = await this.getUserType(otherParticipantId)
        if (otherUserType !== 'alumni') continue

        const hasConnection = await ConnectionService.hasAcceptedConnection(userId, otherParticipantId)
        if (hasConnection) {
          filteredConversations.push(conv)
          continue
        }

        // Check for a pending connection initiated by this student
        const pendingConn = await ConnectionService.getConnectionStatus(userId, otherParticipantId)
        if (pendingConn && pendingConn.status === 'pending' && pendingConn.requesterId?.toString() === userId) {
          filteredConversations.push(conv)
        }
      }
    } else if (userType === 'alumni') {
      // Alumni can see conversations with other alumni directly, and with students directly
      filteredConversations = []
      for (const conv of conversations) {
        const otherParticipantId = conv.participants.find(p => p.toString() !== userId)?.toString()
        if (otherParticipantId) {
          const otherUserType = await this.getUserType(otherParticipantId)
          if (otherUserType === 'alumni') {
            // Alumni can message alumni directly
            filteredConversations.push(conv)
          } else if (otherUserType === 'student') {
            // Alumni can message students directly
            filteredConversations.push(conv)
          }
        }
      }
    }

    console.log(`Filtered conversations for ${userType}:`, filteredConversations.length)
    return filteredConversations as Conversation[]
  }

  // New method to get connection requests as conversation-like items for alumni
  static async getConnectionRequestsAsConversations(userId: string): Promise<any[]> {
    const userType = await this.getUserType(userId)
    
    if (userType !== 'alumni') {
      return [] // Only alumni see connection requests
    }

    try {
      const pendingConnections = await ConnectionService.getPendingConnectionsWithUserInfo(userId)
      
      return pendingConnections.map(connection => ({
        _id: connection._id,
        type: 'connection_request',
        participants: [connection.requesterId, connection.recipientId],
        lastMessage: connection.message || 'Connection request',
        lastMessageAt: connection.createdAt,
        unreadCount: 1, // Connection requests are always unread
        requester: connection.requester,
        status: connection.status,
        message: connection.message
      }))
    } catch (error) {
      console.error('Error getting connection requests as conversations:', error)
      return []
    }
  }

  static async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection(this.messagesCollection)

    await collection.updateOne(
      { 
        _id: new ObjectId(messageId),
        recipientId: new ObjectId(userId)
      },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date(),
          updatedAt: new Date()
        } 
      }
    )
  }

  static async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    const db = await getDatabase()
    const messagesCollection = db.collection(this.messagesCollection)
    const conversationsCollection = db.collection(this.conversationsCollection)

    // Mark all unread messages as read
    await messagesCollection.updateMany(
      { 
        senderId: new ObjectId(otherUserId),
        recipientId: new ObjectId(userId),
        isRead: false
      },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date(),
          updatedAt: new Date()
        } 
      }
    )

    // Reset unread count in conversation document
    const participantIds = [new ObjectId(userId), new ObjectId(otherUserId)].sort()
    await conversationsCollection.updateOne(
      { participants: { $all: participantIds } },
      { 
        $set: { 
          unreadCount: 0,
          updatedAt: new Date()
        } 
      }
    )
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const db = await getDatabase()
    const collection = db.collection(this.messagesCollection)

    const count = await collection.countDocuments({
      recipientId: new ObjectId(userId),
      isRead: false
    })

    return count
  }

  private static async updateConversation(userId1: string, userId2: string, lastMessage: Message): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection(this.conversationsCollection)

    const participantIds = [new ObjectId(userId1), new ObjectId(userId2)].sort()
    
    console.log('updateConversation called with:', {
      userId1,
      userId2,
      participantIds: participantIds.map(p => p.toString()),
      lastMessageContent: lastMessage.content,
      lastMessageSender: lastMessage.senderId.toString(),
      lastMessageRecipient: lastMessage.recipientId.toString()
    })

    const conversation = await collection.findOne({
      participants: { $all: participantIds }
    })

    console.log('Existing conversation found:', conversation ? {
      id: conversation._id,
      participants: conversation.participants?.map(p => p.toString()),
      participantTypes: conversation.participantTypes
    } : 'None')

    if (conversation) {
      // Update existing conversation - assign unread only to the actual recipient
      const recipientIdStr = lastMessage.recipientId.toString()
      const updateData: any = {
        lastMessage,
        lastMessageAt: lastMessage.createdAt,
        updatedAt: new Date(),
        unreadFor: new ObjectId(recipientIdStr)
      }
      // If recipient is same as previous unreadFor, increment; else reset to 1
      if (conversation.unreadFor && conversation.unreadFor.toString() === recipientIdStr) {
        updateData.unreadCount = (conversation.unreadCount || 0) + 1
      } else {
        updateData.unreadCount = 1
      }

      console.log('Updating conversation with:', updateData)
      await collection.updateOne(
        { _id: conversation._id },
        { $set: updateData }
      )
    } else {
      // Create new conversation - set unread for recipient
      const newConversation: Conversation = {
        participants: participantIds,
        participantTypes: [lastMessage.senderType, lastMessage.recipientType],
        lastMessage,
        lastMessageAt: lastMessage.createdAt,
        unreadCount: 1,
        unreadFor: lastMessage.recipientId,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      console.log('Creating new conversation:', {
        participants: newConversation.participants.map(p => p.toString()),
        participantTypes: newConversation.participantTypes,
        unreadCount: newConversation.unreadCount
      })
      
      await collection.insertOne(newConversation)
    }
  }

  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection(this.messagesCollection)

    await collection.deleteOne({
      _id: new ObjectId(messageId),
      senderId: new ObjectId(userId)
    })
  }

  static async getMessageById(messageId: string): Promise<Message | null> {
    const db = await getDatabase()
    const collection = db.collection(this.messagesCollection)

    const message = await collection.findOne({ _id: new ObjectId(messageId) })
    return message as Message | null
  }

  private static async getUserType(userId: string): Promise<'student' | 'alumni'> {
    try {
      const db = await getDatabase()
      const id = new ObjectId(userId)

      // Check students collection
      const student = await db.collection('students').findOne({ _id: id })
      if (student) return 'student'

      // Check alumni collection
      const alumni = await db.collection('alumni').findOne({ _id: id })
      if (alumni) return 'alumni'

      // Check admins just in case (treat as alumni-like for messaging with students)
      const admin = await db.collection('admins').findOne({ _id: id })
      if (admin) return 'alumni'

      // Default fallback
      return 'student'
    } catch (error) {
      console.error('Error getting user type:', error)
      return 'student'
    }
  }

  // Helper method to get unread count between two specific users
  private static async getUnreadCountBetweenUsers(senderId: string, recipientId: string): Promise<number> {
    const db = await getDatabase()
    const collection = db.collection(this.messagesCollection)

    const count = await collection.countDocuments({
      senderId: new ObjectId(senderId),
      recipientId: new ObjectId(recipientId),
      isRead: false
    })

    return count
  }

  // New method for LinkedIn-style messaging: send initial message with connection request
  static async sendMessageWithConnectionRequest(
    senderId: string, 
    request: SendMessageRequest
  ): Promise<{ message: Message, connection: any }> {
    const senderType = await this.getUserType(senderId)
    const recipientType = await this.getUserType(request.recipientId)

    // Only students can send connection requests with messages to alumni
    if (senderType !== 'student' || recipientType !== 'alumni') {
      throw new Error('Only students can send connection requests with messages to alumni')
    }

    // Check if connection already exists
    const existingConnection = await ConnectionService.getConnection(senderId, request.recipientId)
    if (existingConnection && existingConnection.status !== 'rejected') {
      throw new Error('Connection request already exists')
    }

    const db = await getDatabase()
    const messagesCollection = db.collection(this.messagesCollection)
    // Create or revive the connection request as pending
    const connection = await ConnectionService.createOrRevivePending(
      senderId,
      senderType,
      request.recipientId,
      recipientType,
      request.content
    ) as any

    // Create a special message to represent the connection request
    const message: Message = {
      senderId: new ObjectId(senderId),
      recipientId: new ObjectId(request.recipientId),
      senderType: senderType,
      recipientType: recipientType,
      content: request.content,
      messageType: 'connection_request', // Special message type
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      connectionId: connection._id, // Link to the connection
      fileUrl: request.fileUrl,
      fileName: request.fileName,
      fileSize: request.fileSize,
      mimeType: request.mimeType
    }

    const messageResult = await messagesCollection.insertOne(message)
    message._id = messageResult.insertedId

    // Create or update conversation
    await this.updateConversation(senderId, request.recipientId, message)

    return { message, connection }
  }

  // Method to handle connection request responses
  static async handleConnectionResponse(
    connectionId: string,
    status: 'accepted' | 'rejected',
    responderId: string
  ): Promise<void> {
    const db = await getDatabase()
    const connectionsCollection = db.collection('connections')
    const messagesCollection = db.collection(this.messagesCollection)

    // Update connection status
    await connectionsCollection.updateOne(
      { _id: new ObjectId(connectionId) },
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        } 
      }
    )

    // Get the connection details
    const connection = await connectionsCollection.findOne({ _id: new ObjectId(connectionId) })
    if (!connection) {
      throw new Error('Connection not found')
    }

    // Create a system message about the connection response
    const systemMessage: Message = {
      senderId: new ObjectId(responderId),
      recipientId: status === 'accepted' ? connection.requesterId : connection.requesterId,
      senderType: await this.getUserType(responderId),
      recipientType: await this.getUserType(connection.requesterId.toString()),
      content: status === 'accepted' 
        ? 'Connection request accepted.' 
        : 'Connection request declined.',
      messageType: 'system',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      connectionId: new ObjectId(connectionId)
    }

    await messagesCollection.insertOne(systemMessage)

    // Update conversation
    await this.updateConversation(
      responderId, 
      connection.requesterId.toString(), 
      systemMessage
    )
  }
} 