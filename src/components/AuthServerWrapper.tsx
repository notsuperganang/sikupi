import { AuthProvider } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'

interface AuthServerWrapperProps {
  children: React.ReactNode
}

export default async function AuthServerWrapper({ children }: AuthServerWrapperProps) {
  // Get the server session to pass to client AuthProvider
  const initialSession = await getServerSession()
  
  console.log('🏭 [AUTH_SERVER_WRAPPER] Server session:', {
    hasSession: !!initialSession,
    hasUser: !!initialSession?.user,
    userEmail: initialSession?.user?.email,
    userId: initialSession?.user?.id
  })

  return (
    <AuthProvider initialSession={initialSession}>
      {children}
    </AuthProvider>
  )
}