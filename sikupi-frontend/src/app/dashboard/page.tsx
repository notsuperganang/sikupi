// FILE PATH: /sikupi-frontend/src/app/dashboard/page.tsx

"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  DollarSign,
  Eye,
  Plus,
  ExternalLink,
  AlertCircle,
  Users,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/lib/auth";
import { useDashboardMetrics, useRecentActivity } from "@/lib/hooks";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-green-100 text-green-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Menunggu";
    case "processing":
      return "Diproses";
    case "shipped":
      return "Dikirim";
    case "delivered":
      return "Selesai";
    default:
      return status;
  }
};

function DashboardContent() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: recentActivity, isLoading: activityLoading, error: activityError } = useRecentActivity();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getDashboardStats = () => {
    // Provide safe defaults if metrics is undefined
    const safeMetrics = metrics || {
      totalRevenue: 0,
      pendingOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
      monthlyGrowth: {
        revenue: 0,
        orders: 0,
        sales: 0,
      },
    };
    
    return [
      {
        title: "Total Penjualan",
        value: formatCurrency(safeMetrics.totalRevenue),
        description: "Bulan ini",
        icon: DollarSign,
        trend: { 
          value: safeMetrics.monthlyGrowth?.revenue || 0, 
          label: "dari bulan lalu", 
          type: (safeMetrics.monthlyGrowth?.revenue || 0) > 0 ? "positive" as const : "negative" as const 
        },
      },
      {
        title: "Pesanan Aktif",
        value: safeMetrics.pendingOrders || 0,
        description: "Menunggu diproses",
        icon: ShoppingBag,
        trend: { 
          value: safeMetrics.monthlyGrowth?.orders || 0, 
          label: "dari bulan lalu", 
          type: (safeMetrics.monthlyGrowth?.orders || 0) > 0 ? "positive" as const : "negative" as const 
        },
      },
      {
        title: "Total Produk",
        value: safeMetrics.totalProducts || 0,
        description: "Produk aktif",
        icon: Package,
        trend: { 
          value: safeMetrics.monthlyGrowth?.sales || 0, 
          label: "dari bulan lalu", 
          type: (safeMetrics.monthlyGrowth?.sales || 0) > 0 ? "positive" as const : "negative" as const 
        },
      },
      {
        title: "Total Pelanggan",
        value: safeMetrics.totalCustomers || 0,
        description: "Pelanggan terdaftar",
        icon: Users,
        trend: { 
          value: 0, 
          label: "dari bulan lalu", 
          type: "neutral" as const 
        },
      },
    ];
  };

  // Error handling for metrics
  if (metricsError) {
    console.error('Dashboard metrics error:', metricsError);
  }

  // Error handling for activity
  if (activityError) {
    console.error('Dashboard activity error:', activityError);
  }

  const dashboardStats = getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        title="Dashboard"
        description="Pantau performa bisnis ampas kopi Anda"
        action={
          <Button asChild>
            <Link href="/dashboard/produk/buat">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Link>
          </Button>
        }
      />

      {/* Error Alert */}
      {(metricsError || activityError) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Beberapa data dashboard sedang tidak tersedia. Tim kami sedang memperbaikinya.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual stats cards
          dashboardStats.map((stat, index) => (
            <DashboardCard key={index} {...stat} />
          ))
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Pesanan Terbaru</CardTitle>
            <CardDescription>
              Pesanan yang masuk dalam 7 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity?.orders && recentActivity.orders.length > 0 ? (
                  recentActivity.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(order.total)}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(order.status)}
                        >
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Belum Ada Pesanan
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pesanan akan muncul di sini setelah ada yang memesan produk Anda
                    </p>
                    <Button asChild size="sm">
                      <Link href="/dashboard/produk/buat">
                        Tambah Produk Pertama
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Tindakan yang sering dilakukan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/produk/buat">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Produk Baru
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/pesanan">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Lihat Semua Pesanan
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/produk">
                <Package className="w-4 h-4 mr-2" />
                Kelola Produk
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/penjualan">
                <BarChart3 className="w-4 h-4 mr-2" />
                Lihat Analitik
              </Link>
            </Button>

            <div className="pt-4 border-t">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/bantuan">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Butuh Bantuan?
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Performa</CardTitle>
            <CardDescription>
              Metrik penting bisnis Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rata-rata Nilai Pesanan</span>
                  <span className="font-medium">
                    {formatCurrency(metrics?.averageOrderValue || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tingkat Konversi</span>
                  <span className="font-medium">
                    {((metrics?.conversionRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pesanan Selesai</span>
                  <span className="font-medium">
                    {metrics?.completedOrders || 0}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips & Rekomendasi</CardTitle>
            <CardDescription>
              Saran untuk meningkatkan penjualan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  💡 Optimasi Produk
                </h4>
                <p className="text-xs text-blue-700">
                  Tambahkan foto berkualitas tinggi untuk meningkatkan minat pembeli
                </p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-900 mb-1">
                  📈 Tingkatkan Penjualan
                </h4>
                <p className="text-xs text-green-700">
                  Berikan deskripsi detail tentang manfaat ampas kopi Anda
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  🎯 Jangkau Lebih Banyak
                </h4>
                <p className="text-xs text-yellow-700">
                  Pastikan stok produk selalu tersedia untuk menghindari kekecewaan pembeli
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </AuthGuard>
  );
}