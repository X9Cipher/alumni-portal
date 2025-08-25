import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType')

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 })
    }

    // Verify the user is requesting their own notifications
    if (decoded.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const db = await getDatabase()
    const notificationsCollection = db.collection('notifications')

    // Fetch notifications for the user
    const notifications = await notificationsCollection
      .find({ 
        recipientId: userId,
        recipientType: userType 
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ 
      success: true, 
      notifications 
    })

  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { 
      recipientId, 
      recipientType, 
      type, 
      title, 
      message, 
      userId, 
      userFirstName, 
      userLastName, 
      userType,
      link 
    } = body

    // Validate required fields
    if (!recipientId || !recipientType || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDatabase()
    const notificationsCollection = db.collection('notifications')

    // Create notification
    const notification = {
      recipientId,
      recipientType,
      type,
      title,
      message,
      userId,
      userFirstName,
      userLastName,
      userType,
      link,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await notificationsCollection.insertOne(notification)

    return NextResponse.json({ 
      success: true, 
      notification: { ...notification, _id: result.insertedId }
    })

  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
