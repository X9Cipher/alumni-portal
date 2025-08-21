import { NextRequest, NextResponse } from 'next/server'
import { ConnectionService } from '@/lib/services/connectionService'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const withUserInfo = searchParams.get('withUserInfo') === 'true'

    // Always fetch with user info to display names properly
    const connections = await ConnectionService.getConnections(
      decoded.userId,
      decoded.userType,
      type,
      true // Always fetch user info
    )

    return NextResponse.json({
      success: true,
      connections
    })

  } catch (error: any) {
    console.error('Get connections error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipientId, recipientType, message } = body

    if (!recipientId || !recipientType) {
      return NextResponse.json(
        { error: 'Recipient ID and type are required' },
        { status: 400 }
      )
    }

    // Check if connection already exists
    const existingConnection = await ConnectionService.getConnection(
      decoded.userId,
      recipientId
    )

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 400 }
      )
    }

    // Create connection request with optional message
    const connection = await ConnectionService.createConnectionRequestWithMessage(
      decoded.userId,
      decoded.userType,
      recipientId,
      recipientType,
      message
    )

    return NextResponse.json({
      success: true,
      connection
    })

  } catch (error: any) {
    console.error('Create connection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { connectionId, status } = body

    if (!connectionId || !status) {
      return NextResponse.json(
        { error: 'Connection ID and status are required' },
        { status: 400 }
      )
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either accepted or rejected' },
        { status: 400 }
      )
    }

    // Update connection
    const connection = await ConnectionService.updateConnection(
      connectionId,
      status
    )

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      connection
    })

  } catch (error: any) {
    console.error('Update connection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
