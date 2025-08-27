import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Query parameter validation schema
const MagazineQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1') || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val || '12') || 12, 50)),
  search: z.string().optional(),
  status: z.enum(['all', 'published', 'draft']).default('all'),
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'view_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  tag: z.string().optional()
})

// Magazine post validation schema
const MagazinePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  summary: z.string().max(500).optional(),
  content_md: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300).optional(),
  meta_description: z.string().max(160).optional(),
  featured_image_url: z.string().url().optional(),
  gallery_images: z.array(z.string().url()).default([]),
  tags: z.array(z.string().min(1).max(50)).default([]),
  published: z.boolean().default(false)
})

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No valid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await (supabaseAdmin as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    const validatedQuery = MagazineQuerySchema.parse(queryData)

    // Build query
    let query = (supabaseAdmin as any)
      .from('magazine_posts')
      .select(`
        id,
        title,
        slug,
        summary,
        excerpt,
        featured_image_url,
        tags,
        published,
        view_count,
        read_time_minutes,
        created_at,
        updated_at,
        author:profiles(full_name)
      `, { count: 'exact' })

    // Apply status filter
    if (validatedQuery.status === 'published') {
      query = query.eq('published', true)
    } else if (validatedQuery.status === 'draft') {
      query = query.eq('published', false)
    }

    // Apply search filter
    if (validatedQuery.search) {
      query = query.or(`title.ilike.%${validatedQuery.search}%,content_md.ilike.%${validatedQuery.search}%,summary.ilike.%${validatedQuery.search}%`)
    }

    // Apply tag filter
    if (validatedQuery.tag) {
      query = query.contains('tags', [validatedQuery.tag])
    }

    // Apply sorting
    query = query.order(validatedQuery.sort_by, { ascending: validatedQuery.sort_order === 'asc' })

    // Apply pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.limit
    query = query.range(offset, offset + validatedQuery.limit - 1)

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Magazine posts query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch magazine posts', details: error.message },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedQuery.limit)
    const hasNextPage = validatedQuery.page < totalPages
    const hasPrevPage = validatedQuery.page > 1

    return NextResponse.json({
      success: true,
      data: {
        posts: (posts as any[] || []).map((post: any) => {
          // Parse tags from JSON string to array
          const tagsArray = post.tags ? 
            (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : []
          
          return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            excerpt: post.excerpt,
            featured_image_url: post.featured_image_url,
            tags: tagsArray,
            published: post.published,
            view_count: post.view_count || 0,
            read_time_minutes: post.read_time_minutes || 0,
            author_name: post.author?.full_name || 'Unknown',
            created_at: post.created_at,
            updated_at: post.updated_at
          }
        }),
        pagination: {
          current_page: validatedQuery.page,
          per_page: validatedQuery.limit,
          total_items: count || 0,
          total_pages: totalPages,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
        },
        filters_applied: {
          search: validatedQuery.search,
          status: validatedQuery.status,
          tag: validatedQuery.tag,
          sort: {
            by: validatedQuery.sort_by,
            order: validatedQuery.sort_order
          }
        }
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Magazine posts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No valid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await (supabaseAdmin as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = MagazinePostSchema.parse(body)

    // Create the magazine post
    const { data: post, error } = await (supabaseAdmin as any)
      .from('magazine_posts')
      .insert({
        ...validatedData,
        author_id: user.id,
        tags: JSON.stringify(validatedData.tags),
        gallery_images: JSON.stringify(validatedData.gallery_images)
      })
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
      console.error('Magazine post creation error:', error)
      
      // Handle unique constraint violations
      if (error.code === '23505' && error.message.includes('slug')) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create magazine post', details: error.message },
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
      message: 'Magazine post created successfully',
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

    console.error('Magazine post creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
