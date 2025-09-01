import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import type { Database } from '@/types/database'
import { 
  uploadProductImages, 
  deleteProductImages,
  cleanupFailedUpload, 
  extractImageFiles, 
  parseProductFormData 
} from '@/lib/image-upload'

// Product update validation schema - all fields optional for partial updates
const UpdateProductSchema = z.object({
  kind: z.enum(['ampas', 'turunan']).optional(),
  category: z.enum(['ampas_kopi', 'briket', 'pulp', 'scrub', 'pupuk', 'pakan_ternak', 'lainnya']).optional(),
  sku: z.string().nullable().optional(),
  title: z.string().min(1).max(255).optional(),
  slug: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  coffee_type: z.enum(['arabika', 'robusta', 'mix', 'unknown']).optional(),
  grind_level: z.enum(['halus', 'sedang', 'kasar', 'unknown']).optional(),
  condition: z.enum(['basah', 'kering', 'unknown']).optional(),
  price_idr: z.number().positive().optional(),
  stock_qty: z.number().nonnegative().optional(),
  unit: z.string().min(1).max(20).optional(),
  image_urls: z.array(z.string().url()).nullable().optional(),
  published: z.boolean().optional(),
})

// Route parameter validation
const UpdateProductParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Product ID must be positive')
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

// Delete parameter validation - just ID needed
const DeleteProductParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Product ID must be positive')
})

