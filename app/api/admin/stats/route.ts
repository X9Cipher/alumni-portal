import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getCurrentSessionToken } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using proper session token
    const token = getCurrentSessionToken(request)

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

    const db = await getDatabase()
    
    // Get real-time statistics from database with optimized queries
    const [
      studentsCount,
      alumniCount,
      adminsCount,
      jobsCount,
      eventsCount,
      postsCount
    ] = await Promise.all([
      // User counts - only count, don't fetch full documents
      db.collection('users').countDocuments({ userType: 'student' }),
      db.collection('users').countDocuments({ userType: 'alumni' }),
      db.collection('users').countDocuments({ userType: 'admin' }),
      
      // Content counts - only count, don't fetch full documents
      db.collection('jobs').countDocuments({ isActive: true }),
      db.collection('events').countDocuments({ isActive: true }),
      db.collection('posts').countDocuments({})
    ])

    // Calculate total users
    const totalUsers = studentsCount + alumniCount + adminsCount

    // Get recent activity with minimal data projection to reduce memory usage
    const [
      recentUsers,
      recentJobs,
      recentEvents,
      recentPosts
    ] = await Promise.all([
      // Only fetch essential fields for recent activity
      db.collection('users').find({}, { 
        projection: { _id: 1, firstName: 1, lastName: 1, userType: 1, createdAt: 1 } 
      }).sort({ createdAt: -1 }).limit(3).toArray(),
      
      db.collection('jobs').find({}, { 
        projection: { _id: 1, title: 1, company: 1, createdAt: 1 } 
      }).sort({ createdAt: -1 }).limit(3).toArray(),
      
      db.collection('events').find({}, { 
        projection: { _id: 1, title: 1, createdAt: 1 } 
      }).sort({ createdAt: -1 }).limit(3).toArray(),
      
      db.collection('posts').find({}, { 
        projection: { _id: 1, authorName: 1, createdAt: 1 } 
      }).sort({ createdAt: -1 }).limit(3).toArray()
    ])

    // Generate recent activity from real data with type safety
    const recentActivity: Array<{
      id: string
      type: string
      message: string
      timestamp: Date
      color: string
      userType?: string
      jobTitle?: string
      company?: string
      eventTitle?: string
      authorName?: string
    }> = []

    // Add recent user registrations (limit to 3 to reduce memory usage)
    recentUsers.slice(0, 3).forEach(user => {
      recentActivity.push({
        id: `user-${user._id}`,
        type: 'registration',
        message: `${user.firstName} ${user.lastName} (${user.userType}) joined the platform`,
        timestamp: user.createdAt,
        color: 'green',
        userType: user.userType
      })
    })

    // Add recent job posts (limit to 3 to reduce memory usage)
    recentJobs.slice(0, 3).forEach(job => {
      recentActivity.push({
        id: `job-${job._id}`,
        type: 'job',
        message: `Job posted: ${job.title} at ${job.company}`,
        timestamp: job.createdAt,
        color: 'blue',
        jobTitle: job.title,
        company: job.company
      })
    })

    // Add recent events (limit to 3 to reduce memory usage)
    recentEvents.slice(0, 3).forEach(event => {
      recentActivity.push({
        id: `event-${event._id}`,
        type: 'event',
        message: `Event created: ${event.title}`,
        timestamp: event.createdAt,
        color: 'purple',
        eventTitle: event.title
      })
    })

    // Add recent posts (limit to 3 to reduce memory usage)
    recentPosts.slice(0, 3).forEach(post => {
      recentActivity.push({
        id: `post-${post._id}`,
        type: 'post',
        message: `New community post by ${post.authorName || 'User'}`,
        timestamp: post.createdAt,
        color: 'orange',
        authorName: post.authorName
      })
    })

    // Sort by timestamp (most recent first) and limit to 10 items
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const limitedRecentActivity = recentActivity.slice(0, 10)

    // Get this month's stats with optimized queries
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const [
      thisMonthStudents,
      thisMonthAlumni,
      thisMonthJobs,
      thisMonthEvents
    ] = await Promise.all([
      db.collection('users').countDocuments({ 
        userType: 'student', 
        createdAt: { $gte: startOfMonth } 
      }),
      db.collection('users').countDocuments({ 
        userType: 'alumni', 
        createdAt: { $gte: startOfMonth } 
      }),
      db.collection('jobs').countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      }),
      db.collection('events').countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      })
    ])

    const stats = {
      totalUsers,
      students: studentsCount,
      alumni: alumniCount,
      admins: adminsCount,
      activeJobs: jobsCount,
      activeEvents: eventsCount,
      totalPosts: postsCount,
      thisMonthStudents,
      thisMonthAlumni,
      thisMonthJobs,
      thisMonthEvents,
      recentActivity: limitedRecentActivity // Limit to 10 most recent activities
    }

    // Clean up large arrays to free memory
    recentUsers.length = 0
    recentJobs.length = 0
    recentEvents.length = 0
    recentPosts.length = 0
    recentActivity.length = 0

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get stats error:', error)
    
    // Return a basic response if database operations fail
    if (error instanceof Error && error.message.includes('collection')) {
      console.error('Database connection error - returning fallback stats')
      return NextResponse.json({
        success: true,
        stats: {
          totalUsers: 0,
          students: 0,
          alumni: 0,
          admins: 0,
          activeJobs: 0,
          activeEvents: 0,
          totalPosts: 0,
          thisMonthStudents: 0,
          thisMonthAlumni: 0,
          thisMonthJobs: 0,
          thisMonthEvents: 0,
          recentActivity: []
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}