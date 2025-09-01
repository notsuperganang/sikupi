import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const returnTo = url.searchParams.get('returnTo')

  // Prepare provisional redirect path early
  let redirectPath = '/'
  if (returnTo && returnTo.startsWith('/')) redirectPath = returnTo

  if (!code) {
    // No code provided, redirect to home or returnTo
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  try {
    // Create the response object first so we can reference it in cookies
    const redirectUrl = new URL(redirectPath, request.url)
    redirectUrl.searchParams.set('fromOAuth', '1')
    const response = NextResponse.redirect(redirectUrl)

    // Create a server Supabase client that writes auth cookies to the response
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Set secure cookies with proper options
            const cookieOptions = {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
              path: '/'
            }
            response.cookies.set({ name, value, ...cookieOptions })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          }
        }
      }
    )

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth session exchange error:', error)
      return NextResponse.redirect(new URL('/login?error=oauth_callback_error', request.url))
    }

    // Ensure we have a valid session
    if (!data.session || !data.user) {
      console.error('OAuth callback: No session or user after exchange')
      return NextResponse.redirect(new URL('/login?error=oauth_session_invalid', request.url))
    }

    console.log('OAuth callback successful for user:', data.user.email)

    // The session cookies are already set by the Supabase client
    // Return the response with the redirect and fromOAuth flag
    return response
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.redirect(new URL('/login?error=oauth_callback_error', request.url))
  }
}