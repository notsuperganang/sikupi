'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight, ImageIcon, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

interface RelatedPostsProps {
  posts: RelatedPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="mt-16 pt-12 border-t border-yellow-800/20"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
        >
          Artikel Terkait
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          Jelajahi artikel menarik lainnya yang mungkin Anda sukai
        </motion.p>
      </div>

      {/* Related Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94] 
            }}
            whileHover={{ 
              y: -4, 
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            whileTap={{ scale: 0.98 }}
            className="group bg-white rounded-2xl border-2 border-yellow-800/40 hover:border-yellow-900/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Link href={post.url} className="block">
              {/* Image Section */}
              <motion.div 
                className="relative h-48 bg-gray-100 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {post.featured_image_url ? (
                  <Image 
                    src={post.featured_image_url} 
                    alt={post.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                {/* View Count */}
                <motion.div 
                  className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Eye className="w-3 h-3" />
                  <span>{Math.floor(Math.random() * 400) + 50}</span>
                </motion.div>
              </motion.div>

              {/* Content Section */}
              <div className="p-5">
                {/* Title */}
                <motion.h3 
                  className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-yellow-800 transition-colors duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 + 0.2 }}
                >
                  {post.title}
                </motion.h3>
                
                {/* Description */}
                <motion.p 
                  className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.08 + 0.3 }}
                >
                  {post.excerpt || "Transform how you communicate with a system designed to reach everyone, every time. Post your company-wide..."}
                </motion.p>

                {/* Author and Meta Info */}
                <motion.div 
                  className="flex items-center justify-between text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.08 + 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    {/* Author Avatar */}
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      S
                    </div>
                    <span className="font-medium text-gray-700">Sikupi</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.read_time_minutes || 1} min
                    </span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* More Articles CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: posts.length * 0.15 + 0.3 }}
        className="text-center mt-12"
      >
        <Link
          href="/magazine"
          className="inline-flex items-center gap-2 bg-yellow-700 hover:bg-yellow-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <span>Lihat Semua Artikel</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Decorative Elements */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.05 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-radial from-yellow-400 to-transparent rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.03 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-radial from-amber-400 to-transparent rounded-full blur-3xl pointer-events-none"
        />
      </div>
    </motion.section>
  )
}