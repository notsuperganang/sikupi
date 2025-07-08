import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "product-grid" | "product-card" | "text" | "avatar" | "dashboard";
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

  if (variant === "product-grid") {
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