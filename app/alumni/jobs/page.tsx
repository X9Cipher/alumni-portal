"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Users,
  ExternalLink,
  Bookmark,
  Filter,
  TrendingUp,
  Plus,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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

export default function AlumniJobs() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyJob, setApplyJob] = useState<JobPost | null>(null)
  const [applyDescription, setApplyDescription] = useState("")
  const [applyFile, setApplyFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [viewJob, setViewJob] = useState<JobPost | null>(null)
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [filterExperience, setFilterExperience] = useState<string>('all')

  useEffect(() => {
    checkAuth()
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobData()
  }, [jobs, searchTerm, filterType, filterStatus, filterExperience])

  useEffect(() => {
    if (!currentUser?._id) return
    const key = `appliedJobs:${currentUser._id}`
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (raw) {
      try { setAppliedJobIds(new Set(JSON.parse(raw))) } catch {}
    }
  }, [currentUser?._id])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (!response.ok) {
        router.push('/auth/login')
        return
      }
      
      const data = await response.json()
      if (data.user.userType !== 'alumni') {
        router.push('/auth/login')
        return
      }
      setCurrentUser(data.user)
    } catch (error) {
      router.push('/auth/login')
    }
  }

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jobs')
      
      if (response.ok) {
        const data = await response.json()
        // Show all jobs (from both admin and alumni)
        setJobs(data.jobs || [])
      } else {
        setError('Failed to fetch jobs')
      }
    } catch (error) {
      setError('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const filterJobData = () => {
    let filtered = jobs

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

    // Experience filter
    if (filterExperience !== 'all') {
      const q = filterExperience.toLowerCase()
      filtered = filtered.filter(job => {
        const hay = `${job.title} ${job.description} ${(job.requirements||[]).join(' ')}`.toLowerCase()
        if (q === 'entry') return hay.includes('entry') || hay.includes('junior') || hay.includes('fresher')
        if (q === 'intern' || q === 'internship') return hay.includes('intern') || hay.includes('internship')
        if (q === 'new-grad') return hay.includes('new grad') || hay.includes('new graduate')
        return true
      })
    }

    setFilteredJobs(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800'
      case 'part-time': return 'bg-blue-100 text-blue-800'
      case 'contract': return 'bg-purple-100 text-purple-800'
      case 'internship': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openApply = (job: JobPost) => {
    setApplyJob(job)
    setApplyDescription("")
    setApplyFile(null)
    setApplyOpen(true)
  }

  const submitApplication = async () => {
    if (!applyJob || !currentUser) return
    try {
      setSubmitting(true)
      let attachment: any
      if (applyFile) {
        const arrayBuffer = await applyFile.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        attachment = { name: applyFile.name, mimeType: applyFile.type, contentBase64: base64 }
      }
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: applyJob._id,
          jobTitle: applyJob.title,
          posterEmail: (applyJob as any).postedBy?.email || '',
          applicantName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
          applicantEmail: currentUser.email,
          applicantCourse: currentUser.major || currentUser.department,
          description: applyDescription,
          attachment,
        })
      })
      if (!res.ok) {
        console.error('apply error', await res.text())
        return
      }
      // Persist applied state locally
      const newSet = new Set(appliedJobIds); newSet.add(applyJob._id); setAppliedJobIds(newSet)
      // Increment applications count dynamically in UI
      setJobs((prev) => prev.map((j) => j._id === applyJob._id ? { ...j, applications: (j.applications || 0) + 1 } : j))
      try { const key = `appliedJobs:${currentUser._id}`; localStorage.setItem(key, JSON.stringify(Array.from(newSet))) } catch {}
      setApplyOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const myJobs = filteredJobs.filter(job => job.postedBy._id === currentUser?.userId)
  const allJobs = filteredJobs.filter(job => job.isActive)

  // Derived filter options
  const availableJobTypes = Array.from(new Set(jobs.map(j => j.type))).sort()
  const availableLocations = Array.from(new Set(
    jobs.map(j => (j.location || '').trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b))
  const hasIntern = jobs.some(j => `${j.title} ${j.description} ${(j.requirements||[]).join(' ')}`.toLowerCase().includes('intern'))
  const hasEntry = jobs.some(j => `${j.title} ${j.description} ${(j.requirements||[]).join(' ')}`.toLowerCase().includes('entry') || `${j.title} ${j.description} ${(j.requirements||[]).join(' ')}`.toLowerCase().includes('junior') || `${j.title} ${j.description} ${(j.requirements||[]).join(' ')}`.toLowerCase().includes('fresher'))
  const hasNewGrad = jobs.some(j => `${j.title} ${j.description} ${(j.requirements||[]).join(' ')}`.toLowerCase().includes('new grad') || `${j.title} ${j.description} ${(j.requirements||[]).join(' ')}`.toLowerCase().includes('new graduate'))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 sm:p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
          <TabsTrigger value="browse" className="text-xs px-2 sm:px-3">Browse All Jobs ({allJobs.length})</TabsTrigger>
          <TabsTrigger value="applied" className="text-xs px-2 sm:px-3">Applied Jobs ({appliedJobIds.size})</TabsTrigger>
          <TabsTrigger value="my-jobs" className="text-xs px-2 sm:px-3">My Job Posts ({myJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 lg:space-y-6 mt-4 sm:mt-6">
          {/* Search and Filters - Compact for small screens */}
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4 items-start">
                <div className="lg:col-span-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                    <Input 
                      placeholder="Search jobs..." 
                      className="pl-8 sm:pl-10 text-xs sm:text-sm h-8 sm:h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={filterExperience} onValueChange={setFilterExperience}>
                  <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {hasEntry && <SelectItem value="entry">Entry Level</SelectItem>}
                    {hasIntern && <SelectItem value="intern">Internship</SelectItem>}
                    {hasNewGrad && <SelectItem value="new-grad">New Graduate</SelectItem>}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableJobTypes.map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
                  <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {/* Post Job button aligned at end */}
                <div className="flex justify-end lg:justify-end xl:justify-end">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2 h-8 sm:h-9"
                    onClick={() => router.push('/alumni/jobs/create')}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Post Job</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="space-y-4">
            {allJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {allJobs.map((job) => (
                  <Card key={job._id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 h-full">
                    <CardContent className="p-4 lg:p-5">
                      <div className="flex flex-col gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarImage src="/placeholder.svg?height=64&width=64" />
                            <AvatarFallback className="text-sm">{job.company[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2 mb-2">
                              <h3 className="text-base font-semibold text-gray-900 truncate leading-tight">{job.title}</h3>
                              <div className="flex flex-wrap gap-1">
                                <Badge className={getJobTypeColor(job.type)}>
                                  {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                                </Badge>
                                {!job.isActive && (
                                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate font-medium">{job.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{job.salary}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(job.createdAt)}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">{job.description}</p>
                        
                        {job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {job.requirements.slice(0, 2).map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                            {job.requirements.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.requirements.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Posted by (compact) */}
                      <div className="mb-3 text-xs text-gray-500 flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="bg-green-600 text-white text-[8px]">
                            {job.postedBy.firstName[0]}{job.postedBy.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          Posted by {job.postedBy.firstName} {job.postedBy.lastName}
                        </span>
                      </div>

                      {/* Actions - Compact for cards */}
                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Users className="w-3 h-3" />
                          {job.applications} applications
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setViewJob(job)} className="flex-1 text-xs h-8">
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className={`flex-1 text-xs h-8 ${
                              appliedJobIds.has(job._id) 
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                            disabled={appliedJobIds.has(job._id)}
                            onClick={() => openApply(job)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {appliedJobIds.has(job._id) ? 'Applied' : 'Apply'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applied" className="space-y-6">
          <div className="space-y-4">
            {allJobs.filter(j => appliedJobIds.has(j._id)).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No applied jobs yet</h3>
                  <p className="text-gray-600">Apply to jobs from Browse tab and they’ll show up here.</p>
                </CardContent>
              </Card>
            ) : (
              allJobs.filter(j => appliedJobIds.has(j._id)).map((job) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-2">
                      <Avatar className="w-12 h-12"><AvatarFallback>{job.company[0]}</AvatarFallback></Avatar>
                      <div>
                        <div className="flex items-center gap-2"><h3 className="text-lg font-semibold">{job.title}</h3><Badge className={getJobTypeColor(job.type)}>{job.type}</Badge></div>
                        <div className="text-sm text-gray-600 flex gap-4"><span className="flex items-center gap-1"><Building className="w-4 h-4" />{job.company}</span><span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-gray-600 flex items-center gap-2"><Clock className="w-4 h-4" />Applied</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setViewJob(job)}>View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-jobs" className="space-y-6">
          {/* My Job Posts */}
          <div className="space-y-4">
            {myJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No job posts yet</h3>
                  <p className="text-gray-600 mb-4">Start by creating your first job posting to help students find opportunities.</p>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => router.push('/alumni/jobs/create')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myJobs.map((job) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <Badge className={getJobTypeColor(job.type)}>
                            {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                          </Badge>
                          <Badge variant={job.isActive ? "default" : "secondary"}>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(job.createdAt)}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                      </div>
                    </div>

                    {/* Actions for my jobs */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {job.applications} applications
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {applyJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Why are you interested?</label>
              <Textarea rows={5} value={applyDescription} onChange={(e) => setApplyDescription(e.target.value)} placeholder="Write a short note to the poster..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resume (PDF/DOC)</label>
              <Input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setApplyFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={submitApplication} disabled={submitting || !applyDescription.trim()}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewJob} onOpenChange={(open) => !open && setViewJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1"><Building className="w-4 h-4" />{viewJob?.company}</div>
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{viewJob?.location}</div>
              {viewJob?.salary && (<div className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{viewJob?.salary}</div>)}
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{viewJob && formatDate(viewJob.createdAt)}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{viewJob?.description}</p>
            </div>
            {viewJob?.requirements?.length ? (
              <div>
                <h4 className="font-semibold mb-1">Requirements</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                  {viewJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewJob(null)}>Close</Button>
            {viewJob && (
              <Button onClick={() => { setViewJob(null); openApply(viewJob) }}>Apply</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}