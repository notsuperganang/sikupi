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

export interface Area {
  id: string
  name: string
  type: string
  postal_code: string
  administrative_division_level_1_name: string
  administrative_division_level_1_type: string
  administrative_division_level_2_name: string
  administrative_division_level_2_type: string
  administrative_division_level_3_name: string
  administrative_division_level_3_type: string
  country_name: string
  country_code: string
}

export interface AreasResponse {
  success: boolean
  object: string
  message: string
  code: number
  areas: Area[]
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
   * Search for areas by postal code or city name (Maps API)
   */
  async getAreas(search: string): Promise<AreasResponse> {
    const url = `${BITESHIP_BASE_URL}/maps/areas?countries=ID&input=${encodeURIComponent(search)}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Biteship API Error: ${error.error || response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Biteship getAreas error:', error)
      throw new Error(`Failed to get areas: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate address and convert postal code to area_id
   */
  async validateAddress(postalCode: string): Promise<Area | null> {
    try {
      const response = await this.getAreas(postalCode)
      
      if (response.success && response.areas && response.areas.length > 0) {
        // Return the first matching area
        return response.areas[0]
      }
      
      return null
    } catch (error) {
      console.error('Address validation error:', error)
      return null
    }
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
      console.log('Creating Biteship order:', JSON.stringify(request, null, 2))
      
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
        console.error('Biteship order creation failed:', error)
        throw new Error(`Biteship API Error: ${error.error || response.statusText}`)
      }

      const data = await response.json()
      console.log('Biteship order created successfully:', {
        id: data.id,
        order_id: data.order_id,
        status: data.status
      })
      
      return data
    } catch (error) {
      console.error('Biteship createOrder error:', error)
      throw new Error(`Failed to create shipping order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create order from Sikupi order data
   */
  async createOrderFromSikupiOrder(orderData: {
    orderId: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: any;
    courierCompany: string;
    courierType: string;
    items: Array<{
      name: string;
      quantity: number;
      value: number;
      weight: number; // in grams
    }>;
    totalValue: number;
  }): Promise<CreateOrderResponse> {
    
    const { warehouse } = config
    
    // Prepare shipping items for Biteship
    const biteshipItems: ShippingItem[] = orderData.items.map(item => ({
      name: item.name,
      description: `${item.name} - ${item.quantity} unit`,
      value: Math.round(item.value),
      length: 20, // cm - standard package size
      width: 15,  // cm
      height: 10, // cm  
      weight: item.weight,
      sku: `ORDER-${orderData.orderId}`
    }))

    // Create Biteship order request
    const biteshipRequest: CreateOrderRequest = {
      // Shipper details (your warehouse)
      shipper_contact_name: warehouse.contact.name,
      shipper_contact_phone: warehouse.contact.phone,
      shipper_contact_email: warehouse.contact.email,
      shipper_organization: warehouse.contact.organization,
      
      // Origin (your warehouse)
      origin_contact_name: warehouse.contact.name,
      origin_contact_phone: warehouse.contact.phone,
      origin_address: warehouse.contact.address,
      origin_postal_code: warehouse.contact.postalCode.toString(),
      origin_note: `Sikupi Order #${orderData.orderId}`,
      
      // Destination (customer)
      destination_contact_name: orderData.customerName,
      destination_contact_phone: orderData.customerPhone,
      destination_contact_email: orderData.customerEmail,
      destination_address: `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}`,
      destination_postal_code: orderData.shippingAddress.postal_code,
      destination_note: `Deliver to: ${orderData.customerName}`,
      
      // Shipping details
      courier_company: orderData.courierCompany.toLowerCase(),
      courier_type: this.mapCourierType(orderData.courierCompany, orderData.courierType),
      delivery_type: 'now', // Immediate delivery
      order_note: `Sikupi marketplace order #${orderData.orderId}`,
      
      // Items
      items: biteshipItems,
      
      // Metadata for tracking
      metadata: {
        sikupi_order_id: orderData.orderId,
        platform: 'sikupi-marketplace',
        total_value: orderData.totalValue
      }
    }

    return this.createOrder(biteshipRequest)
  }

  /**
   * Get order details by order ID
   */
  async getOrderDetails(orderId: string): Promise<CreateOrderResponse> {
    const url = `${BITESHIP_BASE_URL}/orders/${orderId}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Biteship API Error: ${error.error || response.statusText}`)
      }

      const data = await response.json()
      console.log('Biteship order details:', {
        id: data.id,
        status: data.status,
        waybill_id: data.waybill_id
      })
      
      return data
    } catch (error) {
      console.error('Biteship getOrderDetails error:', error)
      throw new Error(`Failed to get order details: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
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
    // Note: Biteship webhook signature verification implementation
    // For now, basic verification - implement full HMAC if Biteship provides webhook secret
    if (!signature || !payload) {
      return false
    }
    
    // TODO: Implement proper HMAC-SHA256 verification when Biteship provides webhook secret
    // const expectedSignature = crypto.createHmac('sha256', config.biteship.webhookSecret)
    //   .update(payload)
    //   .digest('hex')
    // return signature === expectedSignature
    
    return true // Basic verification for now
  }

  /**
   * Map courier service type to Biteship format
   */
  mapCourierType(courier: string, serviceType: string): string {
    const courierLower = courier.toLowerCase()
    const serviceLower = serviceType.toLowerCase()
    
    // JNE service mapping
    if (courierLower === 'jne') {
      if (serviceLower.includes('reg') || serviceLower.includes('reguler')) return 'reg'
      if (serviceLower.includes('oke')) return 'oke'
      if (serviceLower.includes('yes')) return 'yes'
    }
    
    // J&T service mapping
    if (courierLower === 'jnt' || courierLower === 'j&t') {
      if (serviceLower.includes('reg') || serviceLower.includes('reguler')) return 'ez'
      if (serviceLower.includes('express')) return 'express'
    }
    
    // TIKI service mapping
    if (courierLower === 'tiki') {
      if (serviceLower.includes('reg') || serviceLower.includes('reguler')) return 'reg'
      if (serviceLower.includes('ons') || serviceLower.includes('overnight')) return 'ons'
    }
    
    // POS Indonesia service mapping
    if (courierLower === 'pos') {
      if (serviceLower.includes('reg') || serviceLower.includes('reguler')) return 'pos_reguler'
      if (serviceLower.includes('next')) return 'pos_nextday'
    }
    
    // Default fallback
    return serviceLower
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