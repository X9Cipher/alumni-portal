import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const token = getCurrentSessionToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, userType } = body

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 })
    }

    // Verify the user is updating their own notifications
    if (decoded.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const db = await getDatabase()
    const notificationsCollection = db.collection('notifications')

    // Mark all notifications as read for the user
    const result = await notificationsCollection.updateMany(
      { 
        recipientId: userId,
        recipientType: userType,
        read: false
      },
      { 
        $set: { 
          read: true,
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    })

  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
