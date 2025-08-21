import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

const STUDENTS_COLLECTION = 'students'
const ALUMNI_COLLECTION = 'alumni'
const ADMINS_COLLECTION = 'admins'

// GET - Fetch user by ID from any collection
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const resolved = 'then' in (context.params as any) ? await (context.params as Promise<{ id: string }>) : (context.params as { id: string })
    const userId = resolved.id
    console.log('API: Fetching user with ID:', userId)

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      console.log('API: Invalid ObjectId format:', userId)
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const objectId = new ObjectId(userId)
    console.log('API: Converted to ObjectId:', objectId.toString())

    // Search in all collections
    const collections = [STUDENTS_COLLECTION, ALUMNI_COLLECTION, ADMINS_COLLECTION]
    
    for (const collectionName of collections) {
      console.log('API: Searching in collection:', collectionName)
      const collection = db.collection(collectionName)
      const user = await collection.findOne({ _id: objectId })
      
      if (user) {
        console.log('API: User found in collection:', collectionName, 'User:', { 
          _id: user._id, 
          firstName: user.firstName, 
          lastName: user.lastName,
          userType: user.userType 
        })
        
        // Remove sensitive information
        const { password, ...userWithoutPassword } = user
        
        // Add computed fields
        const enrichedUser = {
          ...userWithoutPassword,
          _id: user._id?.toString(), // Convert ObjectId to string
          fullName: `${user.firstName} ${user.lastName}`,
          isOnline: false, // TODO: Implement online status
          profileViews: 0, // TODO: Implement profile views tracking
          connections: 0, // TODO: Implement connections counting
          mutualConnections: 0 // TODO: Implement mutual connections
        }

        return NextResponse.json({
          success: true,
          user: enrichedUser
        })
      } else {
        console.log('API: No user found in collection:', collectionName)
      }
    }

    // User not found in any collection
    console.log('API: User not found in any collection')
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )

  } catch (error) {
    console.error('API: Get user by ID error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

