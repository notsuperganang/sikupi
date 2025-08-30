'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { XCircle, RefreshCw, ArrowLeft, Home, HelpCircle, Phone, Mail } from 'lucide-react'
import { fetchOrderDetails } from '@/lib/api-client'

export default function PaymentErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRetrying, setIsRetrying] = useState(false)

  const orderId = searchParams.get('order_id')
  const midtransOrderId = searchParams.get('midtrans_order_id')
  const errorMessage = searchParams.get('message') || 'Pembayaran gagal diproses'

  const handleRetryPayment = async () => {
    if (!orderId) {
      router.push('/checkout')
      return
    }

    setIsRetrying(true)
    
    try {
      // Check order status from backend using authenticated request
      const orderData = await fetchOrderDetails(orderId)

      if (orderData.order.status === 'paid') {
        // Payment actually succeeded, redirect to success
        router.push(`/checkout/success?order_id=${orderId}&midtrans_order_id=${midtransOrderId}`)
        return
      }

      // If order exists but payment failed, redirect to checkout with the existing order
      if (orderData.order.status === 'pending_payment' || orderData.order.status === 'new') {
        router.push('/checkout')
        return
      }

    } catch (error) {
      console.error('Error checking order status:', error)
      // Fallback to checkout page
      router.push('/checkout')
    } finally {
      setIsRetrying(false)
    }
  }

  const commonPaymentIssues = [
    {
      title: 'Saldo Tidak Mencukupi',
      description: 'Pastikan saldo e-wallet atau rekening Anda mencukupi untuk transaksi ini.',
    },
    {
      title: 'Jaringan Bermasalah',
      description: 'Koneksi internet yang tidak stabil dapat menyebabkan pembayaran gagal.',
    },
    {
      title: 'Limit Transaksi Terlampaui',
      description: 'Beberapa metode pembayaran memiliki limit transaksi harian.',
    },
    {
      title: 'Kartu Diblokir',
      description: 'Hubungi bank penerbit kartu jika transaksi terus ditolak.',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Pembayaran Gagal</h1>
          <p className="text-stone-600 text-lg mb-4">
            Maaf, terjadi kesalahan saat memproses pembayaran Anda
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
            <p className="text-red-700 font-medium">{errorMessage}</p>
            {midtransOrderId && (
              <p className="text-red-600 text-sm mt-1">Referensi: {midtransOrderId}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Apa yang bisa Anda lakukan?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              size="lg"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Memeriksa Status...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi Pembayaran
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/checkout')}
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Checkout
            </Button>
          </div>
        </Card>

        {/* Common Issues */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            Masalah Yang Sering Terjadi
          </h3>
          <div className="space-y-4">
            {commonPaymentIssues.map((issue, index) => (
              <div key={index} className="border-l-4 border-amber-200 pl-4">
                <h4 className="font-medium text-stone-900 mb-1">{issue.title}</h4>
                <p className="text-sm text-stone-600">{issue.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Support */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-stone-900 mb-4">Butuh Bantuan?</h3>
          <p className="text-stone-600 mb-4">
            Tim customer service kami siap membantu Anda menyelesaikan masalah pembayaran.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="mailto:support@sikupi.com"
              className="flex items-center gap-3 p-3 border border-stone-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="p-2 bg-amber-100 rounded-lg">
                <Mail className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="font-medium text-stone-900">Email Support</p>
                <p className="text-sm text-stone-600">support@sikupi.com</p>
              </div>
            </a>
            
            <a
              href="tel:+62-853-3857-3726"
              className="flex items-center gap-3 p-3 border border-stone-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="p-2 bg-amber-100 rounded-lg">
                <Phone className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="font-medium text-stone-900">Telepon</p>
                <p className="text-sm text-stone-600">+62-853-3857-3726</p>
              </div>
            </a>
          </div>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="text-stone-600 hover:text-stone-900"
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>

        {/* Order Info */}
        {orderId && (
          <div className="text-center mt-6 p-4 bg-stone-50 rounded-lg">
            <p className="text-sm text-stone-500">
              ID Pesanan: <span className="font-mono text-stone-700">#{orderId}</span>
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Simpan ID pesanan ini untuk referensi customer service
            </p>
          </div>
        )}
      </div>
    </div>
  )
}