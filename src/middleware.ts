import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database, Profile } from '@/types/database'

export async function middleware(req: NextRequest) {
  console.log('🛡️ [MIDDLEWARE] Request to:', req.nextUrl.pathname, 'from:', req.headers.get('referer'))
  
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = req.cookies.get(name)?.value
          if (name.includes('supabase') || name.includes('sb-')) {
            console.log('🛡️ [MIDDLEWARE] Cookie get:', name, value ? 'present' : 'missing')
          }
          return value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // For OAuth callbacks, try to get session multiple times to handle timing
  const fromOAuth = req.nextUrl.searchParams.get('fromOAuth')
  console.log('🛡️ [MIDDLEWARE] Getting session, fromOAuth:', fromOAuth)
  
  let sessionData = await supabase.auth.getSession()
  console.log('🛡️ [MIDDLEWARE] Initial session result:', {
    hasSession: !!sessionData.data.session,
    hasUser: !!sessionData.data.session?.user,
    userEmail: sessionData.data.session?.user?.email,
    error: sessionData.error
  })
  
  // If this is from OAuth and no session found, try again after a brief moment
  if (fromOAuth && !sessionData.data.session) {
    console.log('🛡️ [MIDDLEWARE] OAuth retry - waiting 100ms')
    await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay
    sessionData = await supabase.auth.getSession()
    console.log('🛡️ [MIDDLEWARE] OAuth retry session result:', {
      hasSession: !!sessionData.data.session,
      hasUser: !!sessionData.data.session?.user,
      userEmail: sessionData.data.session?.user?.email
    })
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  
  console.log('🛡️ [MIDDLEWARE] Final user result:', {
    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    userError,
    timestamp: new Date().toISOString()
  })

  // Admin routes protection
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if user is admin
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !profile || (profile as any)?.role !== 'admin') {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protected buyer routes
  const protectedBuyerRoutes = ['/orders', '/checkout']
  
  if (protectedBuyerRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    console.log('🛡️ [MIDDLEWARE] Checking protected route:', req.nextUrl.pathname)
    if (!user) {
      console.log('🛡️ [MIDDLEWARE] No user found, redirecting to login')
      // Redirect to login with return URL for protected buyer routes
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('returnTo', req.nextUrl.pathname)
      console.log('🛡️ [MIDDLEWARE] Redirecting to:', loginUrl.toString())
      return NextResponse.redirect(loginUrl)
    } else {
      console.log('🛡️ [MIDDLEWARE] User authenticated, allowing access to:', req.nextUrl.pathname)
      console.log('🛡️ [MIDDLEWARE] Proceeding with response - authenticated user access granted')
    }
  }

  // Redirect authenticated users away from auth pages  
  if ((req.nextUrl.pathname.startsWith('/auth') || req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')) && user) {
    // Check if this is coming from OAuth callback - allow a brief window for session establishment
    const fromOAuth = req.nextUrl.searchParams.get('fromOAuth')
    const isOAuthCallback = req.nextUrl.pathname.startsWith('/auth/callback')
    
    // Skip redirect if this is an OAuth callback route
    if (isOAuthCallback) {
      return response
    }
    
    // For OAuth flows, add a small delay to ensure session is fully established
    if (fromOAuth) {
      // If coming from OAuth, ensure cookies are properly set before redirect
      const returnTo = req.nextUrl.searchParams.get('returnTo')
      const redirectUrl = returnTo && returnTo.startsWith('/') ? returnTo : '/'
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }
    
    // Check if there's a returnTo parameter to redirect back
    const returnTo = req.nextUrl.searchParams.get('returnTo')
    const redirectUrl = returnTo && returnTo.startsWith('/') ? returnTo : '/'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  console.log('🛡️ [MIDDLEWARE] Final response for:', req.nextUrl.pathname, 'authenticated:', !!user)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}