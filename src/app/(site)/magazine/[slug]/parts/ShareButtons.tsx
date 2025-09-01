'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check, MessageCircle, Facebook, Twitter, Linkedin } from 'lucide-react'

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

interface ShareButtonsProps {
  post: MagazinePost
}

export default function ShareButtons({ post }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${post.title} - ${post.excerpt || post.summary || ''}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-800 hover:bg-blue-900',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
  ]

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
        setShowShareOptions(true)
      }
    } else {
      setShowShareOptions(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-8"
    >
      <Card className="border-yellow-800/20 bg-gradient-to-r from-yellow-50 to-amber-50 p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5 text-yellow-700" />
            Bagikan Artikel Ini
          </h3>
          
          <p className="text-gray-600 text-sm">
            Bantu teman-teman Anda untuk membaca artikel yang bermanfaat ini
          </p>

          {/* Main Share Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleNativeShare}
              className="bg-yellow-700 hover:bg-yellow-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </Button>

            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="border-yellow-700 text-yellow-700 hover:bg-yellow-50 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : 'Salin Link'}
            </Button>
          </div>

          {/* Social Media Options */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: showShareOptions ? 1 : 0, 
              height: showShareOptions ? 'auto' : 0 
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-yellow-800/20">
              <p className="text-sm text-gray-600 mb-3">Atau bagikan melalui:</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {shareOptions.map((option, index) => (
                  <motion.button
                    key={option.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    onClick={() => handleShare(option.url)}
                    className={`
                      ${option.color} text-white px-4 py-2 rounded-lg 
                      flex items-center gap-2 text-sm font-medium
                      transition-all duration-200 hover:scale-105 shadow-sm
                    `}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Show Options Button */}
          {!showShareOptions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareOptions(true)}
              className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100/50"
            >
              Opsi lainnya
            </Button>
          )}

          {/* Article Stats */}
          <div className="pt-4 border-t border-yellow-800/20">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
              <span>📖 {post.view_count} pembaca</span>
              <span>⏱️ {post.read_time_minutes} menit baca</span>
              <span>🏷️ {post.tags.length} tags</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}