'use client'

import React from 'react'
import { CheckCircle, X, AlertCircle, AlertTriangle } from 'lucide-react'
import { Button } from './button'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastComponentProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  info: {
    icon: AlertCircle,
    className: 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

export function ToastComponent({ toast, onDismiss }: ToastComponentProps) {
  const variant = toastVariants[toast.type]
  const Icon = variant.icon

  React.useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.duration, toast.id, onDismiss])

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full ${variant.className}`}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      
      <div className="flex-1">
        <div className="font-medium">{toast.title}</div>
        {toast.message && (
          <div className="mt-1 text-sm opacity-90">{toast.message}</div>
        )}
        
        {toast.action && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={toast.action.onClick}
              className="text-xs"
            >
              {toast.action.label}
            </Button>
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDismiss(toast.id)}
        className="p-1 h-6 w-6 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}