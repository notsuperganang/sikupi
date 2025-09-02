import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminResponse, adminErrorResponse } from '@/lib/admin-auth'

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
  content: z.string().optional(), // Make content optional - validate separately based on published status
  excerpt: z.string().max(300).optional(),
  meta_description: z.string().max(160).optional(),
  featured_image_url: z.string().url().optional().nullable(),
  gallery_images: z.array(z.string().url()).default([]),
  tags: z.array(z.string().min(1).max(50)).default([]),
  published: z.boolean().default(false),
  read_time_minutes: z.number().int().min(0).optional(),
  // These fields are for compatibility but won't be saved to DB
  author_name: z.string().optional(),
  featured: z.boolean().optional()
})

async function handleGET(request: NextRequest, adminAuth: any) {
  try {

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
        content_md,
        excerpt,
        featured_image_url,
        gallery_images,
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
      return adminErrorResponse('Failed to fetch magazine posts', 500, {
        database_error: error.message,
        query_type: 'select_magazine_posts'
      })
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedQuery.limit)
    const hasNextPage = validatedQuery.page < totalPages
    const hasPrevPage = validatedQuery.page > 1

    return adminResponse({
      posts: (posts as any[] || []).map((post: any) => {
        // Parse tags from JSON string to array
        const tagsArray = post.tags ? 
          (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : []
        
        // Parse gallery_images from JSON string to array
        const galleryImagesArray = post.gallery_images ? 
          (typeof post.gallery_images === 'string' ? JSON.parse(post.gallery_images) : post.gallery_images) : []
        
        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          content: post.content_md, // Map content_md to content
          excerpt: post.excerpt,
          featured_image_url: post.featured_image_url,
          gallery_images: galleryImagesArray,
          tags: tagsArray,
          published: post.published,
          view_count: post.view_count || 0,
          read_time_minutes: post.read_time_minutes || 0,
          author_name: post.author?.full_name || 'Admin',
          featured: false, // Default featured status
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
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return adminErrorResponse('Invalid request parameters', 400, error.errors)
    }

    console.error('Magazine posts API error:', error)
    return adminErrorResponse('Internal server error', 500)
  }
}

export const GET = requireAdminAuth(handleGET)

async function handlePOST(request: NextRequest, adminAuth: any) {
  try {

    // Parse and validate request body
    const body = await request.json()
    const validatedData = MagazinePostSchema.parse(body)

    // Additional validation for published articles
    if (validatedData.published && (!validatedData.content || validatedData.content.trim().length === 0)) {
      return adminErrorResponse('Content is required for published articles', 400, {
        field: 'content',
        message: 'Published articles must have content',
        published: validatedData.published,
        content_length: validatedData.content?.length || 0
      })
    }

    // Map frontend fields to database fields
    const dbData = {
      title: validatedData.title,
      slug: validatedData.slug,
      summary: validatedData.summary,
      content_md: validatedData.content || '', // Map 'content' to 'content_md', default to empty string
      excerpt: validatedData.excerpt,
      meta_description: validatedData.meta_description,
      featured_image_url: validatedData.featured_image_url,
      gallery_images: JSON.stringify(validatedData.gallery_images),
      tags: JSON.stringify(validatedData.tags),
      published: validatedData.published,
      read_time_minutes: validatedData.read_time_minutes,
      author_id: null // Set to null as requested
    }

    // Create the magazine post
    const { data: post, error } = await (supabaseAdmin as any)
      .from('magazine_posts')
      .insert(dbData)
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
        return adminErrorResponse('A post with this slug already exists', 409, {
          field: 'slug',
          value: dbData.slug,
          suggestion: 'Please choose a different slug or modify the title'
        })
      }
      
      return adminErrorResponse('Failed to create magazine post', 500, {
        database_error: error.message,
        error_code: error.code,
        submitted_data: Object.keys(dbData)
      })
    }

    // Parse tags and gallery_images for response
    const tagsArray = (post as any).tags ? 
      (typeof (post as any).tags === 'string' ? JSON.parse((post as any).tags) : (post as any).tags) : []
    const galleryImagesArray = (post as any).gallery_images ? 
      (typeof (post as any).gallery_images === 'string' ? JSON.parse((post as any).gallery_images) : (post as any).gallery_images) : []

    // Map database fields back to frontend format
    const responseData = {
      id: (post as any).id,
      title: (post as any).title,
      slug: (post as any).slug,
      summary: (post as any).summary,
      content: (post as any).content_md, // Map 'content_md' back to 'content'
      excerpt: (post as any).excerpt,
      meta_description: (post as any).meta_description,
      featured_image_url: (post as any).featured_image_url,
      gallery_images: galleryImagesArray,
      tags: tagsArray,
      published: (post as any).published,
      read_time_minutes: (post as any).read_time_minutes,
      created_at: (post as any).created_at,
      updated_at: (post as any).updated_at,
      author_name: 'Admin', // Default author name
      featured: false // Default featured status
    }

    return adminResponse(responseData)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return adminErrorResponse('Invalid request data', 400, {
        validation_errors: error.errors,
        failed_fields: error.errors.map(err => err.path.join('.')),
        help: 'Please check the required fields and their formats'
      })
    }

    console.error('Magazine post creation API error:', error)
    return adminErrorResponse('Internal server error', 500, {
      error_type: 'unexpected_error',
      timestamp: new Date().toISOString()
    })
  }
}

export const POST = requireAdminAuth(handlePOST)
