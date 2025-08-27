import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Route parameter validation
const ParamsSchema = z.object({
  slug: z.string().min(1, 'Slug is required')
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = ParamsSchema.parse(resolvedParams)

    // Fetch the magazine post by slug (published only)
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
        view_count,
        read_time_minutes,
        created_at,
        updated_at,
        author:profiles(full_name)
      `)
      .eq('slug', validatedParams.slug)
      .eq('published', true)
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

    // Increment view count
    try {
      await (supabaseAdmin as any)
        .from('magazine_posts')
        .update({ view_count: ((post as any).view_count || 0) + 1 })
        .eq('id', (post as any).id)
    } catch (viewError) {
      console.warn('Failed to increment view count:', viewError)
      // Don't fail the request if view count update fails
    }

    // Get related posts (same tags, excluding current post)
    let relatedPosts: any[] = []
    try {
      if ((post as any).tags && Array.isArray((post as any).tags) && (post as any).tags.length > 0) {
        const { data: related } = await (supabaseAdmin as any)
          .from('magazine_posts')
          .select(`
            id,
            title,Premium requests

            slug,
            excerpt,
            featured_image_url,
            read_time_minutes,
            created_at
          `)
          .eq('published', true)
          .neq('id', (post as any).id)
          .overlaps('tags', (post as any).tags)
          .order('created_at', { ascending: false })
          .limit(3)

        relatedPosts = related || []
      }

      // If we don't have enough related posts, fill with recent posts
      if (relatedPosts.length < 3) {
        const { data: recent } = await (supabaseAdmin as any)
          .from('magazine_posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image_url,
            read_time_minutes,
            created_at
          `)
          .eq('published', true)
          .neq('id', (post as any).id)
          .order('created_at', { ascending: false })
          .limit(3 - relatedPosts.length)

        if (recent) {
          relatedPosts = [...relatedPosts, ...recent]
        }
      }
    } catch (relatedError) {
      console.warn('Failed to fetch related posts:', relatedError)
    }

    // Parse tags from JSON string to array
    const tagsArray = (post as any).tags ? 
      (typeof (post as any).tags === 'string' ? JSON.parse((post as any).tags) : (post as any).tags) : []

    // Generate structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": (post as any).title,
      "description": (post as any).meta_description || (post as any).excerpt || (post as any).summary,
      "image": (post as any).featured_image_url,
      "author": {
        "@type": "Organization",
        "name": (post as any).author?.full_name || "Sikupi Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Sikupi",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sikupi.com/logo.png" // TODO: Replace with actual logo URL
        }
      },
      "datePublished": (post as any).created_at,
      "dateModified": (post as any).updated_at || (post as any).created_at,
      "wordCount": (post as any).content_md ? (post as any).content_md.split(' ').length : 0,
      "timeRequired": `PT${(post as any).read_time_minutes || 1}M`,
      "articleSection": "Coffee Sustainability",
      "keywords": Array.isArray(tagsArray) ? tagsArray.join(', ') : ''
    }

    // Parse gallery images from JSON string to array
    const galleryImagesArray = (post as any).gallery_images ? 
      (typeof (post as any).gallery_images === 'string' ? JSON.parse((post as any).gallery_images) : (post as any).gallery_images) : []

    return NextResponse.json({
      success: true,
      data: {
        post: {
          ...(post as any),
          tags: tagsArray,
          gallery_images: galleryImagesArray,
          author_name: (post as any).author?.full_name || 'Sikupi Team',
          view_count: ((post as any).view_count || 0) + 1, // Include the incremented count
          // SEO metadata
          seo: {
            title: (post as any).title,
            description: (post as any).meta_description || (post as any).excerpt || (post as any).summary,
            canonical_url: `/magazine/${(post as any).slug}`,
            structured_data: structuredData
          }
        },
        related_posts: relatedPosts.map((relatedPost: any) => ({
          id: relatedPost.id,
          title: relatedPost.title,
          slug: relatedPost.slug,
          excerpt: relatedPost.excerpt,
          featured_image_url: relatedPost.featured_image_url,
          read_time_minutes: relatedPost.read_time_minutes || 0,
          created_at: relatedPost.created_at,
          url: `/magazine/${relatedPost.slug}`
        }))
      }
    })

  } catch (error) {
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
