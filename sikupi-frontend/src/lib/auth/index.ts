// FILE PATH: /sikupi-frontend/src/lib/auth/index.ts

// Export auth guards and utilities
export {
  AuthGuard,
  withAuth,
  usePermissions,
  useAuthRedirect,
  RequireRole,
  RequireVerification,
  GuestOnly,
} from './guards';

// Export middleware utilities
export {
  authMiddleware,
  isProtectedRoute,
  isPublicRoute,
} from './middleware';

// Export default auth guard
export { default } from './guards';