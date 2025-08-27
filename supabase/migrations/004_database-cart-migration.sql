-- Database cart table migration
-- This replaces the in-memory CartStorage with persistent database storage

-- Create cart_items table
CREATE TABLE cart_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one cart item per user-product combination
  UNIQUE(user_id, product_id)
);

-- Add indexes for performance
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_created_at ON cart_items(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own cart items
CREATE POLICY "Users can manage their own cart items" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access" ON cart_items
  FOR ALL USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cart_items_updated_at 
  BEFORE UPDATE ON cart_items 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();

-- Optional: Add cart cleanup function for old abandoned carts
CREATE OR REPLACE FUNCTION cleanup_old_cart_items(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cart_items 
  WHERE updated_at < (NOW() - INTERVAL '1 day' * days_old);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a view for cart with product details
CREATE VIEW cart_with_products AS
SELECT 
  ci.id,
  ci.user_id,
  ci.product_id,
  ci.quantity,
  ci.created_at,
  ci.updated_at,
  p.title as product_title,
  p.price_idr,
  p.stock_qty,
  p.unit,
  p.coffee_type,
  p.grind_level,
  p.condition,
  p.image_urls,
  (ci.quantity * p.price_idr) as subtotal_idr
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE p.published = true;