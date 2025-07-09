// FILE: src/components/auth-initializer.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return <>{children}</>;
}
