import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from './models/User'
import crypto from 'crypto'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  // Generate a unique session ID for this login
  const sessionId = crypto.randomBytes(16).toString('hex')
  
  const payload = {
    userId: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
    isApproved: user.isApproved,
    sessionId: sessionId,
    timestamp: Date.now()
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Helper function to get the current session token from cookies
export function getCurrentSessionToken(request: NextRequest): string | null {
  // First try to get the session ID and then the corresponding token
  const sessionId = request.cookies.get('current-session')?.value
  console.log('🔐 getCurrentSessionToken - Session ID from cookie:', sessionId)
  
  if (sessionId) {
    // Get token from the session-specific cookie
    const token = request.cookies.get(`auth-token-${sessionId}`)?.value
    console.log('🔐 getCurrentSessionToken - Token from session-specific cookie:', !!token)
    if (token) {
      return token
    }
  }
  
  // Fallback to the old auth-token cookie for backward compatibility
  const fallbackToken = request.cookies.get('auth-token')?.value
  console.log('🔐 getCurrentSessionToken - Fallback token found:', !!fallbackToken)
  return fallbackToken || null
}

export interface AuthUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  userType: 'student' | 'alumni' | 'admin'
  isApproved: boolean
  sessionId: string
  timestamp: number
}