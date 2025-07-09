// FILE PATH: /src/components/products/product-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { 
  Upload, 
  X, 
  ImageIcon, 
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  Package,
  FileText,
  Tag,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateProduct, useUpdateProduct, useUploadProductImages } from "@/lib/hooks/use-products";
import { type Product } from "@/lib/api/services/products";
import { PRODUCT_CATEGORIES, COFFEE_GRADES } from "@/lib/constants";
import { toast } from "sonner";

// Form validation schema
const productFormSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(100, "Judul maksimal 100 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(1000, "Deskripsi maksimal 1000 karakter"),
  category: z.string().min(1, "Pilih kategori produk"),
  wasteType: z.string().min(1, "Pilih jenis limbah"),
  grade: z.string().min(1, "Pilih grade kualitas"),
  pricePerKg: z.number().min(1000, "Harga minimal Rp 1.000").max(1000000, "Harga maksimal Rp 1.000.000"),
  quantityKg: z.number().min(0.1, "Kuantitas minimal 0.1 kg").max(10000, "Kuantitas maksimal 10.000 kg"),
  location: z.string().min(3, "Lokasi minimal 3 karakter").max(100, "Lokasi maksimal 100 karakter"),
  processingNotes: z.string().optional(),
  harvestDate: z.string().optional(),
  images: z.array(z.string()).min(1, "Minimal 1 gambar").max(5, "Maksimal 5 gambar"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const isEditing = !!product;
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const uploadImagesMutation = useUploadProductImages();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      category: product?.category || "",
      wasteType: product?.wasteType || "",
      grade: product?.grade || "",
      pricePerKg: product?.pricePerKg || 0,
      quantityKg: product?.quantityKg || 0,
      location: product?.location || "",
      processingNotes: product?.processingNotes || "",
      harvestDate: product?.harvestDate ? new Date(product.harvestDate).toISOString().split('T')[0] : "",
      images: product?.images || [],
    },
  });

  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        title: product.title,
        description: product.description,
        category: product.category,
        wasteType: product.wasteType,
        grade: product.grade,
        pricePerKg: product.pricePerKg,
        quantityKg: product.quantityKg,
        location: product.location,
        processingNotes: product.processingNotes,
        harvestDate: product.harvestDate ? new Date(product.harvestDate).toISOString().split('T')[0] : "",
        images: product.images,
      });
      setUploadedImages(product.images);
    }
  }, [product, form]);

  // Update images field when uploadedImages changes
  useEffect(() => {
    form.setValue("images", uploadedImages);
  }, [uploadedImages, form]);

  const handleImageUpload = async (files: FileList | File[]) => {
    if (uploadedImages.length + files.length > 5) {
      toast.error("Maksimal 5 gambar per produk");
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const response = await uploadImagesMutation.mutateAsync(formData);
      setUploadedImages((prev) => [...prev, ...response.imageUrls]);
      toast.success(`${files.length} gambar berhasil diupload`);
    } catch (error) {
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing && product) {
        await updateProductMutation.mutateAsync({
          id: product.id,
          data: {
            ...data,
            harvestDate: data.harvestDate ? new Date(data.harvestDate) : undefined,
          },
        });
        toast.success("Produk berhasil diperbarui!");
      } else {
        await createProductMutation.mutateAsync({
          ...data,
          harvestDate: data.harvestDate ? new Date(data.harvestDate) : undefined,
        });
        toast.success("Produk berhasil ditambahkan!");
      }
      
      onSuccess?.();
    } catch (error) {
      toast.error(isEditing ? "Gagal memperbarui produk" : "Gagal menambahkan produk");
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Gambar Produk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  Drag & drop gambar di sini
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  atau klik untuk memilih gambar (max 5 files, 5MB each)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button type="button" variant="outline" disabled={uploading}>
                  {uploading ? "Mengupload..." : "Pilih Gambar"}
                </Button>
              </div>
            </div>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 text-xs">
                        Utama
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Produk *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contoh: Ampas Kopi Grade A Segar"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Berikan judul yang menarik dan deskriptif
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsikan detail produk ampas kopi Anda..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Jelaskan kualitas, proses, dan keunggulan produk Anda
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Kualitas *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COFFEE_GRADES.map((grade) => (
                          <SelectItem key={grade.value} value={grade.value}>
                            <div>
                              <div className="font-medium">{grade.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {grade.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="wasteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Limbah *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contoh: Ampas espresso, Drip coffee, dll"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sebutkan jenis spesifik limbah kopi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Harga & Stok
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga per Kg *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Harga dalam Rupiah per kilogram
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantityKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuantitas (Kg) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Jumlah stok yang tersedia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contoh: Jakarta Selatan, DKI Jakarta"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Lokasi pengambilan atau pengiriman
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Informasi Tambahan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="processingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Proses</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan cara pengolahan, penyimpanan, atau informasi khusus lainnya..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Informasi tambahan tentang proses pengolahan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="harvestDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Panen</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tanggal ketika biji kopi dipanen (opsional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading && <Package className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Perbarui Produk" : "Tambah Produk"}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Batal
            </Button>
          )}
        </div>

        {/* Warning for required fields */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Fields yang ditandai dengan (*) wajib diisi. Pastikan semua informasi yang dimasukkan akurat dan sesuai dengan produk yang dijual.
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
}