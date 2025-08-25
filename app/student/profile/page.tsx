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
  BookOpen,
  Award,
  Eye
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

interface StudentProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  studentId: string
  currentYear: string
  department: string
  bio?: string
  skills?: string[]
  interests?: string[]
  location?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  gpa?: string
  achievements?: string[]
  profilePicture?: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
  // Privacy settings
  showEmailInProfile?: boolean
  showPhoneInProfile?: boolean
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<StudentProfile>>({})
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
      if (data.user.userType !== 'student') {
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
      console.log('Sending profile update:', editedProfile)
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProfile)
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditing(false)
        toast.success('Profile updated successfully')
      } else {
        const errorData = await response.json()
        console.error('Profile update failed:', errorData)
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

  const handleInputChange = (field: keyof StudentProfile, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfilePictureUpload = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`
      handleInputChange('profilePicture', dataUri)
    } catch {}
  }

  const handleArrayInputChange = (field: 'skills' | 'interests' | 'achievements', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    setEditedProfile(prev => ({
      ...prev,
      [field]: array
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
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="bg-green-600 hover:bg-green-700">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
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
              <Avatar className="w-24 h-24 mx-auto mb-4">
                {(editing ? editedProfile.profilePicture : profile.profilePicture) ? (
                  <AvatarImage src={(editing ? editedProfile.profilePicture : profile.profilePicture) as string} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
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
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleProfilePictureUpload(f)
                    }} />
                    <p className="text-xs text-gray-500">JPG, PNG. Max a few MB.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600 mb-2">Student</p>
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
                  <BookOpen className="w-4 h-4" />
                  Student ID: {profile.studentId}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Year {profile.currentYear}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {profile.department}
                </div>
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
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedProfile.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Phone number"
                      />
                      <Switch
                        id="show-phone"
                        checked={editedProfile.showPhoneInProfile || false}
                        onCheckedChange={(checked) => handleInputChange('showPhoneInProfile', checked)}
                      />
                    </div>
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
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
                  {editing ? (
                    <Select value={editedProfile.currentYear || ''} onValueChange={(value) => handleInputChange('currentYear', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">Year {profile.currentYear}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  {editing ? (
                    <Input
                      value={editedProfile.gpa || ''}
                      onChange={(e) => handleInputChange('gpa', e.target.value)}
                      placeholder="e.g., 3.8"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.gpa || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Skills & Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                {editing ? (
                  <Input
                    value={editedProfile.skills?.join(', ') || ''}
                    onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                    placeholder="e.g., JavaScript, Python, React (comma separated)"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                {editing ? (
                  <Input
                    value={editedProfile.interests?.join(', ') || ''}
                    onChange={(e) => handleArrayInputChange('interests', e.target.value)}
                    placeholder="e.g., Web Development, AI, Data Science (comma separated)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">{interest}</Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No interests added</p>
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
                <Settings className="w-5 h-5" />
                Social Links
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
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
        </div>
      </div>
    </div>
  )
}