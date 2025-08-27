import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { ConnectionService } from '@/lib/services/connectionService'

// GET /api/connections/status?userId=<targetUserId>
export async function GET(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')
    if (!targetUserId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const connection = await ConnectionService.getConnection(
      decoded.userId,
      targetUserId
    )

    if (!connection) {
      return NextResponse.json({ status: 'none' })
    }

    // If previously rejected, allow user to send request again by treating as none
    if (connection.status === 'rejected') {
      return NextResponse.json({ status: 'none' })
    }

    return NextResponse.json({
      status: connection.status || 'pending',
      connectionId: connection._id,
    })
  } catch (error) {
    console.error('connections/status GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


