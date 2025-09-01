-- Product Images Storage Setup
-- This needs to be applied AFTER creating the storage bucket manually

-- Step 1: Create bucket manually in Supabase Dashboard > Storage
-- Bucket name: product-images
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/*

-- Step 2: Apply these storage policies (run this in SQL Editor after bucket creation)

-- Allow public read access to product images
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  (
    SELECT role FROM profiles 
    WHERE id = auth.uid()
  ) = 'admin'
);

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE
WITH CHECK (
  bucket_id = 'product-images' AND
  (
    SELECT role FROM profiles 
    WHERE id = auth.uid()
  ) = 'admin'
);

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' AND
  (
    SELECT role FROM profiles 
    WHERE id = auth.uid()
  ) = 'admin'
);

-- Note: After creating the bucket and applying policies,
-- you can upload product images to: /product-images/{product-id}/{filename}
-- Example: /product-images/123/coffee-grounds-main.jpg