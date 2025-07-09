"use client";

import { useState } from "react";
import { ProductList } from "@/components/products/product-list";
import { EnhancedProductFilter } from "@/components/products/enhanced-product-filter";
import { ProductSort } from "@/components/products/product-sort";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Filter, 
  Grid3X3, 
  List,
  Search
} from "lucide-react";
import { useProducts, useProductCategories } from "@/lib/hooks/use-products";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductFilters } from "@/lib/types/product";

const getValidSortBy = (value: string | null): ProductFilters['sortBy'] => {
  const validSortOptions: Array<NonNullable<ProductFilters['sortBy']>> = [
    "newest", "oldest", "price_low", "price_high", "rating", "popular"
  ];
  if (value && validSortOptions.includes(value as any)) {
    return value as NonNullable<ProductFilters['sortBy']>;
  }
  return "newest";
};

export function SellerProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sortBy: getValidSortBy(searchParams.get("sortBy")),
    page: parseInt(searchParams.get("page") || "1"),
    limit: 12,
  });
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  const { data: productsData, isLoading, error } = useProducts(filters);
  const { data: categoriesData } = useProductCategories();

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;
  const categories = categoriesData?.wasteTypes || [];

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value.toString());
      }
    });
    router.push(`/dashboard/produk?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ search: searchQuery });
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/dashboard/produk?${params.toString()}`);
  };

  const handleSortChange = (sortBy: string) => {
    const validSortBy = getValidSortBy(sortBy);
    handleFilterChange({ sortBy: validSortBy });
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Produk Anda
          </h1>
          <p className="text-gray-600">
            Lihat, tambah, atau edit produk ampas kopi yang Anda jual.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari produk Anda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Cari</Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-80 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter Produk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedProductFilter
                  filters={filters}
                  categories={categories}
                  onFilterChange={handleFilterChange}
                />
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600">
                {pagination?.totalItems || 0} produk ditemukan
              </span>
              <div className="flex items-center gap-2">
                <ProductSort
                  sortBy={filters.sortBy}
                  onSortChange={handleSortChange}
                />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center border rounded-lg p-1">
                  <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* DIUBAH: Menambahkan variant="seller" */}
            <ProductList
              products={products}
              isLoading={isLoading}
              error={error}
              variant="seller" 
              className={viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPreviousPage}>
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Halaman {pagination.currentPage} dari {pagination.totalPages}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNextPage}>
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
  );
}
