// FILE PATH: /src/components/products/product-detail-page.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  MapPin, 
  User, 
  Badge as BadgeIcon,
  ShoppingCart,
  Plus,
  Minus,
  Verified,
  Truck,
  Shield,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Container } from "@/components/layout/container";
import { useProduct } from "@/lib/hooks/use-products";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency, formatWeight, formatDate } from "@/lib/utils";
import { COFFEE_GRADES, PRODUCT_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

interface ProductDetailPageProps {
  productId: string;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { data: productData, isLoading, error } = useProduct(productId);
  const { addItem, isLoading: addingToCart } = useCartStore();
  
  const product = productData?.product;

  // Loading state
  if (isLoading) {
    return (
      <Container className="py-8">
        <LoadingSkeleton variant="product-detail" />
      </Container>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <Container className="py-8">
        <div className="text-center space-y-4">
          <div className="text-6xl">😞</div>
          <h2 className="text-2xl font-bold">Produk Tidak Ditemukan</h2>
          <p className="text-muted-foreground">
            Produk yang Anda cari tidak ada atau telah dihapus.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </Container>
    );
  }

  const handleAddToCart = async () => {
    try {
      await addItem({
        productId: product.id,
        quantity,
        sellerId: product.sellerId
      });
      toast.success(`${quantity} kg produk ditambahkan ke keranjang!`);
    } catch (error) {
      toast.error("Gagal menambahkan produk ke keranjang");
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.quantityKg) {
      setQuantity(newQuantity);
    }
  };

  const getGradeInfo = (grade: string) => {
    return COFFEE_GRADES.find(g => g.value === grade);
  };

  const getCategoryInfo = (category: string) => {
    return PRODUCT_CATEGORIES.find(c => c.value === category);
  };

  const categoryInfo = getCategoryInfo(product.category);
  const gradeInfo = getGradeInfo(product.grade);

  return (
    <Container className="py-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.images[selectedImage] || "/placeholder-product.png"}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Image navigation dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedImage ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail images */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    index === selectedImage ? "border-primary" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and basic info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-2 mb-3">
                  {categoryInfo && (
                    <Badge variant="secondary" className="text-xs">
                      {categoryInfo.icon} {categoryInfo.label}
                    </Badge>
                  )}
                  {gradeInfo && (
                    <Badge variant="outline" className="text-xs">
                      {gradeInfo.label}
                    </Badge>
                  )}
                  {!product.isAvailable && (
                    <Badge variant="destructive" className="text-xs">
                      Stok Habis
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary mb-2">
              {formatCurrency(product.pricePerKg)}
              <span className="text-base font-normal text-muted-foreground ml-2">
                per kg
              </span>
            </div>

            <p className="text-muted-foreground">
              Stok tersedia: {formatWeight(product.quantityKg)}
            </p>
          </div>

          {/* Seller info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{product.sellerName}</h3>
                    {product.sellerVerified && (
                      <Verified className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {product.sellerRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{product.sellerRating.toFixed(1)}</span>
                        <span>({product.sellerReviewCount || 0} ulasan)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{product.location}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Lihat Toko
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quantity selector and add to cart */}
          {product.isAvailable && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Jumlah (kg)
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          if (val >= 1 && val <= product.quantityKg) {
                            setQuantity(val);
                          }
                        }}
                        className="w-20 text-center"
                        min={1}
                        max={product.quantityKg}
                      />
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.quantityKg}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: {formatCurrency(product.pricePerKg * quantity)}
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {addingToCart ? "Menambahkan..." : "Tambah ke Keranjang"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product features */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-xs font-medium">Produk Terjamin</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Truck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-medium">Pengiriman Cepat</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-xs font-medium">Stok Fresh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product details tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Deskripsi</TabsTrigger>
            <TabsTrigger value="specifications">Spesifikasi</TabsTrigger>
            <TabsTrigger value="reviews">Ulasan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi Produk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Spesifikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Kategori:</span>
                    <span>{categoryInfo?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Grade:</span>
                    <span>{gradeInfo?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tipe Limbah:</span>
                    <span>{product.wasteType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Berat Tersedia:</span>
                    <span>{formatWeight(product.quantityKg)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Lokasi:</span>
                    <span>{product.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tanggal Posting:</span>
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ulasan Produk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada ulasan untuk produk ini.</p>
                  <p className="text-sm">Jadilah yang pertama memberikan ulasan!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}