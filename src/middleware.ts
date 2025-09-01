import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database, Profile } from '@/types/database'

export async function middleware(req: NextRequest) {
  
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
          // silent cookie access in production
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
  
  let sessionData = await supabase.auth.getSession()
  
  // If this is from OAuth and no session found, try again after a brief moment
  if (fromOAuth && !sessionData.data.session) {
    await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay
    sessionData = await supabase.auth.getSession()
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  

  // Admin routes protection (except admin login page)
  if (req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin/login') {
    if (!user) {
      // Redirect to admin login if not authenticated
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Check if user is admin
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !profile || (profile as any)?.role !== 'admin') {
      // Redirect to admin login if not admin (let them try to login)
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    
    // User is admin, allow access to admin routes
    return response
  }

  // Protected buyer routes
  const protectedBuyerRoutes = ['/orders', '/checkout']
  
  if (protectedBuyerRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    if (!user) {
      // Redirect to login with return URL for protected buyer routes
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('returnTo', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    } else {
  // authenticated, allow
    }
  }

  // Redirect authenticated admin users away from admin login page
  if (req.nextUrl.pathname === '/admin/login' && user) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile && (profile as any)?.role === 'admin') {
      // Redirect admin users to admin dashboard
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    // If not admin, allow access to admin login page (they'll get an error when they try to login)
  }

  // Redirect authenticated users away from regular auth pages  
  if ((req.nextUrl.pathname.startsWith('/auth') || req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')) && user) {
    // Check if this is coming from OAuth callback - allow a brief window for session establishment
    const fromOAuth = req.nextUrl.searchParams.get('fromOAuth')
    const isOAuthCallback = req.nextUrl.pathname.startsWith('/auth/callback')
    
    // Skip redirect if this is an OAuth callback route
    if (isOAuthCallback) {
      return response
    }
    
    // Check if user is admin - redirect to admin dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const defaultRedirect = profile && (profile as any)?.role === 'admin' ? '/admin' : '/'
    
    // For OAuth flows, add a small delay to ensure session is fully established
    if (fromOAuth) {
      // If coming from OAuth, ensure cookies are properly set before redirect
      const returnTo = req.nextUrl.searchParams.get('returnTo')
      const redirectUrl = returnTo && returnTo.startsWith('/') ? returnTo : defaultRedirect
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }
    
    // Check if there's a returnTo parameter to redirect back
    const returnTo = req.nextUrl.searchParams.get('returnTo')
    const redirectUrl = returnTo && returnTo.startsWith('/') ? returnTo : defaultRedirect
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

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