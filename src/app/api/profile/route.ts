import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import type { Database, Profile } from '@/types/database'

// Helper function to get authenticated user
async function getAuthenticatedUser(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    // Get the authorization header
    const headersList = await headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { user: null, error: 'No valid authorization header' }
    }
    
    const token = authorization.replace('Bearer ', '')
    
    // Create Supabase client with the provided token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return { user: null, error: 'Invalid token' }
    }
    
    return { user }
    
  } catch (error) {
    console.error('Auth check error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

// Profile update validation schema
const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authResult.user.id)
      .single()
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      
      console.error('Profile query error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      )
    }
    
    // Format profile data - Type assertion for TypeScript
    const profileData = profile as Profile
    const formattedProfile = {
      id: profileData.id,
      full_name: profileData.full_name,
      phone: profileData.phone,
      role: profileData.role,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
    }
    
    return NextResponse.json({
      success: true,
      data: {
        profile: formattedProfile,
        user: {
          email: authResult.user.email,
          email_verified: authResult.user.email_confirmed_at ? true : false,
          last_sign_in: authResult.user.last_sign_in_at,
        }
      }
    })
    
  } catch (error) {
    console.error('Profile API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = UpdateProfileSchema.parse(body)
    
    // Check if there are any fields to update
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      )
    }
    
    // Update profile in database
    const { data: updatedProfile, error: updateError } = await (supabaseAdmin as any)
      .from('profiles')
      .update(validatedData)
      .eq('id', authResult.user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }
    
    // Format updated profile data
    const profileData = updatedProfile as Profile
    const formattedProfile = {
      id: profileData.id,
      full_name: profileData.full_name,
      phone: profileData.phone,
      role: profileData.role,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
    }
    
    return NextResponse.json({
      success: true,
      data: {
        profile: formattedProfile
      },
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Profile update API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid profile data', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}