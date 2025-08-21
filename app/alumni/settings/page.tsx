"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Lock,
  Bell,
  Eye,
  Upload,
  Trash2,
  Shield,
  Mail,
  Phone,
  Camera,
  Save,
  AlertTriangle,
  Check,
  X,
} from "lucide-react"

export default function AlumniSettings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile, privacy, and account preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Photo
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Photo
                    </Button>
                    <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input id="title" defaultValue="Senior Software Engineer" />
                </div>
                <div>
                  <Label htmlFor="company">Current Company</Label>
                  <Input id="company" defaultValue="Google" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="Mountain View, CA" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Passionate software engineer with 6+ years of experience building scalable web applications."
                    className="min-h-[100px]"
                  />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Education & Career */}
            <Card>
              <CardHeader>
                <CardTitle>Education & Career</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch">Graduation Year</Label>
                    <Select defaultValue="2018">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                        <SelectItem value="2019">2019</SelectItem>
                        <SelectItem value="2018">2018</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="major">Major/Field of Study</Label>
                    <Input id="major" defaultValue="Computer Science Engineering" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="technology">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Update Information
                </Button>
              </CardContent>
            </Card>

            {/* Skills & Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skills">Professional Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {["JavaScript", "Python", "React", "Node.js", "AWS"].map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X className="w-3 h-3 cursor-pointer hover:text-red-600" />
                      </Badge>
                    ))}
                  </div>
                  <Input placeholder="Add new skill..." />
                </div>
                <div>
                  <Label htmlFor="interests">Interests & Hobbies</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {["Machine Learning", "Photography", "Hiking"].map((interest, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {interest}
                        <X className="w-3 h-3 cursor-pointer hover:text-red-600" />
                      </Badge>
                    ))}
                  </div>
                  <Input placeholder="Add new interest..." />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Skills & Interests
                </Button>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="website">Personal Website</Label>
                  <Input id="website" defaultValue="https://johndoe.dev" />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input id="linkedin" defaultValue="https://linkedin.com/in/johndoe" />
                </div>
                <div>
                  <Label htmlFor="github">GitHub Profile</Label>
                  <Input id="github" defaultValue="https://github.com/johndoe" />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter Profile</Label>
                  <Input id="twitter" defaultValue="https://twitter.com/johndoe" />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Update Social Links
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input id="email" defaultValue="john.doe@google.com" className="flex-1" />
                    <Button variant="outline" className="bg-transparent">
                      Verify
                    </Button>
                  </div>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Email verified
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input id="phone" defaultValue="+1 (555) 123-4567" className="flex-1" />
                    <Button variant="outline" className="bg-transparent">
                      Verify
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="backup-email">Backup Email</Label>
                  <Input id="backup-email" placeholder="backup@example.com" />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Update Contact Info
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h4 className="font-medium text-green-800">Account Active</h4>
                    <p className="text-sm text-green-600">Your account is in good standing</p>
                  </div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Member Since</h4>
                    <p className="text-sm text-gray-600">June 2018</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Last Login</h4>
                    <p className="text-sm text-gray-600">Today, 2:30 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">Deactivate Account</h4>
                  <p className="text-sm text-red-600 mb-3">
                    Temporarily disable your account. You can reactivate it anytime.
                  </p>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent">
                    Deactivate Account
                  </Button>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-600 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-6">
            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Profile Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Public Profile</h4>
                    <p className="text-sm text-gray-600">Make your profile visible to everyone</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Alumni Directory</h4>
                    <p className="text-sm text-gray-600">Show in alumni directory</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Search Engines</h4>
                    <p className="text-sm text-gray-600">Allow search engines to index your profile</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Address</span>
                    <Select defaultValue="alumni">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="alumni">Alumni Only</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Phone Number</span>
                    <Select defaultValue="connections">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="alumni">Alumni Only</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Company</span>
                    <Select defaultValue="public">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="alumni">Alumni Only</SelectItem>
                        <SelectItem value="connections">Connections Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messaging Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Messaging Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Allow Messages From</h4>
                    <p className="text-sm text-gray-600">Who can send you direct messages</p>
                  </div>
                  <Select defaultValue="alumni">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="alumni">Alumni Only</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                      <SelectItem value="none">No One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Read Receipts</h4>
                    <p className="text-sm text-gray-600">Show when you've read messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Online Status</h4>
                    <p className="text-sm text-gray-600">Show when you're online</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Data & Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Data & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Analytics</h4>
                    <p className="text-sm text-gray-600">Track who views your profile</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Usage Analytics</h4>
                    <p className="text-sm text-gray-600">Help improve the platform with usage data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Messages</h4>
                    <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Connection Requests</h4>
                    <p className="text-sm text-gray-600">Get notified about new connection requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Job Opportunities</h4>
                    <p className="text-sm text-gray-600">Get notified about relevant job postings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Event Invitations</h4>
                    <p className="text-sm text-gray-600">Get notified about upcoming events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Digest</h4>
                    <p className="text-sm text-gray-600">Weekly summary of platform activity</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Real-time Messages</h4>
                    <p className="text-sm text-gray-600">Instant notifications for new messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Event Reminders</h4>
                    <p className="text-sm text-gray-600">Reminders for events you're attending</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Views</h4>
                    <p className="text-sm text-gray-600">When someone views your profile</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Notification Frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Frequency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Frequency</span>
                  <Select defaultValue="immediate">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            {/* Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Password & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <h4 className="font-medium text-yellow-800">2FA Not Enabled</h4>
                    <p className="text-sm text-yellow-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button>Enable 2FA</Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Available Methods:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">SMS Authentication</p>
                          <p className="text-sm text-gray-600">Receive codes via text message</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Setup
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Authenticator App</p>
                          <p className="text-sm text-gray-600">Use Google Authenticator or similar</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Setup
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Login Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Login Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      device: "Chrome on MacBook Pro",
                      location: "Mountain View, CA",
                      time: "2 hours ago",
                      current: true,
                    },
                    { device: "Safari on iPhone", location: "Mountain View, CA", time: "1 day ago", current: false },
                    { device: "Chrome on Windows", location: "San Francisco, CA", time: "3 days ago", current: false },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {session.device}
                          {session.current && <Badge variant="secondary">Current</Badge>}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.location} • {session.time}
                        </p>
                      </div>
                      {!session.current && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Recovery */}
            <Card>
              <CardHeader>
                <CardTitle>Account Recovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recovery-email">Recovery Email</Label>
                  <Input id="recovery-email" defaultValue="backup@example.com" />
                </div>
                <div>
                  <Label htmlFor="recovery-phone">Recovery Phone</Label>
                  <Input id="recovery-phone" defaultValue="+1 (555) 987-6543" />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Update Recovery Options
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
