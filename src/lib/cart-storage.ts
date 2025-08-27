/**
 * Shared in-memory cart storage for MVP
 * In production, this should be replaced with a database or Redis
 */

import type { Product } from '@/types/database'

// Cart storage interface
interface CartItem {
  product: Product
  quantity: number
}

// Global cart storage - shared across all endpoints
// Format: { userId: { productId: CartItem } }
const cartStorage = new Map<string, Map<number, CartItem>>()

export class CartStorage {
  /**
   * Get user's cart (creates new if doesn't exist)
   */
  static getUserCart(userId: string): Map<number, CartItem> {
    if (!cartStorage.has(userId)) {
      cartStorage.set(userId, new Map())
    }
    return cartStorage.get(userId)!
  }

  /**
   * Add or update item in user's cart
   */
  static addItem(userId: string, productId: number, product: Product, quantity: number): void {
    const userCart = this.getUserCart(userId)
    userCart.set(productId, { product, quantity })
  }

  /**
   * Update item quantity in user's cart
   */
  static updateItemQuantity(userId: string, productId: number, quantity: number): boolean {
    const userCart = this.getUserCart(userId)
    const item = userCart.get(productId)
    
    if (!item) {
      return false
    }
    
    userCart.set(productId, { ...item, quantity })
    return true
  }

  /**
   * Remove item from user's cart
   */
  static removeItem(userId: string, productId: number): boolean {
    const userCart = this.getUserCart(userId)
    return userCart.delete(productId)
  }

  /**
   * Get specific item from user's cart
   */
  static getItem(userId: string, productId: number): CartItem | undefined {
    const userCart = this.getUserCart(userId)
    return userCart.get(productId)
  }

  /**
   * Get all items in user's cart as array
   */
  static getCartItems(userId: string): Array<{ productId: number; item: CartItem }> {
    const userCart = this.getUserCart(userId)
    return Array.from(userCart.entries()).map(([productId, item]) => ({
      productId,
      item
    }))
  }

  /**
   * Clear user's entire cart
   */
  static clearCart(userId: string): void {
    cartStorage.delete(userId)
  }

  /**
   * Get cart statistics for debugging
   */
  static getStats() {
    return {
      totalUsers: cartStorage.size,
      usersWithItems: Array.from(cartStorage.entries()).map(([userId, cart]) => ({
        userId,
        itemCount: cart.size,
        items: Array.from(cart.keys())
      }))
    }
  }
}