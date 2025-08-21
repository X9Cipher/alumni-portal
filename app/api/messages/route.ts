import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services/messageService'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { SendMessageRequest } from '@/lib/models/Message'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication using new session system
    const token = getCurrentSessionToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body: SendMessageRequest = await request.json()
    
    // Validate required fields
    if (!body.recipientId || !body.content) {
      return NextResponse.json(
        { error: 'Recipient ID and content are required' },
        { status: 400 }
      )
    }

    const message = await MessageService.sendMessage(decoded.userId, body)

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error: any) {
    console.error('Send message error:', error)
    
    if (error.message === 'Cannot send message. Users must be connected.') {
      return NextResponse.json(
        { error: 'Cannot send message. Users must be connected.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication using new session system
    const token = getCurrentSessionToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'conversations' or 'messages'
    const otherUserId = searchParams.get('userId')

    if (type === 'conversations') {
      const conversations = await MessageService.getConversations(decoded.userId)
      return NextResponse.json({
        success: true,
        conversations
      })
    } else if (type === 'messages' && otherUserId) {
      console.log('Messages API: Getting messages for users:', { userId: decoded.userId, otherUserId })
      const messages = await MessageService.getMessages(decoded.userId, otherUserId)
      console.log('Messages API: Retrieved messages:', messages)
      return NextResponse.json({
        success: true,
        messages
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication using new session system
    const token = getCurrentSessionToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action, messageId, otherUserId } = body

    if (action === 'mark-read' && messageId) {
      await MessageService.markMessageAsRead(messageId, decoded.userId)
    } else if (action === 'mark-conversation-read' && otherUserId) {
      await MessageService.markConversationAsRead(decoded.userId, otherUserId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {
    console.error('Update message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 