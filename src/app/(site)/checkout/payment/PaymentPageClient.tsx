'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Package,
  MapPin,
  Truck
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast-context'
import { fetchOrderDetails } from '@/lib/api-client'
import { midtransClient } from '@/lib/midtrans-client'
import { formatRupiah } from '@/lib/currency'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface Order {
  id: number
  status: string
  payment_status: string | null
  shipping_address: any
  courier_company: string
  courier_service: string
  notes: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
  midtrans_order_id: string | null
}

interface OrderItem {
  id: number
  product_id: number
  product_title: string
  price_idr: number
  quantity: number
  unit: string
  coffee_type: string
  grind_level: string
  condition: string
  image_url: string | null
  subtotal_idr: number
}

interface OrderSummary {
  total_items: number
  items_count: number
  subtotal_idr: number
  shipping_fee_idr: number
  total_idr: number
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800'
    case 'pending_payment':
      return 'bg-amber-100 text-amber-800'
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'new':
      return 'Baru'
    case 'pending_payment':
      return 'Menunggu Pembayaran'
    case 'paid':
      return 'Sudah Dibayar'
    case 'cancelled':
      return 'Dibatalkan'
    default:
      return status
  }
}

export default function PaymentPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const orderId = searchParams?.get('order_id')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info('Login diperlukan', 'Silakan login untuk melanjutkan pembayaran')
      router.push(`/login?returnTo=/checkout/payment?order_id=${orderId}`)
    }
  }, [user, authLoading, router, toast, orderId])

  // Fetch order details
  useEffect(() => {
    if (!orderId || !user || authLoading) return

    const loadOrderDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const orderData = await fetchOrderDetails(orderId)
        setOrder(orderData.order)
        setOrderItems(orderData.items)
        setOrderSummary(orderData.summary)
      } catch (error) {
        console.error('Failed to load order details:', error)
        setError(error instanceof Error ? error.message : 'Gagal memuat detail pesanan')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrderDetails()
  }, [orderId, user, authLoading])

  const handlePayment = async () => {
    if (!order || !user) return

    setIsPaymentLoading(true)

    try {
      // For pending orders, we need to create a new Snap token since the old one may have expired
      if (order.status === 'pending_payment' || order.status === 'new') {
        console.log('🔄 Creating new payment token for order:', order.id)
        
        // Get auth token for API request  
        const supabase = (await import('@/lib/supabase')).supabase
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        if (!token) {
          toast.error('Authentication error', 'Please refresh and try again')
          return
        }

        // Create new payment token for this order
        const response = await fetch(`/api/orders/${order.id}/retry-payment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          console.error('Failed to create new payment token:', result)
          toast.error('Gagal memulai pembayaran', result.error || 'Terjadi kesalahan')
          return
        }

        const { snap_token, midtrans_order_id } = result.data

        // Open Midtrans payment with new token
        await midtransClient.pay(snap_token, {
          onSuccess: (result) => {
            console.log('✅ Payment successful:', result)
            toast.success('Pembayaran berhasil!', 'Pesanan Anda sedang diproses')
            router.push(`/checkout/success?order_id=${order.id}&midtrans_order_id=${midtrans_order_id}`)
          },
          onPending: (result) => {
            console.log('⏳ Payment pending:', result)
            toast.info('Pembayaran tertunda', 'Silakan selesaikan pembayaran Anda')
            router.push(`/checkout/pending?order_id=${order.id}&midtrans_order_id=${midtrans_order_id}`)
          },
          onError: (result) => {
            console.error('❌ Payment error:', result)
            toast.error('Pembayaran gagal', result.status_message || 'Terjadi kesalahan saat memproses pembayaran')
          },
          onClose: () => {
            console.log('🚪 Payment popup closed')
            // Refresh order status when popup is closed
            handleRefreshStatus()
          }
        })
      } else {
        // Order cannot be paid
        toast.error('Kesalahan sistem', `Pesanan dengan status ${order.status} tidak dapat dibayar`)
        router.push('/orders')
      }
    } catch (error) {
      console.error('❌ Payment initiation error:', error)
      toast.error('Gagal memulai pembayaran', error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const handleRefreshStatus = async () => {
    if (!orderId || !user) return

    setIsRefreshing(true)

    try {
      const orderData = await fetchOrderDetails(orderId)
      setOrder(orderData.order)
      setOrderItems(orderData.items)
      setOrderSummary(orderData.summary)

      if (orderData.order.status === 'paid') {
        toast.success('Status diperbarui!', 'Pembayaran Anda telah dikonfirmasi')
      } else if (orderData.order.status === 'cancelled') {
        toast.info('Pesanan dibatalkan', 'Pesanan ini telah dibatalkan')
      }
    } catch (error) {
      console.error('Failed to refresh status:', error)
      toast.error('Gagal memperbarui status', 'Silakan coba lagi')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Memuat detail pesanan...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Pesanan
            </Link>
          </Button>
          
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Pesanan Tidak Ditemukan
            </h3>
            <p className="text-stone-600 mb-4">
              {error || 'Pesanan yang Anda cari tidak ditemukan atau tidak dapat diakses.'}
            </p>
            <Button asChild>
              <Link href="/orders">Lihat Pesanan Lainnya</Link>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const canPay = order.status === 'pending_payment' || order.status === 'new'

  return (
    <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Pesanan
            </Link>
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-amber-600" />
                Pembayaran Pesanan #{order.id}
              </h1>
              <p className="text-stone-600 mt-1">
                Dibuat {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: id })}
              </p>
            </div>
            
            <div className="text-right">
              <Badge className={getStatusColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="ml-3"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Status */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {order.status === 'paid' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Clock className="h-8 w-8 text-amber-600" />
                )}
                <div>
                  <h3 className="font-semibold text-stone-900">
                    {order.status === 'paid' ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}
                  </h3>
                  <p className="text-sm text-stone-600">
                    {order.status === 'paid' 
                      ? `Dibayar pada ${new Date(order.paid_at!).toLocaleString('id-ID')}`
                      : 'Silakan selesaikan pembayaran untuk melanjutkan pesanan Anda'
                    }
                  </p>
                </div>
              </div>

              {canPay && (
                <div className="space-y-4">
                  <Separator />
                  <div className="text-center">
                    <p className="text-sm text-stone-600 mb-4">
                      Metode pembayaran yang tersedia melalui Midtrans:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {['💳 Kartu Kredit/Debit', '🏦 Virtual Account', '💚 GoPay', '💜 OVO', '💙 DANA', '🛒 Indomaret', '🏪 Alfamart'].map((method) => (
                        <span key={method} className="text-xs bg-stone-100 px-2 py-1 rounded">
                          {method}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="lg"
                      onClick={handlePayment}
                      disabled={isPaymentLoading}
                      className="w-full sm:w-auto"
                    >
                      {isPaymentLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Bayar Sekarang
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {order.status === 'paid' && (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-green-900 mb-2">
                    Pembayaran Berhasil!
                  </h4>
                  <p className="text-green-700 mb-4">
                    Pesanan Anda sedang diproses dan akan segera dikirim.
                  </p>
                  <Button asChild variant="outline">
                    <Link href={`/orders/${order.id}`}>
                      <Package className="h-4 w-4 mr-2" />
                      Lihat Detail Pesanan
                    </Link>
                  </Button>
                </div>
              )}
            </Card>

            {/* Shipping Address */}
            <Card className="p-6">
              <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-stone-600" />
                Alamat Pengiriman
              </h3>
              {order.shipping_address && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.shipping_address.recipient_name}</p>
                  <p className="text-stone-600">{order.shipping_address.phone}</p>
                  <p className="text-stone-600">{order.shipping_address.address}</p>
                  <p className="text-stone-600">{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
                </div>
              )}
              
              {order.courier_company && (
                <div className="mt-4 pt-4 border-t border-stone-200">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Truck className="h-4 w-4" />
                    <span>{order.courier_company.toUpperCase()} - {order.courier_service}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="font-semibold text-stone-900 mb-4">Ringkasan Pesanan</h3>
              
              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-stone-900">{item.product_title}</p>
                      <p className="text-stone-600">
                        {item.quantity} {item.unit} × {formatRupiah(item.price_idr)}
                      </p>
                      <p className="text-xs text-stone-500">
                        {item.coffee_type} • {item.grind_level} • {item.condition}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatRupiah(item.subtotal_idr)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              {orderSummary && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatRupiah(orderSummary.subtotal_idr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span>{formatRupiah(orderSummary.shipping_fee_idr)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatRupiah(orderSummary.total_idr)}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-2">
                    {orderSummary.items_count} produk • {orderSummary.total_items} kg total
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="mt-4 pt-4 border-t border-stone-200">
                  <p className="text-xs text-stone-600 font-medium mb-1">Catatan:</p>
                  <p className="text-xs text-stone-500">{order.notes}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}