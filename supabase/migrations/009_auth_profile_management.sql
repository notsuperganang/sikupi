-- Migration: Auth Profile Management System (Option B)
-- Description: Manual profile creation and notification system enhancements
-- Version: 009
-- Date: 2025-08-27

-- Function to handle new user registration (called manually in registration API)
CREATE OR REPLACE FUNCTION public.handle_new_user(p_user_id UUID, p_email TEXT DEFAULT NULL, p_full_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = p_user_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE LOG 'Profile already exists for user: %', p_user_id;
    RETURN FALSE;
  END IF;
  
  -- Insert new profile for the user with default buyer role
  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    p_user_id,
    COALESCE(p_full_name, 'New User'),
    'buyer',
    NOW(),
    NOW()
  );
  
  -- Log the profile creation
  RAISE LOG 'Profile created for user: % (%)', p_user_id, COALESCE(p_email, 'unknown email');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync/backfill missing profiles for existing users
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  action TEXT,
  status TEXT
) AS $$
DECLARE
  auth_user RECORD;
  profile_exists BOOLEAN;
  profiles_created INTEGER := 0;
  profiles_skipped INTEGER := 0;
BEGIN
  -- Loop through all auth users
  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
    FROM auth.users au
    ORDER BY au.created_at DESC
  LOOP
    -- Check if profile exists
    SELECT EXISTS(
      SELECT 1 FROM public.profiles p WHERE p.id = auth_user.id
    ) INTO profile_exists;
    
    IF NOT profile_exists THEN
      -- Create missing profile
      BEGIN
        INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
        VALUES (
          auth_user.id,
          COALESCE(auth_user.raw_user_meta_data->>'full_name', 'Imported User'),
          'buyer', -- Default role for backfilled profiles
          auth_user.created_at,
          NOW()
        );
        
        profiles_created := profiles_created + 1;
        
        -- Return result row
        user_id := auth_user.id;
        email := auth_user.email;
        action := 'created';
        status := 'success';
        RETURN NEXT;
        
      EXCEPTION WHEN OTHERS THEN
        -- Handle any insertion errors
        user_id := auth_user.id;
        email := auth_user.email;
        action := 'create_failed';
        status := SQLERRM;
        RETURN NEXT;
      END;
    ELSE
      -- Profile already exists
      profiles_skipped := profiles_skipped + 1;
      
      user_id := auth_user.id;
      email := auth_user.email;
      action := 'skipped';
      status := 'profile_exists';
      RETURN NEXT;
    END IF;
  END LOOP;
  
  -- Log summary
  RAISE LOG 'Profile sync completed: % created, % skipped', profiles_created, profiles_skipped;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate user has valid profile for notifications
CREATE OR REPLACE FUNCTION public.validate_user_for_notifications(p_user_id UUID)
RETURNS TABLE(
  valid BOOLEAN,
  user_exists BOOLEAN,
  profile_exists BOOLEAN,
  has_role BOOLEAN,
  role TEXT,
  error_message TEXT
) AS $$
DECLARE
  auth_user_exists BOOLEAN := FALSE;
  profile_record RECORD;
BEGIN
  -- Check if user exists in auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = p_user_id
  ) INTO auth_user_exists;
  
  IF NOT auth_user_exists THEN
    valid := FALSE;
    user_exists := FALSE;
    profile_exists := FALSE;
    has_role := FALSE;
    role := NULL;
    error_message := 'User does not exist in auth system';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Check profile and role
  SELECT p.id, p.role 
  INTO profile_record
  FROM public.profiles p 
  WHERE p.id = p_user_id;
  
  IF profile_record IS NULL THEN
    valid := FALSE;
    user_exists := TRUE;
    profile_exists := FALSE;
    has_role := FALSE;
    role := NULL;
    error_message := 'User has no profile - notifications disabled';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- User and profile are valid
  valid := TRUE;
  user_exists := TRUE;
  profile_exists := TRUE;
  has_role := TRUE;
  role := profile_record.role;
  error_message := NULL;
  RETURN NEXT;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced create_notification function with user validation
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS INTEGER AS $$
DECLARE
  notification_id INTEGER;
  user_validation RECORD;
BEGIN
  -- Validate user first
  SELECT * INTO user_validation
  FROM public.validate_user_for_notifications(p_user_id);
  
  IF NOT user_validation.valid THEN
    RAISE WARNING 'Notification creation failed for user %: %', p_user_id, user_validation.error_message;
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RAISE LOG 'Notification % created for user % (role: %)', notification_id, p_user_id, user_validation.role;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute backfill for existing users
DO $$
DECLARE
  sync_result RECORD;
  total_processed INTEGER := 0;
  total_created INTEGER := 0;
BEGIN
  RAISE LOG 'Starting profile backfill process...';
  
  -- Run the sync function
  FOR sync_result IN 
    SELECT * FROM public.sync_missing_profiles()
  LOOP
    total_processed := total_processed + 1;
    
    IF sync_result.action = 'created' THEN
      total_created := total_created + 1;
      RAISE LOG 'Created profile for: % (%)', sync_result.email, sync_result.user_id;
    ELSIF sync_result.action = 'create_failed' THEN
      RAISE WARNING 'Failed to create profile for % (%): %', sync_result.email, sync_result.user_id, sync_result.status;
    END IF;
  END LOOP;
  
  RAISE LOG 'Profile backfill completed: % users processed, % profiles created', total_processed, total_created;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_missing_profiles() TO service_role;  
GRANT EXECUTE ON FUNCTION public.validate_user_for_notifications(UUID) TO service_role;

-- Comments for documentation
COMMENT ON FUNCTION public.handle_new_user(UUID, TEXT, TEXT) IS 'Creates a profile for a new user - call this in registration API';
COMMENT ON FUNCTION public.sync_missing_profiles() IS 'Backfills missing profiles for existing auth users';
COMMENT ON FUNCTION public.validate_user_for_notifications(UUID) IS 'Validates user has valid profile for notification system';

-- Instructions for Option B implementation:
-- 1. Run this migration
-- 2. Update registration API endpoints to call handle_new_user()
-- 3. Example usage in registration:
--    const { data } = await supabase.rpc('handle_new_user', {
--      p_user_id: user.id,
--      p_email: user.email,
--      p_full_name: userData.full_name
--    })