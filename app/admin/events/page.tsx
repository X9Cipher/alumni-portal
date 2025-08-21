"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
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
  const totalAttendees = events.reduce((sum, event) => sum + event.currentAttendees, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-[#a41a2f] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#a41a2f]" />
            </div>
            <div>
              <h2 className="font-semibold">Admin Panel</h2>
              <p className="text-sm text-red-100">System Management</p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Main Menu</h3>
            <nav className="space-y-1">
              <a href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Home className="w-4 h-4" />
                Dashboard
              </a>
              <a href="/admin/alumni" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <GraduationCap className="w-4 h-4" />
                Alumni Management
              </a>
              <a href="/admin/students" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Users className="w-4 h-4" />
                Student Management
              </a>
              <a href="/admin/jobs" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Briefcase className="w-4 h-4" />
                Job Posts
              </a>
              <a href="/admin/events" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#a41a2f] bg-red-50 rounded-lg">
                <Calendar className="w-4 h-4" />
                Events
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <MessageSquare className="w-4 h-4" />
                Messages
              </a>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">System</h3>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Settings className="w-4 h-4" />
                System Settings
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <Shield className="w-4 h-4" />
                Security
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                Alerts
              </a>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">© 2024 Admin Panel</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search events..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-[#a41a2f] text-white text-xs flex items-center justify-center">
                  3
                </Badge>
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#a41a2f] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Admin User</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
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
                <p className="text-red-100">Manage events organized by alumni and administrators</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="bg-white text-[#a41a2f] hover:bg-gray-100">
                  <Download className="w-4 h-4 mr-2" />
                  Export Events
                </Button>
                <Button 
                  variant="secondary" 
                  className="bg-white text-[#a41a2f] hover:bg-gray-100"
                  onClick={() => router.push('/admin/events/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">+8% this month</span>
                    </div>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-500" />
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
                      <CalendarDays className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600">Next 30 days</span>
                    </div>
                  </div>
                  <CalendarDays className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Attendees</p>
                    <p className="text-3xl font-bold text-gray-900">{totalAttendees}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Across all events</span>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
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
                      <span className="text-sm text-green-600">{Math.round((activeEvents / events.length) * 100)}% active</span>
                    </div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <select 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select 
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                <div className="ml-auto text-sm text-gray-600">
                  Showing {filteredEvents.length} of {events.length} events
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Events Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No events found matching your criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div key={event._id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <Badge variant={event.isActive ? 'default' : 'secondary'}>
                              {event.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {event.type}
                            </Badge>
                            {isEventUpcoming(event.date) && (
                              <Badge className="bg-green-100 text-green-800">
                                Upcoming
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              {formatEventDate(event.date, event.time)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Organized by {event.organizer.firstName} {event.organizer.lastName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.currentAttendees} attendees
                              {event.maxAttendees && ` / ${event.maxAttendees} max`}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</p>
                          <div className="flex items-center gap-2">
                            {event.isPublic && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Globe className="w-3 h-3 mr-1" />
                                Public
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              Created: {new Date(event.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={event.isActive ? "outline" : "default"}
                          onClick={() => handleToggleEventStatus(event._id, !event.isActive)}
                          disabled={actionLoading === `${event._id}-toggle`}
                        >
                          {actionLoading === `${event._id}-toggle` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : event.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {event.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteEvent(event._id)}
                          disabled={actionLoading === `${event._id}-delete`}
                        >
                          {actionLoading === `${event._id}-delete` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}