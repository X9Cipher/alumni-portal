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

export default function PublicProfile() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const params = useParams()
  const router = useRouter()
  const profileId = params?.id as string

  useEffect(() => {
    console.log('Profile: Component mounted with ID:', profileId)
    console.log('Profile: ID type:', typeof profileId)
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

    // Alumni can message students directly, so no connection request needed
    if (currentUser.userType === 'alumni' && profile?.userType === 'student') {
      toast.error('Alumni can message students directly without connection requests')
      return
    }

    // Alumni can message alumni directly, so no connection request needed
    if (currentUser.userType === 'alumni' && profile?.userType === 'alumni') {
      toast.error('Alumni can message alumni directly without connection requests')
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Button onClick={handleBack} variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl font-semibold bg-blue-100 text-blue-600">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {profile.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {profile.currentPosition && (
                      <p className="text-xl text-gray-600 mb-2">{profile.currentPosition}</p>
                    )}
                    {profile.currentRole && !profile.currentPosition && (
                      <p className="text-xl text-gray-600 mb-2">{profile.currentRole}</p>
                    )}
                    {profile.currentCompany && (
                      <p className="text-lg text-gray-600 mb-3">
                        <Building className="inline w-4 h-4 mr-2" />
                        {profile.currentCompany}
                      </p>
                    )}
                    {profile.location && (
                      <p className="text-gray-600 mb-3">
                        <MapPin className="inline w-4 h-4 mr-2" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {currentUser && currentUser._id !== profile._id && (
                      <>
                        <Button 
                          onClick={handleMessage}
                          className="bg-[#a41a2f] hover:bg-red-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        {currentUser.userType === 'student' && profile.userType === 'alumni' && (
                          <Button 
                            variant="outline"
                            onClick={handleConnect}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Profile Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Education & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Education */}
            {(profile.graduationYear || profile.degree || profile.major || profile.department) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    {profile.degree && profile.major && (
                      <p className="font-medium">{profile.degree} in {profile.major}</p>
                    )}
                    {profile.department && (
                      <p className="text-sm text-gray-600">{profile.department}</p>
                    )}
                    {profile.graduationYear && (
                      <p className="text-sm text-gray-500">Class of {profile.graduationYear}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

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
                      Personal Website
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Bio, Skills, Experience */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
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
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
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
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <p className="text-gray-700">{exp}</p>
                      </div>
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
                  <div className="space-y-3">
                    {profile.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

