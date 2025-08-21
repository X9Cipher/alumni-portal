export interface Event {
  _id?: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: 'networking' | 'workshop' | 'seminar' | 'social' | 'career'
  maxAttendees?: number
  currentAttendees: number
  organizer: {
    _id: string
    firstName: string
    lastName: string
    userType: 'admin' | 'alumni'
  }
  isActive: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEventData {
  title: string
  description: string
  date: string
  time: string
  location: string
  type: 'networking' | 'workshop' | 'seminar' | 'social' | 'career'
  maxAttendees?: number
  isPublic?: boolean
}