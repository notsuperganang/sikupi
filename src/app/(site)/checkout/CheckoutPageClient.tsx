'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, CheckCircle, Truck, CreditCard, ClipboardList } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/lib/toast-context'
import AddressForm from './components/AddressForm'
import ShippingOptions from './components/ShippingOptions'
import PaymentMethod from './components/PaymentMethod'
import OrderSummary from './components/OrderSummary'

export type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review'

export interface ShippingAddress {
  recipient_name: string
  phone: string
  email: string
  address: string
  city: string
  postal_code: string
  area_id?: string
  notes?: string
}

export interface SelectedCourier {
  company: string
  courier_code: string
  service_code: string
  service_name: string
  price: number
  duration: string
  description: string
}

export default function CheckoutPageClient() {
  const router = useRouter()
  const { cart, isLoading: isCartLoading } = useCart()
  const items = cart?.items || []
  const totals = cart?.totals || { itemCount: 0, subtotal: 0, shipping: 0, discount: 0, total: 0 }
  const { toast } = useToast()
  
  // Add auth loading state to prevent premature redirects
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    // Give some time for auth and cart to initialize
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [selectedCourier, setSelectedCourier] = useState<SelectedCourier | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Redirect if cart is empty (but only after initialization)
  useEffect(() => {
    if (isInitialized && !isCartLoading && items.length === 0) {
      toast.info('Keranjang kosong', 'Silakan tambahkan produk terlebih dahulu')
      router.push('/products')
    }
  }, [isInitialized, isCartLoading, items.length, router, toast])

  const steps = [
    { key: 'address', label: 'Alamat Pengiriman', icon: ClipboardList, description: 'Masukkan alamat lengkap Anda' },
    { key: 'shipping', label: 'Pilih Kurir', icon: Truck, description: 'Pilih metode pengiriman' },
    { key: 'payment', label: 'Pembayaran', icon: CreditCard, description: 'Konfirmasi dan bayar' },
  ] as const

  const currentStepIndex = steps.findIndex(step => step.key === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const canProceedToShipping = shippingAddress !== null
  const canProceedToPayment = selectedCourier !== null
  const canCompleteOrder = shippingAddress && selectedCourier

  const handleStepChange = (step: CheckoutStep) => {
    // Prevent moving forward without completing current step
    if (step === 'shipping' && !canProceedToShipping) {
      toast.warning('Lengkapi alamat', 'Silakan lengkapi alamat pengiriman terlebih dahulu')
      return
    }
    if (step === 'payment' && !canProceedToPayment) {
      toast.warning('Pilih kurir', 'Silakan pilih metode pengiriman terlebih dahulu')
      return
    }
    
    setCurrentStep(step)
  }

  const handleCompleteOrder = async () => {
    if (!canCompleteOrder) {
      toast.error('Data tidak lengkap', 'Silakan lengkapi semua informasi yang diperlukan')
      return
    }

    setIsProcessing(true)
    
    try {
      // TODO: Implement order creation with Midtrans integration
      console.log('Creating order with:', {
        shippingAddress,
        selectedCourier,
        items,
        totals
      })
      
      // Placeholder for now
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Pesanan berhasil!', 'Anda akan diarahkan ke halaman pembayaran')
      
      // TODO: Redirect to Midtrans payment or order confirmation
      // router.push('/orders/confirmation')
      
    } catch (error) {
      console.error('Order creation failed:', error)
      toast.error('Gagal membuat pesanan', 'Terjadi kesalahan, silakan coba lagi')
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading while initializing
  if (!isInitialized || isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-stone-600">Memuat keranjang...</p>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Checkout</h1>
              <p className="text-stone-600">Lengkapi pesanan Anda</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index < currentStepIndex
                const isCurrent = step.key === currentStep
                const isAccessible = index <= currentStepIndex || 
                  (step.key === 'shipping' && canProceedToShipping) ||
                  (step.key === 'payment' && canProceedToPayment)
                
                return (
                  <button
                    key={step.key}
                    onClick={() => isAccessible ? handleStepChange(step.key) : null}
                    className={`flex flex-col items-center text-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                      isCurrent 
                        ? 'text-amber-700 bg-amber-50' 
                        : isCompleted
                        ? 'text-green-700 bg-green-50 hover:bg-green-100'
                        : isAccessible
                        ? 'text-stone-600 hover:bg-stone-50'
                        : 'text-stone-400 cursor-not-allowed'
                    }`}
                    disabled={!isAccessible}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                      isCompleted 
                        ? 'bg-green-600 text-white' 
                        : isCurrent 
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-200'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="font-medium text-sm mb-1">{step.label}</span>
                    <span className="text-xs opacity-80 hidden sm:block">{step.description}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Forms Section */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 'address' && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                  <h2 className="text-xl font-semibold">Alamat Pengiriman</h2>
                </div>
                <AddressForm
                  onAddressComplete={(address) => {
                    setShippingAddress(address)
                    // Remove duplicate toast - AddressForm already shows confirmation
                  }}
                  initialAddress={shippingAddress}
                />
                {canProceedToShipping && (
                  <div className="mt-6 pt-6 border-t">
                    <Button 
                      onClick={() => handleStepChange('shipping')}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      Lanjut ke Pemilihan Kurir
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {currentStep === 'shipping' && shippingAddress && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-amber-600" />
                  <h2 className="text-xl font-semibold">Pilih Kurir</h2>
                </div>
                <ShippingOptions
                  shippingAddress={shippingAddress}
                  cartItems={items}
                  onCourierSelect={(courier) => {
                    setSelectedCourier(courier)
                    toast.success('Kurir dipilih', `${courier.company} - ${courier.service_name}`)
                  }}
                  selectedCourier={selectedCourier}
                />
                {canProceedToPayment && (
                  <div className="mt-6 pt-6 border-t flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => handleStepChange('address')}
                      className="flex-1"
                    >
                      Kembali
                    </Button>
                    <Button 
                      onClick={() => handleStepChange('payment')}
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                      Lanjut ke Pembayaran
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {currentStep === 'payment' && canCompleteOrder && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                  <h2 className="text-xl font-semibold">Pembayaran</h2>
                </div>
                <PaymentMethod
                  shippingAddress={shippingAddress}
                  selectedCourier={selectedCourier}
                  cartItems={items}
                  totals={totals}
                  onCompleteOrder={handleCompleteOrder}
                  isProcessing={isProcessing}
                />
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleStepChange('shipping')}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Kembali
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <OrderSummary
              items={items}
              totals={totals}
              selectedCourier={selectedCourier}
              shippingAddress={shippingAddress}
            />
          </div>
        </div>
      </div>
    </div>
  )
}