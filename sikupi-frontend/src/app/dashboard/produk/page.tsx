"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductList } from "@/components/products/product-list";
import { EnhancedProductFilter } from "@/components/products/enhanced-product-filter";
import { ProductSort } from "@/components/products/product-sort";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Filter, 
  SlidersHorizontal, 
  Grid3X3, 
  List,
  Search
} from "lucide-react";
import { useProducts, useProductCategories } from "@/lib/hooks/use-products";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductFilters } from "@/lib/types/product";

// Helper function to validate sortBy parameter
const getValidSortBy = (value: string | null): ProductFilters['sortBy'] => {
  const validSortOptions: Array<NonNullable<ProductFilters['sortBy']>> = [
    "newest", 
    "oldest", 
    "price_low", 
    "price_high", 
    "rating", 
    "popular"
  ];
  
  if (value && validSortOptions.includes(value as any)) {
    return value as NonNullable<ProductFilters['sortBy']>;
  }
  return "newest"; // default fallback
};

export default function ProductsPage() {
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  const { data: productsData, isLoading, error } = useProducts(filters);
  const { data: categoriesData } = useProductCategories();

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;
  const categories = categoriesData?.wasteTypes || [];

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value.toString());
      }
    });
    router.push(`/produk?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ search: searchQuery });
  };

  const handlePageChange = (page: number) => {
    handleFilterChange({ page });
  };

  // Handler untuk sort change dengan validasi
  const handleSortChange = (sortBy: string) => {
    const validSortBy = getValidSortBy(sortBy);
    handleFilterChange({ sortBy: validSortBy });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Produk Ampas Kopi
          </h1>
          <p className="text-gray-600">
            Temukan berbagai produk limbah kopi berkualitas tinggi dari petani terpercaya
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari produk ampas kopi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                Cari
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Filters & Controls */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
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

            {/* Active Filters */}
            {(filters.search || filters.category || filters.wasteType) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Filter Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Pencarian: {filters.search}
                        <button
                          onClick={() => handleFilterChange({ search: "" })}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Kategori: {filters.category}
                        <button
                          onClick={() => handleFilterChange({ category: "" })}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {pagination?.totalItems || 0} produk ditemukan
                </span>
                {pagination && pagination.totalPages > 1 && (
                  <span className="text-sm text-gray-500">
                    Halaman {pagination.currentPage} dari {pagination.totalPages}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Sort - dengan handler yang sudah divalidasi */}
                <ProductSort
                  sortBy={filters.sortBy}
                  onSortChange={handleSortChange}
                />
                
                <Separator orientation="vertical" className="h-6" />
                
                {/* View Mode */}
                <div className="flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            <ProductList
              products={products}
              isLoading={isLoading}
              error={error}
              className={viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                  >
                    Sebelumnya
                  </Button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}