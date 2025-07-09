// FILE PATH: /src/components/common/loading-skeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "product-grid" | "product-card" | "text" | "avatar" | "dashboard" | "table" | "product-detail";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ 
  variant = "card", 
  count = 1,
  className 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "product-card":
        return (
          <Card className="overflow-hidden">
            <div className="relative">
              {/* Image skeleton */}
              <Skeleton className="h-48 sm:h-56 w-full" />
              
              {/* Badge skeletons */}
              <div className="absolute top-2 left-2">
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              {/* Grade and category */}
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              
              {/* Price */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              
              {/* Seller info */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
              
              {/* Stock info */}
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              
              {/* Button */}
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        );

      case "product-grid":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }, (_, i) => (
              <LoadingSkeleton key={i} variant="product-card" />
            ))}
          </div>
        );

      case "product-detail":
        return (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-lg w-full" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md" />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and badges */}
              <div>
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-10 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Seller info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardContent>
              </Card>

              {/* Quantity and actions */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10" />
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-10" />
                    </div>
                    <Skeleton className="h-4 w-32 mt-1" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                    <Skeleton className="w-6 h-6 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "table":
        return (
          <div className="space-y-4">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 p-4 border-b">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            {/* Table rows */}
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        );

      case "list":
        return (
          <div className="space-y-4">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        );

      case "card":
        return (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        );

      case "text":
        return (
          <div className="space-y-2">
            {Array.from({ length: count }, (_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        );

      case "avatar":
        return <Skeleton className="h-10 w-10 rounded-full" />;

      case "dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return <Skeleton className="h-20 w-full" />;
    }
  };

  if (variant === "product-grid" || variant === "product-detail" || variant === "table" || variant === "dashboard") {
    return <div className={className}>{renderSkeleton()}</div>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}