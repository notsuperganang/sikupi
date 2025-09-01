import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Magazine post validation schema
const MagazinePostUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  summary: z.string().max(500).optional(),
  content: z.string().optional(), // Accept 'content' and map to 'content_md', make optional
  excerpt: z.string().max(300).optional(),
  meta_description: z.string().max(160).optional(),
  featured_image_url: z.string().url().optional().nullable(),
  gallery_images: z.array(z.string().url()).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  published: z.boolean().optional()
})

// Route parameter validation
const ParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Post ID must be positive')
})

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Admin access required' ? 403 : 401 }
      )
    }

    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = ParamsSchema.parse(resolvedParams)

    // Fetch the magazine post
    const { data: post, error } = await (supabaseAdmin as any)
      .from('magazine_posts')
      .select(`
        id,
        title,
        slug,
        summary,
        content_md,
        excerpt,
        meta_description,
        featured_image_url,
        gallery_images,
        tags,
        published,
        view_count,
        read_time_minutes,
        created_at,
        updated_at,
        author:profiles(full_name)
      `)
      .eq('id', validatedParams.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Magazine post not found' },
          { status: 404 }
        )
      }
      
      console.error('Magazine post fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch magazine post', details: error.message },
        { status: 500 }
      )
    }

    // Parse tags and gallery_images for response
    const tagsArray = post.tags ? 
      (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : []
    const galleryImagesArray = post.gallery_images ? 
      (typeof post.gallery_images === 'string' ? JSON.parse(post.gallery_images) : post.gallery_images) : []

    return NextResponse.json({
      success: true,
      data: {
        post: {
          ...post,
          tags: tagsArray,
          gallery_images: galleryImagesArray
        }
      }
    })  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Magazine post fetch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Admin access required' ? 403 : 401 }
      )
    }

    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = ParamsSchema.parse(resolvedParams)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = MagazinePostUpdateSchema.parse(body)

    // Additional validation for published articles
    if (validatedData.published && validatedData.content !== undefined && (!validatedData.content || validatedData.content.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Content is required for published articles' },
        { status: 400 }
      )
    }

    // Check if post exists
    const { data: existingPost } = await (supabaseAdmin as any)
      .from('magazine_posts')
      .select('id, published')
      .eq('id', validatedParams.id)
      .single()

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Magazine post not found' },
        { status: 404 }
      )
    }

    // If trying to publish, check if content is provided or already exists
    if (validatedData.published && (!validatedData.content || validatedData.content.trim().length === 0)) {
      // Check if existing post has content
      const { data: existingContent } = await (supabaseAdmin as any)
        .from('magazine_posts')
        .select('content_md')
        .eq('id', validatedParams.id)
        .single()
      
      if (!existingContent?.content_md || existingContent.content_md.trim().length === 0) {
        return NextResponse.json(
          { error: 'Content is required for published articles' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData }
    
    // Map content to content_md if provided
    if (validatedData.content !== undefined) {
      updateData.content_md = validatedData.content
      delete updateData.content
    }
    
    if (validatedData.tags) {
      updateData.tags = JSON.stringify(validatedData.tags)
    }
    if (validatedData.gallery_images) {
      updateData.gallery_images = JSON.stringify(validatedData.gallery_images)
    }

    // Update the magazine post
    const { data: post, error } = await (supabaseAdmin as any)
      .from('magazine_posts')
      .update(updateData)
      .eq('id', validatedParams.id)
      .select(`
        id,
        title,
        slug,
        summary,
        content_md,
        excerpt,
        meta_description,
        featured_image_url,
        gallery_images,
        tags,
        published,
        read_time_minutes,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Magazine post update error:', error)
      
      // Handle unique constraint violations
      if (error.code === '23505' && error.message.includes('slug')) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to update magazine post', details: error.message },
        { status: 500 }
      )
    }

    // Parse tags and gallery_images for response
    const tagsArray = (post as any).tags ? 
      (typeof (post as any).tags === 'string' ? JSON.parse((post as any).tags) : (post as any).tags) : []
    const galleryImagesArray = (post as any).gallery_images ? 
      (typeof (post as any).gallery_images === 'string' ? JSON.parse((post as any).gallery_images) : (post as any).gallery_images) : []

    return NextResponse.json({
      success: true,
      message: 'Magazine post updated successfully',
      data: {
        post: {
          ...(post as any),
          tags: tagsArray,
          gallery_images: galleryImagesArray
        }
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Magazine post update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Admin access required' ? 403 : 401 }
      )
    }

    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = ParamsSchema.parse(resolvedParams)

    // Check if post exists and get its data before deletion
    const { data: existingPost } = await (supabaseAdmin as any)
      .from('magazine_posts')
      .select('id, title, featured_image_url, gallery_images')
      .eq('id', validatedParams.id)
      .single()

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Magazine post not found' },
        { status: 404 }
      )
    }

    // Delete the magazine post
    const { error } = await (supabaseAdmin as any)
      .from('magazine_posts')
      .delete()
      .eq('id', validatedParams.id)

    if (error) {
      console.error('Magazine post deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete magazine post', details: error.message },
        { status: 500 }
      )
    }

    // TODO: Optionally delete associated images from Supabase Storage
    // This could be implemented as a background job or immediate cleanup

    return NextResponse.json({
      success: true,
      message: 'Magazine post deleted successfully',
      data: {
        deleted_post_id: validatedParams.id,
        deleted_post_title: (existingPost as any).title
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Magazine post deletion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
