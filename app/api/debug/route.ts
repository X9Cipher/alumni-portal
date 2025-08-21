import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    console.log('Debug - Token found:', !!token)
    
    if (!token) {
      return NextResponse.json({
        error: 'No token found',
        cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
      }, { status: 401 })
    }

    const decoded = verifyToken(token)
    console.log('Debug - Token decoded:', decoded)
    
    if (!decoded) {
      return NextResponse.json({
        error: 'Invalid token',
        token: token.substring(0, 20) + '...'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: decoded,
      tokenLength: token.length
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error.message
    }, { status: 500 })
  }
}