// PATCH method for partial updates (like toggle published status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin permissions
    const permissionCheck = await checkAdminPermissions(request)
    
    if (!permissionCheck.isAdmin) {
      return NextResponse.json(
        { error: permissionCheck.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = UpdateProductParamsSchema.parse(resolvedParams)
    
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, published')
      .eq('id', validatedParams.id)
      .single()
    
    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Parse request body for partial update
    const body = await request.json()
    const validatedData = UpdateProductSchema.parse(body)
    
    // Update the product
    const { data: updatedProduct, error: updateError } = await (supabaseAdmin as any)
      .from('products')
      .update(validatedData)
      .eq('id', validatedParams.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Product patch error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update product', details: updateError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    })
    
  } catch (error) {
    console.error('Admin product patch API error:', error)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin permissions
    const permissionCheck = await checkAdminPermissions(request)
    
    if (!permissionCheck.isAdmin) {
      return NextResponse.json(
        { error: permissionCheck.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = UpdateProductParamsSchema.parse(resolvedParams)
    
    // Check if product exists and get current data
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', validatedParams.id)
      .single()
    
    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    const currentProduct = existingProduct as any
    
    // Check content type to determine parsing method
    const contentType = request.headers.get('content-type') || ''
    let validatedData: any
    let imageFiles: File[] = []
    let keepExistingImages = true
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with images
      const formData = await request.formData()
      
      // Extract image files
      imageFiles = extractImageFiles(formData)
      
      // Parse product data from FormData
      const productData = parseProductFormData(formData)
      
      // Check if we should keep existing images (only replace if new images provided)
      keepExistingImages = imageFiles.length === 0
      
      // Validate the parsed data
      validatedData = UpdateProductSchema.parse(productData)
    } else {
      // Handle JSON (backward compatibility)
      const body = await request.json()
      validatedData = UpdateProductSchema.parse(body)
    }
    
    // Prepare update data
    const updateData = { ...validatedData }
    
    // Generate slug if title is being updated and slug is not provided
    if (validatedData.title && !validatedData.slug) {
      updateData.slug = generateSlug(validatedData.title)
    }
    
    // Check for existing SKU if being updated (and different from current)
    if (validatedData.sku && validatedData.sku !== currentProduct.sku) {
      const { data: existingSkuProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', validatedData.sku)
        .neq('id', validatedParams.id)
        .single()
      
      if (existingSkuProduct) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        )
      }
    }
    
    // Check for existing slug if being updated (and different from current)
    if (updateData.slug && updateData.slug !== currentProduct.slug) {
      const { data: existingSlugProduct } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', validatedParams.id)
        .single()
      
      if (existingSlugProduct) {
        // Generate unique slug by appending timestamp
        updateData.slug = `${updateData.slug}-${Date.now()}`
      }
    }
    
    // Handle image management
    let finalImageUrls: string[] = currentProduct.image_urls || []
    let oldImageUrls: string[] = []
    
    if (imageFiles.length > 0) {
      try {
        // If new images are provided, we'll replace all existing images
        oldImageUrls = [...finalImageUrls] // Keep reference for cleanup
        
        // Upload new images
        const { uploadedUrls, errors } = await uploadProductImages(validatedParams.id, imageFiles)
        
        if (errors.length > 0) {
          console.error('Image upload errors:', errors)
          return NextResponse.json(
            { error: 'Some images failed to upload', details: errors },
            { status: 400 }
          )
        }
        
        // Set new image URLs (replacing all existing ones)
        finalImageUrls = uploadedUrls
        updateData.image_urls = finalImageUrls
        
      } catch (uploadError) {
        console.error('Image upload exception:', uploadError)
        return NextResponse.json(
          { 
            error: 'Image upload failed', 
            details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
          },
          { status: 500 }
        )
      }
    } else if (validatedData.image_urls !== undefined) {
      // If image_urls is explicitly provided in the data (JSON mode), use those
      oldImageUrls = currentProduct.image_urls || []
      finalImageUrls = validatedData.image_urls || []
      updateData.image_urls = finalImageUrls
    }
    
    // Update the product in database
    const { data: updatedProduct, error: updateError } = await (supabaseAdmin as any)
      .from('products')
      .update(updateData)
      .eq('id', validatedParams.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Product update error:', updateError)
      
      // If product update failed and we uploaded new images, clean them up
      if (imageFiles.length > 0 && finalImageUrls.length > 0) {
        await cleanupFailedUpload(finalImageUrls)
      }
      
      return NextResponse.json(
        { error: 'Failed to update product', details: updateError.message },
        { status: 500 }
      )
    }
    
    // Success! Now clean up old images if we replaced them
    if (imageFiles.length > 0 && oldImageUrls.length > 0) {
      try {
        const cleanupResult = await deleteProductImages(oldImageUrls)
        if (cleanupResult.errors.length > 0) {
          console.warn('Some old images could not be deleted:', cleanupResult.errors)
          // Don't fail the update for cleanup errors
        }
      } catch (cleanupError) {
        console.error('Error cleaning up old images:', cleanupError)
        // Don't fail the update for cleanup errors
      }
    }
    
    // Format response - Type assertion for TypeScript
    const productData = updatedProduct as any
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
      image_urls: finalImageUrls,
      published: productData.published,
      created_at: productData.created_at,
      updated_at: productData.updated_at,
    }
    
    return NextResponse.json({
      success: true,
      data: {
        product: formattedProduct
      },
      message: 'Product updated successfully'
    })
    
  } catch (error) {
    console.error('Admin product update API error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin permissions
    const permissionCheck = await checkAdminPermissions(request)
    
    if (!permissionCheck.isAdmin) {
      return NextResponse.json(
        { error: permissionCheck.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = DeleteProductParamsSchema.parse(resolvedParams)
    
    // Check if product exists and get current data including images
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, title, published, stock_qty, image_urls')
      .eq('id', validatedParams.id)
      .single()
    
    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    const productData = existingProduct as any
    
    // Optional: Prevent deletion of published products with stock
    // Uncomment this block if you want to add extra safety
    /*
    if (productData.published && productData.stock_qty > 0) {
      return NextResponse.json(
        { error: 'Cannot delete published product with available stock. Please unpublish first.' },
        { status: 409 }
      )
    }
    */
    
    // Check if product has associated orders (prevent deletion of ordered products)
    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('product_id', validatedParams.id)
      .limit(1)
      .single()
    
    if (orderItemsError && orderItemsError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      console.error('Error checking order items:', orderItemsError)
      return NextResponse.json(
        { error: 'Failed to check product dependencies', details: orderItemsError.message },
        { status: 500 }
      )
    }
    
    if (orderItems) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered. Product has existing order history.' },
        { status: 409 }
      )
    }
    
    // Check if product has reviews (optional: prevent deletion or cascade delete)
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('product_reviews')
      .select('id')
      .eq('product_id', validatedParams.id)
      .limit(1)
    
    // If there are reviews, delete them first (cascade delete)
    if (!reviewsError && reviews && reviews.length > 0) {
      const { error: deleteReviewsError } = await supabaseAdmin
        .from('product_reviews')
        .delete()
        .eq('product_id', validatedParams.id)
      
      if (deleteReviewsError) {
        console.error('Error deleting product reviews:', deleteReviewsError)
        return NextResponse.json(
          { error: 'Failed to delete associated reviews', details: deleteReviewsError.message },
          { status: 500 }
        )
      }
    }
    
    // Delete the product from database
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', validatedParams.id)
    
    if (deleteError) {
      console.error('Product deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete product', details: deleteError.message },
        { status: 500 }
      )
    }
    
    // Clean up product images from storage after successful deletion
    if (productData.image_urls && productData.image_urls.length > 0) {
      try {
        const cleanupResult = await deleteProductImages(productData.image_urls)
        if (cleanupResult.errors.length > 0) {
          console.warn('Some product images could not be deleted:', cleanupResult.errors)
          // Don't fail the deletion for cleanup errors, but log them
        } else {
          console.log('Successfully cleaned up product images')
        }
      } catch (cleanupError) {
        console.error('Error cleaning up product images:', cleanupError)
        // Don't fail the deletion for cleanup errors
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Product "${productData.title}" deleted successfully`,
      data: {
        deleted_product_id: validatedParams.id
      }
    })
    
  } catch (error) {
    console.error('Admin product delete API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid product ID', 
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