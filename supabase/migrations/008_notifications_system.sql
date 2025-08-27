-- Migration: Notification System
-- Description: Adds comprehensive notification system with real-time capabilities
-- Version: 008
-- Date: 2025-08-27

-- Create notification types enum
CREATE TYPE "notification_type" AS ENUM (
  'order_update',
  'payment_confirmed', 
  'shipment_ready',
  'ai_analysis',
  'admin_alert',
  'system_message'
);

-- Create notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY notifications_select_own 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only update (mark as read) their own notifications
CREATE POLICY notifications_update_own 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Only authenticated users with admin role can insert notifications
CREATE POLICY notifications_insert_admin 
  ON notifications FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can read all notifications (for system monitoring)
CREATE POLICY notifications_admin_read_all 
  ON notifications FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Function to create notification (server-side use)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS INTEGER AS $$
DECLARE
  notification_id INTEGER;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET read = TRUE, updated_at = NOW()
  WHERE id = notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications 
  SET read = TRUE, updated_at = NOW()
  WHERE user_id = auth.uid() AND read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications 
    WHERE user_id = auth.uid() AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notification templates for common scenarios
CREATE TABLE notification_templates (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  type notification_type NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common notification templates
INSERT INTO notification_templates (key, type, title_template, message_template) VALUES
('order_created', 'order_update', 'Pesanan Baru #{order_id}', 'Pesanan Anda telah berhasil dibuat. Total: Rp {total}'),
('payment_confirmed', 'payment_confirmed', 'Pembayaran Berhasil! ✅', 'Pembayaran untuk pesanan #{order_id} telah dikonfirmasi. Pesanan akan segera diproses.'),
('order_packed', 'order_update', 'Pesanan Dikemas 📦', 'Pesanan #{order_id} sudah dikemas dan siap dikirim.'),
('order_shipped', 'shipment_ready', 'Paket Dikirim 🚚', 'Pesanan #{order_id} telah dikirim via {courier}. Nomor resi: {tracking_number}'),
('order_completed', 'order_update', 'Pesanan Selesai 🎉', 'Pesanan #{order_id} telah selesai. Terima kasih sudah berbelanja di Sikupi!'),
('ai_analysis_complete', 'ai_analysis', 'Analisis AI Selesai 🤖', 'Hasil analisis ampas kopi Anda sudah siap. Sikupi Score: {score}/100'),
('admin_new_order', 'admin_alert', 'Pesanan Baru Masuk', '{customer_name} membuat pesanan #{order_id} - Total: Rp {total}'),
('admin_low_stock', 'admin_alert', 'Stok Menipis ⚠️', 'Produk {product_name} tersisa {stock} unit');

COMMENT ON TABLE notifications IS 'User notifications for real-time updates';
COMMENT ON TABLE notification_templates IS 'Reusable notification templates with placeholders';

-- Grant necessary permissions for service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;