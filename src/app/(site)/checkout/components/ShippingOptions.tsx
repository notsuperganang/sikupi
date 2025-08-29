'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Truck, Clock, Star, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/lib/currency'
import { useToast } from '@/lib/toast-context'
import type { ShippingAddress, SelectedCourier } from '../CheckoutPageClient'
import type { CartItemWithProduct } from '@/server/cart-adapter'

interface CourierOption {
  company: string
  courier_code: string
  service_code: string
  service_name: string
  price: number
  formatted_price: string
  duration: string
  duration_range: string
  duration_unit: string
  service_type: string
  description: string
  available_cod: boolean
  available_insurance: boolean
  company_rating?: number
  company_rating_count?: number
  courier_logo?: string
}

interface ShippingRatesResponse {
  success: boolean
  data: {
    rates: CourierOption[]
    total_items: number
    total_weight_kg: number
    total_value: number
    formatted_total_value: string
    destination: {
      city: string
      postal_code: string
      area_id: string
    }
  }
}

interface ShippingOptionsProps {
  shippingAddress: ShippingAddress
  cartItems: CartItemWithProduct[]
  onCourierSelect: (courier: SelectedCourier) => void
  selectedCourier?: SelectedCourier | null
}

export default function ShippingOptions({
  shippingAddress,
  cartItems,
  onCourierSelect,
  selectedCourier
}: ShippingOptionsProps) {
  const { toast } = useToast()
  const [courierOptions, setCourierOptions] = useState<CourierOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchShippingRates = async () => {
    if (!shippingAddress.area_id) {
      setError('Area ID tidak ditemukan')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const requestData = {
        destination_address: shippingAddress,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          // TODO: Add customizations if available in CartItemWithProduct
        }))
      }

      const response = await fetch('/api/biteship/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const data: ShippingRatesResponse = await response.json()

      if (!data.success || !data.data.rates) {
        throw new Error('Gagal mengambil tarif pengiriman')
      }

      setCourierOptions(data.data.rates)

      if (data.data.rates.length === 0) {
        setError('Tidak ada opsi pengiriman tersedia untuk alamat ini')
        toast.warning('Tidak ada kurir tersedia', 'Coba ubah alamat atau kode pos')
      } else {
        toast.success('Tarif dimuat', `${data.data.rates.length} opsi kurir tersedia`)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      toast.error('Gagal memuat tarif', errorMessage)
      console.error('Shipping rates error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchShippingRates()
  }, [shippingAddress.area_id, cartItems])

  const handleCourierSelect = (option: CourierOption) => {
    const courier: SelectedCourier = {
      company: option.company,
      courier_code: option.courier_code,
      service_code: option.service_code,
      service_name: option.service_name,
      price: option.price,
      duration: option.duration,
      description: option.description,
    }

    onCourierSelect(courier)
  }

  const getCourierLogo = (company: string) => {
    // Fallback courier logos - you can replace these with actual logo URLs
    const logos: Record<string, string> = {
      jne: '🚚',
      pos: '📮',
      tiki: '📦',
      sicepat: '⚡',
      jnt: '🚛',
      ninja: '🥷',
      wahana: '🏍️',
      rex: '👑',
      ide: '💡',
      lion: '🦁',
      sap: '📋'
    }
    
    return logos[company.toLowerCase()] || '🚚'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-stone-600">Mencari opsi pengiriman terbaik...</p>
          <p className="text-sm text-stone-500 mt-1">Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Truck className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Gagal Memuat Opsi Pengiriman</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Button onClick={fetchShippingRates} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  if (courierOptions.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="h-8 w-8 mx-auto mb-4 text-stone-400" />
        <p className="text-stone-600 font-medium">Tidak Ada Opsi Pengiriman</p>
        <p className="text-sm text-stone-500 mt-1">
          Tidak ada kurir yang melayani alamat ini
        </p>
        <Button onClick={fetchShippingRates} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Shipping destination info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Tujuan Pengiriman</span>
        </div>
        <p className="text-sm text-blue-700">
          {shippingAddress.city} - {shippingAddress.postal_code}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          {courierOptions.length} opsi pengiriman tersedia
        </p>
      </div>

      {/* Courier options */}
      <div className="grid gap-3">
        {courierOptions.map((option) => {
          const isSelected = selectedCourier?.service_code === option.service_code
          
          return (
            <button
              key={`${option.courier_code}-${option.service_code}`}
              onClick={() => handleCourierSelect(option)}
              className={`w-full text-left border rounded-lg p-4 transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' 
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Courier Logo */}
                <div className="flex-shrink-0">
                  {option.courier_logo ? (
                    <img 
                      src={option.courier_logo} 
                      alt={option.company}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const sibling = target.nextElementSibling as HTMLElement
                        if (sibling) sibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center text-2xl ${
                      option.courier_logo ? 'hidden' : 'flex'
                    }`}
                  >
                    {getCourierLogo(option.company)}
                  </div>
                </div>

                {/* Courier Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-stone-900 uppercase">
                      {option.company}
                    </h4>
                    {option.company_rating && (
                      <div className="flex items-center gap-1 text-xs text-stone-600">
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                        <span>{option.company_rating.toFixed(1)}</span>
                        {option.company_rating_count && (
                          <span>({option.company_rating_count})</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="font-medium text-stone-800 mb-1">
                    {option.service_name}
                  </p>
                  
                  <p className="text-sm text-stone-600 mb-2 line-clamp-2">
                    {option.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-stone-600">
                        <Clock className="h-4 w-4" />
                        <span>{option.duration_range} {option.duration_unit}</span>
                      </div>
                      
                      {option.available_cod && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          COD
                        </span>
                      )}
                      
                      {option.available_insurance && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Asuransi
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg text-amber-700">
                        {formatRupiah(option.price)}
                      </p>
                      <p className="text-xs text-stone-500">
                        {option.service_type}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                    <div className="w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    Kurir Terpilih
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Refresh button */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={fetchShippingRates} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Tarif
        </Button>
      </div>
    </div>
  )
}