'use client'

import React, { createContext, useContext, useState } from 'react'

interface CartContextType {
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openDrawer = () => {
    console.log('📂 Global cart drawer opening...')
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    console.log('📂 Global cart drawer closing...')
    setIsDrawerOpen(false)
  }

  // Debug log drawer state changes
  React.useEffect(() => {
    console.log('📂 Global cart drawer state changed:', isDrawerOpen)
  }, [isDrawerOpen])

  const value: CartContextType = {
    isDrawerOpen,
    openDrawer,
    closeDrawer
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartDrawer(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartDrawer must be used within a CartProvider')
  }
  return context
}

export default CartProvider