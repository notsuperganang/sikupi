"use client";

import { FormSelect } from "@/components/forms/form-select";
import { useProductStore } from "@/stores/product-store";

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "price_low", label: "Harga: Rendah ke Tinggi" },
  { value: "price_high", label: "Harga: Tinggi ke Rendah" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "popularity", label: "Terpopuler" },
  { value: "distance", label: "Terdekat" },
];

export function ProductSort() {
  const { sort, setSort } = useProductStore();

  const handleSortChange = (value: string) => {
    const [field, direction = "desc"] = value.includes("_") 
      ? value.split("_") 
      : [value, value === "oldest" ? "asc" : "desc"];

    const newSort = {
      field: field as any,
      direction: direction === "low" ? "asc" : direction === "high" ? "desc" : direction as "asc" | "desc",
    };

    setSort(newSort);
  };

  const getCurrentSortValue = () => {
    if (sort.field === "price_low" || sort.field === "price_high") {
      return sort.direction === "asc" ? "price_low" : "price_high";
    }
    return sort.field;
  };

  return (
    <div className="min-w-48">
      <FormSelect
        placeholder="Urutkan"
        options={SORT_OPTIONS}
        value={getCurrentSortValue()}
        onValueChange={handleSortChange}
      />
    </div>
  );
}