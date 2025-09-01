'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer, type Toast } from '@/components/ui/toast'
import { nanoid } from 'nanoid'

interface ToastContextType {
  toasts: Toast[]
  toast: {
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
  }
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = nanoid()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000 // Default 4 seconds
    }
    
    setToasts(prev => [newToast, ...prev])
    return id
  }, [])

  const toast = {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message, duration: 6000 }), // Longer for errors
    
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message, duration: 5000 }),
    
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message })
  }

  const value: ToastContextType = {
    toasts,
    toast,
    dismiss,
    dismissAll
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Alternative hook names for convenience
export const useToasts = useToast