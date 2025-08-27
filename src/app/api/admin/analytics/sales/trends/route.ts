import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminResponse, adminErrorResponse, AdminAuthResult } from '@/lib/admin-auth'

const TrendsQuerySchema = z.object({
  period: z.enum(['7d', '30d']).default('7d'),
  metric: z.enum(['revenue', 'orders', 'customers']).default('revenue')
})

async function handleSalesTrends(
  request: NextRequest,
  adminAuth: AdminAuthResult
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      period: searchParams.get('period') || '7d',
      metric: searchParams.get('metric') || 'revenue'
    }
    
    const validatedParams = TrendsQuerySchema.parse(queryParams)
    
    const now = new Date()
    const daysBack = validatedParams.period === '30d' ? 30 : 7
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    
    // Get orders data for the period
    const { data: orders, error: ordersError } = await (supabaseAdmin as any)
      .from('orders')
      .select('total_idr, status, created_at, buyer_id')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (ordersError) {
      console.error('Error fetching orders for trends:', ordersError)
      return adminErrorResponse('Failed to fetch trend data', 500)
    }

    // Group data by date
    const dailyData = new Map<string, {
      date: string
      total_revenue: number
      total_orders: number
      paid_orders: number
      unique_customers: number
    }>()

    // Initialize all dates in range
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      dailyData.set(dateStr, {
        date: dateStr,
        total_revenue: 0,
        total_orders: 0,
        paid_orders: 0,
        unique_customers: 0
      })
    }

    // Process orders data
    const dailyCustomers = new Map<string, Set<string>>()
    
    orders?.forEach((order: any) => {
      const date = order.created_at.split('T')[0]
      const dayData = dailyData.get(date)
      
      if (dayData) {
        dayData.total_orders += 1
        
        if (['paid', 'packed', 'shipped', 'completed'].includes(order.status)) {
          dayData.total_revenue += order.total_idr || 0
          dayData.paid_orders += 1
        }
        
        // Track unique customers per day
        if (!dailyCustomers.has(date)) {
          dailyCustomers.set(date, new Set())
        }
        dailyCustomers.get(date)?.add(order.buyer_id)
      }
    })

    // Add unique customer counts
    dailyCustomers.forEach((customers, date) => {
      const dayData = dailyData.get(date)
      if (dayData) {
        dayData.unique_customers = customers.size
      }
    })

    // Convert to array and sort by date
    const trendsData = Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Calculate totals and averages
    const totals = trendsData.reduce((acc, day) => ({
      revenue: acc.revenue + day.total_revenue,
      orders: acc.orders + day.total_orders,
      paid_orders: acc.paid_orders + day.paid_orders,
      customers: acc.customers + day.unique_customers
    }), { revenue: 0, orders: 0, paid_orders: 0, customers: 0 })

    const averages = {
      daily_revenue: Math.round(totals.revenue / daysBack),
      daily_orders: Math.round(totals.orders / daysBack),
      daily_paid_orders: Math.round(totals.paid_orders / daysBack),
      daily_customers: Math.round(totals.customers / daysBack)
    }

    // Format data for charts
    const chartData = {
      labels: trendsData.map(d => {
        const date = new Date(d.date)
        return validatedParams.period === '30d' 
          ? date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
      }),
      datasets: [
        {
          label: getMetricLabel(validatedParams.metric),
          data: trendsData.map(d => getMetricValue(d, validatedParams.metric)),
          borderColor: getMetricColor(validatedParams.metric),
          backgroundColor: getMetricColor(validatedParams.metric) + '20',
          tension: 0.4
        }
      ]
    }

    return adminResponse({
      period: validatedParams.period,
      metric: validatedParams.metric,
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      },
      
      // Chart data
      chart_data: chartData,
      
      // Summary statistics
      totals: {
        revenue: totals.revenue,
        orders: totals.orders,
        paid_orders: totals.paid_orders,
        unique_customers: totals.customers
      },
      
      averages,
      
      // Daily breakdown
      daily_data: trendsData,
      
      // Performance insights
      insights: [
        `Average daily ${validatedParams.metric}: ${getFormattedAverage(validatedParams.metric, averages)}`,
        `Peak day: ${getPeakDay(trendsData, validatedParams.metric)}`,
        `Trend: ${getTrendDirection(trendsData, validatedParams.metric)}`
      ]
    })

  } catch (error) {
    console.error('Sales trends error:', error)
    
    if (error instanceof z.ZodError) {
      return adminErrorResponse('Invalid parameters', 400, error.errors)
    }
    
    return adminErrorResponse('Failed to fetch sales trends', 500)
  }
}

// Helper functions
function getMetricValue(dayData: any, metric: string): number {
  switch (metric) {
    case 'revenue': return dayData.total_revenue
    case 'orders': return dayData.paid_orders
    case 'customers': return dayData.unique_customers
    default: return dayData.total_revenue
  }
}

function getMetricLabel(metric: string): string {
  switch (metric) {
    case 'revenue': return 'Revenue (IDR)'
    case 'orders': return 'Paid Orders'
    case 'customers': return 'Unique Customers'
    default: return 'Revenue (IDR)'
  }
}

function getMetricColor(metric: string): string {
  switch (metric) {
    case 'revenue': return '#10b981'  // Green
    case 'orders': return '#3b82f6'   // Blue
    case 'customers': return '#f59e0b' // Orange
    default: return '#10b981'
  }
}

function getFormattedAverage(metric: string, averages: any): string {
  switch (metric) {
    case 'revenue': return `Rp ${averages.daily_revenue.toLocaleString('id-ID')}`
    case 'orders': return `${averages.daily_paid_orders} orders`
    case 'customers': return `${averages.daily_customers} customers`
    default: return `Rp ${averages.daily_revenue.toLocaleString('id-ID')}`
  }
}

function getPeakDay(data: any[], metric: string): string {
  const peak = data.reduce((max, day) => 
    getMetricValue(day, metric) > getMetricValue(max, metric) ? day : max
  )
  const date = new Date(peak.date)
  return date.toLocaleDateString('id-ID', { weekday: 'long', month: 'short', day: 'numeric' })
}

function getTrendDirection(data: any[], metric: string): string {
  if (data.length < 2) return 'Insufficient data'
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, day) => sum + getMetricValue(day, metric), 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, day) => sum + getMetricValue(day, metric), 0) / secondHalf.length
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100
  
  if (Math.abs(change) < 5) return 'Stable'
  return change > 0 ? `Growing (+${Math.round(change)}%)` : `Declining (${Math.round(change)}%)`
}

export const GET = requireAdminAuth(handleSalesTrends)