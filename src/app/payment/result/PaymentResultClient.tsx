'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  ArrowRight,
  Home,
  FileText,
  Loader2
} from 'lucide-react'
import { useToast } from '@/lib/toast-context'
import { formatRupiah } from '@/lib/currency'

interface PaymentVerificationResult {
  success: boolean
  error?: string
  data: {
    order_id: number
    status: string
    payment_status: string
    fraud_status?: string
    paid_at: string | null
    midtrans_order_id: string | null
    updated: boolean
    verification_source: 'midtrans_api' | 'database' | 'database_fallback'
    midtrans_data?: {
      transaction_id: string
      transaction_time: string
      payment_type: string
      gross_amount: string
      status_message: string
    }
    message: string
  }
}

interface OrderDetails {
  order: {
    id: number
    status: string
    payment_status: string | null
    shipping_address: any
    courier_company: string | null
    courier_service: string | null
    total_idr: number
    created_at: string
    midtrans_order_id: string | null
  }
  items: Array<{
    product_title: string
    quantity: number
    price_idr: number
    unit: string
    coffee_type: string
    grind_level: string
    condition: string
  }>
  summary: {
    total_idr: number
    subtotal_idr: number
    shipping_fee_idr: number
    total_items: number
    items_count: number
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return CheckCircle
    case 'cancelled':
    case 'expire':
      return XCircle
    case 'pending_payment':
      return Clock
    default:
      return AlertTriangle
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'text-green-600'
    case 'cancelled':
    case 'expire':
      return 'text-red-600'
    case 'pending_payment':
      return 'text-amber-600'
    default:
      return 'text-stone-600'
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
    case 'expire':
      return 'bg-red-100 text-red-800'
    case 'pending_payment':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-stone-100 text-stone-800'
  }
}

const getStatusMessage = (status: string, paymentType?: string) => {
  switch (status) {
    case 'paid':
      return {
        title: 'Pembayaran Berhasil!',
        description: `Terima kasih! Pembayaran Anda telah dikonfirmasi${paymentType ? ` via ${paymentType}` : ''}. Pesanan sedang diproses dan akan segera dikirim.`
      }
    case 'pending_payment':
      return {
        title: 'Pembayaran Tertunda',
        description: 'Pembayaran Anda sedang diproses. Harap tunggu konfirmasi atau selesaikan pembayaran jika belum.'
      }
    case 'cancelled':
      return {
        title: 'Pembayaran Dibatalkan',
        description: 'Pembayaran telah dibatalkan. Anda dapat mencoba membayar lagi atau menghubungi customer service.'
      }
    case 'expire':
      return {
        title: 'Pembayaran Kedaluwarsa',
        description: 'Batas waktu pembayaran telah berakhir. Silakan buat pesanan baru atau hubungi customer service.'
      }
    default:
      return {
        title: 'Status Tidak Dikenal',
        description: 'Terjadi kesalahan dalam memverifikasi pembayaran. Silakan hubungi customer service.'
      }
  }
}

