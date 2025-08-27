-- Storage setup for magazine images
-- This needs to be applied AFTER creating the storage bucket manually

-- Step 1: Create bucket manually in Supabase Dashboard > Storage
-- Bucket name: magazine-images
-- Public: YES (enabled)

-- Step 2: Apply these storage policies (run this in SQL Editor after bucket creation)

-- Storage policies for magazine images
CREATE POLICY "Public can view magazine images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'magazine-images');

CREATE POLICY "Admins can upload magazine images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'magazine-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update magazine images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'magazine-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete magazine images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'magazine-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
