import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { NotificationService, type NotificationType } from '@/lib/notifications'

// Request validation schemas
const GetNotificationsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  unread_only: z.boolean().default(false)
})

const CreateNotificationSchema = z.object({
  type: z.enum(['order_update', 'payment_confirmed', 'shipment_ready', 'ai_analysis', 'admin_alert', 'system_message']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: z.record(z.any()).optional(),
  template_key: z.string().optional()
})

// Get user notifications
export async function GET(request: NextRequest) {
  try {
    // Get user from Authorization header  
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      unread_only: searchParams.get('unread_only') === 'true'
    }

    const validatedParams = GetNotificationsSchema.parse(queryParams)

    // Get notifications using service
    const notifications = await NotificationService.getForUser(user.id, {
      limit: validatedParams.limit,
      offset: validatedParams.offset,
      unreadOnly: validatedParams.unread_only
    })

    // Get unread count for convenience
    const unreadCount = await NotificationService.getUnreadCount(user.id)

    // Format response
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      read: notification.read,
      created_at: notification.created_at,
      updated_at: notification.updated_at,
      // Add relative time for UI
      relative_time: getRelativeTime(notification.created_at),
      // Add notification icon based on type
      icon: getNotificationIcon(notification.type),
      // Add action button if applicable
      action: getNotificationAction(notification.type, notification.data)
    }))

    return NextResponse.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        unread_count: unreadCount,
        total_count: notifications.length,
        pagination: {
          limit: validatedParams.limit,
          offset: validatedParams.offset,
          has_more: notifications.length === validatedParams.limit
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Notifications API] GET error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// Create notification (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request)
    if (!adminAuth.user) {
      return NextResponse.json(
        { error: adminAuth.error || 'Admin authentication required' },
        { status: 401 }
      )
    }

    const user = adminAuth.user

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateNotificationSchema.parse(body)

    // Get target user ID from body (required for admin creation)
    const targetUserId = body.user_id
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Create notification
    const notificationId = await NotificationService.create({
      user_id: targetUserId,
      type: validatedData.type,
      title: validatedData.title,
      message: validatedData.message,
      data: validatedData.data,
      template_key: validatedData.template_key
    })

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: notificationId,
        user_id: targetUserId,
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Notifications API] POST error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// Helper functions
function getRelativeTime(timestamp: string): string {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffMs = now.getTime() - notificationTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  
  return notificationTime.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getNotificationIcon(type: NotificationType): string {
  const iconMap: Record<NotificationType, string> = {
    'order_update': '📦',
    'payment_confirmed': '💰',
    'shipment_ready': '🚚',
    'ai_analysis': '🤖',
    'admin_alert': '🔔',
    'system_message': '📢'
  }
  return iconMap[type] || '📄'
}

function getNotificationAction(type: NotificationType, data: any): { label: string; href: string } | null {
  switch (type) {
    case 'order_update':
    case 'payment_confirmed':
    case 'shipment_ready':
      if (data.order_id) {
        return {
          label: 'Lihat Pesanan',
          href: `/orders/${data.order_id}`
        }
      }
      break
    case 'ai_analysis':
      return {
        label: 'Lihat Hasil',
        href: '/ai/analyzer'
      }
    case 'admin_alert':
      if (data.order_id) {
        return {
          label: 'Kelola Pesanan',
          href: `/admin/orders/${data.order_id}`
        }
      }
      return {
        label: 'Dashboard Admin',
        href: '/admin'
      }
  }
  return null
}