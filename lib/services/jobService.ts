import { getDatabase } from '@/lib/mongodb'
import { Job, CreateJobData } from '@/lib/models/Job'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'jobs'

export class JobService {
  static async getAllJobs(): Promise<Job[]> {
    try {
      const db = await getDatabase()
      const jobs = await db.collection(COLLECTION_NAME)
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      return jobs.map(job => ({
        ...job,
        _id: job._id.toString()
      })) as Job[]
    } catch (error) {
      console.error('Error fetching jobs:', error)
      throw new Error('Failed to fetch jobs')
    }
  }

  static async createJob(jobData: CreateJobData, postedBy: Job['postedBy']): Promise<Job> {
    try {
      const db = await getDatabase()
      const now = new Date().toISOString()
      
      const newJob: Omit<Job, '_id'> = {
        ...jobData,
        requirements: jobData.requirements || [],
        postedBy,
        isActive: true,
        applications: 0,
        createdAt: now,
        updatedAt: now
      }

      const result = await db.collection(COLLECTION_NAME).insertOne(newJob)
      
      return {
        ...newJob,
        _id: result.insertedId.toString()
      }
    } catch (error) {
      console.error('Error creating job:', error)
      throw new Error('Failed to create job')
    }
  }

  static async getJobById(id: string): Promise<Job | null> {
    try {
      const db = await getDatabase()
      const job = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
      
      if (!job) return null
      
      return {
        ...job,
        _id: job._id.toString()
      } as Job
    } catch (error) {
      console.error('Error fetching job by ID:', error)
      throw new Error('Failed to fetch job')
    }
  }

  static async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    try {
      const db = await getDatabase()
      const now = new Date().toISOString()
      
      const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updates, 
            updatedAt: now 
          } 
        },
        { returnDocument: 'after' }
      )
      
      if (!result) return null
      
      return {
        ...result,
        _id: result._id.toString()
      } as Job
    } catch (error) {
      console.error('Error updating job:', error)
      throw new Error('Failed to update job')
    }
  }

  static async deleteJob(id: string): Promise<boolean> {
    try {
      const db = await getDatabase()
      const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
      
      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting job:', error)
      throw new Error('Failed to delete job')
    }
  }
}