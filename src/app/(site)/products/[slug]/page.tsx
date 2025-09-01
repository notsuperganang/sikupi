import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { transformImageUrls } from '@/lib/images'
import CartClient from '@/components/cart/CartClient'
import Gallery from './components/Gallery'
import BuyBox from './components/BuyBox'
import ProductInfo from './components/ProductInfo'
import Reviews from './components/Reviews'
import RelatedProducts from './components/RelatedProducts'
import type { ProductKind, ProductCategory, CoffeeType, GrindLevel, Condition } from '@/types/database'

export const dynamic = 'force-dynamic'

// Enhanced Product type for detail page
export type ProductDetail = {
  id: string;
  slug: string | null;
  title: string;
  kind: ProductKind;
  category: ProductCategory;
  images: { url: string; alt?: string }[];
  price: number;
  compareAtPrice?: number | null;
  stockQty: number;
  soldCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  coffeeType?: CoffeeType;
  grindLevel?: GrindLevel;
  condition?: Condition;
  weightGram?: number;
  origin?: string;
  brand?: string;
  shortSpecs?: string[];
  description?: string;
  createdAt: string;
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata dynamically
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('title, description')
      .eq('slug', slug)
      .eq('published', true)
      .single() as { data: { title: string; description: string | null } | null; error: any }

    if (!product) {
      return {
        title: 'Produk Tidak Ditemukan - Sikupi',
        description: 'Produk yang Anda cari tidak dapat ditemukan.'
      }
    }

    return {
      title: `${product.title} - Sikupi`,
      description: product.description || `Beli ${product.title} berkualitas dari Sikupi. Produk ampas kopi dan turunannya dari Aceh.`,
      keywords: ['ampas kopi', product.title, 'coffee grounds', 'sustainable', 'Banda Aceh'],
      openGraph: {
        title: `${product.title} - Sikupi`,
        description: product.description || `Beli ${product.title} berkualitas dari Sikupi.`,
        type: 'website',
      }
    }
  } catch (error) {
    return {
      title: 'Produk - Sikupi',
      description: 'Jelajahi produk ampas kopi berkualitas dari Sikupi'
    }
  }
}

// Server-side data fetching
async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    // Fetch product data
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single() as { data: any | null; error: any }

    if (error || !product) {
      return null
    }

    // Fetch rating data
    const { data: ratingData } = await supabaseAdmin
      .from('product_rating_summary')
      .select('*')
      .eq('product_id', product.id)
      .single() as { data: any | null }

    // Fetch sold count from order_items (only completed orders)
    const { data: soldData, error: soldError } = await supabaseAdmin
      .from('order_items')
      .select(`
        qty,
        orders!inner(status)
      `)
      .eq('product_id', product.id)
      .eq('orders.status', 'completed')

    const totalSold = soldData?.reduce((total: number, item: any) => total + parseFloat(item.qty || 0), 0) || 0

    // Calculate weight based on product category and unit
    const getWeightInGrams = (category: string, stockQty: number) => {
      if (category === 'ampas_kopi') {
        // For ampas, weight is based on stock quantity in kg
        return stockQty * 1000 // Convert kg to grams
      } else {
        // For 'lainnya' category (pewarna, deodorizer, etc.), use 1kg
        return 1000 // 1 kg in grams
      }
    }

    // Transform database product to frontend format
    const transformedProduct: ProductDetail = {
      id: product.id.toString(),
      slug: product.slug,
      title: product.title || 'Untitled Product',
      kind: product.kind,
      category: product.category,
      images: transformImageUrls(product.image_urls, product.category),
      price: Number(product.price_idr) || 0,
      compareAtPrice: null, // Field for future discount functionality
      stockQty: parseFloat(product.stock_qty?.toString() || '0'),
      soldCount: Math.round(totalSold), // Real sold count from completed orders
      ratingAvg: ratingData?.avg_rating || 0,
      ratingCount: ratingData?.total_reviews || 0,
      coffeeType: product.coffee_type,
      grindLevel: product.grind_level,
      condition: product.condition,
      weightGram: getWeightInGrams(product.category, parseFloat(product.stock_qty?.toString() || '0')),
      origin: 'Banda Aceh',
      brand: 'Sikupi',
      shortSpecs: [
        `Kategori: ${product.category}`,
        product.coffee_type && product.category === 'ampas_kopi' ? `Jenis Kopi: ${product.coffee_type}` : null,
        product.grind_level && product.category === 'ampas_kopi' ? `Tingkat Giling: ${product.grind_level}` : null,
        product.condition && product.category === 'ampas_kopi' ? `Kondisi: ${product.condition}` : null,
      ].filter(Boolean) as string[],
      description: product.description || 'Deskripsi produk tidak tersedia.',
      createdAt: product.created_at,
    }

    return transformedProduct
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Fetch related products (same category, excluding current product)
async function getRelatedProducts(productId: string, category: ProductCategory, limit: number = 4) {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id, slug, title, category, price_idr, image_urls, stock_qty
      `)
      .eq('category', category)
      .eq('published', true)
      .neq('id', parseInt(productId))
      .limit(limit)

    if (error) {
      console.error('Error fetching related products:', error)
      return []
    }

    return products?.map((product: any) => ({
      id: product.id.toString(),
      slug: product.slug,
      title: product.title,
      category: product.category,
      price: Number(product.price_idr) || 0,
      imageUrl: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null,
      stockQty: parseFloat(product.stock_qty?.toString() || '0'),
    })) || []
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.id, product.category, 4)

  // Breadcrumbs data
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Produk', href: '/products' },
    { label: product.category.replace('_', ' ').toUpperCase(), href: `/products?category=${product.category}` },
    { label: product.title, href: '', current: true }
  ]

  return (
    <CartClient>
      <main className="min-h-screen bg-stone-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-stone-200 pt-20 md:pt-24">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-stone-600">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {index > 0 && <span>›</span>}
                  {crumb.current ? (
                    <span className="text-amber-800 font-medium truncate max-w-[200px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="hover:text-amber-800 transition-colors"
                    >
                      {crumb.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Gallery */}
            <Gallery product={product} />

            {/* Right: Buy Box */}
            <BuyBox product={product} />
          </div>

          {/* Product Information */}
          <div className="mt-12">
            <ProductInfo product={product} />
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <Reviews product={product} />
          </div>

          {/* Related Products */}
          <RelatedProducts 
            products={relatedProducts}
            currentProductCategory={product.category}
          />
        </div>
      </main>
    </CartClient>
  )
}