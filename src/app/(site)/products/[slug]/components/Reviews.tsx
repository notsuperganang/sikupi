'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getStarStates, formatRating } from '@/lib/rating'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ProductDetail } from '../page'

interface ReviewsProps {
  product: ProductDetail
}

interface Review {
  id: number
  rating: number
  comment: string | null
  buyer_name: string
  created_at: string
  is_verified: boolean
}

interface ReviewStats {
  total_reviews: number
  avg_rating: number
  rating_breakdown: Record<number, number>
}

interface ReviewsData {
  reviews: Review[]
  stats: ReviewStats
  pagination: {
    current_page: number
    per_page: number
    total_items: number
    total_pages: number
    has_next_page: boolean
    has_prev_page: boolean
  }
}

export default function Reviews({ product }: ReviewsProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest')

  const fetchReviews = async (page = 1, rating_filter?: number, sort = 'newest') => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort: sort,
      })

      if (rating_filter) {
        params.append('rating_filter', rating_filter.toString())
      }

      const response = await fetch(`/api/products/${product.id}/reviews?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      
      if (data.success) {
        setReviewsData(data.data)
      } else {
        throw new Error(data.error || 'Failed to load reviews')
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews(currentPage, selectedRatingFilter || undefined, sortBy)
  }, [product.id, currentPage, selectedRatingFilter, sortBy])

  const handleRatingFilter = (rating: number | null) => {
    setSelectedRatingFilter(rating)
    setCurrentPage(1)
  }

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="h-6 bg-stone-200 rounded w-32 animate-pulse"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <div key={starIndex} className="w-4 h-4 bg-stone-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-4 bg-stone-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-4 bg-stone-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">Gagal Memuat Ulasan</h3>
          <p className="text-stone-600 mb-4">{error}</p>
          <Button onClick={() => fetchReviews()} variant="outline">
            Coba Lagi
          </Button>
        </div>
      </Card>
    )
  }

  const stats = reviewsData?.stats
  const reviews = reviewsData?.reviews || []
  const pagination = reviewsData?.pagination

  if (!stats || stats.total_reviews === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">Belum Ada Ulasan</h3>
          <p className="text-stone-600">
            Jadilah yang pertama memberikan ulasan untuk produk ini!
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">
            Ulasan ({stats.total_reviews})
          </h2>
        </div>

        {/* Rating Summary */}
        <div className="bg-stone-50 rounded-lg p-4">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {formatRating(stats.avg_rating)}
              </div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                {getStarStates(stats.avg_rating).map((state, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "w-4 h-4",
                      state === 'full' ? "fill-amber-400 text-amber-400" : 
                      state === 'half' ? "fill-amber-400 text-amber-400" : "text-stone-300"
                    )}
                  />
                ))}
              </div>
              <div className="text-sm text-stone-600 mt-1">
                {stats.total_reviews} ulasan
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_breakdown[rating] || 0
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0
                
                return (
                  <button
                    key={rating}
                    className="flex items-center space-x-2 w-full hover:bg-white rounded p-1 transition-colors"
                    onClick={() => handleRatingFilter(selectedRatingFilter === rating ? null : rating)}
                  >
                    <div className="flex items-center space-x-1 text-sm w-12">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{rating}</span>
                    </div>
                    <div className="flex-1 bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-stone-600 w-8">
                      {count}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedRatingFilter && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{selectedRatingFilter} bintang</span>
                <button
                  onClick={() => handleRatingFilter(null)}
                  className="ml-1 hover:text-stone-700"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-stone-600">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="text-sm border border-stone-300 rounded px-2 py-1 bg-white"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="rating_high">Rating Tertinggi</option>
              <option value="rating_low">Rating Terendah</option>
            </select>
          </div>
        </div>

        <Separator />

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-stone-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {getStarStates(review.rating).map((state, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "w-4 h-4",
                          state === 'full' ? "fill-amber-400 text-amber-400" : "text-stone-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-stone-900">{review.buyer_name}</span>
                  {review.is_verified && (
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-stone-500">
                  {formatDate(review.created_at)}
                </span>
              </div>

              {review.comment && (
                <p className="text-stone-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.has_prev_page}
            >
              Sebelumnya
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, index) => {
                const page = index + 1
                return (
                  <Button
                    key={page}
                    variant={page === pagination.current_page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              })}
              
              {pagination.total_pages > 5 && (
                <>
                  <span className="text-stone-500">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.total_pages)}
                    className="w-8 h-8 p-0"
                  >
                    {pagination.total_pages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.has_next_page}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}