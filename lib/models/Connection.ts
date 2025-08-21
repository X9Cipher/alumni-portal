import { ObjectId } from 'mongodb'

export interface Connection {
  _id?: ObjectId
  requesterId: ObjectId
  recipientId: ObjectId
  status: 'pending' | 'accepted' | 'rejected'
  requesterType: 'student' | 'alumni'
  recipientType: 'student' | 'alumni'
  message?: string // Initial message with connection request
  createdAt: Date
  updatedAt: Date
  acceptedAt?: Date
  rejectedAt?: Date
}

export interface ConnectionRequest {
  requesterId: string
  recipientId: string
  requesterType: 'student' | 'alumni'
  recipientType: 'student' | 'alumni'
  message?: string
}

export interface ConnectionResponse {
  status: 'accepted' | 'rejected'
} 
}

export interface ConnectionRequest {
  requesterId: string
  recipientId: string
  requesterType: 'student' | 'alumni'
  recipientType: 'student' | 'alumni'
  message?: string
}

export interface ConnectionResponse {
  status: 'accepted' | 'rejected'
} 