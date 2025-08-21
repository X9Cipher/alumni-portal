import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services/userService'

export async function GET(request: NextRequest) {
  try {
    const allUsers = await UserService.getAllUsers()
    
    return NextResponse.json({
      success: true,
      counts: {
        students: allUsers.students.length,
        alumni: allUsers.alumni.length,
        admins: allUsers.admins.length
      },
      sampleIds: {
        studentIds: allUsers.students.slice(0, 3).map(s => s._id?.toString()),
        alumniIds: allUsers.alumni.slice(0, 3).map(a => a._id?.toString())
      }
    })
    
  } catch (error) {
    console.error('Users count error:', error)
    return NextResponse.json(
      { error: 'Failed to get users count', details: error.message },
      { status: 500 }
    )
  }
}