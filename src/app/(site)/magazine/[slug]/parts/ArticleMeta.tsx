'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Eye, MapPin, Award, Coffee, Heart, MessageCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

interface ArticleMetaProps {
  post: MagazinePost
}

interface AuthorSocial {
  twitter?: string
  linkedin?: string
  instagram?: string
}

interface AuthorData {
  title: string
  bio: string
  location: string
  expertise: string[]
  articlesCount: number
  followers: number
  social: AuthorSocial
  verified: boolean
}

// Rich mock author data based on post author name
const getEnrichedAuthorData = (authorName: string): AuthorData => {
  const authors: Record<string, AuthorData> = {
    'Dr. Sari Kopi': {
      title: 'Coffee Research Specialist',
      bio: 'Pakar penelitian kopi dengan 15+ tahun pengalaman di industri kopi berkelanjutan',
      location: 'Bandung, Indonesia',
      expertise: ['Sustainable Coffee', 'Processing Methods', 'Quality Control'],
      articlesCount: 47,
      followers: 12500,
      social: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        instagram: 'https://instagram.com'
      },
      verified: true
    },
    'Ahmad Barista': {
      title: 'Professional Barista & Educator',
      bio: 'Barista bersertifikat internasional dan pengajar di berbagai coffee academy',
      location: 'Jakarta, Indonesia',
      expertise: ['Brewing Techniques', 'Latte Art', 'Coffee Education'],
      articlesCount: 23,
      followers: 8900,
      social: {
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com'
      },
      verified: false
    },
    'Maya Roaster': {
      title: 'Master Coffee Roaster',
      bio: 'Roaster profesional dengan passion untuk menghadirkan profil rasa terbaik',
      location: 'Yogyakarta, Indonesia',
      expertise: ['Coffee Roasting', 'Flavor Profiling', 'Bean Selection'],
      articlesCount: 31,
      followers: 15200,
      social: {
        linkedin: 'https://linkedin.com',
        instagram: 'https://instagram.com'
      },
      verified: true
    },
    'Budi Farmer': {
      title: 'Coffee Farmer & Sustainability Advocate',
      bio: 'Petani kopi generasi ketiga yang fokus pada praktik pertanian berkelanjutan',
      location: 'Toraja, Sulawesi',
      expertise: ['Coffee Farming', 'Sustainability', 'Fair Trade'],
      articlesCount: 18,
      followers: 5600,
      social: {
        instagram: 'https://instagram.com'
      },
      verified: false
    },
    'Lisa Sustainability': {
      title: 'Environmental Impact Researcher',
      bio: 'Peneliti dampak lingkungan dengan fokus pada rantai supply kopi berkelanjutan',
      location: 'Medan, Indonesia',
      expertise: ['Environmental Impact', 'Supply Chain', 'Carbon Footprint'],
      articlesCount: 29,
      followers: 9800,
      social: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      },
      verified: true
    }
  }
  
  return authors[authorName] || {
    title: 'Kontributor Sikupi',
    bio: 'Kontributor artikel yang berpengalaman di dunia kopi Indonesia',
    location: 'Indonesia',
    expertise: ['Coffee Knowledge'],
    articlesCount: Math.floor(Math.random() * 20) + 5,
    followers: Math.floor(Math.random() * 5000) + 1000,
    social: {
      instagram: 'https://instagram.com'
    },
    verified: false
  }
}

