"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Building, 
  Edit3, 
  Save, 
  X,
  Loader2,
  LogOut,
  Settings,
  Briefcase,
  Award,
  Globe,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
  Video as VideoIcon,
  MoreHorizontal,
  Eye,
  Plus,
  Trash2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AlumniProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  graduationYear: string
  degree: string
  // major: string
  department: string
  currentCompany?: string
  currentPosition?: string
  location?: string
  bio?: string
  skills?: string[]
  experience?: string[]
  achievements?: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  websiteUrl?: string
  profilePicture?: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
  // Privacy settings
  showEmailInProfile?: boolean
  showPhoneInProfile?: boolean
}

export default function AlumniProfile() {
  const [profile, setProfile] = useState<AlumniProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<AlumniProfile>>({})
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  // Activity feed state
  const [posts, setPosts] = useState<any[]>([])
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
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchProfile()
  }, [])

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
    } catch (error) {
      router.push('/auth/login')
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditedProfile(data.profile)
        setCurrentUserId(data.profile._id)
        // Load posts feed and filter by author
        try {
          const postsRes = await fetch('/api/posts', { credentials: 'include' })
          if (postsRes.ok) {
            const postsData = await postsRes.json()
            const uid = (data.profile as any)._id?.toString?.() || (data.profile as any)._id
            setPosts((postsData.posts || []).filter((p: any) => (p.authorId?.$oid || p.authorId || '').toString() === uid))
          }
        } catch {}
      } else {
        toast.error('Failed to fetch profile')
      }
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const normalizeId = (id: any): string => {
    if (!id) return ''
    if (typeof id === 'string') return id
    if (typeof id === 'object' && typeof id.$oid === 'string') return id.$oid
    return id.toString?.() || ''
  }

  const openLikesDialog = async (post: any) => {
    const likeIds = (post.likes || []).map((id: any) => normalizeId(id)).filter(Boolean)
    setLikesOpenForPostId(post._id)
    try {
      const users = await Promise.all(
        likeIds.slice(0, 50).map(async (id: string) => {
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

  const toggleLike = async (postId: string) => {
    const res = await fetch(`/api/posts?action=like&postId=${postId}`, { method: 'PUT', credentials: 'include' })
    const data = await res.json()
    if (!res.ok) return
    // We don't have current user id here; refetch user quickly
    let me = editedProfile as any
    if (!me?._id) {
      try { const r = await fetch('/api/profile'); if (r.ok) { const d = await r.json(); me = d.profile } } catch {}
    }
    const myId = (me?._id || '').toString()
    setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likes: updateLikesArray(p.likes || [], myId, data.liked) } : p))
  }

  const updateLikesArray = (likes: any[], userId: string, liked: boolean) => {
    const has = likes.some((id) => normalizeId(id) === userId)
    if (liked && !has) return [...likes, userId]
    if (!liked && has) return likes.filter((id) => normalizeId(id) !== userId)
    return likes
  }

  const submitComment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim()
    if (!text) return
    const res = await fetch(`/api/posts?action=comment&postId=${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text }), credentials: 'include' })
    const data = await res.json()
    if (!res.ok) return
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p)))
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Logged out successfully')
        try {
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('userType')
          localStorage.removeItem('user')
          localStorage.setItem('auth-change', Date.now().toString())
          window.dispatchEvent(new Event('auth-change'))
        } catch {}
        router.push('/auth/login')
      } else {
        toast.error('Failed to logout')
      }
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Handle profile picture upload
      let profilePictureData = editedProfile.profilePicture
      if (profilePictureFile) {
        // Convert file to base64 for storage
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string
            resolve(result)
          }
        })
        reader.readAsDataURL(profilePictureFile)
        profilePictureData = await base64Promise
      }
      
      const profileDataToSend = {
        ...editedProfile,
        profilePicture: profilePictureData
      }
      
      console.log('Sending profile update:', profileDataToSend)
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileDataToSend),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditedProfile(data.profile)
        setEditing(false)
        setProfilePictureFile(null)
        setProfilePicturePreview(null)
        toast.success('Profile updated successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile || {})
    setEditing(false)
  }

  const handleInputChange = (field: keyof AlumniProfile, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayInputChange = (field: 'skills' | 'experience' | 'achievements', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    setEditedProfile(prev => ({
      ...prev,
      [field]: array
    }))
  }

  const addArrayItem = (field: 'skills' | 'experience' | 'achievements') => {
    setEditedProfile(prev => {
      const current = (prev[field] as string[] | undefined) || []
      return { ...prev, [field]: [...current, ""] }
    })
  }

  const updateArrayItem = (field: 'skills' | 'experience' | 'achievements', index: number, value: string) => {
    setEditedProfile(prev => {
      const current = ([...((prev[field] as string[] | undefined) || [])])
      current[index] = value
      return { ...prev, [field]: current }
    })
  }

  const removeArrayItem = (field: 'skills' | 'experience' | 'achievements', index: number) => {
    setEditedProfile(prev => {
      const current = ([...((prev[field] as string[] | undefined) || [])])
      current.splice(index, 1)
      return { ...prev, [field]: current }
    })
  }

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePictureFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null)
    setProfilePicturePreview(null)
    setEditedProfile(prev => ({
      ...prev,
      profilePicture: undefined
    }))
  }

  const saveEdit = async () => {
    if (!editingPostId) return
    const res = await fetch(`/api/posts?action=edit&postId=${editingPostId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: editingContent, media: editingMedia }),
    })
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p._id === editingPostId ? { ...p, content: editingContent, media: editingMedia } : p))
      setEditingPostId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile</p>
          <Button onClick={fetchProfile} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-end">
        
        <div className="flex gap-2">
          
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700 h-8 px-3 text-sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="h-8 px-3 text-sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 h-8 px-3 text-sm">
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="relative mb-4">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                  {profilePicturePreview || profile.profilePicture ? (
                    <AvatarImage 
                      src={profilePicturePreview || profile.profilePicture} 
                      alt="Profile Picture"
                    />
                  ) : null}
                  <AvatarFallback className="text-2xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                {editing && (
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="profile-picture" className="cursor-pointer">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <Edit3 className="w-4 h-4 text-white" />
                      </div>
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              {editing && profilePicturePreview && (
                <div className="mb-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRemoveProfilePicture}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Remove Picture
                  </Button>
                </div>
              )}
              
              {editing ? (
                <div className="space-y-3">
                  <Input
                    value={editedProfile.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First Name"
                  />
                  <Input
                    value={editedProfile.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600 mb-2">Alumni</p>
                </div>
              )}

              <Badge variant={profile.isApproved ? "default" : "secondary"} className="mb-4">
                {profile.isApproved ? "Approved" : "Pending Approval"}
              </Badge>

              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Class of {profile.graduationYear}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {profile.degree}
                </div>
                {profile.currentCompany && (
                  <div className="flex items-center justify-center gap-2">
                    <Building className="w-4 h-4" />
                    {profile.currentCompany}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Information and Activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 text-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {editing ? (
                    <Input
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {editing ? (
                    <Input
                      value={editedProfile.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.location || 'Not provided'}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {editing ? (
                  <Textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about your professional journey..."
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                )}
              </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                      {editing ? (
                        <Input
                          value={editedProfile.currentCompany || ''}
                          onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                          placeholder="Company name"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.currentCompany || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                      {editing ? (
                        <Input
                          value={editedProfile.currentPosition || ''}
                          onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                          placeholder="Job title"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.currentPosition || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Professional Experience</label>
                      {editing && (
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => addArrayItem('experience')}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing ? (
                      <div className="space-y-2">
                        {((editedProfile.experience as string[]) || []).map((exp, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input value={exp} onChange={(e) => updateArrayItem('experience', idx, e.target.value)} placeholder={`Experience ${idx + 1}`} />
                            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => removeArrayItem('experience', idx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(!editedProfile.experience || (editedProfile.experience as string[]).length === 0) && (
                          <p className="text-sm text-gray-500">No items yet. Click Add to create one.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {profile.experience && profile.experience.length > 0 ? (
                          profile.experience.map((exp, index) => (
                            <p key={index} className="text-gray-900">• {exp}</p>
                          ))
                        ) : (
                          <p className="text-gray-500">No experience added</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Academic Background */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                      {editing ? (
                        <Input
                          value={editedProfile.degree || ''}
                          onChange={(e) => handleInputChange('degree', e.target.value)}
                          placeholder="e.g., Bachelor of Technology"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.degree}</p>
                      )}
                    </div>
                    {/* Major removed */}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      {editing ? (
                        <Input
                          value={editedProfile.department || ''}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          placeholder="e.g., MCA"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.department || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                      {editing ? (
                        <Input
                          value={editedProfile.graduationYear || ''}
                          onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                          placeholder="e.g., 2023"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.graduationYear || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Achievements */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Skills & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Skills</label>
                      {editing && (
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => addArrayItem('skills')}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing ? (
                      <div className="space-y-2">
                        {((editedProfile.skills as string[]) || []).map((skill, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input value={skill} onChange={(e) => updateArrayItem('skills', idx, e.target.value)} placeholder={`Skill ${idx + 1}`} />
                            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => removeArrayItem('skills', idx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(!editedProfile.skills || (editedProfile.skills as string[]).length === 0) && (
                          <p className="text-sm text-gray-500">No items yet. Click Add to create one.</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">No skills added</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Achievements</label>
                      {editing && (
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => addArrayItem('achievements')}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {editing ? (
                      <div className="space-y-2">
                        {((editedProfile.achievements as string[]) || []).map((ach, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input value={ach} onChange={(e) => updateArrayItem('achievements', idx, e.target.value)} placeholder={`Achievement ${idx + 1}`} />
                            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => removeArrayItem('achievements', idx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(!editedProfile.achievements || (editedProfile.achievements as string[]).length === 0) && (
                          <p className="text-sm text-gray-500">No items yet. Click Add to create one.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {profile.achievements && profile.achievements.length > 0 ? (
                          profile.achievements.map((achievement, index) => (
                            <p key={index} className="text-gray-900">• {achievement}</p>
                          ))
                        ) : (
                          <p className="text-gray-500">No achievements added</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Professional Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                    {editing ? (
                      <Input
                        value={editedProfile.linkedinUrl || ''}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.linkedinUrl || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                    {editing ? (
                      <Input
                        value={editedProfile.githubUrl || ''}
                        onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                        placeholder="https://github.com/yourusername"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.githubUrl || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                    {editing ? (
                      <Input
                        value={editedProfile.portfolioUrl || ''}
                        onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.portfolioUrl || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    {editing ? (
                      <Input
                        value={editedProfile.websiteUrl || ''}
                        onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.websiteUrl || 'Not provided'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <label className="text-base font-medium">Show Email in Public Profile</label>
                        <p className="text-sm text-gray-500">Allow others to see your email address in your public profile</p>
                      </div>
                    </div>
                    <Switch 
                      checked={editedProfile.showEmailInProfile ?? false}
                      onCheckedChange={(checked) => handleInputChange('showEmailInProfile', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <label className="text-base font-medium">Show Phone in Public Profile</label>
                        <p className="text-sm text-gray-500">Allow others to see your phone number in your public profile</p>
                      </div>
                    </div>
                    <Switch 
                      checked={editedProfile.showPhoneInProfile ?? false}
                      onCheckedChange={(checked) => handleInputChange('showPhoneInProfile', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle>Activity</CardTitle>
                </CardHeader>
                <CardContent>
              {/* Create Post */}
              <div className="mb-4">
                <Textarea placeholder="Share an update..." value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} className="min-h-[80px]" />
                {selectedMedia.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {selectedMedia.map((m, idx) => (
                      <div key={idx} className="relative">
                        {m.mimeType.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                <div className="mt-2 flex items-center justify-between">
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
                  <Button size="sm" onClick={async () => {
                    if (!newPostContent.trim() && selectedMedia.length === 0) return
                    const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ type: selectedMedia[0]?.mimeType?.startsWith('image/') ? 'image' : selectedMedia[0]?.mimeType?.startsWith('video/') ? 'video' : 'text', content: newPostContent, media: selectedMedia }) })
                    const data = await res.json()
                    if (res.ok) { setPosts([data.post, ...posts]); setNewPostContent(''); setSelectedMedia([]) }
                  }}>Post</Button>
                </div>
              </div>

              {/* Posts List (owned by user) */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="p-4 text-sm text-gray-600">No posts yet.</div>
                ) : posts.map((post) => (
                  <div key={post._id} className="p-4 border rounded-lg shadow-sm bg-white" data-post-id={post._id}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{profile.firstName} {profile.lastName}</div>
                        <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{post.content}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingPostId(post._id); setEditingContent(post.content); setEditingMedia(post.media || (post.mediaDataUrl ? [{ dataUrl: post.mediaDataUrl, mimeType: post.mediaMimeType }] : [])) }}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={async () => { if (!confirm('Delete this post?')) return; const res = await fetch(`/api/posts?action=delete&postId=${post._id}`, { method: 'PUT', credentials: 'include' }); if (res.ok) setPosts((prev) => prev.filter((p) => p._id !== post._id)) }}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Media preview (simple) */}
                    {Array.isArray(post.media) && post.media.length > 0 && (
                      <div className="mt-3">
                        {post.media.length === 1 ? (
                          <div className="flex justify-center">
                            {post.media[0].mimeType?.startsWith('image/') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={post.media[0].dataUrl} alt="media" className="max-h-96 rounded object-contain cursor-pointer" onClick={() => setMediaViewer({ postId: post._id, index: 0 })} />
                            ) : (
                              <video controls className="max-h-96 rounded cursor-pointer" onClick={() => setMediaViewer({ postId: post._id, index: 0 })}>
                                <source src={post.media[0].dataUrl} type={post.media[0].mimeType} />
                              </video>
                            )}
                          </div>
                        ) : post.media.length === 2 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {post.media.map((m: any, idx: number) => (
                              <div key={idx}>
                                {m.mimeType?.startsWith('image/') ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={m.dataUrl} alt="media" className="h-64 w-full object-cover rounded cursor-pointer" onClick={() => setMediaViewer({ postId: post._id, index: idx })} />
                                ) : (
                                  <video className="h-64 w-full object-cover rounded cursor-pointer" controls onClick={() => setMediaViewer({ postId: post._id, index: idx })}>
                                    <source src={m.dataUrl} type={m.mimeType} />
                                  </video>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {post.media.slice(0, 3).map((m: any, idx: number) => (
                              <div key={idx} className="relative">
                                {m.mimeType?.startsWith('image/') ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={m.dataUrl} alt="media" className="h-40 w-full object-cover rounded cursor-pointer" onClick={() => setMediaViewer({ postId: post._id, index: idx })} />
                                ) : (
                                  <video className="h-40 w-full object-cover rounded cursor-pointer" onClick={() => setMediaViewer({ postId: post._id, index: idx })}>
                                    <source src={m.dataUrl} type={m.mimeType} />
                                  </video>
                                )}
                                {idx === 2 && post.media.length > 3 && (
                                  <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded text-lg">+{post.media.length - 3} more</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 justify-end">
                      <button className="flex items-center gap-1 hover:text-[#a41a2f]" onClick={() => toggleLike(post._id)}>
                        <ThumbsUp 
                          className={`w-4 h-4 ${post.likes?.some((id: any) => normalizeId(id) === currentUserId) ? 'fill-current text-[#a41a2f]' : ''}`} 
                        />
                        <span 
                          className={`${post.likes && post.likes.length > 0 ? 'underline-offset-2 hover:underline cursor-pointer' : ''}`} 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (post.likes && post.likes.length > 0) {
                              openLikesDialog(post) 
                            }
                          }}
                        >
                          {(post.likes?.length || 0)} likes
                        </span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-[#a41a2f]" onClick={() => { const next = new Set(expandedComments); next.has(post._id) ? next.delete(post._id) : next.add(post._id); setExpandedComments(next) }}>
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments?.length ? `${post.comments.length} comments` : 'Comment'}</span>
                      </button>
                    </div>

                    {expandedComments.has(post._id) && (
                      <div className="mt-3 space-y-3">
                        <div className="space-y-3">
                          {(post.comments || []).map((c: any) => (
                            <div key={(c._id as any) || `comment-${c.firstName}-${c.content?.slice(0, 10)}`} className="flex items-start gap-2">
                              <div className="bg-gray-100 rounded-md px-3 py-2 text-sm">
                                <span className="font-semibold mr-2">{c.firstName} {c.lastName}</span>
                                <span>{c.content}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <Textarea placeholder="Add a comment..." value={commentInputs[post._id] || ''} onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))} className="min-h-[60px]" />
                            <div className="mt-2 flex justify-end">
                              <Button size="sm" onClick={() => submitComment(post._id)} disabled={!(commentInputs[post._id] || '').trim()}>Comment</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Likes dialog */}
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
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={u.profilePicture || u.profileImage} />
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

          {/* Edit Post dialog */}
          <Dialog open={!!editingPostId} onOpenChange={(v) => !v && setEditingPostId(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit post</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} rows={4} />
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
                    <Button variant="outline" onClick={() => setEditingPostId(null)}>Cancel</Button>
                    <Button onClick={saveEdit} disabled={!editingContent.trim() && editingMedia.length === 0}>Save</Button>
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
                  <Carousel className="w-full" opts={{ startIndex: mediaViewer.index }}>
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

          {/* Professional Information, Academic Background, Skills & Achievements, and Professional Links are shown in Overview tab above */}
        </div>
      </div>
    </div>
  )
}
