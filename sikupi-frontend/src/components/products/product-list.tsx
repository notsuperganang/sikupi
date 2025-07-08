import { useEffect, useState } from "react";
import { ProductCard } from "./product-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useProductStore, type Product, type ProductFilters, type ProductSort } from "@/stores/product-store";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ProductListProps {
  filters?: ProductFilters;
  sort?: ProductSort;
  limit?: number;
  variant?: "default" | "compact" | "featured";
  showLoadMore?: boolean;
  showHeader?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export function ProductList({
  filters = {},
  sort = { field: "newest", direction: "desc" },
  limit = 12,
  variant = "default",
  showLoadMore = true,
  showHeader = true,
  title,
  description,
  className,
}: ProductListProps) {
  const {
    products,
    isLoading,
    error,
    hasMore,
    currentPage,
    fetchProducts,
    setError,
  } = useProductStore();

  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    // Only fetch if we don't have products or filters/sort changed
    if (products.length === 0 || JSON.stringify(filters) !== "{}") {
      fetchProducts(1, filters, sort);
    }
  }, [fetchProducts, filters, sort]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return;
    
    setLocalLoading(true);
    try {
      await fetchProducts(currentPage + 1, filters, sort);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchProducts(1, filters, sort);
  };

  const getGridCols = () => {
    switch (variant) {
      case "compact":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "featured":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Terjadi Kesalahan</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {error}
        </p>
        <Button onClick={handleRetry} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (title || description) && (
        <div className="mb-8 text-center">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Loading state for initial load */}
      {isLoading && products.length === 0 ? (
        <LoadingSkeleton variant="product-grid" count={limit} />
      ) : (
        <>
          {/* Products Grid */}
          {products.length > 0 ? (
            <div className={`grid gap-6 ${getGridCols()}`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant={variant}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-6 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Produk</h3>
              <p className="text-muted-foreground max-w-md">
                Belum ada produk yang sesuai dengan kriteria pencarian Anda. 
                Coba ubah filter atau kata kunci pencarian.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {showLoadMore && hasMore && products.length > 0 && (
            <div className="text-center mt-8">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                disabled={localLoading}
                className="min-w-32"
              >
                {localLoading ? "Memuat..." : "Muat Lebih Banyak"}
              </Button>
            </div>
          )}

          {/* Loading more indicator */}
          {localLoading && (
            <div className="mt-6">
              <LoadingSkeleton variant="product-grid" count={4} />
            </div>
          )}
        </>
      )}
    </div>
  );
}