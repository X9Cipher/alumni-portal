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
  Linkedin,
  Github,
  Link as LinkIcon,
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
  // major?: string
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

export default function PublicProfile() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'loading'>('loading')
  const params = useParams()
  const router = useRouter()
  const profileId = params?.id as string

  useEffect(() => {
    console.log('Profile: Component mounted with ID:', profileId)
    console.log('Profile: ID type:', typeof profileId)
    checkAuth()
    fetchPublicProfile()
  }, [profileId])

  useEffect(() => {
    if (currentUser && profile && currentUser._id !== profile._id) {
      checkConnectionStatus()
    }
  }, [currentUser, profile])

  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus('loading')
      const res = await fetch(`/api/connections/status?userId=${profileId}`, { credentials: 'include' })
      if (!res.ok) {
        setConnectionStatus('none')
        return
      }
      const data = await res.json()
      setConnectionStatus((data.status as any) || 'none')
    } catch {
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
      
      console.log('Fetching profile for ID:', profileId)
      const response = await fetch(`/api/users/${profileId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Profile data received:', data)
        setProfile(data.user)
      } else {
        const errorData = await response.json()
        console.error('Profile fetch error:', errorData)
        setError(errorData.error || 'Profile not found')
      }
    } catch (error) {
      console.error('Profile fetch exception:', error)
      setError('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = () => {
    if (!currentUser) {
      toast.error('Please login to send messages')
      router.push('/auth/login')
      return
    }
    
    // Navigate to messages page with the selected user
    router.push(`/alumni/messages?user=${profileId}&type=${profile?.userType}`)
  }

  const handleConnect = async () => {
    if (!currentUser) {
      toast.error('Please login to send connection requests')
      router.push('/auth/login')
      return
    }

    // Only allow connect when student -> alumni
    if (!(currentUser.userType === 'student' && profile?.userType === 'alumni')) {
      handleMessage()
      return
    }

    // Students need to send connection requests to alumni
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
    }
  }

  const handleBack = () => {
    router.back()
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'The profile you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-0">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Back Button */}
        

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
              <div className="flex flex-col items-center md:items-center">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-gray-200">
                  <AvatarImage src={profile.profilePicture || profile.profileImage} />
                  <AvatarFallback className="text-2xl font-semibold bg-[#a41a2f] text-white">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-3 flex flex-col items-center space-y-2">
                  {profile.department && (
                    <Badge variant="secondary" className="text-xs sm:text-sm">{profile.department}</Badge>
                  )}
                  {profile.graduationYear && (
                    <Badge variant="outline" className="text-xs sm:text-sm">Class of {profile.graduationYear}</Badge>
                  )}
                </div>
                {profile.bio && (
                  <p className="mt-3 text-center text-sm sm:text-base text-gray-700 max-w-xs whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-start sm:justify-between w-full mb-4 gap-3 sm:gap-6">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                    {profile.currentPosition && (
                      <p className="text-sm sm:text-base text-gray-800 mt-1">{profile.currentPosition}</p>
                    )}
                    {profile.currentCompany && (
                      <p className="text-sm sm:text-base text-gray-600">at {profile.currentCompany}</p>
                    )}
                  </div>
                  
                    {currentUser && currentUser._id !== profile._id && (
                      <Button onClick={handleMessage} className="sm:ml-auto mt-3 sm:mt-0 bg-white text-[#a41a2f] border border-[#a41a2f] hover:bg-[#a41a2f]/5 h-8 px-3 text-sm shrink-0 self-start sm:self-auto">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    )}
                </div>

                {/* Profile Stats */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
                  {profile.profileViews && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {profile.profileViews} profile views
                    </span>
                  )}
                  {profile.connections && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {profile.connections} connections
                    </span>
                  )}
                  {profile.mutualConnections && currentUser && currentUser._id !== profile._id && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {profile.mutualConnections} mutual connections
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Inline details inside the same card */}
            <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8 space-y-8 sm:space-y-10">
              {/* Contact + Education side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <section>
                  <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {(() => {
                      const digits = (profile.phone || '').replace(/\D/g, '')
                      return digits.length >= 7
                    })() && (
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

                {(profile.graduationYear || profile.degree || profile.department) && (
                  <section>
                    <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Education</h3>
                    <div className="text-gray-700">
                      {profile.degree && (
                        <p className="font-medium">{profile.degree}</p>
                      )}
                      {/* Department intentionally hidden in Education section */}
                      {profile.graduationYear && (<p className="text-sm text-gray-500">Class of {profile.graduationYear}</p>)}
                    </div>
                  </section>
                )}
              </div>

              {/* Skills + Experience side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
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
              </div>

              {/* Achievements + Social Links side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
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

                {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl || profile.websiteUrl) && (
                  <section>
                    <h3 className="text-lg font-semibold text-[#a41a2f] mb-3">Social & Links</h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                      {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                          <Linkedin className="w-4 h-4" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {profile.githubUrl && (
                        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-800 hover:underline">
                          <Github className="w-4 h-4" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {profile.portfolioUrl && (
                        <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-purple-700 hover:underline">
                          <LinkIcon className="w-4 h-4" />
                          <span>Portfolio</span>
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700 hover:underline">
                          <Globe className="w-4 h-4" />
                          <span>Website</span>
                        </a>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
                </CardContent>
              </Card>

        {/* Removed extra sections; everything is inside the header card now */}
      </div>
    </div>
  )
}

