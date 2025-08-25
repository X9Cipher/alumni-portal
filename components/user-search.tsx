'use client'

import { useState, useEffect } from 'react'
import { Search, User, Users, GraduationCap, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  userType: 'student' | 'alumni' | 'admin'
  graduationYear?: string
  department?: string
  currentCompany?: string
  currentPosition?: string
  location?: string
  profilePicture?: string
  isApproved: boolean
  createdAt: string
  // Computed fields
  isOnline?: boolean
  profileViews?: number
  connections?: number
  mutualConnections?: number
}

interface UserSearchProps {
  onUserSelect?: (user: User) => void
  onConnectRequest?: (userId: string, userType: 'student' | 'alumni') => void
  excludeCurrentUser?: boolean
  currentUserId?: string
  currentUserType?: 'student' | 'alumni'
  getConnectionStatus?: (userId: string) => any
  isConnectionRequestPending?: (userId: string) => boolean
}

export function UserSearch({ 
  onUserSelect, 
  onConnectRequest, 
  excludeCurrentUser = true,
  currentUserId,
  currentUserType,
  getConnectionStatus,
  isConnectionRequestPending
}: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState<'all' | 'students' | 'alumni'>('alumni')
  const { toast } = useToast()

  const searchUsers = async () => {
    if (!query.trim()) {
      setUsers([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        type: 'alumni',
        limit: '20'
      })

      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) {
        throw new Error('Failed to search users')
      }

      const data = await response.json()
      let filteredUsers = data.users

      // Exclude current user if needed
      if (excludeCurrentUser && currentUserId) {
        filteredUsers = filteredUsers.filter((user: User) => user._id !== currentUserId)
      }

      // Force alumni-only in results
      filteredUsers = filteredUsers.filter((user: User) => user.userType === 'alumni')

      setUsers(filteredUsers)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: 'Error',
        description: 'Failed to search users',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, searchType])

  const handleConnect = async (user: User) => {
    if (!onConnectRequest) return

    // Prompt for initial message for student-alumni connections
    if (currentUserType === 'student' && user.userType === 'alumni') {
      const initialMessage = prompt("Add a message to your connection request (optional):")
      if (initialMessage === null) return // User cancelled

      try {
        const response = await fetch('/api/messages/connection-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: user._id,
            content: initialMessage || "Hi! I'm a student and would like to connect with you.",
            messageType: 'text'
          })
        })

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Connection request sent successfully',
          })
          // Call the callback to update UI
          onConnectRequest(user._id, user.userType as 'student' | 'alumni')
        } else {
          const errorData = await response.json()
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to send connection request',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Connection request error:', error)
        toast({
          title: 'Error',
          description: 'Failed to send connection request',
          variant: 'destructive'
        })
      }
    } else {
      // For other user types, use the old method
      try {
        await onConnectRequest(user._id, user.userType as 'student' | 'alumni')
        
        toast({
          title: 'Success',
          description: 'Connection request sent successfully',
        })
      } catch (error) {
        console.error('Connection request error:', error)
        toast({
          title: 'Error',
          description: 'Failed to send connection request',
          variant: 'destructive'
        })
      }
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'student':
        return <GraduationCap className="h-4 w-4" />
      case 'alumni':
        return <Building2 className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'student':
        return 'Student'
      case 'alumni':
        return 'Alumni'
      default:
        return 'User'
    }
  }

  // Format course + batch/class line to replace generic Student/Alumni labels
  const formatCourseBatch = (u: User): string => {
    const degree = (u as any).degree || ''
    const dept = u.department || ''
    const degreeDept = [degree, dept].filter(Boolean).join(' ')
    if (u.userType === 'alumni') {
      const company = u.currentCompany || ''
      const year = u.graduationYear ? `Class of ${u.graduationYear}` : ''
      return [company, degreeDept, year].filter(Boolean).join(' • ') || 'Alumni'
    }
    if (u.userType === 'student') {
      const year = (u as any).currentYear ? `Year ${(u as any).currentYear}` : ''
      return [degreeDept, year].filter(Boolean).join(' • ') || 'Student'
    }
    return degreeDept || getUserTypeLabel(u.userType)
  }

  const getConnectButtonProps = (user: User) => {
    if (!getConnectionStatus || !isConnectionRequestPending) {
      return { text: 'Connect', disabled: false, variant: 'default' as const }
    }

    const connection = getConnectionStatus(user._id)
    const isPending = isConnectionRequestPending(user._id)

    if (connection?.status === 'accepted') {
      return { text: 'Connected', disabled: true, variant: 'secondary' as const }
    } else if (connection?.status === 'pending') {
      return { text: 'Request Pending', disabled: true, variant: 'secondary' as const }
    } else if (isPending) {
      return { text: 'Request Sent', disabled: true, variant: 'secondary' as const }
    } else {
      return { text: 'Connect', disabled: false, variant: 'default' as const }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by name, email, or department..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Search type toggle removed to enforce alumni-only */}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      {/* Show profile picture if available */}
                      {((user as any).profilePicture) ? (
                        <AvatarImage src={(user as any).profilePicture} />
                      ) : null}
                      <AvatarFallback>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 
                          className="font-medium hover:text-blue-600 cursor-pointer transition-colors"
                          onClick={() => window.open(`/alumni/profile/${user._id}`, '_blank')}
                        >
                          {user.firstName} {user.lastName}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatCourseBatch(user)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.userType === 'alumni' && user.currentCompany && (
                        <p className="text-xs text-muted-foreground">
                          {user.currentPosition} at {user.currentCompany}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {/* Removed Select button as requested */}
                    {onConnectRequest && (
                      (() => {
                        // Apply new messaging rules
                        if (currentUserType === 'student') {
                          // Students can only connect with alumni
                          if (user.userType !== 'alumni') {
                            return null // Don't show connect button for students
                          }
                        } else if (currentUserType === 'alumni') {
                          // Alumni can message alumni directly without connections
                          if (user.userType === 'alumni') {
                            return (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const enrichedUser = {
                                    ...user,
                                    fullName: `${user.firstName} ${user.lastName}`.trim(),
                                    linkedinUrl: (user as any).linkedinUrl || '',
                                    isOnline: (user as any).isOnline || false
                                  }
                                  onUserSelect?.(enrichedUser)
                                }}
                              >
                                Message
                              </Button>
                            )
                          }
                          // Alumni can message students directly without connections
                          if (user.userType === 'student') {
                            return (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const enrichedUser = {
                                    ...user,
                                    fullName: `${user.firstName} ${user.lastName}`.trim(),
                                    linkedinUrl: (user as any).linkedinUrl || '',
                                    isOnline: (user as any).isOnline || false
                                  }
                                  onUserSelect?.(enrichedUser)
                                }}
                              >
                                Message
                              </Button>
                            )
                          }
                        }

                        const buttonProps = getConnectButtonProps(user)
                        
                        // If connected, show message button instead
                        if (buttonProps.text === 'Connected') {
                          return (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Ensure user object has all required fields
                                const enrichedUser = {
                                  ...user,
                                  fullName: `${user.firstName} ${user.lastName}`.trim(),
                                  linkedinUrl: (user as any).linkedinUrl || '',
                                  isOnline: (user as any).isOnline || false
                                }
                                onUserSelect?.(enrichedUser)
                              }}
                            >
                              Message
                            </Button>
                          )
                        }
                        
                        return (
                          <Button
                            size="sm"
                            variant={buttonProps.variant}
                            disabled={buttonProps.disabled}
                            onClick={() => handleConnect(user)}
                          >
                            {buttonProps.text}
                          </Button>
                        )
                      })()
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && query && users.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No users found matching "{query}"</p>
        </div>
      )}
    </div>
  )
}
