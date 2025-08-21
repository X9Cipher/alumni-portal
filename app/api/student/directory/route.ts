import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getCurrentSessionToken, verifyToken } from '@/lib/auth'

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

    const db = await getDatabase()
    
    // Get students collection
    const students = await db.collection('students').find(
      { _id: { $ne: decoded.userId } }, // Exclude current user
      { 
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          userType: 1,
          department: 1,
          currentYear: 1,
          graduationYear: 1,
          linkedinUrl: 1,
          profilePicture: 1,
          isOnline: 1
        }
      }
    ).toArray()

    // Format the response
    const formattedStudents = students.map(student => ({
      _id: student._id,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student',
      email: student.email || '',
      userType: 'student',
      department: student.department || 'Unknown Department',
      currentYear: student.currentYear || null,
      graduationYear: student.graduationYear || null,
      linkedinUrl: student.linkedinUrl || '',
      profilePicture: student.profilePicture || '',
      isOnline: student.isOnline || false
    }))

    return NextResponse.json({
      success: true,
      students: formattedStudents
    })

  } catch (error: any) {
    console.error('Get students directory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
