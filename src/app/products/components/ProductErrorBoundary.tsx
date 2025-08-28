'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

interface ProductErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ProductErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ProductErrorBoundaryClass extends React.Component<
  ProductErrorBoundaryProps,
  ProductErrorBoundaryState
> {
  constructor(props: ProductErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ProductErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProductErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error!} 
          retry={this.handleRetry} 
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Terjadi kesalahan
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Maaf, terjadi kesalahan saat memuat produk. Silakan coba lagi atau hubungi dukungan jika masalah berlanjut.
      </p>
      <div className="space-y-3">
        <Button onClick={retry} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </Button>
        <details className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
          <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            Detail kesalahan
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-left overflow-auto">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  )
}

// Query error fallback for TanStack Query errors
interface QueryErrorFallbackProps {
  error: Error
  retry: () => void
  isLoading?: boolean
  className?: string
}

export function QueryErrorFallback({ 
  error, 
  retry, 
  isLoading, 
  className 
}: QueryErrorFallbackProps) {
  const isNetworkError = error.message.includes('Failed to fetch') || 
    error.message.includes('NetworkError') ||
    error.message.includes('ERR_NETWORK')

  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 ${className || ''}`}>
      <Alert className="max-w-md mb-4">
        <AlertCircle className="w-4 h-4" />
        <div className="ml-2">
          <h4 className="font-medium">
            {isNetworkError ? 'Koneksi bermasalah' : 'Gagal memuat data'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isNetworkError 
              ? 'Periksa koneksi internet Anda dan coba lagi.'
              : 'Terjadi kesalahan saat memuat produk.'
            }
          </p>
        </div>
      </Alert>
      
      <Button 
        onClick={retry}
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Memuat...' : 'Coba Lagi'}
      </Button>
    </div>
  )
}

// Empty state when no products found
interface EmptyStateProps {
  title?: string
  description?: string
  showClearFilters?: boolean
  onClearFilters?: () => void
  className?: string
}

export function EmptyState({ 
  title = "Produk tidak ditemukan",
  description = "Coba ubah filter atau kata kunci pencarian Anda.",
  showClearFilters = false,
  onClearFilters,
  className 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}>
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-12 h-12 text-gray-400 dark:text-gray-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 7h.01M17 7h.01"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>
      
      {showClearFilters && onClearFilters && (
        <Button 
          onClick={onClearFilters}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Bersihkan Filter
        </Button>
      )}
    </div>
  )
}

// Loading more error (for infinite queries)
export function LoadMoreError({ 
  error, 
  retry, 
  isLoading 
}: { 
  error: Error; 
  retry: () => void; 
  isLoading: boolean 
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-sm text-red-600 dark:text-red-400">
        Gagal memuat produk selanjutnya
      </p>
      <Button 
        onClick={retry}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Memuat...' : 'Coba Lagi'}
      </Button>
    </div>
  )
}

export const ProductErrorBoundary = ProductErrorBoundaryClass