'use client'

import { supabase } from './supabase'

/**
 * Make authenticated API requests with automatic token handling
 */
export async function makeAuthenticatedRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`)
    }

    if (!session?.access_token) {
      throw new Error('No valid session found')
    }

    // Prepare headers with authentication
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    }

    console.log('🔐 Making authenticated request to:', url)

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return data
    
  } catch (error) {
    console.error('Authenticated request failed:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

/**
 * Fetch order details with authentication
 */
export async function fetchOrderDetails(orderId: string | number): Promise<any> {
  const data = await makeAuthenticatedRequest(`/api/orders/${orderId}`)
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch order details')
  }
  
  return data.data
}

/**
 * Fetch user orders with authentication
 */
export async function fetchUserOrders(params: URLSearchParams): Promise<any> {
  const data = await makeAuthenticatedRequest(
    `/api/orders?${params.toString()}`
  )
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch orders')
  }
  
  return data.data
}

/**
 * Check if user is authenticated and session is valid
 */
export async function checkAuthentication(): Promise<{
  isAuthenticated: boolean
  user: any | null
  error?: string
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return {
        isAuthenticated: false,
        user: null,
        error: error.message
      }
    }

    return {
      isAuthenticated: !!session?.user,
      user: session?.user || null
    }
    
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}