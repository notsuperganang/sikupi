// Cart mini button for header with count badge
'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'

interface CartMiniButtonProps {
  className?: string
}

export default function CartMiniButton({ className }: CartMiniButtonProps) {
  const { cart, openDrawer, isLoading } = useCart()
  
  const itemCount = cart?.totals?.itemCount || 0
  const hasItems = itemCount > 0

  return (
    <Button
      variant="outline"
      size="sm" 
      onClick={openDrawer}
      className={`relative ${className}`}
      disabled={isLoading}
      aria-label={`Keranjang ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
    >
      <ShoppingCart className="h-4 w-4" />
      {hasItems && (
        <Badge 
          variant="destructive"
          className="absolute -top-2 -right-2 min-w-[18px] h-5 text-xs px-1 py-0 bg-amber-600 hover:bg-amber-700 border-white"
          aria-live="polite"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
      <span className="sr-only">
        {hasItems ? `${itemCount} item dalam keranjang` : 'Keranjang kosong'}
      </span>
    </Button>
  )
}