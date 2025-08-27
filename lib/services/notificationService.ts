import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export class NotificationService {
  static async createNotification(notificationData: {
    recipientId: string
    recipientType: 'student' | 'alumni' | 'admin'
    type: 'job' | 'event' | 'like' | 'comment' | 'connection'
    title: string
    message: string
    userId?: string
    userFirstName?: string
    userLastName?: string
    userType?: 'student' | 'alumni' | 'admin'
    link?: string
  }) {
    try {
      const db = await getDatabase()
      const notificationsCollection = db.collection('notifications')

      const now = new Date()
      console.log('Creating notification with date:', now, 'Type:', typeof now, 'Valid:', !isNaN(now.getTime()))

      const notification = {
        ...notificationData,
        read: false,
        createdAt: now,
        updatedAt: now
      }

      const result = await notificationsCollection.insertOne(notification)
      console.log('Notification created successfully with ID:', result.insertedId)
      return { ...notification, _id: result.insertedId }
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Notify all alumni and students when a new job is posted
  static async notifyNewJob(jobData: {
    _id: string
    title: string
    company: string
    postedBy: {
      _id: string
      firstName: string
      lastName: string
      userType: string
    }
  }) {
    try {
      const db = await getDatabase()
      const alumniCollection = db.collection('alumni')
      const studentsCollection = db.collection('students')

      // Get all alumni and student IDs
      const [alumni, students] = await Promise.all([
        alumniCollection.find({}, { projection: { _id: 1 } }).toArray(),
        studentsCollection.find({}, { projection: { _id: 1 } }).toArray()
      ])

      // Create notifications for all alumni and students
      const notifications = [
        ...alumni.map(alumnus => ({
          recipientId: alumnus._id.toString(),
          recipientType: 'alumni' as const,
          type: 'job' as const,
          title: 'New Job Opportunity',
          message: `A new job posting "${jobData.title}" at ${jobData.company} has been added.`,
          userId: jobData.postedBy._id,
          userFirstName: jobData.postedBy.firstName,
          userLastName: jobData.postedBy.lastName,
          userType: jobData.postedBy.userType as 'student' | 'alumni' | 'admin',
          link: `/alumni/jobs`, // Navigate to alumni jobs page
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        ...students.map(student => ({
          recipientId: student._id.toString(),
          recipientType: 'student' as const,
          type: 'job' as const,
          title: 'New Job Opportunity',
          message: `A new job posting "${jobData.title}" at ${jobData.company} has been added.`,
          userId: jobData.postedBy._id,
          userFirstName: jobData.postedBy.firstName,
          userLastName: jobData.postedBy.lastName,
          userType: jobData.postedBy.userType as 'student' | 'alumni' | 'admin',
          link: `/student/jobs`, // Navigate to student jobs page
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      ]

      // Insert all notifications
      if (notifications.length > 0) {
        const db = await getDatabase()
        const notificationsCollection = db.collection('notifications')
        await notificationsCollection.insertMany(notifications)
      }

      return notifications.length
    } catch (error) {
      console.error('Error notifying new job:', error)
      throw error
    }
  }

  // Notify all users when a new event is posted
  static async notifyNewEvent(eventData: {
    _id: string
    title: string
    postedBy: {
      _id: string
      firstName: string
      lastName: string
      userType: string
    }
  }) {
    try {
      const db = await getDatabase()
      const alumniCollection = db.collection('alumni')
      const studentsCollection = db.collection('students')

      // Get all alumni and student IDs
      const [alumni, students] = await Promise.all([
        alumniCollection.find({}, { projection: { _id: 1 } }).toArray(),
        studentsCollection.find({}, { projection: { _id: 1 } }).toArray()
      ])

      // Create notifications for all users
      const notifications = [
        ...alumni.map(alumnus => ({
          recipientId: alumnus._id.toString(),
          recipientType: 'alumni' as const,
          type: 'event' as const,
          title: 'New Event Posted',
          message: `A new event "${eventData.title}" has been posted.`,
          userId: eventData.postedBy._id,
          userFirstName: eventData.postedBy.firstName,
          userLastName: eventData.postedBy.lastName,
          userType: eventData.postedBy.userType as 'student' | 'alumni' | 'admin',
          link: `/alumni/events`,
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        ...students.map(student => ({
          recipientId: student._id.toString(),
          recipientType: 'student' as const,
          type: 'event' as const,
          title: 'New Event Posted',
          message: `A new event "${eventData.title}" has been posted.`,
          userId: eventData.postedBy._id,
          userFirstName: eventData.postedBy.firstName,
          userLastName: eventData.postedBy.lastName,
          userType: eventData.postedBy.userType as 'student' | 'alumni' | 'admin',
          link: `/student/events`,
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      ]

      // Insert all notifications
      if (notifications.length > 0) {
        const db = await getDatabase()
        const notificationsCollection = db.collection('notifications')
        await notificationsCollection.insertMany(notifications)
      }

      return notifications.length
    } catch (error) {
      console.error('Error notifying new event:', error)
      throw error
    }
  }

  // Notify post author when someone likes their post
  static async notifyPostLike(postData: {
    _id: string
    authorId: string | ObjectId
    authorType: 'alumni' | 'admin'
    content: string
  }, likedBy: {
    _id: string
    firstName: string
    lastName: string
    userType: string
  }) {
    try {
      // Don't notify if user likes their own post
      if (postData.authorId.toString() === likedBy._id) {
        return null
      }

      const notification = {
        recipientId: postData.authorId.toString(),
        recipientType: postData.authorType,
        type: 'like' as const,
        title: 'New Like on Your Post',
        message: `${likedBy.firstName} ${likedBy.lastName} liked your post: "${postData.content.substring(0, 50)}${postData.content.length > 50 ? '...' : ''}"`,
        userId: likedBy._id,
        userFirstName: likedBy.firstName,
        userLastName: likedBy.lastName,
        userType: likedBy.userType as 'student' | 'alumni' | 'admin',
        link: postData.authorType === 'alumni' ? `/alumni/posts/${postData._id}` : `/student/posts/${postData._id}`
      }

      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error notifying post like:', error)
      throw error
    }
  }

  // Notify post author when someone comments on their post
  static async notifyPostComment(postData: {
    _id: string
    authorId: string | ObjectId
    authorType: 'alumni' | 'admin'
    content: string
  }, commentData: {
    content: string
    author: {
      _id: string
      firstName: string
      lastName: string
      userType: string
    }
  }) {
    try {
      // Don't notify if user comments on their own post
      if (postData.authorId.toString() === commentData.author._id) {
        return null
      }

      const notification = {
        recipientId: postData.authorId.toString(),
        recipientType: postData.authorType,
        type: 'comment' as const,
        title: 'New Comment on Your Post',
        message: `${commentData.author.firstName} ${commentData.author.lastName} commented on your post: "${commentData.content.substring(0, 50)}${commentData.content.length > 50 ? '...' : ''}"`,
        userId: commentData.author._id,
        userFirstName: commentData.author.firstName,
        userLastName: commentData.author.lastName,
        userType: commentData.author.userType as 'student' | 'alumni' | 'admin',
        link: postData.authorType === 'alumni' ? `/alumni/posts/${postData._id}` : `/student/posts/${postData._id}`
      }

      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error notifying post comment:', error)
      throw error
    }
  }

  // Notify student when their connection request is accepted by an alumni
  static async notifyConnectionAccepted(connectionData: {
    studentId: string
    alumniId: string
    alumniFirstName: string
    alumniLastName: string
  }) {
    try {
      const notification = {
        recipientId: connectionData.studentId,
        recipientType: 'student' as const,
        type: 'connection' as const,
        title: 'Connection Request Accepted',
        message: `${connectionData.alumniFirstName} ${connectionData.alumniLastName} accepted your connection request. You can now message them!`,
        userId: connectionData.alumniId,
        userFirstName: connectionData.alumniFirstName,
        userLastName: connectionData.alumniLastName,
        userType: 'alumni' as const,
        link: `/student/connections`
      }

      return await this.createNotification(notification)
    } catch (error) {
      console.error('Error notifying connection accepted:', error)
      throw error
    }
  }
}
