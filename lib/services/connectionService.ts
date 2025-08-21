import { getDatabase } from '@/lib/mongodb'
import { Connection, ConnectionRequest, ConnectionResponse } from '@/lib/models/Connection'
import { ObjectId } from 'mongodb'

export class ConnectionService {
  private static collection = 'connections'

  static async createConnectionRequest(request: ConnectionRequest): Promise<Connection> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    // Prevent self-connections
    if (request.requesterId === request.recipientId) {
      throw new Error('Cannot create connection request to yourself')
    }

    // Check if connection already exists
    const existingConnection = await collection.findOne({
      $or: [
        { requesterId: new ObjectId(request.requesterId), recipientId: new ObjectId(request.recipientId) },
        { requesterId: new ObjectId(request.recipientId), recipientId: new ObjectId(request.requesterId) }
      ]
    })

    if (existingConnection) {
      throw new Error('Connection request already exists')
    }

    const connection: Connection = {
      requesterId: new ObjectId(request.requesterId),
      recipientId: new ObjectId(request.recipientId),
      status: 'pending',
      requesterType: request.requesterType,
      recipientType: request.recipientType,
      message: request.message, // Add message field
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(connection)
    connection._id = result.insertedId

    return connection
  }

  // New method for creating connection requests with messages
  static async createConnectionRequestWithMessage(
    requesterId: string,
    requesterType: string,
    recipientId: string,
    recipientType: string,
    message?: string
  ): Promise<Connection> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    // Prevent self-connections
    if (requesterId === recipientId) {
      throw new Error('Cannot create connection request to yourself')
    }

    // Check if connection already exists
    const existingConnection = await collection.findOne({
      $or: [
        { requesterId: new ObjectId(requesterId), recipientId: new ObjectId(recipientId) },
        { requesterId: new ObjectId(recipientId), recipientId: new ObjectId(requesterId) }
      ]
    })

    if (existingConnection) {
      throw new Error('Connection request already exists')
    }

    const connection: Connection = {
      requesterId: new ObjectId(requesterId),
      recipientId: new ObjectId(recipientId),
      status: 'pending',
      requesterType: requesterType,
      recipientType: recipientType,
      message: message, // Include the initial message
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(connection)
    connection._id = result.insertedId

    return connection
  }

  // New method for creating connections
  static async createConnection(
    requesterId: string, 
    requesterType: string, 
    recipientId: string, 
    recipientType: string
  ): Promise<Connection> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    // Prevent self-connections
    if (requesterId === recipientId) {
      throw new Error('Cannot create connection request to yourself')
    }

    // Check if connection already exists
    const existingConnection = await collection.findOne({
      $or: [
        { requesterId: new ObjectId(requesterId), recipientId: new ObjectId(recipientId) },
        { requesterId: new ObjectId(recipientId), recipientId: new ObjectId(requesterId) }
      ]
    })

    if (existingConnection) {
      throw new Error('Connection already exists')
    }

    const connection: Connection = {
      requesterId: new ObjectId(requesterId),
      recipientId: new ObjectId(recipientId),
      status: 'pending',
      requesterType: requesterType,
      recipientType: recipientType,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(connection)
    connection._id = result.insertedId

    return connection
  }

  static async respondToConnectionRequest(connectionId: string, response: ConnectionResponse): Promise<Connection> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    const updateData: any = {
      status: response.status,
      updatedAt: new Date()
    }

    if (response.status === 'accepted') {
      updateData.acceptedAt = new Date()
    } else if (response.status === 'rejected') {
      updateData.rejectedAt = new Date()
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(connectionId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      throw new Error('Connection not found')
    }

    return result as Connection
  }

  // New method for updating connections
  static async updateConnection(connectionId: string, status: string): Promise<Connection | null> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    const updateData: any = {
      status: status,
      updatedAt: new Date()
    }

    if (status === 'accepted') {
      updateData.acceptedAt = new Date()
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date()
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(connectionId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result as Connection | null
  }

  static async getConnectionStatus(userId: string, otherUserId: string): Promise<Connection | null> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    const connection = await collection.findOne({
      $or: [
        { requesterId: new ObjectId(userId), recipientId: new ObjectId(otherUserId) },
        { requesterId: new ObjectId(otherUserId), recipientId: new ObjectId(userId) }
      ]
    })

    return connection as Connection | null
  }

  // New method for getting a specific connection
  static async getConnection(userId: string, otherUserId: string): Promise<Connection | null> {
    return this.getConnectionStatus(userId, otherUserId)
  }

  static async getPendingConnections(userId: string): Promise<Connection[]> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    const connections = await collection.find({
      recipientId: new ObjectId(userId),
      status: 'pending'
    }).toArray()

