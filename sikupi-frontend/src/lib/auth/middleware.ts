import { NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profil",
  "/pesanan",
  "/keranjang",
  "/checkout",
];

// Admin only routes
const adminRoutes = [
  "/admin",
];

// Seller only routes
const sellerRoutes = [
  "/dashboard/produk",
  "/dashboard/penjualan",
];

// Public routes that redirect to dashboard if user is authenticated
const publicRoutes = [
  "/masuk",
  "/daftar",
];

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies or headers
  const token = request.cookies.get("sikupi-auth")?.value;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isSellerRoute = sellerRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/masuk", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing public route with token, redirect to dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // TODO: Add role-based access control
  // This would require decoding the JWT token to get user role
  // For now, we'll handle role checks in the client-side guards

  return NextResponse.next();
}

// Utility function to check if a route requires authentication
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Utility function to check if a route is public (should redirect if authenticated)
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route));
}