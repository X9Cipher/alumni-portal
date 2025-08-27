import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import { generateToken, verifyToken } from '@/lib/auth'
import { LoginCredentials } from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password || !body.userType) {
      return NextResponse.json(
        { error: 'Email, password, and user type are required' },
        { status: 400 }
      )
    }

    // Check if user exists first to return a clearer error
    const existing = await UserService.getUserByEmail(body.email)
    if (!existing) {
      return NextResponse.json(
        { error: 'Not registered' },
        { status: 404 }
      )
    }

    // Authenticate user
    const user = await UserService.authenticateUser(body)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token with unique session ID
    const token = generateToken(user)
    
    // Extract the session ID from the generated token
    const decoded = verifyToken(token)
    if (!decoded || !decoded.sessionId) {
      return NextResponse.json(
        { error: 'Failed to generate session' },
        { status: 500 }
      )
    }
    
    const sessionId = decoded.sessionId
    
    // Create a unique cookie name that includes the session ID
    const cookieName = `auth-token-${sessionId}`

    // Create response with user data (excluding password)
    const { password, ...userWithoutPassword } = user
    
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      sessionId
    })

    // Set HTTP-only cookie for token with unique session ID
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cross-tab access
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    // Also set a session identifier cookie to track which session this is
    response.cookies.set('current-session', sessionId, {
      httpOnly: false, // Allow JavaScript access to identify the session
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    console.log('🔐 Login successful - Cookies set:', {
      sessionId,
      cookieName,
      tokenLength: token.length,
      currentSessionCookie: 'current-session'
    })

    return response

  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.message === 'Account pending approval') {
      return NextResponse.json(
        { error: 'Your account is pending admin approval' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}