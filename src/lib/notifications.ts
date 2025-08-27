import { supabaseAdmin } from '@/lib/supabase'

// Notification types matching database enum
export type NotificationType = 
  | 'order_update'
  | 'payment_confirmed' 
  | 'shipment_ready'
  | 'ai_analysis'
  | 'admin_alert'
  | 'system_message'

// Notification data structure
export interface Notification {
  id: number
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, any>
  read: boolean
  created_at: string
  updated_at: string
}

// Template data for different notification types
export interface NotificationData {
  order_id?: number
  total?: number
  customer_name?: string
  courier?: string
  tracking_number?: string
  score?: number
  product_name?: string
  stock?: number
  [key: string]: any
}

// Notification creation parameters
export interface CreateNotificationParams {
  user_id: string
  type: NotificationType
  title?: string
  message?: string
  template_key?: string
  data?: NotificationData
}

// Template rendering function
function renderTemplate(template: string, data: NotificationData): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = data[key]
    if (value !== undefined) {
      // Format numbers as Indonesian currency for totals
      if (key === 'total' && typeof value === 'number') {
        return `${value.toLocaleString('id-ID')}`
      }
      return String(value)
    }
    return match // Keep original if no replacement found
  })
}

// Notification service class
export class NotificationService {
  // Validate user has valid profile for notifications
  static async validateUser(userId: string): Promise<{
    valid: boolean
    user_exists: boolean
    profile_exists: boolean
    has_role: boolean
    role: string | null
    error_message: string | null
  }> {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .rpc('validate_user_for_notifications', { p_user_id: userId })

      if (error) {
        console.error('[Notifications] User validation error:', error)
        return {
          valid: false,
          user_exists: false,
          profile_exists: false,
          has_role: false,
          role: null,
          error_message: 'Validation function failed'
        }
      }

      return data[0] || {
        valid: false,
        user_exists: false,
        profile_exists: false,
        has_role: false,
        role: null,
        error_message: 'No validation result'
      }
    } catch (error) {
      console.error('[Notifications] User validation exception:', error)
      return {
        valid: false,
        user_exists: false,
        profile_exists: false,
        has_role: false,
        role: null,
        error_message: 'Exception during validation'
      }
    }
  }

  // Create a notification using a template
  static async createFromTemplate(
    templateKey: string, 
    userId: string, 
    data: NotificationData = {}
  ): Promise<number | null> {
    try {
      // Validate user first
      const validation = await this.validateUser(userId)
      if (!validation.valid) {
        console.warn(`[Notifications] Skipping notification for invalid user ${userId}: ${validation.error_message}`)
        return null
      }

      // Get template from database
      const { data: template, error: templateError } = await (supabaseAdmin as any)
        .from('notification_templates')
        .select('type, title_template, message_template')
        .eq('key', templateKey)
        .single()

      if (templateError || !template) {
        console.error('[Notifications] Template not found:', templateKey, templateError)
        return null
      }

      // Render template with data
      const title = renderTemplate(template.title_template, data)
      const message = renderTemplate(template.message_template, data)

      // Create notification
      return await this.create({
        user_id: userId,
        type: template.type,
        title,
        message,
        data
      })

    } catch (error) {
      console.error('[Notifications] Failed to create from template:', error)
      return null
    }
  }

  // Create a notification directly
  static async create(params: CreateNotificationParams): Promise<number | null> {
    try {
      // Use template if specified
      if (params.template_key && !params.title) {
        return await this.createFromTemplate(params.template_key, params.user_id, params.data)
      }

      // Validate user first (unless it's a direct creation with explicit override)
      const validation = await this.validateUser(params.user_id)
      if (!validation.valid) {
        console.warn(`[Notifications] Skipping direct notification for invalid user ${params.user_id}: ${validation.error_message}`)
        return null
      }

      // Direct creation using enhanced stored procedure
      const { data: result, error } = await (supabaseAdmin as any)
        .rpc('create_notification', {
          p_user_id: params.user_id,
          p_type: params.type,
          p_title: params.title || 'Notification',
          p_message: params.message || '',
          p_data: params.data || {}
        })

      if (error) {
        console.error('[Notifications] Failed to create:', error)
        return null
      }

      // Handle null result (user validation failed in stored procedure)
      if (result === null) {
        console.warn(`[Notifications] Notification creation returned null for user ${params.user_id} - likely profile issue`)
        return null
      }

      console.log(`[Notifications] Created notification ${result} for user ${params.user_id} (role: ${validation.role})`)
      
      // Trigger SSE update (handled by separate endpoint)
      this.triggerSSEUpdate(params.user_id)
      
      return result

    } catch (error) {
      console.error('[Notifications] Create error:', error)
      return null
    }
  }

  // Get notifications for a user
  static async getForUser(
    userId: string, 
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
    } = {}
  ): Promise<Notification[]> {
    try {
      let query = (supabaseAdmin as any)
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('read', false)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('[Notifications] Failed to fetch:', error)
        return []
      }

      return data || []

    } catch (error) {
      console.error('[Notifications] Fetch error:', error)
      return []
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .rpc('mark_notification_read', {
          notification_id: notificationId
        })

      if (error) {
        console.error('[Notifications] Failed to mark as read:', error)
        return false
      }

      return data || false

    } catch (error) {
      console.error('[Notifications] Mark read error:', error)
      return false
    }
  }

  // Get unread count for user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await (supabaseAdmin as any)
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('[Notifications] Failed to get unread count:', error)
        return 0
      }

      return count || 0

    } catch (error) {
      console.error('[Notifications] Unread count error:', error)
      return 0
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('[Notifications] Failed to mark all as read:', error)
        return 0
      }

      return data?.length || 0

    } catch (error) {
      console.error('[Notifications] Mark all read error:', error)
      return 0
    }
  }

  // Delete old notifications (cleanup)
  static async cleanup(): Promise<number> {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .rpc('cleanup_old_notifications')

      if (error) {
        console.error('[Notifications] Cleanup failed:', error)
        return 0
      }

      console.log(`[Notifications] Cleaned up ${data} old notifications`)
      return data || 0

    } catch (error) {
      console.error('[Notifications] Cleanup error:', error)
      return 0
    }
  }

  // Trigger SSE update for user (placeholder - implemented in SSE endpoint)
  private static async triggerSSEUpdate(userId: string): Promise<void> {
    // This will be implemented in the SSE endpoint
    // For now, just log
    console.log(`[Notifications] SSE trigger for user ${userId}`)
  }
}

