import { cn } from '@/lib/utils'

interface ProductSkeletonProps {
  className?: string
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-transparent">
        <div className="relative">
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
          
          {/* Badge skeleton */}
          <div className="absolute top-2 left-2 bg-gray-200 dark:bg-gray-700 rounded-full w-20 h-5" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Title skeleton */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-5 w-3/4" />
          
          {/* Coffee attributes skeleton (for ampas_kopi) */}
          <div className="flex gap-1.5">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 w-16" />
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 w-14" />
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 w-12" />
          </div>
          
          {/* Price skeleton */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-6 w-24" />
          
          {/* Rating and stock skeleton */}
          <div className="flex items-center justify-between">
            <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-20" />
            <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProductGridSkeletonProps {
  count?: number
  className?: string
}

export function ProductGridSkeleton({ count = 12, className }: ProductGridSkeletonProps) {
  return (
    <div className={cn(
      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

interface ProductListSkeletonProps {
  count?: number
  className?: string
}

export function ProductListSkeleton({ count = 8, className }: ProductListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              {/* Image skeleton */}
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
              
              <div className="flex-1 space-y-2">
                {/* Title skeleton */}
                <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4" />
                
                {/* Description skeleton */}
                <div className="bg-gray-200 dark:bg-gray-700 rounded h-3 w-full" />
                <div className="bg-gray-200 dark:bg-gray-700 rounded h-3 w-2/3" />
                
                {/* Price and rating skeleton */}
                <div className="flex items-center justify-between pt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded h-5 w-20" />
                  <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Filter sidebar skeleton
export function FilterSidebarSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search skeleton */}
      <div className="space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-16" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-10 w-full" />
      </div>
      
      {/* Filter sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 3 + (i % 2) }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="bg-gray-200 dark:bg-gray-700 rounded w-4 h-4" />
                <div className="bg-gray-200 dark:bg-gray-700 rounded h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Price range skeleton */}
      <div className="space-y-3">
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-20" />
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-10" />
          <div className="bg-gray-200 dark:bg-gray-700 rounded h-10" />
        </div>
      </div>
    </div>
  )
}

// Product stats skeleton
export function ProductStatsSkeleton() {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 rounded h-5 w-32" />
      <div className="bg-gray-200 dark:bg-gray-700 rounded h-8 w-24" />
    </div>
  )
}