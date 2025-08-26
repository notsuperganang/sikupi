import { createClient } from '@supabase/supabase-js'
import { Database, Profile } from '@/types/database'

// Client-side Supabase instance (uses anon key, respects RLS)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side Supabase instance (uses service role key, bypasses RLS)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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