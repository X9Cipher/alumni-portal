"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  TrendingUp,
  Eye,
  UserPlus
} from "lucide-react"

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    connections: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
    jobPostings: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user: currentUser, loading: userLoading } = useAuth()

  useEffect(() => {
    if (currentUser) {
      loadDashboardStats()
    }
  }, [currentUser])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Load various stats
      const [alumniRes, connectionsRes, eventsRes, jobsRes] = await Promise.all([
        fetch('/api/alumni/directory'),
        fetch('/api/connections?type=accepted'),
        fetch('/api/events'),
        fetch('/api/jobs')
      ])

      const alumniData = alumniRes.ok ? await alumniRes.json() : { alumni: [] }
      const connectionsData = connectionsRes.ok ? await connectionsRes.json() : { connections: [] }
      const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [] }
      const jobsData = jobsRes.ok ? await jobsRes.json() : { jobs: [] }

      // Get pending requests
      const pendingRes = await fetch('/api/connections?type=pending')
      const pendingData = pendingRes.ok ? await pendingRes.json() : { connections: [] }
      const pendingRequests = pendingData.connections.filter((conn: any) => 
        conn.recipientId?.toString() === currentUser?._id?.toString()
      )

      setStats({
        totalAlumni: alumniData.alumni?.length || 0,
        connections: connectionsData.connections?.length || 0,
        pendingRequests: pendingRequests.length,
        upcomingEvents: eventsData.events?.filter((event: any) => 
          new Date(event.date) > new Date()
        ).length || 0,
        jobPostings: jobsData.jobs?.length || 0
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#a41a2f]"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-[#a41a2f] text-white text-lg">
              {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser.firstName}!
            </h1>
            <p className="text-gray-600">
              Connect with alumni, discover opportunities, and grow your network
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-900">{stats.totalAlumni}</p>
                <p className="text-sm text-blue-700 font-medium">Available Alumni</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-900">{stats.connections}</p>
                <p className="text-sm text-green-700 font-medium">Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-900">{stats.pendingRequests}</p>
                <p className="text-sm text-orange-700 font-medium">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-900">{stats.upcomingEvents}</p>
                <p className="text-sm text-purple-700 font-medium">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => router.push('/student/alumni')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Alumni Directory</h3>
                <p className="text-sm text-gray-600">Connect with alumni from your college</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/student/messages')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Messages</h3>
                <p className="text-sm text-gray-600">Chat with your connections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/student/events')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Events</h3>
                <p className="text-sm text-gray-600">Discover upcoming events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/student/jobs')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Job Opportunities</h3>
                <p className="text-sm text-gray-600">Find job postings from alumni</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/student/connections')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Connections</h3>
                <p className="text-sm text-gray-600">Manage your network</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/student/profile')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Profile</h3>
                <p className="text-sm text-gray-600">Update your profile</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Feed for students (view, like, comment only) */}
      <StudentFeed />
    </div>
  )
}

// Lightweight feed component reusing /api/posts
function StudentFeed() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')

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
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likes: updateLikesArray(p.likes || [], currentUserId, data.liked) } : p)))
  }

  const updateLikesArray = (likes: any[], userId: string, liked: boolean) => {
    const has = likes.some((id) => normalizeId(id) === userId)
    if (liked && !has) return [...likes, userId]
    if (!liked && has) return likes.filter((id) => normalizeId(id) !== userId)
    return likes
  }

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
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
    <Card>
      <CardHeader>
        <CardTitle>Community Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="p-4 border rounded-md">
              <div className="font-semibold">{post.authorFirstName} {post.authorLastName}</div>
              <div className="mt-2 whitespace-pre-wrap">{post.content}</div>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <button className="flex items-center gap-1" onClick={() => toggleLike(post._id)}>
                  <span>{(post.likes?.length || 0)} likes</span>
                </button>
                <button className="flex items-center gap-1" onClick={() => { const n = new Set(expanded); n.has(post._id) ? n.delete(post._id) : n.add(post._id); setExpanded(n) }}>
                  <span>{post.comments?.length ? `${post.comments.length} comments` : 'Comment'}</span>
                </button>
              </div>
              {expanded.has(post._id) && (
                <div className="mt-3">
                  <Textarea value={commentInputs[post._id] || ''} onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })} placeholder="Add a comment..." className="min-h-[60px]" />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={() => comment(post._id)} disabled={!(commentInputs[post._id] || '').trim()}>Comment</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
