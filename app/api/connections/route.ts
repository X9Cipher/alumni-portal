import { NextRequest, NextResponse } from 'next/server'
import { ConnectionService } from '@/lib/services/connectionService'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { NotificationService } from '@/lib/services/notificationService'

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

    // Send notification if connection is accepted
    if (status === 'accepted' && connection) {
      try {
        // Determine who is the student (recipient) and who is the alumni (requester)
        let studentId: string
        let alumniId: string
        let alumniFirstName: string
        let alumniLastName: string

        if (connection.requesterType === 'student') {
          studentId = connection.requesterId.toString()
          alumniId = connection.recipientId.toString()
          alumniFirstName = connection.recipient?.firstName || 'Alumni'
          alumniLastName = connection.recipient?.lastName || 'User'
        } else {
          studentId = connection.recipientId.toString()
          alumniId = connection.requesterId.toString()
          alumniFirstName = connection.requester?.firstName || 'Alumni'
          alumniLastName = connection.requester?.lastName || 'User'
        }

        await NotificationService.notifyConnectionAccepted({
          studentId,
          alumniId,
          alumniFirstName,
          alumniLastName
        })
        console.log('Connection acceptance notification sent')
      } catch (notificationError) {
        console.error('Failed to send connection notification:', notificationError)
        // Don't fail the connection update if notifications fail
      }
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
