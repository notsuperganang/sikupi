'use client'

import { useState, useEffect, useRef } from 'react'
import { type Notification as NotificationData } from '@/lib/notifications'

interface NotificationEvent {
  type: 'connected' | 'new_notification' | 'unread_count'
  notification?: NotificationData & { icon?: string }
  count?: number
  message?: string
  timestamp: string
  user_id?: string
}

interface UseNotificationsReturn {
  notifications: NotificationData[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  error: string | null
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  refetch: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxReconnectAttempts = 5
  const reconnectAttemptRef = useRef(0)

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    }
    return null
  }

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch('/api/notifications?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unread_count)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch notifications')
      }
    } catch (err) {
      console.error('[Notifications] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }

  // Connect to SSE stream
  const connectToStream = () => {
    const token = getAuthToken()
    if (!token) {
      setError('Authentication required')
      setIsLoading(false)
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      // Pass token as query parameter since EventSource doesn't support custom headers
      const eventSource = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`)
      
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('[SSE] Connected to notification stream')
        setIsConnected(true)
        setError(null)
        reconnectAttemptRef.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const data: NotificationEvent = JSON.parse(event.data)
          console.log('[SSE] Received:', data)

          switch (data.type) {
            case 'connected':
              setIsConnected(true)
              setError(null)
              break

            case 'unread_count':
              if (typeof data.count === 'number') {
                setUnreadCount(data.count)
              }
              break

            case 'new_notification':
              if (data.notification) {
                setNotifications(prev => [data.notification!, ...prev])
                setUnreadCount(prev => prev + 1)
                
                // Show toast notification (optional)
                if (typeof window !== 'undefined' && 'Notification' in window) {
                  if (Notification.permission === 'granted') {
                    new Notification(data.notification.title, {
                      body: data.notification.message,
                      icon: '/icon-192x192.png',
                      tag: `notification-${data.notification.id}`
                    })
                  }
                }
              }
              break
          }
        } catch (err) {
          console.error('[SSE] Parse error:', err)
        }
      }

      eventSource.onerror = (event) => {
        console.error('[SSE] Connection error:', event)
        setIsConnected(false)
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptRef.current) * 1000 // 1s, 2s, 4s, 8s, 16s
          reconnectAttemptRef.current++
          
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToStream()
          }, delay)
        } else {
          setError('Connection failed after multiple attempts')
        }
      }

    } catch (err) {
      console.error('[SSE] Failed to create EventSource:', err)
      setError('Failed to connect to notification stream')
      setIsConnected(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (id: number) => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
        setUnreadCount(data.data.unread_count || Math.max(0, unreadCount - 1))
      }
    } catch (err) {
      console.error('[Notifications] Mark as read error:', err)
      throw err
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/notifications/unread-count', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('[Notifications] Mark all as read error:', err)
      throw err
    }
  }

  // Initialize
  useEffect(() => {
    fetchNotifications()
    connectToStream()

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
}
