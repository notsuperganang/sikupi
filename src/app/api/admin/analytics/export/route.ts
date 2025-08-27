import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminErrorResponse, AdminAuthResult } from '@/lib/admin-auth'

const ExportQuerySchema = z.object({
  type: z.enum(['sales', 'orders', 'products', 'revenue']).default('sales'),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  format: z.enum(['csv']).default('csv')
})

async function handleAnalyticsExport(
  request: NextRequest,
  adminAuth: AdminAuthResult
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      type: searchParams.get('type') || 'sales',
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      format: searchParams.get('format') || 'csv'
    }
    
    const validatedParams = ExportQuerySchema.parse(queryParams)
    
    // Set default date range (last 30 days)
    const endDate = validatedParams.end_date ? new Date(validatedParams.end_date) : new Date()
    const startDate = validatedParams.start_date 
      ? new Date(validatedParams.start_date) 
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    let csvData: string = ''
    let filename: string = ''

    switch (validatedParams.type) {
      case 'sales':
        const salesData = await generateSalesExport(startDate, endDate)
        csvData = salesData.csv
        filename = `sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`
        break
        
      case 'orders':
        const ordersData = await generateOrdersExport(startDate, endDate)
        csvData = ordersData.csv
        filename = `orders-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`
        break
        
      case 'products':
        const productsData = await generateProductsExport(startDate, endDate)
        csvData = productsData.csv
        filename = `products-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`
        break
        
      case 'revenue':
        const revenueData = await generateRevenueExport(startDate, endDate)
        csvData = revenueData.csv
        filename = `revenue-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`
        break
    }

    // Return CSV with appropriate headers
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Analytics export error:', error)
    
    if (error instanceof z.ZodError) {
      return adminErrorResponse('Invalid parameters', 400, error.errors)
    }
    
    return adminErrorResponse('Failed to generate export', 500)
  }
}

// Export generators
async function generateSalesExport(startDate: Date, endDate: Date) {
  const { data: orders } = await (supabaseAdmin as any)
    .from('orders')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['paid', 'packed', 'shipped', 'completed'])

  const headers = [
    'Date',
    'Order ID',
    'Status',
    'Total Revenue (IDR)',
    'Product Revenue (IDR)',
    'Shipping Fee (IDR)',
    'Customer',
    'Items Count'
  ]

  let csv = headers.join(',') + '\n'

  orders?.forEach((order: any) => {
    const date = new Date(order.created_at).toLocaleDateString('id-ID')
    const row = [
      date,
      order.id,
      order.status,
      order.total_idr || 0,
      order.subtotal_idr || 0,
      order.shipping_fee_idr || 0,
      `"Customer ${order.buyer_id}"`,
      1 // Would need to count actual items
    ]
    csv += row.join(',') + '\n'
  })

  return { csv }
}

