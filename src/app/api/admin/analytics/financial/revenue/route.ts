import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminResponse, adminErrorResponse, AdminAuthResult } from '@/lib/admin-auth'

const FinancialQuerySchema = z.object({
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
  group_by: z.enum(['status', 'payment_method', 'period']).default('period')
})

async function handleFinancialRevenue(
  request: NextRequest,
  adminAuth: AdminAuthResult
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      period: searchParams.get('period') || 'monthly',
      group_by: searchParams.get('group_by') || 'period'
    }
    
    const validatedParams = FinancialQuerySchema.parse(queryParams)
    
    // Set default date range if not provided (last 12 months)
    const endDate = validatedParams.end_date ? new Date(validatedParams.end_date) : new Date()
    const startDate = validatedParams.start_date 
      ? new Date(validatedParams.start_date) 
      : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000) // 1 year ago

    // Get orders within date range - only paid orders for revenue
    const { data: orders, error: ordersError } = await (supabaseAdmin as any)
      .from('orders')
      .select(`
        id,
        status,
        total_idr,
        subtotal_idr,
        shipping_fee_idr,
        created_at,
        paid_at,
        midtrans_order_id,
        payment_status
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('status', ['paid', 'packed', 'shipped', 'completed'])
      .order('created_at', { ascending: true })

    if (ordersError) {
      console.error('Error fetching orders for financial data:', ordersError)
      return adminErrorResponse('Failed to fetch financial data', 500)
    }

    // Group data based on group_by parameter
    let groupedData: any = {}

    if (validatedParams.group_by === 'period') {
      groupedData = groupByPeriod(orders || [], validatedParams.period)
    } else if (validatedParams.group_by === 'status') {
      groupedData = groupByStatus(orders || [])
    } else {
      groupedData = groupByPaymentMethod(orders || [])
    }

    // Calculate summary statistics
    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum: number, order: any) => sum + (order.total_idr || 0), 0) || 0
    const totalProductRevenue = orders?.reduce((sum: number, order: any) => sum + (order.subtotal_idr || 0), 0) || 0
    const totalShippingRevenue = orders?.reduce((sum: number, order: any) => sum + (order.shipping_fee_idr || 0), 0) || 0
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    // Payment method analysis (mock for now - would need payment data)
    const paymentMethodStats = {
      midtrans_total: totalRevenue, // All orders currently use Midtrans
      bank_transfer_count: orders?.filter((o: any) => o.midtrans_order_id?.includes('BANK')).length || 0,
      credit_card_count: orders?.filter((o: any) => o.midtrans_order_id?.includes('CC')).length || 0,
      ewallet_count: orders?.filter((o: any) => o.midtrans_order_id?.includes('WALLET')).length || 0
    }

    // Revenue trends
    const revenueByDay = groupByPeriod(orders || [], 'daily')
    const dailyRevenues = Object.values(revenueByDay).map((day: any) => day.revenue)
    const avgDailyRevenue = dailyRevenues.length > 0 
      ? Math.round(dailyRevenues.reduce((sum: number, rev: number) => sum + rev, 0) / dailyRevenues.length)
      : 0

    // Outstanding payments (pending orders)
    const { data: pendingOrders, error: pendingError } = await (supabaseAdmin as any)
      .from('orders')
      .select('id, total_idr, created_at, status')
      .in('status', ['new', 'pending_payment'])
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const outstandingRevenue = pendingOrders?.reduce((sum: number, order: any) => sum + (order.total_idr || 0), 0) || 0

    return adminResponse({
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      period: validatedParams.period,
      group_by: validatedParams.group_by,
      
      // Summary financials
      summary: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        avg_order_value: avgOrderValue,
        product_revenue: totalProductRevenue,
        shipping_revenue: totalShippingRevenue,
        outstanding_revenue: outstandingRevenue,
        avg_daily_revenue: avgDailyRevenue
      },
      
      // Grouped data
      data: groupedData,
      
      // Payment method breakdown
      payment_methods: {
        midtrans_revenue: paymentMethodStats.midtrans_total,
        method_distribution: {
          bank_transfer: paymentMethodStats.bank_transfer_count,
          credit_card: paymentMethodStats.credit_card_count,
          e_wallet: paymentMethodStats.ewallet_count,
          other: totalOrders - paymentMethodStats.bank_transfer_count - paymentMethodStats.credit_card_count - paymentMethodStats.ewallet_count
        }
      },
      
      // Financial health indicators
      health_indicators: {
        revenue_growth: calculateGrowthRate(dailyRevenues),
        order_value_trend: calculateOrderValueTrend(orders || []),
        payment_success_rate: Math.round((totalOrders / (totalOrders + (pendingOrders?.length || 0))) * 100)
      },
      
      // Quick insights
      insights: [
        `Total revenue: Rp ${totalRevenue.toLocaleString('id-ID')} from ${totalOrders} orders`,
        `Average order value: Rp ${avgOrderValue.toLocaleString('id-ID')}`,
        `Daily average: Rp ${avgDailyRevenue.toLocaleString('id-ID')}`,
        outstandingRevenue > 0 
          ? `Outstanding payments: Rp ${outstandingRevenue.toLocaleString('id-ID')}` 
          : 'All orders paid'
      ]
    })

  } catch (error) {
    console.error('Financial revenue error:', error)
    
    if (error instanceof z.ZodError) {
      return adminErrorResponse('Invalid parameters', 400, error.errors)
    }
    
    return adminErrorResponse('Failed to fetch financial data', 500)
  }
}

// Helper functions
function groupByPeriod(orders: any[], period: string): any {
  const grouped: any = {}
  
  orders.forEach(order => {
    let key: string
    const date = new Date(order.created_at)
    
    if (period === 'daily') {
      key = date.toISOString().split('T')[0]
    } else if (period === 'weekly') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().split('T')[0]
    } else { // monthly
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        revenue: 0,
        orders: 0,
        product_revenue: 0,
        shipping_revenue: 0
      }
    }
    
    grouped[key].revenue += order.total_idr || 0
    grouped[key].orders += 1
    grouped[key].product_revenue += order.subtotal_idr || 0
    grouped[key].shipping_revenue += order.shipping_fee_idr || 0
  })
  
  return grouped
}

function groupByStatus(orders: any[]): any {
  const grouped: any = {}
  
  orders.forEach(order => {
    const status = order.status
    
    if (!grouped[status]) {
      grouped[status] = {
        status,
        revenue: 0,
        orders: 0,
        avg_value: 0
      }
    }
    
    grouped[status].revenue += order.total_idr || 0
    grouped[status].orders += 1
    grouped[status].avg_value = Math.round(grouped[status].revenue / grouped[status].orders)
  })
  
  return grouped
}

function groupByPaymentMethod(orders: any[]): any {
  // Mock implementation - would need actual payment method data
  return {
    midtrans: {
      method: 'midtrans',
      revenue: orders.reduce((sum, o) => sum + (o.total_idr || 0), 0),
      orders: orders.length,
      success_rate: 100
    }
  }
}

function calculateGrowthRate(dailyRevenues: number[]): number {
  if (dailyRevenues.length < 7) return 0
  
  const recent = dailyRevenues.slice(-7).reduce((sum, rev) => sum + rev, 0) / 7
  const previous = dailyRevenues.slice(-14, -7).reduce((sum, rev) => sum + rev, 0) / 7
  
  if (previous === 0) return recent > 0 ? 100 : 0
  return Math.round(((recent - previous) / previous) * 100)
}

function calculateOrderValueTrend(orders: any[]): string {
  if (orders.length < 2) return 'insufficient_data'
  
  const recent = orders.slice(-Math.floor(orders.length / 2))
  const previous = orders.slice(0, Math.floor(orders.length / 2))
  
  const recentAvg = recent.reduce((sum: number, o: any) => sum + (o.total_idr || 0), 0) / recent.length
  const previousAvg = previous.reduce((sum: number, o: any) => sum + (o.total_idr || 0), 0) / previous.length
  
  const change = ((recentAvg - previousAvg) / previousAvg) * 100
  
  if (Math.abs(change) < 5) return 'stable'
  return change > 0 ? 'increasing' : 'decreasing'
}

export const GET = requireAdminAuth(handleFinancialRevenue)