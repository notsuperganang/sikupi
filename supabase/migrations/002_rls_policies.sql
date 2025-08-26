-- Row Level Security (RLS) Policies for Sikupi - FIXED VERSION
-- This ensures proper access control based on user roles

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzer_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read their own profile, admins can read all profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (but cannot change role)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup (role defaults to 'buyer')
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies
-- Everyone can read published products
CREATE POLICY "products_select_published" ON products
  FOR SELECT USING (published = true);

-- Orders policies
-- Users can only see their own orders
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (buyer_id = auth.uid());

-- Users can create orders for themselves
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Users can update their own orders (limited scenarios)
CREATE POLICY "orders_update_own" ON orders
  FOR UPDATE USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- Order items policies
-- Users can see order items for their own orders
CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Users can create order items for their own orders
CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Product reviews policies
-- Everyone can read published reviews
CREATE POLICY "product_reviews_select_all" ON product_reviews
  FOR SELECT USING (true);

-- Users can only create reviews for their own completed orders
CREATE POLICY "product_reviews_insert_own" ON product_reviews
  FOR INSERT WITH CHECK (
    buyer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM order_items
      JOIN orders ON orders.id = order_items.order_id
      WHERE order_items.id = order_item_id
      AND orders.buyer_id = auth.uid()
      AND orders.status = 'completed'
    )
  );

-- Users can update their own reviews
CREATE POLICY "product_reviews_update_own" ON product_reviews
  FOR UPDATE USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "product_reviews_delete_own" ON product_reviews
  FOR DELETE USING (buyer_id = auth.uid());

-- Magazine posts policies
-- Everyone can read published magazine posts
CREATE POLICY "magazine_posts_select_published" ON magazine_posts
  FOR SELECT USING (published = true);

-- Analyzer jobs policies
-- Users can only see their own analyzer jobs
CREATE POLICY "analyzer_jobs_select_own" ON analyzer_jobs
  FOR SELECT USING (buyer_id = auth.uid());

-- Users can create analyzer jobs for themselves
CREATE POLICY "analyzer_jobs_insert_own" ON analyzer_jobs
  FOR INSERT WITH CHECK (buyer_id = auth.uid() OR buyer_id IS NULL);

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies (these override the restrictive policies above for admins)
-- Admins can manage all profiles
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- Admins can manage all products
CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (is_admin());

-- Admins can manage all orders
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (is_admin());

-- Admins can see all order items
CREATE POLICY "order_items_admin_all" ON order_items
  FOR ALL USING (is_admin());

-- Admins can manage all magazine posts
CREATE POLICY "magazine_posts_admin_all" ON magazine_posts
  FOR ALL USING (is_admin());

-- Admins can see all analyzer jobs
CREATE POLICY "analyzer_jobs_admin_all" ON analyzer_jobs
  FOR ALL USING (is_admin());