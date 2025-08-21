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
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"


interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  userType: 'student' | 'alumni' | 'admin'
  isApproved: boolean
  department?: string
  studentId?: string
  currentYear?: string
  graduationYear?: string
  currentCompany?: string
  currentRole?: string
  createdAt: string
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
    recentActivity: []
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
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#a41a2f] bg-red-50 rounded-lg">
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
                  placeholder="Search users, content, reports..." 
                  className="pl-10 bg-gray-50 border-gray-200" 
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

          {/* Dashboard Header */}
          <div className="bg-[#a41a2f] text-white p-6 rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-red-100">Manage your alumni portal and monitor platform activity</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">2,156</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">+12% from last month</span>
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
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">+8% from last month</span>
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
                    <p className="text-3xl font-bold text-gray-900">909</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">+15% from last month</span>
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
                    <p className="text-3xl font-bold text-gray-900">89</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">+3% from last month</span>
                    </div>
                  </div>
                  <Briefcase className="w-8 h-8 text-red-500" />
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
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">John Doe</span> posted a job opening{' '}
                        <span className="font-medium">Senior React Developer</span>
                      </p>
                      <p className="text-xs text-gray-500">30 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">job</Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Sarah Mitchell</span> created an event{' '}
                        <span className="font-medium">Tech Meetup 2024</span>
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-purple-600 border-purple-200">event</Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Alex Morgan</span> joined the platform
                      </p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">user</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Posts moderation feed (admin can delete any post) */}
        <section className="p-6">
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
    </div>
  )
}

function AdminFeed() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")
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
      }
    }
    load()
  }, [])

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

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const comment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim()
    if (!text) return
    const res = await fetch(`/api/posts?action=comment&postId=${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text }), credentials: 'include' })
    const data = await res.json()
    if (!res.ok) return
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p)))
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post._id} className="p-4 border rounded-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{post.authorFirstName} {post.authorLastName}</div>
              <div className="mt-2 whitespace-pre-wrap">{post.content}</div>
            </div>
            <button className="text-red-600 text-sm" onClick={() => deletePost(post._id)}>Delete</button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <button className="flex items-center gap-1" onClick={() => toggleLike(post._id)}>
              <ThumbsUp className="w-4 h-4" />
              <span>{(post.likes?.length || 0)} likes</span>
            </button>
            <div className="flex-1" />
          </div>
          <div className="mt-3">
            <Textarea value={commentInputs[post._id] || ''} onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })} placeholder="Add a comment..." className="min-h-[60px]" />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={() => comment(post._id)} disabled={!(commentInputs[post._id] || '').trim()}>Comment</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}