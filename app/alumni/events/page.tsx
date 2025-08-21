"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Clock,
  Globe,
  Lock,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: string
  maxAttendees?: number
  currentAttendees: number
  isPublic: boolean
  organizer: {
    _id: string
    firstName: string
    lastName: string
    userType: 'alumni' | 'admin'
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AlumniEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>('all')
  const [filterTime, setFilterTime] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEventData()
  }, [events, searchTerm, filterType, filterTime])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        const visible = (data.events || []).filter((e: Event) => e.isActive && e.isPublic)
        setEvents(visible)
      } else {
        setError('Failed to fetch events')
      }
    } catch {
      setError('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const filterEventData = () => {
    let filtered = events
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type.toLowerCase() === filterType.toLowerCase())
    }
    if (filterTime !== 'all') {
      const now = new Date()
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        if (filterTime === 'upcoming') return eventDate >= now
        if (filterTime === 'past') return eventDate < now
        return true
      })
    }
    setFilteredEvents(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  const isEventUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date(); today.setHours(0,0,0,0)
    return eventDate >= today
  }
  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workshop': return 'bg-blue-100 text-blue-800'
      case 'networking': return 'bg-green-100 text-green-800'
      case 'seminar': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-pink-100 text-pink-800'
      case 'career': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Events</h1>
          <p className="text-gray-600">Discover networking events, workshops, and social gatherings</p>
        </div>
        <div className="flex gap-2"></div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="browse">Browse Events</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search events, topics, or locations..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <Select value={filterTime} onValueChange={setFilterTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or check back later for new events.</p>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                          <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                          {event.isPublic ? (
                            <Badge variant="outline" className="text-green-600"><Globe className="w-3 h-3 mr-1" />Public</Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600"><Lock className="w-3 h-3 mr-1" />Private</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 mb-3">
                          <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(event.date)}</div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatTime(event.time)}</div>
                          <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.location}</div>
                          <div className="flex items-center gap-1"><Users className="w-4 h-4" />{event.currentAttendees}{event.maxAttendees && `/${event.maxAttendees}`} attendees</div>
                        </div>
                        <p className="text-gray-700 mb-3">{event.description}</p>
                      </div>
                      <div className="text-right">
                        {isEventUpcoming(event.date) ? (
                          <Badge className="bg-green-100 text-green-800">Upcoming</Badge>
                        ) : (
                          <Badge variant="secondary">Past</Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-600 text-white text-xs">
                            {event.organizer.firstName[0]}{event.organizer.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-green-800">Organized by {event.organizer.firstName} {event.organizer.lastName}</p>
                          <p className="text-xs text-green-600">{event.organizer.userType === 'admin' ? 'College Administration' : 'Alumni'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions removed: RSVP, View Details, Comments, Share */}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-rsvps" className="space-y-6">
          <div className="text-center py-8 text-gray-600">Your RSVP'd events will appear here.</div>
        </TabsContent>

        <TabsContent value="interested" className="space-y-6">
          <div className="text-center py-8 text-gray-600">Mark events as interested to keep track of them.</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
