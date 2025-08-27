import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import type { Product } from '@/types/database'
import { CartStorage } from '@/lib/cart-storage'

// Add to cart validation schema
const AddToCartSchema = z.object({
  product_id: z.number().positive(),
  quantity: z.number().positive().max(1000), // Reasonable maximum
})

// Helper function to get authenticated user
async function getAuthenticatedUser(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const headersList = await headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { user: null, error: 'No valid authorization header' }
    }
    
    const token = authorization.replace('Bearer ', '')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return { user: null, error: 'Invalid token' }
    }
    
    return { user }
    
  } catch (error) {
    console.error('Auth check error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}


export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = AddToCartSchema.parse(body)
    
    // Get product details from database
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', validatedData.product_id)
      .eq('published', true)
      .single()
    
    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      )
    }
    
    const productData = product as Product
    
    // Check stock availability
    if (productData.stock_qty < validatedData.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${productData.stock_qty} ${productData.unit}` },
        { status: 400 }
      )
    }
    
    // Check if product already in cart
    const existingItem = CartStorage.getItem(authResult.user.id, validatedData.product_id)
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + validatedData.quantity
      
      // Check total quantity against stock
      if (newQuantity > productData.stock_qty) {
        return NextResponse.json(
          { error: `Cannot add ${validatedData.quantity} more. Total would exceed available stock (${productData.stock_qty} ${productData.unit})` },
          { status: 400 }
        )
      }
      
      // Update quantity
      CartStorage.addItem(authResult.user.id, validatedData.product_id, productData, newQuantity)
      
      return NextResponse.json({
        success: true,
        message: 'Cart item quantity updated',
        data: {
          product_id: validatedData.product_id,
          quantity: newQuantity,
          action: 'updated'
        }
      })
      
    } else {
      // Add new item to cart
      CartStorage.addItem(authResult.user.id, validatedData.product_id, productData, validatedData.quantity)
      
      return NextResponse.json({
        success: true,
        message: 'Item added to cart',
        data: {
          product_id: validatedData.product_id,
          product_title: productData.title,
          quantity: validatedData.quantity,
          action: 'added'
        }
      }, { status: 201 })
    }
    
  } catch (error) {
    console.error('Add to cart API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}