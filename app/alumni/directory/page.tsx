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
  Users, 
  TrendingUp, 
  Star,
  Loader2,
  Filter
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AlumniProfile {
  _id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  graduationYear: string
  degree: string
  major: string
  currentCompany?: string
  currentPosition?: string
  location?: string
  profilePicture?: string
  isApproved: boolean
  createdAt: string
  // Computed fields
  profileViews: number
  connections: number
  mutualConnections: number
}

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBatch, setFilterBatch] = useState<string>('all')
  const [filterCompany, setFilterCompany] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchAlumniDirectory()
  }, [])

  useEffect(() => {
    filterAlumniData()
  }, [alumni, searchTerm, filterBatch, filterCompany])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (!response.ok) {
        router.push('/auth/login')
        return
      }
      
      const data = await response.json()
      // Allow both alumni and students to access directory
      if (data.user.userType !== 'alumni' && data.user.userType !== 'student') {
        router.push('/auth/login')
        return
      }
      setCurrentUser(data.user)
    } catch (error) {
      router.push('/auth/login')
    }
  }

  const fetchAlumniDirectory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/alumni/directory')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Directory: Raw alumni data:', data.alumni)
        console.log('Directory: First alumni ID:', data.alumni?.[0]?._id)
        console.log('Directory: First alumni ID type:', typeof data.alumni?.[0]?._id)
        setAlumni(data.alumni || [])
      } else {
        setError('Failed to fetch alumni directory')
      }
    } catch (error) {
      setError('Failed to fetch alumni directory')
    } finally {
      setLoading(false)
    }
  }

  const filterAlumniData = () => {
    let filtered = alumni

    // Check if any filter is active
    const hasActiveSearch = searchTerm.trim() !== ""
    const hasActiveBatchFilter = filterBatch !== 'all'
    const hasActiveCompanyFilter = filterCompany !== 'all'
    const hasAnyActiveFilter = hasActiveSearch || hasActiveBatchFilter || hasActiveCompanyFilter

    // If no filters are active, show no results
    if (!hasAnyActiveFilter) {
      setFilteredAlumni([])
      return
    }

    // Filter by search term
    if (hasActiveSearch) {
      const q = searchTerm.trim().toLowerCase()
      filtered = filtered.filter(person => {
        const name = (person.fullName || `${person.firstName || ''} ${person.lastName || ''}`).toLowerCase()
        const company = (person.currentCompany || '').toLowerCase()
        const position = (person.currentPosition || '').toLowerCase()
        const major = (person.major || '').toLowerCase()
        const location = (person.location || '').toLowerCase()
        return (
          name.includes(q) ||
          company.includes(q) ||
          position.includes(q) ||
          major.includes(q) ||
          location.includes(q)
        )
      })
    }

    // Filter by batch year
    if (hasActiveBatchFilter) {
      filtered = filtered.filter(person => person.graduationYear === filterBatch)
    }

    // Filter by company
    if (hasActiveCompanyFilter) {
      filtered = filtered.filter(person => 
        person.currentCompany?.toLowerCase().includes(filterCompany.toLowerCase())
      )
    }

    setFilteredAlumni(filtered)
  }

  const handleMessage = (alumni: AlumniProfile) => {
    // Navigate to messages page with the selected alumni
    console.log('Directory: Navigating to messages for alumni:', alumni._id, alumni.fullName)
    router.push(`/alumni/messages?user=${alumni._id}&type=alumni`)
  }

  const handleProfileClick = (alumni: AlumniProfile) => {
    console.log('Directory: Navigating to profile for alumni:', alumni._id, alumni.fullName)
    router.push(`/alumni/profile/${alumni._id}`)
  }

  // Calculate statistics
  const totalAlumni = alumni.length
  const recentJoiners = alumni
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // Get top companies
  const companyCount = alumni.reduce((acc, person) => {
    if (person.currentCompany) {
      acc[person.currentCompany] = (acc[person.currentCompany] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const topCompanies = Object.entries(companyCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Get unique graduation years for filter
  const graduationYears = [...new Set(alumni.map(person => person.graduationYear))]
    .filter((y): y is string => typeof y === 'string' && y.trim() !== '')
    .sort((a, b) => parseInt(b) - parseInt(a))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading alumni directory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Directory</h1>
        <p className="text-gray-600">Connect with fellow alumni from your college</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Directory Stats */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Directory Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Alumni</span>
                <span className="font-semibold text-blue-600">{totalAlumni}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="font-semibold text-purple-600">{recentJoiners.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Companies */}
        {topCompanies.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Top Companies
              </h3>
              <div className="space-y-3">
                {topCompanies.map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded -m-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <Building className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{company.name}</span>
                    </div>
                    <Badge variant="secondary">{company.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Joiners */}
        {recentJoiners.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                Recent Joiners
              </h3>
              <div className="space-y-3">
                {recentJoiners.map((person, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {person.profilePicture ? (
                        <AvatarImage src={person.profilePicture} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {person.firstName[0]}{person.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium truncate hover:text-blue-600 cursor-pointer transition-colors"
                        onClick={() => handleProfileClick(person)}
                      >
                        {person.fullName}
                      </p>
                      <p className="text-xs text-gray-500">Class of {person.graduationYear}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search by name, company..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterBatch} onValueChange={setFilterBatch}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Year</SelectItem>
                {graduationYears.map(year => (
                  <SelectItem key={String(year)} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Companies</SelectItem>
                {topCompanies.slice(0, 10).map(company => (
                  <SelectItem key={company.name} value={company.name.toLowerCase()}>
                    {company.name}
                  </SelectItem>
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
                setFilterCompany("all")
              }}
            >
              Clear All
            </Button>
            <span className="text-sm text-gray-500">
              {filteredAlumni.length > 0 ? `Showing ${filteredAlumni.length} of ${totalAlumni} alumni` : 'No filters applied - use search or filters to find alumni'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Alumni List - Only show when there are search results or filters applied */}
      {filteredAlumni.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {filteredAlumni.map((person) => (
                <div key={person._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      {person.profilePicture ? (
                        <AvatarImage src={person.profilePicture} />
                      ) : null}
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {person.firstName[0]}{person.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-lg text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                            onClick={() => handleProfileClick(person)}
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
                        
                        <Button 
                          size="sm" 
                          className="bg-[#a41a2f] hover:bg-red-700"
                          onClick={() => handleMessage(person)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Show this message when no search/filter is applied or no results found
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterBatch !== 'all' || filterCompany !== 'all' 
                ? 'No alumni found' 
                : 'Search for alumni'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterBatch !== 'all' || filterCompany !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Use the search bar or filters above to find and connect with alumni.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
