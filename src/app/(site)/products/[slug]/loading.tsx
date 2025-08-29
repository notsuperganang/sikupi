export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Breadcrumbs Skeleton */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-stone-200 rounded w-16 animate-pulse"></div>
            <span className="text-stone-400">›</span>
            <div className="h-4 bg-stone-200 rounded w-20 animate-pulse"></div>
            <span className="text-stone-400">›</span>
            <div className="h-4 bg-stone-200 rounded w-24 animate-pulse"></div>
            <span className="text-stone-400">›</span>
            <div className="h-4 bg-stone-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Skeleton */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-stone-200 rounded-lg animate-pulse mb-4"></div>
            
            {/* Thumbnails */}
            <div className="flex space-x-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-16 h-16 bg-stone-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* BuyBox Skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 bg-stone-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-stone-200 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="w-4 h-4 bg-stone-200 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="h-4 bg-stone-200 rounded w-20 animate-pulse"></div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="h-8 bg-stone-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-stone-200 rounded w-1/4 animate-pulse"></div>
            </div>

            {/* Stock */}
            <div className="h-4 bg-stone-200 rounded w-1/3 animate-pulse"></div>

            {/* Quantity */}
            <div className="space-y-2">
              <div className="h-4 bg-stone-200 rounded w-16 animate-pulse"></div>
              <div className="h-10 bg-stone-200 rounded w-32 animate-pulse"></div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <div className="h-12 bg-stone-200 rounded animate-pulse"></div>
              <div className="h-12 bg-stone-200 rounded animate-pulse"></div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="h-4 bg-stone-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-stone-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="mt-12 space-y-6">
          <div className="h-6 bg-stone-200 rounded w-48 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-stone-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-stone-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-stone-200 rounded w-4/5 animate-pulse"></div>
          </div>
        </div>

        {/* Reviews Skeleton */}
        <div className="mt-12 space-y-6">
          <div className="h-6 bg-stone-200 rounded w-32 animate-pulse"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-stone-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <div key={starIndex} className="w-4 h-4 bg-stone-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-4 bg-stone-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}