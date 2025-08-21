"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Building, 
  Loader2,
  MessageCircle,
  Globe,
  Briefcase,
  Award,
  Users,
  Eye,
  ArrowLeft
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

interface PublicProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  graduationYear?: string
  degree?: string
  major?: string
  department?: string
  currentCompany?: string
  currentPosition?: string
  currentRole?: string
  location?: string
  bio?: string
  skills?: string[]
  experience?: string[]
  achievements?: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  websiteUrl?: string
  userType: 'student' | 'alumni' | 'admin'
  isApproved: boolean
  createdAt: string
  updatedAt: string
  // Computed fields
  isOnline?: boolean
  profileViews?: number
  connections?: number
  mutualConnections?: number
  fullName?: string
}

export default function StudentAlumniProfile() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const params = useParams()
  const router = useRouter()
  const profileId = params?.id as string

  useEffect(() => {
    console.log('StudentAlumniProfile: Component mounted with ID:', profileId)
    console.log('StudentAlumniProfile: ID type:', typeof profileId)
    checkAuth()
    fetchPublicProfile()
  }, [profileId])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      // User not authenticated, but can still view public profile
    }
  }

  const fetchPublicProfile = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log('StudentAlumniProfile: Fetching profile for ID:', profileId)
      const response = await fetch(`/api/users/${profileId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('StudentAlumniProfile: Profile data received:', data)
        setProfile(data.user)
      } else {
        const errorData = await response.json()
        console.error('StudentAlumniProfile: Profile fetch error:', errorData)
        setError(errorData.error || 'Profile not found')
      }
    } catch (error) {
      console.error('StudentAlumniProfile: Profile fetch exception:', error)
      setError('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = async () => {
    if (!currentUser) {
      toast.error('Please login to send messages')
      router.push('/auth/login')
      return
    }

    if (profile?.userType !== 'alumni') {
      toast.error('Students can only message alumni')
      return
    }

    // Check connection status
    try {
      const statusRes = await fetch(`/api/connections/status?userId=${profileId}`)
      const statusData = statusRes.ok ? await statusRes.json() : { status: 'none' }

      if (statusData.status === 'accepted') {
        router.push(`/student/messages?user=${profileId}&type=${profile?.userType}`)
        return
      }

      // Not connected: InMail-like prompt and request
      const initialMessage = prompt("Add a message to start the conversation (optional):")
      if (initialMessage === null) return

      const req = await fetch('/api/messages/connection-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: profileId,
          content: (initialMessage || "Hi! I'd like to connect and learn from your experience."),
          messageType: 'text'
        })
      })

      if (req.ok) {
        toast.success("Your message was sent with a connection request. You'll be able to chat after it's accepted.")
      } else {
        const err = await req.json()
        toast.error(err.error || 'Failed to send request')
      }
    } catch (e) {
      toast.error('Failed to initiate message')
    }
  }

  const handleConnect = async () => {
    if (!currentUser) {
      toast.error('Please login to send connection requests')
      router.push('/auth/login')
      return
    }

    // For students, they need to send connection requests to alumni
    if (currentUser.userType === 'student' && profile?.userType === 'alumni') {
      // Prompt for initial message
      const initialMessage = prompt("Add a message to your connection request (optional):")
      if (initialMessage === null) return // User cancelled

      try {
        const response = await fetch('/api/messages/connection-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            recipientId: profileId, 
            content: initialMessage || "Hi! I'm a student and would like to connect with you.",
            messageType: 'text'
          })
        })
        
        if (response.ok) {
          toast.success('Connection request sent successfully')
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || 'Failed to send connection request')
        }
      } catch (error) {
        toast.error('Failed to send connection request')
      }
    } else {
      toast.error('Invalid connection request')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The requested profile could not be found.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Alumni Directory
        </Button>
        
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            {profile.profilePicture ? (
              <AvatarImage src={profile.profilePicture} />
            ) : null}
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {profile.userType === 'alumni' ? 'Alumni' : profile.userType}
              </Badge>
              {profile.currentCompany && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {profile.currentCompany}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {/* Show only Connect when not connected; change to disabled after sending; show Message only when connected */}
            {currentUser && currentUser.userType === 'student' && profile.userType === 'alumni' && (
              <ConnectOrMessageControls targetUserId={profileId} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experience && profile.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <p className="text-gray-700">{exp}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {profile.achievements && profile.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-gray-700">{achievement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{profile.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.graduationYear && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">Class of {profile.graduationYear}</span>
                </div>
              )}
              {profile.degree && (
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{profile.degree}</p>
                  {profile.major && (
                    <p className="text-gray-600">in {profile.major}</p>
                  )}
                </div>
              )}
              {profile.department && (
                <div className="text-sm text-gray-600">
                  {profile.department}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Information */}
          {(profile.currentCompany || profile.currentPosition) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Professional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.currentPosition && (
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{profile.currentPosition}</p>
                  </div>
                )}
                {profile.currentCompany && (
                  <div className="text-sm text-gray-600">
                    {profile.currentCompany}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl || profile.websiteUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Social & Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.linkedinUrl && (
                  <a 
                    href={profile.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Briefcase className="w-4 h-4" />
                    LinkedIn Profile
                  </a>
                )}
                {profile.githubUrl && (
                  <a 
                    href={profile.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:underline"
                  >
                    <Briefcase className="w-4 h-4" />
                    GitHub Profile
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a 
                    href={profile.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-600 hover:underline"
                  >
                    <Briefcase className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
                {profile.websiteUrl && (
                  <a 
                    href={profile.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Inline controls component for Connect/Message behavior
function ConnectOrMessageControls({ targetUserId }: { targetUserId: string }) {
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'none' | 'pending' | 'connected'>('loading')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/connections/status?userId=${targetUserId}`)
        const data = res.ok ? await res.json() : { status: 'none' }
        if (data.status === 'accepted') setState('connected')
        else if (data.status === 'pending') setState('pending')
        else setState('none')
      } catch {
        setState('none')
      }
    }
    load()
  }, [targetUserId])

  const sendRequest = async () => {
    const initialMessage = prompt('Add a message to your connection request (optional):')
    if (initialMessage === null) return
    try {
      const res = await fetch('/api/messages/connection-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: targetUserId,
          content: initialMessage || "Hi! I'm a student and would like to connect with you.",
          messageType: 'text'
        })
      })
      if (res.ok || res.status === 409) {
        // 409 means already sent; treat as pending
        setState('pending')
        toast.success('Connection request sent')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to send request')
      }
    } catch {
      toast.error('Failed to send request')
    }
  }

  if (state === 'loading') {
    return (
      <Button disabled>
        <Users className="w-4 h-4 mr-2" />
        Connect
      </Button>
    )
  }

  if (state === 'connected') {
    return (
      <Button variant="outline" onClick={() => router.push(`/student/messages?user=${targetUserId}&type=alumni`)}>
        <MessageCircle className="w-4 h-4 mr-2" />
        Message
      </Button>
    )
  }

  if (state === 'pending') {
    return (
      <Button disabled className="bg-gray-300 hover:bg-gray-300 text-gray-600">
        <Users className="w-4 h-4 mr-2" />
        Pending
      </Button>
    )
  }

  return (
    <Button onClick={sendRequest} className="bg-[#a41a2f] hover:bg-red-700">
      <Users className="w-4 h-4 mr-2" />
      Connect
    </Button>
  )
}

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Building, 
  Loader2,
  MessageCircle,
  Globe,
  Briefcase,
  Award,
  Users,
  Eye,
  ArrowLeft
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

