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
  signInWithGoogle: (returnTo?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  // Log every time useAuth is called with current state
  console.log('🔐 [USE_AUTH] Called with state:', {
    hasUser: !!context.user,
    userEmail: context.user?.email,
    loading: context.loading,
    hasProfile: !!context.profile,
    timestamp: new Date().toISOString()
  })
  
  return context
}

export function AuthProvider({ children, initialSession }: { children: React.ReactNode; initialSession?: Session | null }) {
  const [user, setUser] = useState<User | null>(initialSession?.user || null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(initialSession || null)
  const [loading, setLoading] = useState(!initialSession)

  console.log('🔐 [AUTH_PROVIDER] Initialized with loading:', loading)

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log(`🔍 [AUTH_PROVIDER] Fetching profile for user: ${userId} (attempt ${retryCount + 1})`)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        // Profile not found - this is okay for new users
        if (error.code === 'PGRST116') {
          console.log(`👤 [AUTH_PROVIDER] Profile not found for user: ${userId} (new user)`)
          return null
        }
        
        // 406 Not Acceptable or other temporary errors - retry with exponential backoff
        if ((error.message?.includes('406') || error.message?.includes('Not Acceptable')) && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
          console.warn(`⚠️  [AUTH_PROVIDER] 406 error, retrying in ${delay}ms (attempt ${retryCount + 1}/3):`, {
            userId,
            error: error.message,
            code: error.code
          })
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchProfile(userId, retryCount + 1)
        }
        
        console.error('🚨 [AUTH_PROVIDER] Profile fetch error (non-critical):', {
          userId,
          error: error.message,
          code: error.code,
          details: error.details,
          retryCount
        })
        return null
      }
      
      console.log(`✅ [AUTH_PROVIDER] Profile fetched successfully for user: ${userId}`)
      return data
    } catch (networkError) {
      console.error('🌐 [AUTH_PROVIDER] Network error fetching profile:', {
        userId,
        error: networkError,
        retryCount
      })
      
      // Retry network errors once
      if (retryCount < 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        return fetchProfile(userId, retryCount + 1)
      }
      
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
    console.log('🔐 [AUTH_PROVIDER] useEffect started - initial session:', !!initialSession)
    
    // If we have an initial session from server, use it and fetch profile
    if (initialSession?.user) {
      console.log('🔐 [AUTH_PROVIDER] Using server-provided initial session for user:', initialSession.user.id)
      fetchProfile(initialSession.user.id).then((profileData) => {
        console.log('🔐 [AUTH_PROVIDER] Profile fetched for initial session:', profileData)
        setProfile(profileData)
        setLoading(false)
      })
    } else {
      // Fallback: Get initial session from client
      console.log('🔐 [AUTH_PROVIDER] No initial session, fetching from client')
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('🔐 [AUTH_PROVIDER] Initial session fetched from client:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          userId: session?.user?.id
        })
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('🔐 [AUTH_PROVIDER] Fetching profile for user:', session.user.id)
          fetchProfile(session.user.id).then((profileData) => {
            console.log('🔐 [AUTH_PROVIDER] Profile fetched:', profileData)
            setProfile(profileData)
          })
        }
        
        console.log('🔐 [AUTH_PROVIDER] Setting loading to false')
        setLoading(false)
      })
    }

    // Listen for auth changes (but skip initial session if we have server session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [AUTH_PROVIDER] Auth state change:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
          hasInitialSession: !!initialSession,
          timestamp: new Date().toISOString()
        })
        
        // Skip initial session event if we already have server-provided session
        if (event === 'INITIAL_SESSION' && initialSession) {
          console.log('🔐 [AUTH_PROVIDER] Skipping INITIAL_SESSION event - using server session instead')
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('🔐 [AUTH_PROVIDER] Auth state change - fetching profile for user:', session.user.id)
          let profileData = await fetchProfile(session.user.id)
          
          // If profile doesn't exist and this is a Google user (or new sign up), create it
          if (!profileData && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            const user = session.user
            
            // Check if this is a Google OAuth user
            const isGoogleUser = user.app_metadata?.provider === 'google' || 
                                 user.user_metadata?.iss?.includes('accounts.google.com')
            
            if (isGoogleUser) {
              console.log('🔐 [AUTH_PROVIDER] Creating profile for Google user...')
              const success = await createProfileForGoogleUser(user)
              if (success) {
                // Wait a bit for the database to sync, then fetch the profile
                await new Promise(resolve => setTimeout(resolve, 1500))
                profileData = await fetchProfile(user.id)
              }
            }
          }
          
          console.log('🔐 [AUTH_PROVIDER] Auth state change - profile set:', profileData)
          setProfile(profileData)
        } else {
          console.log('🔐 [AUTH_PROVIDER] Auth state change - no user, clearing profile')
          setProfile(null)
        }
        
        console.log('🔐 [AUTH_PROVIDER] Auth state change - setting loading to false')
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [initialSession])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
  }

  const signInWithGoogle = async (returnTo?: string) => {
    // Include returnTo in the redirect URL itself
    let redirectUrl = `${window.location.origin}/auth/callback`
    if (returnTo) {
      redirectUrl += `?returnTo=${encodeURIComponent(returnTo)}`
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
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

  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('🔄 [AUTH_PROVIDER] Attempting to refresh token')
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession()
      
      if (error || !newSession) {
        console.error('❌ [AUTH_PROVIDER] Token refresh failed:', error)
        return false
      }
      
      console.log('✅ [AUTH_PROVIDER] Token refreshed successfully')
      setSession(newSession)
      return true
    } catch (error) {
      console.error('❌ [AUTH_PROVIDER] Token refresh error:', error)
      return false
    }
  }

  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // First attempt with current token
    let currentSession = session
    if (!currentSession?.access_token) {
      throw new Error('No active session')
    }

    // Build headers object, avoiding Content-Type for FormData
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${currentSession.access_token}`,
    }

    // Only add user headers and Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
      // Spread user headers for JSON requests
      Object.assign(headers, options.headers || {})
    } else {
      // For FormData, only add non-Content-Type headers
      const userHeaders = options.headers || {}
      Object.keys(userHeaders).forEach(key => {
        if (key.toLowerCase() !== 'content-type') {
          headers[key] = (userHeaders as any)[key]
        }
      })
    }

    try {
      console.log('🌐 [AUTH_PROVIDER] Making authenticated request to:', url)
      const response = await fetch(url, {
        ...options,
        headers
      })

      // If we get 401 Unauthorized, try to refresh the token and retry
      if (response.status === 401) {
        console.warn('🔄 [AUTH_PROVIDER] Got 401, attempting token refresh')
        const refreshed = await refreshToken()
        
        if (!refreshed) {
          throw new Error('Token refresh failed')
        }

        // Get the new session and retry the request
        const { data: { session: newSession } } = await supabase.auth.getSession()
        if (!newSession?.access_token) {
          throw new Error('No session after refresh')
        }

        console.log('🔄 [AUTH_PROVIDER] Retrying request with new token')
        // Build retry headers object, avoiding Content-Type for FormData
        const retryHeaders: Record<string, string> = {
          'Authorization': `Bearer ${newSession.access_token}`,
        }

        // Only add user headers and Content-Type for non-FormData requests
        if (!(options.body instanceof FormData)) {
          retryHeaders['Content-Type'] = 'application/json'
          // Spread user headers for JSON requests
          Object.assign(retryHeaders, options.headers || {})
        } else {
          // For FormData, only add non-Content-Type headers
          const userHeaders = options.headers || {}
          Object.keys(userHeaders).forEach(key => {
            if (key.toLowerCase() !== 'content-type') {
              retryHeaders[key] = (userHeaders as any)[key]
            }
          })
        }

        return fetch(url, {
          ...options,
          headers: retryHeaders
        })
      }

      return response
    } catch (error) {
      console.error('❌ [AUTH_PROVIDER] Authenticated fetch error:', error)
      throw error
    }
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
    refreshToken,
    authenticatedFetch,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}