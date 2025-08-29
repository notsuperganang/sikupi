// TanStack Query cart hook with optimistic updates
'use client'

import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useDebouncedCallback } from '@/hooks/useDebounce'
import { supabase } from '@/lib/supabase'
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

// Guest cart item type
interface GuestCartItem {
  productId: number
  quantity: number
  addedAt: number
}

export function useCart() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  // Guest cart localStorage
  const [guestCart, setGuestCart] = useLocalStorage<GuestCartItem[]>('sikupi:cart', [])
  
  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getCurrentUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  // Query key for cart data
  const queryKey = ['cart', user?.id || 'guest']

  // Cart query
  const cartQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<Cart> => {
      if (!user) {
        // For guest users, calculate cart from localStorage
        const cartAdapter = await importCartAdapter()
        return cartAdapter.getActiveCart()
      } else {
        const cartAdapter = await importCartAdapter()
        return cartAdapter.getActiveCart(user.id)
      }
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
        // Guest cart: add to localStorage
        setGuestCart(prev => {
          const existing = prev.find(item => item.productId === productId)
          if (existing) {
            return prev.map(item =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          } else {
            return [...prev, { productId, quantity, addedAt: Date.now() }]
          }
        })
        return
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
      toast.error('Gagal menambahkan ke keranjang')
      console.error('Add to cart error:', err)
    },
    onSuccess: () => {
      // Refetch to get real data
      queryClient.invalidateQueries({ queryKey })
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
        // For guest cart, remove from localStorage by productId
        setGuestCart(prev => prev.filter(item => item.productId !== itemId))
        return
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
        setGuestCart([])
        return
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

  // Merge guest cart on login
  const mergeOnLogin = useCallback(async () => {
    if (!user || guestCart.length === 0) return

    try {
      const cartAdapter = await importCartAdapter()
      const result = await cartAdapter.mergeGuestCart({
        userId: user.id,
        guestItems: guestCart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      })

      // Clear guest cart after successful merge
      if (result.success > 0) {
        setGuestCart([])
        queryClient.invalidateQueries({ queryKey })
        toast.success(`${result.success} item berhasil dipindahkan ke keranjang`)
      }

      if (result.failed > 0) {
        toast.warning(`${result.failed} item gagal dipindahkan`)
      }
    } catch (error) {
      console.error('Failed to merge guest cart:', error)
      toast.error('Gagal memindahkan keranjang')
    }
  }, [user, guestCart, queryClient, queryKey, setGuestCart])

  // Auto-merge guest cart when user logs in
  React.useEffect(() => {
    if (user && guestCart.length > 0) {
      mergeOnLogin()
    }
  }, [user, guestCart.length, mergeOnLogin])


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
    
    // Login integration
    mergeOnLogin,
    
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