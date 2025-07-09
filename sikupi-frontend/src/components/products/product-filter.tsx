// =========================================
// FILE: src/components/products/product-filter.tsx (Simple fallback)
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { ProductFilters } from "@/lib/types/product";

interface ProductFilterProps {
  filters?: ProductFilters;
  categories?: Array<{ type: string; count: number; label: string }>;
  onFilterChange?: (filters: Partial<ProductFilters>) => void;
}

export function ProductFilter({ filters = {}, categories = [], onFilterChange }: ProductFilterProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterUpdate = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange?.({ [key]: value });
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: undefined,
      category: undefined,
      wasteType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      location: undefined,
      grade: undefined,
      organicCertified: undefined,
      fairTradeCertified: undefined,
    };
    setLocalFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filter Produk</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Reset
        </Button>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Kategori</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category.type}
              variant={localFilters.category === category.type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleFilterUpdate("category", 
                localFilters.category === category.type ? undefined : category.type
              )}
            >
              {category.label} ({category.count})
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Quick Filters */}
      <div>
        <h4 className="font-medium mb-3">Filter Cepat</h4>
        <div className="space-y-2">
          <Button
            variant={localFilters.organicCertified ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterUpdate("organicCertified", !localFilters.organicCertified)}
            className="w-full justify-start"
          >
            Organik Bersertifikat
          </Button>
          <Button
            variant={localFilters.fairTradeCertified ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterUpdate("fairTradeCertified", !localFilters.fairTradeCertified)}
            className="w-full justify-start"
          >
            Fair Trade
          </Button>
        </div>
      </div>
    </div>
  );
}