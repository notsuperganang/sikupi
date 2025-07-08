import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/constants";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showBackButton?: boolean;
}

export function AuthLayout({ 
  children, 
  title, 
  description, 
  showBackButton = true 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={APP_CONFIG.LOGO_PATH}
              alt={APP_CONFIG.NAME}
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-primary">
              {APP_CONFIG.NAME}
            </span>
          </Link>

          {showBackButton && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kembali ke Beranda</span>
                <span className="sm:hidden">Kembali</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Card className="shadow-medium">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">
                  {title}
                </CardTitle>
                <CardDescription className="text-base">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {children}
              </CardContent>
            </Card>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <div className="flex justify-center space-x-4">
                <Link 
                  href="/bantuan" 
                  className="hover:text-primary transition-colors"
                >
                  Bantuan
                </Link>
                <Link 
                  href="/privasi" 
                  className="hover:text-primary transition-colors"
                >
                  Privasi
                </Link>
                <Link 
                  href="/syarat" 
                  className="hover:text-primary transition-colors"
                >
                  Syarat & Ketentuan
                </Link>
              </div>
              <div className="mt-2">
                © {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}