// FILE PATH: /src/components/products/enhanced-product-filter.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  MapPin, 
  DollarSign,
  Star,
  Calendar,
  Package,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProductStore, type ProductFilters, type ProductSort } from "@/stores/product-store";
import { useDebouncedSearch } from "@/lib/hooks/use-products";
import { PRODUCT_CATEGORIES, COFFEE_GRADES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface EnhancedProductFilterProps {
  onFilterChange?: (filters: ProductFilters) => void;
  onSortChange?: (sort: ProductSort) => void;
  defaultFilters?: ProductFilters;
  defaultSort?: ProductSort;
  showAdvanced?: boolean;
  className?: string;
}

export function EnhancedProductFilter({
  onFilterChange,
  onSortChange,
  defaultFilters = {},
  defaultSort = { field: "newest", direction: "desc" },
  showAdvanced = true,
  className,
}: EnhancedProductFilterProps) {
  const [searchQuery, setSearchQuery] = useState(defaultFilters.search || "");
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [sort, setSort] = useState<ProductSort>(defaultSort);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([
    defaultFilters.priceMin || 0,
    defaultFilters.priceMax || 1000000
  ]);

  // Debounced search
  const { data: searchResults, isLoading: isSearching } = useDebouncedSearch(
    searchQuery,
    { ...filters, search: undefined }, // Exclude search from other filters
    300
  );

  // Search suggestions from recent searches and popular terms
  const searchSuggestions = useMemo(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]').slice(0, 5);
    const popular = ['ampas kopi grade A', 'pupuk organik', 'kompos kopi', 'kerajinan kopi'];
    return [...new Set([...recent, ...popular])];
  }, []);

  // Update filters when props change
  useEffect(() => {
    setFilters(defaultFilters);
    setSearchQuery(defaultFilters.search || "");
    setPriceRange([
      defaultFilters.priceMin || 0,
      defaultFilters.priceMax || 1000000
    ]);
  }, [defaultFilters]);

  // Debounced filter update
  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters = {
        ...filters,
        search: searchQuery || undefined,
        priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
        priceMax: priceRange[1] < 1000000 ? priceRange[1] : undefined,
      };
      onFilterChange?.(newFilters);
      
      // Save search query to recent searches
      if (searchQuery.trim()) {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const updated = [searchQuery, ...recent.filter((q: string) => q !== searchQuery)].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters, priceRange, onFilterChange]);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSortChange = (newSort: ProductSort) => {
    setSort(newSort);
    onSortChange?.(newSort);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({});
    setPriceRange([0, 1000000]);
    setSort({ field: "newest", direction: "desc" });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + 
    (searchQuery ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < 1000000 ? 1 : 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Cari produk ampas kopi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={() => setSearchQuery("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        
        {/* Search Suggestions */}
        {searchQuery && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto">
            <CardContent className="p-2">
              {isSearching ? (
                <div className="text-center py-4 text-muted-foreground">
                  Mencari...
                </div>
              ) : searchResults?.products.length ? (
                <div className="space-y-1">
                  {searchResults.products.slice(0, 5).map((product) => (
                    <button
                      key={product.id}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                      onClick={() => setSearchQuery(product.title)}
                    >
                      {product.title}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {searchSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm text-muted-foreground"
                      onClick={() => setSearchQuery(suggestion)}
                    >
                      <Search className="w-3 h-3 inline mr-2" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Sort Dropdown */}
        <Select
          value={`${sort.field}-${sort.direction}`}
          onValueChange={(value) => {
            const [field, direction] = value.split('-') as [ProductSort['field'], ProductSort['direction']];
            handleSortChange({ field, direction });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest-desc">Terbaru</SelectItem>
            <SelectItem value="oldest-asc">Terlama</SelectItem>
            <SelectItem value="price_low-asc">Harga Terendah</SelectItem>
            <SelectItem value="price_high-desc">Harga Tertinggi</SelectItem>
            <SelectItem value="rating-desc">Rating Tertinggi</SelectItem>
            <SelectItem value="popular-desc">Terpopuler</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Button */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter
              {activeFilterCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filter Produk</CardTitle>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Kategori</Label>
                  <div className="space-y-2">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.value}`}
                          checked={filters.categories?.includes(category.value)}
                          onCheckedChange={(checked) => {
                            const currentCategories = filters.categories || [];
                            const newCategories = checked
                              ? [...currentCategories, category.value]
                              : currentCategories.filter(c => c !== category.value);
                            handleFilterChange('categories', newCategories.length ? newCategories : undefined);
                          }}
                        />
                        <Label htmlFor={`category-${category.value}`} className="text-sm cursor-pointer">
                          {category.icon} {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Grades */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Grade Kualitas</Label>
                  <div className="space-y-2">
                    {COFFEE_GRADES.map((grade) => (
                      <div key={grade.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`grade-${grade.value}`}
                          checked={filters.grades?.includes(grade.value)}
                          onCheckedChange={(checked) => {
                            const currentGrades = filters.grades || [];
                            const newGrades = checked
                              ? [...currentGrades, grade.value]
                              : currentGrades.filter(g => g !== grade.value);
                            handleFilterChange('grades', newGrades.length ? newGrades : undefined);
                          }}
                        />
                        <Label htmlFor={`grade-${grade.value}`} className="text-sm cursor-pointer">
                          <div>
                            <div className="font-medium">{grade.label}</div>
                            <div className="text-xs text-muted-foreground">{grade.description}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Rentang Harga
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000000}
                      min={0}
                      step={5000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(priceRange[0])}</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Lokasi
                  </Label>
                  <Input
                    placeholder="Cari berdasarkan lokasi..."
                    value={filters.location || ""}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>

                {showAdvanced && (
                  <>
                    <Separator />

                    {/* Advanced Filters */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0">
                          <span className="text-sm font-medium">Filter Lanjutan</span>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-4">
                        {/* Verified Sellers Only */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="verified-only"
                            checked={filters.verifiedOnly}
                            onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
                          />
                          <Label htmlFor="verified-only" className="text-sm cursor-pointer">
                            Hanya seller terverifikasi
                          </Label>
                        </div>

                        {/* Stock Available Only */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="stock-available"
                            checked={filters.stockAvailable}
                            onCheckedChange={(checked) => handleFilterChange('stockAvailable', checked)}
                          />
                          <Label htmlFor="stock-available" className="text-sm cursor-pointer">
                            Hanya yang berstock
                          </Label>
                        </div>

                        {/* Minimum Rating */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            <Star className="w-4 h-4 inline mr-1" />
                            Rating Minimum
                          </Label>
                          <Select
                            value={filters.minRating?.toString() || ""}
                            onValueChange={(value) => handleFilterChange('minRating', value ? parseFloat(value) : undefined)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Semua rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Semua rating</SelectItem>
                              <SelectItem value="4">4+ bintang</SelectItem>
                              <SelectItem value="3">3+ bintang</SelectItem>
                              <SelectItem value="2">2+ bintang</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Hapus Filter ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              <Search className="w-3 h-3" />
              "{searchQuery}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {filters.categories?.map((category) => {
            const categoryInfo = PRODUCT_CATEGORIES.find(c => c.value === category);
            return (
              <Badge key={category} variant="secondary" className="gap-1">
                {categoryInfo?.icon} {categoryInfo?.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    const newCategories = filters.categories?.filter(c => c !== category);
                    handleFilterChange('categories', newCategories?.length ? newCategories : undefined);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}

          {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="w-3 h-3" />
              {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setPriceRange([0, 1000000])}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}