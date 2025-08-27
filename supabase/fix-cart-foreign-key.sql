-- Fix cart_items foreign key to reference profiles instead of auth.users
-- This makes the data model more consistent and aligned with your app architecture

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;

-- Step 2: Add new foreign key constraint to reference profiles table
ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verify the change
\d cart_items;