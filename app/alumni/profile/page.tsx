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
  Globe
} from "lucide-react"
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
  major: string
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
}

export default function AlumniProfile() {
  const [profile, setProfile] = useState<AlumniProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<AlumniProfile>>({})
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
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
      } else {
        toast.error('Failed to fetch profile')
      }
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Logged out successfully')
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your professional information and network presence</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 mx-auto">
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
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600 mb-2">Alumni</p>
                </div>
              )}

              <Badge variant={profile.isApproved ? "default" : "secondary"} className="mb-4">
                {profile.isApproved ? "Approved" : "Pending Approval"}
              </Badge>

              <div className="space-y-2 text-sm text-gray-600">
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
                  {profile.degree} in {profile.major}
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

        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Experience</label>
                {editing ? (
                  <Textarea
                    value={editedProfile.experience?.join('\n') || ''}
                    onChange={(e) => handleArrayInputChange('experience', e.target.value.replace(/\n/g, ','))}
                    placeholder="List your work experience (one per line)"
                    rows={4}
                  />
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Academic Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                  {editing ? (
                    <Input
                      value={editedProfile.major || ''}
                      onChange={(e) => handleInputChange('major', e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.major}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Skills & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                {editing ? (
                  <Input
                    value={editedProfile.skills?.join(', ') || ''}
                    onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                    placeholder="e.g., JavaScript, Python, React, Leadership (comma separated)"
                  />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
                {editing ? (
                  <Textarea
                    value={editedProfile.achievements?.join('\n') || ''}
                    onChange={(e) => handleArrayInputChange('achievements', e.target.value.replace(/\n/g, ','))}
                    placeholder="List your achievements (one per line)"
                    rows={3}
                  />
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Professional Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
        </div>
      </div>
    </div>
  )
}
