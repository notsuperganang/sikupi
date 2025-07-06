const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get platform-wide metrics (public)
router.get('/metrics', optionalAuth, async (req, res) => {
  try {
    // Get latest platform metrics
    const { data: metrics, error } = await supabase
      .from('platform_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Metrics fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch metrics',
        message: 'Could not retrieve platform metrics'
      });
    }

    // Group metrics by type and get the latest value for each
    const latestMetrics = {};
    metrics.forEach(metric => {
      if (!latestMetrics[metric.metric_type]) {
        latestMetrics[metric.metric_type] = metric;
      }
    });

    // Calculate real-time metrics
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get active products count
    const { count: activeProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get completed transactions in last 30 days
    const { count: recentTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered')
      .gte('delivered_at', thirtyDaysAgo.toISOString());

    // Get total waste diverted
    const { data: wasteData } = await supabase
      .from('transactions')
      .select('quantity_kg')
      .eq('status', 'delivered');

    const totalWasteDiverted = wasteData?.reduce((sum, t) => sum + parseFloat(t.quantity_kg), 0) || 0;

    // Calculate environmental impact
    const co2Saved = totalWasteDiverted * 0.5; // Assuming 0.5kg CO2 saved per kg of waste
    const treesEquivalent = Math.floor(totalWasteDiverted / 60); // Rough calculation
    const waterSaved = totalWasteDiverted * 10; // Assuming 10L water saved per kg

    const dashboardMetrics = {
      waste_diverted: {
        value: totalWasteDiverted,
        unit: 'kg',
        description: 'Total coffee waste diverted from landfills'
      },
      co2_emissions_saved: {
        value: co2Saved,
        unit: 'kg',
        description: 'CO2 emissions prevented'
      },
      active_products: {
        value: activeProducts || 0,
        unit: 'count',
        description: 'Products currently available'
      },
      total_users: {
        value: totalUsers || 0,
        unit: 'count',
        description: 'Registered users on platform'
      },
      recent_transactions: {
        value: recentTransactions || 0,
        unit: 'count',
        description: 'Completed transactions (last 30 days)'
      },
      trees_equivalent: {
        value: treesEquivalent,
        unit: 'count',
        description: 'Equivalent trees saved'
      },
      water_saved: {
        value: waterSaved,
        unit: 'liters',
        description: 'Water conservation estimate'
      }
    };

    res.json({
      metrics: dashboardMetrics,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching dashboard metrics'
    });
  }
});

