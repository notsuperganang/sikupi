import crypto from 'crypto'
import { config } from './config'
import { generateOrderId } from './utils'

// Midtrans API endpoints
const MIDTRANS_SNAP_URL = config.midtrans.isProduction 
  ? 'https://app.midtrans.com' 
  : 'https://app.sandbox.midtrans.com'

const MIDTRANS_CORE_URL = config.midtrans.isProduction
  ? 'https://api.midtrans.com'
  : 'https://api.sandbox.midtrans.com'

export interface CreateTransactionRequest {
  order_id: string
  gross_amount: number
  customer_details: {
    first_name: string
    email: string
    phone: string
  }
  item_details: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
  shipping_address?: any
  custom_field1?: string // Can store buyer_id
  custom_field2?: string // Can store additional data
}

export interface MidtransSnapResponse {
  token: string
  redirect_url: string
}

export interface MidtransNotification {
  transaction_time: string
  transaction_status: string
  transaction_id: string
  status_message: string
  status_code: string
  signature_key: string
  payment_type: string
  order_id: string
  gross_amount: string
  fraud_status: string
  currency: string
  merchant_id?: string
  masked_card?: string
  bank?: string
  va_numbers?: Array<{
    bank: string
    va_number: string
  }>
  bca_va_number?: string
  permata_va_number?: string
}

export class MidtransService {
  private serverKey: string
  private clientKey: string
  private isProduction: boolean

  constructor() {
    this.serverKey = config.midtrans.serverKey
    this.clientKey = config.midtrans.clientKey
    this.isProduction = config.midtrans.isProduction
  }

  /**
   * Create a Snap payment token
   */
  async createSnapToken(request: CreateTransactionRequest): Promise<MidtransSnapResponse> {
    const url = `${MIDTRANS_SNAP_URL}/snap/v1/transactions`
    
    const payload = {
      transaction_details: {
        order_id: request.order_id,
        gross_amount: request.gross_amount
      },
      customer_details: request.customer_details,
      item_details: request.item_details,
      callbacks: {
        finish: `${config.app.url}/payment/result`,
        error: `${config.app.url}/payment/result`,
        pending: `${config.app.url}/payment/result`
      },
      expiry: {
        duration: 24,
        unit: 'hours'
      },
      custom_field1: request.custom_field1,
      custom_field2: request.custom_field2
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Midtrans API Error: ${error.error_messages?.join(', ') || response.statusText}`)
      }

      const data = await response.json()
      
      return {
        token: data.token,
        redirect_url: data.redirect_url
      }
    } catch (error) {
      console.error('Midtrans createSnapToken error:', error)
      throw new Error(`Failed to create payment token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify webhook signature
   */
  verifySignature(notification: MidtransNotification): boolean {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key
    } = notification

    const payload = order_id + status_code + gross_amount + this.serverKey
    const computedSignature = crypto
      .createHash('sha512')
      .update(payload)
      .digest('hex')

    return computedSignature === signature_key
  }

  /**
   * Get transaction status from Midtrans
   */
  async getTransactionStatus(orderId: string): Promise<MidtransNotification> {
    const url = `${MIDTRANS_CORE_URL}/v2/${orderId}/status`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`
        }
      })

      if (!response.ok) {
        throw new Error(`Midtrans API Error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Midtrans getTransactionStatus error:', error)
      throw new Error(`Failed to get transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(orderId: string): Promise<void> {
    const url = `${MIDTRANS_CORE_URL}/v2/${orderId}/cancel`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Midtrans API Error: ${error.error_messages?.join(', ') || response.statusText}`)
      }
    } catch (error) {
      console.error('Midtrans cancelTransaction error:', error)
      throw new Error(`Failed to cancel transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Map Midtrans transaction status to our order status
   */
  mapTransactionStatus(transactionStatus: string, fraudStatus?: string): 'paid' | 'pending_payment' | 'cancelled' | 'new' {
    // Handle fraud status first
    if (fraudStatus === 'challenge' || fraudStatus === 'deny') {
      return 'cancelled'
    }

    switch (transactionStatus) {
      case 'capture':
      case 'settlement':
        return 'paid'
      
      case 'pending':
        return 'pending_payment'
      
      case 'deny':
      case 'cancel':
      case 'expire':
      case 'failure':
        return 'cancelled'
      
      default:
        return 'new'
    }
  }

  /**
   * Generate a unique order ID for Midtrans
   */
  generateMidtransOrderId(): string {
    return `SIKUPI-${generateOrderId()}`
  }

  /**
   * Format amount for Midtrans (they expect integer, no decimal)
   */
  formatAmount(amount: number): number {
    return Math.round(amount)
  }

  /**
   * Create item details from order items
   */
  createItemDetails(items: Array<{
    id: number
    name: string
    price: number
    quantity: number
  }>): CreateTransactionRequest['item_details'] {
    return items.map(item => ({
      id: item.id.toString(),
      name: item.name.substring(0, 50), // Midtrans has character limit
      price: this.formatAmount(item.price),
      quantity: item.quantity
    }))
  }

  /**
   * Validate notification payload
   */
  validateNotification(notification: any): MidtransNotification | null {
    const required = [
      'transaction_time',
      'transaction_status', 
      'transaction_id',
      'status_code',
      'signature_key',
      'order_id',
      'gross_amount'
    ]

    for (const field of required) {
      if (!notification[field]) {
        console.error(`Missing required field in notification: ${field}`)
        return null
      }
    }

    return notification as MidtransNotification
  }
}

// Export singleton instance
export const midtrans = new MidtransService()