"use client";

import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  DollarSign,
  Eye,
  Plus,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/lib/auth";
import { useDashboardMetrics, useRecentActivity } from "@/lib/hooks";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    }).format(value);
  };

  const getDashboardStats = () => {
    if (!metrics) return [];
    
    return [
      {
        title: "Total Penjualan",
        value: formatCurrency(metrics.totalRevenue),
        description: "Bulan ini",
        icon: DollarSign,
        trend: { 
          value: metrics.monthlyGrowth.revenue, 
          label: "dari bulan lalu", 
          type: metrics.monthlyGrowth.revenue > 0 ? "positive" as const : "negative" as const 
        },
      },
      {
        title: "Pesanan Aktif",
        value: metrics.pendingOrders,
        description: "Menunggu diproses",
        icon: ShoppingBag,
        trend: { 
          value: metrics.monthlyGrowth.orders, 
          label: "dari bulan lalu", 
          type: metrics.monthlyGrowth.orders > 0 ? "positive" as const : "negative" as const 
        },
      },
      {
        title: "Total Produk",
        value: metrics.totalProducts,
        description: "Produk aktif",
        icon: Package,
        trend: { 
          value: 5.2, 
          label: "dari bulan lalu", 
          type: "positive" as const 
        },
      },
      {
        title: "Pesanan Selesai",
        value: metrics.completedOrders,
        description: "Bulan ini",
        icon: Eye,
        trend: { 
          value: metrics.monthlyGrowth.sales, 
          label: "dari bulan lalu", 
          type: metrics.monthlyGrowth.sales > 0 ? "positive" as const : "negative" as const 
        },
      },
    ];
  };

  if (metricsError || activityError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Terjadi kesalahan saat memuat data dashboard. Silakan coba lagi nanti.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        title="Dashboard"
        description="Selamat datang kembali! Berikut ringkasan aktivitas marketplace Anda."
        action={
          <Button asChild>
            <Link href="/dashboard/produk/tambah">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          getDashboardStats().map((stat, index) => (
            <DashboardCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pesanan Terbaru</CardTitle>
                <CardDescription>
                  Pesanan yang masuk dalam 7 hari terakhir
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/pesanan">
                  Lihat Semua
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))
              ) : (
                recentActivity?.orders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{order.customerName}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pesanan #{order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <p className="text-sm text-muted-foreground">#{order.id}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
                    <p>Belum ada pesanan terbaru</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Akses fitur yang sering digunakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/produk/tambah">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk Baru
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/pesanan">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Kelola Pesanan
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/produk">
                  <Package className="h-4 w-4 mr-2" />
                  Kelola Produk
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/penjualan">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Lihat Analitik
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </AuthGuard>
  );
}