'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search,
  MoreVertical,
  Eye,
  Truck,
  Package,
  Filter
} from 'lucide-react'

interface OrderItem {
  id: number
  title: string
  quantity: number
  unit: string
}

interface Order {
  id: number
  status: string
  customer: {
    name: string
    phone?: string
  }
  items: {
    count: number
    total_quantity: number
    preview: OrderItem[]
  }
  financial: {
    subtotal_idr: number
    shipping_fee_idr: number
    total_idr: number
    payment_status: string
  }
  shipping: {
    courier_company?: string
    courier_service?: string
    address?: any
    biteship_order_id?: string
    tracking_number?: string
    shipping_status?: string
  }
  timestamps: {
    created_at: string
    updated_at: string
    paid_at?: string
  }
  actions: Array<{
    action: string
    label: string
    status_target: string
    type: 'primary' | 'secondary' | 'danger'
  }>
}

export default function OrdersPage() {
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])

  useEffect(() => {
    if (session?.access_token) {
      fetchOrders()
    }
  }, [session])

  useEffect(() => {
    // Ensure orders is always an array
    const ordersArray = Array.isArray(orders) ? orders : []
    
    let filtered = ordersArray.filter(order =>
      order.id.toString().includes(searchQuery) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter])

  const fetchOrders = async () => {
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
      
      const response = await fetch('/api/admin/orders', { headers })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Orders API response:', data)
      
      // Handle different possible response structures
      let ordersData = []
      if (Array.isArray(data)) {
        ordersData = data
      } else if (Array.isArray(data.orders)) {
        ordersData = data.orders
      } else if (Array.isArray(data.data?.orders)) {
        // Admin API response structure: { success: true, data: { orders: [...] } }
        ordersData = data.data.orders
      } else if (Array.isArray(data.data)) {
        ordersData = data.data
      }
      
      setOrders(ordersData)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!session?.access_token) return

    try {
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ))

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  }

  const createShipment = async (orderId: number) => {
    if (!session?.access_token) return

    try {
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(`/api/admin/orders/${orderId}/create-shipment`, {
        method: 'POST',
        headers
      })

      if (!response.ok) {
        throw new Error('Failed to create shipment')
      }

      const data = await response.json()
      alert(`Shipment created! Tracking: ${data.tracking_number}`)
      
      // Refresh orders
      fetchOrders()
    } catch (error) {
      console.error('Failed to create shipment:', error)
      alert('Failed to create shipment')
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

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = {
      new: 'paid',
      pending_payment: 'paid',
      paid: 'packed',
      packed: 'shipped',
      shipped: 'completed'
    }
    
    return statusFlow[currentStatus as keyof typeof statusFlow] || null
  }

  const getStatusActions = (order: Order) => {
    const actions = []
    const nextStatus = getNextStatus(order.status)
    
    if (nextStatus) {
      actions.push(
        <DropdownMenuItem
          key="advance-status"
          onClick={() => updateOrderStatus(order.id, nextStatus)}
        >
          <Package className="mr-2 h-4 w-4" />
          Mark as {getStatusBadge(nextStatus).label}
        </DropdownMenuItem>
      )
    }
    
    if (order.status === 'packed' && !order.shipping.tracking_number) {
      actions.push(
        <DropdownMenuItem
          key="create-shipment"
          onClick={() => createShipment(order.id)}
        >
          <Truck className="mr-2 h-4 w-4" />
          Create Shipment
        </DropdownMenuItem>
      )
    }

    if (order.status !== 'completed' && order.status !== 'cancelled') {
      actions.push(
        <DropdownMenuSeparator key="sep" />,
        <DropdownMenuItem
          key="cancel"
          className="text-red-600"
          onClick={() => updateOrderStatus(order.id, 'cancelled')}
        >
          Cancel Order
        </DropdownMenuItem>
      )
    }

    return actions
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Manage customer orders and shipments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {statusFilter === 'all' ? 'All' : getStatusBadge(statusFilter).label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('new')}>
                  New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending_payment')}>
                  Pending Payment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('paid')}>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('shipped')}>
                  Shipped
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Orders Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchQuery || statusFilter !== 'all' ? 'No orders found matching your criteria' : 'No orders yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">#{order.id}</div>
                        {order.shipping.tracking_number && (
                          <div className="text-xs text-gray-500">
                            Track: {order.shipping.tracking_number}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{order.customer?.phone || 'No phone'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          Rp {order.financial.total_idr.toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.financial.payment_status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(order.status).variant}>
                          {getStatusBadge(order.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(order.timestamps.created_at).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.timestamps.created_at).toLocaleTimeString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {getStatusActions(order).length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                {getStatusActions(order)}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Order details and items
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Customer</h4>
                  <p>{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer?.phone}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Order Status</h4>
                  <Badge variant={getStatusBadge(selectedOrder.status).variant}>
                    {getStatusBadge(selectedOrder.status).label}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.preview?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="font-medium">Subtotal</TableCell>
                        <TableCell className="font-medium">
                          Rp {selectedOrder.financial.subtotal_idr.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="font-medium">Shipping</TableCell>
                        <TableCell className="font-medium">
                          Rp {selectedOrder.financial.shipping_fee_idr.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold">Total</TableCell>
                        <TableCell className="font-bold">
                          Rp {selectedOrder.financial.total_idr.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Shipment Info */}
              {selectedOrder.shipping.tracking_number && (
                <div>
                  <h4 className="font-medium mb-2">Shipment Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Tracking Number:</strong> {selectedOrder.shipping.tracking_number}</p>
                    <p><strong>Courier:</strong> {selectedOrder.shipping.courier_company}</p>
                    <p><strong>Service:</strong> {selectedOrder.shipping.courier_service}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}