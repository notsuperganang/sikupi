import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Truck, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Package2, 
  AlertCircle 
} from 'lucide-react'
import { OrderData, TrackingData } from '../OrderDetailClient'

interface TrackingTimelineProps {
  order: OrderData
  trackingData: TrackingData | null
  onRefresh: () => void
  isRefreshing: boolean
}

const getTrackingStatusBadge = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'picked':
    case 'in_transit':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'cancelled':
    case 'returned':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    default:
      return 'bg-stone-100 text-stone-800 border-stone-200'
  }
}

const getTrackingStatusLabel = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case 'picked':
      return 'Diambil Kurir'
    case 'in_transit':
      return 'Dalam Perjalanan'
    case 'delivered':
      return 'Terkirim'
    case 'cancelled':
      return 'Dibatalkan'
    case 'returned':
      return 'Dikembalikan'
    case 'pending':
      return 'Menunggu'
    default:
      return status || 'Tidak Diketahui'
  }
}

export default function TrackingTimeline({ 
  order, 
  trackingData, 
  onRefresh, 
  isRefreshing 
}: TrackingTimelineProps) {
  const hasShippingInfo = order.shipping.courier || order.shipping.waybill || order.status === 'paid' || order.status === 'packed' || order.status === 'shipped' || order.status === 'completed'
  const hasBiteshipOrderId = order.shipping.biteshipOrderId
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Pelacakan Pengiriman
          </CardTitle>
          
          {hasBiteshipOrderId && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Memuat...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasShippingInfo ? (
          <div className="text-center py-8">
            <Package2 className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <p className="text-stone-600 mb-2">Belum Ada Informasi Pengiriman</p>
            <p className="text-sm text-stone-500">
              Informasi pengiriman akan muncul setelah pesanan diproses
            </p>
          </div>
        ) : (
          <>
            {/* Order Status Info */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">Status Pesanan</span>
                <span className="font-medium text-stone-900 capitalize">
                  {order.status === 'paid' && 'Dibayar - Siap Diproses'}
                  {order.status === 'packed' && 'Dikemas - Siap Dikirim'}
                  {order.status === 'shipped' && 'Dikirim'}
                  {order.status === 'completed' && 'Selesai'}
                  {!['paid', 'packed', 'shipped', 'completed'].includes(order.status) && 'Menunggu Pembayaran'}
                </span>
              </div>
            </div>

            {/* Shipping Basic Info */}
            <div className="space-y-3">
              {order.shipping.courier && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-600">Kurir</span>
                  <span className="font-medium text-stone-900 uppercase">
                    {order.shipping.courier}
                  </span>
                </div>
              )}
              
              {order.shipping.service && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-600">Layanan</span>
                  <span className="font-medium text-stone-900">
                    {order.shipping.service}
                  </span>
                </div>
              )}
              
              {order.shipping.waybill && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-600">Nomor Resi</span>
                  <span className="font-mono text-sm font-medium text-stone-900">
                    {order.shipping.waybill}
                  </span>
                </div>
              )}

              {order.shipping.eta && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Estimasi Tiba
                  </span>
                  <span className="text-sm font-medium text-stone-900">
                    {new Date(order.shipping.eta).toLocaleDateString('id-ID')}
                  </span>
                </div>
              )}
            </div>

            {/* Tracking Status */}
            {trackingData && (
              <>
                <div className="pt-4 border-t border-stone-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-stone-900">Status Terkini</span>
                    <Badge variant="outline" className={getTrackingStatusBadge(trackingData.status)}>
                      {getTrackingStatusLabel(trackingData.status)}
                    </Badge>
                  </div>
                </div>

                {/* Tracking History */}
                {trackingData.history && trackingData.history.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-stone-900">Riwayat Pengiriman</h4>
                    <div className="space-y-3">
                      {trackingData.history.map((event, index) => (
                        <div key={index} className="relative">
                          {/* Timeline dot */}
                          <div className="flex items-start gap-3">
                            <div className={`
                              w-3 h-3 rounded-full border-2 mt-1 flex-shrink-0
                              ${index === 0 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'bg-white border-stone-300'
                              }
                            `} />
                            
                            {/* Event content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <p className="text-sm font-medium text-stone-900">
                                  {event.status}
                                </p>
                                <span className="text-xs text-stone-500">
                                  {new Date(event.time).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3 text-stone-500" />
                                  <span className="text-xs text-stone-600">
                                    {event.location}
                                  </span>
                                </div>
                              )}
                              
                              {event.note && (
                                <p className="text-xs text-stone-500 mt-1">
                                  {event.note}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Timeline line */}
                          {index < trackingData.history.length - 1 && (
                            <div className="absolute left-1.5 top-4 w-0.5 h-6 bg-stone-200" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                {trackingData.updatedAt && (
                  <div className="pt-3 border-t border-stone-200">
                    <p className="text-xs text-stone-500 text-center">
                      Diperbarui {new Date(trackingData.updatedAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* No tracking data available */}
            {!trackingData && hasBiteshipOrderId && (
              <div className="text-center py-4 border-t border-stone-200">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-stone-600 mb-2">
                  {order.shipping.waybill 
                    ? 'Data pelacakan sedang diproses'
                    : 'Menunggu nomor resi dari kurir'
                  }
                </p>
                <p className="text-xs text-stone-500 mb-3">
                  {order.shipping.waybill 
                    ? 'Tracking akan tersedia setelah kurir memproses paket'
                    : 'Nomor resi akan muncul setelah kurir mengambil paket'
                  }
                </p>
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                  💡 Tip: Klik "Refresh Tracking" untuk mendapatkan update terbaru dari Biteship
                </div>
              </div>
            )}

            {/* No Biteship integration */}
            {!hasBiteshipOrderId && (
              <div className="text-center py-4 border-t border-stone-200">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-stone-600 mb-2">
                  Pengiriman Belum Dibuat
                </p>
                <p className="text-xs text-stone-500 mb-3">
                  {order.status === 'paid' 
                    ? 'Klik "Periksa Status Pembayaran" untuk membuat pengiriman otomatis'
                    : order.status === 'packed' 
                      ? 'Paket sudah dikemas, siap untuk dikirim'
                      : 'Pengiriman akan dibuat setelah pembayaran dikonfirmasi'
                  }
                </p>
                {order.status === 'paid' && (
                  <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                    💡 Tip: Gunakan tombol "Periksa Status Pembayaran" di atas untuk membuat pengiriman Biteship secara otomatis
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}