"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, ThumbsUp, Image as ImageIcon, Video as VideoIcon, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Backend post shape
interface ApiComment {
  _id?: string
  userId: string
  userType: "student" | "alumni" | "admin"
  firstName: string
  lastName: string
  content: string
  createdAt: string
}

interface ApiPost {
  _id: string
  authorId?: string
  authorFirstName: string
  authorLastName: string
  authorType: "alumni" | "admin"
  content: string
  type: "text" | "image" | "video" | "article"
  mediaDataUrl?: string
  mediaMimeType?: string
  media?: { dataUrl: string; mimeType: string }[]
  likes?: any[] // ObjectId[] serialized to string or {$oid}
  comments?: ApiComment[]
  createdAt: string
}

interface Profile {
  _id: string
  firstName: string
  lastName: string
  department?: string
  currentRole?: string
  currentCompany?: string
  graduationYear?: string
  profileImage?: string
  profilePicture?: string
}

export default function AlumniHome() {
  // Profile
  const [alumni, setAlumni] = useState<Profile | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  // Posts
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  // Media upload (multiple)
  const [selectedMedia, setSelectedMedia] = useState<{ dataUrl: string; mimeType: string }[]>([])

  // Author profile pictures cache
  const [authorPics, setAuthorPics] = useState<Record<string, string>>({})

  // Pending connections (compact list)
  const [pendingConnections, setPendingConnections] = useState<any[]>([])
  const [recentJoiners, setRecentJoiners] = useState<any[]>([])

  useEffect(() => {
    // Load profile from existing API
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        const profile: Profile = { ...data.profile, profileImage: data.profile.profileImage || data.profile.profilePicture }
        setAlumni(profile)
        setCurrentUserId(profile._id)
      } catch {}
    }

    // Load posts feed
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts", { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        setPosts(data.posts || [])
        // warm author avatars
        const ids: string[] = (data.posts || [])
          .map((p: any) => (typeof p.authorId === 'string' ? p.authorId : (p.authorId?.$oid || '')))
          .filter((id: string) => id && !authorPics[id])
        if (ids.length) {
          const results = await Promise.all(ids.map(async (id: string) => {
            try {
              const r = await fetch(`/api/users/${id}`)
              const d = await r.json()
              if (r.ok && d.user) return [id, d.user.profilePicture || d.user.profileImage || ''] as const
            } catch {}
            return [id, ''] as const
          }))
          setAuthorPics((prev) => ({ ...prev, ...Object.fromEntries(results) }))
        }
      } catch {}
    }

    // Load pending connections
    const fetchPending = async () => {
      try {
        const response = await fetch("/api/connections?type=pending&withUserInfo=true", { credentials: "include" })
        if (!response.ok) return
        const data = await response.json()
        setPendingConnections(data.connections || [])
      } catch {}
    }

    fetchProfile()
    fetchPosts()
    fetchPending()
    const fetchRecent = async () => {
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
      } catch {}
    }
    fetchRecent()
  }, [])

  const handlePost = async () => {
    if (!content.trim()) return
    try {
      setLoading(true)
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedMedia[0]?.mimeType?.startsWith("image/")
            ? "image"
            : selectedMedia[0]?.mimeType?.startsWith("video/")
            ? "video"
            : "text",
          content,
          media: selectedMedia,
        }),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to post")
      // API returns { success, post }
      setPosts((prev) => [data.post as ApiPost, ...prev])
      setContent("")
      setSelectedMedia([])
    } catch (e) {
      // swallow for now
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts?action=like&postId=${postId}`, {
        method: "PUT",
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) return
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: updateLikesArray(p.likes || [], currentUserId, data.liked),
              }
            : p
        )
      )
    } catch {}
  }

  const normalizeId = (id: any): string => {
    if (!id) return ""
    if (typeof id === "string") return id
    if (typeof id === "object" && typeof id.$oid === "string") return id.$oid
    return id.toString?.() || ""
  }

  const updateLikesArray = (likes: any[], userId: string, liked: boolean) => {
    if (!userId) return likes
    const has = likes.some((id) => normalizeId(id) === userId)
    if (liked && !has) return [...likes, userId]
    if (!liked && has) return likes.filter((id) => normalizeId(id) !== userId)
    return likes
  }

  // Likes dialog
  const [likesOpenForPostId, setLikesOpenForPostId] = useState<string | null>(null)
  const [likesUsers, setLikesUsers] = useState<Array<{ _id: string; firstName: string; lastName: string; userType: string; profilePicture?: string; profileImage?: string }>>([])

  const openLikesDialog = async (post: ApiPost) => {
    const likeIds = (post.likes || []).map((id) => normalizeId(id)).filter(Boolean)
    setLikesOpenForPostId(post._id)
    try {
      const users = await Promise.all(
        likeIds.slice(0, 50).map(async (id) => {
          const res = await fetch(`/api/users/${id}`)
          const data = await res.json()
          if (res.ok && data.user) return data.user
          return null
        })
      )
      setLikesUsers(users.filter(Boolean) as any)
    } catch {
      setLikesUsers([])
    }
  }

  // Comments UI state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  // Cache of user profile pictures for comments per post
  const [commentUserPics, setCommentUserPics] = useState<Record<string, Record<string, string>>>({})

  const ensureCommentUserPics = async (post: ApiPost) => {
    const current = commentUserPics[post._id] || {}
    const userIds = (post.comments || []).map((c) => c.userId).filter((id) => !!id && !current[id])
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

  // Edit modal state
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<string>("")
  const [editingMedia, setEditingMedia] = useState<{ dataUrl: string; mimeType: string }[]>([])

  const openEditModal = (post: ApiPost) => {
    setEditingPostId(post._id)
    setEditingContent(post.content)
    const arr = (post as any).media as { dataUrl: string; mimeType: string }[] | undefined
    if (arr && Array.isArray(arr) && arr.length > 0) setEditingMedia(arr)
    else if (post.mediaDataUrl && post.mediaMimeType) setEditingMedia([{ dataUrl: post.mediaDataUrl, mimeType: post.mediaMimeType }])
    else setEditingMedia([])
  }

  // Media viewer (slider) state
  const [mediaViewer, setMediaViewer] = useState<{ postId: string; index: number } | null>(null)

  const saveEdit = async () => {
    if (!editingPostId) return
    const res = await fetch(`/api/posts?action=edit&postId=${editingPostId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: editingContent, media: editingMedia }),
    })
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p._id === editingPostId ? { ...p, content: editingContent, media: editingMedia } as any : p))
      setEditingPostId(null)
    }
  }

  const submitComment = async (postId: string) => {
    const contentText = (commentInputs[postId] || "").trim()
    if (!contentText) return
    try {
      const res = await fetch(`/api/posts?action=comment&postId=${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentText }),
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) return
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p)))
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
    } catch {}
  }

  if (!alumni) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a41a2f] mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {alumni.firstName}!</h1>
            <p className="text-gray-600">
              {alumni.currentRole ? `${alumni.currentRole} at ${alumni.currentCompany || ""}` : "Update your profile to share your role"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar (restored) */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="pb-4 pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-28 h-28">
                    <AvatarImage src={alumni.profileImage} />
                    <AvatarFallback className="bg-[#a41a2f] text-white text-xl">
                      {alumni.firstName?.[0]}
                      {alumni.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mt-3">
                    {alumni.firstName} {alumni.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {alumni.currentRole} {alumni.currentCompany ? `at ${alumni.currentCompany}` : ""}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {alumni.department || "Department"}
                    {alumni.graduationYear ? `, Class of ${alumni.graduationYear}` : ""}
                  </Badge>
                  <a href="/alumni/profile" className="mt-3 w-full">
                    <Button variant="outline" className="w-full">View Profile</Button>
                  </a>
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
                    <a key={a._id} href={`/alumni/profile/${a._id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
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

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Create Post */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={alumni.profileImage} />
                    <AvatarFallback>
                      {alumni.firstName?.[0]}
                      {alumni.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Share an update..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    {selectedMedia.length > 0 && (
                      <div className="mt-2">
                        <div className="grid grid-cols-3 gap-2">
                          {selectedMedia.slice(0, 3).map((m, idx) => (
                            <div key={idx} className="relative">
                              {m.mimeType.startsWith('image/') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={m.dataUrl} alt="media" className="h-28 w-full object-cover rounded" />
                              ) : (
                                <video className="h-28 w-full object-cover rounded">
                                  <source src={m.dataUrl} type={m.mimeType} />
                                </video>
                              )}
                              <button
                                className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6"
                                onClick={() => setSelectedMedia(selectedMedia.filter((_, i) => i !== idx))}
                                aria-label="Remove"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {selectedMedia.length > 3 && (
                            <div className="flex items-center justify-center h-28 rounded bg-gray-100 text-sm text-gray-600">
                              +{selectedMedia.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#a41a2f] cursor-pointer">
                          <ImageIcon className="w-4 h-4" /> Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = () => {
                                setSelectedMedia((prev) => [...prev, { dataUrl: reader.result as string, mimeType: file.type }])
                              }
                              reader.readAsDataURL(file)
                            }}
                          />
                        </label>
                        <label className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#a41a2f] cursor-pointer">
                          <VideoIcon className="w-4 h-4" /> Video
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = () => {
                                setSelectedMedia((prev) => [...prev, { dataUrl: reader.result as string, mimeType: file.type }])
                              }
                              reader.readAsDataURL(file)
                            }}
                          />
                        </label>
                      </div>
                      <Button size="sm" onClick={handlePost} disabled={loading || !content.trim()}>
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-600">No posts yet.</CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post._id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <a href={`/alumni/profile/${post.authorId || ''}`}>
                      <Avatar className="w-10 h-10">
                          <AvatarImage src={authorPics[post.authorId || ''] || undefined} />
                        <AvatarFallback className="bg-[#a41a2f] text-white text-sm">
                          {post.authorFirstName?.[0]}
                          {post.authorLastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      </a>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {post.authorFirstName} {post.authorLastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                          {/* Actions menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded hover:bg-gray-100">
                                <MoreHorizontal className="w-5 h-5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditModal(post)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={async () => {
                                  if (!confirm('Delete this post?')) return
                                  const res = await fetch(`/api/posts?action=delete&postId=${post._id}`, { method: 'PUT', credentials: 'include' })
                                  if (res.ok) setPosts((prev) => prev.filter((p) => p._id !== post._id))
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 whitespace-pre-wrap break-words">{post.content}</div>
                        {/* Media preview: support legacy single media and new multiple media */}
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
                            {post.type === "image" && post.mediaDataUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={post.mediaDataUrl} alt="post" className="mt-3 max-h-96 rounded-md" />
                            )}
                            {post.type === "video" && post.mediaDataUrl && (
                              <video controls className="mt-3 max-h-[28rem] rounded-md">
                                <source src={post.mediaDataUrl} type={post.mediaMimeType || undefined} />
                              </video>
                            )}
                          </>
                        )}
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 justify-start">
                          <button
                            className="flex items-center gap-1 hover:text-[#a41a2f]"
                            onClick={() => toggleLike(post._id)}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span
                              className="underline-offset-2 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation()
                                openLikesDialog(post)
                              }}
                            >
                              {(post.likes?.length || 0)} likes
                            </span>
                          </button>
                          <button
                            className="flex items-center gap-1 hover:text-[#a41a2f]"
                            onClick={() => {
                              const next = new Set(expandedComments)
                              if (next.has(post._id)) next.delete(post._id)
                              else next.add(post._id)
                              setExpandedComments(next)
                              if (!expandedComments.has(post._id)) {
                                ensureCommentUserPics(post)
                              }
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comments?.length ? `${post.comments.length} comments` : "Comment"}</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {expandedComments.has(post._id) && (
                          <div className="mt-3 space-y-3">
                            {/* Existing comments (show first 2, allow expand) */}
                            {(() => {
                              const total = post.comments?.length || 0
                              const isExpanded = true
                              const visible = isExpanded ? total : Math.min(2, total)
                              return (
                                <div className="space-y-3">
                                  {post.comments?.slice(0, visible).map((c) => (
                                    <div key={(c._id as any) || Math.random()} className="flex items-start gap-2">
                                      <a href={`/${c.userType === 'student' ? 'student' : 'alumni'}/profile/${c.userId}`}>
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={commentUserPics[post._id]?.[c.userId]} />
                                          <AvatarFallback className="bg-gray-200 text-xs">
                                            {c.firstName?.[0]}
                                            {c.lastName?.[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                      </a>
                                      <div className="bg-gray-100 rounded-md px-3 py-2 text-sm">
                                        <span className="font-semibold mr-2">{c.firstName} {c.lastName}</span>
                                        <span>{c.content}</span>
                                      </div>
                                    </div>
                                  ))}
                                  {total > 2 && !isExpanded && (
                                    <button className="text-xs text-gray-600 hover:text-[#a41a2f]">View all {total} comments</button>
                                  )}
                                </div>
                              )
                            })()}

                            {/* Add comment */}
                            <div className="flex items-start gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={alumni.profileImage} />
                                <AvatarFallback className="bg-[#a41a2f] text-white text-xs">
                                  {alumni.firstName?.[0]}
                                  {alumni.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <Textarea
                                  placeholder="Add a comment..."
                                  value={commentInputs[post._id] || ""}
                                  onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                                  className="min-h-[60px]"
                                />
                                <div className="mt-2 flex justify-end">
                                  <Button size="sm" onClick={() => submitComment(post._id)} disabled={!(commentInputs[post._id] || "").trim()}>
                                    Comment
                                  </Button>
                          </div>
                        </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    <Dialog open={!!likesOpenForPostId} onOpenChange={(v) => !v && setLikesOpenForPostId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liked by</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto space-y-3">
          {likesUsers.length === 0 ? (
            <div className="text-sm text-gray-600">No likes yet.</div>
          ) : (
            likesUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <a href={`/alumni/profile/${u._id}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.profilePicture || u.profileImage} />
                    <AvatarFallback className="bg-[#a41a2f] text-white text-xs">
                      {u.firstName?.[0]}
                      {u.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </a>
                <div className="text-sm">
                  <div className="font-medium">{u.firstName} {u.lastName}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Post Modal */}
    <Dialog open={!!editingPostId} onOpenChange={(v) => !v && setEditingPostId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="min-h-[100px]" />
          {editingMedia.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {editingMedia.map((m, idx) => (
                <div key={idx} className="relative">
                  {m.mimeType.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#a41a2f] cursor-pointer">
              <ImageIcon className="w-4 h-4" /> Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const r = new FileReader()
                r.onload = () => { setEditingMedia((prev) => [...prev, { dataUrl: r.result as string, mimeType: file.type }]) }
                r.readAsDataURL(file)
              }} />
            </label>
            <label className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#a41a2f] cursor-pointer">
              <VideoIcon className="w-4 h-4" /> Video
              <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const r = new FileReader()
                r.onload = () => { setEditingMedia((prev) => [...prev, { dataUrl: r.result as string, mimeType: file.type }]) }
                r.readAsDataURL(file)
              }} />
            </label>
            <div className="ml-auto">
              <Button size="sm" onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

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
                  return media.map((m, idx) => (
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
    </div>
  )
}