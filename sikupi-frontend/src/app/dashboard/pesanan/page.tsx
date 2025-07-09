// FILE: src/app/dashboard/pesanan/page.tsx
"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MapPin
} from "lucide-react";
import { useMyOrders } from "@/lib/hooks/use-orders";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: ordersData, isLoading } = useMyOrders({
    search: searchQuery,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const orders = ordersData?.orders || [];

  const statusConfig = {
    pending: {
      label: "Menunggu Pembayaran",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    processing: {
      label: "Diproses",
      color: "bg-blue-100 text-blue-800",
      icon: Package,
    },
    shipped: {
      label: "Dikirim",
      color: "bg-green-100 text-green-800",
      icon: Truck,
    },
    delivered: {
      label: "Selesai",
      color: "bg-gray-100 text-gray-800",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Dibatalkan",
      color: "bg-red-100 text-red-800",
      icon: AlertCircle,
    },
  };

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kelola Pesanan</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">
              Semua ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Proses ({statusCounts.processing})
            </TabsTrigger>
            <TabsTrigger value="shipped">
              Dikirim ({statusCounts.shipped})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Selesai ({statusCounts.delivered})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Batal ({statusCounts.cancelled})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Pesanan
                  </h3>
                  <p className="text-gray-600">
                    Pesanan akan muncul di sini setelah pelanggan melakukan pembelian
                  </p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => {
                const config = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="font-semibold text-lg">
                              {order.orderNumber}
                            </h3>
                            <Badge className={config.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                <span>Pembeli: User Demo</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Package className="h-4 w-4 mr-2" />
                                <span>Produk: {order.productTitle}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>Tanggal: {formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="truncate">{order.shippingAddress}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span>Jumlah: {order.quantity} kg</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span>Pembayaran: {
                                  order.paymentMethod === "bank_transfer" ? "Transfer Bank" :
                                  order.paymentMethod === "e_wallet" ? "E-Wallet" :
                                  "Kartu Kredit"
                                }</span>
                              </div>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <strong>Catatan:</strong> {order.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-lg font-bold text-gray-900 mb-2">
                            {formatCurrency(order.totalPrice)}
                          </div>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              Detail
                            </Button>
                            {order.status === "pending" && (
                              <Button size="sm" className="w-full">
                                Konfirmasi
                              </Button>
                            )}
                            {order.status === "processing" && (
                              <Button size="sm" className="w-full">
                                Kirim
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}