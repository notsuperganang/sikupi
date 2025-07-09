// FILE: src/components/products/product-sort.tsx
"use client";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface ProductSortProps {
  sortBy?: string;
  onSortChange: (sortBy: string) => void;
  className?: string;
}

export function ProductSort({ sortBy, onSortChange, className }: ProductSortProps) {
  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "price_low", label: "Harga Terendah" },
    { value: "price_high", label: "Harga Tertinggi" },
    { value: "rating", label: "Rating Tertinggi" },
    { value: "popular", label: "Paling Populer" },
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <ArrowUpDown className="h-4 w-4 text-gray-500" />
      <Select value={sortBy || "newest"} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Urutkan berdasarkan" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}