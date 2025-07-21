// FILE: src/components/products/product-detail-page.tsx
// PERBAIKAN LENGKAP - Safe access untuk semua fields

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
  ArrowLeft,
  User,
  Droplets,
  Scale,
  Clock
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

interface ProductDetailPageProps {
  productId?: string; // Tambah prop optional untuk productId
}

export function ProductDetailPage({ productId: propProductId }: ProductDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  
  // Use productId dari props atau dari params
  const productId = propProductId || (params?.id as string);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { data, isLoading, error } = useProduct(productId);
  const addToCart = useAddToCart();

  const product = data?.product;

  // DEBUG: Log data untuk debugging
  console.log('ProductDetailPage - productId:', productId);
  console.log('ProductDetailPage - product:', product);

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

  // Helper functions untuk safe access
  const getSellerName = () => {
    return product?.seller?.fullName || product?.seller?.businessName || "Seller Tidak Diketahui";
  };

  const getSellerInitial = () => {
    const name = getSellerName();
    return name.charAt(0).toUpperCase();
  };

  const getSellerRating = () => {
    return product?.seller?.rating || 0;
  };

  const getSellerReviewCount = () => {
    return product?.seller?.totalReviews || 0;
  };

  const getLocation = () => {
    return product?.originLocation || product?.seller?.city || product?.location || "Lokasi tidak tersedia";
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Tidak tersedia";
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        
        <Alert className="max-w-md mx-auto">
          <Package className="h-4 w-4" />
          <AlertDescription>
            Produk tidak ditemukan atau terjadi kesalahan saat memuat data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Safe image access
  const productImages = product.images && product.images.length > 0 ? product.images : ['/placeholder.png'];
  const selectedImageUrl = productImages[selectedImage] || productImages[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <Image
              src={selectedImageUrl}
              alt={product.title}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail Images */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Type */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {product.title}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="default" className="bg-primary">
                {wasteTypeLabels[product.wasteType]}
              </Badge>
              {(product.qualityGrade || product.grade) && (
                <Badge variant="outline" className="border-primary text-primary">
                  Grade {product.qualityGrade || product.grade}
                </Badge>
              )}
              {product.organicCertified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Organik
                </Badge>
              )}
              {product.fairTradeCertified && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Fair Trade
                </Badge>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.pricePerKg)}
              </span>
              <span className="text-lg text-gray-600">/kg</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Stok tersedia: {product.quantityKg} kg
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Deskripsi</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Lokasi:</span>
                <span className="ml-2 font-medium">{getLocation()}</span>
              </div>
              
              {product.processingMethod && (
                <div className="flex items-center text-sm">
                  <Scale className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Metode:</span>
                  <span className="ml-2 font-medium">{product.processingMethod}</span>
                </div>
              )}
              
              {product.moistureContent && (
                <div className="flex items-center text-sm">
                  <Droplets className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Kelembaban:</span>
                  <span className="ml-2 font-medium">{product.moistureContent}%</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Panen:</span>
                <span className="ml-2 font-medium">{formatDate(product.harvestDate)}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Kadaluarsa:</span>
                <span className="ml-2 font-medium">{formatDate(product.expiryDate)}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Package className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Status:</span>
                <Badge variant="outline" className="ml-2">
                  {product.status === 'active' ? 'Aktif' : product.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <label className="font-medium">Jumlah:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 border rounded-md text-center min-w-[60px]">
                  {quantity} kg
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.quantityKg}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
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
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-primary font-medium text-sm">
                    {getSellerInitial()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{getSellerName()}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {getLocation()}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{getSellerRating().toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">
                    ({getSellerReviewCount()} ulasan)
                  </span>
                </div>
                
                {product.seller?.isVerified && (
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