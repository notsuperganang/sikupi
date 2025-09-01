"use client";
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Calendar, Eye, User, Clock, ImageIcon } from 'lucide-react'

interface MagazinePostSummary {
  id: string
  title: string
  slug: string
  summary?: string
  excerpt?: string
  content_md?: string
  featured_image_url?: string
  gallery_images?: string[]
  tags: string[]
  view_count: number
  read_time_minutes: number
  author_name?: string
  author_id?: string
  created_at: string
  updated_at?: string
  published?: boolean
  meta_description?: string
  url: string
}

interface Props {
  initialPosts: MagazinePostSummary[]
}

const tagPalette = [
  'bg-yellow-800/90 text-yellow-50',
  'bg-orange-900/90 text-orange-50',
  'bg-stone-800/80 text-stone-50',
  'bg-red-900/90 text-red-50',
  'bg-emerald-700/80 text-emerald-50'
]

export default function MagazineClient({ initialPosts }: Props) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'views'>('newest')

  // Add some variative mock data for richer display
  const enrichedPosts = useMemo(() => {
    return initialPosts.map((post, idx) => {
      // Use deterministic values based on post ID and index to avoid hydration mismatch
      // Convert ID to string to handle both string and number IDs
      const idString = String(post.id);
      const idHash = idString.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const deterministicViewCount = Math.abs(idHash % 450) + 50; // Range: 50-499
      
      return {
        ...post,
        author_name: post.author_name || ['Dr. Sari Kopi', 'Ahmad Barista', 'Maya Roaster', 'Budi Farmer', 'Lisa Sustainability'][idx % 5],
        view_count: post.view_count || deterministicViewCount,
        gallery_images: post.gallery_images || ['/image-asset/coffee-seed.jpg', '/image-asset/coffee-grounds-others.jpg'],
        updated_at: post.updated_at || post.created_at,
      }
    })
  }, [initialPosts])

  const filtered = useMemo(() => {
    let list = [...enrichedPosts]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.summary||'').toLowerCase().includes(q))
    }
    // Tag filtering removed per design simplification
    list.sort((a,b)=>{
      if (sort==='views') return (b.view_count||0)-(a.view_count||0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return list
  }, [enrichedPosts, search, sort])

  return (
    <section className="relative z-10 container mx-auto px-4 pt-8 pb-24">
      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-12"
      >
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Extended Search Bar */}
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.01 }}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Cari artikel berdasarkan judul atau konten..."
              className="w-full bg-white/90 backdrop-blur-sm border-stone-300/70 focus-visible:ring-yellow-800/40 focus-visible:border-yellow-900 text-sm shadow-sm h-11 px-4"
            />
          </motion.div>
          
          {/* Filter on the Right */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Select value={sort} onValueChange={(v)=>setSort(v as any)}>
              <SelectTrigger className="w-[160px] bg-white/90 backdrop-blur-sm border-stone-300/70 focus-visible:ring-yellow-800/40 shadow-sm h-11">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-stone-200">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Terbaru</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="views">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>Paling Dibaca</span>
                    </div>
                  </SelectItem>
                </motion.div>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Grid */}
      <motion.div
        layout
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((post, idx) => (
            <motion.div
              layout
              key={post.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ 
                duration: 0.5, 
                delay: idx * 0.08, 
                ease: [0.25, 0.46, 0.45, 0.94] 
              }}
              whileHover={{ 
                y: -4, 
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white rounded-2xl border-2 border-yellow-800/40 hover:border-yellow-900/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Link href={`/magazine/${post.slug}`} className="block">
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

                  {/* Tag Badge */}
                  {post.tags?.length > 0 && (
                    <motion.div 
                      className="absolute top-3 left-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.2 }}
                    >
                      <span className="inline-flex items-center gap-1 bg-yellow-800 text-white text-xs font-medium px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        {post.tags[0]}
                      </span>
                    </motion.div>
                  )}

                  {/* View Count */}
                  <motion.div 
                    className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{post.view_count}</span>
                  </motion.div>
                </motion.div>

                {/* Content Section */}
                <div className="p-5">
                  {/* Title */}
                  <motion.h3 
                    className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-yellow-800 transition-colors duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 + 0.2 }}
                  >
                    {post.title}
                  </motion.h3>
                  
                  {/* Description */}
                  <motion.p 
                    className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.08 + 0.3 }}
                  >
                    {post.summary || post.excerpt || post.meta_description || "Transform how you communicate with a system designed to reach everyone, every time. Post your company-wide..."}
                  </motion.p>

                  {/* Author and Meta Info */}
                  <motion.div 
                    className="flex items-center justify-between text-xs text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.08 + 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      {/* Author Avatar */}
                      <div className="w-6 h-6 bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <span className="font-medium text-gray-700">{post.author_name || 'Sikupi'}</span>
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
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center py-24 text-stone-600"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Tidak ada artikel yang cocok.
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
