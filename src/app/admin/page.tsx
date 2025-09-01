'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { 
  Package,
  ShoppingCart, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  recentOrders: Array<{
    id: number
    customer: string
    total: number
    status: string
    created_at: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { session } = useAuth()

  useEffect(() => {
    if (session?.access_token) {
      fetchDashboardStats()
    }
  }, [session])

  const fetchDashboardStats = async () => {
    if (!session?.access_token) {
      setError('Authentication required')
      return
    }

    try {
      setLoading(true)
      
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      
      // Fetch multiple stats in parallel
      const [productsRes, ordersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/products?limit=1', { headers }),
        fetch('/api/admin/orders?limit=5', { headers }),
        fetch('/api/admin/analytics/sales/overview', { headers })
      ])

      const [products, orders, analytics] = await Promise.all([
        productsRes.ok ? productsRes.json() : { data: [], total: 0 },
        ordersRes.ok ? ordersRes.json() : { data: { orders: [], summary: { total_orders: 0 } } },
        analyticsRes.ok ? analyticsRes.json() : { data: { kpis: { monthly_revenue: 0 } } }
      ])

      // Debug logging
      console.log('API Responses:', { 
        products: { status: productsRes.status, data: products },
        orders: { status: ordersRes.status, data: orders },
        analytics: { status: analyticsRes.status, data: analytics }
      })

      // Safely access orders data - handle different response formats
      const ordersData = orders.data?.orders || []
      const ordersSummary = orders.data?.summary || {}
      
      // Process orders data
      const pendingOrders = ordersData.filter((order: any) => 
        ['new', 'pending_payment', 'paid'].includes(order.status)
      ).length
      
      const completedOrders = ordersData.filter((order: any) => 
        order.status === 'completed'
      ).length

      // Extract total revenue from analytics
      const totalRevenue = analytics.data?.kpis?.monthly_revenue || analytics.data?.total_revenue || 0

      setStats({
        totalProducts: products.data?.total || products.total || products.data?.length || 0,
        totalOrders: ordersSummary.total_orders || ordersData.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders: ordersData.slice(0, 5).map((order: any) => ({
          id: order.id,
          customer: order.customer?.name || 'Unknown',
          total: order.financial?.total_idr || 0,
          status: order.status,
          created_at: order.timestamps?.created_at
        }))
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'New', variant: 'secondary' as const },
      pending_payment: { label: 'Pending Payment', variant: 'destructive' as const },
      paid: { label: 'Paid', variant: 'default' as const },
      packed: { label: 'Packed', variant: 'default' as const },
      shipped: { label: 'Shipped', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'default' as const },
      cancelled: { label: 'Cancelled', variant: 'secondary' as const },
    }
    
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to Sikupi Admin</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {stats?.totalRevenue?.toLocaleString('id-ID') || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentOrders?.length ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">Rp {order.total.toLocaleString('id-ID')}</p>
                    <Badge variant={getStatusBadge(order.status).variant}>
                      {getStatusBadge(order.status).label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent orders</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}