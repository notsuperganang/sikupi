import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { 
  ArticleHeader, 
  ArticleMeta, 
  ArticleContent, 
  RelatedPosts, 
  TableOfContents, 
  ShareButtons 
} from './parts'

export const dynamic = 'force-dynamic'

interface MagazinePost {
  id: string
  title: string
  slug: string
  summary?: string
  content_md: string
  excerpt?: string
  meta_description?: string
  featured_image_url?: string
  gallery_images: string[]
  tags: string[]
  view_count: number
  read_time_minutes: number
  created_at: string
  updated_at?: string
  author_name: string
  seo: {
    title: string
    description: string
    canonical_url: string
    structured_data: any
  }
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  read_time_minutes: number
  created_at: string
  url: string
}

interface ApiResponse {
  success: boolean
  data: {
    post: MagazinePost
    related_posts: RelatedPost[]
  }
}

async function fetchMagazinePost(slug: string): Promise<{ post: MagazinePost; relatedPosts: RelatedPost[] }> {
  try {
    const h = await headers()
    const forwardedHost = h.get('x-forwarded-host') || undefined
    const host = forwardedHost || h.get('host') || 'localhost:3000'
    const proto = h.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')

    let base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || ''
    if (base) {
      if (!/^https?:\/\//i.test(base)) {
        base = `https://${base}`
      }
      base = base.replace(/\/$/, '')
    } else {
      base = `${proto}://${host}`
    }

    const url = `${base}/api/magazine/${encodeURIComponent(slug)}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    
    if (!res.ok) {
      if (res.status === 404) {
        notFound()
      }
      throw new Error(`API response not ok: ${res.status}`)
    }

    const data: ApiResponse = await res.json()
    if (!data?.success || !data?.data?.post) {
      notFound()
    }

    return {
      post: data.data.post,
      relatedPosts: data.data.related_posts || []
    }
  } catch (error) {
    console.error('Failed to fetch magazine post:', error)
    notFound()
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const { post } = await fetchMagazinePost(resolvedParams.slug)
    
    return {
      title: post.seo.title,
      description: post.seo.description,
      keywords: post.tags.join(', '),
      authors: [{ name: post.author_name }],
      openGraph: {
        title: post.title,
        description: post.seo.description,
        type: 'article',
        publishedTime: post.created_at,
        modifiedTime: post.updated_at || post.created_at,
        authors: [post.author_name],
        tags: post.tags,
        images: post.featured_image_url ? [{
          url: post.featured_image_url,
          alt: post.title,
        }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.seo.description,
        images: post.featured_image_url ? [post.featured_image_url] : undefined,
      },
      alternates: {
        canonical: post.seo.canonical_url,
      },
    }
  } catch {
    return {
      title: 'Artikel Tidak Ditemukan',
      description: 'Artikel yang Anda cari tidak dapat ditemukan.',
    }
  }
}

export default async function MagazineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const { post, relatedPosts } = await fetchMagazinePost(resolvedParams.slug)

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-yellow-50/30">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(post.seo.structured_data),
        }}
      />

      {/* Article Header */}
      <ArticleHeader post={post} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Article Meta */}
            <ArticleMeta post={post} />

            {/* Article Content */}
            <ArticleContent post={post} />

            {/* Share Buttons */}
            <ShareButtons post={post} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            {/* Table of Contents */}
            <TableOfContents content={post.content_md} />
          </div>
        </div>

        {/* Related Posts */}
        <RelatedPosts posts={relatedPosts} />
      </div>
    </main>
  )
}