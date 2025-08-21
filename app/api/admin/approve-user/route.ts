import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication using session-based token
    const token = getCurrentSessionToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, userType, isApproved } = body

    if (!userId || !userType || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID, user type, and approval status are required' },
        { status: 400 }
      )
    }

    // Update user approval status
    const success = await UserService.updateUserApproval(userId, userType, isApproved)
    
    if (!success) {
      return NextResponse.json(
        { error: 'User not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User ${isApproved ? 'approved' : 'rejected'} successfully`
    })

  } catch (error) {
    console.error('User approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}