"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { FormSelect } from "@/components/forms/form-select";
import { FormCheckbox } from "@/components/forms/form-checkbox";
import { Separator } from "@/components/ui/separator";
import { Save, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    wasteType: "",
    category: "",
    grade: "",
    quantityKg: "",
    pricePerKg: "",
    location: "",
    processingMethod: "",
    organicCertified: false,
    fairTradeCertified: false,
  });

  const wasteTypeOptions = [
    { value: "coffee_grounds", label: "Ampas Kopi" },
    { value: "coffee_pulp", label: "Pulp Kopi" },
    { value: "coffee_husks", label: "Kulit Kopi" },
    { value: "coffee_chaff", label: "Chaff Kopi" },
  ];

  const categoryOptions = [
    { value: "pupuk", label: "Pupuk Organik" },
    { value: "kompos", label: "Kompos" },
    { value: "kerajinan", label: "Bahan Kerajinan" },
    { value: "pakan", label: "Pakan Ternak" },
    { value: "biogas", label: "Biogas" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const gradeOptions = [
    { value: "A", label: "Grade A - Excellent" },
    { value: "B", label: "Grade B - Good" },
    { value: "C", label: "Grade C - Fair" },
    { value: "D", label: "Grade D - Basic" },
  ];

  const processingMethodOptions = [
    { value: "natural", label: "Natural Process" },
    { value: "wet", label: "Wet Process" },
    { value: "semi_wet", label: "Semi-Wet Process" },
    { value: "fermentation", label: "Fermentation" },
    { value: "composting", label: "Composting" },
    { value: "drying", label: "Drying" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Fitur sedang dalam pengembangan", {
        description: productId 
          ? "Edit produk akan segera tersedia setelah deployment."
          : "Tambah produk akan segera tersedia setelah deployment.",
      });
      setLoading(false);
      onSuccess?.();
    }, 1500);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = () => {
    toast.success("Fitur sedang dalam pengembangan", {
      description: "Upload gambar akan segera tersedia.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {productId ? "Edit Produk" : "Tambah Produk Baru"}
          </CardTitle>
          <CardDescription>
            {productId 
              ? "Perbarui informasi produk ampas kopi Anda"
              : "Tambahkan produk ampas kopi baru untuk dijual"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>
            
            <FormInput
              label="Nama Produk"
              required
              placeholder="Masukkan nama produk"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
            
            <FormTextarea
              label="Deskripsi"
              required
              placeholder="Jelaskan detail produk ampas kopi Anda"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              showCharacterCount
              maxLength={500}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Jenis Limbah"
                required
                options={wasteTypeOptions}
                value={formData.wasteType}
                onValueChange={(value) => handleInputChange("wasteType", value)}
              />
              
              <FormSelect
                label="Kategori"
                required
                options={categoryOptions}
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              />
            </div>
          </div>

          <Separator />

          {/* Quality & Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kualitas & Spesifikasi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Grade Kualitas"
                required
                options={gradeOptions}
                value={formData.grade}
                onValueChange={(value) => handleInputChange("grade", value)}
              />
              
              <FormSelect
                label="Metode Pengolahan"
                options={processingMethodOptions}
                value={formData.processingMethod}
                onValueChange={(value) => handleInputChange("processingMethod", value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormCheckbox
                label="Bersertifikat Organik"
                checked={formData.organicCertified}
                onCheckedChange={(checked) => handleInputChange("organicCertified", checked)}
              />
              
              <FormCheckbox
                label="Bersertifikat Fair Trade"
                checked={formData.fairTradeCertified}
                onCheckedChange={(checked) => handleInputChange("fairTradeCertified", checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Harga & Stok</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Jumlah Stok (kg)"
                type="number"
                required
                placeholder="0"
                value={formData.quantityKg}
                onChange={(e) => handleInputChange("quantityKg", e.target.value)}
                min="0"
                step="0.1"
              />
              
              <FormInput
                label="Harga per kg (IDR)"
                type="number"
                required
                placeholder="0"
                value={formData.pricePerKg}
                onChange={(e) => handleInputChange("pricePerKg", e.target.value)}
                min="0"
                step="100"
              />
            </div>
            
            <FormInput
              label="Lokasi"
              required
              placeholder="Kota, Provinsi"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>

          <Separator />

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Gambar Produk</h3>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Klik untuk upload gambar produk
              </p>
              <Button type="button" variant="outline" onClick={handleImageUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Gambar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Menyimpan..." : (productId ? "Perbarui" : "Simpan")}
        </Button>
      </div>
    </form>
  );
}