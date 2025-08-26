/**
 * Biteship shipping integration service
 * Handles shipping rate quotes and order creation
 */

import { config } from '@/lib/config'

const BITESHIP_BASE_URL = 'https://api.biteship.com/v1'

export interface ShippingAddress {
  name: string
  phone: string
  email: string
  address: string
  city: string
  postal_code: string
  area_id?: string
  country_code?: string
}

export interface ShippingItem {
  name: string
  description: string
  value: number // in IDR
  length: number // in cm
  width: number // in cm
  height: number // in cm
  weight: number // in grams
  sku?: string
}

export interface RatesRequest {
  origin_area_id?: string
  origin_latitude?: number
  origin_longitude?: number
  destination_area_id?: string
  destination_latitude?: number
  destination_longitude?: number
  couriers?: string // comma-separated courier codes
  items: ShippingItem[]
}

export interface RatesResponse {
  success: boolean
  object: string
  message: string
  code: number
  pricing: Array<{
    company: string
    courier_code: string
    courier_service_code: string
    courier_service_name: string
    type: string
    description: string
    duration: string
    shipment_duration_range: string
    shipment_duration_unit: string
    service_type: string
    shipping_type: string
    price: number
    available_for_cash_on_delivery: boolean
    available_for_proof_of_delivery: boolean
    available_for_instant_waybill_id: boolean
    available_for_insurance: boolean
    available_collection_method: Array<string>
    company_rating?: number
    company_rating_count?: number
    courier_logo_url?: string
  }>
}

export interface CreateOrderRequest {
  shipper_contact_name: string
  shipper_contact_phone: string
  shipper_contact_email: string
  shipper_organization: string
  origin_contact_name: string
  origin_contact_phone: string
  origin_address: string
  origin_note?: string
  origin_postal_code: string
  origin_coordinate?: {
    latitude: number
    longitude: number
  }
  destination_contact_name: string
  destination_contact_phone: string
  destination_contact_email: string
  destination_address: string
  destination_postal_code: string
  destination_note?: string
  destination_coordinate?: {
    latitude: number
    longitude: number
  }
  courier_company: string
  courier_type: string
  delivery_type: string
  delivery_date?: string
  delivery_time?: string
  order_note?: string
  metadata?: Record<string, any>
  items: ShippingItem[]
}

export interface CreateOrderResponse {
  success: boolean
  object: string
  message: string
  code: number
  id: string
  shipper: {
    name: string
    email: string
    phone: string
    organization: string
  }
  origin: {
    contact_name: string
    contact_phone: string
    address: string
    note: string
    postal_code: string
    coordinate: {
      latitude: number
      longitude: number
    }
  }
  destination: {
    contact_name: string
    contact_phone: string
    contact_email: string
    address: string
    postal_code: string
    note: string
    coordinate: {
      latitude: number
      longitude: number
    }
  }
  courier: {
    company: string
    type: string
    insurance: {
      amount: number
      fee: number
      note: string
    }
  }
  delivery: {
    type: string
    date: string
    time: string
    note: string
  }
  reference_id: string
  items: ShippingItem[]
  extra: Record<string, any>
  price: number
  metadata: Record<string, any>
  note: string
  status: string
  waybill_id?: string
  order_id: string
}

export interface TrackingResponse {
  success: boolean
  object: string
  message: string
  code: number
  id: string
  waybill_id?: string
  order_id: string
  status: string
  link: string
  courier: {
    company: string
    name: string
    phone: string
  }
  origin: {
    contact_name: string
    address: string
  }
  destination: {
    contact_name: string
    address: string
  }
  history: Array<{
    note: string
    updated_at: string
    status: string
  }>
}

export class BiteshipService {
  private apiKey: string
  
  constructor() {
    this.apiKey = config.biteship.apiKey
  }

  /**
   * Get shipping rates for given origin/destination and items
   */
  async getRates(request: RatesRequest): Promise<RatesResponse> {
    const url = `${BITESHIP_BASE_URL}/rates/couriers`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Biteship API Error: ${error.error || response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Biteship getRates error:', error)
      throw new Error(`Failed to get shipping rates: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a shipping order
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const url = `${BITESHIP_BASE_URL}/orders`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Biteship API Error: ${error.error || response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Biteship createOrder error:', error)
      throw new Error(`Failed to create shipping order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Track a shipment by order ID
   */
  async trackOrder(orderId: string): Promise<TrackingResponse> {
    const url = `${BITESHIP_BASE_URL}/trackings/${orderId}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Biteship API Error: ${error.error || response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Biteship trackOrder error:', error)
      throw new Error(`Failed to track order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify webhook signature (if Biteship provides signature verification)
   */
  verifyWebhook(signature: string, payload: string): boolean {
    // Note: Implement if Biteship provides webhook signature verification
    // For now, return true as basic webhook verification
    return true
  }

  /**
   * Generate shipping reference ID
   */
  generateReferenceId(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `SIKUPI-SHIP-${timestamp}-${random}`
  }

  /**
   * Convert weight from kg to grams (Biteship expects grams)
   */
  kgToGrams(kg: number): number {
    return Math.round(kg * 1000)
  }

  /**
   * Format currency for Indonesian locale
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }
}

// Export singleton instance
export const biteship = new BiteshipService()