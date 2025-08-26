import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { biteship } from '@/lib/biteship'
import { config } from '@/lib/config'
import type { Product } from '@/types/database'

// Request validation schema
const RatesRequestSchema = z.object({
  destination_address: z.object({
    recipient_name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
    city: z.string().min(1),
    postal_code: z.string().min(1),
    area_id: z.string().optional(),
  }),
  items: z.array(z.object({
    product_id: z.number().positive(),
    quantity: z.number().positive(),
    coffee_type: z.string().optional(),
    grind_level: z.string().optional(),
    condition: z.string().optional(),
  })).min(1),
  couriers: z.string().optional(), // comma-separated courier codes like "jne,pos,tiki"
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = RatesRequestSchema.parse(body)

    // Get product details and calculate total weight/value
    const productIds = validatedData.items.map(item => item.product_id)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, price_idr, stock_qty')
      .in('id', productIds)
      .eq('published', true)

    if (productsError || !products || products.length === 0) {
      console.error('Failed to fetch products:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 400 }
      )
    }

    // Type the products properly - Supabase returns an array of Product-like objects
    const typedProducts = products as Array<Pick<Product, 'id' | 'title' | 'price_idr' | 'stock_qty'>>

    // Validate stock and prepare shipping items
    const shippingItems = []
    let totalValue = 0

    for (const item of validatedData.items) {
      const product = typedProducts.find(p => p.id === item.product_id)
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        )
      }

      if (product.stock_qty < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.title}. Available: ${product.stock_qty}, Requested: ${item.quantity}` },
          { status: 400 }
        )
      }

      const itemValue = product.price_idr * item.quantity
      totalValue += itemValue

      // For coffee grounds, assume standard dimensions and weight
      // 1kg of coffee grounds ≈ 1000 grams, dimensions: 20x15x10 cm per kg
      const weightGrams = biteship.kgToGrams(item.quantity)
      const volumeMultiplier = Math.ceil(item.quantity) // Round up for volume calculation
      
      shippingItems.push({
        name: product.title,
        description: `${product.title} - ${item.quantity} kg`,
        value: Math.round(itemValue),
        length: 20 * volumeMultiplier, // cm
        width: 15, // cm
        height: 10 * volumeMultiplier, // cm
        weight: weightGrams,
        sku: `PRD-${product.id}`,
      })
    }

    // Prepare Biteship rates request
    const ratesRequest = {
      // Origin: Use warehouse coordinates or area_id
      origin_area_id: config.warehouse.originCityId,
      
      // Destination: Use provided area_id or coordinates
      destination_area_id: validatedData.destination_address.area_id,
      
      // Couriers: Use provided list or default Indonesian couriers
      couriers: validatedData.couriers || 'jne,pos,tiki,sicepat,jnt,ninja,wahana,rex,ide,lion,sap',
      
      items: shippingItems,
    }

    // Get rates from Biteship
    const ratesResponse = await biteship.getRates(ratesRequest)

    if (!ratesResponse.success) {
      console.error('Biteship rates error:', ratesResponse)
      return NextResponse.json(
        { error: 'Failed to get shipping rates', details: ratesResponse.message },
        { status: 500 }
      )
    }

    // Format response for frontend
    const formattedRates = ratesResponse.pricing.map(rate => ({
      company: rate.company,
      courier_code: rate.courier_code,
      service_code: rate.courier_service_code,
      service_name: rate.courier_service_name,
      price: rate.price,
      formatted_price: biteship.formatPrice(rate.price),
      duration: rate.duration,
      duration_range: rate.shipment_duration_range,
      duration_unit: rate.shipment_duration_unit,
      service_type: rate.service_type,
      description: rate.description,
      available_cod: rate.available_for_cash_on_delivery,
      available_insurance: rate.available_for_insurance,
      company_rating: rate.company_rating,
      company_rating_count: rate.company_rating_count,
      courier_logo: rate.courier_logo_url,
    }))

    // Sort by price (cheapest first)
    formattedRates.sort((a, b) => a.price - b.price)

    return NextResponse.json({
      success: true,
      data: {
        rates: formattedRates,
        total_items: validatedData.items.length,
        total_weight_kg: shippingItems.reduce((sum, item) => sum + item.weight, 0) / 1000,
        total_value: totalValue,
        formatted_total_value: biteship.formatPrice(totalValue),
        destination: {
          city: validatedData.destination_address.city,
          postal_code: validatedData.destination_address.postal_code,
          area_id: validatedData.destination_address.area_id,
        }
      }
    })

  } catch (error) {
    console.error('Shipping rates error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}