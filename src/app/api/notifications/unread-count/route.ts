import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NotificationService } from '@/lib/notifications'

// Get unread notification count for badge
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

    // Get unread count
    const unreadCount = await NotificationService.getUnreadCount(user.id)

    return NextResponse.json({
      success: true,
      data: {
        unread_count: unreadCount,
        user_id: user.id
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Notifications] Unread count error:', error)
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    )
  }
}

// Mark all notifications as read
export async function PUT(request: NextRequest) {
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

    // Mark all as read
    const updatedCount = await NotificationService.markAllAsRead(user.id)

    return NextResponse.json({
      success: true,
      data: {
        updated_count: updatedCount,
        unread_count: 0,
        user_id: user.id
      },
      message: `Marked ${updatedCount} notifications as read`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Notifications] Mark all read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}