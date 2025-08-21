import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Get all pending users
    const pendingUsers = await UserService.getAllPendingUsers()
    
    // Remove passwords from response
    const usersWithoutPasswords = pendingUsers.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json({
      success: true,
      users: usersWithoutPasswords
    })

  } catch (error) {
    console.error('Get pending users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}