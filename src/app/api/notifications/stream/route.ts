import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NotificationService } from '@/lib/notifications'

// Server-Sent Events endpoint for real-time notifications
export async function GET(request: NextRequest) {
  // Get user from Authorization header OR token query parameter (for EventSource compatibility)
  let token: string | null = null
  
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else {
    // Check query parameter for EventSource requests
    const { searchParams } = new URL(request.url)
    token = searchParams.get('token')
  }

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Create SSE stream
  const encoder = new TextEncoder()
  let isConnected = true

  const stream = new ReadableStream({
    start(controller) {
      console.log(`[SSE] Client connected: ${user.id}`)

      // Send initial connection confirmation
      const initialData = {
        type: 'connected',
        message: 'Real-time notifications ready',
        timestamp: new Date().toISOString(),
        user_id: user.id
      }

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
      )

      // Send current unread count
      NotificationService.getUnreadCount(user.id).then(count => {
        if (isConnected) {
          const countData = {
            type: 'unread_count',
            count,
            timestamp: new Date().toISOString()
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(countData)}\n\n`)
          )
        }
      })

      // Set up periodic keepalive (every 30 seconds)
      const keepAliveInterval = setInterval(() => {
        if (isConnected) {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } else {
          clearInterval(keepAliveInterval)
        }
      }, 30000)

      // Set up notification polling (check for new notifications every 5 seconds)
      // In a production system, you'd use database triggers or Redis pub/sub
      let lastCheckTime = new Date()

      const pollInterval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(pollInterval)
          return
        }

        try {
          // Get notifications created since last check
          const { data: newNotifications, error } = await (supabaseAdmin as any)
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', lastCheckTime.toISOString())
            .order('created_at', { ascending: true })

          if (error) {
            console.error('[SSE] Polling error:', error)
            return
          }

          // Send each new notification
          if (newNotifications && newNotifications.length > 0) {
            for (const notification of newNotifications as any[]) {
              const eventData = {
                type: 'new_notification',
                notification: {
                  id: notification.id,
                  type: notification.type,
                  title: notification.title,
                  message: notification.message,
                  data: notification.data,
                  created_at: notification.created_at,
                  icon: getNotificationIcon(notification.type)
                },
                timestamp: new Date().toISOString()
              }

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`)
              )
            }

            // Update unread count
            const unreadCount = await NotificationService.getUnreadCount(user.id)
            const countData = {
              type: 'unread_count',
              count: unreadCount,
              timestamp: new Date().toISOString()
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(countData)}\n\n`)
            )

            lastCheckTime = new Date()
          }

        } catch (pollError) {
          console.error('[SSE] Polling error:', pollError)
        }
      }, 5000)

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected: ${user.id}`)
        isConnected = false
        clearInterval(keepAliveInterval)
        clearInterval(pollInterval)
        controller.close()
      })
    },

    cancel() {
      console.log(`[SSE] Stream cancelled for user: ${user.id}`)
      isConnected = false
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}

// Helper function to get notification icons
function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'order_update': '📦',
    'payment_confirmed': '💰',
    'shipment_ready': '🚚',
    'ai_analysis': '🤖',
    'admin_alert': '🔔',
    'system_message': '📢'
  }
  return iconMap[type] || '📄'
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}