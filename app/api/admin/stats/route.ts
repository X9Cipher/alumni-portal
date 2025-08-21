import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Simulate real-time engagement statistics
    // In a real application, this would fetch from your database
    const stats = {
      totalPosts: Math.floor(Math.random() * 500) + 150,
      totalComments: Math.floor(Math.random() * 1200) + 300,
      totalLikes: Math.floor(Math.random() * 2500) + 800,
      totalShares: Math.floor(Math.random() * 400) + 100,
      activeUsers: Math.floor(Math.random() * 50) + 20,
      onlineUsers: Math.floor(Math.random() * 25) + 10,
      pageViews: Math.floor(Math.random() * 5000) + 2000,
      newRegistrations: Math.floor(Math.random() * 10) + 2,
      jobPosts: Math.floor(Math.random() * 20) + 5,
      events: Math.floor(Math.random() * 15) + 3,
      recentActivity: [
        {
          id: 1,
          type: 'registration',
          message: 'New user registration',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          color: 'green'
        },
        {
          id: 2,
          type: 'job',
          message: 'Job post published',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          color: 'blue'
        },
        {
          id: 3,
          type: 'event',
          message: 'Event created',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          color: 'purple'
        },
        {
          id: 4,
          type: 'report',
          message: 'Content reported',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          color: 'orange'
        }
      ]
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}