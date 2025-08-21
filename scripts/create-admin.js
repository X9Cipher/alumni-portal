const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_portal';

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('alumni_portal');
    const collection = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await collection.findOne({ 
      email: 'admin@college.edu', 
      userType: 'admin' 
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      email: 'admin@college.edu',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin',
      permissions: ['all'],
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(adminUser);
    console.log('Admin user created successfully!');
    console.log('Email: admin@college.edu');
    console.log('Password: admin123');
    console.log('User ID:', result.insertedId);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();