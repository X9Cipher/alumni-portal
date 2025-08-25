import { getDatabase } from '../mongodb'
import { User, Student, Alumni, Admin, RegisterData, LoginCredentials } from '../models/User'
import { hashPassword, verifyPassword } from '../auth'
import { ObjectId } from 'mongodb'

const STUDENTS_COLLECTION = 'students'
const ALUMNI_COLLECTION = 'alumni'
const ADMINS_COLLECTION = 'admins'

export class UserService {
  static getCollectionName(userType: string): string {
    switch (userType) {
      case 'student':
        return STUDENTS_COLLECTION
      case 'alumni':
        return ALUMNI_COLLECTION
      case 'admin':
        return ADMINS_COLLECTION
      default:
        throw new Error('Invalid user type')
    }
  }

  // Helper: determine user type by ID across all collections
  static async getUserTypeById(userId: string): Promise<'student' | 'alumni' | 'admin' | null> {
    try {
      const db = await getDatabase()
      const id = new ObjectId(userId)

      const studentsCollection = db.collection<Student>(STUDENTS_COLLECTION)
      const alumniCollection = db.collection<Alumni>(ALUMNI_COLLECTION)
      const adminsCollection = db.collection<Admin>(ADMINS_COLLECTION)

      const [student, alumni, admin] = await Promise.all([
        studentsCollection.findOne({ _id: id }),
        alumniCollection.findOne({ _id: id }),
        adminsCollection.findOne({ _id: id })
      ])

      if (student) return 'student'
      if (alumni) return 'alumni'
      if (admin) return 'admin'
      return null
    } catch (e) {
      return null
    }
  }

  static async createUser(userData: RegisterData): Promise<User> {
    const db = await getDatabase()
    
    // Check if user already exists in any collection
    const existingUser = await this.getUserByEmail(userData.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user object based on type
    const baseUser = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      department: userData.department,
      isApproved: false, // All users need admin approval
      showEmailInProfile: true, // Default to showing email
      showPhoneInProfile: false, // Default to showing phone
      createdAt: new Date(),
      updatedAt: new Date()
    }

    let newUser: User
    let collectionName: string

    if (userData.userType === 'student') {
      newUser = {
        ...baseUser,
        userType: 'student',
        studentId: userData.studentId!,
        currentYear: userData.currentYear!
      } as Student
      collectionName = STUDENTS_COLLECTION
    } else {
      newUser = {
        ...baseUser,
        userType: 'alumni',
        graduationYear: userData.graduationYear!,
        currentCompany: userData.currentCompany,
        currentPosition: userData.currentPosition
      } as Alumni
      collectionName = ALUMNI_COLLECTION
    }

    const collection = db.collection<User>(collectionName)
    const result = await collection.insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
  }

  static async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    const db = await getDatabase()
    const collectionName = this.getCollectionName(credentials.userType)
    const collection = db.collection<User>(collectionName)

    // Find user by email
    const user = await collection.findOne({ email: credentials.email })

    if (!user) {
      return null
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password)
    if (!isValidPassword) {
      return null
    }

    // Check if user is approved
    if (!user.isApproved) {
      throw new Error('Account pending approval')
    }

