// Migration script to clear existing data and set up database collections
// Run this once to prepare your database for the new implementation

import * as dotenv from 'dotenv'
import { getDatabase } from '../lib/mongodb'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function migrate() {
  try {
    console.log('Starting database migration...')
    const db = await getDatabase()
    
    // Clear existing collections (removes all mock data)
    console.log('Clearing existing jobs...')
    await db.collection('jobs').deleteMany({})
    
    console.log('Clearing existing events...')
    await db.collection('events').deleteMany({})
    
    // Create indexes for better performance
    console.log('Creating database indexes...')
    
    // Jobs collection indexes
    await db.collection('jobs').createIndex({ createdAt: -1 })
    await db.collection('jobs').createIndex({ isActive: 1 })
    await db.collection('jobs').createIndex({ type: 1 })
    await db.collection('jobs').createIndex({ 'postedBy._id': 1 })
    
    // Events collection indexes
    await db.collection('events').createIndex({ createdAt: -1 })
    await db.collection('events').createIndex({ isActive: 1 })
    await db.collection('events').createIndex({ isPublic: 1 })
    await db.collection('events').createIndex({ date: 1 })
    await db.collection('events').createIndex({ type: 1 })
    await db.collection('events').createIndex({ 'organizer._id': 1 })
    
    console.log('✅ Migration completed successfully!')
    console.log('Your database is now ready to store jobs and events persistently.')
    console.log('You can now create new jobs and events through your application.')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()