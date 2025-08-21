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

    // Get all users
    const allUsers = await UserService.getAllUsers()
    
    // Remove passwords from response
    const sanitizedUsers = {
      students: allUsers.students.map(user => {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      }),
      alumni: allUsers.alumni.map(user => {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      }),
      admins: allUsers.admins.map(user => {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      })
    }

    return NextResponse.json({
      success: true,
      users: sanitizedUsers
    })

  } catch (error) {
    console.error('Get all users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}