export default function PaymentResultClient() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get parameters from URL
  const orderId = searchParams?.get('order_id')

  useEffect(() => {
    if (!orderId) {
      setError('ID pesanan tidak ditemukan dalam URL')
      setIsLoading(false)
      return
    }

    verifyPaymentStatus()
  }, [orderId])

  const verifyPaymentStatus = async () => {
    if (!orderId) return

    setIsLoading(true)
    setError(null)

    try {
      console.log(`🔍 Verifying payment status for order ${orderId}`)

      // Call our payment status verification API
      const response = await fetch(`/api/payments/midtrans/status?order_id=${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal memverifikasi status pembayaran')
      }

      setVerificationResult(result as PaymentVerificationResult)
      console.log('Payment verification result:', result)

      // Show toast for status updates
      if (result.data.updated) {
        if (result.data.status === 'paid') {
          toast.success('Pembayaran Berhasil!', 'Status pesanan telah diperbarui')
        } else if (result.data.status === 'cancelled') {
          toast.error('Pembayaran Dibatalkan', 'Status pesanan telah diperbarui')
        }
      }

      // If payment is successful, try to load full order details
      if (result.data.status === 'paid') {
        await loadOrderDetails()
      }

    } catch (error) {
      console.error('Payment verification error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak dikenal'
      setError(errorMessage)
      toast.error('Gagal memverifikasi pembayaran', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrderDetails = async () => {
    if (!orderId) return

    try {
      // Try to load order details (this requires authentication, so it might fail)
      // We'll make this optional since payment result page should work without auth
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (response.ok) {
        const orderData = await response.json()
        if (orderData.success) {
          setOrderDetails(orderData.data)
        }
      }
      // Don't set error if order details fail - this is optional
    } catch (error) {
      console.log('Could not load order details (likely not authenticated):', error)
      // This is expected for non-authenticated users, so don't show error
    }
  }

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    await verifyPaymentStatus()
    setIsRefreshing(false)
  }


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-600" />
          <h2 className="text-xl font-semibold text-stone-900 mb-2">
            Memverifikasi Pembayaran...
          </h2>
          <p className="text-stone-600">
            Sedang memeriksa status pembayaran dengan gateway pembayaran
          </p>
        </div>
      </div>
    )
  }

  if (error || !verificationResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-900 mb-2">
              Gagal Memverifikasi Pembayaran
            </h2>
            <p className="text-stone-600 mb-6">
              {error || 'Terjadi kesalahan saat memeriksa status pembayaran'}
            </p>
            
            <div className="space-y-3">
              <Button onClick={handleRefreshStatus} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Coba Lagi
              </Button>
              
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/orders">
                    <FileText className="h-4 w-4 mr-2" />
                    Lihat Pesanan
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Beranda
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const { data } = verificationResult
  const statusInfo = getStatusMessage(data.status, data.midtrans_data?.payment_type)
  const StatusIcon = getStatusIcon(data.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <StatusIcon className={`h-16 w-16 mx-auto mb-4 ${getStatusColor(data.status)}`} />
          
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            {statusInfo.title}
          </h1>
          <p className="text-stone-600 mb-4">
            {statusInfo.description}
          </p>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge className={getStatusBadgeColor(data.status)}>
              {data.status === 'paid' ? 'Dibayar' : 
               data.status === 'pending_payment' ? 'Menunggu Pembayaran' :
               data.status === 'cancelled' ? 'Dibatalkan' :
               data.status === 'expire' ? 'Kedaluwarsa' : data.status}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <p className="text-sm text-stone-500">
            Pesanan #{data.order_id} • Diverifikasi {data.verification_source === 'midtrans_api' ? 'langsung dari Midtrans' : 'dari database'}
          </p>
        </div>

        {/* Payment Details */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5" />
            Detail Pembayaran
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>ID Pesanan:</span>
              <span className="font-medium">#{data.order_id}</span>
            </div>
            
            {data.midtrans_order_id && (
              <div className="flex justify-between">
                <span>ID Transaksi:</span>
                <span className="font-medium">{data.midtrans_order_id}</span>
              </div>
            )}
            
            {data.midtrans_data?.payment_type && (
              <div className="flex justify-between">
                <span>Metode Pembayaran:</span>
                <span className="font-medium capitalize">{data.midtrans_data.payment_type.replace('_', ' ')}</span>
              </div>
            )}
            
            {data.midtrans_data?.gross_amount && (
              <div className="flex justify-between">
                <span>Total Pembayaran:</span>
                <span className="font-medium">{formatRupiah(parseInt(data.midtrans_data.gross_amount))}</span>
              </div>
            )}
            
            {data.paid_at && (
              <div className="flex justify-between">
                <span>Dibayar pada:</span>
                <span className="font-medium">
                  {new Date(data.paid_at).toLocaleString('id-ID')}
                </span>
              </div>
            )}
            
            {data.midtrans_data?.transaction_time && (
              <div className="flex justify-between">
                <span>Waktu Transaksi:</span>
                <span className="font-medium">
                  {new Date(data.midtrans_data.transaction_time).toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>

          {data.updated && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Status berhasil diperbarui berdasarkan verifikasi dengan gateway pembayaran
              </p>
            </div>
          )}
        </Card>

        {/* Order Details (if available) */}
        {orderDetails && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-stone-900 flex items-center gap-2 mb-4">
              <Package className="h-5 w-5" />
              Detail Pesanan
            </h3>
            
            <div className="space-y-3 mb-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.product_title}</p>
                    <p className="text-stone-600">
                      {item.quantity} {item.unit} • {item.coffee_type} • {item.grind_level}
                    </p>
                  </div>
                  <p className="font-medium">{formatRupiah(item.price_idr * item.quantity)}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(orderDetails.summary.subtotal_idr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim:</span>
                <span>{formatRupiah(orderDetails.summary.shipping_fee_idr)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>Total:</span>
                <span>{formatRupiah(orderDetails.summary.total_idr)}</span>
              </div>
            </div>

            {orderDetails.order.courier_company && (
              <div className="mt-4 pt-4 border-t border-stone-200">
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Truck className="h-4 w-4" />
                  <span>{orderDetails.order.courier_company.toUpperCase()} - {orderDetails.order.courier_service}</span>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {data.status === 'paid' && (
            <Button asChild className="w-full">
              <Link href={`/orders/${data.order_id}`}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Lihat Detail Pesanan
              </Link>
            </Button>
          )}

          {data.status === 'pending_payment' && (
            <Button asChild className="w-full">
              <Link href={`/checkout/payment?order_id=${data.order_id}`}>
                <CreditCard className="h-4 w-4 mr-2" />
                Selesaikan Pembayaran
              </Link>
            </Button>
          )}

          {(data.status === 'cancelled' || data.status === 'expire') && (
            <Button asChild className="w-full">
              <Link href="/products">
                <Package className="h-4 w-4 mr-2" />
                Buat Pesanan Baru
              </Link>
            </Button>
          )}

          <div className="flex gap-3">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/orders">
                <FileText className="h-4 w-4 mr-2" />
                Semua Pesanan
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Beranda
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}