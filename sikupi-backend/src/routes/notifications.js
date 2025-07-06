const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validateParams, schemas } = require('../middleware/validation');

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unread_only = false } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unread_only === 'true') {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Notifications fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch notifications',
        message: 'Could not retrieve notifications'
      });
    }

    // Get total count
    let countQuery = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (unread_only === 'true') {
      countQuery = countQuery.eq('is_read', false);
    }

    const { count } = await countQuery;

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      },
      unread_count: unreadCount || 0
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching notifications'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('id, is_read')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'The requested notification does not exist'
      });
    }

    if (notification.is_read) {
      return res.json({
        message: 'Notification already marked as read',
        notification
      });
    }

    // Mark as read
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Notification update error:', updateError);
      return res.status(500).json({
        error: 'Update failed',
        message: 'Could not mark notification as read'
      });
    }

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while updating notification'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all read error:', error);
      return res.status(500).json({
        error: 'Update failed',
        message: 'Could not mark all notifications as read'
      });
    }

    res.json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while marking all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'The requested notification does not exist'
      });
    }

    // Delete notification
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Notification delete error:', deleteError);
      return res.status(500).json({
        error: 'Delete failed',
        message: 'Could not delete notification'
      });
    }

    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Notification delete error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while deleting notification'
    });
  }
});

// Get notification count
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    res.json({
      total: totalCount || 0,
      unread: unreadCount || 0
    });
  } catch (error) {
    console.error('Notification count error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while getting notification count'
    });
  }
});

module.exports = router;