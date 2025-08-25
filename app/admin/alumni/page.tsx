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
  Briefcase
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Alumni {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  userType: 'alumni'
  graduationYear: string
  department: string
  degree?: string
  major?: string
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
  isActive: boolean
  lastActive?: string
  createdAt: string
  updatedAt?: string
  // Computed fields
  isOnline?: boolean
  profileViews?: number
  connections?: number
  mutualConnections?: number
}

export default function AlumniManagement() {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all') // Added for new logic
  const [showCreateModal, setShowCreateModal] = useState(false) // Added for new logic
  const [newAlumni, setNewAlumni] = useState<Alumni>({ // Added for new logic
    _id: '',
    email: '',
    firstName: '',
    lastName: '',
    userType: 'alumni',
    isApproved: false,
    department: '',
    graduationYear: '',
    currentCompany: '',
    currentPosition: '',
    location: '',
    phone: '',
    createdAt: '',
    lastActive: '',
    isActive: true,
  })
  const router = useRouter()

  const departments = ['MCA', 'MBA', 'BCA','B.COM','BBA','M.COM']

  useEffect(() => {
    checkAuth()
    fetchAlumni()
  }, [])

  useEffect(() => {
    filterAlumniData()
  }, [alumni, searchTerm, filterStatus, filterDepartment, filterYear]) // Added filterYear to dependencies

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

  const fetchAlumni = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/all-users')
      
      if (response.ok) {
        const data = await response.json()
        setAlumni(data.users.alumni || [])
      } else {
        setError('Failed to fetch alumni data')
      }
    } catch (error) {
      setError('Failed to fetch alumni data')
    } finally {
      setLoading(false)
    }
  }

  const filterAlumniData = () => {
    let filtered = alumni

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(alumnus => 
        `${alumnus.firstName} ${alumnus.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumnus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumnus.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumnus.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(alumnus => alumnus.isActive !== false)
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(alumnus => alumnus.isActive === false)
      }
    }

    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(alumnus => alumnus.department === filterDepartment)
    }

    // Filter by graduation year
    if (filterYear !== 'all') {
      filtered = filtered.filter(alumnus => alumnus.graduationYear === filterYear)
    }

    setFilteredAlumni(filtered)
  }

  const handleApproveAlumni = async (alumniId: string, isApproved: boolean) => {
    try {
      setActionLoading(`${alumniId}-${isApproved ? 'approve' : 'reject'}`)
      
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: alumniId,
          userType: 'alumni',
          isApproved
        }),
      })

      if (response.ok) {
        await fetchAlumni()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update alumni')
      }
    } catch (error) {
      setError('Failed to update alumni')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteAlumni = async (alumniId: string) => {
    if (!confirm('Are you sure you want to delete this alumni?')) {
      return
    }

    try {
      setActionLoading(alumniId)
      
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: alumniId,
          userType: 'alumni'
        }),
      })

      if (response.ok) {
        await fetchAlumni()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete alumni')
      }
    } catch (error) {
      setError('Failed to delete alumni')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateAlumni = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setActionLoading('create')
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAlumni.email,
          firstName: newAlumni.firstName,
          lastName: newAlumni.lastName,
          userType: 'alumni',
          department: newAlumni.department,
          graduationYear: newAlumni.graduationYear,
          currentCompany: newAlumni.currentCompany,
          currentPosition: newAlumni.currentPosition,
          location: newAlumni.location,
          phone: newAlumni.phone,
        }),
      })

      if (response.ok) {
        await fetchAlumni()
        setShowCreateModal(false)
        setNewAlumni({
          _id: '',
          email: '',
          firstName: '',
          lastName: '',
          userType: 'alumni',
          isApproved: false,
          department: '',
          graduationYear: '',
          currentCompany: '',
          currentPosition: '',
          location: '',
          phone: '',
          createdAt: '',
          lastActive: '',
          isActive: true,
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to add alumni')
      }
    } catch (error) {
      setError('Failed to add alumni')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading alumni management...</p>
        </div>
      </div>
    )
  }

  const approvedAlumni = alumni.filter(a => a.isApproved).length
  const pendingAlumni = alumni.filter(a => !a.isApproved).length

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
                <h1 className="text-3xl font-bold mb-2">Alumni Management</h1>
            <p className="text-red-100">Manage alumni profiles and connections</p>
              </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-[#a41a2f]">
                  <Download className="w-4 h-4 mr-2" />
              Export Alumni
                </Button>
            <Button 
              className="bg-white text-[#a41a2f] hover:bg-gray-100"
              onClick={() => setShowCreateModal(true)}
            >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Alumni
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Alumni</p>
                    <p className="text-3xl font-bold text-gray-900">{alumni.length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+8% this month</span>
                </div>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm text-gray-600">Active Alumni</p>
                <p className="text-3xl font-bold text-gray-900">{alumni.filter(a => a.isActive).length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">95% active</span>
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
                <p className="text-sm text-gray-600">Recent Graduates</p>
                <p className="text-3xl font-bold text-gray-900">{alumni.filter(a => {
                  const gradDate = new Date(a.graduationYear)
                  const now = new Date()
                  return now.getFullYear() - gradDate.getFullYear() <= 2
                }).length}</p>
                    <div className="flex items-center gap-1 mt-1">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">Last 2 years</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{alumni.filter(a => {
                  const joinDate = new Date(a.createdAt)
                  const now = new Date()
                  return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
                }).length}</p>
                    <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600">New registrations</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

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
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Years</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
        </div>
        <div className="text-sm text-gray-600">
                  Showing {filteredAlumni.length} of {alumni.length} alumni
                </div>
              </div>

      {/* Alumni Directory */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Alumni Directory</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading alumni...</p>
            </div>
          </div>
        ) : filteredAlumni.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No alumni found</h3>
              <p className="text-gray-600 mb-4">No alumni match your current filters.</p>
              <Button 
                className="bg-[#a41a2f] hover:bg-[#8a1628]"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Alumni
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredAlumni.map((alum) => (
              <Card key={alum._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-[#a41a2f] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {alum.firstName.charAt(0)}{alum.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {alum.firstName} {alum.lastName}
                          </h3>
                          <Badge className={alum.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {alum.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {alum.graduationYear}
                            </Badge>
                          </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          {alum.currentPosition && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              <span>{alum.currentPosition}</span>
                            </div>
                          )}
                          {alum.currentCompany && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{alum.currentCompany}</span>
                            </div>
                          )}
                          {alum.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{alum.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Email: {alum.email}</span>
                          {alum.phone && <span>• Phone: {alum.phone}</span>}
                          <span>• Joined: {new Date(alum.createdAt).toLocaleDateString()}</span>
                        </div>
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
                        onClick={() => handleDeleteAlumni(alum._id)}
                        disabled={actionLoading === alum._id}
                      >
                        {actionLoading === alum._id ? (
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

      {/* Create Alumni Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add New Alumni</h2>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateAlumni} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <Input 
                    value={newAlumni.firstName} 
                    onChange={(e) => setNewAlumni({...newAlumni, firstName: e.target.value})}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <Input 
                    value={newAlumni.lastName} 
                    onChange={(e) => setNewAlumni({...newAlumni, lastName: e.target.value})}
                    placeholder="Last name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input 
                    type="email"
                    value={newAlumni.email} 
                    onChange={(e) => setNewAlumni({...newAlumni, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <Input 
                    value={newAlumni.phone} 
                    onChange={(e) => setNewAlumni({...newAlumni, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <select 
                    value={newAlumni.graduationYear} 
                    onChange={(e) => setNewAlumni({...newAlumni, graduationYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select year</option>
                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                  <Input 
                    value={newAlumni.location} 
                    onChange={(e) => setNewAlumni({...newAlumni, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Position (Optional)</label>
                  <Input 
                    value={newAlumni.currentPosition} 
                    onChange={(e) => setNewAlumni({...newAlumni, currentPosition: e.target.value})}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Company (Optional)</label>
                  <Input 
                    value={newAlumni.currentCompany} 
                    onChange={(e) => setNewAlumni({...newAlumni, currentCompany: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" className="bg-[#a41a2f] hover:bg-[#8a1628]">
                  Add Alumni
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