"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  Eye,
  ArrowRight,
  Calendar,
  Star
} from "lucide-react";
import { useDashboardMetrics, useRecentActivity } from "@/lib/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();

  if (metricsLoading || activityLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Menggunakan warna yang lebih sesuai dengan tema
  const statusColors: { [key: string]: string } = {
    pending: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700",
    processing: "border-blue-500/50 bg-blue-500/10 text-blue-700",
    shipped: "border-primary/50 bg-primary/10 text-primary",
    delivered: "border-gray-500/50 bg-gray-500/10 text-muted-foreground",
    cancelled: "border-destructive/50 bg-destructive/10 text-destructive",
  };

  const statusLabels: { [key: string]: string } = {
    pending: "Menunggu",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Selesai",
    cancelled: "Dibatalkan",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        {/* DIUBAH: Menggunakan warna primer dari tema */}
        <div className="bg-primary rounded-lg p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold mb-2">
            Selamat Datang di Dashboard Sikupi!
          </h1>
          <p className="text-primary-foreground/80">
            Kelola produk dan pesanan ampas kopi Anda dengan mudah
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Pendapatan"
            value={formatCurrency(metrics?.totalRevenue || 0)}
            change={`+${metrics?.monthlyGrowth?.revenue || 0}% bulan ini`}
            changeType="positive"
            icon={TrendingUp}
          />
          <DashboardCard
            title="Pesanan Pending"
            value={metrics?.pendingOrders || 0}
            change={`+${metrics?.monthlyGrowth?.orders || 0}% bulan ini`}
            changeType="positive"
            icon={ShoppingCart}
          />
          <DashboardCard
            title="Total Produk"
            value={metrics?.totalProducts || 0}
            change={`+${metrics?.monthlyGrowth?.sales || 0}% bulan ini`}
            changeType="positive"
            icon={Package}
          />
          <DashboardCard
            title="Total Pelanggan"
            value={metrics?.totalCustomers || 0}
            change="Data terbaru"
            changeType="neutral"
            icon={Users}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pesanan Terbaru</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/pesanan">
                    Lihat Semua
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity?.orders?.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{order.orderNumber}</h4>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.productTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(order.total)}</p>
                      {/* DIUBAH: Menggunakan kelas warna yang lebih baik */}
                      <Badge 
                        variant="outline" 
                        className={`text-xs border ${statusColors[order.status] || statusColors.delivered}`}
                      >
                        {statusLabels[order.status] || statusLabels.delivered}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produk Terlaris</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/produk">
                    Lihat Semua
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity?.products?.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {/* DIUBAH: Menggunakan warna primer */}
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{product.title}</h4>
                        <p className="text-xs text-muted-foreground">{product.sales} terjual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(product.revenue)}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        4.8
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            {/* DIUBAH: Menggunakan warna primer untuk tombol utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-16">
                <Link href="/dashboard/produk?action=create">
                  <Package className="h-5 w-5 mr-2" />
                  Tambah Produk Baru
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16">
                <Link href="/dashboard/pesanan">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Kelola Pesanan
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16">
                <Link href="/dashboard/analitik">
                  <Eye className="h-5 w-5 mr-2" />
                  Lihat Analitik
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
