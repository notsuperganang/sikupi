import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { Database, Profile } from '@/types/database'

// Get environment variables with fallback for debugging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Client-side Supabase instance with proper SSR cookie handling
export const supabase = typeof window !== 'undefined' 
  ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>(supabaseUrl, supabaseAnonKey)

// Get service role key (only available server-side)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only warn if we're running on the server-side (Node.js environment)
if (!supabaseServiceRoleKey && typeof window === 'undefined') {
  console.warn('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY - Admin functions will not work')
}

// Server-side Supabase instance (service role) - never expose service role to browser bundle
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  // In the browser re-use the public client to avoid multiple GoTrue instances & leaking secrets
  : supabase

// Auth helpers
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getProfile = async (userId: string, retryCount = 0): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Profile not found, return null instead of throwing
        return null
      }
      
      // Handle 406 errors with retry logic
      if ((error.message?.includes('406') || error.message?.includes('Not Acceptable')) && retryCount < 3) {
        console.log(`🔄 [SUPABASE] Retrying profile fetch for user ${userId} (attempt ${retryCount + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)) // Exponential backoff
        return getProfile(userId, retryCount + 1)
      }
      
      console.error('🚨 [SUPABASE] Profile fetch error:', {
        userId,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // For production resilience, return null instead of throwing on 406 errors
      if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
        return null
      }
      
      throw error
    }
    
    return data
  } catch (networkError) {
    console.error('🌐 [SUPABASE] Network error fetching profile:', networkError)
    
    // Retry network errors up to 2 times
    if (retryCount < 2) {
      console.log(`🔄 [SUPABASE] Retrying profile fetch after network error (attempt ${retryCount + 1}/2)`)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
      return getProfile(userId, retryCount + 1)
    }
    
    return null // Return null to prevent app crashes
  }
}

export const requireAuth = async () => {
  const user = await getUser()
  if (!user) throw new Error('Authentication required')
  return user
}

export const requireAdmin = async () => {
  const user = await requireAuth()
  const profile = await getProfile(user.id)
  
  if (!profile || profile.role !== 'admin') {
    throw new Error('Admin access required')
  }
  
  return { user, profile }
}

// Utility function to test Supabase connection health
export const testSupabaseConnection = async (): Promise<{ healthy: boolean; message: string }> => {
  try {
    // Try a simple query that should always work
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      return {
        healthy: false,
        message: `Supabase query error: ${error.message} (Code: ${error.code})`
      }
    }
    
    return {
      healthy: true,
      message: 'Supabase connection is healthy'
    }
  } catch (error) {
    return {
      healthy: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Enhanced profile fetching with connection diagnostics
export const getProfileWithDiagnostics = async (userId: string) => {
  // First test the connection
  const healthCheck = await testSupabaseConnection()
  
  if (!healthCheck.healthy) {
    console.error('🩺 [SUPABASE] Connection health check failed:', healthCheck.message)
  } else {
    console.log('🩺 [SUPABASE] Connection health check passed')
  }
  
  // Then try to get the profile
  return getProfile(userId)
}