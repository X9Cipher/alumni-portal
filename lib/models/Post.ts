import { ObjectId } from 'mongodb'

export type PostType = 'text' | 'image' | 'video' | 'article'

export interface Post {
  _id?: ObjectId
  authorId: ObjectId
  authorType: 'alumni' | 'admin'
  authorFirstName: string
  authorLastName: string
  authorAvatar?: string
  type: PostType
  content: string
  // Legacy single media (backward compatibility)
  mediaDataUrl?: string
  mediaMimeType?: string
  // New multiple media support
  media?: { dataUrl: string; mimeType: string }[]
  likes?: ObjectId[]
  comments?: {
    _id?: ObjectId
    userId: ObjectId
    userType: 'student' | 'alumni' | 'admin'
    firstName: string
    lastName: string
    content: string
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface CreatePostRequest {
  type: PostType
  content: string
  // Either pass legacy single media or the new media array
  mediaDataUrl?: string
  mediaMimeType?: string
  media?: { dataUrl: string; mimeType: string }[]
}
