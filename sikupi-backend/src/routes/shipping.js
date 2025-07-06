const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;
const BITESHIP_BASE_URL = 'https://api.biteship.com/v1';

// Log Biteship configuration for debugging
console.log('🚚 Biteship Configuration:');
console.log('  - API Key:', BITESHIP_API_KEY ? 'Set ✅' : 'Missing ❌');
console.log('  - Base URL:', BITESHIP_BASE_URL);
console.log('  - Mode: Testing (Biteship uses single API for test/production)');

// Get shipping rates
router.post('/rates', authenticateToken, async (req, res) => {
  try {
    const { 
      origin_area_id, 
      destination_area_id, 
      weight, 
      length = 10, 
      width = 10, 
      height = 10 
    } = req.body;

    if (!origin_area_id || !destination_area_id || !weight) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'origin_area_id, destination_area_id, and weight are required'
      });
    }

    const requestData = {
      origin_area_id,
      destination_area_id,
      couriers: 'jne,pos,tiki,sicepat,jnt,anteraja',
      items: [
        {
          name: 'Coffee Waste',
          weight: weight * 1000, // Convert kg to grams
          length,
          width,
          height,
          value: 50000 // Default value for insurance
        }
      ]
    };

    const response = await axios.post(`${BITESHIP_BASE_URL}/rates/couriers`, requestData, {
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const rates = response.data.pricing.map(rate => ({
      courier_code: rate.courier_code,
      courier_name: rate.courier_name,
      service_code: rate.courier_service_code,
      service_name: rate.courier_service_name,
      description: rate.description,
      price: rate.price,
      estimated_delivery: rate.range_delivery_time,
      company: rate.company
    }));

    res.json({
      rates,
      origin: response.data.origin,
      destination: response.data.destination
    });
  } catch (error) {
    console.error('Shipping rates error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get shipping rates',
      message: 'Could not retrieve shipping rates'
    });
  }
});

// Create shipping order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const {
      transaction_id,
      courier_code,
      courier_service_code,
      origin_contact_name,
      origin_contact_phone,
      origin_address,
      origin_area_id,
      destination_contact_name,
      destination_contact_phone,
      destination_address,
      destination_area_id,
      weight,
      length = 10,
      width = 10,
      height = 10
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'transaction_id', 'courier_code', 'courier_service_code',
      'origin_contact_name', 'origin_contact_phone', 'origin_address', 'origin_area_id',
      'destination_contact_name', 'destination_contact_phone', 'destination_address', 'destination_area_id',
      'weight'
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: 'Missing required field',
          message: `${field} is required`
        });
      }
    }

    const requestData = {
      shipper_contact_name: origin_contact_name,
      shipper_contact_phone: origin_contact_phone,
      shipper_contact_email: req.user.email,
      shipper_organization: req.user.business_name || req.user.full_name,
      origin_contact_name,
      origin_contact_phone,
      origin_address,
      origin_area_id: parseInt(origin_area_id),
      destination_contact_name,
      destination_contact_phone,
      destination_contact_email: '', // Will be filled from transaction
      destination_address,
      destination_area_id: parseInt(destination_area_id),
      courier_company: courier_code,
      courier_type: courier_service_code,
      delivery_type: 'now',
      items: [
        {
          name: 'Coffee Waste Product',
          weight: weight * 1000, // Convert kg to grams
          length,
          width,
          height,
          value: 50000
        }
      ]
    };

    const response = await axios.post(`${BITESHIP_BASE_URL}/orders`, requestData, {
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const order = response.data;

    // Update transaction with shipping info
    const { supabase } = require('../config/supabase');
    await supabase
      .from('transactions')
      .update({
        tracking_number: order.order_id,
        shipping_cost: order.price
      })
      .eq('id', transaction_id);

    res.json({
      message: 'Shipping order created successfully',
      order: {
        order_id: order.order_id,
        tracking_number: order.order_id,
        price: order.price,
        courier: order.courier,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Create shipping order error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create shipping order',
      message: 'Could not create shipping order'
    });
  }
});

// Track shipment
router.get('/track/:tracking_number', async (req, res) => {
  try {
    const { tracking_number } = req.params;

    const response = await axios.get(`${BITESHIP_BASE_URL}/trackings/${tracking_number}`, {
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`
      }
    });

    const tracking = response.data;

    res.json({
      tracking_number,
      status: tracking.status,
      courier: tracking.courier,
      history: tracking.history || [],
      current_status: tracking.status,
      estimated_delivery: tracking.delivery_time
    });
  } catch (error) {
    console.error('Track shipment error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to track shipment',
      message: 'Could not retrieve tracking information'
    });
  }
});

// Get area/location list for dropdown
router.get('/areas', async (req, res) => {
  try {
    const { search, type = 'single' } = req.query;

    let url = `${BITESHIP_BASE_URL}/maps/areas`;
    const params = new URLSearchParams();
    
    if (search) {
      params.append('countries', 'ID');
      params.append('input', search);
      params.append('type', type);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`
      }
    });

    const areas = response.data.areas || [];

    res.json({
      areas: areas.map(area => ({
        id: area.id,
        name: area.name,
        type: area.type,
        postal_code: area.postal_code,
        administrative_division_level_1_name: area.administrative_division_level_1_name,
        administrative_division_level_2_name: area.administrative_division_level_2_name,
        administrative_division_level_3_name: area.administrative_division_level_3_name
      }))
    });
  } catch (error) {
    console.error('Get areas error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get areas',
      message: 'Could not retrieve location areas'
    });
  }
});

// Get courier list
router.get('/couriers', (req, res) => {
  res.json({
    couriers: [
      {
        code: 'jne',
        name: 'JNE',
        services: [
          { code: 'reg', name: 'Regular' },
          { code: 'oke', name: 'OKE' },
          { code: 'yes', name: 'YES' }
        ]
      },
      {
        code: 'pos',
        name: 'POS Indonesia',
        services: [
          { code: 'pos_reguler', name: 'Pos Reguler' },
          { code: 'pos_nextday', name: 'Pos Nextday' }
        ]
      },
      {
        code: 'tiki',
        name: 'TIKI',
        services: [
          { code: 'reg', name: 'Regular' },
          { code: 'eco', name: 'ECO' },
          { code: 'ons', name: 'ONS' }
        ]
      },
      {
        code: 'sicepat',
        name: 'SiCepat',
        services: [
          { code: 'reg', name: 'Regular' },
          { code: 'best', name: 'BEST' }
        ]
      },
      {
        code: 'jnt',
        name: 'J&T Express',
        services: [
          { code: 'reg', name: 'Regular' },
          { code: 'ez', name: 'EZ' }
        ]
      }
    ]
  });
});

// Test endpoint for Biteship configuration
router.get('/test-config', (req, res) => {
  res.json({
    status: 'OK',
    environment: {
      mode: 'TESTING',
      api_key_configured: !!BITESHIP_API_KEY,
      base_url: BITESHIP_BASE_URL,
      note: 'Biteship uses single API endpoint for both testing and production'
    },
    test_area_ids: {
      jakarta_pusat: 'IDNP2PIDNC148IDND1',
      bandung: 'IDNP2PIDNC76IDND4',
      surabaya: 'IDNP2PIDNC39IDND22',
      yogyakarta: 'IDNP2PIDNC73IDND4'
    },
    testing_tips: [
      'Use real area IDs from /api/shipping/areas endpoint',
      'Test with different weights and dimensions',
      'Check courier availability for specific routes',
      'Biteship charges for API calls even in testing'
    ]
  });
});

module.exports = router;