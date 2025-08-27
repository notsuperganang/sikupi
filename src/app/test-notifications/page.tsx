'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Loader2, Plus, Eye, EyeOff } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export default function NotificationTestPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [sseMessages, setSseMessages] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  const getAuthToken = () => {
    // In real implementation, this would come from your auth state
    return localStorage.getItem('auth_token') || 'your-auth-token-here'
  }

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unread_count)
      } else {
        setError(data.error || 'Failed to fetch notifications')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const createTestNotification = async () => {
    setLoading(true)
    setError('')
    
    try {
      const testNotifications = [
        {
          type: 'order_update',
          title: 'Pesanan Dikemas',
          message: 'Pesanan #456 sedang dikemas dan akan segera dikirim.',
          data: { order_id: 456, status: 'packaging' }
        },
        {
          type: 'ai_analysis',
          title: 'Analisis Selesai',
          message: 'Hasil analisis ampas kopi Robusta: Skor 92/100',
          data: { score: 92, product_name: 'Kopi Robusta' }
        },
        {
          type: 'payment_confirmed',
          title: 'Pembayaran Berhasil',
          message: 'Pembayaran sebesar Rp 250,000 telah dikonfirmasi.',
          data: { amount: 250000, order_id: 789 }
        }
      ]

      const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)]
      
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: 'test-user-id', // Replace with actual user ID
          ...randomNotification
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchNotifications() // Refresh list
      } else {
        setError(data.error || 'Failed to create notification')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchNotifications() // Refresh list
      }
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const connectToSSE = () => {
    if (eventSource) {
      eventSource.close()
    }

    setConnectionStatus('connecting')
    const token = getAuthToken()
    const newEventSource = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`)
    
    newEventSource.onopen = () => {
      setConnectionStatus('connected')
      setSseMessages(prev => [...prev, '🟢 Connected to notification stream'])
    }
    
    newEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setSseMessages(prev => [...prev, `📨 ${data.type}: ${JSON.stringify(data)}`])
      
      if (data.type === 'unread_count') {
        setUnreadCount(data.count)
      } else if (data.type === 'new_notification') {
        setNotifications(prev => [data.notification, ...prev])
        setUnreadCount(prev => prev + 1)
      }
    }
    
    newEventSource.onerror = () => {
      setConnectionStatus('disconnected')
      setSseMessages(prev => [...prev, '🔴 Connection error'])
    }
    
    setEventSource(newEventSource)
  }

  const disconnectSSE = () => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
      setConnectionStatus('disconnected')
      setSseMessages(prev => [...prev, '⚫ Disconnected from stream'])
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notification System Test</h1>
        <NotificationBell />
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={fetchNotifications} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Refresh Notifications
            </Button>
            <Button onClick={createTestNotification} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Create Test Notification
            </Button>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={connectToSSE} 
              disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
              variant="outline"
            >
              Connect to SSE
            </Button>
            <Button 
              onClick={disconnectSSE} 
              disabled={connectionStatus === 'disconnected'}
              variant="outline"
            >
              Disconnect SSE
            </Button>
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
              {connectionStatus}
            </Badge>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SSE Messages */}
      <Card>
        <CardHeader>
          <CardTitle>SSE Stream Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            {sseMessages.length === 0 ? (
              <p className="text-gray-500">No messages yet...</p>
            ) : (
              sseMessages.map((message, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {message}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications ({unreadCount} unread)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications found</p>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{notification.icon}</span>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <Badge variant={notification.read ? 'secondary' : 'default'}>
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    <div className="text-xs text-gray-500">
                      {notification.relative_time} • {new Date(notification.created_at).toLocaleString()}
                    </div>
                    {notification.data && Object.keys(notification.data).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer">Data</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(notification.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
