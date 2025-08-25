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
  TrendingDown,
  Briefcase,
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
  ThumbsUp,
  ImageIcon,
  VideoIcon,
  Activity
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"


interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  userType: 'student' | 'alumni' | 'admin'
  graduationYear?: string
  department?: string
  currentCompany?: string
  currentPosition?: string
  location?: string
  profilePicture?: string
  isApproved: boolean
  createdAt: string
  // Student specific fields
  studentId?: string
  currentYear?: string
  // Computed fields
  isOnline?: boolean
  profileViews?: number
  connections?: number
  mutualConnections?: number
}

interface AllUsers {
  students: User[]
  alumni: User[]
  admins: User[]
}

interface EngagementStats {
  totalPosts: number
  totalComments: number
  totalLikes: number
  totalShares: number
  activeUsers: number
  onlineUsers: number
  pageViews: number
  newRegistrations: number
  jobPosts: number
  events: number
  recentActivity: Array<{
    id: number
    type: string
    message: string
    timestamp: string
    color: string
  }>
  totalUsers: number
  alumni: number
  students: number
  admins: number
  activeJobs: number
  activeEvents: number
  thisMonthAlumni: number
  thisMonthStudents: number
  thisMonthJobs: number
  thisMonthEvents: number
}

export default function AdminDashboard() {
  const [allUsers, setAllUsers] = useState<AllUsers>({ students: [], alumni: [], admins: [] })
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [engagementStats, setEngagementStats] = useState<EngagementStats>({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    totalShares: 0,
    activeUsers: 0,
    onlineUsers: 0,
    pageViews: 0,
    newRegistrations: 0,
    jobPosts: 0,
    events: 0,
    recentActivity: [],
    totalUsers: 0,
    alumni: 0,
    students: 0,
    admins: 0,
    activeJobs: 0,
    activeEvents: 0,
    thisMonthAlumni: 0,
    thisMonthStudents: 0,
    thisMonthJobs: 0,
    thisMonthEvents: 0
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchEngagementStats()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

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

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [allUsersResponse, pendingUsersResponse] = await Promise.all([
        fetch('/api/admin/all-users'),
        fetch('/api/admin/pending-users')
      ])

      if (allUsersResponse.ok) {
        const allUsersData = await allUsersResponse.json()
        setAllUsers(allUsersData.users)
      }

      if (pendingUsersResponse.ok) {
        const pendingUsersData = await pendingUsersResponse.json()
        setPendingUsers(pendingUsersData.users)
      }

      // Fetch engagement stats
      await fetchEngagementStats()

    } catch (error) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchEngagementStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setEngagementStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch engagement stats:', error)
    }
  }

  const handleApproveUser = async (userId: string, userType: string, isApproved: boolean) => {
    try {
      setActionLoading(`${userId}-${isApproved ? 'approve' : 'reject'}`)
      
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userType,
          isApproved
        }),
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update user')
      }
    } catch (error) {
      setError('Failed to update user')
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
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const totalUsers = allUsers.students.length + allUsers.alumni.length

  return (
    <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Dashboard Header */}
          <div className="bg-[#a41a2f] text-white p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-red-100">Manage your alumni portal and monitor platform activity</p>
              </div>
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-[#a41a2f]"
                onClick={fetchData}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{engagementStats.totalUsers || 0}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      {loading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="text-sm text-green-600">
                          +{engagementStats.thisMonthStudents + engagementStats.thisMonthAlumni} this month
                        </span>
                      )}
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Alumni</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{engagementStats.alumni || 0}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      {loading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="text-sm text-green-600">
                          +{engagementStats.thisMonthAlumni} this month
                        </span>
                      )}
                    </div>
                  </div>
                  <GraduationCap className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{engagementStats.students || 0}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      {loading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="text-sm text-green-600">
                          +{engagementStats.thisMonthStudents} this month
                        </span>
                      )}
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{engagementStats.activeJobs || 0}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      {loading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="text-sm text-green-600">
                          +{engagementStats.thisMonthJobs} this month
                        </span>
                      )}
                    </div>
                  </div>
                  <Briefcase className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="bg-[#a41a2f] hover:bg-[#8a1628]"
                    onClick={() => router.push('/admin/jobs')}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Create Job Post
                  </Button>
                  <Button 
                    className="bg-[#a41a2f] hover:bg-[#8a1628]"
                    onClick={() => router.push('/admin/events')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/admin/alumni')}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Manage Alumni
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/admin/students')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Events</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{engagementStats.activeEvents || 0}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      {loading ? (
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className="text-sm text-green-600">
                          +{engagementStats.thisMonthEvents} this month
                        </span>
                      )}
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
                    <p className="text-sm text-gray-600">Community Posts</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{engagementStats.totalPosts || 0}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Active community</span>
                    </div>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Admins</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{engagementStats.admins || 0}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-600">System access</span>
                    </div>
                  </div>
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
                <Badge className="bg-[#a41a2f] text-white">{pendingUsers.length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingUsers.slice(0, 3).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${user.userType === 'student' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-600">
                            {user.userType === 'student' ? `Student ID: ${user.studentId}` : `Class of ${user.graduationYear} • ${user.currentCompany}`}
                          </p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          className="bg-[#a41a2f] hover:bg-[#8a1628]"
                          onClick={() => handleApproveUser(user._id, user.userType, true)}
                          disabled={actionLoading === `${user._id}-approve`}
                        >
                          {actionLoading === `${user._id}-approve` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementStats.recentActivity.length > 0 ? (
                    engagementStats.recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'registration' ? 'bg-green-100' :
                          activity.type === 'job' ? 'bg-blue-100' :
                          activity.type === 'event' ? 'bg-purple-100' :
                          activity.type === 'post' ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'registration' && <User className="w-4 h-4 text-green-600" />}
                          {activity.type === 'job' && <Briefcase className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'event' && <Calendar className="w-4 h-4 text-purple-600" />}
                          {activity.type === 'post' && <FileText className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                    </div>
                        <Badge 
                          variant="outline" 
                          className={`${
                            activity.type === 'registration' ? 'text-green-600 border-green-200' :
                            activity.type === 'job' ? 'text-blue-600 border-blue-200' :
                            activity.type === 'event' ? 'text-purple-600 border-purple-200' :
                            activity.type === 'post' ? 'text-orange-600 border-orange-200' : 
                            'text-gray-600 border-gray-200'
                          }`}
                        >
                          {activity.type}
                        </Badge>
                  </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                      <p className="text-gray-500">No recent activity</p>
                      <p className="text-sm text-gray-400">Activity will appear here as users interact with the platform</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Posts moderation feed (admin can delete any post) */}
      <section className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminFeed />
            </CardContent>
          </Card>
        </section>
    </div>
  )
}

function AdminFeed() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [newPostContent, setNewPostContent] = useState("")
  const [selectedMedia, setSelectedMedia] = useState<{ dataUrl: string; mimeType: string }[]>([])
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingMedia, setEditingMedia] = useState<{ dataUrl: string; mimeType: string }[]>([])
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [likesOpenForPostId, setLikesOpenForPostId] = useState<string | null>(null)
  const [likesUsers, setLikesUsers] = useState<Array<{ _id: string; firstName: string; lastName: string; userType: string; profilePicture?: string; profileImage?: string }>>([])
  const [mediaViewer, setMediaViewer] = useState<{ postId: string; index: number } | null>(null)
  const [authorPics, setAuthorPics] = useState<Record<string, string>>({})
  const [commentUserPics, setCommentUserPics] = useState<Record<string, Record<string, string>>>({})

  const loadAuthorPics = async (posts: any[]) => {
    const ids: string[] = posts
      .map((p: any) => (typeof p.authorId === 'string' ? p.authorId : (p.authorId?.$oid || '')))
      .filter((id: string) => id && !authorPics[id])
    if (ids.length) {
      const results = await Promise.all(ids.map(async (id: string) => {
        try {
          const r = await fetch(`/api/users/${id}`)
          const data = await r.json()
          if (r.ok && data.user) return [id, data.user.profilePicture || data.user.profileImage || ''] as const
        } catch {}
        return [id, ''] as const
      }))
      setAuthorPics((prev) => ({ ...prev, ...Object.fromEntries(results) }))
    }
  }

  useEffect(() => {
    const load = async () => {
      const profile = await fetch('/api/profile', { credentials: 'include' })
      if (profile.ok) {
        const d = await profile.json()
        setCurrentUserId(d.profile._id)
      }
      const res = await fetch('/api/posts', { credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        setPosts(d.posts || [])
        loadAuthorPics(d.posts || [])
      }
    }
    load()
  }, [])

  const normalizeId = (id: any): string => {
    if (!id) return ''
    if (typeof id === 'string') return id
    if (typeof id === 'object' && typeof id.$oid === 'string') return id.$oid
    return id.toString?.() || ''
  }

  const toggleLike = async (postId: string) => {
    const res = await fetch(`/api/posts?action=like&postId=${postId}`, { method: 'PUT', credentials: 'include' })
    const data = await res.json()
    if (!res.ok) return
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes: (p.likes || []).includes(currentUserId) ? (data.liked ? p.likes : (p.likes || []).filter((id: string) => id !== currentUserId)) : (data.liked ? [...(p.likes || []), currentUserId] : p.likes) } : p)))
  }

  const deletePost = async (postId: string) => {
    const res = await fetch(`/api/posts?action=delete&postId=${postId}`, { method: 'PUT', credentials: 'include' })
    if (res.ok) setPosts((prev) => prev.filter((p) => p._id !== postId))
  }

  const editPost = async (postId: string) => {
    const res = await fetch(`/api/posts?action=edit&postId=${postId}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ content: editingContent, media: editingMedia }), 
      credentials: 'include' 
    })
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, content: editingContent, media: editingMedia } : p)))
      setEditingPostId(null)
      setEditingContent("")
      setEditingMedia([])
    }
  }

  const createPost = async () => {
    if (!newPostContent.trim() && selectedMedia.length === 0) return
    const res = await fetch('/api/posts', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      credentials: 'include', 
      body: JSON.stringify({ 
        type: selectedMedia[0]?.mimeType?.startsWith('image/') ? 'image' : selectedMedia[0]?.mimeType?.startsWith('video/') ? 'video' : 'text', 
        content: newPostContent, 
        media: selectedMedia 
      }) 
    })
    const data = await res.json()
    if (res.ok) { 
      setPosts([data.post, ...posts]); 
      setNewPostContent(''); 
      setSelectedMedia([]) 
    }
  }

  const comment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim()
    if (!text) return
    const res = await fetch(`/api/posts?action=comment&postId=${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text }), credentials: 'include' })
    const data = await res.json()
    if (!res.ok) return
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p)))
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
  }

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const formatDistanceToNow = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <div className="p-4 border rounded-md bg-gray-50">
        <Textarea 
          placeholder="Share an update..." 
          value={newPostContent} 
          onChange={(e) => setNewPostContent(e.target.value)} 
          className="min-h-[80px] mb-3" 
        />
        {selectedMedia.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {selectedMedia.map((m, idx) => (
              <div key={idx} className="relative">
                {m.mimeType.startsWith('image/') ? (
                  <img src={m.dataUrl} alt="media" className="h-28 w-full object-cover rounded" />
                ) : (
                  <video className="h-28 w-full object-cover rounded">
                    <source src={m.dataUrl} type={m.mimeType} />
                  </video>
                )}
                <button className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6" onClick={() => setSelectedMedia(selectedMedia.filter((_, i) => i !== idx))}>×</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#a41a2f] cursor-pointer">
              <ImageIcon className="w-4 h-4" /> Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setSelectedMedia((prev) => [...prev, { dataUrl: r.result as string, mimeType: f.type }]); r.readAsDataURL(f) }} />
            </label>
            <label className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#a41a2f] cursor-pointer">
              <VideoIcon className="w-4 h-4" /> Video
              <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setSelectedMedia((prev) => [...prev, { dataUrl: r.result as string, mimeType: f.type }]); r.readAsDataURL(f) }} />
            </label>
          </div>
          <Button size="sm" onClick={createPost} disabled={!newPostContent.trim() && selectedMedia.length === 0}>
            Post
          </Button>
        </div>
      </div>

      {/* Posts List */}
      {posts.map((post) => (
        <div key={post._id} className="p-4 border rounded-md" data-post-id={post._id}>
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={authorPics[post.authorId || ''] || undefined} />
              <AvatarFallback className="bg-[#a41a2f] text-white text-sm">
                {post.authorFirstName?.[0]}
                {post.authorLastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
            <div>
                  <div className="font-semibold text-gray-900">{post.authorFirstName} {post.authorLastName}</div>
                  <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt))}</div>
                </div>
                <div className="flex items-center gap-2">
                  {normalizeId(post.authorId) === currentUserId && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setEditingPostId(post._id)
                        setEditingContent(post.content)
                        setEditingMedia(post.media || [])
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deletePost(post._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              {editingPostId === post._id ? (
                <div className="mt-3">
                  <Textarea 
                    value={editingContent} 
                    onChange={(e) => setEditingContent(e.target.value)} 
                    className="mb-3" 
                  />
                  {editingMedia.length > 0 && (
                    <div className="mb-3 grid grid-cols-3 gap-2">
                      {editingMedia.map((m, idx) => (
                        <div key={idx} className="relative">
                          {m.mimeType.startsWith('image/') ? (
                            <img src={m.dataUrl} alt="media" className="h-28 w-full object-cover rounded" />
                          ) : (
                            <video className="h-28 w-full object-cover rounded">
                              <source src={m.dataUrl} type={m.mimeType} />
                            </video>
                          )}
                          <button className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6" onClick={() => setEditingMedia(editingMedia.filter((_, i) => i !== idx))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#a41a2f] cursor-pointer">
                        <ImageIcon className="w-4 h-4" /> Photo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setEditingMedia((prev) => [...prev, { dataUrl: r.result as string, mimeType: f.type }]); r.readAsDataURL(f) }} />
                      </label>
                      <label className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#a41a2f] cursor-pointer">
                        <VideoIcon className="w-4 h-4" /> Video
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setEditingMedia((prev) => [...prev, { dataUrl: r.result as string, mimeType: f.type }]); r.readAsDataURL(f) }} />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingPostId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => editPost(post._id)}>
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              <div className="mt-2 whitespace-pre-wrap">{post.content}</div>
                  
                  {/* Media preview */}
                  {Array.isArray((post as any).media) && (post as any).media.length > 0 ? (
                    <div className="mt-3">
                      <div className="grid grid-cols-3 gap-2">
                        {(post as any).media.map((m: any, idx: number) => (
                          <div key={idx} className="relative cursor-pointer" onClick={() => setMediaViewer({ postId: post._id, index: idx })}>
                            {m.mimeType.startsWith('image/') ? (
                              <img src={m.dataUrl} alt="media" className="h-28 w-full object-cover rounded" />
                            ) : (
                              <video className="h-28 w-full object-cover rounded">
                                <source src={m.dataUrl} type={m.mimeType} />
                              </video>
                            )}
                          </div>
                        ))}
            </div>
          </div>
                  ) : null}
                </>
              )}
              
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <button className="flex items-center gap-1 hover:text-[#a41a2f]" onClick={() => toggleLike(post._id)}>
                  <ThumbsUp className={`w-4 h-4 ${(post.likes || []).includes(currentUserId) ? 'text-[#a41a2f] fill-current' : ''}`} />
              <span>{(post.likes?.length || 0)} likes</span>
            </button>
                <button className="flex items-center gap-1 hover:text-[#a41a2f]" onClick={() => toggleComments(post._id)}>
                  <MessageSquare className="w-4 h-4" />
                  <span>{(post.comments?.length || 0)} comments</span>
                </button>
              </div>

              {/* Comments */}
              {expandedComments.has(post._id) && (
                <div className="mt-3 space-y-3">
                  {post.comments?.map((comment: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={commentUserPics[post._id]?.[comment.userId] || undefined} />
                        <AvatarFallback className="bg-[#a41a2f] text-white text-xs">
                          {comment.firstName?.[0]}
                          {comment.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-medium">{comment.firstName} {comment.lastName}</span>
                          <span className="ml-2">{comment.content}</span>
                        </div>
                        <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt))}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Textarea 
                      value={commentInputs[post._id] || ''} 
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })} 
                      placeholder="Add a comment..." 
                      className="min-h-[60px] flex-1" 
                    />
                    <Button size="sm" onClick={() => comment(post._id)} disabled={!(commentInputs[post._id] || '').trim()}>
                      Comment
                    </Button>
                  </div>
          </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Media Viewer Modal */}
      <Dialog open={!!mediaViewer} onOpenChange={(v) => !v && setMediaViewer(null)}>
        <DialogContent className="max-w-3xl">
          {mediaViewer && (
            <div className="relative">
              <Carousel className="w-full" opts={{ startIndex: mediaViewer.index }}>
                <CarouselContent>
                  {(() => {
                    const post = posts.find((p) => p._id === mediaViewer.postId) as any
                    const media = (post?.media || []) as { dataUrl: string; mimeType: string }[]
                    return media.map((m, idx) => (
                      <CarouselItem key={idx}>
                        <div className="flex items-center justify-center h-[28rem] bg-black/5 rounded">
                          {m.mimeType.startsWith('image/') ? (
                            <img src={m.dataUrl} alt="media" className="max-h-[26rem] object-contain" />
                          ) : (
                            <video controls className="max-h-[26rem]">
                              <source src={m.dataUrl} type={m.mimeType} />
                            </video>
                          )}
                        </div>
                      </CarouselItem>
                    ))
                  })()}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}