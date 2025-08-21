const { MongoClient, ObjectId } = require('mongodb');

async function cleanInvalidConnections() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('connections');

    // Find connections where requesterId equals recipientId (self-connections)
    const invalidConnections = await collection.find({
      $expr: {
        $eq: ['$requesterId', '$recipientId']
      }
    }).toArray();

    console.log(`Found ${invalidConnections.length} invalid self-connections`);

    if (invalidConnections.length > 0) {
      console.log('Invalid connections:');
      invalidConnections.forEach((conn, index) => {
        console.log(`${index + 1}. Connection ID: ${conn._id}, User ID: ${conn.requesterId}, Status: ${conn.status}`);
      });

      // Delete invalid connections
      const result = await collection.deleteMany({
        $expr: {
          $eq: ['$requesterId', '$recipientId']
        }
      });

      console.log(`Deleted ${result.deletedCount} invalid connections`);
    } else {
      console.log('No invalid connections found');
    }

  } catch (error) {
    console.error('Error cleaning invalid connections:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Load environment variables
require('dotenv').config();

cleanInvalidConnections().catch(console.error);