"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { ProductFilters } from "@/lib/types/product";

interface EnhancedProductFilterProps {
  filters: ProductFilters;
  categories: Array<{ type: string; count: number; label: string }>;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  className?: string;
}

export function EnhancedProductFilter({ 
  filters, 
  categories, 
  onFilterChange,
  className 
}: EnhancedProductFilterProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterUpdate = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange({ [key]: value });
  };

  const handlePriceChange = (values: number[]) => {
    const [min, max] = values;
    setLocalFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  const applyPriceFilter = () => {
    onFilterChange({ 
      minPrice: localFilters.minPrice, 
      maxPrice: localFilters.maxPrice 
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      category: "",
      wasteType: "",
      minPrice: undefined,
      maxPrice: undefined,
      location: "",
      grade: "",
      organicCertified: false,
      fairTradeCertified: false,
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const wasteTypes = [
    { value: "coffee_grounds", label: "Ampas Kopi" },
    { value: "coffee_pulp", label: "Pulp Kopi" },
    { value: "coffee_husks", label: "Kulit Kopi" },
    { value: "coffee_chaff", label: "Chaff Kopi" },
  ];

  const categoryOptions = [
    { value: "pupuk", label: "Pupuk Organik" },
    { value: "kompos", label: "Kompos" },
    { value: "kerajinan", label: "Kerajinan" },
    { value: "pakan", label: "Pakan Ternak" },
  ];

  const grades = [
    { value: "A", label: "Grade A" },
    { value: "B", label: "Grade B" },
    { value: "C", label: "Grade C" },
  ];

  const provinces = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", 
    "Jambi", "Sumatera Selatan", "Bengkulu", "Lampung",
    "Jawa Barat", "Jawa Tengah", "Jawa Timur", "DKI Jakarta",
    "Sulawesi Selatan", "Sulawesi Utara", "Bali", "NTB"
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filter Produk</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Jenis Limbah</Label>
        <div className="space-y-2">
          {wasteTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={type.value}
                checked={localFilters.wasteType === type.value}
                onCheckedChange={(checked) => {
                  handleFilterUpdate("wasteType", checked ? type.value : "");
                }}
              />
              <Label htmlFor={type.value} className="text-sm font-normal cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Kategori</Label>
        <Select
          value={localFilters.category || ""}
          onValueChange={(value) => handleFilterUpdate("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            {/* DIHAPUS: <SelectItem value="">Semua Kategori</SelectItem> */}
            {categoryOptions.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Rentang Harga (per kg)</Label>
        <div className="space-y-4">
          <Slider
            value={[localFilters.minPrice || 5000, localFilters.maxPrice || 25000]}
            onValueChange={handlePriceChange}
            max={25000}
            min={5000}
            step={1000}
            className="w-full"
          />
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice || ""}
              onChange={(e) => setLocalFilters(prev => ({ 
                ...prev, 
                minPrice: Number(e.target.value) 
              }))}
              className="w-24 text-sm"
            />
            <span className="text-sm text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice || ""}
              onChange={(e) => setLocalFilters(prev => ({ 
                ...prev, 
                maxPrice: Number(e.target.value) 
              }))}
              className="w-24 text-sm"
            />
            <Button size="sm" onClick={applyPriceFilter}>
              OK
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Grade</Label>
        <Select
          value={localFilters.grade || ""}
          onValueChange={(value) => handleFilterUpdate("grade", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Grade" />
          </SelectTrigger>
          <SelectContent>
            {/* DIHAPUS: <SelectItem value="">Semua Grade</SelectItem> */}
            {grades.map((grade) => (
              <SelectItem key={grade.value} value={grade.value}>
                {grade.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Lokasi</Label>
        <Select
          value={localFilters.location || ""}
          onValueChange={(value) => handleFilterUpdate("location", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Lokasi" />
          </SelectTrigger>
          <SelectContent>
            {/* DIHAPUS: <SelectItem value="">Semua Lokasi</SelectItem> */}
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Sertifikasi</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="organic"
              checked={localFilters.organicCertified || false}
              onCheckedChange={(checked) => 
                handleFilterUpdate("organicCertified", !!checked)
              }
            />
            <Label htmlFor="organic" className="text-sm font-normal cursor-pointer">
              Organik Bersertifikat
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fairtrade"
              checked={localFilters.fairTradeCertified || false}
              onCheckedChange={(checked) => 
                handleFilterUpdate("fairTradeCertified", !!checked)
              }
            />
            <Label htmlFor="fairtrade" className="text-sm font-normal cursor-pointer">
              Fair Trade
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
