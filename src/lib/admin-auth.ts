/**
 * Admin authentication middleware for secure admin endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export interface AdminAuthResult {
  user: any;
  profile: any;
  error?: string;
}

/**
 * Verify that the authenticated user has admin role
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  try {
    const headersList = await headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { user: null, profile: null, error: 'No valid authorization header' }
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
      return { user: null, profile: null, error: 'Invalid or expired token' }
    }
    
    // Check if user has admin role in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      return { user: null, profile: null, error: 'User profile not found' }
    }
    
    // Verify admin role
    if ((profile as any).role !== 'admin') {
      return { user: null, profile: null, error: 'Access denied. Admin role required.' }
    }
    
    return { 
      user, 
      profile: profile as any 
    }
    
  } catch (error) {
    console.error('Admin auth error:', error)
    return { user: null, profile: null, error: 'Authentication failed' }
  }
}

/**
 * Middleware wrapper for admin endpoints
 */
export function requireAdminAuth(handler: (request: NextRequest, adminAuth: AdminAuthResult, ...args: any[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: any[]) => {
    const adminAuth = await verifyAdminAuth(request)
    
    if (!adminAuth.user || adminAuth.error) {
      return NextResponse.json(
        { error: adminAuth.error || 'Admin access required' },
        { status: adminAuth.error === 'Access denied. Admin role required.' ? 403 : 401 }
      )
    }
    
    return handler(request, adminAuth, ...args)
  }
}

/**
 * Helper to get admin user info from request
 */
export async function getAdminUserInfo(request: NextRequest): Promise<{
  userId: string;
  userName: string;
  error?: string;
}> {
  const adminAuth = await verifyAdminAuth(request)
  
  if (!adminAuth.user || adminAuth.error) {
    return { userId: '', userName: '', error: adminAuth.error }
  }
  
  return {
    userId: adminAuth.user.id,
    userName: adminAuth.profile?.full_name || adminAuth.user.email || 'Admin User'
  }
}

/**
 * Response helper for admin endpoints
 */
export function adminResponse(data: any, status: number = 200) {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }, { status })
}

/**
 * Error response helper for admin endpoints
 */
export function adminErrorResponse(error: string, status: number = 400, details?: any) {
  return NextResponse.json({
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  }, { status })
}