export default function ArticleMeta({ post }: ArticleMetaProps) {
  const authorData = getEnrichedAuthorData(post.author_name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <Card className="border-yellow-800/20 bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg">
        {/* Main Author Section */}
        <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 p-6 border-b border-yellow-800/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-6"
          >
            {/* Author Profile */}
            <div className="flex items-start gap-4">
              {/* Enhanced Avatar */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {post.author_name.charAt(0).toUpperCase()}
                </div>
                {authorData.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 shadow-sm">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{post.author_name}</h3>
                  {authorData.verified && (
                    <Award className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-yellow-800 font-medium text-sm mb-2">{authorData.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-3 max-w-md">{authorData.bio}</p>
                
                {/* Location & Stats */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{authorData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coffee className="w-3 h-3" />
                    <span>{authorData.articlesCount} artikel</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{authorData.followers.toLocaleString()} followers</span>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="flex items-center gap-2">
                  {authorData.social.twitter && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                      onClick={() => window.open(authorData.social.twitter, '_blank')}
                    >
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </Button>
                  )}
                  {authorData.social.linkedin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 border-gray-300 hover:bg-blue-50 hover:border-blue-600"
                      onClick={() => window.open(authorData.social.linkedin, '_blank')}
                    >
                      <svg className="w-3.5 h-3.5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </Button>
                  )}
                  {authorData.social.instagram && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 border-gray-300 hover:bg-pink-50 hover:border-pink-400"
                      onClick={() => window.open(authorData.social.instagram, '_blank')}
                    >
                      <svg className="w-3.5 h-3.5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C8.396 0 7.989.016 6.756.072 5.526.127 4.704.333 3.999.63c-.723.31-1.336.686-1.945 1.293C1.347 2.53.97 3.143.66 3.866c-.297.705-.503 1.527-.558 2.757C.044 7.875 0 8.284 0 12.017s.044 4.142.072 5.375c.055 1.23.261 2.052.558 2.757.31.723.686 1.336 1.293 1.945.607.607 1.22.983 1.943 1.293.705.297 1.527.503 2.757.558 1.233.056 1.642.072 5.375.072s4.142-.044 5.375-.072c1.23-.055 2.052-.261 2.757-.558.723-.31 1.336-.686 1.945-1.293.607-.607.983-1.22 1.293-1.943.297-.705.503-1.527.558-2.757.056-1.233.072-1.642.072-5.375s-.044-4.142-.072-5.375c-.055-1.23-.261-2.052-.558-2.757-.31-.723-.686-1.336-1.293-1.945C19.47 1.347 18.857.97 18.134.66c-.705-.297-1.527-.503-2.757-.558C14.142.044 13.733 0 12.017 0zm0 2.162c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.415.56.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.413 2.227-.217.56-.477.96-.896 1.382-.419.419-.819.679-1.381.896-.422.164-1.057.36-2.227.413-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.413-.56-.217-.96-.477-1.382-.896-.419-.419-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.413-2.227.217-.56.477-.96.896-1.382.419-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.058 1.646-.07 4.85-.07zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12.017 16c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.162-10.338c-.796 0-1.441-.645-1.441-1.441s.645-1.441 1.441-1.441 1.441.645 1.441 1.441-.645 1.441-1.441 1.441z"/>
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex-shrink-0">
              <p className="text-xs font-semibold text-gray-700 mb-2">Keahlian:</p>
              <div className="flex flex-wrap gap-1">
                {authorData.expertise.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="bg-yellow-100 text-yellow-800 text-xs border-yellow-300 hover:bg-yellow-200 transition-colors"
                    >
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Article Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Article Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-700" />
                Statistik Artikel
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dibaca</span>
                  <span className="font-medium text-gray-900">{post.view_count.toLocaleString()}x</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Waktu Baca</span>
                  <span className="font-medium text-gray-900">{post.read_time_minutes} menit</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dipublikasi</span>
                  <span className="font-medium text-gray-900">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </motion.div>

            {/* Engagement */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-yellow-700" />
                Engagement
              </h4>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start h-8 text-xs hover:bg-red-50 hover:border-red-300"
                >
                  <Heart className="w-3 h-3 mr-2 text-red-500" />
                  {Math.floor(post.view_count * 0.08)} likes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start h-8 text-xs hover:bg-blue-50 hover:border-blue-300"
                >
                  <MessageCircle className="w-3 h-3 mr-2 text-blue-500" />
                  {Math.floor(post.view_count * 0.03)} komentar
                </Button>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="border-yellow-700/30 text-yellow-800 hover:bg-yellow-50 transition-colors duration-200 cursor-pointer text-xs"
                    >
                      #{tag}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Update Info */}
          {post.updated_at && post.updated_at !== post.created_at && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 pt-4 border-t border-yellow-800/10"
            >
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Terakhir diperbarui: {formatDate(post.updated_at)}
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}