import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { EventService } from '@/lib/services/eventService'
import { CreateEventData } from '@/lib/models/Event'

export async function GET(request: NextRequest) {
  try {
    const events = await EventService.getAllEvents()
    
    return NextResponse.json({
      success: true,
      events
    })

  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Event creation request received')
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
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
        { error: 'Only admins and alumni can create events' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const { title, description, date, time, location, type, maxAttendees, isPublic } = body

    // Validate required fields
    if (!title || !description || !date || !time || !location || !type) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: title, description, date, time, location, and type are required' },
        { status: 400 }
      )
    }

    // Ensure we have firstName and lastName from token
    const firstName = decoded.firstName || 'Admin'
    const lastName = decoded.lastName || 'User'

    // Create event data
    const eventData: CreateEventData = {
      title,
      description,
      date,
      time,
      location,
      type,
      maxAttendees: maxAttendees || undefined,
      isPublic: isPublic !== false // Default to true
    }

    const organizer = {
      _id: decoded.userId,
      firstName,
      lastName,
      userType: decoded.userType
    }

    // Save to database
    const newEvent = await EventService.createEvent(eventData, organizer)

    console.log('New event created:', newEvent)

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: 'Event created successfully'
    })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}