async function generateOrdersExport(startDate: Date, endDate: Date) {
  const { data: orders } = await (supabaseAdmin as any)
    .from('orders')
    .select(`
      id,
      status,
      total_idr,
      subtotal_idr,
      shipping_fee_idr,
      created_at,
      paid_at,
      buyer_id,
      shipping_address,
      courier_company,
      courier_service,
      tracking_number
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const headers = [
    'Order ID',
    'Status',
    'Created Date',
    'Paid Date',
    'Total (IDR)',
    'Subtotal (IDR)',
    'Shipping (IDR)',
    'Customer ID',
    'Courier',
    'Service',
    'Tracking Number',
    'City'
  ]

  let csv = headers.join(',') + '\n'

  orders?.forEach((order: any) => {
    const createdDate = new Date(order.created_at).toLocaleDateString('id-ID')
    const paidDate = order.paid_at ? new Date(order.paid_at).toLocaleDateString('id-ID') : ''
    const city = order.shipping_address?.city || ''
    
    const row = [
      order.id,
      order.status,
      createdDate,
      paidDate,
      order.total_idr || 0,
      order.subtotal_idr || 0,
      order.shipping_fee_idr || 0,
      order.buyer_id,
      order.courier_company || '',
      order.courier_service || '',
      order.tracking_number || '',
      `"${city}"`
    ]
    csv += row.join(',') + '\n'
  })

  return { csv }
}

async function generateProductsExport(startDate: Date, endDate: Date) {
  const { data: orderItems } = await (supabaseAdmin as any)
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
      orders!inner(
        status,
        created_at
      )
    `)
    .gte('orders.created_at', startDate.toISOString())
    .lte('orders.created_at', endDate.toISOString())
    .in('orders.status', ['paid', 'packed', 'shipped', 'completed'])

  // Group by product
  const productStats = new Map()

  orderItems?.forEach((item: any) => {
    const key = item.product_id
    const quantity = parseFloat(item.qty)
    const revenue = item.price_idr * quantity

    if (productStats.has(key)) {
      const existing = productStats.get(key)
      existing.quantity += quantity
      existing.revenue += revenue
      existing.orders += 1
    } else {
      productStats.set(key, {
        product_id: item.product_id,
        title: item.product_title,
        quantity: quantity,
        revenue: revenue,
        orders: 1,
        unit: item.unit,
        coffee_type: item.coffee_type,
        grind_level: item.grind_level,
        condition: item.condition
      })
    }
  })

  const headers = [
    'Product ID',
    'Product Title',
    'Total Quantity Sold',
    'Unit',
    'Total Revenue (IDR)',
    'Order Count',
    'Avg Revenue per Order (IDR)',
    'Coffee Type',
    'Grind Level',
    'Condition'
  ]

  let csv = headers.join(',') + '\n'

  Array.from(productStats.values()).forEach((product: any) => {
    const avgRevenue = Math.round(product.revenue / product.orders)
    
    const row = [
      product.product_id,
      `"${product.title}"`,
      product.quantity,
      product.unit,
      product.revenue,
      product.orders,
      avgRevenue,
      product.coffee_type || '',
      product.grind_level || '',
      product.condition || ''
    ]
    csv += row.join(',') + '\n'
  })

  return { csv }
}

async function generateRevenueExport(startDate: Date, endDate: Date) {
  const { data: orders } = await (supabaseAdmin as any)
    .from('orders')
    .select('total_idr, subtotal_idr, shipping_fee_idr, created_at, status, paid_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['paid', 'packed', 'shipped', 'completed'])

  // Group by date
  const dailyRevenue = new Map()

  orders?.forEach((order: any) => {
    const date = new Date(order.created_at).toISOString().split('T')[0]
    
    if (dailyRevenue.has(date)) {
      const existing = dailyRevenue.get(date)
      existing.total_revenue += order.total_idr || 0
      existing.product_revenue += order.subtotal_idr || 0
      existing.shipping_revenue += order.shipping_fee_idr || 0
      existing.orders += 1
    } else {
      dailyRevenue.set(date, {
        date,
        total_revenue: order.total_idr || 0,
        product_revenue: order.subtotal_idr || 0,
        shipping_revenue: order.shipping_fee_idr || 0,
        orders: 1
      })
    }
  })

  const headers = [
    'Date',
    'Total Revenue (IDR)',
    'Product Revenue (IDR)',
    'Shipping Revenue (IDR)',
    'Orders Count',
    'Avg Order Value (IDR)'
  ]

  let csv = headers.join(',') + '\n'

  Array.from(dailyRevenue.values())
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .forEach((day: any) => {
      const avgOrderValue = Math.round(day.total_revenue / day.orders)
      
      const row = [
        day.date,
        day.total_revenue,
        day.product_revenue,
        day.shipping_revenue,
        day.orders,
        avgOrderValue
      ]
      csv += row.join(',') + '\n'
    })

  return { csv }
}

export const GET = requireAdminAuth(handleAnalyticsExport)