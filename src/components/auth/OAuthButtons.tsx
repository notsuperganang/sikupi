'use client'

import { GoogleLoginButton } from './GoogleLoginButton'
import { Separator } from '@/components/ui/separator'

interface OAuthButtonsProps {
  mode?: 'login' | 'signup'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function OAuthButtons({ mode = 'login', onSuccess, onError }: OAuthButtonsProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Atau lanjutkan dengan
          </span>
        </div>
      </div>

      <GoogleLoginButton 
        mode={mode} 
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  )
}