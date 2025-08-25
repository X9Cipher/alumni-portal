const { MongoClient } = require('mongodb')

async function fixNotificationLinks() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('alumni_portal')
    
    console.log('✅ Connected to MongoDB')
    
    const notificationsCollection = db.collection('notifications')
    
    // Fix job notifications - update to user-specific routes
    const jobResult = await notificationsCollection.updateMany(
      { 
        type: 'job',
        link: '/jobs'
      },
      [
        {
          $set: {
            link: {
              $cond: {
                if: { $eq: ['$recipientType', 'alumni'] },
                then: '/alumni/jobs',
                else: '/student/jobs'
              }
            }
          }
        }
      ]
    )
    
    console.log(`✅ Fixed ${jobResult.modifiedCount} job notification links`)
    
    // Fix event notifications - update to user-specific routes
    const eventResult = await notificationsCollection.updateMany(
      { 
        type: 'event',
        link: '/events'
      },
      [
        {
          $set: {
            link: {
              $cond: {
                if: { $eq: ['$recipientType', 'alumni'] },
                then: '/alumni/events',
                else: '/student/events'
              }
            }
          }
        }
      ]
    )
    
    console.log(`✅ Fixed ${eventResult.modifiedCount} event notification links`)
    
    // Fix post notifications - update to dashboard routes
    const postLikeResult = await notificationsCollection.updateMany(
      { 
        type: 'like',
        link: { $regex: /^\/posts\// }
      },
      [
        {
          $set: {
            link: {
              $cond: {
                if: { $eq: ['$recipientType', 'alumni'] },
                then: '/alumni',
                else: '/student'
              }
            }
          }
        }
      ]
    )
    
    console.log(`✅ Fixed ${postLikeResult.modifiedCount} post like notification links`)
    
    const postCommentResult = await notificationsCollection.updateMany(
      { 
        type: 'comment',
        link: { $regex: /^\/posts\// }
      },
      [
        {
          $set: {
            link: {
              $cond: {
                if: { $eq: ['$recipientType', 'alumni'] },
                then: '/alumni',
                else: '/student'
              }
            }
          }
        }
      ]
    )
    
    console.log(`✅ Fixed ${postCommentResult.modifiedCount} post comment notification links`)
    
    console.log('🎉 Notification links cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error fixing notification links:', error)
  } finally {
    await client.close()
  }
}

fixNotificationLinks()
