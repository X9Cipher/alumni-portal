const { MongoClient } = require('mongodb')

async function fixNotificationDates() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('alumni_portal')
    
    console.log('✅ Connected to MongoDB')
    
    // Find notifications with missing or invalid dates
    const notificationsCollection = db.collection('notifications')
    
    // Find notifications without createdAt or updatedAt
    const notificationsToFix = await notificationsCollection.find({
      $or: [
        { createdAt: { $exists: false } },
        { updatedAt: { $exists: false } },
        { createdAt: null },
        { updatedAt: null }
      ]
    }).toArray()
    
    console.log(`Found ${notificationsToFix.length} notifications to fix`)
    
    if (notificationsToFix.length > 0) {
      const now = new Date()
      
      // Update all notifications with missing dates
      const result = await notificationsCollection.updateMany(
        {
          $or: [
            { createdAt: { $exists: false } },
            { updatedAt: { $exists: false } },
            { createdAt: null },
            { updatedAt: null }
          ]
        },
        {
          $set: {
            createdAt: now,
            updatedAt: now
          }
        }
      )
      
      console.log(`✅ Fixed ${result.modifiedCount} notifications with missing dates`)
    }
    
    // Also check for notifications with invalid date strings
    const invalidDateNotifications = await notificationsCollection.find({
      $or: [
        { createdAt: 'Invalid Date' },
        { updatedAt: 'Invalid Date' }
      ]
    }).toArray()
    
    console.log(`Found ${invalidDateNotifications.length} notifications with 'Invalid Date' strings`)
    
    if (invalidDateNotifications.length > 0) {
      const now = new Date()
      
      const result = await notificationsCollection.updateMany(
        {
          $or: [
            { createdAt: 'Invalid Date' },
            { updatedAt: 'Invalid Date' }
          ]
        },
        {
          $set: {
            createdAt: now,
            updatedAt: now
          }
        }
      )
      
      console.log(`✅ Fixed ${result.modifiedCount} notifications with 'Invalid Date' strings`)
    }
    
    console.log('🎉 Notification dates cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error fixing notification dates:', error)
  } finally {
    await client.close()
  }
}

fixNotificationDates()
