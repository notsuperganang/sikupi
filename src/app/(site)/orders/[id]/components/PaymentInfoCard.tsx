import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, Hash } from 'lucide-react'

interface PaymentInfo {
  provider: string
  method: string | null
  transactionId: string | null
  status: string | null
}

interface PaymentInfoCardProps {
  payment: PaymentInfo
  paidAt: string | null
}

const getPaymentStatusBadge = (status: string | null) => {
  switch (status) {
    case 'settlement':
    case 'capture':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'deny':
    case 'cancel':
    case 'expire':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-stone-100 text-stone-800 border-stone-200'
  }
}

const getPaymentStatusLabel = (status: string | null) => {
  switch (status) {
    case 'settlement':
      return 'Berhasil'
    case 'capture':
      return 'Ditangkap'
    case 'pending':
      return 'Menunggu'
    case 'deny':
      return 'Ditolak'
    case 'cancel':
      return 'Dibatalkan'
    case 'expire':
      return 'Kedaluwarsa'
    default:
      return status || 'Tidak Diketahui'
  }
}

const getPaymentMethodLabel = (method: string | null) => {
  switch (method) {
    case 'bank_transfer':
      return 'Transfer Bank'
    case 'credit_card':
      return 'Kartu Kredit'
    case 'gopay':
      return 'GoPay'
    case 'shopeepay':
      return 'ShopeePay'
    case 'qris':
      return 'QRIS'
    case 'alfamart':
      return 'Alfamart'
    case 'indomaret':
      return 'Indomaret'
    default:
      return method || 'Belum Dipilih'
  }
}

const getProviderLabel = (provider: string) => {
  switch (provider) {
    case 'midtrans':
      return 'Midtrans'
    case 'manual':
      return 'Manual'
    default:
      return provider
  }
}

export default function PaymentInfoCard({ payment, paidAt }: PaymentInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Informasi Pembayaran
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Provider */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600">Provider</span>
          <span className="font-medium text-stone-900">
            {getProviderLabel(payment.provider)}
          </span>
        </div>

        {/* Payment Method */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600">Metode</span>
          <span className="font-medium text-stone-900">
            {getPaymentMethodLabel(payment.method)}
          </span>
        </div>

        {/* Payment Status */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600">Status</span>
          <Badge variant="outline" className={getPaymentStatusBadge(payment.status)}>
            {getPaymentStatusLabel(payment.status)}
          </Badge>
        </div>

        {/* Transaction ID */}
        {payment.transactionId && (
          <div className="flex justify-between items-start">
            <span className="text-sm text-stone-600 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              ID Transaksi
            </span>
            <span className="font-mono text-xs text-stone-900 break-all">
              {payment.transactionId}
            </span>
          </div>
        )}

        {/* Payment Date */}
        {paidAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Dibayar Pada
            </span>
            <span className="text-sm font-medium text-stone-900">
              {new Date(paidAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {/* Payment Summary */}
        <div className="pt-3 border-t border-stone-200 bg-stone-50 -mx-6 px-6 py-3">
          <div className="text-center">
            <div className="text-sm text-stone-600 mb-1">Status Pembayaran</div>
            <div className={`font-semibold ${
              payment.status === 'settlement' || payment.status === 'capture' 
                ? 'text-green-600' 
                : payment.status === 'pending'
                  ? 'text-amber-600'
                  : 'text-red-600'
            }`}>
              {paidAt ? 'Pembayaran Berhasil' : 'Belum Dibayar'}
            </div>
            {paidAt && (
              <div className="text-xs text-stone-500 mt-1">
                via {getPaymentMethodLabel(payment.method)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}