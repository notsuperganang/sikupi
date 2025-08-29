'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CreditCard, Smartphone, Building2, ShieldCheck, Lock } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
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
  const [selectedPayment, setSelectedPayment] = useState<string>('')

  const paymentOptions: PaymentOption[] = [
    {
      id: 'credit_card',
      name: 'Kartu Kredit/Debit',
      description: 'Visa, MasterCard, JCB',
      icon: <CreditCard className="h-5 w-5" />,
      fee: 0,
      methods: [
        { code: 'credit_card', name: 'Visa', icon: '💳' },
        { code: 'credit_card', name: 'MasterCard', icon: '💳' },
        { code: 'credit_card', name: 'JCB', icon: '💳' },
      ]
    },
    {
      id: 'bank_transfer',
      name: 'Transfer Bank',
      description: 'BCA, Mandiri, BRI, BNI',
      icon: <Building2 className="h-5 w-5" />,
      fee: 0,
      methods: [
        { code: 'bank_transfer', name: 'BCA Virtual Account', icon: '🏦' },
        { code: 'bank_transfer', name: 'Mandiri Virtual Account', icon: '🏦' },
        { code: 'bank_transfer', name: 'BRI Virtual Account', icon: '🏦' },
        { code: 'bank_transfer', name: 'BNI Virtual Account', icon: '🏦' },
      ]
    },
    {
      id: 'e_wallet',
      name: 'E-Wallet',
      description: 'GoPay, OVO, DANA, LinkAja',
      icon: <Smartphone className="h-5 w-5" />,
      fee: 0,
      methods: [
        { code: 'gopay', name: 'GoPay', icon: '💚' },
        { code: 'ovo', name: 'OVO', icon: '💜' },
        { code: 'dana', name: 'DANA', icon: '💙' },
        { code: 'linkaja', name: 'LinkAja', icon: '❤️' },
      ]
    },
  ]

  const finalTotal = totals.subtotal - totals.discount + selectedCourier.price
  const selectedOption = paymentOptions.find(option => option.id === selectedPayment)

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
        <h3 className="font-semibold text-stone-900 mb-4">Pilih Metode Pembayaran</h3>
        <div className="grid gap-3">
          {paymentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedPayment(option.id)}
              className={`w-full text-left border rounded-lg p-4 transition-all hover:shadow-sm ${
                selectedPayment === option.id
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  selectedPayment === option.id ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-stone-900 mb-1">{option.name}</h4>
                  <p className="text-sm text-stone-600 mb-2">{option.description}</p>
                  
                  {/* Payment method icons */}
                  <div className="flex items-center gap-2">
                    {option.methods.slice(0, 4).map((method, index) => (
                      <span key={index} className="text-lg" title={method.name}>
                        {method.icon}
                      </span>
                    ))}
                  </div>
                  
                  {option.fee > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      +{formatRupiah(option.fee)} biaya admin
                    </p>
                  )}
                </div>
                
                {selectedPayment === option.id && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
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
          onClick={onCompleteOrder}
          disabled={!selectedPayment || isProcessing}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-base font-semibold"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Memproses Pesanan...
            </>
          ) : (
            <>
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