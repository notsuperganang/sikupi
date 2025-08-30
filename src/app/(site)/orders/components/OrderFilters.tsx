'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import type { OrderStatus } from '@/types/database'

interface OrderFiltersProps {
  statusFilter: OrderStatus | 'all'
  searchQuery: string
  sortBy: 'newest' | 'oldest' | 'amount_high' | 'amount_low'
  onStatusChange: (status: OrderStatus | 'all') => void
  onSearchChange: (search: string) => void
  onSortChange: (sort: 'newest' | 'oldest' | 'amount_high' | 'amount_low') => void
  isLoading?: boolean
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'new', label: 'Baru' },
  { value: 'pending_payment', label: 'Menunggu Pembayaran' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'packed', label: 'Dikemas' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' }
] as const

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru', icon: SortDesc },
  { value: 'oldest', label: 'Terlama', icon: SortAsc },
  { value: 'amount_high', label: 'Nominal Tertinggi', icon: SortDesc },
  { value: 'amount_low', label: 'Nominal Terendah', icon: SortAsc }
] as const

export default function OrderFilters({
  statusFilter,
  searchQuery,
  sortBy,
  onStatusChange,
  onSearchChange,
  onSortChange,
  isLoading = false
}: OrderFiltersProps) {
  const currentSortOption = SORT_OPTIONS.find(option => option.value === sortBy)
  const SortIcon = currentSortOption?.icon || SortDesc

  return (
    <div className="space-y-4">
      {/* Main filters row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Cari berdasarkan ID pesanan atau produk..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-fit">
          <Select
            value={statusFilter}
            onValueChange={onStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="min-w-fit">
          <Select
            value={sortBy}
            onValueChange={onSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SortIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => {
                const Icon = option.icon
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters summary */}
      {(statusFilter !== 'all' || searchQuery.trim()) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
          <span>Filter aktif:</span>
          
          {statusFilter !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange('all')}
              className="h-7 px-3 text-xs"
              disabled={isLoading}
            >
              {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label}
              <span className="ml-1">×</span>
            </Button>
          )}
          
          {searchQuery.trim() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSearchChange('')}
              className="h-7 px-3 text-xs"
              disabled={isLoading}
            >
              Pencarian: "{searchQuery.trim()}"
              <span className="ml-1">×</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onStatusChange('all')
              onSearchChange('')
            }}
            className="h-7 px-3 text-xs text-stone-500 hover:text-stone-700"
            disabled={isLoading}
          >
            Hapus semua filter
          </Button>
        </div>
      )}
    </div>
  )
}