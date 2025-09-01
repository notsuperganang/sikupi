'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Download,
  Calendar,
  BarChart3,
  Users
} from 'lucide-react'

interface SalesOverview {
  monthly_revenue: number
  monthly_orders: number
  avg_order_value: number
  total_customers: number
  active_customers_30d: number
  conversion_rate_percent: number
}

interface SalesTrend {
  date: string
  total_revenue: number
  total_orders: number
  paid_orders: number
  unique_customers: number
}

interface ProductPerformance {
  product_id: number
  title: string
  total_quantity: number
  total_revenue: number
  order_count: number
  avg_price: number
  unit: string
  specifications?: {
    coffee_type?: string
    grind_level?: string
    condition?: string
  }
  image_url?: string
  performance_score?: number
}

export default function AnalyticsPage() {
  const { session } = useAuth()
  const [salesOverview, setSalesOverview] = useState<SalesOverview | null>(null)
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([])
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.access_token) {
      fetchAnalyticsData()
    }
  }, [session])

  const fetchAnalyticsData = async () => {
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
      
      // Fetch all analytics data in parallel
      const [overviewRes, trendsRes, productsRes] = await Promise.all([
        fetch('/api/admin/analytics/sales/overview', { headers }),
        fetch('/api/admin/analytics/sales/trends', { headers }),
        fetch('/api/admin/analytics/sales/products', { headers })
      ])

      const [overview, trends, products] = await Promise.all([
        overviewRes.ok ? overviewRes.json() : null,
        trendsRes.ok ? trendsRes.json() : { data: [] },
        productsRes.ok ? productsRes.json() : { data: [] }
      ])

      console.log('Analytics API responses:', { overview, trends, products })

      // Extract data from nested API response structure
      setSalesOverview(overview?.data?.kpis || null)
      setSalesTrends(trends?.data?.daily_data || [])
      setTopProducts(products?.data?.top_products || [])
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    if (!session?.access_token) {
      setError('Authentication required for export')
      return
    }

    try {
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch('/api/admin/analytics/export', { headers })
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Create download link for the exported data
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sikupi-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export data')
    }
  }

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'Rp 0'
    }
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <BarChart3 className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }

  const calculateTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  if (loading || !session) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics</h1>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      {salesOverview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(salesOverview?.monthly_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(salesOverview?.monthly_orders || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(salesOverview?.avg_order_value)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per order average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salesOverview?.active_customers_30d || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {(salesOverview?.conversion_rate_percent || 0)}% conversion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Sales Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        {/* Sales Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
              <CardDescription>
                Revenue and order trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesTrends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No sales trends data available</p>
                  <p className="text-sm">Data will appear as orders are placed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Simple table view of trends */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Avg Order Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(salesTrends) && salesTrends.slice(0, 10).map((trend, index) => {
                        const revenue = Number(trend?.total_revenue) || 0
                        const orders = Number(trend?.paid_orders) || 0
                        const avgOrderValue = orders > 0 ? revenue / orders : 0
                        const previousTrend = salesTrends[index + 1]
                        
                        return (
                          <TableRow key={trend?.date || index}>
                            <TableCell>
                              {trend?.date ? new Date(trend.date).toLocaleDateString('id-ID') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {formatCurrency(revenue)}
                                {previousTrend && getTrendIcon(revenue, Number(previousTrend?.total_revenue) || 0)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {orders}
                                {previousTrend && (
                                  <span className={`text-xs ${getTrendColor(trend.paid_orders, previousTrend.paid_orders)}`}>
                                    ({calculateTrendPercentage(trend.paid_orders, previousTrend.paid_orders) > 0 ? '+' : ''}
                                    {calculateTrendPercentage(trend.paid_orders, previousTrend.paid_orders)}%)
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(avgOrderValue)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Best selling products by revenue and quantity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No product performance data available</p>
                  <p className="text-sm">Data will appear as products are sold</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Avg Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, index) => {
                      const totalSold = Number(product?.total_quantity) || 0
                      const totalRevenue = Number(product?.total_revenue) || 0
                      const avgPrice = Number(product?.avg_price) || 0
                      
                      return (
                        <TableRow key={product?.product_id || index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-medium">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{product?.title || 'Unknown Product'}</p>
                                <p className="text-xs text-gray-500">ID: {product?.product_id || 'N/A'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {product?.specifications?.coffee_type || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{totalSold}</span>
                            <span className="text-xs text-gray-500 ml-1">{product?.unit || 'units'}</span>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(totalRevenue)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(avgPrice)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}