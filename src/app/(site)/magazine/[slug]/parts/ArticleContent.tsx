'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import MarkdownRenderer from '@/components/ui/markdown-renderer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Images } from 'lucide-react'

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

interface ArticleContentProps {
  post: MagazinePost
}

export default function ArticleContent({ post }: ArticleContentProps) {
  const [showGallery, setShowGallery] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={contentRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-8"
    >

      {/* Gallery Images */}
      {post.gallery_images && post.gallery_images.length > 0 && (
        <Card className="border-yellow-800/20 overflow-hidden">
          <div className="p-4 border-b border-yellow-800/10 bg-gradient-to-r from-yellow-50 to-amber-50">
            <Button
              variant="ghost"
              onClick={() => setShowGallery(!showGallery)}
              className="w-full flex items-center justify-between gap-2 hover:bg-yellow-100/50"
            >
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-yellow-700" />
                <span className="font-medium text-gray-900">
                  Galeri Gambar ({post.gallery_images.length})
                </span>
              </div>
              {showGallery ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </div>
          
          <motion.div
            initial={false}
            animate={{ height: showGallery ? 'auto' : 0, opacity: showGallery ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.gallery_images.map((image, index) => (
                <motion.div
                  key={image}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: showGallery ? 1 : 0, scale: showGallery ? 1 : 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer"
                >
                  <Image
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Card>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <MarkdownRenderer 
          content={post.content_md}
          className="text-lg leading-relaxed"
        />
      </motion.div>

      {/* Article Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="border-yellow-800/20 bg-gradient-to-r from-yellow-50 to-amber-50 p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Terima kasih telah membaca!
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Artikel ini dibuat untuk memberikan wawasan tentang dunia kopi dan keberlanjutan. 
              Bagikan pengalaman Anda dengan menggunakan tombol berbagi di bawah ini.
            </p>
            
            {/* Reading Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 pt-4 border-t border-yellow-800/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <span>{post.read_time_minutes} menit waktu baca</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>{post.content_md.split(' ').length} kata</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>{post.view_count} kali dibaca</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}