'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CreditCard, Smartphone, Building2, ShieldCheck, Lock, ExternalLink } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
import { midtransClient } from '@/lib/midtrans-client'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast-context'
import type { ShippingAddress, SelectedCourier } from '../CheckoutPageClient'
import type { CartItemWithProduct, CartTotals } from '@/server/cart-adapter'

interface PaymentMethodProps {
  shippingAddress: ShippingAddress
  selectedCourier: SelectedCourier
  cartItems: CartItemWithProduct[]
  totals: CartTotals
  onCompleteOrder: () => void
  isProcessing: boolean
}

type PaymentOption = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  fee: number
  methods: Array<{
    code: string
    name: string
    icon?: string
  }>
}

export default function PaymentMethod({
  shippingAddress,
  selectedCourier,
  cartItems,
  totals,
  onCompleteOrder,
  isProcessing
}: PaymentMethodProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  const finalTotal = totals.subtotal - totals.discount + selectedCourier.price

  // Available payment methods via Midtrans
  const availablePaymentMethods = [
    { icon: '💳', name: 'Kartu Kredit/Debit' },
    { icon: '🏦', name: 'Virtual Account' },
    { icon: '💚', name: 'GoPay' },
    { icon: '💜', name: 'OVO' },
    { icon: '💙', name: 'DANA' },
    { icon: '🛒', name: 'Indomaret' },
    { icon: '🏪', name: 'Alfamart' },
  ]

  const handlePayment = async () => {
    if (!user || !shippingAddress || !selectedCourier) {
      toast.error('Data tidak lengkap', 'Pastikan semua informasi sudah diisi')
      return
    }

    setIsPaymentLoading(true)

    try {
      // Prepare payment payload
      const paymentPayload = {
        buyer_id: user.id,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          coffee_type: item.coffee_type,
          grind_level: item.grind_level,
          condition: item.condition
        })),
        shipping_address: {
          recipient_name: shippingAddress.recipient_name,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postal_code,
          area_id: shippingAddress.area_id || '',
        },
        shipping_fee_idr: selectedCourier.price,
        courier_company: selectedCourier.company,
        courier_service: selectedCourier.service_name,
        notes: shippingAddress.notes
      }

      console.log('🛒 Processing payment with payload:', paymentPayload)

      // Open Midtrans Snap payment
      const { orderId, midtransOrderId } = await midtransClient.payWithTransaction(
        paymentPayload,
        {
          onSuccess: (result) => {
            console.log('✅ Payment successful:', result)
            toast.success('Pembayaran berhasil!', 'Pesanan Anda sedang diproses')
            window.location.href = `/checkout/success?order_id=${orderId}&midtrans_order_id=${midtransOrderId}`
          },
          onPending: (result) => {
            console.log('⏳ Payment pending:', result)
            toast.info('Pembayaran tertunda', 'Silakan selesaikan pembayaran Anda')
            window.location.href = `/checkout/pending?order_id=${orderId}&midtrans_order_id=${midtransOrderId}`
          },
          onError: (result) => {
            console.error('❌ Payment error:', result)
            toast.error('Pembayaran gagal', result.status_message || 'Terjadi kesalahan saat memproses pembayaran')
            window.location.href = `/checkout/error?order_id=${orderId}&midtrans_order_id=${midtransOrderId}`
          },
          onClose: () => {
            console.log('🚪 Payment popup closed')
            setIsPaymentLoading(false)
            // Don't show error toast on close - user might just be reviewing
          }
        }
      )

      console.log('🎯 Payment initiated for order:', { orderId, midtransOrderId })

    } catch (error) {
      console.error('❌ Payment initiation failed:', error)
      toast.error(
        'Gagal memulai pembayaran', 
        error instanceof Error ? error.message : 'Terjadi kesalahan, silakan coba lagi'
      )
      setIsPaymentLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
        <h3 className="font-semibold text-stone-900 mb-3">Ringkasan Pesanan</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">Subtotal ({cartItems.length} item)</span>
            <span className="font-medium">{formatRupiah(totals.subtotal)}</span>
          </div>
          
          {totals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon</span>
              <span>-{formatRupiah(totals.discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-stone-600">Ongkir ({selectedCourier.company} - {selectedCourier.service_name})</span>
            <span className="font-medium">{formatRupiah(selectedCourier.price)}</span>
          </div>
          
          <div className="border-t border-stone-300 pt-2 flex justify-between font-semibold text-base">
            <span className="text-stone-900">Total Pembayaran</span>
            <span className="text-amber-700">{formatRupiah(finalTotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h3 className="font-semibold text-stone-900 mb-4">Metode Pembayaran</h3>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-stone-900 mb-2">Midtrans Payment Gateway</h4>
              <p className="text-sm text-stone-600 mb-3">
                Pilih dari berbagai metode pembayaran yang tersedia setelah klik tombol bayar
              </p>
              
              {/* Available payment methods preview */}
              <div className="flex items-center gap-2 flex-wrap">
                {availablePaymentMethods.map((method, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 text-xs bg-stone-100 px-2 py-1 rounded-md"
                  >
                    <span className="text-sm">{method.icon}</span>
                    <span className="text-stone-600">{method.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                <ExternalLink className="h-3 w-3" />
                <span>Halaman pembayaran akan terbuka di popup baru</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800 mb-1">Transaksi Aman</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                Pembayaran diproses melalui Midtrans dengan enkripsi SSL
              </p>
              <p>• Data pribadi dan keuangan Anda terlindungi 100%</p>
              <p>• Sistem pembayaran tersertifikasi internasional</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Button */}
      <div className="pt-4">
        <Button
          onClick={handlePayment}
          disabled={isPaymentLoading || isProcessing}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-base font-semibold"
          size="lg"
        >
          {(isPaymentLoading || isProcessing) ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Memproses Pembayaran...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Bayar {formatRupiah(finalTotal)}
            </>
          )}
        </Button>
        
        <div className="text-center mt-3">
          <p className="text-xs text-stone-500">
            Dengan menekan tombol di atas, Anda setuju dengan{' '}
            <a href="/terms" className="text-amber-600 hover:underline">
              Syarat & Ketentuan
            </a>{' '}
            dan{' '}
            <a href="/privacy" className="text-amber-600 hover:underline">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}