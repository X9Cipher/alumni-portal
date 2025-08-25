"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  TrendingUp,
  Eye,
  UserPlus,
  ThumbsUp
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { formatDistanceToNow } from "date-fns"
import NotificationBell from "@/components/notification-bell"

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    connections: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
    jobPostings: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentJoiners, setRecentJoiners] = useState<any[]>([])
  const router = useRouter()
  const { user: currentUser, loading: userLoading } = useAuth()

  useEffect(() => {
    if (currentUser) {
      loadDashboardStats()
      loadRecentJoiners()
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

  const loadRecentJoiners = async () => {
    try {
      const res = await fetch('/api/alumni/directory', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      const list = (data.alumni || [])
        .map((a: any) => ({
          _id: a._id?.toString?.() || a._id,
          firstName: a.firstName,
          lastName: a.lastName,
          graduationYear: a.graduationYear,
          profileImage: a.profilePicture || a.profileImage,
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date()
        }))
        .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
      setRecentJoiners(list.slice(0, 5))
    } catch (error) {
      console.error('Failed to load recent joiners:', error)
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
    <div className="min-h-screen">
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser.firstName}!</h1>
            <p className="text-gray-600">
              Connect with alumni, discover opportunities, and grow your network
            </p>
          </div>
          
          {/* Notification Bell */}
          <NotificationBell userType="student" userId={currentUser._id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <CardContent className="pb-4 pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-28 h-28">
                    <AvatarImage src={currentUser.profilePicture || currentUser.profileImage} />
                    <AvatarFallback className="bg-[#a41a2f] text-white text-xl">
                      {currentUser.firstName?.[0]}
                      {currentUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mt-3">
                    {currentUser.firstName} {currentUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Student
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {currentUser.department || "Department"}
                    {currentUser.year ? `, Year ${currentUser.year}` : ""}
                    {currentUser.graduationYear ? `, Class of ${currentUser.graduationYear}` : ""}
                  </Badge>
                  <a href="/student/profile" className="mt-3 w-full">
                    <Button variant="outline" className="w-full">View Profile</Button>
                  </a>
            </div>
          </CardContent>
        </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Alumni</span>
                  <span className="font-semibold text-blue-600">{stats.totalAlumni}</span>
              </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connections</span>
                  <span className="font-semibold text-green-600">{stats.connections}</span>
              </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Requests</span>
                  <span className="font-semibold text-orange-600">{stats.pendingRequests}</span>
            </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upcoming Events</span>
                  <span className="font-semibold text-purple-600">{stats.upcomingEvents}</span>
            </div>
          </CardContent>
        </Card>

            {/* Recent Joiners */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Joiners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentJoiners.length === 0 ? (
                  <div className="text-sm text-gray-500">No new joiners yet.</div>
                ) : (
                  recentJoiners.map((a: any) => (
                    <a key={a._id} href={`/student/alumni/profile/${a._id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={a.profileImage} />
                        <AvatarFallback className="bg-[#a41a2f] text-white text-xs">
                          {a.firstName?.[0]}
                          {a.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{a.firstName} {a.lastName}</div>
                        {a.graduationYear && (
                          <div className="text-xs text-gray-500 truncate">Class of {a.graduationYear}</div>
                        )}
              </div>
                    </a>
                  ))
                )}
          </CardContent>
        </Card>
      </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Community Feed */}
            <StudentFeed currentUser={currentUser} />
              </div>
            </div>
              </div>
    </div>
  )
}

// Lightweight feed component reusing /api/posts
function StudentFeed({ currentUser }: { currentUser: any }) {
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [authorPics, setAuthorPics] = useState<Record<string, string>>({})
  
  // Cache of user profile pictures for comments per post
  const [commentUserPics, setCommentUserPics] = useState<Record<string, Record<string, string>>>({})
  
  // Like modal state
  const [likesOpenForPostId, setLikesOpenForPostId] = useState<string | null>(null)
  const [likesUsers, setLikesUsers] = useState<any[]>([])

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
      if (currentUser) {
        setCurrentUserId(currentUser._id)
      }
      const res = await fetch('/api/posts', { credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        setPosts(d.posts || [])
        loadAuthorPics(d.posts || [])
      }
    }
    load()
  }, [currentUser])

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

  const loadLikesUsers = async (postId: string) => {
    try {
      const post = posts.find(p => p._id === postId)
      if (!post || !post.likes || post.likes.length === 0) {
        setLikesUsers([])
        return
      }

      const results = await Promise.all(
        post.likes.map(async (userId: string) => {
          try {
            const res = await fetch(`/api/users/${userId}`)
            const data = await res.json()
            if (res.ok && data.user) {
              return {
                _id: data.user._id,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                profilePicture: data.user.profilePicture || data.user.profileImage
              }
            }
          } catch {}
          return null
        })
      )

      setLikesUsers(results.filter(Boolean))
    } catch (error) {
      console.error('Failed to load likes users:', error)
      setLikesUsers([])
    }
  }

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  const ensureCommentUserPics = async (post: any) => {
    const current = commentUserPics[post._id] || {}
    const userIds = (post.comments || []).map((c: any) => c.userId).filter((id: string) => !!id && !current[id])
    if (userIds.length === 0) return
    try {
      const results = await Promise.all(
        userIds.map(async (id) => {
          const res = await fetch(`/api/users/${id}`)
          const data = await res.json()
          if (res.ok && data.user) return { id, pic: data.user.profilePicture || data.user.profileImage || '' }
          return { id, pic: '' }
        })
      )
      setCommentUserPics((prev) => ({
        ...prev,
        [post._id]: {
          ...current,
          ...Object.fromEntries(results.map((r) => [r.id, r.pic])),
        },
      }))
    } catch {}
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

  // Add media viewer
  const [mediaViewer, setMediaViewer] = useState<{ postId: string; index: number } | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                  <div className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                </div>
              </div>
              <div className="mt-2 whitespace-pre-wrap">{post.content}</div>
                  
              {/* Media preview: support multiple/legacy */}
              {Array.isArray((post as any).media) && (post as any).media.length > 0 ? (
                <div className="mt-3">
                  {(() => {
                    const media = (post as any).media as { dataUrl: string; mimeType: string }[]
                    if (media.length === 1) {
                      const m = media[0]
                      return (
                        <button type="button" className="block w-full" onClick={() => setMediaViewer({ postId: post._id, index: 0 })}>
                          {m.mimeType.startsWith('image/') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.dataUrl} alt="media" className="w-full max-h-[28rem] object-contain rounded" />
                          ) : (
                            <video controls className="w-full rounded">
                              <source src={m.dataUrl} type={m.mimeType} />
                            </video>
                          )}
                        </button>
                      )
                    }
                    if (media.length === 2) {
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {media.map((m, idx) => (
                            <button key={idx} type="button" onClick={() => setMediaViewer({ postId: post._id, index: idx })}>
                              {m.mimeType?.startsWith('image/') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={m.dataUrl} alt="media" className="h-64 w-full object-cover rounded" />
                              ) : (
                                <video className="h-64 w-full object-cover rounded">
                                  <source src={m.dataUrl} type={m.mimeType} />
                                </video>
                              )}
                            </button>
                          ))}
                        </div>
                      )
                    }
                    return (
                      <div className="grid grid-cols-3 gap-2">
                        {media.slice(0, 3).map((m, idx) => (
                          <button key={idx} type="button" className="relative" onClick={() => setMediaViewer({ postId: post._id, index: idx })}>
                            {m.mimeType?.startsWith('image/') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.dataUrl} alt="media" className="h-40 w-full object-cover rounded" />
                            ) : (
                              <video className="h-40 w-full object-cover rounded">
                                <source src={m.dataUrl} type={m.mimeType} />
                              </video>
                            )}
                            {idx === 2 && media.length > 3 && (
                              <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded text-lg">
                                +{media.length - 3} more
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <>
                  {post.type === 'image' && post.mediaDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.mediaDataUrl} alt="post" className="mt-3 max-h-96 rounded-md" />
                  )}
                  {post.type === 'video' && post.mediaDataUrl && (
                    <video controls className="mt-3 max-h-[28rem] rounded-md">
                      <source src={post.mediaDataUrl} type={post.mediaMimeType || undefined} />
                    </video>
                  )}
                </>
              )}
                  
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 justify-end">
                                         <button 
                       className="flex items-center gap-1 hover:text-[#a41a2f]" 
                       onClick={() => toggleLike(post._id)}
                     >
                       <ThumbsUp 
                         className={`w-4 h-4 ${post.likes?.some((id: any) => normalizeId(id) === currentUserId) ? 'fill-current text-[#a41a2f]' : ''}`} 
                       />
                       <span 
                         className={`${post.likes && post.likes.length > 0 ? 'underline-offset-2 hover:underline cursor-pointer' : ''}`}
                         onClick={(e) => {
                           e.stopPropagation()
                           if (post.likes && post.likes.length > 0) {
                             setLikesOpenForPostId(post._id)
                             loadLikesUsers(post._id)
                           }
                         }}
                       >
                         {(post.likes?.length || 0)} likes
                       </span>
                </button>
                    <button className="flex items-center gap-1" onClick={() => { 
                      const n = new Set(expanded); 
                      if (n.has(post._id)) {
                        n.delete(post._id)
                      } else {
                        n.add(post._id)
                        ensureCommentUserPics(post)
                      }
                      setExpanded(n) 
                    }}>
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments?.length ? `${post.comments.length} comments` : 'Comment'}</span>
                </button>
              </div>
                  
              {expanded.has(post._id) && (
                    <div className="mt-3 space-y-3">
                      {/* Existing comments - show all comments for everyone to see */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3">
                          {post.comments.map((c: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={commentUserPics[post._id]?.[c.userId]} />
                                <AvatarFallback className="bg-gray-200 text-xs">
                                  {c.firstName?.[0]}{c.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-gray-100 rounded-md px-3 py-2 text-sm flex-1">
                                <span className="font-semibold mr-2">{c.firstName} {c.lastName}</span>
                                <span>{c.content}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add comment input */}
                      <div className="flex items-start gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={currentUser.profilePicture || currentUser.profileImage} />
                          <AvatarFallback className="bg-[#a41a2f] text-white text-xs">
                            {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea 
                            value={commentInputs[post._id] || ''} 
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })} 
                            placeholder="Add a comment..." 
                            className="min-h-[60px]" 
                          />
                  <div className="mt-2 flex justify-end">
                            <Button size="sm" onClick={() => comment(post._id)} disabled={!(commentInputs[post._id] || '').trim()}>
                              Comment
                            </Button>
                          </div>
                        </div>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      {/* Media Viewer Modal */}
      <Dialog open={!!mediaViewer} onOpenChange={(v) => !v && setMediaViewer(null)}>
        <DialogContent className="max-w-3xl">
          {mediaViewer && (
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {(() => {
                    const post = posts.find((p) => p._id === mediaViewer.postId) as any
                    const media = (post?.media || []) as { dataUrl: string; mimeType: string }[]
                    return media.map((m: any, idx: number) => (
                      <CarouselItem key={idx}>
                        <div className="flex items-center justify-center h-[28rem] bg-black/5 rounded">
                          {m.mimeType.startsWith('image/') ? (
                            // eslint-disable-next-line @next/next/no-img-element
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
      
      {/* Likes Modal */}
      <Dialog open={!!likesOpenForPostId} onOpenChange={(v) => !v && setLikesOpenForPostId(null)}>
        <DialogContent>
          <div className="max-h-80 overflow-y-auto space-y-3">
            <h3 className="text-lg font-semibold mb-4">Liked by</h3>
            {likesUsers.length === 0 ? (
              <div className="text-sm text-gray-600">No likes yet.</div>
            ) : (
              likesUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.profilePicture} />
                    <AvatarFallback className="bg-[#a41a2f] text-white text-xs">
                      {u.firstName?.[0]}
                      {u.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium">{u.firstName} {u.lastName}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