    return connections as Connection[]
  }

  static async getPendingConnectionsWithUserInfo(userId: string): Promise<any[]> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)
    const objectId = new ObjectId(userId)
    const query = { recipientId: objectId, status: 'pending' }
    // Join both 'alumni' and 'students' collections for requester info
    const connections = await collection.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'alumni',
          localField: 'requesterId',
          foreignField: '_id',
          as: 'alumniRequester'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'requesterId',
          foreignField: '_id',
          as: 'studentRequester'
        }
      },
      {
        $addFields: {
          requester: {
            $cond: [
              { $gt: [{ $size: '$alumniRequester' }, 0] },
              { $arrayElemAt: ['$alumniRequester', 0] },
              { $arrayElemAt: ['$studentRequester', 0] }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          requesterId: 1,
          recipientId: 1,
          status: 1,
          message: 1,
          requesterType: 1,
          recipientType: 1,
          createdAt: 1,
          updatedAt: 1,
          requester: {
            _id: '$requester._id',
            firstName: '$requester.firstName',
            lastName: '$requester.lastName',
            email: '$requester.email',
            userType: '$requester.userType',
            department: '$requester.department',
            currentCompany: '$requester.currentCompany',
            currentRole: '$requester.currentRole',
            currentYear: '$requester.currentYear',
            graduationYear: '$requester.graduationYear'
          }
        }
      }
    ]).toArray()
    return connections
  }

  static async getAcceptedConnections(userId: string): Promise<Connection[]> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    const connections = await collection.find({
      $or: [
        { requesterId: new ObjectId(userId), status: 'accepted' },
        { recipientId: new ObjectId(userId), status: 'accepted' }
      ]
    }).toArray()

    return connections as Connection[]
  }

  // New comprehensive method for getting all connections with user info
  static async getConnections(
    userId: string, 
    userType: string, 
    type: string = 'all', 
    withUserInfo: boolean = false
  ): Promise<any[]> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)
    const objectId = new ObjectId(userId)

    let matchQuery: any = {}
    
    if (type === 'pending') {
      matchQuery = { 
        $or: [
          { recipientId: objectId, status: 'pending' },
          { requesterId: objectId, status: 'pending' }
        ]
      }
    } else if (type === 'accepted') {
      matchQuery = { 
        $or: [
          { requesterId: objectId, status: 'accepted' },
          { recipientId: objectId, status: 'accepted' }
        ]
      }
    } else {
      // 'all' - get all connections for the user
      matchQuery = { 
        $or: [
          { requesterId: objectId },
          { recipientId: objectId }
        ]
      }
    }

    if (!withUserInfo) {
      const connections = await collection.find(matchQuery).toArray()
      return connections
    }

    // With user info - use aggregation to join user data
    const connections = await collection.aggregate([
      { $match: matchQuery },
      // Lookup requester info
      {
        $lookup: {
          from: 'alumni',
          localField: 'requesterId',
          foreignField: '_id',
          as: 'alumniRequester'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'requesterId',
          foreignField: '_id',
          as: 'studentRequester'
        }
      },
      // Lookup recipient info
      {
        $lookup: {
          from: 'alumni',
          localField: 'recipientId',
          foreignField: '_id',
          as: 'alumniRecipient'
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'recipientId',
          foreignField: '_id',
          as: 'studentRecipient'
        }
      },
      // Add requester and recipient fields
      {
        $addFields: {
          requester: {
            $cond: [
              { $gt: [{ $size: '$alumniRequester' }, 0] },
              { $arrayElemAt: ['$alumniRequester', 0] },
              { $arrayElemAt: ['$studentRequester', 0] }
            ]
          },
          recipient: {
            $cond: [
              { $gt: [{ $size: '$alumniRecipient' }, 0] },
              { $arrayElemAt: ['$alumniRecipient', 0] },
              { $arrayElemAt: ['$studentRecipient', 0] }
            ]
          }
        }
      },
      // Project the final fields
      {
        $project: {
          _id: 1,
          requesterId: 1,
          recipientId: 1,
          status: 1,
          message: 1,
          requesterType: 1,
          recipientType: 1,
          createdAt: 1,
          updatedAt: 1,
          requester: {
            _id: '$requester._id',
            firstName: '$requester.firstName',
            lastName: '$requester.lastName',
            email: '$requester.email',
            userType: '$requester.userType',
            department: '$requester.department',
            currentCompany: '$requester.currentCompany',
            currentRole: '$requester.currentRole',
            currentYear: '$requester.currentYear',
            graduationYear: '$requester.graduationYear',
            avatar: '$requester.avatar',
            profilePicture: '$requester.profilePicture',
            location: '$requester.location'
          },
          recipient: {
            _id: '$recipient._id',
            firstName: '$recipient.firstName',
            lastName: '$recipient.lastName',
            email: '$recipient.email',
            userType: '$recipient.userType',
            department: '$recipient.department',
            currentCompany: '$recipient.currentCompany',
            currentRole: '$recipient.currentRole',
            currentYear: '$recipient.currentYear',
            graduationYear: '$recipient.graduationYear',
            avatar: '$recipient.avatar',
            profilePicture: '$recipient.profilePicture',
            location: '$recipient.location'
          }
        }
      }
    ]).toArray()

    return connections
  }

  static async hasAcceptedConnection(userId1: string, userId2: string): Promise<boolean> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    const connection = await collection.findOne({
      $or: [
        { requesterId: new ObjectId(userId1), recipientId: new ObjectId(userId2), status: 'accepted' },
        { requesterId: new ObjectId(userId2), recipientId: new ObjectId(userId1), status: 'accepted' }
      ]
    })

    return !!connection
  }

  static async canMessage(userId: string, otherUserId: string): Promise<boolean> {
    const connection = await this.getConnectionStatus(userId, otherUserId)
    return connection?.status === 'accepted'
  }

  static async getConnectionById(connectionId: string): Promise<Connection | null> {
    const db = await getDatabase()
    const collection = db.collection(this.collection)

    const connection = await collection.findOne({ _id: new ObjectId(connectionId) })
    return connection as Connection | null
  }
} 