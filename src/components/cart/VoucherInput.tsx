// Mock voucher input component
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tag, Check, X } from 'lucide-react'

interface VoucherInputProps {
  onVoucherApplied?: (discount: number) => void
  className?: string
}

export default function VoucherInput({ onVoucherApplied, className }: VoucherInputProps) {
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string
    discount: number
    description: string
  } | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState('')

  // Mock voucher codes for demonstration
  const mockVouchers = {
    'SIKUPI10': { discount: 10000, description: 'Diskon Rp 10.000' },
    'NEWUSER': { discount: 15000, description: 'Diskon Rp 15.000 pengguna baru' },
    'COFFEE20': { discount: 20000, description: 'Diskon Rp 20.000 produk kopi' }
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Masukkan kode voucher')
      return
    }

    setIsApplying(true)
    setError('')

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const voucher = mockVouchers[voucherCode.toUpperCase() as keyof typeof mockVouchers]
    
    if (voucher) {
      setAppliedVoucher({
        code: voucherCode.toUpperCase(),
        ...voucher
      })
      onVoucherApplied?.(voucher.discount)
      setVoucherCode('')
    } else {
      setError('Kode voucher tidak valid atau sudah kedaluwarsa')
    }

    setIsApplying(false)
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    onVoucherApplied?.(0)
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyVoucher()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-stone-900">Kode Voucher</span>
        <Badge variant="secondary" className="text-xs">MOCK</Badge>
      </div>

      {appliedVoucher ? (
        /* Applied Voucher Display */
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {appliedVoucher.code}
              </p>
              <p className="text-xs text-green-600">
                {appliedVoucher.description}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveVoucher}
            className="p-1 h-7 w-7 border-green-200 hover:bg-green-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        /* Voucher Input */
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Masukkan kode voucher"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase())
                setError('')
              }}
              onKeyPress={handleKeyPress}
              className="flex-1 text-sm"
              disabled={isApplying}
            />
            <Button
              variant="outline"
              onClick={handleApplyVoucher}
              disabled={isApplying || !voucherCode.trim()}
              className="px-4"
            >
              {isApplying ? 'Memeriksa...' : 'Pakai'}
            </Button>
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <X className="h-3 w-3" />
              {error}
            </p>
          )}

          {/* Mock available vouchers hint */}
          <div className="text-xs text-stone-500">
            <p className="mb-1">💡 Coba kode ini:</p>
            <div className="flex flex-wrap gap-1">
              {Object.keys(mockVouchers).map(code => (
                <button
                  key={code}
                  onClick={() => setVoucherCode(code)}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-xs transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}