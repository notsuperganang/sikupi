import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Query parameter validation schema for public listing
const PublicMagazineQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1') || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val || '12') || 12, 50)),
  search: z.string().optional(),
  tag: z.string().optional(),
  sort_by: z.enum(['created_at', 'view_count', 'title']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    const validatedQuery = PublicMagazineQuerySchema.parse(queryData)

    // Build query for published posts only
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
        view_count,
        read_time_minutes,
        created_at,
        author:profiles(full_name)
      `, { count: 'exact' })
      .eq('published', true)

    // Apply search filter using full-text search
    if (validatedQuery.search) {
      // Use PostgreSQL full-text search for better performance
      query = query.textSearch('title,summary,content_md', validatedQuery.search, {
        type: 'websearch',
        config: 'english'
      })
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
      console.error('Public magazine posts query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch magazine posts', details: error.message },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedQuery.limit)
    const hasNextPage = validatedQuery.page < totalPages
    const hasPrevPage = validatedQuery.page > 1

    // Get all unique tags for filtering UI
    let allTags: string[] = []
    try {
      const { data: tagData } = await (supabaseAdmin as any)
        .from('magazine_posts')
        .select('tags')
        .eq('published', true)
        .not('tags', 'is', null)

      if (tagData) {
        const tagSet = new Set<string>()
        tagData.forEach((post: any) => {
          if (post.tags) {
            // Parse tags if they're stored as JSON string
            const tagsArray = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags
            if (Array.isArray(tagsArray)) {
              tagsArray.forEach((tag: string) => tagSet.add(tag))
            }
          }
        })
        allTags = Array.from(tagSet).sort()
      }
    } catch (tagError) {
      console.warn('Failed to fetch tags:', tagError)
    }

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
            view_count: post.view_count || 0,
            read_time_minutes: post.read_time_minutes || 0,
            author_name: post.author?.full_name || 'Sikupi Team',
            created_at: post.created_at,
            // Generate SEO-friendly URL
            url: `/magazine/${post.slug}`
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
          tag: validatedQuery.tag,
          sort: {
            by: validatedQuery.sort_by,
            order: validatedQuery.sort_order
          }
        },
        available_tags: allTags
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Public magazine posts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
