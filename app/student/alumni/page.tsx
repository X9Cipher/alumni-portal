"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  MapPin, 
  Building, 
  MessageCircle, 
  UserPlus, 
  Star,
  Users,
  TrendingUp,
  Eye,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { UserSearch } from "@/components/user-search"
import { useToast } from "@/components/ui/use-toast"

interface AlumniProfile {
  _id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  graduationYear: string
  degree: string
  major: string
  currentCompany?: string
  currentPosition?: string
  location?: string
  profilePicture?: string
  bio?: string
  skills?: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  isApproved: boolean
  createdAt: string
  // Computed fields
  isOnline: boolean
  profileViews: number
  connections: number
  mutualConnections: number
}

export default function StudentAlumniDirectory() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBatch, setFilterBatch] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterCompany, setFilterCompany] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())
  const [connections, setConnections] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchAlumniDirectory()
    // Delay loading of connection data until after currentUser is known
  }, [])

  // Load connections/pending once we have the current user
  useEffect(() => {
    if (currentUser?._id) {
      loadConnections()
      loadPendingRequests()
    }
  }, [currentUser?._id])

  useEffect(() => {
    filterAlumniData()
  }, [alumni, searchTerm, filterBatch, filterDepartment, filterCompany])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      
      if (!response.ok) {
        router.push('/auth/login')
        return
      }
      
      const data = await response.json()
      
      if (data.user.userType !== 'student') {
        router.push('/auth/login')
        return
      }
      setCurrentUser(data.user)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth/login')
    }
  }

  const fetchAlumniDirectory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/alumni/directory')
      
      if (response.ok) {
        const data = await response.json()
        setAlumni(data.alumni || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Alumni directory error:', errorData)
        setError('Failed to fetch alumni directory')
      }
    } catch (error) {
      console.error('Alumni directory fetch error:', error)
      setError('Failed to fetch alumni directory')
    } finally {
      setLoading(false)
    }
  }

  const filterAlumniData = () => {
    let filtered = alumni

    // Only show alumni when there are active filters or search terms
    const hasActiveFilters = searchTerm || filterBatch !== 'all' || filterDepartment !== 'all' || filterCompany !== 'all'
    
    if (!hasActiveFilters) {
      setFilteredAlumni([])
      return
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(person => 
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        person.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by batch year
    if (filterBatch !== 'all') {
      filtered = filtered.filter(person => person.graduationYear === filterBatch)
    }

    // Filter by department/major
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(person => 
        person.major.toLowerCase().includes(filterDepartment.toLowerCase())
      )
    }

    // Filter by company
    if (filterCompany !== 'all') {
      filtered = filtered.filter(person => 
        person.currentCompany?.toLowerCase().includes(filterCompany.toLowerCase())
      )
    }

    setFilteredAlumni(filtered)
  }

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/connections?type=accepted')
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      }
    } catch {}
  }

  const loadPendingRequests = async () => {
    try {
      const response = await fetch('/api/connections?type=pending')
      if (response.ok) {
        const data = await response.json()
        const sentRequests = (data.connections || [])
          .filter((conn: any) => conn.requesterId?.toString() === currentUser?._id?.toString())
          .map((conn: any) => conn.recipientId.toString())
        setPendingRequests(new Set(sentRequests))
      }
    } catch {}
  }

  const handleConnect = async (userId: string, userType: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please login to send connection requests",
        variant: "destructive"
      })
      return
    }

    // Students can only connect with alumni
    if (userType !== 'alumni') {
      toast({
        title: "Error",
        description: "Students can only connect with alumni",
        variant: "destructive"
      })
      return
    }

    // Prompt for initial message
    const initialMessage = prompt("Add a message to your connection request (optional):")
    if (initialMessage === null) return // User cancelled

    try {
      const response = await fetch('/api/messages/connection-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipientId: userId, 
          content: initialMessage || "Hi! I'm a student and would like to connect with you.",
          messageType: 'text'
        })
      })
      
      if (response.ok) {
        setPendingRequests(prev => new Set(prev).add(userId))
        loadConnections()
        loadPendingRequests()
        toast({
          title: "Connection Request Sent",
          description: "Your connection request has been sent successfully.",
        })
      } else {
        const errorData = await response.json()
        // If already exists, mark as pending locally
        if ((response.status === 409) || (errorData.error || '').toLowerCase().includes('already exists')) {
          setPendingRequests(prev => new Set(prev).add(userId))
          toast({ title: 'Request Pending', description: 'You already sent a request to this alumni.' })
          return
        }
        toast({ title: "Error", description: errorData.error || "Failed to send connection request", variant: "destructive" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      })
    }
  }

  const handleMessage = async (userId: string, userType: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please login to send messages",
        variant: "destructive"
      })
      return
    }

    if (userType !== 'alumni') {
      toast({
        title: "Messaging Restricted",
        description: "Students can only message alumni",
        variant: "destructive"
      })
      return
    }

    // Check connection status
    try {
      const statusRes = await fetch(`/api/connections/status?userId=${userId}`)
      const statusData = statusRes.ok ? await statusRes.json() : { status: 'none' }

      if (statusData.status === 'accepted') {
        router.push(`/student/messages?user=${userId}&type=${userType}`)
        return
      }

      // Not connected: prompt for an InMail-like initial message and send connection request
      const initialMessage = prompt("Add a message to start the conversation (optional):")
      if (initialMessage === null) return

      const req = await fetch('/api/messages/connection-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: userId,
          content: (initialMessage || "Hi! I'd like to connect and learn from your experience."),
          messageType: 'text'
        })
      })

      if (req.ok) {
        setPendingRequests(prev => new Set(prev).add(userId))
        loadConnections()
        loadPendingRequests()
        toast({
          title: "Request Sent",
          description: "Your message was sent with a connection request. You'll be able to chat after it's accepted.",
        })
      } else {
        const err = await req.json()
        if ((req.status === 409) || (err.error || '').toLowerCase().includes('already exists')) {
          // Remove the separate "pending connection request" UI concept as requested
          setPendingRequests(prev => new Set(prev).add(userId))
          return
        }
        toast({ title: 'Error', description: err.error || 'Failed to send request', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to initiate message', variant: 'destructive' })
    }
  }

  const getConnectionStatus = (userId: string) => {
    return connections.find(conn =>
      (conn.requesterId?.toString() === userId || conn.recipientId?.toString() === userId)
    )
  }
  const isConnected = (userId: string) => !!connections.find(conn =>
    (conn.requesterId?.toString() === currentUser?._id?.toString() && conn.recipientId?.toString() === userId) ||
    (conn.recipientId?.toString() === currentUser?._id?.toString() && conn.requesterId?.toString() === userId)
  )
  const isConnectionRequestPending = (userId: string) => pendingRequests.has(userId)

  // Get unique values for filters
  const graduationYears = [...new Set(alumni.map(person => person.graduationYear).filter((year) => year && year.trim() !== ''))]
    .sort((a, b) => parseInt(b) - parseInt(a))

  const majors = [...new Set(alumni.map(person => person.major).filter(major => major && major.trim() !== ''))]
    .sort()

  const companies = [...new Set(alumni.map(person => person.currentCompany).filter(company => company && company.trim() !== ''))]
    .sort()

  // Calculate statistics
  const totalAlumni = alumni.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading alumni directory...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Directory</h1>
        <p className="text-gray-600">Connect with alumni from your college and get guidance for your career</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <p className="text-red-600 font-medium">Error</p>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                setError("")
                fetchAlumniDirectory()
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-900">{totalAlumni}</p>
                <p className="text-sm text-blue-700 font-medium">Total Alumni</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-900">{graduationYears.length}</p>
                <p className="text-sm text-purple-700 font-medium">Graduation Years</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-900">{companies.length}</p>
                <p className="text-sm text-green-700 font-medium">Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-900">{majors.length}</p>
                <p className="text-sm text-orange-700 font-medium">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search by name, company, or skills..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterBatch} onValueChange={setFilterBatch}>
              <SelectTrigger>
                <SelectValue placeholder="Batch Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {graduationYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {majors.map(major => (
                  <SelectItem key={major} value={major}>{major}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.slice(0, 10).map(company => (
                  <SelectItem key={company} value={company!.toLowerCase()}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setFilterBatch("all")
                setFilterDepartment("all")
                setFilterCompany("all")
              }}
            >
              Clear All
            </Button>
            <span className="text-sm text-gray-500">
              Showing {filteredAlumni.length} of {totalAlumni} alumni
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Inline UserSearch removed to avoid duplicate list rendering */}

      {/* Alumni List */}
        {filteredAlumni.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterBatch !== 'all' || filterDepartment !== 'all' || filterCompany !== 'all' 
                ? 'No alumni found' 
                : 'Use filters to find alumni'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterBatch !== 'all' || filterDepartment !== 'all' || filterCompany !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Search by name, company, skills, or use the filters above to discover alumni.'
              }
            </p>
              </CardContent>
            </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {filteredAlumni.map((person) => (
                <div key={person._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      {(person as any).profilePicture ? (
                        <AvatarImage src={(person as any).profilePicture} />
                      ) : null}
                    <AvatarFallback>
                      {person.firstName[0]}{person.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                    <h3 
                            className="font-semibold text-lg text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate"
                          onClick={() => router.push(`/student/alumni/profile/${person._id}`)}
                        >
                          {person.fullName}
                        </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    {person.currentCompany && (
                              <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {person.currentCompany}
                      </div>
                    )}
                    {person.location && (
                              <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {person.location}
                      </div>
                    )}
                            <Badge variant="secondary">Class of {person.graduationYear}</Badge>
                  </div>
                </div>
                        <div className="flex items-center gap-2">
                          {isConnected(person._id) ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleMessage(person._id, 'alumni')}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                          ) : isConnectionRequestPending(person._id) ? (
                            <Button size="sm" variant="outline" disabled>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Pending
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleConnect(person._id, 'alumni')}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
      )}
    </div>
                      </div>
                  </div>
                  </div>
                </div>
              ))}
                </div>
              </CardContent>
            </Card>
        )}

      {/* Load More */}
      {filteredAlumni.length > 0 && filteredAlumni.length < alumni.length && (
        <div className="text-center">
          <Button variant="outline">Load More Alumni</Button>
        </div>
      )}
    </div>
  )
}