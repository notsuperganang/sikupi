// Client-side cart controller component
'use client'

import React from 'react'
import CartDrawer from './CartDrawer'

interface CartClientProps {
  children: React.ReactNode
}

export default function CartClient({ children }: CartClientProps) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  )
}