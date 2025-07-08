// Export all auth utilities
export { AuthGuard, withAuth, usePermissions } from './guards';
export { authMiddleware, isProtectedRoute, isPublicRoute } from './middleware';
export { 
  useRequireAuth, 
  useRedirectIfAuthenticated, 
  useRequireRole, 
  useCanAccess,
  useAutoLogout
} from './hooks';