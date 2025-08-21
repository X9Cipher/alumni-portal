const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

// Import MongoDB connection
const { MongoClient, ObjectId } = require('mongodb')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Prepare the Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Store user socket connections globally
const userSockets = new Map()
const userRooms = new Map() // Track which rooms users are in

// MongoDB connection (unified to alumni_portal database)
let db = null
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    const client = new MongoClient(uri)
    await client.connect()
    // Always use the alumni_portal database to keep collections consistent
    db = client.db('alumni_portal')
    console.log('✅ Connected to MongoDB (DB: alumni_portal)')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
  }
}

// Helper function to get user type from database (check across collections)
async function getUserType(userId) {
  try {
    if (!db) return 'student'
    const id = new ObjectId(userId)
    const students = db.collection('students')
    const alumni = db.collection('alumni')
    const admins = db.collection('admins')
    const [s, a, ad] = await Promise.all([
      students.findOne({ _id: id }),
      alumni.findOne({ _id: id }),
      admins.findOne({ _id: id })
    ])
    if (s) return 'student'
    if (a) return 'alumni'
    if (ad) return 'admin'
    return 'student'
  } catch (error) {
    console.error('Error getting user type:', error)
    return 'student'
  }
}



// Helper function to get conversation ID
async function getConversationId(userId1, userId2) {
  try {
    if (!db) return null
    
    const conversationsCollection = db.collection('conversations')
    const participantIds = [new ObjectId(userId1), new ObjectId(userId2)].sort()

    const conversation = await conversationsCollection.findOne({
      participants: { $all: participantIds }
    })

    return conversation ? conversation._id.toString() : null
  } catch (error) {
    console.error('Error getting conversation ID:', error)
    return null
  }
}

