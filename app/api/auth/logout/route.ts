import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the current session ID from cookies
    const sessionId = request.cookies.get('current-session')?.value
    
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    if (sessionId) {
      // Clear the session-specific auth token cookie
      response.cookies.set(`auth-token-${sessionId}`, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0 // Expire immediately
      })
      
      // Clear the session identifier cookie
      response.cookies.set('current-session', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0 // Expire immediately
      })
    } else {
      // Fallback: clear the old auth-token cookie if it exists
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0 // Expire immediately
      })
    }

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}