interface PublicProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  graduationYear?: string
  degree?: string
  major?: string
  department?: string
  currentCompany?: string
  currentPosition?: string
  currentRole?: string
  location?: string
  bio?: string
  skills?: string[]
  experience?: string[]
  achievements?: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  websiteUrl?: string
  userType: 'student' | 'alumni' | 'admin'
  isApproved: boolean
  createdAt: string
  updatedAt: string
  // Computed fields
  isOnline?: boolean
  profileViews?: number
  connections?: number
  mutualConnections?: number
  fullName?: string
}

export default function StudentAlumniProfile() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const params = useParams()
  const router = useRouter()
  const profileId = params?.id as string

  useEffect(() => {
    console.log('StudentAlumniProfile: Component mounted with ID:', profileId)
    console.log('StudentAlumniProfile: ID type:', typeof profileId)
    checkAuth()
    fetchPublicProfile()
  }, [profileId])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      // User not authenticated, but can still view public profile
    }
  }

  const fetchPublicProfile = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log('StudentAlumniProfile: Fetching profile for ID:', profileId)
      const response = await fetch(`/api/users/${profileId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('StudentAlumniProfile: Profile data received:', data)
        setProfile(data.user)
      } else {
        const errorData = await response.json()
        console.error('StudentAlumniProfile: Profile fetch error:', errorData)
        setError(errorData.error || 'Profile not found')
      }
    } catch (error) {
      console.error('StudentAlumniProfile: Profile fetch exception:', error)
      setError('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = async () => {
    if (!currentUser) {
      toast.error('Please login to send messages')
      router.push('/auth/login')
      return
    }

    if (profile?.userType !== 'alumni') {
      toast.error('Students can only message alumni')
      return
    }

    // Check connection status
    try {
      const statusRes = await fetch(`/api/connections/status?userId=${profileId}`)
      const statusData = statusRes.ok ? await statusRes.json() : { status: 'none' }

      if (statusData.status === 'accepted') {
        router.push(`/student/messages?user=${profileId}&type=${profile?.userType}`)
        return
      }

      // Not connected: InMail-like prompt and request
      const initialMessage = prompt("Add a message to start the conversation (optional):")
      if (initialMessage === null) return

      const req = await fetch('/api/messages/connection-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: profileId,
          content: (initialMessage || "Hi! I'd like to connect and learn from your experience."),
          messageType: 'text'
        })
      })

      if (req.ok) {
        toast.success("Your message was sent with a connection request. You'll be able to chat after it's accepted.")
      } else {
        const err = await req.json()
        toast.error(err.error || 'Failed to send request')
      }
    } catch (e) {
      toast.error('Failed to initiate message')
    }
  }

  const handleConnect = async () => {
    if (!currentUser) {
      toast.error('Please login to send connection requests')
      router.push('/auth/login')
      return
    }

    // For students, they need to send connection requests to alumni
    if (currentUser.userType === 'student' && profile?.userType === 'alumni') {
      // Prompt for initial message
      const initialMessage = prompt("Add a message to your connection request (optional):")
      if (initialMessage === null) return // User cancelled

      try {
        const response = await fetch('/api/messages/connection-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            recipientId: profileId, 
            content: initialMessage || "Hi! I'm a student and would like to connect with you.",
            messageType: 'text'
          })
        })
        
        if (response.ok) {
          toast.success('Connection request sent successfully')
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || 'Failed to send connection request')
        }
      } catch (error) {
        toast.error('Failed to send connection request')
      }
    } else {
      toast.error('Invalid connection request')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The requested profile could not be found.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Alumni Directory
        </Button>
        
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            {profile.profilePicture ? (
              <AvatarImage src={profile.profilePicture} />
            ) : null}
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {profile.userType === 'alumni' ? 'Alumni' : profile.userType}
              </Badge>
              {profile.currentCompany && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {profile.currentCompany}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {/* Show only Connect when not connected; change to disabled after sending; show Message only when connected */}
            {currentUser && currentUser.userType === 'student' && profile.userType === 'alumni' && (
              <ConnectOrMessageControls targetUserId={profileId} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experience && profile.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <p className="text-gray-700">{exp}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {profile.achievements && profile.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-gray-700">{achievement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{profile.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.graduationYear && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">Class of {profile.graduationYear}</span>
                </div>
              )}
              {profile.degree && (
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{profile.degree}</p>
                  {profile.major && (
                    <p className="text-gray-600">in {profile.major}</p>
                  )}
                </div>
              )}
              {profile.department && (
                <div className="text-sm text-gray-600">
                  {profile.department}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Information */}
          {(profile.currentCompany || profile.currentPosition) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Professional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.currentPosition && (
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{profile.currentPosition}</p>
                  </div>
                )}
                {profile.currentCompany && (
                  <div className="text-sm text-gray-600">
                    {profile.currentCompany}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl || profile.websiteUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Social & Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.linkedinUrl && (
                  <a 
                    href={profile.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Briefcase className="w-4 h-4" />
                    LinkedIn Profile
                  </a>
                )}
                {profile.githubUrl && (
                  <a 
                    href={profile.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:underline"
                  >
                    <Briefcase className="w-4 h-4" />
                    GitHub Profile
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a 
                    href={profile.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-600 hover:underline"
                  >
                    <Briefcase className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
                {profile.websiteUrl && (
                  <a 
                    href={profile.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Inline controls component for Connect/Message behavior
function ConnectOrMessageControls({ targetUserId }: { targetUserId: string }) {
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'none' | 'pending' | 'connected'>('loading')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/connections/status?userId=${targetUserId}`)
        const data = res.ok ? await res.json() : { status: 'none' }
        if (data.status === 'accepted') setState('connected')
        else if (data.status === 'pending') setState('pending')
        else setState('none')
      } catch {
        setState('none')
      }
    }
    load()
  }, [targetUserId])

  const sendRequest = async () => {
    const initialMessage = prompt('Add a message to your connection request (optional):')
    if (initialMessage === null) return
    try {
      const res = await fetch('/api/messages/connection-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: targetUserId,
          content: initialMessage || "Hi! I'm a student and would like to connect with you.",
          messageType: 'text'
        })
      })
      if (res.ok || res.status === 409) {
        // 409 means already sent; treat as pending
        setState('pending')
        toast.success('Connection request sent')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to send request')
      }
    } catch {
      toast.error('Failed to send request')
    }
  }

  if (state === 'loading') {
    return (
      <Button disabled>
        <Users className="w-4 h-4 mr-2" />
        Connect
      </Button>
    )
  }

  if (state === 'connected') {
    return (
      <Button variant="outline" onClick={() => router.push(`/student/messages?user=${targetUserId}&type=alumni`)}>
        <MessageCircle className="w-4 h-4 mr-2" />
        Message
      </Button>
    )
  }

  if (state === 'pending') {
    return (
      <Button disabled className="bg-gray-300 hover:bg-gray-300 text-gray-600">
        <Users className="w-4 h-4 mr-2" />
        Pending
      </Button>
    )
  }

  return (
    <Button onClick={sendRequest} className="bg-[#a41a2f] hover:bg-red-700">
      <Users className="w-4 h-4 mr-2" />
      Connect
    </Button>
  )
}


