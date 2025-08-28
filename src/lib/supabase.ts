import { createClient } from '@supabase/supabase-js'
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

// Client-side Supabase instance (uses anon key, respects RLS)
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

// Get service role key (only available server-side)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only warn if we're running on the server-side (Node.js environment)
if (!supabaseServiceRoleKey && typeof window === 'undefined') {
  console.warn('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY - Admin functions will not work')
}

// Server-side Supabase instance (uses service role key, bypasses RLS)
// Note: On client-side, this will use anon key, which is fine for non-admin operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey, // Fallback to anon key on client-side
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Auth helpers
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
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
    throw error
  }
  return data
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