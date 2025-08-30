'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Package, Clock, ArrowRight, Home, FileText } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
import { useToast } from '@/lib/toast-context'
import { fetchOrderDetails } from '@/lib/api-client'

interface OrderDetails {
  order: {
    id: number
    midtrans_order_id: string
    status: string
    created_at: string
    shipping_address: any
  }
  items: Array<{
    product_title: string
    quantity: number
    price_idr: number
  }>
  summary: {
    total_idr: number
  }
}

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = searchParams.get('order_id')
  const midtransOrderId = searchParams.get('midtrans_order_id')

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId) {
        setError('ID pesanan tidak ditemukan')
        setIsLoading(false)
        return
      }

      try {
        console.log('🔍 Fetching order details for ID:', orderId)
        const data = await fetchOrderDetails(orderId)
        console.log('✅ Order details loaded:', data)
        setOrderDetails(data)
      } catch (error) {
        console.error('❌ Failed to fetch order details:', error)
        setError(
          error instanceof Error 
            ? error.message 
            : 'Gagal memuat detail pesanan'
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadOrderDetails()
  }, [orderId])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Memuat detail pesanan...</p>
        </div>
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Gagal Memuat Pesanan</h1>
            <p className="text-stone-600">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
            <Button onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-stone-600 text-lg">
            Terima kasih atas pembelian Anda. Pesanan sedang diproses.
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">Detail Pesanan</h2>
              <p className="text-stone-600">ID Pesanan: #{orderDetails.order.id}</p>
              {orderDetails.order.midtrans_order_id && (
                <p className="text-sm text-stone-500">Midtrans ID: {orderDetails.order.midtrans_order_id}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-700">
                {formatRupiah(orderDetails.summary.total_idr)}
              </p>
              <p className="text-sm text-stone-500">
                {new Date(orderDetails.order.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-stone-900 mb-3">Item Pesanan</h3>
            <div className="space-y-2">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{item.product_title}</p>
                    <p className="text-sm text-stone-600">Qty: {item.quantity} kg</p>
                  </div>
                  <p className="font-medium text-stone-900">
                    {formatRupiah(item.price_idr * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {orderDetails.order.shipping_address && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-stone-900 mb-2">Alamat Pengiriman</h3>
              <div className="text-sm text-stone-600">
                <p className="font-medium">{orderDetails.order.shipping_address.recipient_name}</p>
                <p>{orderDetails.order.shipping_address.phone}</p>
                <p>{orderDetails.order.shipping_address.address}</p>
                <p>{orderDetails.order.shipping_address.city}, {orderDetails.order.shipping_address.postal_code}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Next Steps */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Langkah Selanjutnya
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-700">1</span>
              </div>
              <div>
                <p className="font-medium text-stone-900">Konfirmasi Pesanan</p>
                <p className="text-sm text-stone-600">Kami akan mengkonfirmasi pesanan Anda dalam 1-2 jam kerja</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-700">2</span>
              </div>
              <div>
                <p className="font-medium text-stone-900">Persiapan Barang</p>
                <p className="text-sm text-stone-600">Barang akan disiapkan dan dikemas dalam 1-2 hari kerja</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-amber-700">3</span>
              </div>
              <div>
                <p className="font-medium text-stone-900">Pengiriman</p>
                <p className="text-sm text-stone-600">Barang akan dikirim dan Anda akan menerima nomor resi</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => router.push('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
          <Button 
            className="flex-1 bg-amber-600 hover:bg-amber-700"
            onClick={() => router.push('/orders')}
          >
            <Package className="h-4 w-4 mr-2" />
            Lihat Pesanan Saya
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-stone-500 mb-2">
            Butuh bantuan? Hubungi customer service kami
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="mailto:support@sikupi.com" className="text-amber-600 hover:underline">
              support@sikupi.com
            </a>
            <span className="text-stone-300">|</span>
            <a href="tel:+62-853-3857-3726" className="text-amber-600 hover:underline">
              +62-853-3857-3726
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}