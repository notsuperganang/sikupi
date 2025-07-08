"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/forms/form-select";
import { FormCheckbox } from "@/components/forms/form-checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "@/stores/product-store";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { X } from "lucide-react";

interface ProductFilterProps {
  onFilterChange?: () => void;
}

const LOCATION_OPTIONS = [
  { value: "", label: "Semua Lokasi" },
  { value: "jakarta", label: "Jakarta" },
  { value: "bandung", label: "Bandung" },
  { value: "surabaya", label: "Surabaya" },
  { value: "yogyakarta", label: "Yogyakarta" },
  { value: "medan", label: "Medan" },
  { value: "semarang", label: "Semarang" },
];

const SELLER_TYPE_OPTIONS = [
  { value: "", label: "Semua Jenis" },
  { value: "cafe", label: "Kafe" },
  { value: "restaurant", label: "Restoran" },
  { value: "hotel", label: "Hotel" },
  { value: "roastery", label: "Roastery" },
  { value: "other", label: "Lainnya" },
];

const GRADE_OPTIONS = [
  { value: "", label: "Semua Grade" },
  { value: "A", label: "Grade A - Sangat Baik" },
  { value: "B", label: "Grade B - Baik" },
  { value: "C", label: "Grade C - Cukup" },
];

export function ProductFilter({ onFilterChange }: ProductFilterProps) {
  const { filters, setFilters, clearFilters } = useProductStore();
  
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || "",
    location: filters.location || "",
    minPrice: filters.minPrice || 0,
    maxPrice: filters.maxPrice || 100000,
    grade: filters.grade || "",
    sellerType: filters.sellerType || "",
    minRating: filters.minRating || 0,
    inStock: filters.inStock || false,
    organicCertified: filters.organicCertified || false,
    verified: filters.verified || false,
  });

  const [priceRange, setPriceRange] = useState([
    localFilters.minPrice,
    localFilters.maxPrice,
  ]);

  useEffect(() => {
    setLocalFilters({
      category: filters.category || "",
      location: filters.location || "",
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 100000,
      grade: filters.grade || "",
      sellerType: filters.sellerType || "",
      minRating: filters.minRating || 0,
      inStock: filters.inStock || false,
      organicCertified: filters.organicCertified || false,
      verified: filters.verified || false,
    });
    
    setPriceRange([
      filters.minPrice || 0,
      filters.maxPrice || 100000,
    ]);
  }, [filters]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const applyFilters = () => {
    const newFilters = {
      ...localFilters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    };

    // Remove empty values
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, value]) => {
        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value > 0;
        return value !== "";
      })
    );

    setFilters(cleanFilters);
    onFilterChange?.();
  };

  const resetFilters = () => {
    setLocalFilters({
      category: "",
      location: "",
      minPrice: 0,
      maxPrice: 100000,
      grade: "",
      sellerType: "",
      minRating: 0,
      inStock: false,
      organicCertified: false,
      verified: false,
    });
    setPriceRange([0, 100000]);
    clearFilters();
    onFilterChange?.();
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value > 0;
      return value !== "";
    }).length + (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);
  };

  const categoryOptions = [
    { value: "", label: "Semua Kategori" },
    ...PRODUCT_CATEGORIES.map(cat => ({ value: cat.id, label: cat.label }))
  ];

  return (
    <div className="space-y-6">
      {/* Active Filters Count */}
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {getActiveFilterCount()} filter aktif
          </Badge>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      )}

      {/* Category */}
      <div className="space-y-3">
        <FormSelect
          label="Kategori"
          options={categoryOptions}
          value={localFilters.category}
          onValueChange={(value) => 
            setLocalFilters(prev => ({ ...prev, category: value }))
          }
        />
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Rentang Harga</label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={100000}
            min={0}
            step={1000}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <FormSelect
          label="Lokasi"
          options={LOCATION_OPTIONS}
          value={localFilters.location}
          onValueChange={(value) => 
            setLocalFilters(prev => ({ ...prev, location: value }))
          }
        />
      </div>

      {/* Grade */}
      <div className="space-y-3">
        <FormSelect
          label="Grade Kualitas"
          options={GRADE_OPTIONS}
          value={localFilters.grade}
          onValueChange={(value) => 
            setLocalFilters(prev => ({ ...prev, grade: value }))
          }
        />
      </div>

      {/* Seller Type */}
      <div className="space-y-3">
        <FormSelect
          label="Jenis Penjual"
          options={SELLER_TYPE_OPTIONS}
          value={localFilters.sellerType}
          onValueChange={(value) => 
            setLocalFilters(prev => ({ ...prev, sellerType: value }))
          }
        />
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Rating Minimum</label>
        <div className="px-2">
          <Slider
            value={[localFilters.minRating]}
            onValueChange={(value) => 
              setLocalFilters(prev => ({ ...prev, minRating: value[0] }))
            }
            max={5}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {localFilters.minRating.toFixed(1)} bintang ke atas
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <FormCheckbox
          label="Hanya yang tersedia"
          checked={localFilters.inStock}
          onCheckedChange={(checked) => 
            setLocalFilters(prev => ({ ...prev, inStock: checked }))
          }
        />

        <FormCheckbox
          label="Penjual terverifikasi"
          checked={localFilters.verified}
          onCheckedChange={(checked) => 
            setLocalFilters(prev => ({ ...prev, verified: checked }))
          }
        />

        <FormCheckbox
          label="Organik bersertifikat"
          checked={localFilters.organicCertified}
          onCheckedChange={(checked) => 
            setLocalFilters(prev => ({ ...prev, organicCertified: checked }))
          }
        />
      </div>

      {/* Apply Button */}
      <Button onClick={applyFilters} className="w-full">
        Terapkan Filter
      </Button>
    </div>
  );
}