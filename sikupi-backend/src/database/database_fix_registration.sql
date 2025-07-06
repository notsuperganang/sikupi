-- Fix for User Registration RLS Policy Issue
-- Run this in Supabase SQL Editor to fix the registration error

-- Add missing INSERT policy for user registration
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;