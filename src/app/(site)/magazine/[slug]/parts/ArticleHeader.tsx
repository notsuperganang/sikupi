'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Home, ChevronRight } from 'lucide-react'

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
}

interface ArticleHeaderProps {
  post: MagazinePost
}

export default function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      {post.featured_image_url && (
        <div className="absolute inset-0">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/20 to-transparent" />
        </div>
      )}

      {/* Fallback Background */}
      {!post.featured_image_url && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900 via-amber-800 to-orange-900">
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="pt-6 pb-4"
        >
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Link 
              href="/" 
              className="flex items-center gap-1 hover:text-white transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link 
              href="/magazine" 
              className="hover:text-white transition-colors duration-200"
            >
              Magazine
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
          </div>
        </motion.nav>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Link
            href="/magazine"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm">Kembali ke Magazine</span>
          </Link>
        </motion.div>

        {/* Main Header Content */}
        <div className="pb-16 pt-8">
          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-yellow-600/90 hover:bg-yellow-500/90 text-white border-0 px-3 py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
          >
            {post.title}
          </motion.h1>

          {/* Summary/Excerpt */}
          {(post.summary || post.excerpt) && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl"
            >
              {post.summary || post.excerpt}
            </motion.p>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-yellow-400/30 to-transparent rounded-full blur-3xl"
      />
    </section>
  )
}