// Get user-specific statistics
router.get('/user-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    const stats = {
      user_type: userType,
      profile: {
        rating: req.user.rating || 0,
        total_reviews: req.user.total_reviews || 0,
        is_verified: req.user.is_verified || false
      }
    };

    if (userType === 'seller' || userType === 'admin') {
      // Seller statistics
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId);

      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', userId)
        .eq('status', 'active');

      const { data: salesData } = await supabase
        .from('transactions')
        .select('total_amount, status, quantity_kg')
        .eq('seller_id', userId);

      const totalSales = salesData?.filter(t => t.status === 'delivered').length || 0;
      const totalRevenue = salesData?.filter(t => t.status === 'delivered')
        .reduce((sum, t) => sum + parseFloat(t.total_amount), 0) || 0;
      const totalWasteSold = salesData?.filter(t => t.status === 'delivered')
        .reduce((sum, t) => sum + parseFloat(t.quantity_kg), 0) || 0;

      stats.seller = {
        total_products: totalProducts || 0,
        active_products: activeProducts || 0,
        total_sales: totalSales,
        total_revenue: totalRevenue,
        total_waste_sold: totalWasteSold
      };
    }

    if (userType === 'buyer' || userType === 'admin') {
      // Buyer statistics
      const { data: purchaseData } = await supabase
        .from('transactions')
        .select('total_amount, status, quantity_kg')
        .eq('buyer_id', userId);

      const totalPurchases = purchaseData?.filter(t => t.status === 'delivered').length || 0;
      const totalSpent = purchaseData?.filter(t => t.status === 'delivered')
        .reduce((sum, t) => sum + parseFloat(t.total_amount), 0) || 0;
      const totalWastePurchased = purchaseData?.filter(t => t.status === 'delivered')
        .reduce((sum, t) => sum + parseFloat(t.quantity_kg), 0) || 0;

      const { count: favoritesCount } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      stats.buyer = {
        total_purchases: totalPurchases,
        total_spent: totalSpent,
        total_waste_purchased: totalWastePurchased,
        favorites_count: favoritesCount || 0
      };
    }

    // Recent activity
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select(`
        id,
        status,
        total_amount,
        created_at,
        products (title, waste_type)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(5);

    stats.recent_activity = recentTransactions || [];

    res.json({
      stats
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching user statistics'
    });
  }
});

// Get admin dashboard data (admin only)
router.get('/admin-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User statistics
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { count: verifiedUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    // Product statistics
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: activeProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: newProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Transaction statistics
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('status, total_amount, created_at, quantity_kg');

    const transactionStats = {
      total: allTransactions?.length || 0,
      pending: allTransactions?.filter(t => t.status === 'pending').length || 0,
      confirmed: allTransactions?.filter(t => t.status === 'confirmed').length || 0,
      shipped: allTransactions?.filter(t => t.status === 'shipped').length || 0,
      delivered: allTransactions?.filter(t => t.status === 'delivered').length || 0,
      cancelled: allTransactions?.filter(t => t.status === 'cancelled').length || 0
    };

    const recentTransactions = allTransactions?.filter(
      t => new Date(t.created_at) >= sevenDaysAgo
    ).length || 0;

    // Revenue statistics
    const totalRevenue = allTransactions?.filter(t => t.status === 'delivered')
      .reduce((sum, t) => sum + parseFloat(t.total_amount), 0) || 0;

    const recentRevenue = allTransactions?.filter(
      t => t.status === 'delivered' && new Date(t.created_at) >= thirtyDaysAgo
    ).reduce((sum, t) => sum + parseFloat(t.total_amount), 0) || 0;

    // Waste statistics
    const totalWasteDiverted = allTransactions?.filter(t => t.status === 'delivered')
      .reduce((sum, t) => sum + parseFloat(t.quantity_kg), 0) || 0;

    // Top products by sales
    const { data: topProducts } = await supabase
      .from('transactions')
      .select(`
        product_id,
        products (title, waste_type),
        quantity_kg
      `)
      .eq('status', 'delivered');

    const productSales = {};
    topProducts?.forEach(t => {
      if (t.products) {
        const key = t.product_id;
        if (!productSales[key]) {
          productSales[key] = {
            product: t.products,
            total_sold: 0,
            sales_count: 0
          };
        }
        productSales[key].total_sold += parseFloat(t.quantity_kg);
        productSales[key].sales_count += 1;
      }
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5);

    // Recent users
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, full_name, email, user_type, created_at, is_verified')
      .order('created_at', { ascending: false })
      .limit(10);

    const adminStats = {
      users: {
        total: totalUsers || 0,
        new_this_month: newUsers || 0,
        verified: verifiedUsers || 0,
        verification_rate: totalUsers ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0
      },
      products: {
        total: totalProducts || 0,
        active: activeProducts || 0,
        new_this_week: newProducts || 0
      },
      transactions: {
        ...transactionStats,
        recent_week: recentTransactions,
        success_rate: transactionStats.total ? 
          ((transactionStats.delivered / transactionStats.total) * 100).toFixed(1) : 0
      },
      revenue: {
        total: totalRevenue,
        this_month: recentRevenue,
        average_order_value: transactionStats.delivered ? 
          (totalRevenue / transactionStats.delivered).toFixed(0) : 0
      },
      environmental: {
        total_waste_diverted: totalWasteDiverted,
        co2_saved: totalWasteDiverted * 0.5,
        trees_equivalent: Math.floor(totalWasteDiverted / 60)
      },
      top_products: topSellingProducts,
      recent_users: recentUsers || []
    };

    res.json({
      admin_stats: adminStats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching admin statistics'
    });
  }
});

// Get waste type distribution
router.get('/waste-distribution', optionalAuth, async (req, res) => {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('waste_type, quantity_kg, status')
      .eq('status', 'active');

    const distribution = {
      coffee_grounds: 0,
      coffee_pulp: 0,
      coffee_husks: 0,
      coffee_chaff: 0
    };

    products?.forEach(product => {
      distribution[product.waste_type] += parseFloat(product.quantity_kg);
    });

    const totalQuantity = Object.values(distribution).reduce((sum, qty) => sum + qty, 0);

    const percentageDistribution = {};
    Object.keys(distribution).forEach(type => {
      percentageDistribution[type] = {
        quantity: distribution[type],
        percentage: totalQuantity ? ((distribution[type] / totalQuantity) * 100).toFixed(1) : 0
      };
    });

    res.json({
      distribution: percentageDistribution,
      total_quantity: totalQuantity
    });
  } catch (error) {
    console.error('Waste distribution error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching waste distribution'
    });
  }
});

// Update platform metrics (admin only)
router.post('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { metric_type, metric_value, unit, description } = req.body;

    if (!metric_type || metric_value === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'metric_type and metric_value are required'
      });
    }

    const { data: metric, error } = await supabase
      .from('platform_metrics')
      .insert({
        metric_type,
        metric_value,
        unit,
        description,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Metric creation error:', error);
      return res.status(500).json({
        error: 'Failed to create metric',
        message: 'Could not save platform metric'
      });
    }

    res.status(201).json({
      message: 'Metric created successfully',
      metric
    });
  } catch (error) {
    console.error('Metric creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while creating metric'
    });
  }
});

module.exports = router;