import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'
import { UserService } from '@/lib/services/userService'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication using new session system
    const token = getCurrentSessionToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    // Force search to only return alumni everywhere
    const type = 'alumni'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        users: []
      })
    }

    const users = await UserService.searchUsers(query, type, limit)

    return NextResponse.json({
      success: true,
      users
    })

  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
