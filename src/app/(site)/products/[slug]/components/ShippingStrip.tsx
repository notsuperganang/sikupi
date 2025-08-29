import { Truck, Shield, Clock, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ShippingStrip() {
  return (
    <div className="space-y-3">
      {/* Free Shipping Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-green-600" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-green-800">Gratis Ongkir</span>
              <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                Promo
              </Badge>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Minimal pembelian Rp 150.000 • S&K berlaku
            </p>
          </div>
          <Info className="w-4 h-4 text-green-600" />
        </div>
      </div>

      {/* Shipping Features */}
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex items-center space-x-2 text-stone-600">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Jaminan produk asli 100%</span>
        </div>
        
        <div className="flex items-center space-x-2 text-stone-600">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pengiriman dalam 1-2 hari kerja</span>
        </div>
        
        <div className="flex items-center space-x-2 text-stone-600">
          <Truck className="w-4 h-4 text-green-600" />
          <span>Tersedia berbagai pilihan kurir</span>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-amber-50 border border-amber-200 rounded p-2">
        <p className="text-xs text-amber-800">
          <strong>Info Pengiriman:</strong> Dikirim dari Banda Aceh. Estimasi tiba bervariasi tergantung lokasi dan kurir yang dipilih.
        </p>
      </div>
    </div>
  )
}