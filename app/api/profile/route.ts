import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
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

    // Get user profile based on user type and ID
    let userProfile
    if (decoded.userType === 'student') {
      const allUsers = await UserService.getAllUsers()
      userProfile = allUsers.students.find(user => user._id.toString() === decoded.userId)
    } else if (decoded.userType === 'alumni') {
      const allUsers = await UserService.getAllUsers()
      userProfile = allUsers.alumni.find(user => user._id.toString() === decoded.userId)
    } else if (decoded.userType === 'admin') {
      const allUsers = await UserService.getAllUsers()
      userProfile = allUsers.admins.find(user => user._id.toString() === decoded.userId)
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password, ...profileWithoutPassword } = userProfile

    return NextResponse.json({
      success: true,
      profile: profileWithoutPassword
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
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

    const updateData = await request.json()
    console.log('Update data received:', updateData)

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { password, _id, userType, isApproved, createdAt, updatedAt, ...allowedUpdates } = updateData
    console.log('Allowed updates:', allowedUpdates)
    console.log('User type:', decoded.userType)
    console.log('User ID:', decoded.userId)

    // Update user profile based on user type
    let updatedProfile
    if (decoded.userType === 'student') {
      console.log('Updating student profile...')
      updatedProfile = await UserService.updateStudent(decoded.userId, allowedUpdates)
    } else if (decoded.userType === 'alumni') {
      console.log('Updating alumni profile...')
      updatedProfile = await UserService.updateAlumni(decoded.userId, allowedUpdates)
    } else {
      return NextResponse.json(
        { error: 'Profile updates not supported for this user type' },
        { status: 403 }
      )
    }

    console.log('Updated profile result:', updatedProfile)

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 400 }
      )
    }

    // Remove password from response
    const { password: pwd, ...profileWithoutPassword } = updatedProfile

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profileWithoutPassword
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}