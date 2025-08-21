import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services/messageService'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, content, messageType = 'text' } = body

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Recipient ID and content are required' },
        { status: 400 }
      )
    }

    console.log('[connection-request] senderId:', decoded.userId, 'recipientId:', recipientId)

    const result = await MessageService.sendMessageWithConnectionRequest(decoded.userId, {
      recipientId,
      content,
      messageType
    })

    return NextResponse.json({
      success: true,
      message: result.message,
      connection: result.connection
    })

  } catch (error: any) {
    console.error('Connection request error:', error?.message || error)
    const msg = String(error?.message || '')
    if (msg.includes('Only students can send connection requests')) {
      return NextResponse.json({ error: msg }, { status: 403 })
    }
    if (msg.includes('Connection request already exists')) {
      return NextResponse.json({ error: msg }, { status: 409 })
    }
    return NextResponse.json({ error: msg || 'Failed to send connection request' }, { status: 500 })
  }
}


