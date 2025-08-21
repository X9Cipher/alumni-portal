"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, XCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface ConnectionRequest {
  _id: string
  requesterId: string
  recipientId: string
  status: 'pending' | 'accepted' | 'rejected'
  message?: string
  requester?: {
    _id?: string
    firstName?: string
    lastName?: string
    userType?: 'student' | 'alumni' | 'admin'
    profilePicture?: string
  }
}

export default function AlumniRequestsPage() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const { user: currentUser, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (currentUser?._id) {
      loadRequests()
    }
  }, [currentUser?._id])

  async function loadRequests() {
    try {
      setLoading(true)
      const res = await fetch('/api/connections?type=pending&withUserInfo=true')
      const data = res.ok ? await res.json() : { connections: [] }
      const incomingFromStudents = (data.connections || []).filter((c: ConnectionRequest) =>
        c.recipientId?.toString() === currentUser?._id?.toString() &&
        (c.requester?.userType === 'student')
      )
      setRequests(incomingFromStudents)
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleIgnore(requestId: string) {
    try {
      setActioningId(requestId)
      const res = await fetch('/api/messages/connection-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: requestId, status: 'rejected' })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to ignore request')
      }
      toast({ title: 'Request ignored' })
      await loadRequests()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to ignore request', variant: 'destructive' })
    } finally {
      setActioningId(null)
    }
  }

  function handleShow(req: ConnectionRequest) {
    const requesterId = req.requesterId?.toString() || req.requester?._id?.toString() || ''
    if (!requesterId) return
    router.push(`/alumni/messages?request=${req._id}&user=${requesterId}&type=student`)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Requests</h1>
          <p className="text-gray-600">Incoming connection requests from students</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-600">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            No pending requests from students
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={req.requester?.profilePicture || '/placeholder-user.jpg'} />
                    <AvatarFallback>
                      {req.requester?.firstName?.[0]}{req.requester?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {req.requester?.firstName} {req.requester?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">Student</div>
                    {req.message && (
                      <div className="text-sm text-gray-700 italic mt-1">"{req.message}"</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleShow(req)}>
                    <MessageSquare className="w-4 h-4 mr-1" /> Show
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleIgnore(req._id)} disabled={actioningId === req._id}>
                    {actioningId === req._id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                    Ignore
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
