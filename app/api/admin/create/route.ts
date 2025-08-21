import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Admin creation not allowed in production' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, firstName, lastName } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create admin user
    const adminUser = await UserService.createAdminUser(email, password, firstName, lastName)
    
    // Remove password from response
    const { password: _, ...adminWithoutPassword } = adminUser

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: adminWithoutPassword
    }, { status: 201 })

  } catch (error: any) {
    console.error('Admin creation error:', error)
    
    if (error.message === 'Admin user already exists') {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}