    return user
  }

  static async getUserById(userId: string, userType: string): Promise<User | null> {
    const db = await getDatabase()
    const collectionName = this.getCollectionName(userType)
    const collection = db.collection<User>(collectionName)

    return await collection.findOne({ _id: new ObjectId(userId) })
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDatabase()
    
    // Check all collections for the email
    const collections = [STUDENTS_COLLECTION, ALUMNI_COLLECTION, ADMINS_COLLECTION]
    
    for (const collectionName of collections) {
      const collection = db.collection<User>(collectionName)
      const user = await collection.findOne({ email })
      if (user) {
        return user
      }
    }
    
    return null
  }

  static async updateUserApproval(userId: string, userType: string, isApproved: boolean): Promise<boolean> {
    const db = await getDatabase()
    const collectionName = this.getCollectionName(userType)
    const collection = db.collection<User>(collectionName)

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          isApproved,
          updatedAt: new Date()
        }
      }
    )

    return result.modifiedCount > 0
  }

  static async getAllPendingUsers(): Promise<User[]> {
    const db = await getDatabase()
    const pendingUsers: User[] = []

    // Get pending students
    const studentsCollection = db.collection<User>(STUDENTS_COLLECTION)
    const pendingStudents = await studentsCollection.find({ isApproved: false }).toArray()
    pendingUsers.push(...pendingStudents)

    // Get pending alumni
    const alumniCollection = db.collection<User>(ALUMNI_COLLECTION)
    const pendingAlumni = await alumniCollection.find({ isApproved: false }).toArray()
    pendingUsers.push(...pendingAlumni)

    return pendingUsers
  }

  static async getAllUsers(): Promise<{ students: Student[], alumni: Alumni[], admins: Admin[] }> {
    const db = await getDatabase()

    const studentsCollection = db.collection<Student>(STUDENTS_COLLECTION)
    const alumniCollection = db.collection<Alumni>(ALUMNI_COLLECTION)
    const adminsCollection = db.collection<Admin>(ADMINS_COLLECTION)

    const [students, alumni, admins] = await Promise.all([
      studentsCollection.find({}).toArray(),
      alumniCollection.find({}).toArray(),
      adminsCollection.find({}).toArray()
    ])

    return { students, alumni, admins }
  }

  static async createAdminUser(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    const db = await getDatabase()
    const collection = db.collection<Admin>(ADMINS_COLLECTION)

    // Check if admin already exists
    const existingAdmin = await collection.findOne({ email })
    if (existingAdmin) {
      throw new Error('Admin user already exists')
    }

    const hashedPassword = await hashPassword(password)

    const adminUser: Admin = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType: 'admin',
      permissions: ['all'],
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(adminUser)
    return { ...adminUser, _id: result.insertedId }
  }

  static async deleteUser(userId: string, userType: string): Promise<boolean> {
    const db = await getDatabase()
    const collectionName = this.getCollectionName(userType)
    const collection = db.collection<User>(collectionName)

    const result = await collection.deleteOne({ _id: new ObjectId(userId) })
    return result.deletedCount > 0
  }

  static async getApprovedUsers(): Promise<{ students: Student[], alumni: Alumni[] }> {
    const db = await getDatabase()

    const studentsCollection = db.collection<Student>(STUDENTS_COLLECTION)
    const alumniCollection = db.collection<Alumni>(ALUMNI_COLLECTION)

    const [students, alumni] = await Promise.all([
      studentsCollection.find({ isApproved: true }).toArray(),
      alumniCollection.find({ isApproved: true }).toArray()
    ])

    return { students, alumni }
  }

  static async updateStudent(userId: string, updateData: Partial<Student>): Promise<Student | null> {
    console.log('UserService.updateStudent called with:', { userId, updateData })
    
    try {
      const db = await getDatabase()
      const collection = db.collection<Student>(STUDENTS_COLLECTION)

      // Validate ObjectId
      if (!ObjectId.isValid(userId)) {
        console.error('Invalid ObjectId:', userId)
        return null
      }

      const updatePayload = { 
        ...updateData,
        updatedAt: new Date()
      }
      console.log('Update payload:', updatePayload)

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      )

      console.log('MongoDB update result:', result)
      return result
    } catch (error) {
      console.error('Error in updateStudent:', error)
      return null
    }
  }

  static async updateAlumni(userId: string, updateData: Partial<Alumni>): Promise<Alumni | null> {
    console.log('UserService.updateAlumni called with:', { userId, updateData })
    
    try {
      const db = await getDatabase()
      const collection = db.collection<Alumni>(ALUMNI_COLLECTION)

      // Validate ObjectId
      if (!ObjectId.isValid(userId)) {
        console.error('Invalid ObjectId:', userId)
        return null
      }

      const updatePayload = { 
        ...updateData,
        updatedAt: new Date()
      }
      console.log('Update payload:', updatePayload)

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updatePayload },
        { returnDocument: 'after' }
      )

      console.log('MongoDB update result:', result)
      return result
    } catch (error) {
      console.error('Error in updateAlumni:', error)
      return null
    }
  }

  static async searchUsers(query: string, type: string = 'all', limit: number = 20): Promise<User[]> {
    const db = await getDatabase()
    const searchRegex = new RegExp(query, 'i')

    const searchQuery = {
      $and: [
        { isApproved: true },
        {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { department: searchRegex }
          ]
        }
      ]
    }

    let users: User[] = []

    if (type === 'all' || type === 'students') {
      const studentsCollection = db.collection<Student>(STUDENTS_COLLECTION)
      const students = await studentsCollection.find(searchQuery).limit(limit).toArray()
      users.push(...students)
    }

    if (type === 'all' || type === 'alumni') {
      const alumniCollection = db.collection<Alumni>(ALUMNI_COLLECTION)
      const alumni = await alumniCollection.find(searchQuery).limit(limit).toArray()
      users.push(...alumni)
    }

    // Sort by relevance (exact matches first, then partial matches)
    users.sort((a, b) => {
      const aExact = a.firstName.toLowerCase() === query.toLowerCase() || 
                     a.lastName.toLowerCase() === query.toLowerCase() ||
                     a.email.toLowerCase() === query.toLowerCase()
      const bExact = b.firstName.toLowerCase() === query.toLowerCase() || 
                     b.lastName.toLowerCase() === query.toLowerCase() ||
                     b.email.toLowerCase() === query.toLowerCase()
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return 0
    })

    return users.slice(0, limit)
  }
}
