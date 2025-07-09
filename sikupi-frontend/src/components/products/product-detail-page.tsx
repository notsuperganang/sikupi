// FILE: src/components/products/product-detail-page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Star, 
  MapPin, 
  Calendar, 
  Package, 
  Shield, 
  Award,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProduct } from "@/lib/hooks/use-products";
import { useAddToCart } from "@/lib/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { data, isLoading, error } = useProduct(productId);
  const addToCart = useAddToCart();

  const product = data?.product;

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart.mutate({
      productId: product.id,
      quantity: quantity,
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.quantityKg || 1)) {
      setQuantity(newQuantity);
    }
  };

  const wasteTypeLabels = {
    coffee_grounds: "Ampas Kopi",
    coffee_pulp: "Pulp Kopi", 
    coffee_husks: "Kulit Kopi",
    coffee_chaff: "Chaff Kopi",
  };

  const categoryLabels = {
    pupuk: "Pupuk Organik",
    kompos: "Kompos",
    kerajinan: "Kerajinan",
    pakan: "Pakan Ternak",
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <Package className="h-4 w-4" />
          <AlertDescription>
            Produk tidak ditemukan atau terjadi kesalahan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            <Image
              src={product.images[selectedImage] || "/placeholder.png"}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative overflow-hidden rounded-lg border ${
                    selectedImage === index ? "border-green-500" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {wasteTypeLabels[product.wasteType as keyof typeof wasteTypeLabels]}
              </Badge>
              <Badge variant="outline">
                Grade {product.grade}
              </Badge>
              <Badge variant="outline">
                {categoryLabels[product.category as keyof typeof categoryLabels]}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{product.sellerRating}</span>
                <span className="text-gray-500 ml-1">
                  ({product.sellerReviewCount} ulasan)
                </span>
              </div>
              
              <div className="flex items-center text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{product.location}</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-green-600 mb-4">
              {formatCurrency(product.pricePerKg)}
              <span className="text-lg text-gray-500 font-normal ml-1">/kg</span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">Stok: {product.quantityKg} kg</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">
                  Panen: {new Date(product.harvestDate).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {product.organicCertified && (
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Organik Bersertifikat</span>
                </div>
              )}
              {product.fairTradeCertified && (
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm">Fair Trade</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Jumlah:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-center min-w-[3rem]">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.quantityKg}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-500">
                Max: {product.quantityKg} kg
              </span>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`h-5 w-5 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                Favorit
              </Button>
              
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCart.isPending ? "Menambah..." : "Tambah ke Keranjang"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Total: {formatCurrency(product.pricePerKg * quantity)}
              </p>
            </div>
          </div>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span className="text-green-600 font-medium text-sm">
                    {product.sellerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{product.sellerName}</p>
                  <p className="text-sm text-gray-500">{product.sellerBusinessName}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{product.sellerRating}</span>
                  <span className="text-gray-500 ml-1">
                    ({product.sellerReviewCount} ulasan)
                  </span>
                </div>
                
                {product.sellerVerified && (
                  <Badge variant="outline" className="text-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Terverifikasi
                  </Badge>
                )}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                Lihat Produk Lain
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}