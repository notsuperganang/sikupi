// Image upload utilities for product management
import { supabaseAdmin } from '@/lib/supabase'

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
  filename?: string
}

export interface CleanupResult {
  success: boolean
  deletedFiles: string[]
  errors: string[]
}

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/avif'
]

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Validates if a file is a valid image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    }
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum allowed: 10MB`
    }
  }
  
  return { valid: true }
}

/**
 * Generates a unique filename for uploaded images
 */
export function generateImageFilename(originalName: string, index: number = 0): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const baseName = originalName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9-]/g, '-')
  
  return `${timestamp}-${index}-${baseName}.${extension}`
}

/**
 * Uploads a single image to Supabase Storage
 */
export async function uploadProductImage(
  productId: number,
  file: File,
  index: number = 0
): Promise<ImageUploadResult> {
  try {
    // Validate the file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }
    
    // Generate filename
    const filename = generateImageFilename(file.name, index)
    const filePath = `${productId}/${filename}`
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`
      }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath)
    
    return {
      success: true,
      url: publicUrl,
      filename: filename
    }
    
  } catch (error) {
    console.error('Image upload exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    }
  }
}

/**
 * Uploads multiple images for a product
 */
export async function uploadProductImages(
  productId: number,
  files: File[]
): Promise<{ uploadedUrls: string[]; errors: string[] }> {
  const uploadedUrls: string[] = []
  const errors: string[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const result = await uploadProductImage(productId, file, i)
    
    if (result.success && result.url) {
      uploadedUrls.push(result.url)
    } else {
      errors.push(`File ${i + 1} (${file.name}): ${result.error}`)
    }
  }
  
  return { uploadedUrls, errors }
}

/**
 * Deletes images from storage based on URLs
 */
export async function deleteProductImages(imageUrls: string[]): Promise<CleanupResult> {
  const deletedFiles: string[] = []
  const errors: string[] = []
  
  for (const url of imageUrls) {
    try {
      // Extract file path from URL
      // URL format: https://supabase-url/storage/v1/object/public/product-images/123/filename.jpg
      const urlParts = url.split('/product-images/')
      if (urlParts.length !== 2) {
        errors.push(`Invalid URL format: ${url}`)
        continue
      }
      
      const filePath = urlParts[1]
      
      const { error: deleteError } = await supabaseAdmin.storage
        .from('product-images')
        .remove([filePath])
      
      if (deleteError) {
        errors.push(`Failed to delete ${filePath}: ${deleteError.message}`)
      } else {
        deletedFiles.push(filePath)
      }
      
    } catch (error) {
      errors.push(`Exception deleting ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return {
    success: errors.length === 0,
    deletedFiles,
    errors
  }
}

/**
 * Cleanup function to delete uploaded images if product creation/update fails
 */
export async function cleanupFailedUpload(uploadedUrls: string[]): Promise<void> {
  if (uploadedUrls.length === 0) return
  
  console.log('Cleaning up failed upload, deleting images:', uploadedUrls)
  const result = await deleteProductImages(uploadedUrls)
  
  if (result.errors.length > 0) {
    console.error('Cleanup errors:', result.errors)
  } else {
    console.log('Successfully cleaned up uploaded images')
  }
}

/**
 * Extracts image files from FormData
 */
export function extractImageFiles(formData: FormData): File[] {
  const files: File[] = []
  
  // Look for files with keys like 'image1', 'image2', etc.
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('image') && value instanceof File && value.size > 0) {
      files.push(value)
    }
  }
  
  return files
}

/**
 * Parse product data from FormData
 */
export function parseProductFormData(formData: FormData): Record<string, any> {
  const productData: Record<string, any> = {}
  
  for (const [key, value] of formData.entries()) {
    // Skip image files
    if (key.startsWith('image') && value instanceof File) {
      continue
    }
    
    // Handle different data types
    if (typeof value === 'string') {
      // Parse numbers
      if (key === 'price_idr' || key === 'stock_qty') {
        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
          productData[key] = numValue
        }
      }
      // Parse booleans  
      else if (key === 'published') {
        productData[key] = value === 'true' || value === '1'
      }
      // Keep as string
      else {
        productData[key] = value
      }
    }
  }
  
  return productData
}
