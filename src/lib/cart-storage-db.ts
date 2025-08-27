/**
 * Database-backed cart storage for production use
 * Replaces in-memory CartStorage with persistent Supabase storage
 */

import { supabaseAdmin } from '@/lib/supabase'
import type { Product } from '@/types/database'

interface CartItem {
  id: number
  user_id: string
  product_id: number
  quantity: number
  created_at: string
  updated_at: string
  product: Product
}

interface CartItemResponse {
  id: number
  user_id: string
  product_id: number
  quantity: number
  created_at: string
  updated_at: string
  product_title: string
  price_idr: number
  stock_qty: number
  unit: string
  coffee_type: string
  grind_level: string
  condition: string
  image_urls: string[] | null
  subtotal_idr: number
}

export class DatabaseCartStorage {
  /**
   * Add or update item in user's cart
   */
  static async addItem(userId: string, productId: number, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate product exists and get details
      const { data: product, error: productError } = await (supabaseAdmin as any)
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('published', true)
        .single()

      if (productError || !product) {
        return { success: false, error: 'Product not found or not available' }
      }

      // Check stock availability
      if ((product as any).stock_qty < quantity) {
        return { success: false, error: `Insufficient stock. Available: ${(product as any).stock_qty} ${(product as any).unit}` }
      }

      // Use upsert to add or update cart item
      const { error } = await (supabaseAdmin as any)
        .from('cart_items')
        .upsert({
          user_id: userId,
          product_id: productId,
          quantity: quantity
        }, {
          onConflict: 'user_id,product_id'
        })

      if (error) {
        console.error('Database cart add error:', error)
        return { success: false, error: 'Failed to add item to cart' }
      }

      return { success: true }
    } catch (error) {
      console.error('Cart addItem error:', error)
      return { success: false, error: 'Failed to add item to cart' }
    }
  }

  /**
   * Update item quantity in user's cart
   */
  static async updateItemQuantity(userId: string, productId: number, quantity: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if item exists in cart
      const { data: cartItem, error: findError } = await supabaseAdmin
        .from('cart_items')
        .select('id, product_id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (findError || !cartItem) {
        return { success: false, error: 'Item not found in cart' }
      }

      // Validate stock for new quantity
      const { data: product, error: productError } = await (supabaseAdmin as any)
        .from('products')
        .select('stock_qty, unit')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        return { success: false, error: 'Product not found' }
      }

      if ((product as any).stock_qty < quantity) {
        return { success: false, error: `Insufficient stock. Available: ${(product as any).stock_qty} ${(product as any).unit}` }
      }

      // Update quantity
      const { error: updateError } = await (supabaseAdmin as any)
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (updateError) {
        console.error('Database cart update error:', updateError)
        return { success: false, error: 'Failed to update cart item' }
      }

      return { success: true }
    } catch (error) {
      console.error('Cart updateItemQuantity error:', error)
      return { success: false, error: 'Failed to update cart item' }
    }
  }

  /**
   * Remove item from user's cart
   */
  static async removeItem(userId: string, productId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (error) {
        console.error('Database cart remove error:', error)
        return { success: false, error: 'Failed to remove item from cart' }
      }

      return { success: true }
    } catch (error) {
      console.error('Cart removeItem error:', error)
      return { success: false, error: 'Failed to remove item from cart' }
    }
  }

  /**
   * Get specific item from user's cart
   */
  static async getItem(userId: string, productId: number): Promise<CartItemResponse | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('cart_with_products')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (error) {
        return null
      }

      return data as CartItemResponse
    } catch (error) {
      console.error('Cart getItem error:', error)
      return null
    }
  }

  /**
   * Get all items in user's cart
   */
  static async getCartItems(userId: string): Promise<CartItemResponse[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('cart_with_products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Database cart fetch error:', error)
        return []
      }

      return (data as CartItemResponse[]) || []
    } catch (error) {
      console.error('Cart getCartItems error:', error)
      return []
    }
  }

  /**
   * Get cart summary (totals, counts)
   */
  static async getCartSummary(userId: string): Promise<{
    total_items: number
    total_amount_idr: number
    items_count: number
  }> {
    try {
      const items = await this.getCartItems(userId)
      
      const total_items = items.reduce((sum, item) => sum + item.quantity, 0)
      const total_amount_idr = items.reduce((sum, item) => sum + item.subtotal_idr, 0)
      const items_count = items.length

      return {
        total_items,
        total_amount_idr,
        items_count
      }
    } catch (error) {
      console.error('Cart getCartSummary error:', error)
      return {
        total_items: 0,
        total_amount_idr: 0,
        items_count: 0
      }
    }
  }

  /**
   * Clear user's entire cart
   */
  static async clearCart(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Database cart clear error:', error)
        return { success: false, error: 'Failed to clear cart' }
      }

      return { success: true }
    } catch (error) {
      console.error('Cart clearCart error:', error)
      return { success: false, error: 'Failed to clear cart' }
    }
  }

  /**
   * Get cart statistics for admin/debugging
   */
  static async getGlobalStats(): Promise<{
    total_users_with_carts: number
    total_cart_items: number
    average_cart_value: number
  }> {
    try {
      const { data: stats, error } = await supabaseAdmin
        .rpc('get_cart_statistics')

      if (error) {
        console.error('Cart stats error:', error)
        return {
          total_users_with_carts: 0,
          total_cart_items: 0,
          average_cart_value: 0
        }
      }

      return stats || {
        total_users_with_carts: 0,
        total_cart_items: 0,
        average_cart_value: 0
      }
    } catch (error) {
      console.error('Cart getGlobalStats error:', error)
      return {
        total_users_with_carts: 0,
        total_cart_items: 0,
        average_cart_value: 0
      }
    }
  }

  /**
   * Validate cart items before checkout (check stock, prices, etc.)
   */
  static async validateCart(userId: string): Promise<{
    valid: boolean
    issues: Array<{
      product_id: number
      product_title: string
      issue: string
    }>
  }> {
    try {
      const cartItems = await this.getCartItems(userId)
      const issues: Array<{ product_id: number; product_title: string; issue: string }> = []

      for (const item of cartItems) {
        // Check if product still exists and is published
        const { data: currentProduct, error } = await supabaseAdmin
          .from('products')
          .select('stock_qty, price_idr, published')
          .eq('id', item.product_id)
          .single()

        if (error || !currentProduct) {
          issues.push({
            product_id: item.product_id,
            product_title: item.product_title,
            issue: 'Product no longer available'
          })
          continue
        }

        if (!(currentProduct as any).published) {
          issues.push({
            product_id: item.product_id,
            product_title: item.product_title,
            issue: 'Product is no longer published'
          })
          continue
        }

        // Check stock availability
        if ((currentProduct as any).stock_qty < item.quantity) {
          issues.push({
            product_id: item.product_id,
            product_title: item.product_title,
            issue: `Insufficient stock. Available: ${(currentProduct as any).stock_qty}, In cart: ${item.quantity}`
          })
          continue
        }

        // Check if price has changed significantly (more than 10%)
        const priceDifference = Math.abs((currentProduct as any).price_idr - item.price_idr) / item.price_idr
        if (priceDifference > 0.1) {
          issues.push({
            product_id: item.product_id,
            product_title: item.product_title,
            issue: `Price has changed from Rp ${item.price_idr.toLocaleString()} to Rp ${(currentProduct as any).price_idr.toLocaleString()}`
          })
        }
      }

      return {
        valid: issues.length === 0,
        issues
      }
    } catch (error) {
      console.error('Cart validateCart error:', error)
      return {
        valid: false,
        issues: [{ product_id: 0, product_title: 'System', issue: 'Failed to validate cart' }]
      }
    }
  }
}

// Export for backward compatibility and easy migration
export const CartStorage = DatabaseCartStorage