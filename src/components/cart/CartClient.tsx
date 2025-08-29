// Client-side cart controller component
'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import CartDrawer from './CartDrawer'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

interface CartClientProps {
  children: React.ReactNode
}

export default function CartClient({ children }: CartClientProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <CartDrawer />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}