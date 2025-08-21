import { ObjectId } from 'mongodb'

export interface BaseUser {
  _id?: ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'student' | 'alumni' | 'admin'
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Student extends BaseUser {
  userType: 'student'
  studentId: string
  currentYear: string
  department: string
  gpa?: string
  interests?: string[]
  achievements?: string[]
}

export interface Alumni extends BaseUser {
  userType: 'alumni'
  graduationYear: string
  department: string
  degree?: string
  major?: string
  currentCompany?: string
  currentRole?: string
  experience?: string[]
  achievements?: string[]
  websiteUrl?: string
}

export interface Admin extends BaseUser {
  userType: 'admin'
  permissions: string[]
}

export type User = Student | Alumni | Admin

export interface LoginCredentials {
  email: string
  password: string
  userType: 'student' | 'alumni' | 'admin'
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'student' | 'alumni'
  // Student specific
  studentId?: string
  currentYear?: string
  // Alumni specific
  graduationYear?: string
  currentCompany?: string
  currentRole?: string
  // Common
  department: string
}