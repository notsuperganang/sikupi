-- Add biteship_reference_id column to orders table
-- This stores the reference ID we generate for tracking Biteship webhooks

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS biteship_reference_id text;

COMMENT ON COLUMN orders.biteship_reference_id IS 'Reference ID for Biteship webhook tracking (format: SIKUPI-SHIP-{timestamp}-{random}-{order_id})';