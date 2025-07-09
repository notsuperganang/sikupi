// FILE: src/components/products/product-list-page.tsx (Fixed)
"use client";

import { useState } from "react";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Container } from "@/components/common/container";
import { ProductList } from "./product-list";
import { EnhancedProductFilter } from "./enhanced-product-filter";
import { ProductSort } from "./product-sort";
import { useProducts, useProductCategories } from "@/lib/hooks/use-products";
import type { ProductFilters } from "@/lib/types/product";

// Helper function to validate sortBy parameter
const getValidSortBy = (value: string): ProductFilters['sortBy'] => {
  const validSortOptions: Array<NonNullable<ProductFilters['sortBy']>> = [
    "newest", 
    "oldest", 
    "price_low", 
    "price_high", 
    "rating", 
    "popular"
  ];
  
  if (validSortOptions.includes(value as any)) {
    return value as NonNullable<ProductFilters['sortBy']>;
  }
  return "newest"; // default fallback
};

export function ProductListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    sortBy: "newest",
  });

  // Get products data using the hook
  const { data: productsData, isLoading, error } = useProducts(filters);
  const { data: categoriesData } = useProductCategories();

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;
  const categories = categoriesData?.wasteTypes || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
    } else {
      setFilters(prev => ({ ...prev, search: undefined, page: 1 }));
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If search is cleared, remove search filter
    if (!value.trim()) {
      setFilters(prev => ({ ...prev, search: undefined, page: 1 }));
    }
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Fixed handler dengan validasi
  const handleSortChange = (sortBy: string) => {
    const validSortBy = getValidSortBy(sortBy);
    setFilters(prev => ({ ...prev, sortBy: validSortBy, page: 1 }));
  };

  return (
    <div className="py-8">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Produk Ampas Kopi
              </h1>
              <p className="text-muted-foreground">
                Temukan berbagai produk ampas kopi berkualitas untuk kebutuhan Anda
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Cari produk ampas kopi..."
                  className="pl-10 pr-4"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Filters and Sort Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filter Produk</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <EnhancedProductFilter
                    filters={filters}
                    categories={categories}
                    onFilterChange={(newFilters) => {
                      handleFilterChange(newFilters);
                      setShowFilters(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
            </Button>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {!isLoading && (
                <span>
                  {pagination?.totalItems || 0} produk ditemukan
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <ProductSort
              sortBy={filters.sortBy}
              onSortChange={handleSortChange}
            />

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filter */}
          {showFilters && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-4">Filter Produk</h3>
                  <EnhancedProductFilter
                    filters={filters}
                    categories={categories}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Product List */}
          <div className="flex-1">
            <ProductList
              products={products}
              isLoading={isLoading}
              error={error}
              className={viewMode === "list" ? "grid-cols-1 md:grid-cols-2" : ""}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange({ page: pagination.currentPage - 1 })}
                    disabled={!pagination.hasPreviousPage || isLoading}
                  >
                    Sebelumnya
                  </Button>
                  
                  <span className="text-sm text-muted-foreground px-4">
                    Halaman {pagination.currentPage} dari {pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange({ page: pagination.currentPage + 1 })}
                    disabled={!pagination.hasNextPage || isLoading}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}