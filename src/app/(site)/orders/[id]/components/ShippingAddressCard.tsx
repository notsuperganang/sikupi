import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, User, Phone } from 'lucide-react'

interface ShippingAddress {
  recipientName: string
  recipientPhone: string
  address: string
  area: string
  city: string
  province: string
  postalCode: string
  notes?: string
}

interface ShippingAddressCardProps {
  address: ShippingAddress
}

export default function ShippingAddressCard({ address }: ShippingAddressCardProps) {
  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Alamat Pengiriman
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-500 text-sm">Alamat pengiriman tidak tersedia</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Alamat Pengiriman
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Recipient Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-stone-600" />
            <span className="font-medium text-stone-900">{address.recipientName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-stone-600" />
            <span className="text-stone-700">{address.recipientPhone}</span>
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-1 text-sm">
          <p className="text-stone-900 font-medium">{address.address}</p>
          <p className="text-stone-700">
            {address.area}, {address.city}
          </p>
          <p className="text-stone-700">
            {address.province} {address.postalCode}
          </p>
        </div>

        {/* Address Notes */}
        {address.notes && (
          <div className="pt-3 border-t border-stone-200">
            <p className="text-xs text-stone-600">
              <span className="font-medium">Catatan:</span> {address.notes}
            </p>
          </div>
        )}

        {/* Visual Address Summary */}
        <div className="pt-3 border-t border-stone-200 bg-stone-50 -mx-6 px-6 py-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-stone-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-stone-600 leading-relaxed">
              {address.recipientName}<br />
              {address.address}, {address.area}<br />
              {address.city}, {address.province} {address.postalCode}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}