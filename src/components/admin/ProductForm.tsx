'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { validateImageFile } from '@/lib/image-upload'
import { X, ImageIcon } from 'lucide-react'

interface Product {
  id: number
  kind: string
  category: string
  title: string
  description: string | null
  coffee_type: string | null
  grind_level: string | null
  condition: string | null
  price_idr: number
  stock_qty: number
  unit: string
  published: boolean
  images: string[] | null
}

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editProduct?: Product | null
}

interface ProductFormData {
  kind: string
  category: string
  title: string
  description: string
  coffee_type: string
  grind_level: string
  condition: string
  price_idr: number
  stock_qty: number
  unit: string
  published: boolean
}

interface ImagePreview {
  file: File
  url: string
  id: string
}

export function ProductForm({ open, onOpenChange, onSuccess, editProduct }: ProductFormProps) {
  const { session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<ImagePreview[]>([])
  const [imageError, setImageError] = useState('')
  
  const [formData, setFormData] = useState<ProductFormData>({
    kind: 'ampas',
    category: 'ampas_kopi',
    title: '',
    description: '',
    coffee_type: 'unknown',
    grind_level: 'unknown',
    condition: 'unknown',
    price_idr: 0,
    stock_qty: 0,
    unit: 'kg',
    published: false,
  })

  // Initialize form with edit data
  useEffect(() => {
    if (editProduct) {
      setFormData({
        kind: editProduct.kind,
        category: editProduct.category,
        title: editProduct.title,
        description: editProduct.description || '',
        coffee_type: editProduct.coffee_type || 'unknown',
        grind_level: editProduct.grind_level || 'unknown',
        condition: editProduct.condition || 'unknown',
        price_idr: editProduct.price_idr,
        stock_qty: editProduct.stock_qty,
        unit: editProduct.unit,
        published: editProduct.published,
      })
      
      // Clear images when editing (we'll show existing ones separately)
      setImages([])
    } else {
      // Reset form for new product
      setFormData({
        kind: 'ampas',
        category: 'ampas_kopi',
        title: '',
        description: '',
        coffee_type: 'unknown',
        grind_level: 'unknown',
        condition: 'unknown',
        price_idr: 0,
        stock_qty: 0,
        unit: 'kg',
        published: false,
      })
      setImages([])
    }
  }, [editProduct, open])

  // Auto-set category based on kind
  useEffect(() => {
    if (formData.kind === 'ampas') {
      setFormData(prev => ({ ...prev, category: 'ampas_kopi' }))
    } else if (formData.kind === 'turunan' && formData.category === 'ampas_kopi') {
      // Reset to first non-ampas category when switching to turunan
      setFormData(prev => ({ ...prev, category: 'briket' }))
    }
  }, [formData.kind])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImageError('')

    files.forEach(file => {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setImageError(validation.error || 'Invalid file')
        return
      }

      const id = Math.random().toString(36).substring(7)
      const url = URL.createObjectURL(file)
      
      setImages(prev => [...prev, { file, url, id }])
    })

    // Reset input
    if (e.target) {
      e.target.value = ''
    }
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      // Clean up object URLs
      const removed = prev.find(img => img.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.url)
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.access_token) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError('')
    setImageError('')

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData()
      
      // Add product data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString())
      })
      
      // Add image files
      images.forEach((image, index) => {
        formDataToSend.append(`image${index}`, image.file)
      })

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        // Don't set Content-Type for FormData, browser will set it with boundary
      }

      const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products'
      const method = editProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers,
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create product')
      }

      // Success
      onSuccess()
      onOpenChange(false)
      
      // Clean up image URLs
      images.forEach(img => URL.revokeObjectURL(img.url))
      
      // Reset form
      setFormData({
        kind: 'ampas',
        category: 'ampas_kopi',
        title: '',
        description: '',
        coffee_type: 'unknown',
        grind_level: 'unknown',
        condition: 'unknown',
        price_idr: 0,
        stock_qty: 0,
        unit: 'kg',
        published: false,
      })
      setImages([])

    } catch (error) {
      console.error('Failed to create product:', error)
      setError(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Get available categories based on product kind
  const getAvailableCategories = () => {
    if (formData.kind === 'ampas') {
      return [{ value: 'ampas_kopi', label: 'Ampas Kopi' }]
    }
    return [
      { value: 'briket', label: 'Briket' },
      { value: 'pulp', label: 'Pulp' },
      { value: 'scrub', label: 'Scrub' },
      { value: 'pupuk', label: 'Pupuk' },
      { value: 'pakan_ternak', label: 'Pakan Ternak' },
      { value: 'lainnya', label: 'Lainnya' }
    ]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {editProduct ? 'Update the product information.' : 'Create a new product for the marketplace.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {imageError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
              {imageError}
            </div>
          )}

          {/* Product Kind */}
          <div className="space-y-2">
            <Label htmlFor="kind">Product Kind</Label>
            <Select value={formData.kind} onValueChange={(value) => updateFormData('kind', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ampas">Ampas (Coffee Grounds)</SelectItem>
                <SelectItem value="turunan">Turunan (Derivative Product)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableCategories().map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.kind === 'ampas' && (
              <p className="text-sm text-gray-500">Ampas products must use "Ampas Kopi" category</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Enter product title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          {/* Coffee Properties */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coffee_type">Coffee Type</Label>
              <Select value={formData.coffee_type} onValueChange={(value) => updateFormData('coffee_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arabika">Arabika</SelectItem>
                  <SelectItem value="robusta">Robusta</SelectItem>
                  <SelectItem value="mix">Mix</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grind_level">Grind Level</Label>
              <Select value={formData.grind_level} onValueChange={(value) => updateFormData('grind_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="halus">Halus</SelectItem>
                  <SelectItem value="sedang">Sedang</SelectItem>
                  <SelectItem value="kasar">Kasar</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => updateFormData('condition', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basah">Basah</SelectItem>
                  <SelectItem value="kering">Kering</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_idr">Price (IDR)</Label>
              <Input
                id="price_idr"
                type="number"
                value={formData.price_idr}
                onChange={(e) => updateFormData('price_idr', parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_qty">Stock Quantity</Label>
              <Input
                id="stock_qty"
                type="number"
                value={formData.stock_qty}
                onChange={(e) => updateFormData('stock_qty', parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => updateFormData('unit', e.target.value)}
                placeholder="kg, gram, pcs"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            
            {/* Existing Images (for edit mode) */}
            {editProduct && editProduct.images && editProduct.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current images:</p>
                <div className="grid grid-cols-3 gap-4">
                  {editProduct.images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`Product image ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Upload new images to replace existing ones
                </p>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {editProduct ? 'Upload new images' : 'Click to upload images'}
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG, WEBP up to 10MB each
                    </span>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
            
            {/* New Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img 
                      src={image.url} 
                      alt="Preview" 
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{image.file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Published Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={formData.published ? 'published' : 'draft'} 
              onValueChange={(value) => updateFormData('published', value === 'published')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft (Hidden)</SelectItem>
                <SelectItem value="published">Published (Visible)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (editProduct ? 'Updating...' : 'Creating...') : (editProduct ? 'Update Product' : 'Create Product')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}