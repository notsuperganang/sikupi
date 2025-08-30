'use client'

import { config } from './config'

// Midtrans Snap SDK types
declare global {
  interface Window {
    snap: {
      pay: (snapToken: string, options?: SnapPayOptions) => void
      hide: () => void
      show: () => void
    }
  }
}

export interface SnapPayOptions {
  onSuccess?: (result: SnapResult) => void
  onPending?: (result: SnapResult) => void
  onError?: (result: SnapResult) => void
  onClose?: () => void
  skipOrderSummary?: boolean
  embedId?: string
}

export interface SnapResult {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  merchant_id?: string
  gross_amount: string
  currency: string
  payment_type: string
  transaction_time: string
  transaction_status: string
  va_numbers?: Array<{
    bank: string
    va_number: string
  }>
  fraud_status?: string
  masked_card?: string
  bank?: string
  eci?: string
  channel_response_code?: string
  channel_response_message?: string
  approval_code?: string
}

export interface CreateTransactionPayload {
  buyer_id: string
  items: Array<{
    product_id: number
    quantity: number
    coffee_type?: string
    grind_level?: string
    condition?: string
  }>
  shipping_address: {
    recipient_name: string
    phone: string
    email: string
    address: string
    city: string
    postal_code: string
    area_id: string
  }
  shipping_fee_idr: number
  courier_company?: string
  courier_service?: string
  notes?: string
}

export interface CreateTransactionResponse {
  success: boolean
  data?: {
    order_id: number
    midtrans_order_id: string
    snap_token: string
    redirect_url: string
    total_amount: number
    formatted_amount: string
    expires_at: string
  }
  error?: string
  details?: string | string[]
}

export class MidtransSnapClient {
  private clientKey: string
  private isLoaded: boolean = false
  private loadPromise: Promise<void> | null = null

  constructor() {
    this.clientKey = config.midtrans.clientKey
  }

  /**
   * Load Snap.js SDK from CDN
   */
  private loadSnapJS(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (this.isLoaded && window.snap) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = `https://app.${config.midtrans.isProduction ? '' : 'sandbox.'}midtrans.com/snap/snap.js`
      script.setAttribute('data-client-key', this.clientKey)
      
      script.onload = () => {
        if (window.snap) {
          this.isLoaded = true
          console.log('🎯 Midtrans Snap.js loaded successfully')
          resolve()
        } else {
          reject(new Error('Snap.js loaded but window.snap is not available'))
        }
      }
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Snap.js:', error)
        reject(new Error('Failed to load Midtrans Snap.js'))
      }

      document.head.appendChild(script)
    })

    return this.loadPromise
  }

  /**
   * Create transaction and get Snap token from backend
   */
  async createTransaction(payload: CreateTransactionPayload): Promise<CreateTransactionResponse> {
    try {
      console.log('🚀 Creating Midtrans transaction:', payload)

      const response = await fetch('/api/midtrans/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const result: CreateTransactionResponse = await response.json()

      if (!response.ok) {
        console.error('❌ Transaction creation failed:', result)
        throw new Error(result.error || 'Failed to create transaction')
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Transaction creation was not successful')
      }

      console.log('✅ Transaction created successfully:', {
        orderId: result.data.order_id,
        midtransOrderId: result.data.midtrans_order_id,
        amount: result.data.formatted_amount
      })

      return result
    } catch (error) {
      console.error('❌ Create transaction error:', error)
      throw error instanceof Error ? error : new Error('Unknown error occurred')
    }
  }

  /**
   * Open Snap payment popup
   */
  async pay(snapToken: string, options: SnapPayOptions = {}): Promise<void> {
    try {
      console.log('💳 Opening Snap payment with token:', snapToken.substring(0, 20) + '...')

      // Load Snap.js if not already loaded
      await this.loadSnapJS()

      if (!window.snap) {
        throw new Error('Snap.js is not loaded')
      }

      // Default options with logging
      const snapOptions: SnapPayOptions = {
        onSuccess: (result) => {
          console.log('✅ Payment successful:', result)
          options.onSuccess?.(result)
        },
        onPending: (result) => {
          console.log('⏳ Payment pending:', result)
          options.onPending?.(result)
        },
        onError: (result) => {
          console.error('❌ Payment error:', result)
          options.onError?.(result)
        },
        onClose: () => {
          console.log('🚪 Payment popup closed')
          options.onClose?.()
        },
        ...options
      }

      // Open Snap payment popup
      window.snap.pay(snapToken, snapOptions)

    } catch (error) {
      console.error('❌ Snap pay error:', error)
      throw error instanceof Error ? error : new Error('Failed to open payment')
    }
  }

  /**
   * Create transaction and immediately open payment
   */
  async payWithTransaction(
    payload: CreateTransactionPayload, 
    paymentOptions: SnapPayOptions = {}
  ): Promise<{ orderId: number; midtransOrderId: string }> {
    try {
      // Create transaction first
      const transaction = await this.createTransaction(payload)
      
      if (!transaction.data) {
        throw new Error('No transaction data received')
      }

      const { snap_token, order_id, midtrans_order_id } = transaction.data

      // Open payment popup
      await this.pay(snap_token, paymentOptions)

      return {
        orderId: order_id,
        midtransOrderId: midtrans_order_id
      }

    } catch (error) {
      console.error('❌ Pay with transaction error:', error)
      throw error
    }
  }

  /**
   * Hide Snap payment popup
   */
  hide(): void {
    if (this.isLoaded && window.snap) {
      window.snap.hide()
    }
  }

  /**
   * Show Snap payment popup (if hidden)
   */
  show(): void {
    if (this.isLoaded && window.snap) {
      window.snap.show()
    }
  }

  /**
   * Check if Snap.js is loaded and ready
   */
  isReady(): boolean {
    return this.isLoaded && !!window.snap
  }
}

// Export singleton instance
export const midtransClient = new MidtransSnapClient()