import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import { RegisterData } from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json()
    
    // Validate required fields (minimal)
    if (!body.email || !body.password || !body.userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create user
    const user = await UserService.createUser(body)
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}