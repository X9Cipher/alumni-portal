import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken, hashPassword, verifyPassword } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { UserService } from '@/lib/services/userService'
import { ObjectId } from 'mongodb'

// PUT /api/auth/password
// body: { currentPassword: string, newPassword: string }
export async function PUT(request: NextRequest) {
  try {
    const token = getCurrentSessionToken(request)
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const db = await getDatabase()
    const collectionName = UserService.getCollectionName(decoded.userType)
    const collection = db.collection(collectionName)
    const user = await collection.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await verifyPassword(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    const hashed = await hashPassword(newPassword)
    await collection.updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { password: hashed, updatedAt: new Date() } })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (e) {
    console.error('Password update error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


