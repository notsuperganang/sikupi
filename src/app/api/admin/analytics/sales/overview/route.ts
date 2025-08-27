import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminResponse, adminErrorResponse, AdminAuthResult } from '@/lib/admin-auth'

async function handleSalesOverview(
  request: NextRequest,
  adminAuth: AdminAuthResult
) {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get today's metrics
    const { data: todayMetrics, error: todayError } = await (supabaseAdmin as any)
      .from('orders')
      .select('total_idr, status, created_at, buyer_id')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`)

    if (todayError) {
      console.error('Error fetching today metrics:', todayError)
      return adminErrorResponse('Failed to fetch today metrics', 500)
    }

    // Get yesterday's metrics
    const { data: yesterdayMetrics, error: yesterdayError } = await (supabaseAdmin as any)
      .from('orders')
      .select('total_idr, status, created_at, buyer_id')
      .gte('created_at', `${yesterday}T00:00:00`)
      .lt('created_at', `${yesterday}T23:59:59`)

    if (yesterdayError) {
      console.error('Error fetching yesterday metrics:', yesterdayError)
      return adminErrorResponse('Failed to fetch yesterday metrics', 500)
    }

    // Get 7-day metrics
    const { data: weekMetrics, error: weekError } = await (supabaseAdmin as any)
      .from('orders')
      .select('total_idr, status, created_at, buyer_id')
      .gte('created_at', `${sevenDaysAgo}T00:00:00`)

    if (weekError) {
      console.error('Error fetching week metrics:', weekError)
      return adminErrorResponse('Failed to fetch week metrics', 500)
    }

    // Get 30-day metrics
    const { data: monthMetrics, error: monthError } = await (supabaseAdmin as any)
      .from('orders')
      .select('total_idr, status, created_at, buyer_id')
      .gte('created_at', `${thirtyDaysAgo}T00:00:00`)

    if (monthError) {
      console.error('Error fetching month metrics:', monthError)
      return adminErrorResponse('Failed to fetch month metrics', 500)
    }

    // Calculate metrics
    const calculateMetrics = (orders: any[]) => {
      const paidOrders = orders?.filter(o => ['paid', 'packed', 'shipped', 'completed'].includes(o.status)) || []
      const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total_idr || 0), 0)
      const totalOrders = orders?.length || 0
      const paidOrdersCount = paidOrders.length
      const uniqueCustomers = new Set(orders?.map(o => o.buyer_id) || []).size
      const avgOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0

      return {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        paid_orders: paidOrdersCount,
        unique_customers: uniqueCustomers,
        avg_order_value: avgOrderValue,
        revenue_growth: 0,
        orders_growth: 0
      }
    }

    const todayStats = calculateMetrics(todayMetrics || [])
    const yesterdayStats = calculateMetrics(yesterdayMetrics || [])
    const weekStats = calculateMetrics(weekMetrics || [])
    const monthStats = calculateMetrics(monthMetrics || [])

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    // Overall business health metrics
    const totalCustomers = await (supabaseAdmin as any)
      .from('profiles')
      .select('id', { count: 'exact' })

    const conversionRate = monthStats.total_orders > 0 && totalCustomers.count 
      ? Math.round((monthStats.paid_orders / totalCustomers.count) * 100) 
      : 0

    return adminResponse({
      period: 'overview',
      timestamp: now.toISOString(),
      
      // Today vs Yesterday comparison
      today: {
        ...todayStats,
        revenue_growth: calculateGrowth(todayStats.total_revenue, yesterdayStats.total_revenue),
        orders_growth: calculateGrowth(todayStats.total_orders, yesterdayStats.total_orders)
      },
      
      yesterday: yesterdayStats,
      
      // Period summaries
      last_7_days: weekStats,
      last_30_days: monthStats,
      
      // Key performance indicators
      kpis: {
        monthly_revenue: monthStats.total_revenue,
        monthly_orders: monthStats.paid_orders,
        avg_order_value: monthStats.avg_order_value,
        total_customers: totalCustomers.count || 0,
        active_customers_30d: monthStats.unique_customers,
        conversion_rate_percent: conversionRate
      },
      
      // Quick insights
      insights: [
        `${monthStats.paid_orders} paid orders in last 30 days`,
        `Average order value: Rp ${monthStats.avg_order_value.toLocaleString('id-ID')}`,
        `${monthStats.unique_customers} active customers this month`,
        todayStats.revenue_growth >= 0 
          ? `Revenue up ${todayStats.revenue_growth}% from yesterday` 
          : `Revenue down ${Math.abs(todayStats.revenue_growth)}% from yesterday`
      ]
    })

  } catch (error) {
    console.error('Sales overview error:', error)
    return adminErrorResponse('Failed to fetch sales overview', 500)
  }
}

export const GET = requireAdminAuth(handleSalesOverview)