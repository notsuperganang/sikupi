'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Search, 
  Filter, 
  X, 
  Coffee, 
  Package2, 
  Sparkles, 
  Leaf, 
  Cat, 
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Recycle,
  Factory,
  Layers,
  Droplets,
  Sun
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useDebounce } from '@/hooks/useDebounce'
import {
  ProductFilters,
  categoryTranslations,
  coffeeTypeTranslations,
  grindLevelTranslations,
  conditionTranslations,
  sortTranslations,
  hasActiveFilters
} from '@/lib/products'
import type { ProductCategory, ProductKind, CoffeeType, GrindLevel, Condition } from '@/types/database'

interface FilterSidebarProps {
  filters: ProductFilters
  onFiltersChange: (filters: Partial<ProductFilters>) => void
  onClearFilters: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

// Category icons mapping
const categoryIcons = {
  ampas_kopi: Coffee,
  briket: Package2,
  pulp: Package2,
  scrub: Sparkles,
  pupuk: Leaf,
  pakan_ternak: Cat,
  lainnya: MoreHorizontal,
}

// Kind icons mapping
const kindIcons = {
  ampas: Coffee,
  turunan: Factory,
}

// Coffee type icons mapping  
const coffeeTypeIcons = {
  arabika: Coffee,
  robusta: Coffee,
  mix: Layers,
}

// Grind level icons mapping
const grindLevelIcons = {
  halus: Sparkles,
  sedang: Package2,
  kasar: MoreHorizontal,
}

// Condition icons mapping
const conditionIcons = {
  basah: Droplets,
  kering: Sun,
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  onClearFilters,
  isMobile = false,
  isOpen = true,
  onClose,
  className
}: FilterSidebarProps) {
  const [searchQuery, setSearchQuery] = useState(filters.q || '')
  const [priceMin, setPriceMin] = useState(filters.minPrice?.toString() || '')
  const [priceMax, setPriceMax] = useState(filters.maxPrice?.toString() || '')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    kind: true,
    category: true,
    coffee: true,
    price: true,
    sort: true
  })

  const debouncedSearch = useDebounce(searchQuery, 500)
  const debouncedPriceMin = useDebounce(priceMin, 800)
  const debouncedPriceMax = useDebounce(priceMax, 800)

  // Sync local state with filters prop when it changes from external sources
  useEffect(() => {
    if (filters.q !== searchQuery) {
      setSearchQuery(filters.q || '')
    }
  }, [filters.q])

  useEffect(() => {
    const currentPriceMin = filters.minPrice?.toString() || ''
    if (currentPriceMin !== priceMin) {
      setPriceMin(currentPriceMin)
    }
  }, [filters.minPrice])

  useEffect(() => {
    const currentPriceMax = filters.maxPrice?.toString() || ''
    if (currentPriceMax !== priceMax) {
      setPriceMax(currentPriceMax)
    }
  }, [filters.maxPrice])

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      onFiltersChange({ q: debouncedSearch || undefined })
    }
  }, [debouncedSearch, onFiltersChange])

  // Update price filters when debounced values change
  useEffect(() => {
    const minPrice = debouncedPriceMin ? parseInt(debouncedPriceMin) : undefined
    const maxPrice = debouncedPriceMax ? parseInt(debouncedPriceMax) : undefined
    
    if (minPrice !== filters.minPrice || maxPrice !== filters.maxPrice) {
      onFiltersChange({ minPrice, maxPrice })
    }
  }, [debouncedPriceMin, debouncedPriceMax, onFiltersChange])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleKindChange = (kind: ProductKind | undefined) => {
    onFiltersChange({ 
      kind,
      // Clear category filters when switching
      category: undefined,
      // Clear coffee-specific filters when switching
      coffeeType: undefined,
      grindLevel: undefined,
      condition: undefined
    })
  }

  const handleCategoryChange = (category: ProductCategory | undefined) => {
    onFiltersChange({ 
      category,
      // Clear coffee-specific filters if not ampas_kopi
      ...(category !== 'ampas_kopi' && {
        coffeeType: undefined,
        grindLevel: undefined,
        condition: undefined
      })
    })
  }

  const shouldShowCategoryFilters = filters.kind === 'turunan'
  const shouldShowCoffeeFilters = filters.kind === 'ampas'
  const activeFiltersCount = hasActiveFilters(filters)

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filter</h2>
          {activeFiltersCount && (
            <Badge variant="secondary">{Object.keys(filters).filter(key => filters[key as keyof ProductFilters]).length}</Badge>
          )}
        </div>
        {isMobile && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Clear filters */}
      {activeFiltersCount && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearFilters}
          className="w-full"
        >
          Bersihkan Filter
        </Button>
      )}

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Cari produk</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nama produk..."
            className="pl-10 text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Kind Filter */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('kind')}
          className="flex items-center justify-between w-full text-left"
        >
          <Label>Jenis</Label>
          {expandedSections.kind ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.kind && (
          <div className="space-y-2">
            {(['ampas', 'turunan'] as const).map((kind) => {
              const Icon = kindIcons[kind]
              return (
                <label key={kind} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kind"
                    value={kind}
                    checked={filters.kind === kind}
                    onChange={() => handleKindChange(kind)}
                    className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                    style={{
                      accentColor: 'var(--sikupi-primary)'
                    }}
                  />
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {kind === 'ampas' ? 'Ampas' : 'Turunan'}
                  </span>
                </label>
              )
            })}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="kind"
                checked={!filters.kind}
                onChange={() => handleKindChange(undefined)}
                className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                style={{
                  accentColor: 'var(--sikupi-primary)'
                }}
              />
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Semua</span>
            </label>
          </div>
        )}
      </div>

      <Separator />

      {/* Category Filter - only show when kind is 'turunan' */}
      {shouldShowCategoryFilters && (
        <>
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full text-left"
            >
              <Label>Kategori</Label>
              {expandedSections.category ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.category && (
              <div className="space-y-2">
                {Object.entries(categoryTranslations)
                  .filter(([category]) => category !== 'ampas_kopi') // Exclude ampas_kopi for turunan products
                  .map(([category, label]) => {
                  const Icon = categoryIcons[category as ProductCategory]
                  return (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={filters.category === category}
                        onChange={() => handleCategoryChange(category as ProductCategory)}
                        className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                        style={{
                          accentColor: 'var(--sikupi-primary)'
                        }}
                      />
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{label}</span>
                    </label>
                  )
                })}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => handleCategoryChange(undefined)}
                    className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                    style={{
                      accentColor: 'var(--sikupi-primary)'
                    }}
                  />
                  <span className="text-sm">Semua Kategori</span>
                </label>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Coffee-specific filters - only show when kind is 'ampas' */}
      {shouldShowCoffeeFilters && (
        <>          
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('coffee')}
              className="flex items-center justify-between w-full text-left"
            >
              <Label>Atribut Kopi</Label>
              {expandedSections.coffee ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.coffee && (
              <div className="space-y-4">
                {/* Coffee Type */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Jenis Kopi</Label>
                  <div className="space-y-1">
                    {Object.entries(coffeeTypeTranslations).map(([type, label]) => {
                      if (type === 'unknown') return null
                      const Icon = coffeeTypeIcons[type as keyof typeof coffeeTypeIcons] || Coffee
                      return (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="coffeeType"
                            value={type}
                            checked={filters.coffeeType === type}
                            onChange={() => onFiltersChange({ coffeeType: type as CoffeeType })}
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                            style={{
                              accentColor: 'var(--sikupi-primary)'
                            }}
                          />
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{label}</span>
                        </label>
                      )
                    })}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="coffeeType"
                        checked={!filters.coffeeType}
                        onChange={() => onFiltersChange({ coffeeType: undefined })}
                        className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                        style={{
                          accentColor: 'var(--sikupi-primary)'
                        }}
                      />
                      <Layers className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Semua Jenis</span>
                    </label>
                  </div>
                </div>

                {/* Grind Level */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Ukuran Gilingan</Label>
                  <div className="space-y-1">
                    {Object.entries(grindLevelTranslations).map(([level, label]) => {
                      if (level === 'unknown') return null
                      const Icon = grindLevelIcons[level as keyof typeof grindLevelIcons] || Package2
                      return (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="grindLevel"
                            value={level}
                            checked={filters.grindLevel === level}
                            onChange={() => onFiltersChange({ grindLevel: level as GrindLevel })}
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                            style={{
                              accentColor: 'var(--sikupi-primary)'
                            }}
                          />
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{label}</span>
                        </label>
                      )
                    })}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="grindLevel"
                        checked={!filters.grindLevel}
                        onChange={() => onFiltersChange({ grindLevel: undefined })}
                        className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                        style={{
                          accentColor: 'var(--sikupi-primary)'
                        }}
                      />
                      <Layers className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Semua Ukuran</span>
                    </label>
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Kondisi</Label>
                  <div className="space-y-1">
                    {Object.entries(conditionTranslations).map(([condition, label]) => {
                      if (condition === 'unknown') return null
                      const Icon = conditionIcons[condition as keyof typeof conditionIcons] || Sun
                      return (
                        <label key={condition} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="condition"
                            value={condition}
                            checked={filters.condition === condition}
                            onChange={() => onFiltersChange({ condition: condition as Condition })}
                            className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                            style={{
                              accentColor: 'var(--sikupi-primary)'
                            }}
                          />
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{label}</span>
                        </label>
                      )
                    })}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        checked={!filters.condition}
                        onChange={() => onFiltersChange({ condition: undefined })}
                        className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                        style={{
                          accentColor: 'var(--sikupi-primary)'
                        }}
                      />
                      <Layers className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Semua Kondisi</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <Label>Rentang Harga (IDR)</Label>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="price-min" className="text-xs text-gray-600">
                  Harga Minimum
                </Label>
                <Input
                  id="price-min"
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  min="0"
                  className="text-sm w-full"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price-max" className="text-xs text-gray-600">
                  Harga Maksimum
                </Label>
                <Input
                  id="price-max"
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  min="0"
                  className="text-sm w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Sort */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center justify-between w-full text-left"
        >
          <Label>Urutkan</Label>
          {expandedSections.sort ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.sort && (
          <div className="space-y-2">
            {Object.entries(sortTranslations).map(([sort, label]) => (
              <label key={sort} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  value={sort}
                  checked={filters.sort === sort}
                  onChange={() => onFiltersChange({ sort: sort as any })}
                  className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-[var(--sikupi-primary)] text-[var(--sikupi-primary)]"
                  style={{
                    accentColor: 'var(--sikupi-primary)'
                  }}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return isOpen ? (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="p-6">
            {sidebarContent}
          </div>
        </div>
      </div>
    ) : null
  }

  return (
    <div className={`${className || ''} ${isOpen ? '' : 'hidden'}`}>
      <div className="sticky top-4">
        {sidebarContent}
      </div>
    </div>
  )
}