import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { success: false, error: 'No valid authorization header' }
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return { success: false, error: 'Invalid or expired token' }
  }

  // Check if user is admin
  const { data: profile } = await (supabaseAdmin as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') {
    return { success: false, error: 'Admin access required' }
  }

  return { success: true, user }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Admin access required' ? 403 : 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'featured' or 'gallery'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      )
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
      return NextResponse.json(
        { error: 'Failed to upload image', details: error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('magazine-images')
      .getPublicUrl(filePath)

    if (!urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get public URL for uploaded image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: filename,
        path: filePath,
        url: urlData.publicUrl,
        type: type || 'image',
        size: file.size,
        uploaded_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Image upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Admin access required' ? 403 : 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { path } = body

    if (!path) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('magazine-images')
      .remove([path])

    if (error) {
      console.error('Storage deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete image', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        deleted_path: path,
        deleted_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Image deletion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
