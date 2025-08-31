import { SparklesText } from '@/components/magicui/sparkles-text'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { MagazineClient, AnimatedHeroSection } from './parts'

export const dynamic = 'force-dynamic'

interface MagazinePostSummary {
  id: string
  title: string
  slug: string
  summary?: string
  excerpt?: string
  featured_image_url?: string
  tags: string[]
  view_count: number
  read_time_minutes: number
  author_name: string
  created_at: string
  url: string
}

async function fetchMagazinePosts(): Promise<MagazinePostSummary[]> {
  try {
    // Build a safe absolute base URL for server-side fetch
  const h = await headers()
  const forwardedHost = h.get('x-forwarded-host') || undefined
  const host = forwardedHost || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')

    // Prefer explicit public site URL if provided
    let base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || ''
    if (base) {
      // Ensure it has protocol
      if (!/^https?:\/\//i.test(base)) {
        base = `https://${base}`
      }
      base = base.replace(/\/$/, '')
    } else {
      base = `${proto}://${host}`
    }

    const url = `${base}/api/magazine?limit=24`
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.error('Magazine API response not ok', res.status, await res.text())
      return []
    }
    const data = await res.json()
    if (!data?.success) return []
    return data.data.posts
  } catch (e) {
    console.error('Failed to load magazine posts', e)
    return []
  }
}

// Client component imported directly (Next will tree-shake client boundary)

export default async function MagazinePage() {
  const initialPosts = await fetchMagazinePosts()
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-yellow-50/40">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Animated Background Ripple Effect */}
        <div className="absolute inset-0 z-0">
          <BackgroundRippleEffect 
            rows={8}
            cols={27}
            cellSize={56}
            borderColor="rgba(217, 119, 6, 0.4)"
            fillColor="rgba(245, 158, 11, 0.25)"
            shadowColor="rgba(154, 52, 18, 0.5)"
            activeColor="rgba(217, 119, 6, 0.6)"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-stone-50/30 to-stone-50/60 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <AnimatedHeroSection />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <Suspense fallback={<div className='container mx-auto px-4 py-20 text-center text-stone-500'>Memuat artikel...</div>}>
        <MagazineClient initialPosts={initialPosts} />
      </Suspense>
    </main>
  )
}
