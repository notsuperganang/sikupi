"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import { useMyProducts } from "@/lib/hooks/use-products";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "sold_out":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Aktif";
    case "inactive":
      return "Tidak Aktif";
    case "sold_out":
      return "Habis";
    default:
      return status;
  }
};

function ProductCard({ product }: { product: any }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleEdit = () => {
    toast.success("Fitur sedang dalam pengembangan", {
      description: "Edit produk akan segera tersedia.",
    });
  };

  const handleDelete = () => {
    toast.success("Fitur sedang dalam pengembangan", {
      description: "Hapus produk akan segera tersedia.",
    });
  };

  const handleViewStats = () => {
    toast.success("Fitur sedang dalam pengembangan", {
      description: "Statistik produk akan segera tersedia.",
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(product.status)}>
              {getStatusLabel(product.status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewStats}>
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Statistik
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Produk
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Produk
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Harga/kg</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(product.pricePerKg)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Stok</p>
            <p className="text-lg font-semibold">{product.quantityKg} kg</p>
          </div>
          <div>
            <p className="text-sm font-medium">Grade</p>
            <p className="text-lg font-semibold">Grade {product.grade}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Dilihat</p>
            <p className="text-lg font-semibold">{product.viewsCount}x</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{product.location}</span>
          <span>Dibuat: {new Date(product.createdAt).toLocaleDateString('id-ID')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SellerProductPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data, isLoading, error } = useMyProducts({
    search: searchQuery,
    sortBy: sortBy as any,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const products = data?.products || [];

  const handleCreateProduct = () => {
    toast.success("Fitur sedang dalam pengembangan", {
      description: "Tambah produk akan segera tersedia.",
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    toast.success("Fitur sedang dalam pengembangan", {
      description: "Export data akan segera tersedia.",
    });
  };

  const handleBulkAction = () => {
    toast.success("Fitur sedang dalam pengembangan", {
      description: "Bulk actions akan segera tersedia.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Produk Saya</h1>
            <p className="text-muted-foreground">Kelola semua produk yang Anda jual</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
        
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Produk Saya</h1>
            <p className="text-muted-foreground">Kelola semua produk yang Anda jual</p>
          </div>
          <Button onClick={handleCreateProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Terjadi Kesalahan</h3>
            <p className="text-muted-foreground">
              Gagal memuat produk. Silakan coba lagi nanti.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produk Saya</h1>
          <p className="text-muted-foreground">
            Kelola semua produk yang Anda jual ({products.length} produk)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            Export Data
          </Button>
          <Button onClick={handleCreateProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Status: {statusFilter === "all" ? "Semua" : getStatusLabel(statusFilter)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    Semua Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Aktif
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                    Tidak Aktif
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("sold_out")}>
                    Habis
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {sortBy === "newest" ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
                    Urutkan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Terbaru
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                    Terlama
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price_high")}>
                    Harga Tertinggi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price_low")}>
                    Harga Terendah
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "Tidak Ada Hasil" : "Belum Ada Produk"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Coba gunakan kata kunci yang berbeda" 
                : "Mulai jual produk ampas kopi Anda sekarang"
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {filteredProducts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan {filteredProducts.length} dari {products.length} produk
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleBulkAction}>
                  Pilih Semua
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkAction}>
                  Hapus Terpilih
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}