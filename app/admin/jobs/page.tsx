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
  const [newJob, setNewJob] = useState<{
    title: string
    company: string
    location: string
    type: 'full-time' | 'part-time' | 'contract' | 'internship'
    salary: string
    description: string
    requirements: string[]
  }>({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    description: '',
    requirements: []
  })
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

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setActionLoading('create')
      
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJob),
      })

      if (response.ok) {
        await fetchJobPosts()
        setShowCreateModal(false)
        setNewJob({
          title: '',
          company: '',
          location: '',
          type: 'full-time',
          salary: '',
          description: '',
          requirements: []
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create job post')
      }
    } catch (error) {
      setError('Failed to create job post')
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
                <h1 className="text-3xl font-bold mb-2">Job Posts Management</h1>
                <p className="text-red-100">Manage job postings from alumni and administrators</p>
              </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-[#a41a2f]">
                  <Download className="w-4 h-4 mr-2" />
                  Export Jobs
                </Button>
                <Button 
                  className="bg-white text-[#a41a2f] hover:bg-gray-100"
              onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job Post
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
                <p className="text-3xl font-bold text-gray-900">{jobPosts.filter(job => job.isActive).length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">100% active</span>
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
                <p className="text-3xl font-bold text-gray-900">{jobPosts.reduce((total, job) => total + job.applications, 0)}</p>
                    <div className="flex items-center gap-1 mt-1">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">Across all jobs</span>
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
                <p className="text-3xl font-bold text-gray-900">{jobPosts.filter(job => {
                  const jobDate = new Date(job.createdAt)
                  const now = new Date()
                  return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear()
                }).length}</p>
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
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
                </select>
        </div>
        <div className="text-sm text-gray-600">
                  Showing {filteredJobs.length} of {jobPosts.length} job posts
                </div>
              </div>

      {/* Job Posts Directory */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Job Posts Directory</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading job posts...</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No job posts found</h3>
              <p className="text-gray-600 mb-4">No job posts match your current filters.</p>
              <Button 
                className="bg-[#a41a2f] hover:bg-[#8a1628]"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Job Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
                  {filteredJobs.map((job) => (
              <Card key={job._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                        <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <Badge className={job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {job.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {job.type}
                            </Badge>
                          </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                          <span>{job.company}</span>
                            </div>
                        <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                          </div>
                          {job.salary && (
                          <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                            <span>{job.salary}</span>
                            </div>
                          )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Posted by: {job.postedBy.firstName} {job.postedBy.lastName}</span>
                        <span>•</span>
                        <span>{job.applications} applications</span>
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
                          onClick={() => handleDeleteJob(job._id)}
                        disabled={actionLoading === job._id}
                        >
                        {actionLoading === job._id ? (
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

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create New Job Post</h2>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <Input 
                    value={newJob.title} 
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <Input 
                    value={newJob.company} 
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    placeholder="Company name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input 
                    value={newJob.location} 
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select 
                    value={newJob.type} 
                    onChange={(e) => setNewJob({...newJob, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Optional)</label>
                  <Input 
                    value={newJob.salary} 
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                <Textarea 
                  value={newJob.description} 
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
                <Textarea 
                  value={newJob.requirements.join('\n')} 
                  onChange={(e) => setNewJob({...newJob, requirements: e.target.value.split('\n').filter(r => r.trim())})}
                  placeholder="Bachelor's degree in Computer Science&#10;3+ years of experience&#10;Proficiency in React and Node.js"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" className="bg-[#a41a2f] hover:bg-[#8a1628]">
                  Create Job Post
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