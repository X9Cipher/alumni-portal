import { getDatabase } from '@/lib/mongodb'
import { Event, CreateEventData } from '@/lib/models/Event'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'events'

export class EventService {
  static async getAllEvents(): Promise<Event[]> {
    try {
      const db = await getDatabase()
      const events = await db.collection(COLLECTION_NAME)
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      return events.map(event => ({
        ...event,
        _id: event._id.toString()
      })) as Event[]
    } catch (error) {
      console.error('Error fetching events:', error)
      throw new Error('Failed to fetch events')
    }
  }

  static async createEvent(eventData: CreateEventData, organizer: Event['organizer']): Promise<Event> {
    try {
      const db = await getDatabase()
      const now = new Date().toISOString()
      
      const newEvent: Omit<Event, '_id'> = {
        ...eventData,
        organizer,
        currentAttendees: 0,
        isActive: true,
        isPublic: eventData.isPublic !== false, // Default to true
        createdAt: now,
        updatedAt: now
      }

      const result = await db.collection(COLLECTION_NAME).insertOne(newEvent)
      
      return {
        ...newEvent,
        _id: result.insertedId.toString()
      }
    } catch (error) {
      console.error('Error creating event:', error)
      throw new Error('Failed to create event')
    }
  }

  static async getEventById(id: string): Promise<Event | null> {
    try {
      const db = await getDatabase()
      const event = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
      
      if (!event) return null
      
      return {
        ...event,
        _id: event._id.toString()
      } as Event
    } catch (error) {
      console.error('Error fetching event by ID:', error)
      throw new Error('Failed to fetch event')
    }
  }

  static async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
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
      } as Event
    } catch (error) {
      console.error('Error updating event:', error)
      throw new Error('Failed to update event')
    }
  }

  static async deleteEvent(id: string): Promise<boolean> {
    try {
      const db = await getDatabase()
      const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
      
      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting event:', error)
      throw new Error('Failed to delete event')
    }
  }
}