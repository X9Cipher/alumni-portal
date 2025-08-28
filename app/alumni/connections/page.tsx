"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  GraduationCap,
  MapPin,
} from "lucide-react"

interface Connection {
  _id: string
  requesterId: string
  recipientId: string
  requesterType: string
  recipientType: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  requester?: any
  recipient?: any
}

export default function AlumniConnections() {
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

      const acceptedRes = await fetch(
        "/api/connections?type=accepted&withUserInfo=true"
      )
      const acceptedData = acceptedRes.ok
        ? await acceptedRes.json()
        : { connections: [] }

      const pendingRes = await fetch(
        "/api/connections?type=pending&withUserInfo=true"
      )
      const pendingData = pendingRes.ok
        ? await pendingRes.json()
        : { connections: [] }

      // For alumni, show incoming requests where current user is recipient
      const incomingPending = (pendingData.connections || []).filter(
        (conn: Connection) =>
          conn.recipientId?.toString() === currentUser?._id?.toString()
      )

      setConnections(acceptedData.connections || [])
      setPendingConnections(incomingPending)
    } catch (error) {
      console.error("Failed to load connections:", error)
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const response = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status: "accepted" }),
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
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
      })
    }
  }

  const handleRejectConnection = async (connectionId: string) => {
    try {
      const response = await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status: "rejected" }),
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
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject connection",
        variant: "destructive",
      })
    }
  }

  const handleMessage = (userId: string, userType: string) => {
    router.push(`/alumni/messages?user=${userId}&type=${userType}`)
  }

  const handleShowRequest = (connection: Connection) => {
    const other = getOtherUser(connection)
    if (!other?._id) return
    router.push(`/alumni/messages?request=${connection._id}&user=${other._id}&type=${other.userType}`)
  }

  const getOtherUser = (connection: Connection) => {
    if (connection.requesterId?.toString() === currentUser?._id?.toString()) {
      return connection.recipient
    }
    return connection.requester
  }

  const filteredConnections = useMemo(() => {
    if (!searchTerm) return connections
    const term = searchTerm.toLowerCase()
    return connections.filter((connection) => {
      const other = getOtherUser(connection)
      if (!other) return false
      return (
        other.firstName?.toLowerCase().includes(term) ||
        other.lastName?.toLowerCase().includes(term) ||
        other.email?.toLowerCase().includes(term) ||
        other.department?.toLowerCase().includes(term) ||
        other.currentCompany?.toLowerCase().includes(term)
      )
    })
  }, [connections, searchTerm])

  const filteredPending = useMemo(() => {
    if (!searchTerm) return pendingConnections
    const term = searchTerm.toLowerCase()
    return pendingConnections.filter((connection) => {
      const other = getOtherUser(connection)
      if (!other) return false
      return (
        other.firstName?.toLowerCase().includes(term) ||
        other.lastName?.toLowerCase().includes(term) ||
        other.email?.toLowerCase().includes(term) ||
        other.department?.toLowerCase().includes(term) ||
        other.currentCompany?.toLowerCase().includes(term)
      )
    })
  }, [pendingConnections, searchTerm])

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

  return (
    <div className="space-y-6">
      

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search students..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            <UserPlus className="w-4 h-4 mr-2" />
            Pending Requests ({filteredPending.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredPending.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "No pending requests match your search."
                    : "You have no pending connection requests."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPending.map((connection) => {
                const otherUser = getOtherUser(connection)
                if (!otherUser) return null
                if (otherUser.userType !== 'student') return null

                return (
                  <Card
                    key={connection._id}
                    className="hover:shadow-lg transition-shadow border-yellow-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4">
                        <Avatar className="w-16 h-16 shrink-0">
                          <AvatarFallback className="bg-[#a41a2f] text-white">
                            {otherUser.firstName?.[0]}
                            {otherUser.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {otherUser.firstName} {otherUser.lastName}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {otherUser.currentPosition || "Position not specified"}
                          </p>
                          {otherUser.currentCompany && (
                            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                              <Building className="w-3 h-3" />
                              {otherUser.currentCompany}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <GraduationCap className="w-3 h-3" />
                            Student
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 sm:ml-auto mt-2 sm:mt-0">
                          Pending
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleShowRequest(connection)}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Show
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleRejectConnection(connection._id)}>
                          <UserX className="w-4 h-4 mr-1" />
                          Ignore
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
