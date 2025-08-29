// Server-side cart adapter using existing DatabaseCartStorage
import { DatabaseCartStorage } from '@/lib/cart-storage-db'

// Types for cart operations
export interface CartTotals {
  subtotal: number
  shipping: number
  discount: number
  total: number
  itemCount: number
}

export interface CartItemWithProduct {
  id: number
  user_id: string
  product_id: number
  quantity: number
  product_title: string
  price_idr: number
  stock_qty: number
  unit: string
  coffee_type?: string
  grind_level?: string
  condition?: string
  image_urls: string[] | null
  subtotal_idr: number
  created_at: string
  updated_at: string
}

export interface Cart {
  items: CartItemWithProduct[]
  totals: CartTotals
}

// Calculate cart totals from items
function calculateTotals(items: any[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal_idr || 0), 0)
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  
  // Mock calculations for shipping and discount
  const shipping = subtotal >= 200000 ? 0 : 15000 // Free shipping over 200k IDR
  const discount = 0 // Mock voucher discount
  const total = subtotal + shipping - discount

  return {
    subtotal,
    shipping,
    discount,
    total,
    itemCount
  }
}

// Get active cart for user (or empty cart for guests)
export async function getActiveCart(userId?: string): Promise<Cart> {
  if (!userId) {
    // Return empty cart for guests
    return {
      items: [],
      totals: {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      }
    }
  }

  try {
    const items = await DatabaseCartStorage.getCartItems(userId)
    const totals = calculateTotals(items)

    return {
      items: items as CartItemWithProduct[],
      totals
    }
  } catch (error) {
    console.error('Cart adapter error:', error)
    return {
      items: [],
      totals: {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      }
    }
  }
}

// Add item to cart
export async function addItem({
  userId,
  productId,
  quantity
}: {
  userId: string
  productId: number
  quantity: number
}): Promise<void> {
  const result = await DatabaseCartStorage.addItem(userId, productId, quantity)
  if (!result.success) {
    throw new Error(result.error || 'Failed to add item to cart')
  }
}

// Update item quantity by item ID
export async function updateQuantity({
  userId,
  itemId,
  quantity
}: {
  userId: string
  itemId: number
  quantity: number
}): Promise<void> {
  // Since DatabaseCartStorage uses productId, we need to find the product_id from item
  try {
    const cartItems = await DatabaseCartStorage.getCartItems(userId)
    const item = cartItems.find(i => i.id === itemId)
    
    if (!item) {
      throw new Error('Cart item not found')
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const result = await DatabaseCartStorage.removeItem(userId, item.product_id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove item')
      }
    } else {
      const result = await DatabaseCartStorage.updateItemQuantity(userId, item.product_id, quantity)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update item quantity')
      }
    }
  } catch (error) {
    console.error('Error updating cart item quantity:', error)
    throw error
  }
}

// Remove item from cart by item ID
export async function removeItem({
  userId,
  itemId
}: {
  userId: string
  itemId: number
}): Promise<void> {
  try {
    const cartItems = await DatabaseCartStorage.getCartItems(userId)
    const item = cartItems.find(i => i.id === itemId)
    
    if (!item) {
      throw new Error('Cart item not found')
    }

    const result = await DatabaseCartStorage.removeItem(userId, item.product_id)
    if (!result.success) {
      throw new Error(result.error || 'Failed to remove item from cart')
    }
  } catch (error) {
    console.error('Error removing cart item:', error)
    throw error
  }
}

// Clear entire cart for user
export async function clearCart(userId: string): Promise<void> {
  const result = await DatabaseCartStorage.clearCart(userId)
  if (!result.success) {
    throw new Error(result.error || 'Failed to clear cart')
  }
}

// Merge guest cart items into user cart (for login flow)
export async function mergeGuestCart({
  userId,
  guestItems
}: {
  userId: string
  guestItems: Array<{ productId: number; quantity: number }>
}): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const item of guestItems) {
    try {
      const result = await DatabaseCartStorage.addItem(userId, item.productId, item.quantity)
      if (result.success) {
        success++
      } else {
        failed++
      }
    } catch (error) {
      console.error('Failed to merge cart item:', item, error)
      failed++
    }
  }

  return { success, failed }
}

// Validate stock availability for cart items
export async function validateCartStock(userId: string): Promise<{
  valid: boolean
  issues: Array<{
    itemId: number
    productTitle: string
    requestedQty: number
    availableQty: number
  }>
}> {
  try {
    const validation = await DatabaseCartStorage.validateCart(userId)
    
    // Convert validation result to our format
    const issues = validation.issues
      .filter(issue => issue.issue.includes('stock'))
      .map(issue => {
        const match = issue.issue.match(/Available: (\d+), In cart: (\d+)/)
        return {
          itemId: issue.product_id,
          productTitle: issue.product_title,
          requestedQty: match ? parseInt(match[2]) : 0,
          availableQty: match ? parseInt(match[1]) : 0
        }
      })

    return {
      valid: issues.length === 0,
      issues
    }
  } catch (error) {
    console.error('Error validating cart stock:', error)
    throw new Error('Failed to validate cart stock')
  }
}