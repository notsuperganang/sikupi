'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, X, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  data: Record<string, any>
  read: boolean
  created_at: string
  relative_time: string
  icon: string
  action?: {
    label: string
    href: string
  }
}

interface NotificationDropdownProps {
  onClose: () => void
  className?: string
}

export function NotificationDropdown({ onClose, className = '' }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('supabase.auth.token') // Adjust based on your auth implementation
      
      const response = await fetch('/api/notifications?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const result = await response.json()
      if (result.success) {
        setNotifications(result.data.notifications)
      } else {
        throw new Error(result.error)
      }

    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('supabase.auth.token')
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        )
      }

    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('supabase.auth.token')
      
      const response = await fetch('/api/notifications/unread-count', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Update all notifications as read
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        )
      }

    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  return (
    <Card className={`w-96 max-h-96 shadow-lg border ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <div className="flex items-center gap-1">
            {notifications.filter(n => !n.read).length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-sm text-red-600">
            {error}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchNotifications}
              className="ml-2"
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div 
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {notification.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {notification.relative_time}
                        </span>
                        
                        {notification.action && (
                          <Link href={notification.action.href}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={onClose}
                            >
                              {notification.action.label}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < notifications.length - 1 && <div className="border-b" />}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <div className="border-t" />
            <div className="p-3">
              <Link href="/notifications">
                <Button 
                  variant="ghost" 
                  className="w-full text-sm"
                  onClick={onClose}
                >
                  View all notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}