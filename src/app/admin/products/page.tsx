'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/admin/ProductForm'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon
} from 'lucide-react'

interface Product {
  id: number
  kind: string
  category: string
  title: string
  name?: string
  description: string | null
  coffee_type: string | null
  grind_level: string | null
  condition: string | null
  price_idr: number
  stock_qty: number
  unit: string
  published: boolean
  images: string[] | null
  image_urls?: string[] | null
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const { session } = useAuth()

  useEffect(() => {
    if (session?.access_token) {
      fetchProducts()
    }
  }, [session])

  useEffect(() => {
    const filtered = products.filter(product => {
      const name = product.title || product.name || ''
      const category = product.category || ''
      const query = searchQuery.toLowerCase()
      
      return name.toLowerCase().includes(query) ||
             category.toLowerCase().includes(query)
    })
    setFilteredProducts(filtered)
  }, [products, searchQuery])

  const fetchProducts = async () => {
    if (!session?.access_token) {
      setError('Authentication required')
      return
    }

    try {
      setLoading(true)
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch('/api/admin/products', { headers })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }
      
      const data = await response.json()
      // Normalize product data to ensure consistency
      const normalizedProducts = (data.data || []).map((product: any) => ({
        ...product,
        images: product.image_urls || product.images || []
      }))
      setProducts(normalizedProducts)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async (productId: number, currentStatus: boolean) => {
    if (!session?.access_token) return

    try {
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          published: !currentStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update product')
      }

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, published: !currentStatus }
          : product
      ))
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      alert(error instanceof Error ? error.message : 'Failed to update product status')
    }
  }

  const deleteProduct = async (productId: number) => {
    if (!session?.access_token) return
    
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers
      })

      if (response.status === 409) {
        // Handle conflict - product has orders
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.error || 'Cannot delete this product because it has been ordered by customers.')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete product')
      }

      // Remove from local state
      setProducts(prev => prev.filter(product => product.id !== productId))
      
      // Show success message
      alert('Product deleted successfully')
      
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            Manage your product catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchQuery ? 'No products found matching your search' : 'No products yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {product.image_urls?.[0] ? (
                              <img 
                                src={product.image_urls[0]} 
                                alt={product.title || product.name || 'Product'}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.title || product.name || 'Unnamed Product'}</p>
                            <p className="text-sm text-gray-500">ID: {product.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        Rp {product.price_idr.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <span className={product.stock_qty < 10 ? 'text-red-600' : ''}>
                          {product.stock_qty} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => togglePublished(product.id, product.published)}
                          className="focus:outline-none"
                        >
                          <Badge 
                            variant={product.published ? 'default' : 'secondary'}
                            className="cursor-pointer hover:opacity-80"
                          >
                            {product.published ? 'Published' : 'Draft'}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              // Convert product to match ProductForm's Product interface
                              const editableProduct = {
                                ...product,
                                images: product.image_urls || product.images || []
                              }
                              setEditProduct(editableProduct)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Form */}
      <ProductForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={() => {
          fetchProducts() // Refresh the products list
        }}
      />

      {/* Edit Product Form */}
      <ProductForm
        open={!!editProduct}
        onOpenChange={(open) => {
          if (!open) setEditProduct(null)
        }}
        editProduct={editProduct}
        onSuccess={() => {
          fetchProducts() // Refresh the products list
          setEditProduct(null) // Close edit form
        }}
      />
    </div>
  )
}