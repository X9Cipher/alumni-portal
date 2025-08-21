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
    
    // Get alumni collection - only approved alumni
    const alumni = await db.collection('alumni').find(
      { 
        _id: { $ne: decoded.userId }, // Exclude current user
        isApproved: true // Only show approved alumni
      },
      { 
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          userType: 1,
          graduationYear: 1,
          degree: 1,
          major: 1,
          currentCompany: 1,
          currentPosition: 1,
          location: 1,
          profilePicture: 1,
          bio: 1,
          skills: 1,
          linkedinUrl: 1,
          githubUrl: 1,
          portfolioUrl: 1,
          isApproved: 1,
          createdAt: 1,
          isOnline: 1,
          profileViews: 1
        }
      }
    ).toArray()

    // Format the response
    const formattedAlumni = alumni.map(alumni => ({
      _id: alumni._id,
      firstName: alumni.firstName || '',
      lastName: alumni.lastName || '',
      fullName: `${alumni.firstName || ''} ${alumni.lastName || ''}`.trim() || 'Unknown Alumni',
      email: alumni.email || '',
      phone: alumni.phone || '',
      userType: 'alumni',
      graduationYear: alumni.graduationYear || '',
      degree: alumni.degree || '',
      major: alumni.major || '',
      currentCompany: alumni.currentCompany || '',
      currentPosition: alumni.currentPosition || '',
      location: alumni.location || '',
      profilePicture: alumni.profilePicture || '',
      bio: alumni.bio || '',
      skills: alumni.skills || [],
      linkedinUrl: alumni.linkedinUrl || '',
      githubUrl: alumni.githubUrl || '',
      portfolioUrl: alumni.portfolioUrl || '',
      isApproved: alumni.isApproved || false,
      createdAt: alumni.createdAt || new Date(),
      isOnline: alumni.isOnline || false,
      profileViews: alumni.profileViews || 0,
      connections: 0, // Will be calculated separately if needed
      mutualConnections: 0 // Will be calculated separately if needed
    }))

    return NextResponse.json({
      success: true,
      alumni: formattedAlumni
    })

  } catch (error: any) {
    console.error('Get alumni directory error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
