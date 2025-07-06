const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireBuyer, requireSeller } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Get user's transactions
router.get('/', authenticateToken, validateQuery(schemas.paginationQuery), async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sort_by = 'created_at', order = 'desc' } = req.query;

    const offset = (page - 1) * limit;
    const ascending = order === 'asc';

    // Get transactions where user is buyer or seller
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        products (
          id,
          title,
          waste_type,
          image_urls
        ),
        buyer:users!transactions_buyer_id_fkey (
          id,
          full_name,
          business_name,
          email,
          phone
        ),
        seller:users!transactions_seller_id_fkey (
          id,
          full_name,
          business_name,
          email,
          phone
        )
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order(sort_by, { ascending })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Transactions fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch transactions',
        message: 'Could not retrieve transactions'
      });
    }

    // Get total count
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching transactions'
    });
  }
});

// Get single transaction
router.get('/:id', authenticateToken, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        products (
          id,
          title,
          description,
          waste_type,
          image_urls,
          quality_grade,
          processing_method,
          origin_location
        ),
        buyer:users!transactions_buyer_id_fkey (
          id,
          full_name,
          business_name,
          email,
          phone,
          address,
          city,
          province
        ),
        seller:users!transactions_seller_id_fkey (
          id,
          full_name,
          business_name,
          email,
          phone,
          address,
          city,
          province
        )
      `)
      .eq('id', id)
      .single();

    if (error || !transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist'
      });
    }

    // Check if user is involved in this transaction
    if (transaction.buyer_id !== userId && transaction.seller_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You are not authorized to view this transaction'
      });
    }

    res.json({
      transaction
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching the transaction'
    });
  }
});

// Create new transaction (purchase)
router.post('/', authenticateToken, requireBuyer, validateBody(schemas.transactionCreate), async (req, res) => {
  try {
    const { product_id, quantity_kg, shipping_address, notes } = req.body;
    const buyerId = req.user.id;

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        seller_id,
        title,
        price_per_kg,
        quantity_kg,
        status,
        users!products_seller_id_fkey (
          id,
          full_name,
          business_name
        )
      `)
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        error: 'Product unavailable',
        message: 'This product is currently not available for purchase'
      });
    }

    if (product.seller_id === buyerId) {
      return res.status(400).json({
        error: 'Invalid transaction',
        message: 'You cannot purchase your own product'
      });
    }

    if (quantity_kg > product.quantity_kg) {
      return res.status(400).json({
        error: 'Insufficient quantity',
        message: `Only ${product.quantity_kg}kg available`
      });
    }

    // Calculate total amount
    const totalAmount = quantity_kg * product.price_per_kg;
    const shippingCost = 0; // Will be calculated by shipping service

    // Create transaction
    const transactionData = {
      id: uuidv4(),
      buyer_id: buyerId,
      seller_id: product.seller_id,
      product_id,
      quantity_kg,
      price_per_kg: product.price_per_kg,
      total_amount: totalAmount,
      shipping_address,
      shipping_cost: shippingCost,
      notes,
      status: 'pending'
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select(`
        *,
        products (
          id,
          title,
          waste_type
        ),
        seller:users!transactions_seller_id_fkey (
          id,
          full_name,
          business_name
        )
      `)
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return res.status(500).json({
        error: 'Transaction creation failed',
        message: 'Could not create transaction'
      });
    }

    // Remove item from cart if it exists
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', buyerId)
      .eq('product_id', product_id);

    // Create notification for seller
    await supabase
      .from('notifications')
      .insert({
        user_id: product.seller_id,
        title: 'New Order Received',
        message: `You have received a new order for ${product.title}`,
        type: 'order',
        related_id: transaction.id
      });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while creating the transaction'
    });
  }
});

