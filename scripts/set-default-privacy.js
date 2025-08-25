const { MongoClient } = require('mongodb')

async function setDefaultPrivacySettings() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('alumni_portal')
    
    console.log('✅ Connected to MongoDB')
    
    // Update students collection
    const studentsResult = await db.collection('students').updateMany(
      { 
        $or: [
          { showEmailInProfile: { $exists: false } },
          { showPhoneInProfile: { $exists: false } }
        ]
      },
      { 
        $set: { 
          showEmailInProfile: true,
          showPhoneInProfile: false,
          updatedAt: new Date()
        }
      }
    )
    
    console.log(`✅ Updated ${studentsResult.modifiedCount} students with default privacy settings`)
    
    // Update alumni collection
    const alumniResult = await db.collection('alumni').updateMany(
      { 
        $or: [
          { showEmailInProfile: { $exists: false } },
          { showPhoneInProfile: { $exists: false } }
        ]
      },
      { 
        $set: { 
          showEmailInProfile: true,
          showPhoneInProfile: false,
          updatedAt: new Date()
        }
      }
    )
    
    console.log(`✅ Updated ${alumniResult.modifiedCount} alumni with default privacy settings`)
    
    // Update admins collection
    const adminsResult = await db.collection('admins').updateMany(
      { 
        $or: [
          { showEmailInProfile: { $exists: false } },
          { showPhoneInProfile: { $exists: false } }
        ]
      },
      { 
        $set: { 
          showEmailInProfile: true,
          showPhoneInProfile: false,
          updatedAt: new Date()
        }
      }
    )
    
    console.log(`✅ Updated ${adminsResult.modifiedCount} admins with default privacy settings`)
    
    console.log('🎉 Default privacy settings migration completed!')
    
  } catch (error) {
    console.error('❌ Error setting default privacy settings:', error)
  } finally {
    await client.close()
  }
}

setDefaultPrivacySettings()
