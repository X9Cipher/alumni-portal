const { MongoClient, ObjectId } = require('mongodb');

async function debugConnections() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB for debugging');

    const db = client.db();
    
    // Check connections collection
    const connectionsCollection = db.collection('connections');
    const allConnections = await connectionsCollection.find({}).toArray();
    
    console.log(`📊 Total connections in database: ${allConnections.length}`);
    
    if (allConnections.length > 0) {
      console.log('\n🔍 All connections:');
      allConnections.forEach((conn, index) => {
        console.log(`${index + 1}. ID: ${conn._id}`);
        console.log(`   Requester: ${conn.requesterId} (${conn.requesterType})`);
        console.log(`   Recipient: ${conn.recipientId} (${conn.recipientType})`);
        console.log(`   Status: ${conn.status}`);
        console.log(`   Created: ${conn.createdAt}`);
        console.log('');
      });
    }

    // Check for specific patterns
    const pendingConnections = await connectionsCollection.find({ status: 'pending' }).toArray();
    console.log(`⏳ Pending connections: ${pendingConnections.length}`);
    
    const acceptedConnections = await connectionsCollection.find({ status: 'accepted' }).toArray();
    console.log(`✅ Accepted connections: ${acceptedConnections.length}`);
    
    const studentToAlumniRequests = await connectionsCollection.find({
      requesterType: 'student',
      recipientType: 'alumni'
    }).toArray();
    console.log(`🎓➡️👩‍💼 Student to Alumni requests: ${studentToAlumniRequests.length}`);
    
    // Check users
    const studentsCollection = db.collection('students');
    const alumniCollection = db.collection('alumni');
    
    const totalStudents = await studentsCollection.countDocuments();
    const totalAlumni = await alumniCollection.countDocuments();
    
    console.log(`\n👥 Total users:`);
    console.log(`   Students: ${totalStudents}`);
    console.log(`   Alumni: ${totalAlumni}`);

    // Sample users
    const sampleStudent = await studentsCollection.findOne({});
    const sampleAlumni = await alumniCollection.findOne({});
    
    if (sampleStudent) {
      console.log(`\n🎓 Sample student: ${sampleStudent.firstName} ${sampleStudent.lastName} (${sampleStudent._id})`);
    }
    
    if (sampleAlumni) {
      console.log(`👩‍💼 Sample alumni: ${sampleAlumni.firstName} ${sampleAlumni.lastName} (${sampleAlumni._id})`);
    }

  } catch (error) {
    console.error('❌ Error debugging connections:', error);
  } finally {
    await client.close();
    console.log('🔗 Database connection closed');
  }
}

// Load environment variables
require('dotenv').config();

debugConnections().catch(console.error);