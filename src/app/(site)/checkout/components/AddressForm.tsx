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

  // Validate postal code and city with Biteship
  useEffect(() => {
    const validateAddress = async () => {
      if (!postalCode || postalCode.length !== 5) {
        setValidatedArea(null)
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
          return
        }

        const areas = data.data.areas
        setSearchResults(areas)

        // Auto-fill if exact match found
        const exactMatch = areas.find((area: Area) => 
          area.postal_code === postalCode && 
          area.city.toLowerCase().includes(city.toLowerCase())
        )

        if (exactMatch) {
          setValidatedArea(exactMatch)
          setValue('city', exactMatch.city)
          toast.success('Alamat tervalidasi', `${exactMatch.full_name}`)
        } else if (areas.length === 1) {
          setValidatedArea(areas[0])
          setValue('city', areas[0].city)
          toast.success('Alamat tervalidasi', `${areas[0].full_name}`)
        } else {
          setValidatedArea(null)
        }

      } catch (error) {
        console.error('Address validation error:', error)
        setError('postal_code', { message: 'Gagal memvalidasi alamat' })
        setValidatedArea(null)
      } finally {
        setIsValidating(false)
      }
    }

    const timeoutId = setTimeout(validateAddress, 500)
    return () => clearTimeout(timeoutId)
  }, [postalCode, city, setValue, setError, clearErrors, toast])

  const onSubmit = (data: AddressFormData) => {
    if (!validatedArea) {
      setError('postal_code', { message: 'Alamat belum divalidasi' })
      return
    }

    const shippingAddress: ShippingAddress = {
      ...data,
      area_id: validatedArea.id,
    }

    onAddressComplete(shippingAddress)
  }

  const selectArea = (area: Area) => {
    setValidatedArea(area)
    setValue('city', area.city)
    setValue('postal_code', area.postal_code)
    setSearchResults([])
    toast.success('Area dipilih', area.full_name)
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
          <h4 className="font-medium text-blue-900 mb-2">Pilih Area yang Sesuai:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {searchResults.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => selectArea(area)}
                className="w-full text-left p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-blue-900">{area.name}</div>
                <div className="text-sm text-blue-700">
                  {area.city}, {area.province} - {area.postal_code}
                </div>
              </button>
            ))}
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
          disabled={!isValid || !validatedArea || isValidating}
          className="bg-amber-600 hover:bg-amber-700 min-w-32"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Simpan Alamat
        </Button>
      </div>
    </form>
  )
}