// Convenience functions for common notification scenarios
export const NotificationHelpers = {
  // Order notifications
  orderCreated: (userId: string, orderId: number, total: number) =>
    NotificationService.createFromTemplate('order_created', userId, { order_id: orderId, total }),

  paymentConfirmed: (userId: string, orderId: number) =>
    NotificationService.createFromTemplate('payment_confirmed', userId, { order_id: orderId }),

  orderPacked: (userId: string, orderId: number) =>
    NotificationService.createFromTemplate('order_packed', userId, { order_id: orderId }),

  orderShipped: (userId: string, orderId: number, courier: string, trackingNumber: string) =>
    NotificationService.createFromTemplate('order_shipped', userId, { 
      order_id: orderId, 
      courier, 
      tracking_number: trackingNumber 
    }),

  orderCompleted: (userId: string, orderId: number) =>
    NotificationService.createFromTemplate('order_completed', userId, { order_id: orderId }),

  // AI notifications
  aiAnalysisComplete: (userId: string, score: number) =>
    NotificationService.createFromTemplate('ai_analysis_complete', userId, { score }),

  // Admin notifications  
  adminNewOrder: (adminUserId: string, orderId: number, customerName: string, total: number) =>
    NotificationService.createFromTemplate('admin_new_order', adminUserId, { 
      order_id: orderId, 
      customer_name: customerName, 
      total 
    }),

  adminLowStock: (adminUserId: string, productName: string, stock: number) =>
    NotificationService.createFromTemplate('admin_low_stock', adminUserId, { 
      product_name: productName, 
      stock 
    }),

  // Custom notification
  custom: (userId: string, type: NotificationType, title: string, message: string, data?: NotificationData) =>
    NotificationService.create({ user_id: userId, type, title, message, data })
}

export default NotificationService