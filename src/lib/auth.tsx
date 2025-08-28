'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: { full_name: string; phone: string }) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        // Profile not found - this is okay
        if (error.code === 'PGRST116') {
          return null
        }
        
        // 406 Not Acceptable or other temporary errors - retry a few times
        if ((error.message.includes('406') || error.message.includes('Not Acceptable')) && retryCount < 3) {
          console.log(`Profile fetch retry ${retryCount + 1} for user ${userId}`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          return fetchProfile(userId, retryCount + 1)
        }
        
        console.warn('Error fetching profile (non-critical):', error)
        return null
      }
      
      return data
    } catch (error) {
      console.warn('Error fetching profile (non-critical):', error)
      return null
    }
  }

  const createProfileForGoogleUser = async (user: User) => {
    try {
      // Extract name from Google user metadata
      const metadata = user.user_metadata || {}
      const fullName = metadata.full_name || 
                      (metadata.given_name && metadata.family_name ? 
                       `${metadata.given_name} ${metadata.family_name}` : 
                       metadata.name || 'Google User')

      let retryCount = 0
      const maxRetries = 2
      
      while (retryCount <= maxRetries) {
        try {
          const { data: profileCreated, error: profileError } = await (supabase as any).rpc('handle_new_user', {
            p_user_id: user.id,
            p_email: user.email,
            p_full_name: fullName
          })

          if (profileError) {
            if (retryCount < maxRetries) {
              console.warn(`Google user profile creation failed (attempt ${retryCount + 1}), retrying...`, profileError)
              retryCount++
              await new Promise(resolve => setTimeout(resolve, 1000))
              continue
            } else {
              console.error('Failed to create Google user profile after retries:', profileError)
              return false
            }
          } else if (profileCreated) {
            console.log('✅ Profile created successfully for Google user:', user.email)
            return true
          } else {
            console.log('ℹ️ Profile already exists for Google user:', user.email)
            return true
          }
        } catch (profileException) {
          if (retryCount < maxRetries) {
            console.warn(`Google profile creation exception (attempt ${retryCount + 1}), retrying...`, profileException)
            retryCount++
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          } else {
            console.error('Google profile creation exception after retries:', profileException)
            return false
          }
        }
      }
    } catch (error) {
      console.error('Error creating profile for Google user:', error)
      return false
    }
    return false
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          let profileData = await fetchProfile(session.user.id)
          
          // If profile doesn't exist and this is a Google user (or new sign up), create it
          if (!profileData && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            const user = session.user
            
            // Check if this is a Google OAuth user
            const isGoogleUser = user.app_metadata?.provider === 'google' || 
                                 user.user_metadata?.iss?.includes('accounts.google.com')
            
            if (isGoogleUser) {
              console.log('Creating profile for Google user...')
              const success = await createProfileForGoogleUser(user)
              if (success) {
                // Wait a bit for the database to sync, then fetch the profile
                await new Promise(resolve => setTimeout(resolve, 1500))
                profileData = await fetchProfile(user.id)
              }
            }
          }
          
          setProfile(profileData)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
  }

  const signUp = async (
    email: string, 
    password: string, 
    userData: { full_name: string; phone: string }
  ) => {
    // Step 1: Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone,
        }
      }
    })
    
    if (error) throw error

    // Step 2: Create profile if user was created successfully
    if (data.user) {
      let retryCount = 0
      const maxRetries = 2
      
      while (retryCount <= maxRetries) {
        try {
          const { data: profileCreated, error: profileError } = await (supabase as any).rpc('handle_new_user', {
            p_user_id: data.user.id,
            p_email: email,
            p_full_name: userData.full_name
          })

          if (profileError) {
            if (retryCount < maxRetries) {
              console.warn(`Profile creation failed (attempt ${retryCount + 1}), retrying...`, profileError)
              retryCount++
              await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
              continue
            } else {
              console.error('Failed to create user profile after retries:', profileError)
              // Don't throw error - user auth was successful, profile creation can be retried later
              console.warn('User registered but profile creation failed - profile can be created later')
            }
          } else if (profileCreated) {
            console.log('✅ Profile created successfully for user:', email)
          } else {
            console.log('ℹ️ Profile already exists for user:', email)
          }
          break // Success or final failure, exit retry loop
        } catch (profileException) {
          if (retryCount < maxRetries) {
            console.warn(`Profile creation exception (attempt ${retryCount + 1}), retrying...`, profileException)
            retryCount++
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          } else {
            console.error('Profile creation exception after retries:', profileException)
            break
          }
        }
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}