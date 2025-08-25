import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import { verifyToken, getCurrentSessionToken } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication using proper session token
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
    const { userId, userType } = body

    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'User ID and user type are required' },
        { status: 400 }
      )
    }

    // Prevent admin from deleting themselves
    if (decoded.userId === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user
    const success = await UserService.deleteUser(userId, userType)
    
    if (!success) {
      return NextResponse.json(
        { error: 'User not found or deletion failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}