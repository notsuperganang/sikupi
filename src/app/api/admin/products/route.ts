import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import type { Database } from '@/types/database'

// Product creation validation schema
const CreateProductSchema = z.object({
  kind: z.enum(['ampas', 'turunan']),
  category: z.enum(['ampas_kopi', 'briket', 'pulp', 'scrub', 'pupuk', 'pakan_ternak', 'lainnya']),
  sku: z.string().optional().nullable(),
  title: z.string().min(1).max(255),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coffee_type: z.enum(['arabika', 'robusta', 'mix', 'unknown']),
  grind_level: z.enum(['halus', 'sedang', 'kasar', 'unknown']),
  condition: z.enum(['basah', 'kering', 'unknown']),
  price_idr: z.number().positive(),
  stock_qty: z.number().nonnegative(),
  unit: z.string().min(1).max(20),
  image_urls: z.array(z.string().url()).optional().nullable(),
  published: z.boolean().default(false),
})

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Helper function to check admin permissions
async function checkAdminPermissions(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    // Get the authorization header
    const headersList = await headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'No valid authorization header' }
    }
    
    const token = authorization.replace('Bearer ', '')
    
    // Create Supabase client with the provided token
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
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return { isAdmin: false, error: 'Invalid token' }
    }
    
    // Check user's role in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      return { isAdmin: false, error: 'User profile not found' }
    }
    
    const userProfile = profile as any
    if (userProfile.role !== 'admin') {
      return { isAdmin: false, error: 'Insufficient permissions' }
    }
    
    return { isAdmin: true, userId: user.id }
    
  } catch (error) {
    console.error('Admin permission check error:', error)
    return { isAdmin: false, error: 'Permission check failed' }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const permissionCheck = await checkAdminPermissions(request)
    
    if (!permissionCheck.isAdmin) {
      return NextResponse.json(
        { error: permissionCheck.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateProductSchema.parse(body)
    
    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = generateSlug(validatedData.title)
    }
    
    // Check for existing SKU if provided
    if (validatedData.sku) {
      const { data: existingProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', validatedData.sku)
        .single()
      
      if (existingProduct) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        )
      }
    }
    
    // Check for existing slug
    if (validatedData.slug) {
      const { data: existingSlug } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('slug', validatedData.slug)
        .single()
      
      if (existingSlug) {
        // Generate unique slug by appending timestamp
        validatedData.slug = `${validatedData.slug}-${Date.now()}`
      }
    }
    
    // Create the product
    const { data: newProduct, error: createError } = await (supabaseAdmin as any)
      .from('products')
      .insert(validatedData)
      .select()
      .single()
    
    if (createError) {
      console.error('Product creation error:', createError)
      return NextResponse.json(
        { error: 'Failed to create product', details: createError.message },
        { status: 500 }
      )
    }
    
    // Format response - Type assertion for TypeScript
    const productData = newProduct as any
    const formattedProduct = {
      id: productData.id,
      kind: productData.kind,
      category: productData.category,
      sku: productData.sku,
      title: productData.title,
      slug: productData.slug,
      description: productData.description,
      coffee_type: productData.coffee_type,
      grind_level: productData.grind_level,
      condition: productData.condition,
      price_idr: productData.price_idr,
      stock_qty: productData.stock_qty,
      unit: productData.unit,
      image_urls: productData.image_urls || [],
      published: productData.published,
      created_at: productData.created_at,
      updated_at: productData.updated_at,
    }
    
    return NextResponse.json({
      success: true,
      data: {
        product: formattedProduct
      },
      message: 'Product created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Admin products API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid product data', 
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