// TanStack Query cart hook with optimistic updates
'use client'

import React from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebouncedCallback } from '@/hooks/useDebounce'
import { useAuth } from '@/lib/auth'
import type { 
  Cart, 
  CartItemWithProduct
} from '@/server/cart-adapter'

import { useToast } from '@/lib/toast-context'

// Import server functions dynamically to avoid SSR issues
const importCartAdapter = async () => {
  const module = await import('@/server/cart-adapter')
  return module
}


export function useCart() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  // Log cart initialization with auth state
  console.log('🛒 [USE_CART] Hook initialized with user:', {
    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    timestamp: new Date().toISOString()
  })

  // Query key for cart data - authenticated users only
  const queryKey = ['cart', user?.id]

  // Cart query - only for authenticated users
  const cartQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<Cart> => {
      console.log('🛒 [USE_CART] Cart query running with user:', {
        hasUser: !!user,
        userId: user?.id,
        timestamp: new Date().toISOString()
      })
      
      if (!user) {
        console.log('🛒 [USE_CART] No user from AuthProvider, returning empty cart')
        // Return empty cart for unauthenticated users
        return {
          items: [],
          totals: {
            itemCount: 0,
            subtotal: 0,
            shipping: 0,
            discount: 0,
            total: 0
          }
        }
      }
      
      console.log('🛒 [USE_CART] Fetching user cart for:', user.id)
      const cartAdapter = await importCartAdapter()
      const result = await cartAdapter.getActiveCart(user.id)
      console.log('🛒 [USE_CART] User cart result:', {
        itemCount: result.items.length,
        totalCount: result.totals.itemCount,
        subtotal: result.totals.subtotal,
        items: result.items.map(item => ({ id: item.id, product_id: item.product_id, quantity: item.quantity, title: item.product_title }))
      })
      return result
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Add item mutation with optimistic updates
  const addItemMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      quantity = 1
    }: { 
      productId: number
      quantity?: number
      productTitle?: string
      priceIdr?: number
    }) => {
      if (!user) {
        throw new Error('AUTH_REQUIRED')
      }

      const cartAdapter = await importCartAdapter()
      await cartAdapter.addItem({
        userId: user.id,
        productId,
        quantity
      })
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<Cart>(queryKey)

      // Optimistically update cart
  if (user && previousCart) {
        const existingItem = previousCart.items.find(item => item.product_id === variables.productId)
        
        let newItems: CartItemWithProduct[]
        const qty = variables.quantity || 1
        if (existingItem) {
          newItems = previousCart.items.map(item =>
            item.product_id === variables.productId
              ? { ...item, quantity: item.quantity + qty, subtotal_idr: (item.quantity + qty) * item.price_idr }
              : item
          )
        } else {
          // Create optimistic new item (will be replaced by real data on success)
          const newItem: CartItemWithProduct = {
            id: Date.now(), // Temporary ID
            user_id: user.id,
            product_id: variables.productId,
            quantity: qty,
            product_title: variables.productTitle || 'Loading...',
            price_idr: variables.priceIdr || 0,
            stock_qty: 999, // Temporary
            unit: 'kg',
            image_urls: null,
            subtotal_idr: (variables.priceIdr || 0) * qty,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          newItems = [...previousCart.items, newItem]
        }

        const priceCalc = variables.priceIdr || 0
        const newTotals = {
          ...previousCart.totals,
          itemCount: previousCart.totals.itemCount + qty,
          subtotal: previousCart.totals.subtotal + priceCalc * qty,
          total: previousCart.totals.total + priceCalc * qty
        }

        queryClient.setQueryData<Cart>(queryKey, {
          items: newItems,
          totals: newTotals
        })
      }

      return { previousCart }
    },
    onError: (err, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousCart) {
        queryClient.setQueryData(queryKey, context.previousCart)
      }
      if ((err as any)?.message === 'AUTH_REQUIRED') {
        toast.info('Masuk diperlukan', 'Silakan login untuk menambahkan ke keranjang')
      } else {
        toast.error('Gagal menambahkan ke keranjang')
        console.error('Add to cart error:', err)
      }
    },
    onSuccess: () => {
      console.log('🎉 [ADD_ITEM] Success callback triggered for user:', user?.id)
      // Refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] })
      console.log('🎉 [ADD_ITEM] Showing success toast')
      toast.success('Item berhasil ditambahkan ke keranjang')
    }
  })

  // Update quantity mutation with debouncing
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      if (!user) return

      const cartAdapter = await importCartAdapter()
      await cartAdapter.updateQuantity({
        userId: user.id,
        itemId,
        quantity
      })
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })
      const previousCart = queryClient.getQueryData<Cart>(queryKey)

      if (previousCart) {
        const newItems = previousCart.items.map(item =>
          item.id === variables.itemId
            ? { ...item, quantity: variables.quantity, subtotal_idr: variables.quantity * item.price_idr }
            : item
        ).filter(item => item.quantity > 0) // Remove items with 0 quantity

        const newTotals = {
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: newItems.reduce((sum, item) => sum + item.subtotal_idr, 0),
          shipping: previousCart.totals.shipping,
          discount: previousCart.totals.discount,
          total: newItems.reduce((sum, item) => sum + item.subtotal_idr, 0) + previousCart.totals.shipping - previousCart.totals.discount
        }

        queryClient.setQueryData<Cart>(queryKey, {
          items: newItems,
          totals: newTotals
        })
      }

      return { previousCart }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKey, context.previousCart)
      }
      toast.error('Gagal memperbarui jumlah item')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      if (!user) {
        throw new Error('AUTH_REQUIRED')
      }

      const cartAdapter = await importCartAdapter()
      await cartAdapter.removeItem({
        userId: user.id,
        itemId
      })
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousCart = queryClient.getQueryData<Cart>(queryKey)

      if (previousCart) {
        const newItems = previousCart.items.filter(item => item.id !== itemId)
        const newTotals = {
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: newItems.reduce((sum, item) => sum + item.subtotal_idr, 0),
          shipping: previousCart.totals.shipping,
          discount: previousCart.totals.discount,
          total: newItems.reduce((sum, item) => sum + item.subtotal_idr, 0) + previousCart.totals.shipping - previousCart.totals.discount
        }

        queryClient.setQueryData<Cart>(queryKey, {
          items: newItems,
          totals: newTotals
        })
      }

      return { previousCart }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKey, context.previousCart)
      }
      toast.error('Gagal menghapus item dari keranjang')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('Item berhasil dihapus')
    }
  })

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('AUTH_REQUIRED')
      }

      const cartAdapter = await importCartAdapter()
      await cartAdapter.clearCart(user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('Keranjang berhasil dikosongkan')
    },
    onError: () => {
      toast.error('Gagal mengosongkan keranjang')
    }
  })

  // Debounced update quantity
  const debouncedUpdateQuantity = useDebouncedCallback(
    ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      updateQuantityMutation.mutate({ itemId, quantity })
    },
    250,
    []
  )



  return {
    // Data
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    
    // Actions
    addItem: (params: Parameters<typeof addItemMutation.mutate>[0]) => addItemMutation.mutateAsync(params),
    // For callers needing explicit promise naming
    addItemAsync: (params: Parameters<typeof addItemMutation.mutate>[0]) => addItemMutation.mutateAsync(params),
    updateQuantity: debouncedUpdateQuantity,
    removeItem: (itemId: number) => removeItemMutation.mutate(itemId),
    clearCart: () => clearCartMutation.mutate(),
    
    // Mutation states
    isAdding: addItemMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
  }
}

// Helper to get quantity limits based on product category
export function getQuantityLimits(category: string) {
  return {
    min: 1,
    max: category === 'ampas_kopi' ? 50 : 1,
    step: category === 'ampas_kopi' ? 1 : 1
  }
}