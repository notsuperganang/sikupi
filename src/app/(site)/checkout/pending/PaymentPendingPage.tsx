'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Clock, AlertCircle, RefreshCw, CheckCircle, ArrowRight, Home, Copy, ExternalLink } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
import { useToast } from '@/lib/toast-context'
import { fetchOrderDetails } from '@/lib/api-client'

interface OrderDetails {
  order: {
    id: number
    midtrans_order_id: string
    status: string
    created_at: string
  }
  summary: {
    total_idr: number
  }
}

export default function PaymentPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')

  const orderId = searchParams.get('order_id')
  const midtransOrderId = searchParams.get('midtrans_order_id')

  // Countdown timer for payment expiry (24 hours from creation)
  useEffect(() => {
    if (!orderDetails?.order.created_at) return

    const updateTimer = () => {
      // Set expiry to 24 hours from creation
      const creationTime = new Date(orderDetails.order.created_at).getTime()
      const expiryTime = creationTime + (24 * 60 * 60 * 1000) // 24 hours
      const now = new Date().getTime()
      const difference = expiryTime - now

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setTimeLeft('Expired')
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [orderDetails?.order.created_at])

  const loadOrderDetails = async () => {
    if (!orderId) return

    try {
      console.log('🔍 Fetching order details for pending payment, ID:', orderId)
      const data = await fetchOrderDetails(orderId)
      console.log('✅ Order details loaded:', data)
      setOrderDetails(data)

      // If payment is now completed, redirect to success
      if (data.order.status === 'paid') {
        toast.success('Pembayaran berhasil!', 'Mengalihkan ke halaman konfirmasi...')
        setTimeout(() => {
          router.push(`/checkout/success?order_id=${orderId}&midtrans_order_id=${midtransOrderId}`)
        }, 1500)
      }
    } catch (error) {
      console.error('❌ Failed to fetch order details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    setIsChecking(true)
    await loadOrderDetails()
    setIsChecking(false)
  }

  useEffect(() => {
    loadOrderDetails()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!isChecking) {
        loadOrderDetails()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [orderId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Disalin!', 'ID pesanan berhasil disalin ke clipboard')
  }

  const paymentMethods = [
    { type: 'bank_transfer', name: 'Transfer Bank', instructions: 'Transfer ke Virtual Account yang tersedia' },
    { type: 'credit_card', name: 'Kartu Kredit', instructions: 'Selesaikan pembayaran di halaman bank Anda' },
    { type: 'echannel', name: 'Mandiri Bill Payment', instructions: 'Bayar melalui ATM atau Internet Banking Mandiri' },
    { type: 'gopay', name: 'GoPay', instructions: 'Buka aplikasi Gojek dan selesaikan pembayaran' },
    { type: 'qris', name: 'QRIS', instructions: 'Scan QR code dengan aplikasi pembayaran Anda' },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Memuat status pembayaran...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Pesanan Tidak Ditemukan</h1>
          <p className="text-stone-600 mb-6">Maaf, kami tidak dapat menemukan detail pesanan Anda.</p>
          <Button onClick={() => router.push('/')}>
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    )
  }

  const isExpired = timeLeft === 'Expired'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Pending Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {isExpired ? 'Pembayaran Kedaluwarsa' : 'Menunggu Pembayaran'}
          </h1>
          <p className="text-stone-600 text-lg">
            {isExpired 
              ? 'Batas waktu pembayaran telah habis' 
              : 'Silakan selesaikan pembayaran Anda untuk melanjutkan pesanan'
            }
          </p>
        </div>

        {/* Timer and Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-stone-900">Status Pesanan</h2>
              <div className="flex items-center gap-2">
                <span className="text-stone-600">ID Pesanan: #{orderDetails.order.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(orderDetails.order.id.toString())}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-700">
                {formatRupiah(orderDetails.summary.total_idr)}
              </p>
              {!isExpired && timeLeft && (
                <p className="text-sm text-orange-600 font-mono">
                  Sisa waktu: {timeLeft}
                </p>
              )}
            </div>
          </div>

          {isExpired ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Pembayaran Kedaluwarsa</span>
              </div>
              <p className="text-red-600 text-sm">
                Batas waktu pembayaran telah habis. Silakan buat pesanan baru jika masih ingin membeli.
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Menunggu Pembayaran</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkPaymentStatus}
                  disabled={isChecking}
                  className="text-orange-700 border-orange-300"
                >
                  {isChecking ? (
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Cek Status
                </Button>
              </div>
            </div>
          )}
        </Card>

        {!isExpired && (
          <>
            {/* Payment Instructions */}
            <Card className="p-6 mb-6">
              <h3 className="font-semibold text-stone-900 mb-4">Cara Menyelesaikan Pembayaran</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-amber-700">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">Buka Aplikasi atau Website Bank/E-wallet Anda</p>
                    <p className="text-sm text-stone-600">Gunakan metode pembayaran yang Anda pilih saat checkout</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-amber-700">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">Selesaikan Pembayaran</p>
                    <p className="text-sm text-stone-600">Ikuti instruksi yang diberikan oleh penyedia pembayaran</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-amber-700">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">Tunggu Konfirmasi</p>
                    <p className="text-sm text-stone-600">Status pesanan akan otomatis terupdate setelah pembayaran berhasil</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Auto Refresh Notice */}
            <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Otomatis Update:</strong> Halaman ini akan otomatis memperbarui status pembayaran setiap 30 detik.
                </p>
              </div>
            </Card>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {isExpired ? (
            <>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                onClick={() => router.push('/checkout')}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Buat Pesanan Baru
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </>
          ) : (
            <>
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
                onClick={checkPaymentStatus}
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Mengecek Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-sm text-stone-500 mb-2">Butuh bantuan?</p>
          <div className="flex justify-center gap-4 text-sm">
            <a 
              href="mailto:support@sikupi.com" 
              className="text-amber-600 hover:underline flex items-center gap-1"
            >
              support@sikupi.com
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-stone-300">|</span>
            <a 
              href="tel:+62-853-3857-3726" 
              className="text-amber-600 hover:underline flex items-center gap-1"
            >
              +62-853-3857-3726
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}