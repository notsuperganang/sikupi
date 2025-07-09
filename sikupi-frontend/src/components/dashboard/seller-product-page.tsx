// FILE PATH: /src/components/dashboard/seller-products-page.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useSellerProducts } from "@/lib/hooks/use-products";
import { useProductStore, type Product } from "@/stores/product-store";
import { formatCurrency, formatWeight, formatDate } from "@/lib/utils";
import { PRODUCT_CATEGORIES, COFFEE_GRADES } from "@/lib/constants";
import { toast } from "sonner";

import { useMyProducts } from "@/lib/hooks/use-products";
import { ProductForm } from "@/components/products/product-form";

export function SellerProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { 
    data: productsData, 
    isLoading, 
    error,
    refetch 
  } = useMyProducts();
  
  const { removeProduct } = useProductStore();

  const products = productsData?.products || [];

  // Filter products based on tab and search
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "active" && product.status === "active") ||
                      (selectedTab === "inactive" && product.status === "inactive") ||
                      (selectedTab === "out_of_stock" && !product.isAvailable);
    
    return matchesSearch && matchesTab;
  });

  const handleDeleteProduct = async (productId: string) => {
    try {
      await removeProduct(productId);
      toast.success("Produk berhasil dihapus!");
      refetch();
    } catch (error) {
      toast.error("Gagal menghapus produk");
    }
  };

  const getStatusBadge = (product: Product) => {
    if (!product.isAvailable) {
      return <Badge variant="destructive">Stok Habis</Badge>;
    }
    if (product.status === "inactive") {
      return <Badge variant="secondary">Tidak Aktif</Badge>;
    }
    return <Badge variant="default">Aktif</Badge>;
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === "active" && p.isAvailable).length,
    inactive: products.filter(p => p.status === "inactive").length,
    outOfStock: products.filter(p => !p.isAvailable).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Kelola Produk"
          description="Kelola semua produk ampas kopi Anda"
        />
        <LoadingSkeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Kelola Produk"
        description="Kelola semua produk ampas kopi Anda"
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
                <DialogDescription>
                  Lengkapi informasi produk ampas kopi Anda
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Produk</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produk Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tidak Aktif</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stok Habis</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">Semua ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Aktif ({stats.active})</TabsTrigger>
          <TabsTrigger value="inactive">Tidak Aktif ({stats.inactive})</TabsTrigger>
          <TabsTrigger value="out_of_stock">Stok Habis ({stats.outOfStock})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold mb-2">Gagal Memuat Produk</h3>
                <p className="text-muted-foreground mb-4">
                  Terjadi kesalahan saat memuat data produk.
                </p>
                <Button onClick={() => refetch()}>Coba Lagi</Button>
              </CardContent>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">Belum Ada Produk</h3>
                <p className="text-muted-foreground mb-4">
                  {products.length === 0 
                    ? "Mulai jual ampas kopi Anda dengan menambah produk pertama."
                    : "Tidak ada produk yang sesuai dengan filter pencarian."
                  }
                </p>
                {products.length === 0 && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Produk Pertama
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => setEditingProduct(product)}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog 
        open={!!editingProduct} 
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>
              Update informasi produk Anda
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const categoryInfo = PRODUCT_CATEGORIES.find(c => c.value === product.category);
  const gradeInfo = COFFEE_GRADES.find(g => g.value === product.grade);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.images[0] || "/placeholder-product.png"}
              alt={product.title}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/produk/${product.id}`} target="_blank">
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat Detail
                  </a>
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus produk "{product.title}"? 
                        Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-2 left-2">
            {getStatusBadge(product)}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
          <div className="flex gap-2">
            {categoryInfo && (
              <Badge variant="outline" className="text-xs">
                {categoryInfo.icon} {categoryInfo.label}
              </Badge>
            )}
            {gradeInfo && (
              <Badge variant="secondary" className="text-xs">
                {gradeInfo.label}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(product.pricePerKg)}
              </p>
              <p className="text-xs text-muted-foreground">
                per kg • {formatWeight(product.quantityKg)} tersedia
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Diposting: {formatDate(product.createdAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Import ProductForm
import { ProductForm } from "@/components/products/product-form";