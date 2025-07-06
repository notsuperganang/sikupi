const express = require('express');
const midtransClient = require('midtrans-client');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Log Midtrans configuration for debugging
console.log('🔧 Midtrans Configuration:');
console.log('  - Mode:', process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'PRODUCTION' : 'SANDBOX');
console.log('  - Server Key:', process.env.MIDTRANS_SERVER_KEY ? 'Set ✅' : 'Missing ❌');
console.log('  - Client Key:', process.env.MIDTRANS_CLIENT_KEY ? 'Set ✅' : 'Missing ❌');

// Get payment token from Midtrans
router.post('/midtrans/token', authenticateToken, async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        error: 'Missing transaction ID',
        message: 'Transaction ID is required'
      });
    }

    // Get transaction details
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        products (title, waste_type),
        buyer:users!transactions_buyer_id_fkey (full_name, email, phone)
      `)
      .eq('id', transaction_id)
      .eq('buyer_id', req.user.id)
      .single();

    if (error || !transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'Transaction not found or access denied'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        error: 'Invalid transaction status',
        message: 'Payment can only be made for pending transactions'
      });
    }

    // Prepare Midtrans payment parameter
    const parameter = {
      transaction_details: {
        order_id: transaction_id,
        gross_amount: Math.round(transaction.total_amount + transaction.shipping_cost)
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: transaction.buyer.full_name,
        email: transaction.buyer.email,
        phone: transaction.buyer.phone || ''
      },
      item_details: [
        {
          id: transaction.product_id,
          price: Math.round(transaction.total_amount),
          quantity: 1,
          name: `${transaction.products.title} (${transaction.quantity_kg}kg)`
        }
      ]
    };

    if (transaction.shipping_cost > 0) {
      parameter.item_details.push({
        id: 'SHIPPING',
        price: Math.round(transaction.shipping_cost),
        quantity: 1,
        name: 'Shipping Cost'
      });
    }

    // Create payment token
    const snapToken = await snap.createTransaction(parameter);

    res.json({
      token: snapToken.token,
      redirect_url: snapToken.redirect_url
    });
  } catch (error) {
    console.error('Midtrans token error:', error);
    res.status(500).json({
      error: 'Payment token creation failed',
      message: 'Could not create payment token'
    });
  }
});

// Handle Midtrans notification webhook
router.post('/midtrans/notification', async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log('Midtrans notification:', notification);

    // Verify notification authenticity
    const statusResponse = await snap.transaction.notification(notification);
    const { order_id, transaction_status, gross_amount } = statusResponse;

    // Get transaction from database
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', order_id)
      .single();

    if (error || !transaction) {
      console.error('Transaction not found for order_id:', order_id);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    let updateData = {
      payment_id: notification.transaction_id || null
    };

    // Handle different payment statuses
    if (transaction_status === 'capture') {
      if (fraudStatus === 'challenge') {
        // Transaction is challenged by fraud detection
        updateData.status = 'pending';
      } else if (fraudStatus === 'accept') {
        // Transaction is successful
        updateData.status = 'confirmed';
        updateData.confirmed_at = new Date().toISOString();
      }
    } else if (transaction_status === 'settlement') {
      // Transaction is successful
      updateData.status = 'confirmed';
      updateData.confirmed_at = new Date().toISOString();
    } else if (transaction_status === 'cancel' || 
               transaction_status === 'deny' || 
               transaction_status === 'expire') {
      // Transaction failed
      updateData.status = 'cancelled';
      updateData.cancelled_at = new Date().toISOString();
    } else if (transaction_status === 'pending') {
      // Transaction is pending
      updateData.status = 'pending';
    }

    // Update transaction in database
    await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', order_id);

    // Create notification for user
    if (updateData.status === 'confirmed') {
      await supabase
        .from('notifications')
        .insert({
          user_id: transaction.buyer_id,
          title: 'Payment Confirmed',
          message: 'Your payment has been confirmed and the order is being processed',
          type: 'payment',
          related_id: order_id
        });

      await supabase
        .from('notifications')
        .insert({
          user_id: transaction.seller_id,
          title: 'Payment Received',
          message: 'Payment for your product has been confirmed',
          type: 'payment',
          related_id: order_id
        });
    } else if (updateData.status === 'cancelled') {
      await supabase
        .from('notifications')
        .insert({
          user_id: transaction.buyer_id,
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again.',
          type: 'payment',
          related_id: order_id
        });
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Midtrans notification error:', error);
    res.status(500).json({ error: 'Notification processing failed' });
  }
});

// Get payment methods
router.get('/methods', (req, res) => {
  const isSandbox = process.env.MIDTRANS_IS_PRODUCTION !== 'true';
  
  res.json({
    mode: isSandbox ? 'sandbox' : 'production',
    methods: [
      {
        id: 'credit_card',
        name: 'Credit Card',
        description: isSandbox ? 'Test cards available' : 'Visa, Mastercard, JCB',
        enabled: true,
        test_info: isSandbox ? {
          visa: '4811 1111 1111 1114',
          mastercard: '5573 3811 1111 1118',
          cvv: '123',
          expiry: '12/25'
        } : null
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: isSandbox ? 'Sandbox banks available' : 'BCA, BNI, BRI, Mandiri',
        enabled: true
      },
      {
        id: 'e_wallet',
        name: 'E-Wallet',
        description: isSandbox ? 'Test wallets available' : 'GoPay, OVO, DANA',
        enabled: true
      },
      {
        id: 'convenience_store',
        name: 'Convenience Store',
        description: 'Alfamart, Indomaret',
        enabled: true
      }
    ]
  });
});

// Test endpoint for sandbox validation
router.get('/test-config', (req, res) => {
  const isSandbox = process.env.MIDTRANS_IS_PRODUCTION !== 'true';
  
  res.json({
    status: 'OK',
    environment: {
      mode: isSandbox ? 'SANDBOX' : 'PRODUCTION',
      server_key_configured: !!process.env.MIDTRANS_SERVER_KEY,
      client_key_configured: !!process.env.MIDTRANS_CLIENT_KEY,
      recommended_for_testing: isSandbox
    },
    test_cards: isSandbox ? {
      successful_payment: {
        card_number: '4811 1111 1111 1114',
        cvv: '123',
        expiry: '12/25'
      },
      failed_payment: {
        card_number: '4911 1111 1111 1113',
        cvv: '123',
        expiry: '12/25'
      }
    } : null,
    sandbox_urls: isSandbox ? {
      dashboard: 'https://dashboard.sandbox.midtrans.com/',
      simulator: 'https://simulator.sandbox.midtrans.com/'
    } : null
  });
});

module.exports = router;