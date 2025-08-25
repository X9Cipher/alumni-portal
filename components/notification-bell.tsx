"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface Notification {
  _id: string
  type: 'job' | 'event' | 'like' | 'comment' | 'connection'
  title: string
  message: string
  userId?: string
  userFirstName?: string
  userLastName?: string
  userType?: 'student' | 'alumni' | 'admin'
  recipientType?: 'student' | 'alumni' | 'admin'
  createdAt: Date | string // Can be either Date object or string
  read: boolean
  link?: string
}

interface NotificationBellProps {
  userType: 'student' | 'alumni'
  userId: string
}

export default function NotificationBell({ userType, userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  // Handle post scrolling after navigation
  useEffect(() => {
    const scrollToPostId = sessionStorage.getItem('scrollToPostId')
    if (scrollToPostId) {
      // Clear the stored postId
      sessionStorage.removeItem('scrollToPostId')
      
      // Wait for the page to render, then scroll to the post
      setTimeout(() => {
        const postElement = document.querySelector(`[data-post-id="${scrollToPostId}"]`)
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Highlight the post briefly
          postElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
          setTimeout(() => {
            postElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
          }, 3000)
        }
      }, 500)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${userId}&userType=${userType}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched notifications:', data.notifications)
        
        // Debug: Log the createdAt values and links
        if (data.notifications && data.notifications.length > 0) {
          console.log('Notification details:', data.notifications.map((n: Notification) => ({
            id: n._id,
            type: n.type,
            title: n.title,
            link: n.link,
            recipientType: n.recipientType,
            createdAt: n.createdAt,
            createdAtType: typeof n.createdAt,
            isDate: n.createdAt instanceof Date
          })))
        }
        
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType })
      })
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return '💼'
      case 'event':
        return '📅'
      case 'like':
        return '👍'
      case 'comment':
        return '💬'
      case 'connection':
        return '🤝'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'text-blue-600'
      case 'event':
        return 'text-purple-600'
      case 'like':
        return 'text-green-600'
      case 'comment':
        return 'text-orange-600'
      case 'connection':
        return 'text-indigo-600'
      default:
        return 'text-gray-600'
    }
  }

  // Helper function to safely format dates
  const formatNotificationDate = (dateValue: Date | string) => {
    try {
      let date: Date
      
      if (dateValue instanceof Date) {
        date = dateValue
      } else if (typeof dateValue === 'string') {
        // Handle different date string formats
        if (dateValue === 'Invalid Date' || !dateValue) {
          return 'Recently'
        }
        date = new Date(dateValue)
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return 'Recently'
        }
      } else {
        return 'Recently'
      }
      
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', dateValue)
      return 'Recently'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
    
    // Navigate to the relevant page if link is provided
    if (notification.link) {
      console.log('Notification clicked:', {
        type: notification.type,
        title: notification.title,
        link: notification.link,
        recipientType: notification.recipientType,
        userType: userType
      })
      
      // Handle incorrect links with fallback
      let targetLink = notification.link
      
      // Fix common incorrect links
      if (notification.type === 'job' && notification.link === '/jobs') {
        targetLink = userType === 'alumni' ? '/alumni/jobs' : '/student/jobs'
        console.log('Fixed job link from /jobs to:', targetLink)
      } else if (notification.type === 'event' && notification.link === '/events') {
        targetLink = userType === 'alumni' ? '/alumni/events' : '/student/events'
        console.log('Fixed event link from /events to:', targetLink)
      } else if ((notification.type === 'like' || notification.type === 'comment') && notification.link?.startsWith('/posts/')) {
        targetLink = userType === 'alumni' ? '/alumni' : '/student'
        console.log('Fixed post link from', notification.link, 'to:', targetLink)
      }
      
      console.log('Final target link:', targetLink)
      
      // For post notifications, store the postId in sessionStorage for scrolling after navigation
      if ((notification.type === 'like' || notification.type === 'comment') && targetLink.includes('postId=')) {
        const urlParams = new URLSearchParams(targetLink.split('?')[1])
        const postId = urlParams.get('postId')
        if (postId) {
          sessionStorage.setItem('scrollToPostId', postId)
        }
      }
      
      router.push(targetLink)
    } else {
      console.log('No link provided for notification:', notification)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {notification.message}
                    </p>
                    {notification.userFirstName && (
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs bg-gray-200">
                            {notification.userFirstName[0]}{notification.userLastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
                          {notification.userFirstName} {notification.userLastName}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
