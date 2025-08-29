// Basic Sheet component for cart drawer
'use client'

import React from 'react'
import { Button } from './button'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 z-50 h-full w-full sm:max-w-sm border-l bg-white shadow-lg">
        {children}
      </div>
    </div>
  )
}

interface SheetContentProps {
  children: React.ReactNode
  onClose: () => void
}

export function SheetContent({ children, onClose }: SheetContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Keranjang</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="p-2 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

interface SheetTriggerProps {
  children: React.ReactNode
  onClick: () => void
}

export function SheetTrigger({ children, onClick }: SheetTriggerProps) {
  return (
    <button onClick={onClick} className="cursor-pointer">
      {children}
    </button>
  )
}