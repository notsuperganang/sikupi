import { ShineBorder } from '@/components/magicui/shine-border'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md">
        <div className={cn("relative rounded-xl bg-background border", className)}>
          <ShineBorder 
            borderWidth={3}
            duration={12}
            shineColor={["#D2B48C", "#CD853F", "#A0522D"]}
            className="rounded-xl"
          />
          <div className="relative p-8">
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}