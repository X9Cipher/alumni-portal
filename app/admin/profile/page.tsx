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
  Shield
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AdminProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  userType: string
  title?: string
  department?: string
  bio?: string
  skills?: string[]
  location?: string
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

export default function AdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<AdminProfile>>({})
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
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditedProfile(data.profile)
        setCurrentUserId(data.profile._id)
        fetchMyPosts(data.profile._id)
      } else {
        toast.error('Failed to fetch profile')
      }
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyPosts = async (userId: string) => {
    try {
      const res = await fetch('/api/posts', { credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        // Filter posts to show only admin's own posts
        const myPosts = (d.posts || []).filter((post: any) => {
          const postAuthorId = typeof post.authorId === 'string' ? post.authorId : (post.authorId?.$oid || '')
          return postAuthorId === userId
        })
        setPosts(myPosts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p>Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600">Manage your profile and view your activity</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">My Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={profile.profilePicture} />
                  <AvatarFallback className="bg-[#a41a2f] text-white text-2xl">
                    {profile.firstName?.[0]}
                    {profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{profile.title || 'Administrator'}</p>
                
                <Badge className="bg-[#a41a2f] text-white mb-4">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Activity feed will be implemented here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Account settings and preferences will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
