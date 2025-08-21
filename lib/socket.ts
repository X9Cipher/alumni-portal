import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from './auth'
import { MessageService } from './services/messageService'
import { ConnectionService } from './services/connectionService'

export interface SocketData {
  userId: string
  userType: 'student' | 'alumni' | 'admin'
}

export const initSocket = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    const httpServer: NetServer = (res.socket as any).server
    const io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
    })

    // Store user socket connections
    const userSockets = new Map<string, string>()

    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication error'))
        }

        const decoded = verifyToken(token)
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

    io.on('connection', (socket) => {
      console.log(`User ${socket.data.userId} connected`)

      // Join user to their personal room
      socket.join(`user:${socket.data.userId}`)

      // Handle sending messages
      socket.on('send-message', async (data) => {
        try {
          const { recipientId, content, messageType = 'text' } = data

          // Let MessageService enforce messaging rules (student↔alumni constraints, alumni↔alumni allowed)
          const message = await MessageService.sendMessage(socket.data.userId, {
            recipientId,
            content,
            messageType
          })

          // Emit to sender
          socket.emit('message-sent', { message })

          // Emit to recipient if online
          const recipientSocketId = userSockets.get(recipientId)
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('new-message', { message })
          }

        } catch (error: any) {
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
          await MessageService.markMessageAsRead(messageId, socket.data.userId)
          
          // Notify sender that message was read
          const message = await MessageService.getMessageById(messageId)
          if (message) {
            const senderSocketId = userSockets.get(message.senderId.toString())
            if (senderSocketId) {
              io.to(senderSocketId).emit('message-read', { messageId })
            }
          }
        } catch (error: any) {
          socket.emit('error', { message: error.message })
        }
      })

      // Handle connection requests
      socket.on('connection-request', async (data) => {
        try {
          const { recipientId, requesterType, recipientType } = data
          
          const connection = await ConnectionService.createConnectionRequest({
            requesterId: socket.data.userId,
            recipientId,
            requesterType,
            recipientType
          })

          // Notify recipient of new connection request
          const recipientSocketId = userSockets.get(recipientId)
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('connection-request', { connection })
          }

          socket.emit('connection-request-sent', { connection })

        } catch (error: any) {
          socket.emit('error', { message: error.message })
        }
      })

      // Handle connection responses
      socket.on('connection-response', async (data) => {
        try {
          const { connectionId, status } = data
          
          const connection = await ConnectionService.getConnectionById(connectionId)
          if (!connection) {
            socket.emit('error', { message: 'Connection not found' })
            return
          }

          const updatedConnection = await ConnectionService.respondToConnectionRequest(connectionId, {
            connectionId,
            status
          })

          // Notify requester of response
          const requesterSocketId = userSockets.get(connection.requesterId.toString())
          if (requesterSocketId) {
            io.to(requesterSocketId).emit('connection-response', { connection: updatedConnection })
          }

          socket.emit('connection-response-sent', { connection: updatedConnection })

        } catch (error: any) {
          socket.emit('error', { message: error.message })
        }
      })

      socket.on('disconnect', () => {
        console.log(`User ${socket.data.userId} disconnected`)
        userSockets.delete(socket.data.userId)
      })
    })

    ;(res.socket as any).server.io = io
  }

  return (res.socket as any).server.io
} 