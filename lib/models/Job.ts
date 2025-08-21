export interface Job {
  _id?: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  salary?: string
  description: string
  requirements: string[]
  postedBy: {
    _id: string
    firstName: string
    lastName: string
    userType: 'admin' | 'alumni'
  }
  isActive: boolean
  applications: number
  createdAt: string
  updatedAt: string
}

export interface CreateJobData {
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  salary?: string
  description: string
  requirements?: string[]
}