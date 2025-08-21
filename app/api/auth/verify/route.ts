import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the current session ID from cookies
    const sessionId = request.cookies.get('current-session')?.value
    console.log('🔐 Verify route - Session ID from cookie:', sessionId)
    
    // Get the token using the session-specific approach
    const token = getCurrentSessionToken(request)
    console.log('🔐 Verify route - Token found:', !!token)
    
    if (!token) {
      console.log('🔐 Verify route - No token found')
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify the token
    const decoded = verifyToken(token)
    console.log('🔐 Verify route - Token decoded:', !!decoded)
    
    if (!decoded) {
      console.log('🔐 Verify route - Token verification failed')
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if the session ID in the token matches the cookie
    if (sessionId && decoded.sessionId !== sessionId) {
      console.log('🔐 Verify route - Session ID mismatch:', { 
        cookieSessionId: sessionId, 
        tokenSessionId: decoded.sessionId 
      })
      return NextResponse.json(
        { error: 'Session mismatch' },
        { status: 401 }
      )
    }

    console.log('🔐 Verify route - Authentication successful for user:', decoded.email)

    // Get user data from the appropriate collection
    const userData = await UserService.getUserById(decoded.userId, decoded.userType)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data with session ID
    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        sessionId: decoded.sessionId
      }
    })

  } catch (error: any) {
    console.error('Verify route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}