// Helper function to update conversation
async function updateConversation(userId1, userId2, lastMessage) {
  try {
    if (!db) {
      console.error('Database not connected')
      return
    }
    
    const conversationsCollection = db.collection('conversations')

    const participantIds = [new ObjectId(userId1), new ObjectId(userId2)].sort()

    const conversation = await conversationsCollection.findOne({
      participants: { $all: participantIds }
    })

    if (conversation) {
      // Update existing conversation - increment unread only for the recipient
      const isRecipient = lastMessage.recipientId.toString() === userId1 || lastMessage.recipientId.toString() === userId2
      const update = {
        $set: {
          lastMessage,
          lastMessageAt: lastMessage.createdAt,
          updatedAt: new Date()
        }
      }
      if (isRecipient) {
        update.$inc = { unreadCount: 1 }
      }
      await conversationsCollection.updateOne(
        { _id: conversation._id },
        update
      )
    } else {
      // Create new conversation
      const newConversation = {
        participants: participantIds,
        participantTypes: [lastMessage.senderType, lastMessage.recipientType],
        lastMessage,
        lastMessageAt: lastMessage.createdAt,
        unreadCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await conversationsCollection.insertOne(newConversation)
    }
  } catch (error) {
    console.error('Error updating conversation:', error)
  }
}

  app.prepare().then(async () => {
    // Connect to MongoDB
    await connectDB()
    
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new Server(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  // Socket.IO middleware for authentication
  io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded) {
        return next(new Error('Invalid token'))
      }

      socket.data = {
        userId: decoded.userId,
          userType: decoded.userType
      }

      // Store user's socket connection
      userSockets.set(decoded.userId, socket.id)

      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log(`User ${socket.data.userId} connected`)

    // Join user to their personal room
    socket.join(`user:${socket.data.userId}`)

    // Track user presence
    userRooms.set(socket.data.userId, {
      socketId: socket.id,
      userType: socket.data.userType,
      connectedAt: new Date(),
      isOnline: true
    })
    
    // Helper function to broadcast user status to relevant users
    const broadcastUserStatus = async (userId, isOnline) => {
      try {
        if (!db) return
        
        // Get users who have conversations with this user
        const conversationsCollection = db.collection('conversations')
        const conversations = await conversationsCollection.find({
          participants: new ObjectId(userId)
        }).toArray()
        
        // Broadcast status to conversation participants
        conversations.forEach(conversation => {
          conversation.participants.forEach(participantId => {
            if (participantId.toString() !== userId) {
              const participantSocketId = userSockets.get(participantId.toString())
              if (participantSocketId) {
                io.to(participantSocketId).emit('user-status-change', {
                  userId: userId,
                  isOnline: isOnline
                })
              }
            }
          })
        })
      } catch (error) {
        console.error('Error broadcasting user status:', error)
      }
    }
    
    // Broadcast user online status to relevant users
    broadcastUserStatus(socket.data.userId, true)

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { recipientId, content, messageType = 'text' } = data

          // Save message to database
          if (!db) {
            console.error('Database not connected')
            socket.emit('error', { message: 'Database connection failed' })
            return
          }
          
          const messagesCollection = db.collection('messages')

          // Get recipient user type from database
          const recipientType = await getUserType(recipientId)
          
        const message = {
            senderId: new ObjectId(socket.data.userId),
            recipientId: new ObjectId(recipientId),
            senderType: socket.data.userType,
            recipientType: recipientType,
          content: content,
          messageType: messageType,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }

          const result = await messagesCollection.insertOne(message)
          message._id = result.insertedId

          // Update or create conversation
          await updateConversation(socket.data.userId, recipientId, message)

          // Get conversation ID for both users
          const conversationId = await getConversationId(socket.data.userId, recipientId)

          // Emit to sender (include full message for client-side consistency)
          socket.emit('message-sent', {
            messageId: message._id,
            conversationId: conversationId,
            message: message
          })

          // Emit conversation update to sender to refresh their chat list
          socket.emit('conversation-updated', {
            conversationId: conversationId,
            lastMessage: message,
            unreadCount: 0
          })

        // Emit to recipient if online
        const recipientSocketId = userSockets.get(recipientId)
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('new-message', {
              message: message,
              conversationId: conversationId,
              sender: {
                _id: socket.data.userId,
                name: socket.data.userName || 'Unknown',
                userType: socket.data.userType
              }
            })
            
            // Also emit conversation update to refresh chat list
            io.to(recipientSocketId).emit('conversation-updated', {
              conversationId: conversationId,
              lastMessage: message,
              unreadCount: 1
            })
        }

      } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('error', { message: error.message })
      }
    })

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { recipientId } = data
      const recipientSocketId = userSockets.get(recipientId)
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user-typing', { userId: socket.data.userId })
      }
    })

    socket.on('typing-stop', (data) => {
      const { recipientId } = data
      const recipientSocketId = userSockets.get(recipientId)
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user-stopped-typing', { userId: socket.data.userId })
      }
    })

    // Handle message read receipts
    socket.on('mark-read', async (data) => {
      try {
        const { messageId } = data
        
          // Mark message as read in database
          if (!db) {
            console.error('Database not connected')
            socket.emit('error', { message: 'Database connection failed' })
            return
          }
          
          const messagesCollection = db.collection('messages')

          await messagesCollection.updateOne(
            { 
              _id: new ObjectId(messageId),
              recipientId: new ObjectId(socket.data.userId)
            },
            { 
              $set: { 
                isRead: true, 
                readAt: new Date(),
                updatedAt: new Date()
              } 
            }
          )
        
        // Notify sender that message was read
          const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) })
          if (message) {
            const senderSocketId = userSockets.get(message.senderId.toString())
            if (senderSocketId) {
              io.to(senderSocketId).emit('message-read', { messageId })
            }
          }

        socket.emit('message-read', { messageId })
      } catch (error) {
          console.error('Error marking message as read:', error)
          socket.emit('error', { message: error.message })
      }
    })

    // Handle connection requests
    socket.on('connection-request', async (data) => {
      try {
        const { recipientId, requesterType, recipientType } = data
        
          // Simple connection object for now
        const connection = {
          _id: Date.now().toString(),
          requesterId: socket.data.userId,
          recipientId,
          requesterType,
          recipientType,
          status: 'pending',
            createdAt: new Date()
        }

        // Notify recipient of new connection request
        const recipientSocketId = userSockets.get(recipientId)
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('connection-request', { connection })
        }

        socket.emit('connection-request-sent', { connection })

      } catch (error) {
          socket.emit('error', { message: error.message })
      }
    })

    // Handle connection responses
    socket.on('connection-response', async (data) => {
      try {
        const { connectionId, status } = data
        
          // Simple connection response for now
        const updatedConnection = {
          _id: connectionId,
          status,
          updatedAt: new Date()
        }

        socket.emit('connection-response-sent', { connection: updatedConnection })

      } catch (error) {
          socket.emit('error', { message: error.message })
        }
      })

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.userId} disconnected`)
      
      // Clean up user tracking
      userSockets.delete(socket.data.userId)
      userRooms.delete(socket.data.userId)

      // Broadcast user offline status
      broadcastUserStatus(socket.data.userId, false)
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying port ${port + 1}`)
      server.listen(port + 1, () => {
        console.log(`> Ready on http://${hostname}:${port + 1}`)
      })
    } else {
      console.error('Server error:', err)
    }
  })
})