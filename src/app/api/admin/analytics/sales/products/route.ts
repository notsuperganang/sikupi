import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminResponse, adminErrorResponse, AdminAuthResult } from '@/lib/admin-auth'

const ProductsAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', 'all']).default('30d'),
  limit: z.number().min(1).max(50).default(10),
  sort_by: z.enum(['quantity', 'revenue']).default('revenue')
})

async function handleProductsAnalytics(
  request: NextRequest,
  adminAuth: AdminAuthResult
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      period: searchParams.get('period') || '30d',
      limit: parseInt(searchParams.get('limit') || '10'),
      sort_by: searchParams.get('sort_by') || 'revenue'
    }
    
    const validatedParams = ProductsAnalyticsQuerySchema.parse(queryParams)
    
    // Calculate date filter
    let dateFilter = ''
    if (validatedParams.period !== 'all') {
      const daysBack = validatedParams.period === '30d' ? 30 : 7
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
      dateFilter = startDate.toISOString()
    }

    // Get paid orders first, then their items
    let orderQuery = (supabaseAdmin as any)
      .from('orders')
      .select('id, created_at, status')
      .in('status', ['paid', 'packed', 'shipped', 'completed'])

    // Apply date filter if specified
    if (dateFilter) {
      orderQuery = orderQuery.gte('created_at', dateFilter)
    }

    const { data: paidOrders, error: ordersError } = await orderQuery

    if (ordersError) {
      console.error('Error fetching paid orders:', ordersError)
      return adminErrorResponse('Failed to fetch orders data', 500)
    }

    if (!paidOrders || paidOrders.length === 0) {
      // Return empty analytics
      return adminResponse({
        period: validatedParams.period,
        sort_by: validatedParams.sort_by,
        top_products: [],
        summary: {
          total_products_sold: 0,
          total_quantity_sold: 0,
          total_revenue: 0,
          average_orders_per_product: 0,
          top_performer: null
        },
        insights: { best_sellers: [], slow_movers: [], category_performance: [] },
        quick_insights: ['No sales data available for the selected period']
      })
    }

    const orderIds = paidOrders.map((order: any) => order.id)

    // Get order items for paid orders
    const { data: orderItems, error: itemsError } = await (supabaseAdmin as any)
      .from('order_items')
      .select(`
        product_id,
        product_title,
        price_idr,
        qty,
        unit,
        coffee_type,
        grind_level,
        condition,
        image_url
      `)
      .in('order_id', orderIds)

    if (itemsError) {
      console.error('Error fetching order items for product analytics:', itemsError)
      return adminErrorResponse('Failed to fetch product data', 500)
    }

    // Group by product and calculate metrics
    const productMetrics = new Map<number, {
      product_id: number
      product_title: string
      total_quantity: number
      total_revenue: number
      order_count: number
      avg_price: number
      unit: string
      coffee_type?: string
      grind_level?: string
      condition?: string
      image_url?: string
    }>()

    orderItems?.forEach((item: any) => {
      const productId = item.product_id
      const quantity = parseFloat(item.qty)
      const revenue = item.price_idr * quantity

      if (productMetrics.has(productId)) {
        const existing = productMetrics.get(productId)!
        existing.total_quantity += quantity
        existing.total_revenue += revenue
        existing.order_count += 1
        existing.avg_price = Math.round(existing.total_revenue / existing.total_quantity)
      } else {
        productMetrics.set(productId, {
          product_id: productId,
          product_title: item.product_title,
          total_quantity: quantity,
          total_revenue: revenue,
          order_count: 1,
          avg_price: item.price_idr,
          unit: item.unit,
          coffee_type: item.coffee_type,
          grind_level: item.grind_level,
          condition: item.condition,
          image_url: item.image_url
        })
      }
    })

    // Convert to array and sort
    const productsArray = Array.from(productMetrics.values())

    // Sort by specified metric
    productsArray.sort((a, b) => {
      if (validatedParams.sort_by === 'quantity') {
        return b.total_quantity - a.total_quantity
      }
      return b.total_revenue - a.total_revenue
    })

    // Apply limit
    const topProducts = productsArray.slice(0, validatedParams.limit)

    // Calculate summary statistics
    const totalProducts = productsArray.length
    const totalQuantitySold = productsArray.reduce((sum, p) => sum + p.total_quantity, 0)
    const totalRevenue = productsArray.reduce((sum, p) => sum + p.total_revenue, 0)
    const averageOrdersPerProduct = productsArray.length > 0 
      ? Math.round(productsArray.reduce((sum, p) => sum + p.order_count, 0) / productsArray.length)
      : 0

    // Identify performance categories
    const bestSellers = topProducts.slice(0, Math.min(3, topProducts.length))
    const slowMovers = productsArray.slice(-5).reverse().filter(p => p.order_count <= 2)

    // Calculate category performance if available
    const categoryStats = new Map<string, { revenue: number, quantity: number, count: number }>()
    
    productsArray.forEach(product => {
      const category = product.coffee_type || 'Other'
      if (categoryStats.has(category)) {
        const existing = categoryStats.get(category)!
        existing.revenue += product.total_revenue
        existing.quantity += product.total_quantity
        existing.count += 1
      } else {
        categoryStats.set(category, {
          revenue: product.total_revenue,
          quantity: product.total_quantity,
          count: 1
        })
      }
    })

    const categoryPerformance = Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      revenue: stats.revenue,
      quantity: stats.quantity,
      product_count: stats.count,
      avg_revenue_per_product: Math.round(stats.revenue / stats.count)
    })).sort((a, b) => b.revenue - a.revenue)

    return adminResponse({
      period: validatedParams.period,
      sort_by: validatedParams.sort_by,
      date_range: dateFilter ? {
        start: dateFilter.split('T')[0],
        end: new Date().toISOString().split('T')[0]
      } : null,
      
      // Top products list
      top_products: topProducts.map(product => ({
        product_id: product.product_id,
        title: product.product_title,
        total_quantity: product.total_quantity,
        total_revenue: product.total_revenue,
        order_count: product.order_count,
        avg_price: product.avg_price,
        unit: product.unit,
        specifications: {
          coffee_type: product.coffee_type,
          grind_level: product.grind_level,
          condition: product.condition
        },
        image_url: product.image_url,
        performance_score: Math.round((product.total_revenue / totalRevenue) * 100) // % of total revenue
      })),
      
      // Summary statistics
      summary: {
        total_products_sold: totalProducts,
        total_quantity_sold: totalQuantitySold,
        total_revenue: totalRevenue,
        average_orders_per_product: averageOrdersPerProduct,
        top_performer: topProducts[0] ? {
          title: topProducts[0].product_title,
          metric: validatedParams.sort_by === 'quantity' 
            ? `${topProducts[0].total_quantity} ${topProducts[0].unit}`
            : `Rp ${topProducts[0].total_revenue.toLocaleString('id-ID')}`
        } : null
      },
      
      // Performance insights
      insights: {
        best_sellers: bestSellers.map(p => ({
          title: p.product_title,
          revenue: p.total_revenue,
          quantity: p.total_quantity
        })),
        slow_movers: slowMovers.map(p => ({
          title: p.product_title,
          revenue: p.total_revenue,
          order_count: p.order_count
        })),
        category_performance: categoryPerformance
      },
      
      // Quick insights text
      quick_insights: [
        `${bestSellers.length} best-selling products generate ${Math.round((bestSellers.reduce((sum, p) => sum + p.total_revenue, 0) / totalRevenue) * 100)}% of revenue`,
        `Average ${Math.round(totalQuantitySold / totalProducts)} ${topProducts[0]?.unit || 'units'} sold per product`,
        `Top category: ${categoryPerformance[0]?.category || 'N/A'} (${categoryPerformance[0]?.product_count || 0} products)`,
        slowMovers.length > 0 
          ? `${slowMovers.length} products need attention (≤2 orders)`
          : 'All products performing well'
      ]
    })

  } catch (error) {
    console.error('Products analytics error:', error)
    
    if (error instanceof z.ZodError) {
      return adminErrorResponse('Invalid parameters', 400, error.errors)
    }
    
    return adminErrorResponse('Failed to fetch product analytics', 500)
  }
}

export const GET = requireAdminAuth(handleProductsAnalytics)