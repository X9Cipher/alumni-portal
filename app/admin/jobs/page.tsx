"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  DollarSign,
  Clock,
  Globe
} from "lucide-react"
import { useRouter } from "next/navigation"

interface JobPost {
  _id: string
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
    userType: 'alumni' | 'admin'
  }
  isActive: boolean
  applications: number
  createdAt: string
  updatedAt: string
}

export default function JobPostsManagement() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship']

  useEffect(() => {
    checkAuth()
    fetchJobPosts()
  }, [])

  useEffect(() => {
    filterJobData()
  }, [jobPosts, searchTerm, filterType, filterStatus])

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

  const fetchJobPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs')
      
      if (response.ok) {
        const data = await response.json()
        setJobPosts(data.jobs || [])
      } else {
        setError('Failed to fetch job posts')
      }
    } catch (error) {
      setError('Failed to fetch job posts')
    } finally {
      setLoading(false)
    }
  }

  const filterJobData = () => {
    let filtered = jobPosts

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(job => job.type === filterType)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => 
        filterStatus === 'active' ? job.isActive : !job.isActive
      )
    }

    setFilteredJobs(filtered)
  }

  const handleToggleJobStatus = async (jobId: string, isActive: boolean) => {
    try {
      setActionLoading(`${jobId}-toggle`)
      
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        await fetchJobPosts()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update job post')
      }
    } catch (error) {
      setError('Failed to update job post')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job post?')) {
      return
    }

    try {
      setActionLoading(`${jobId}-delete`)
      
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchJobPosts()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete job post')
      }
    } catch (error) {
      setError('Failed to delete job post')
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
          <p>Loading job posts management...</p>
        </div>
      </div>
    )
  }

  const activeJobs = jobPosts.filter(j => j.isActive).length
  const inactiveJobs = jobPosts.filter(j => !j.isActive).length
  const totalApplications = jobPosts.reduce((sum, job) => sum + job.applications, 0)

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
              <a href="/admin/jobs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#a41a2f] bg-red-50 rounded-lg">
                <Briefcase className="w-4 h-4" />
                Job Posts
              </a>
              <a href="/admin/events" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
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
                  placeholder="Search job posts..." 
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
                <h1 className="text-3xl font-bold mb-2">Job Posts Management</h1>
                <p className="text-red-100">Manage job postings from alumni and administrators</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="bg-white text-[#a41a2f] hover:bg-gray-100">
                  <Download className="w-4 h-4 mr-2" />
                  Export Jobs
                </Button>
                <Button 
                  variant="secondary" 
                  className="bg-white text-[#a41a2f] hover:bg-gray-100"
                  onClick={() => router.push('/admin/jobs/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job Post
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
                    <p className="text-sm text-gray-600">Total Job Posts</p>
                    <p className="text-3xl font-bold text-gray-900">{jobPosts.length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">+12% this month</span>
                    </div>
                  </div>
                  <Briefcase className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                    <p className="text-3xl font-bold text-gray-900">{activeJobs}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">{Math.round((activeJobs / jobPosts.length) * 100)}% active</span>
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
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600">Across all jobs</span>
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
                    <p className="text-3xl font-bold text-gray-900">{Math.floor(jobPosts.length * 0.3)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-600">New postings</span>
                    </div>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
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
                  {jobTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>

                <div className="ml-auto text-sm text-gray-600">
                  Showing {filteredJobs.length} of {jobPosts.length} job posts
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Posts List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Job Posts Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No job posts found matching your criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job._id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge variant={job.isActive ? 'default' : 'secondary'}>
                              {job.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {job.type.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {job.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Posted by {job.postedBy.firstName} {job.postedBy.lastName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.applications} applications
                            </div>
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-1 text-sm text-green-600 mb-2">
                              <DollarSign className="w-4 h-4" />
                              {job.salary}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Posted: {new Date(job.createdAt).toLocaleDateString()}
                          </p>
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
                          variant={job.isActive ? "outline" : "default"}
                          onClick={() => handleToggleJobStatus(job._id, !job.isActive)}
                          disabled={actionLoading === `${job._id}-toggle`}
                        >
                          {actionLoading === `${job._id}-toggle` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : job.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {job.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteJob(job._id)}
                          disabled={actionLoading === `${job._id}-delete`}
                        >
                          {actionLoading === `${job._id}-delete` ? (
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