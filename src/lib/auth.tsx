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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
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
          const profileData = await fetchProfile(session.user.id)
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
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}