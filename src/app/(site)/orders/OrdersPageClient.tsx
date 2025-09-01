'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast-context'
import { fetchUserOrders, makeAuthenticatedRequest } from '@/lib/api-client'
import OrderCard from './components/OrderCard'
import OrderFilters from './components/OrderFilters'
import OrderSummary from './components/OrderSummary'
import EmptyOrdersState from './components/EmptyOrdersState'
import type { OrderStatus } from '@/types/database'

interface OrdersPageState {
  currentPage: number
  statusFilter: OrderStatus | 'all'
  searchQuery: string
  sortBy: 'newest' | 'oldest' | 'amount_high' | 'amount_low'
}

export default function OrdersPageClient() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  const [state, setState] = useState<OrdersPageState>({
    currentPage: 1,
    statusFilter: 'all',
    searchQuery: '',
    sortBy: 'newest'
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info('Login diperlukan', 'Silakan login untuk melihat pesanan Anda')
      router.push('/login?returnTo=/orders')
    }
  }, [user, authLoading, router, toast])

  // Fetch orders data
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: [
      'user-orders', 
      state.currentPage, 
      state.statusFilter,
      state.searchQuery,
      state.sortBy
    ],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const params = new URLSearchParams({
        page: state.currentPage.toString(),
        limit: '10',
        ...(state.statusFilter !== 'all' && { status: state.statusFilter }),
        ...(state.searchQuery && { search: state.searchQuery })
      })

      return fetchUserOrders(params)
    },
    enabled: !!user && !authLoading,
    staleTime: 30000, // 30 seconds
    retry: 1
  })

  const handleStateUpdate = (updates: Partial<OrdersPageState>) => {
    setState(prev => ({ 
      ...prev, 
      ...updates,
      // Reset to page 1 when filtering or searching
      ...(updates.statusFilter || updates.searchQuery ? { currentPage: 1 } : {})
    }))
  }

  const handleRefresh = () => {
    refetchOrders()
    toast.success('Data diperbarui', 'Pesanan berhasil dimuat ulang')
  }

  const handleStatusRefresh = async (orderId: number) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/payments/midtrans/status?order_id=${orderId}`)
      
      if (response.success && response.data.updated) {
        toast.success(
          'Status diperbarui!', 
          `Pesanan #${orderId} status: ${response.data.status}`
        )
        // Refetch orders to show updated data
        refetchOrders()
      } else {
        toast.info('Status terkini', 'Status pesanan sudah up-to-date')
      }
    } catch (error) {
      console.error('Failed to refresh order status:', error)
      toast.error('Gagal memperbarui status', 'Silakan coba lagi')
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  const orders = ordersData?.orders || []
  const pagination = ordersData?.pagination
  const summary = ordersData?.summary

  return (
    <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
                <Package className="h-8 w-8 text-amber-600" />
                Pesanan Saya
              </h1>
              <p className="text-stone-600 mt-1">
                Kelola dan lacak semua pesanan Anda
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isOrdersLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isOrdersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Summary Stats */}
          {summary && (
            <OrderSummary 
              summary={summary}
              isLoading={isOrdersLoading}
            />
          )}
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <OrderFilters
            statusFilter={state.statusFilter}
            searchQuery={state.searchQuery}
            sortBy={state.sortBy}
            onStatusChange={(status) => handleStateUpdate({ statusFilter: status })}
            onSearchChange={(search) => handleStateUpdate({ searchQuery: search })}
            onSortChange={(sort) => handleStateUpdate({ sortBy: sort })}
            isLoading={isOrdersLoading}
          />
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {isOrdersLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="h-5 bg-stone-200 rounded w-32"></div>
                        <div className="h-4 bg-stone-200 rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-stone-200 rounded w-20"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-stone-200 rounded w-64"></div>
                      <div className="h-4 bg-stone-200 rounded w-48"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-stone-200 rounded w-32"></div>
                      <div className="h-9 bg-stone-200 rounded w-24"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : ordersError ? (
            // Error state
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Gagal Memuat Pesanan
              </h3>
              <p className="text-stone-600 mb-4">
                {ordersError instanceof Error ? ordersError.message : 'Terjadi kesalahan saat memuat pesanan'}
              </p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            </Card>
          ) : orders.length === 0 ? (
            // Empty state
            <EmptyOrdersState 
              statusFilter={state.statusFilter}
              searchQuery={state.searchQuery}
              onClearFilters={() => handleStateUpdate({ 
                statusFilter: 'all', 
                searchQuery: '',
                currentPage: 1 
              })}
            />
          ) : (
            // Orders list
            <>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    onStatusRefresh={handleStatusRefresh}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    disabled={!pagination.has_previous || isOrdersLoading}
                    onClick={() => handleStateUpdate({ currentPage: state.currentPage - 1 })}
                  >
                    Sebelumnya
                  </Button>
                  
                  <span className="text-stone-600">
                    Halaman {pagination.page} dari {pagination.total_pages}
                  </span>
                  
                  <Button
                    variant="outline"
                    disabled={!pagination.has_next || isOrdersLoading}
                    onClick={() => handleStateUpdate({ currentPage: state.currentPage + 1 })}
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}