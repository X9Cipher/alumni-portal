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
  profileImage?: string
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
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'loading'>('loading')
  const params = useParams()
  const router = useRouter()
  const profileId = params?.id as string

  useEffect(() => {
    console.log('StudentAlumniProfile: Component mounted with ID:', profileId)
    console.log('StudentAlumniProfile: ID type:', typeof profileId)
    checkAuth()
    fetchPublicProfile()
  }, [profileId])

  useEffect(() => {
    if (currentUser && profile) {
      checkConnectionStatus()
    }
  }, [currentUser, profile])

  const checkConnectionStatus = async () => {
    if (!currentUser || !profile) return
    
    try {
      setConnectionStatus('loading')
      const response = await fetch(`/api/connections/status?userId=${profileId}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setConnectionStatus(data.status || 'none')
      } else {
        setConnectionStatus('none')
      }
    } catch (error) {
      console.error('Failed to check connection status:', error)
      setConnectionStatus('none')
    }
  }

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
        
        if (data.user) {
          const profileData = data.user
          // Ensure required fields exist
          profileData.fullName = `${profileData.firstName} ${profileData.lastName}`
          setProfile(profileData)
        } else {
          setError("Profile not found")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load profile")
      }
    } catch (error) {
      console.error('StudentAlumniProfile: Error fetching profile:', error)
      setError("Failed to load profile")
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

    const messagesBase = currentUser.userType === 'alumni' ? '/alumni/messages' : '/student/messages'

    // Check connection status
    try {
      if (currentUser.userType === 'alumni') {
        router.push(`${messagesBase}?user=${profileId}&type=${profile?.userType}`)
        return
      }
      const statusRes = await fetch(`/api/connections/status?userId=${profileId}`, { credentials: 'include' })
      const statusData = statusRes.ok ? await statusRes.json() : { status: 'none' }
      if (statusData.status === 'accepted') {
        router.push(`${messagesBase}?user=${profileId}&type=${profile?.userType}`)
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
          setConnectionStatus('pending')
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
          <p className="text-gray-600 mb-4">The requested profile could not be loaded.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
            Back
        </Button>
        
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-start gap-6">
              {/* Profile Avatar Section */}
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.profilePicture || profile.profileImage} />
                  <AvatarFallback className="bg-[#a41a2f] text-white text-2xl font-bold">
                    {profile.firstName?.[0]}
                    {profile.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
                {/* Quick Stats */}
                <div className="mt-3 flex flex-col items-center space-y-2">
                  {profile.department && (
                    <Badge variant="secondary" className="text-sm">
                      {profile.department}
                </Badge>
              )}
                  {profile.graduationYear && (
                    <Badge variant="outline" className="text-sm">
                      Class of {profile.graduationYear}
                    </Badge>
                  )}
                </div>
                {/* Bio under avatar */}
                {profile.bio && (
                  <p className="mt-4 text-center text-base text-gray-700 max-w-xs whitespace-pre-wrap">
                    {profile.bio}
                  </p>
          )}
        </div>

              {/* Profile Info Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {profile.fullName}
                      </h1>
                      <div className="mt-1">
                        {profile.currentPosition && (
                          <p className="text-lg text-gray-800">
                            {profile.currentPosition}
                          </p>
                        )}
                        {profile.currentCompany && (
                          <p className="text-base text-gray-600">
                            at {profile.currentCompany}
                          </p>
                        )}
                </div>
                </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {profile.location && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                          <MapPin className="w-4 h-4 text-[#a41a2f]" />
                          <span>{profile.location}</span>
                </div>
              )}
              {profile.degree && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                          <GraduationCap className="w-4 h-4 text-[#a41a2f]" />
                          <span>{profile.degree}</span>
                </div>
              )}
                      {profile.major && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                          <Award className="w-4 h-4 text-[#a41a2f]" />
                          <span>{profile.major}</span>
                </div>
              )}
                  </div>
                  </div>
                  
                  {/* Single stateful action button */}
                  <div className="flex">
                    {connectionStatus === 'loading' && (
                      <Button disabled className="bg-gray-200 text-gray-600">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </Button>
                    )}
                    {connectionStatus === 'none' && (
                      <Button onClick={handleConnect} className="bg-[#a41a2f] text-white hover:bg-[#8e182a]">
        <Users className="w-4 h-4 mr-2" />
        Connect
      </Button>
                    )}
                    {connectionStatus === 'pending' && (
                      <Button disabled className="bg-[#a41a2f] text-white">
        <Users className="w-4 h-4 mr-2" />
        Pending
      </Button>
                    )}
                    {connectionStatus === 'accepted' && (
                      <Button onClick={() => router.push(`/student/messages?user=${profileId}&type=${profile?.userType}`)} className="bg-white text-[#a41a2f] border border-[#a41a2f] hover:bg-[#a41a2f]/5">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
        </Button>
            )}
          </div>
        </div>
      </div>
            </div>
              {/* Inline details inside the same card */}
              <div className="mt-8 border-t pt-8 space-y-10">
                {/* Contact Information */}
                <section>
                  <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {!profile.email && !profile.phone && !profile.location && (
                      <p className="text-gray-500 italic">No contact information available</p>
                    )}
                  </div>
                </section>

                {/* Education */}
                {(profile.graduationYear || profile.degree || profile.major || profile.department) && (
                  <section>
                    <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Education</h3>
                    <div className="text-gray-700">
                      {profile.degree && profile.major && (<p className="font-medium">{profile.degree} in {profile.major}</p>)}
                      {profile.department && (<p className="text-sm text-gray-600">{profile.department}</p>)}
                      {profile.graduationYear && (<p className="text-sm text-gray-500">Class of {profile.graduationYear}</p>)}
                    </div>
                  </section>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-[#a41a2f]/10 text-[#a41a2f] text-sm">{skill}</span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Experience */}
                {profile.experience && profile.experience.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Experience</h3>
                    <div className="space-y-2">
                      {profile.experience.map((exp, idx) => (
                        <div key={idx} className="pl-4 border-l-4 border-[#a41a2f]/30 text-gray-700">{exp}</div>
                  ))}
                </div>
                  </section>
          )}

          {/* Achievements */}
          {profile.achievements && profile.achievements.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Achievements</h3>
                <div className="space-y-2">
                      {profile.achievements.map((a, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-gray-700"><Award className="w-4 h-4 text-yellow-500 mt-0.5" />{a}</div>
                      ))}
                    </div>
                  </section>
          )}

          {/* Social Links */}
          {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl || profile.websiteUrl) && (
                  <section>
                    <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Social & Links</h3>
                    <div className="space-y-2 text-sm">
                      {profile.linkedinUrl && (<a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>)}
                      {profile.githubUrl && (<div><a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:underline">GitHub</a></div>)}
                      {profile.portfolioUrl && (<div><a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline">Portfolio</a></div>)}
                      {profile.websiteUrl && (<div><a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Website</a></div>)}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    
  )
}
