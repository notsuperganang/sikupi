'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Loader2, CheckCircle } from 'lucide-react'
import { useToast } from '@/lib/toast-context'
import type { ShippingAddress } from '../CheckoutPageClient'

const addressSchema = z.object({
  recipient_name: z.string().min(2, 'Nama penerima minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit'),
  email: z.string().email('Format email tidak valid'),
  address: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
  city: z.string().min(2, 'Nama kota minimal 2 karakter'),
  postal_code: z.string().min(5, 'Kode pos minimal 5 digit').max(5, 'Kode pos maksimal 5 digit'),
  notes: z.string().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

interface Area {
  id: string
  name: string
  type: string
  postal_code: string
  city: string
  province: string
  country?: string
  full_name: string
}

interface AddressFormProps {
  onAddressComplete: (address: ShippingAddress) => void
  initialAddress?: ShippingAddress | null
}

export default function AddressForm({ onAddressComplete, initialAddress }: AddressFormProps) {
  const { toast } = useToast()
  const [isValidating, setIsValidating] = useState(false)
  const [validatedArea, setValidatedArea] = useState<Area | null>(null)
  const [searchResults, setSearchResults] = useState<Area[]>([])
  const [isAreaConfirmed, setIsAreaConfirmed] = useState(false) // Flag to prevent re-validation
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipient_name: initialAddress?.recipient_name || '',
      phone: initialAddress?.phone || '',
      email: initialAddress?.email || '',
      address: initialAddress?.address || '',
      city: initialAddress?.city || '',
      postal_code: initialAddress?.postal_code || '',
      notes: initialAddress?.notes || '',
    }
  })

  const postalCode = watch('postal_code')
  const city = watch('city')

  // Reset area confirmation when postal code changes significantly
  useEffect(() => {
    if (validatedArea && postalCode !== validatedArea.postal_code) {
      // Only reset if the postal code is significantly different (not just a minor edit)
      if (!postalCode || postalCode.length < 4) {
        setIsAreaConfirmed(false)
        setValidatedArea(null)
      }
    }
  }, [postalCode, validatedArea])

  // Validate postal code and city with Biteship
  useEffect(() => {
    const validateAddress = async () => {
      if (!postalCode || postalCode.length !== 5) {
        setValidatedArea(null)
        setSearchResults([])
        setIsAreaConfirmed(false)
        return
      }

      // Skip validation if we have a confirmed area selection
      if (isAreaConfirmed && validatedArea) {
        return
      }

      setIsValidating(true)
      clearErrors('postal_code')
      clearErrors('city')

      try {
        const response = await fetch(`/api/biteship/areas?search=${postalCode}`)
        const data = await response.json()

        if (!data.success || !data.data.areas || data.data.areas.length === 0) {
          setError('postal_code', { message: 'Kode pos tidak ditemukan' })
          setValidatedArea(null)
          setSearchResults([])
          setIsAreaConfirmed(false)
          return
        }

        const areas = data.data.areas
        setSearchResults(areas)

        // Auto-fill if exact match found (postal code + city match)
        const exactMatch = areas.find((area: Area) => 
          area.postal_code === postalCode && 
          area.city.toLowerCase() === city.toLowerCase()
        )

        if (exactMatch) {
          setValidatedArea(exactMatch)
          setIsAreaConfirmed(true)
          toast.success('Alamat tervalidasi', `${exactMatch.name}`)
        } else if (areas.length === 1) {
          // Only auto-select if there's exactly one match
          setValidatedArea(areas[0])
          setIsAreaConfirmed(true)
          if (areas[0].city !== city) {
            setValue('city', areas[0].city)
          }
          toast.success('Alamat tervalidasi', `${areas[0].name}`)
        } else {
          // Multiple options available, user needs to choose
          setValidatedArea(null)
          setIsAreaConfirmed(false)
        }

      } catch (error) {
        console.error('Address validation error:', error)
        setError('postal_code', { message: 'Gagal memvalidasi alamat' })
        setValidatedArea(null)
        setIsAreaConfirmed(false)
        setSearchResults([])
      } finally {
        setIsValidating(false)
      }
    }

    const timeoutId = setTimeout(validateAddress, 500)
    return () => clearTimeout(timeoutId)
  }, [postalCode, city, setValue, setError, clearErrors, toast, validatedArea, isAreaConfirmed])

  const onSubmit = (data: AddressFormData) => {
    // Allow submission if we have a validated area, even if postal codes don't exactly match
    // This handles cases where user selects an area but entered a slightly different postal code
    if (!validatedArea) {
      setError('postal_code', { message: 'Pilih area dari hasil pencarian atau pastikan kode pos valid' })
      toast.error('Validasi diperlukan', 'Silakan pilih area dari hasil pencarian')
      return
    }

    console.log('validatedArea in onSubmit:', validatedArea)
    console.log('form data:', data)

    // Ensure postal_code is available - use validatedArea first, then form data, then empty string
    const finalPostalCode = validatedArea.postal_code || data.postal_code || ''

    const shippingAddress: ShippingAddress = {
      ...data,
      area_id: validatedArea.id,
      postal_code: finalPostalCode,
    }

    console.log('AddressForm submitting address:', shippingAddress)
    onAddressComplete(shippingAddress)
    toast.success('Alamat tersimpan', 'Lanjut ke pemilihan kurir pengiriman')
  }

  const selectArea = (area: Area) => {
    console.log('selectArea called with:', area)
    
    // If the area doesn't have a postal_code, use the current form postal_code
    const areaWithPostalCode = {
      ...area,
      postal_code: area.postal_code || postalCode || ''
    }
    
    console.log('Area after postal_code fix:', areaWithPostalCode)
    
    setValidatedArea(areaWithPostalCode)
    setSearchResults([]) // Clear search results immediately
    setIsAreaConfirmed(true) // Mark area as confirmed to prevent re-validation
    
    // Update city only if different
    if (area.city !== city) {
      setValue('city', area.city)
    }
    
    // Don't update postal code - keep what user entered to avoid validation loop
    // The validated area will be used for shipping calculation instead
    
    toast.success('Area berhasil dipilih', `${area.name} - Alamat siap disimpan`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Recipient Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recipient_name">Nama Penerima *</Label>
          <Input
            id="recipient_name"
            {...register('recipient_name')}
            placeholder="Nama lengkap penerima"
            className={errors.recipient_name ? 'border-red-500' : ''}
          />
          {errors.recipient_name && (
            <p className="text-red-500 text-sm mt-1">{errors.recipient_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Nomor Telepon *</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="08xxxxxxxxxx"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="email@example.com"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Address Details */}
      <div>
        <Label htmlFor="address">Alamat Lengkap *</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
          className={errors.address ? 'border-red-500' : ''}
          rows={3}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Kota/Kabupaten *</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Jakarta, Bandung, Surabaya, dll"
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="postal_code">Kode Pos *</Label>
          <div className="relative">
            <Input
              id="postal_code"
              {...register('postal_code')}
              placeholder="12345"
              maxLength={5}
              className={`pr-10 ${errors.postal_code ? 'border-red-500' : validatedArea ? 'border-green-500' : ''}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValidating ? (
                <Loader2 className="h-4 w-4 text-stone-400 animate-spin" />
              ) : validatedArea ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <MapPin className="h-4 w-4 text-stone-400" />
              )}
            </div>
          </div>
          {errors.postal_code && (
            <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>
          )}
          {validatedArea && (
            <p className="text-green-600 text-sm mt-1">✓ {validatedArea.full_name}</p>
          )}
        </div>
      </div>

      {/* Area Search Results */}
      {searchResults.length > 1 && !validatedArea && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">
            Ditemukan {searchResults.length} area untuk kode pos {postalCode}. Pilih yang sesuai:
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {searchResults.map((area, index) => (
              <button
                key={area.id}
                type="button"
                onClick={() => selectArea(area)}
                className="w-full text-left p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="space-y-2">
                  {/* Primary area name - most prominent */}
                  <div className="font-semibold text-blue-900 text-base group-hover:text-blue-800">
                    {area.name}
                  </div>
                  
                  {/* Location hierarchy */}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-blue-700">
                    <span className="inline-flex items-center gap-1">
                      📍 {area.city}
                    </span>
                    <span className="text-blue-400">•</span>
                    <span>{area.province}</span>
                    <span className="text-blue-400">•</span>
                    <span className="inline-flex items-center gap-1">
                      📮 {area.postal_code}
                    </span>
                  </div>
                  
                  {/* Area type and ID for technical reference */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {area.type}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      ID: {area.id}
                    </span>
                  </div>
                  
                  {/* Full address string */}
                  <div className="text-xs text-stone-600 bg-stone-50 px-2 py-1 rounded border-l-2 border-blue-200">
                    {area.full_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-blue-600">
            💡 Pilih area yang paling sesuai dengan alamat Anda untuk memastikan pengiriman akurat
          </div>
        </div>
      )}

      {/* Optional Notes */}
      <div>
        <Label htmlFor="notes">Catatan (Opsional)</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Patokan, instruksi khusus untuk kurir, dll"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!validatedArea || isValidating}
          className="bg-amber-600 hover:bg-amber-700 min-w-32"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {validatedArea ? 'Simpan Alamat' : isValidating ? 'Memvalidasi...' : 'Pilih Area Dulu'}
        </Button>
      </div>
    </form>
  )
}