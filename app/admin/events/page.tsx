"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  GraduationCap, 
  TrendingUp,
  Search,
  Bell,
  User,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Home,
  UserCheck,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  Database,
  Settings,
  Shield,
  AlertTriangle,
  Loader2,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Building,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Clock,
  Globe,
  CalendarDays
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: 'networking' | 'workshop' | 'seminar' | 'social' | 'career' | 'other'
  maxAttendees?: number
  currentAttendees: number
  organizer: {
    _id: string
    firstName: string
    lastName: string
    userType: 'alumni' | 'admin'
  }
  isActive: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "",
    date: "",
    time: "",
    location: "",
    description: "",
  })
  const router = useRouter()

  const eventTypes = ['networking', 'workshop', 'seminar', 'social', 'career', 'other']

  useEffect(() => {
    checkAuth()
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEventData()
  }, [events, searchTerm, filterType, filterStatus])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (!response.ok) {
        router.push('/auth/login')
        return
      }
      
      const data = await response.json()
      if (data.user.userType !== 'admin') {
        router.push('/auth/login')
        return
      }
    } catch (error) {
      router.push('/auth/login')
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        setError('Failed to fetch events')
      }
    } catch (error) {
      setError('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const filterEventData = () => {
    let filtered = events

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event => 
        filterStatus === 'active' ? event.isActive : !event.isActive
      )
    }

    setFilteredEvents(filtered)
  }

  const handleToggleEventStatus = async (eventId: string, isActive: boolean) => {
    try {
      setActionLoading(`${eventId}-toggle`)
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        await fetchEvents()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update event')
      }
    } catch (error) {
      setError('Failed to update event')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      setActionLoading(`${eventId}-delete`)
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEvents()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete event')
      }
    } catch (error) {
      setError('Failed to delete event')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setActionLoading('create')
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      })

      if (response.ok) {
        await fetchEvents()
        setShowCreateModal(false)
        setNewEvent({
          title: "",
          type: "",
          date: "",
          time: "",
          location: "",
          description: "",
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create event')
      }
    } catch (error) {
      setError('Failed to create event')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.clear()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isEventUpcoming = (date: string) => {
    return new Date(date) > new Date()
  }

  const formatEventDate = (date: string, time: string) => {
    const eventDate = new Date(date)
    return `${eventDate.toLocaleDateString()} at ${time}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading events management...</p>
        </div>
      </div>
    )
  }

  const activeEvents = events.filter(e => e.isActive).length
  const upcomingEvents = events.filter(e => isEventUpcoming(e.date)).length

  return (
    <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Page Header */}
          <div className="bg-[#a41a2f] text-white p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Events Management</h1>
            <p className="text-red-100">Manage events and activities for the community</p>
              </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-[#a41a2f]">
                  <Download className="w-4 h-4 mr-2" />
                  Export Events
                </Button>
                <Button 
                  className="bg-white text-[#a41a2f] hover:bg-gray-100"
              onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
           </div>

          {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+5% this month</span>
                    </div>
                  </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Events</p>
                <p className="text-3xl font-bold text-gray-900">{activeEvents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Currently running</span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Events</p>
                    <p className="text-3xl font-bold text-gray-900">{upcomingEvents}</p>
                    <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">Scheduled</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

          {/* Quick Actions */}

      {/* Filters and Search */}
      <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="conference">Conference</option>
            <option value="networking">Networking</option>
            <option value="other">Other</option>
                </select>
        </div>
        <div className="text-sm text-gray-600">
                  Showing {filteredEvents.length} of {events.length} events
                </div>
              </div>
      </div>

      {/* Events Directory */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Events Directory</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading events...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">No events match your current filters.</p>
              <Button 
                className="bg-[#a41a2f] hover:bg-[#8a1628]"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
                  {filteredEvents.map((event) => (
              <Card key={event._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                        <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                        <Badge className={event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {event.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {event.type}
                            </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                            </div>
                        <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                            </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Created: {new Date(event.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteEvent(event._id)}
                        disabled={actionLoading === event._id}
                        >
                        {actionLoading === event._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                </CardContent>
              </Card>
                  ))}
                </div>
              )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create New Event</h2>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <Input 
                    value={newEvent.title} 
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Event title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select 
                    value={newEvent.type} 
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
                    <option value="networking">Networking</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input 
                    type="date"
                    value={newEvent.date} 
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <Input 
                    type="time"
                    value={newEvent.time} 
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input 
                    value={newEvent.location} 
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Event location"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea 
                  value={newEvent.description} 
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Event description..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" className="bg-[#a41a2f] hover:bg-[#8a1628]">
                  Create Event
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}