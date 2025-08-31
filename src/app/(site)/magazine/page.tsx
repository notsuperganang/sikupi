import { SparklesText } from '@/components/magicui/sparkles-text'
import { BoxReveal } from '@/components/magicui/box-reveal'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'
import { BackgroundRippleEffectReverse } from '@/components/ui/background-ripple-effect-reverse'
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

      {/* CTA Section */}
      <section className="pt-24 md:pt-32 pb-24 md:pb-32 relative overflow-hidden">
        {/* Background Ripple Effect - Extended to cover full area */}
        <div className="absolute inset-0 -bottom-24 md:-bottom-32 z-0">
          <BackgroundRippleEffectReverse
            rows={20}
            cols={30}
            cellSize={48}
            borderColor="rgba(217, 119, 6, 0.3)"
            fillColor="rgba(245, 158, 11, 0.15)"
            shadowColor="rgba(154, 52, 18, 0.4)"
            activeColor="rgba(217, 119, 6, 0.5)"
          />
        </div>
        {/* Overlay gradient - Extended */}
        <div className="absolute inset-0 -bottom-24 md:-bottom-32 z-[1] bg-gradient-to-t from-amber-50/20 via-transparent to-amber-50/30 pointer-events-none" />

        {/* Decorative coffee beans */}
        <div className="absolute inset-0 -bottom-24 md:-bottom-32 opacity-10 z-[1]">
          <div className="absolute top-16 left-16 w-8 h-8 bg-amber-700 rounded-full transform rotate-12"></div>
          <div className="absolute top-32 right-20 w-6 h-6 bg-yellow-700 rounded-full transform -rotate-45"></div>
          <div className="absolute bottom-40 left-24 w-10 h-10 bg-orange-600 rounded-full transform rotate-45"></div>
          <div className="absolute bottom-32 right-16 w-7 h-7 bg-amber-600 rounded-full transform -rotate-12"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <BoxReveal boxColor="#D97706" duration={0.6}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-900 mb-6 leading-tight">
                Punya Cerita Menarik Seputar Kopi?
              </h2>
            </BoxReveal>

            {/* Subheading */}
            <BoxReveal boxColor="#F59E0B" duration={0.7}>
              <p className="text-xl md:text-2xl text-yellow-800 mb-8 leading-relaxed">
                Bagikan pengalaman, pengetahuan, dan passion kopi Anda dengan komunitas Sikupi
              </p>
            </BoxReveal>

            {/* Benefits List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <BoxReveal boxColor="#D97706" duration={0.8}>
                <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">Artikel & Tutorial</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Tulis artikel brewing, review kopi, atau tips barista untuk dibaca ribuan coffee lovers
                  </p>
                </div>
              </BoxReveal>

              <BoxReveal boxColor="#F59E0B" duration={0.9}>
                <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">Event Komunitas</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Promosikan coffee cupping, workshop barista, atau acara komunitas kopi Anda
                  </p>
                </div>
              </BoxReveal>

              <BoxReveal boxColor="#D97706" duration={1.0}>
                <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">Bisnis Kopi</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Ceritakan perjalanan bisnis coffee shop, roastery, atau farm kopi Anda
                  </p>
                </div>
              </BoxReveal>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <BoxReveal boxColor="#B45309" duration={1.1}>
                <a
                  href="https://wa.me/628123456789?text=Halo%20Admin%20Sikupi!%20Saya%20ingin%20berkontribusi%20artikel%20untuk%20magazine%20Sikupi.%20Bisa%20bantu%20saya?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.700" />
                  </svg>
                  <span className="text-lg">Chat Admin via WhatsApp</span>
                </a>
              </BoxReveal>

              <BoxReveal boxColor="#F59E0B" duration={1.2}>
                <div className="text-center">
                  <p className="text-amber-700 text-sm">
                    Atau kirim email ke: <br />
                    <a href="mailto:editor@sikupi.com" className="text-amber-900 font-semibold hover:underline">
                      editor@sikupi.com
                    </a>
                  </p>
                </div>
              </BoxReveal>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-amber-200/50">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-amber-700">
                <BoxReveal boxColor="#D97706" duration={1.1}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Gratis & Mudah</span>
                  </div>
                </BoxReveal>
                <BoxReveal boxColor="#F59E0B" duration={1.2}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Tim Editor Berpengalaman</span>
                  </div>
                </BoxReveal>
                <BoxReveal boxColor="#D97706" duration={1.3}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span className="text-sm font-medium">Ribuan Pembaca Aktif</span>
                  </div>
                </BoxReveal>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
