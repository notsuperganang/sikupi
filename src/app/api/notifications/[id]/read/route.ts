import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NotificationService } from '@/lib/notifications'

interface RouteParams {
  params: {
    id: string
  }
}

// Mark notification as read
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Parse notification ID
    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Verify notification belongs to user and mark as read
    const { data: notification, error: fetchError } = await (supabaseAdmin as any)
      .from('notifications')
      .select('id, user_id, read')
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Already read
    if ((notification as any).read) {
      return NextResponse.json({
        success: true,
        data: { id: notificationId, read: true },
        message: 'Notification already read',
        timestamp: new Date().toISOString()
      })
    }

    // Mark as read
    const { error: updateError } = await (supabaseAdmin as any)
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[Notifications] Failed to mark as read:', updateError)
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      )
    }

    // Get updated unread count
    const unreadCount = await NotificationService.getUnreadCount(user.id)

    return NextResponse.json({
      success: true,
      data: {
        id: notificationId,
        read: true,
        unread_count: unreadCount
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Notifications] Mark read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

// Delete notification
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Parse notification ID
    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Delete notification (RLS will ensure user owns it)
    const { error: deleteError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[Notifications] Failed to delete:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      )
    }

    // Get updated unread count
    const unreadCount = await NotificationService.getUnreadCount(user.id)

    return NextResponse.json({
      success: true,
      data: {
        id: notificationId,
        deleted: true,
        unread_count: unreadCount
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Notifications] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}