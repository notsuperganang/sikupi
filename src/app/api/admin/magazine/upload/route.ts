import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminResponse, adminErrorResponse } from '@/lib/admin-auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

async function handlePOST(request: NextRequest, adminAuth: any) {
  try {

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'featured' or 'gallery'

    if (!file) {
      return adminErrorResponse('No file provided', 400, {
        expected: 'File upload in form data',
        received: 'No file field found'
      })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return adminErrorResponse('Invalid file type', 400, {
        file_type: file.type,
        allowed_types: ALLOWED_TYPES,
        file_name: file.name,
        help: 'Please upload a JPEG, PNG, or WebP image'
      })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return adminErrorResponse('File too large', 400, {
        file_size: file.size,
        max_size: MAX_FILE_SIZE,
        file_size_mb: (file.size / (1024 * 1024)).toFixed(2),
        max_size_mb: MAX_FILE_SIZE / (1024 * 1024),
        help: `Please reduce file size to under ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `${type || 'image'}-${timestamp}-${randomString}.${extension}`
    const filePath = `magazine/${filename}`

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('magazine-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return adminErrorResponse('Failed to upload image', 500, {
        storage_error: error.message,
        file_path: filePath,
        file_name: filename,
        bucket: 'magazine-images'
      })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('magazine-images')
      .getPublicUrl(filePath)

    if (!urlData.publicUrl) {
      return adminErrorResponse('Failed to get public URL for uploaded image', 500, {
        file_path: filePath,
        storage_response: 'No public URL returned'
      })
    }

    return adminResponse({
      filename: filename,
      path: filePath,
      url: urlData.publicUrl,
      type: type || 'image',
      size: file.size,
      uploaded_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Image upload API error:', error)
    return adminErrorResponse('Internal server error', 500, {
      error_type: 'unexpected_upload_error',
      timestamp: new Date().toISOString()
    })
  }
}

export const POST = requireAdminAuth(handlePOST)

async function handleDELETE(request: NextRequest, adminAuth: any) {
  try {

    // Parse request body
    const body = await request.json()
    const { path } = body

    if (!path) {
      return adminErrorResponse('File path is required', 400, {
        expected: 'path field in request body',
        received: 'No path provided'
      })
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('magazine-images')
      .remove([path])

    if (error) {
      console.error('Storage deletion error:', error)
      return adminErrorResponse('Failed to delete image', 500, {
        storage_error: error.message,
        file_path: path,
        bucket: 'magazine-images'
      })
    }

    return adminResponse({
      deleted_path: path,
      deleted_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Image deletion API error:', error)
    return adminErrorResponse('Internal server error', 500, {
      error_type: 'unexpected_deletion_error',
      timestamp: new Date().toISOString()
    })
  }
}

export const DELETE = requireAdminAuth(handleDELETE)
