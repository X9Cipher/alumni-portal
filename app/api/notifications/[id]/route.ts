import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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
    const { read } = body

    if (typeof read !== 'boolean') {
      return NextResponse.json({ error: 'Invalid read status' }, { status: 400 })
    }

    const db = await getDatabase()
    const notificationsCollection = db.collection('notifications')

    // Update notification
    const result = await notificationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          read,
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification updated successfully' 
    })

  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
