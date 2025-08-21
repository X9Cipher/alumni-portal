"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  UserX,
  Search,
  Building,
  MapPin,
  GraduationCap
} from "lucide-react"

interface Connection {
  _id: string
  requesterId: string
  recipientId: string
  requesterType: string
  recipientType: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  requester?: any
  recipient?: any
}

export default function StudentConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { user: currentUser, loading: userLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (currentUser) {
      loadConnections()
    }
  }, [currentUser])

  const loadConnections = async () => {
    try {
      setLoading(true)
      
      // Load accepted connections
      const acceptedRes = await fetch('/api/connections?type=accepted&withUserInfo=true')
      const acceptedData = acceptedRes.ok ? await acceptedRes.json() : { connections: [] }
      
      // Load pending connections (both directions)
      const pendingRes = await fetch('/api/connections?type=pending&withUserInfo=true')
      const pendingData = pendingRes.ok ? await pendingRes.json() : { connections: [] }
      
      // Outgoing pending: requests the student has sent to alumni
      const outgoingPending = pendingData.connections.filter((conn: Connection) => 
        conn.requesterId?.toString() === currentUser?._id?.toString() && conn.recipientType === 'alumni'
      )
      
      setConnections(acceptedData.connections || [])
      setPendingConnections(outgoingPending)
    } catch (error) {
      console.error('Failed to load connections:', error)
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          status: 'accepted'
        })
      })

      if (response.ok) {
        toast({
          title: "Connection Accepted",
          description: "You can now message this user.",
        })
        loadConnections()
      } else {
        toast({
          title: "Error",
          description: "Failed to accept connection",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive"
      })
    }
  }

  const handleRejectConnection = async (connectionId: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          status: 'rejected'
        })
      })

      if (response.ok) {
        toast({
          title: "Connection Rejected",
          description: "Connection request has been rejected.",
        })
        loadConnections()
      } else {
        toast({
          title: "Error",
          description: "Failed to reject connection",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject connection",
        variant: "destructive"
      })
    }
  }

  const handleMessage = (userId: string, userType: string) => {
    router.push(`/student/messages?user=${userId}&type=${userType}`)
  }

  const getOtherUser = (connection: Connection) => {
    if (connection.requesterId?.toString() === currentUser?._id?.toString()) {
      return connection.recipient
    }
    return connection.requester
  }

  const filterConnections = (connections: Connection[]) => {
    if (!searchTerm) return connections
    
    return connections.filter(connection => {
      const otherUser = getOtherUser(connection)
      if (!otherUser) return false
      
      const searchLower = searchTerm.toLowerCase()
      return (
        otherUser.firstName?.toLowerCase().includes(searchLower) ||
        otherUser.lastName?.toLowerCase().includes(searchLower) ||
        otherUser.email?.toLowerCase().includes(searchLower) ||
        otherUser.department?.toLowerCase().includes(searchLower) ||
        otherUser.currentCompany?.toLowerCase().includes(searchLower)
      )
    })
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#a41a2f]"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access connections.</p>
        </div>
      </div>
    )
  }

  const filteredConnections = filterConnections(connections).filter((conn) => {
    const other = getOtherUser(conn)
    return other?.userType === 'alumni'
  })
  const filteredPending = filterConnections(pendingConnections)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Connections</h1>
        <p className="text-gray-600">Manage your professional network and connection requests</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input 
          placeholder="Search connections..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
                <p className="text-sm text-gray-600">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingConnections.length}</p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{connections.length + pendingConnections.length}</p>
                <p className="text-sm text-gray-600">Total Network</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">
            <UserCheck className="w-4 h-4 mr-2" />
            Connected ({filteredConnections.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <UserPlus className="w-4 h-4 mr-2" />
            Pending Requests ({filteredPending.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {filteredConnections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No connections yet</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No connections match your search.' : 'Start connecting with alumni to build your network.'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/student/alumni')}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Find Alumni
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {filteredConnections.map((connection) => {
                    const otherUser = getOtherUser(connection)
                    if (!otherUser) return null
                    return (
                      <div key={connection._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={otherUser.profilePicture || otherUser.linkedinUrl || '/placeholder-user.jpg'} />
                            <AvatarFallback className="bg-[#a41a2f] text-white">
                              {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-lg text-gray-900">
                                  {otherUser.firstName} {otherUser.lastName}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  {otherUser.currentCompany && (
                                    <div className="flex items-center gap-1">
                                      <Building className="w-3 h-3" />
                                      {otherUser.currentCompany}
                                    </div>
                                  )}
                                  {otherUser.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {otherUser.location}
                                    </div>
                                  )}
                                  {otherUser.graduationYear && (
                                    <Badge variant="secondary">Class of {otherUser.graduationYear}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Connected badge removed */}
                                <Button size="sm" onClick={() => handleMessage(otherUser._id, otherUser.userType)}>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Message
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredPending.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No pending requests match your search.' : 'You have no pending connection requests.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {filteredPending.map((connection) => {
                    const otherUser = getOtherUser(connection)
                    if (!otherUser) return null
                    return (
                      <div key={connection._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={otherUser.profilePicture || otherUser.linkedinUrl || '/placeholder-user.jpg'} />
                            <AvatarFallback className="bg-[#a41a2f] text-white">
                              {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-lg text-gray-900">
                                  {otherUser.firstName} {otherUser.lastName}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  {otherUser.currentCompany && (
                                    <div className="flex items-center gap-1">
                                      <Building className="w-3 h-3" />
                                      {otherUser.currentCompany}
                                    </div>
                                  )}
                                  {otherUser.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {otherUser.location}
                                    </div>
                                  )}
                                  {otherUser.graduationYear && (
                                    <Badge variant="secondary">Class of {otherUser.graduationYear}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Pending badge removed */}
                                <Button size="sm" variant="outline" disabled>
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Pending
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
