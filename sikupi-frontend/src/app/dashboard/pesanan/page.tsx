import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pesanan - Dashboard Sikupi",
  description: "Kelola semua pesanan produk ampas kopi Anda. Lihat status, proses, dan lacak pengiriman.",
};

// Mock data - replace with actual API calls
const ORDERS = [
  {
    id: "ORD-001",
    customer: "Ahmad Fauzi",
    email: "ahmad.fauzi@email.com",
    product: "Ampas Kopi Grade A",
    quantity: "2 kg",
    total: "Rp 85.000",
    status: "pending",
    date: "2024-01-15",
    address: "Jl. Merdeka No. 123, Jakarta Pusat",
    payment: "Transfer Bank",
  },
  {
    id: "ORD-002",
    customer: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    product: "Ampas Kopi Grade B",
    quantity: "5 kg",
    total: "Rp 175.000",
    status: "processing",
    date: "2024-01-14",
    address: "Jl. Sudirman No. 456, Jakarta Selatan",
    payment: "E-Wallet",
  },
  {
    id: "ORD-003",
    customer: "Budi Santoso",
    email: "budi.santoso@email.com",
    product: "Ampas Kopi Grade A",
    quantity: "1 kg",
    total: "Rp 45.000",
    status: "shipped",
    date: "2024-01-13",
    address: "Jl. Thamrin No. 789, Jakarta Pusat",
    payment: "Kartu Kredit",
  },
  {
    id: "ORD-004",
    customer: "Rina Kartika",
    email: "rina.kartika@email.com",
    product: "Ampas Kopi Grade B",
    quantity: "3 kg",
    total: "Rp 120.000",
    status: "delivered",
    date: "2024-01-12",
    address: "Jl. Gatot Subroto No. 101, Jakarta Selatan",
    payment: "Transfer Bank",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return Clock;
    case "processing":
      return Package;
    case "shipped":
      return Truck;
    case "delivered":
      return CheckCircle;
    default:
      return AlertCircle;
  }
};

const filterOrdersByStatus = (orders: typeof ORDERS, status: string) => {
  if (status === "all") return orders;
  return orders.filter(order => order.status === status);
};

const getOrderCounts = (orders: typeof ORDERS) => {
  return {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };
};

function OrderCard({ order }: { order: typeof ORDERS[0] }) {
  const StatusIcon = getStatusIcon(order.status);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-4 w-4" />
            <CardTitle className="text-lg">#{order.id}</CardTitle>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
        </div>
        <CardDescription>{order.date}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Pelanggan</p>
            <p className="text-sm text-muted-foreground">{order.customer}</p>
            <p className="text-xs text-muted-foreground">{order.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Produk</p>
            <p className="text-sm text-muted-foreground">{order.product}</p>
            <p className="text-xs text-muted-foreground">{order.quantity}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Alamat Pengiriman</p>
            <p className="text-sm text-muted-foreground">{order.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Pembayaran</p>
            <p className="text-sm text-muted-foreground">{order.payment}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm font-medium">Total</p>
            <p className="text-lg font-bold text-primary">{order.total}</p>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const orderCounts = getOrderCounts(ORDERS);
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <DashboardHeader
          title="Pesanan"
          description="Kelola semua pesanan produk ampas kopi Anda."
          breadcrumbs={[{ label: "Pesanan" }]}
        />

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Cari Pesanan</CardTitle>
            <CardDescription>
              Cari pesanan berdasarkan ID, nama pelanggan, atau produk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari pesanan..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              Semua ({orderCounts.all})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Menunggu ({orderCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Diproses ({orderCounts.processing})
            </TabsTrigger>
            <TabsTrigger value="shipped">
              Dikirim ({orderCounts.shipped})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Selesai ({orderCounts.delivered})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ORDERS.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterOrdersByStatus(ORDERS, "pending").map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterOrdersByStatus(ORDERS, "processing").map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shipped" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterOrdersByStatus(ORDERS, "shipped").map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filterOrdersByStatus(ORDERS, "delivered").map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}