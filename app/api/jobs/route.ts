import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getCurrentSessionToken } from '@/lib/auth'
import { JobService } from '@/lib/services/jobService'
import { CreateJobData } from '@/lib/models/Job'
import { NotificationService } from '@/lib/services/notificationService'

export async function GET(request: NextRequest) {
  try {
    const jobs = await JobService.getAllJobs()
    
    return NextResponse.json({
      success: true,
      jobs
    })

  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Job creation request received')
    
    // Verify authentication using proper session token
    const token = getCurrentSessionToken(request)
    console.log('Token found:', !!token)

    if (!token) {
      console.log('No auth token provided')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    console.log('Decoded token:', decoded)
    
    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // For development: Allow fallback admin user if no firstName/lastName in token
    if (!decoded.firstName || !decoded.lastName) {
      console.log('Token missing name fields, using fallback')
      decoded.firstName = 'Admin'
      decoded.lastName = 'User'
    }
    
    if (decoded.userType !== 'admin' && decoded.userType !== 'alumni') {
      console.log('Insufficient permissions:', decoded.userType)
      return NextResponse.json(
        { error: 'Only admins and alumni can post jobs' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { title, company, location, type, salary, description, requirements } = body

    // Validate required fields
    if (!title || !company || !location || !type || !description) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: title, company, location, type, and description are required' },
        { status: 400 }
      )
    }

    // Ensure we have firstName and lastName from token
    const firstName = decoded.firstName || 'Admin'
    const lastName = decoded.lastName || 'User'

    // Create job data
    const jobData: CreateJobData = {
      title,
      company,
      location,
      type,
      salary: salary || '',
      description,
      requirements: requirements || []
    }

    const postedBy = {
      _id: decoded.userId,
      firstName,
      lastName,
      userType: decoded.userType
    }

    // Save to database
    const newJob = await JobService.createJob(jobData, postedBy)

    // Send notifications to all alumni
    if (newJob && newJob._id) {
      try {
        await NotificationService.notifyNewJob({
          _id: newJob._id.toString(),
          title,
          company,
          postedBy
        })
        console.log('Notifications sent for new job')
      } catch (notificationError) {
        console.error('Failed to send job notifications:', notificationError)
        // Don't fail the job creation if notifications fail
      }
    }

    console.log('New job created:', newJob)

    return NextResponse.json({
      success: true,
      job: newJob,
      message: 'Job post created successfully'
    })

  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}