// Update transaction status
router.put('/:id/status', authenticateToken, validateParams(schemas.uuidParam), validateBody(schemas.transactionStatusUpdate), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, notes } = req.body;
    const userId = req.user.id;

    // Get current transaction
    const { data: currentTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        products (
          id,
          title,
          quantity_kg
        ),
        buyer:users!transactions_buyer_id_fkey (
          id,
          full_name
        ),
        seller:users!transactions_seller_id_fkey (
          id,
          full_name
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !currentTransaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist'
      });
    }

    // Check permissions for status updates
    const isSellerUpdate = currentTransaction.seller_id === userId;
    const isBuyerUpdate = currentTransaction.buyer_id === userId;

    if (!isSellerUpdate && !isBuyerUpdate) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You are not authorized to update this transaction'
      });
    }

    // Define allowed status transitions
    const statusTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!statusTransitions[currentTransaction.status].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status transition',
        message: `Cannot change status from ${currentTransaction.status} to ${status}`
      });
    }

    // Only sellers can confirm and ship, buyers can cancel or confirm delivery
    if (status === 'confirmed' && !isSellerUpdate) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only sellers can confirm orders'
      });
    }

    if (status === 'shipped' && !isSellerUpdate) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only sellers can mark orders as shipped'
      });
    }

    if (status === 'delivered' && !isBuyerUpdate) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only buyers can confirm delivery'
      });
    }

    // Prepare update data
    const updateData = { status };
    const currentTime = new Date().toISOString();

    if (status === 'confirmed') {
      updateData.confirmed_at = currentTime;
    } else if (status === 'shipped') {
      updateData.shipped_at = currentTime;
      if (tracking_number) {
        updateData.tracking_number = tracking_number;
      }
    } else if (status === 'delivered') {
      updateData.delivered_at = currentTime;
    } else if (status === 'cancelled') {
      updateData.cancelled_at = currentTime;
    }

    if (notes) {
      updateData.notes = notes;
    }

    // Update transaction
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        products (
          id,
          title,
          waste_type
        ),
        buyer:users!transactions_buyer_id_fkey (
          id,
          full_name
        ),
        seller:users!transactions_seller_id_fkey (
          id,
          full_name
        )
      `)
      .single();

    if (updateError) {
      console.error('Transaction update error:', updateError);
      return res.status(500).json({
        error: 'Transaction update failed',
        message: 'Could not update transaction status'
      });
    }

    // Update product quantity if transaction is confirmed
    if (status === 'confirmed') {
      const newQuantity = Math.max(0, currentTransaction.products.quantity_kg - currentTransaction.quantity_kg);
      await supabase
        .from('products')
        .update({ 
          quantity_kg: newQuantity,
          status: newQuantity === 0 ? 'sold_out' : 'active'
        })
        .eq('id', currentTransaction.product_id);
    }

    // Create appropriate notifications
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationRecipient = null;

    switch (status) {
      case 'confirmed':
        notificationTitle = 'Order Confirmed';
        notificationMessage = `Your order for ${currentTransaction.products.title} has been confirmed`;
        notificationRecipient = currentTransaction.buyer_id;
        break;
      case 'shipped':
        notificationTitle = 'Order Shipped';
        notificationMessage = `Your order for ${currentTransaction.products.title} has been shipped`;
        notificationRecipient = currentTransaction.buyer_id;
        break;
      case 'delivered':
        notificationTitle = 'Order Delivered';
        notificationMessage = `Order for ${currentTransaction.products.title} has been marked as delivered`;
        notificationRecipient = currentTransaction.seller_id;
        break;
      case 'cancelled':
        notificationTitle = 'Order Cancelled';
        notificationMessage = `Order for ${currentTransaction.products.title} has been cancelled`;
        notificationRecipient = isSellerUpdate ? currentTransaction.buyer_id : currentTransaction.seller_id;
        break;
    }

    if (notificationRecipient) {
      await supabase
        .from('notifications')
        .insert({
          user_id: notificationRecipient,
          title: notificationTitle,
          message: notificationMessage,
          type: 'order_update',
          related_id: id
        });
    }

    res.json({
      message: 'Transaction status updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Transaction status update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while updating transaction status'
    });
  }
});

// Cancel transaction
router.post('/:id/cancel', authenticateToken, validateParams(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    // Get current transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        products (title),
        buyer:users!transactions_buyer_id_fkey (full_name),
        seller:users!transactions_seller_id_fkey (full_name)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist'
      });
    }

    // Check if user is involved in this transaction
    if (transaction.buyer_id !== userId && transaction.seller_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You are not authorized to cancel this transaction'
      });
    }

    // Check if transaction can be cancelled
    if (!['pending', 'confirmed'].includes(transaction.status)) {
      return res.status(400).json({
        error: 'Cannot cancel transaction',
        message: 'This transaction cannot be cancelled at its current status'
      });
    }

    // Update transaction status
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        notes: reason || 'Cancelled by user'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Transaction cancellation error:', updateError);
      return res.status(500).json({
        error: 'Cancellation failed',
        message: 'Could not cancel transaction'
      });
    }

    // Create notification for the other party
    const isSellerCancelling = transaction.seller_id === userId;
    const notificationRecipient = isSellerCancelling ? transaction.buyer_id : transaction.seller_id;

    await supabase
      .from('notifications')
      .insert({
        user_id: notificationRecipient,
        title: 'Order Cancelled',
        message: `Order for ${transaction.products.title} has been cancelled`,
        type: 'order_update',
        related_id: id
      });

    res.json({
      message: 'Transaction cancelled successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Transaction cancellation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while cancelling the transaction'
    });
  }
});

// Get transaction statistics for user
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get transaction counts by status
    const { data: transactionStats, error } = await supabase
      .from('transactions')
      .select('status')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    if (error) {
      console.error('Transaction stats error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Could not fetch transaction statistics'
      });
    }

    const stats = {
      total: transactionStats.length,
      pending: transactionStats.filter(t => t.status === 'pending').length,
      confirmed: transactionStats.filter(t => t.status === 'confirmed').length,
      shipped: transactionStats.filter(t => t.status === 'shipped').length,
      delivered: transactionStats.filter(t => t.status === 'delivered').length,
      cancelled: transactionStats.filter(t => t.status === 'cancelled').length
    };

    res.json({
      stats
    });
  } catch (error) {
    console.error('Transaction stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong while fetching transaction statistics'
    });
  }
});

module.exports = router;