// FILE: sikupi-backend/src/middleware/validation.js
// UPDATED: Mendukung field mapping yang lebih fleksibel

const Joi = require('joi');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    req.body = value;
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    req.params = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    req.query = value;
    next();
  };
};

// Common validation schemas - UPDATED untuk mendukung kedua format
const schemas = {
  // User schemas - Mendukung camelCase dan snake_case
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    
    // Mendukung kedua format field name
    full_name: Joi.string().min(2).max(255).optional(),
    fullName: Joi.string().min(2).max(255).optional(),
    
    phone: Joi.string().pattern(/^[0-9+\-\s]+$/).optional(),
    
    user_type: Joi.string().valid('seller', 'buyer').optional(),
    userType: Joi.string().valid('seller', 'buyer').optional(),
    
    business_name: Joi.string().max(255).optional(),
    businessName: Joi.string().max(255).optional(),
    
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    province: Joi.string().max(100).optional(),
    
    postal_code: Joi.string().max(10).optional(),
    postalCode: Joi.string().max(10).optional(),
    
    termsAccepted: Joi.boolean().optional(),
    businessType: Joi.string().optional()
  }).or('full_name', 'fullName'), // Minimal salah satu harus ada

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  userUpdate: Joi.object({
    full_name: Joi.string().min(2).max(255).optional(),
    fullName: Joi.string().min(2).max(255).optional(),
    
    phone: Joi.string().pattern(/^[0-9+\-\s]+$/).optional(),
    
    business_name: Joi.string().max(255).optional(),
    businessName: Joi.string().max(255).optional(),
    
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    province: Joi.string().max(100).optional(),
    
    postal_code: Joi.string().max(10).optional(),
    postalCode: Joi.string().max(10).optional()
  }),

  // Password change schema
  passwordChange: Joi.object({
    current_password: Joi.string().required(),
    currentPassword: Joi.string().required(),
    new_password: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required()
  }).or('current_password', 'currentPassword')
    .or('new_password', 'newPassword'),

  // Product schemas - Juga mendukung kedua format
  productCreate: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).optional(),
    
    waste_type: Joi.string().valid('coffee_grounds', 'coffee_pulp', 'coffee_husks', 'coffee_chaff').optional(),
    wasteType: Joi.string().valid('coffee_grounds', 'coffee_pulp', 'coffee_husks', 'coffee_chaff').optional(),
    
    quantity_kg: Joi.number().positive().optional(),
    quantityKg: Joi.number().positive().optional(),
    
    price_per_kg: Joi.number().positive().required(),
    pricePerKg: Joi.number().positive().required(),
    
    quality_grade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    qualityGrade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    
    processing_method: Joi.string().max(255).optional(),
    processingMethod: Joi.string().max(255).optional(),
    
    origin_location: Joi.string().max(255).optional(),
    originLocation: Joi.string().max(255).optional(),
    
    harvest_date: Joi.date().optional(),
    harvestDate: Joi.date().optional(),
    
    expiry_date: Joi.date().optional(),
    expiryDate: Joi.date().optional(),
    
    moisture_content: Joi.number().min(0).max(100).optional(),
    moistureContent: Joi.number().min(0).max(100).optional(),
    
    organic_certified: Joi.boolean().default(false),
    organicCertified: Joi.boolean().default(false),
    
    fair_trade_certified: Joi.boolean().default(false),
    fairTradeCertified: Joi.boolean().default(false),
    
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }).or('waste_type', 'wasteType')
    .or('quantity_kg', 'quantityKg')
    .or('price_per_kg', 'pricePerKg'),

  productUpdate: Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    
    quantity_kg: Joi.number().positive().optional(),
    quantityKg: Joi.number().positive().optional(),
    
    price_per_kg: Joi.number().positive().optional(),
    pricePerKg: Joi.number().positive().optional(),
    
    quality_grade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    qualityGrade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    
    processing_method: Joi.string().max(255).optional(),
    processingMethod: Joi.string().max(255).optional(),
    
    origin_location: Joi.string().max(255).optional(),
    originLocation: Joi.string().max(255).optional(),
    
    harvest_date: Joi.date().optional(),
    harvestDate: Joi.date().optional(),
    
    expiry_date: Joi.date().optional(),
    expiryDate: Joi.date().optional(),
    
    moisture_content: Joi.number().min(0).max(100).optional(),
    moistureContent: Joi.number().min(0).max(100).optional(),
    
    organic_certified: Joi.boolean().optional(),
    organicCertified: Joi.boolean().optional(),
    
    fair_trade_certified: Joi.boolean().optional(),
    fairTradeCertified: Joi.boolean().optional(),
    
    status: Joi.string().valid('active', 'inactive', 'sold_out').optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }),

  // Transaction schemas
  transactionCreate: Joi.object({
    product_id: Joi.string().uuid().optional(),
    productId: Joi.string().uuid().optional(),
    
    quantity_kg: Joi.number().positive().required(),
    quantityKg: Joi.number().positive().required(),
    
    shipping_address: Joi.string().max(500).optional(),
    shippingAddress: Joi.string().max(500).optional(),
    
    notes: Joi.string().max(500).optional()
  }).or('product_id', 'productId')
    .or('quantity_kg', 'quantityKg')
    .or('shipping_address', 'shippingAddress'),

  transactionStatusUpdate: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').required(),
    
    tracking_number: Joi.string().max(100).optional(),
    trackingNumber: Joi.string().max(100).optional(),
    
    notes: Joi.string().max(500).optional()
  }),

  // Cart schemas
  cartItemAdd: Joi.object({
    product_id: Joi.string().uuid().optional(),
    productId: Joi.string().uuid().optional(),
    
    quantity_kg: Joi.number().positive().required(),
    quantityKg: Joi.number().positive().required()
  }).or('product_id', 'productId')
    .or('quantity_kg', 'quantityKg'),

  cartItemUpdate: Joi.object({
    quantity_kg: Joi.number().positive().required(),
    quantityKg: Joi.number().positive().required()
  }).or('quantity_kg', 'quantityKg'),

  // Query schemas
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).optional(),
    
    sort_by: Joi.string().optional(),
    sortBy: Joi.string().optional(),
    
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  productQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).optional(),
    
    waste_type: Joi.string().valid('coffee_grounds', 'coffee_pulp', 'coffee_husks', 'coffee_chaff').optional(),
    wasteType: Joi.string().valid('coffee_grounds', 'coffee_pulp', 'coffee_husks', 'coffee_chaff').optional(),
    
    quality_grade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    qualityGrade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    
    min_price: Joi.number().min(0).optional(),
    minPrice: Joi.number().min(0).optional(),
    
    max_price: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    
    city: Joi.string().max(100).optional(),
    province: Joi.string().max(100).optional(),
    
    organic_certified: Joi.boolean().optional(),
    organicCertified: Joi.boolean().optional(),
    
    fair_trade_certified: Joi.boolean().optional(),
    fairTradeCertified: Joi.boolean().optional(),
    
    // FIXED: Accept both frontend and backend sortBy values
    sort_by: Joi.string().valid(
      // Backend valid values
      'created_at', 'price_per_kg', 'title', 'rating', 'views_count',
      // Frontend values that will be mapped
      'newest', 'oldest', 'price_low', 'price_high', 'popular'
    ).default('created_at'),
    sortBy: Joi.string().valid(
      // Backend valid values  
      'created_at', 'price_per_kg', 'title', 'rating', 'views_count',
      // Frontend values that will be mapped
      'newest', 'oldest', 'price_low', 'price_high', 'popular'
    ).default('created_at'),
    
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Review schema
  reviewCreate: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    
    review_text: Joi.string().max(1000).optional(),
    reviewText: Joi.string().max(1000).optional()
  }),

  // UUID parameter
  uuidParam: Joi.object({
    id: Joi.string().uuid().required()
  }),

  // AI Assessment schema
  aiAssessment: Joi.object({
    coffee_type: Joi.string().valid('arabica', 'robusta').required(),
    coffeeType: Joi.string().valid('arabica', 'robusta').required(),
    
    grind_size: Joi.string().valid('coarse', 'fine').required(),
    grindSize: Joi.string().valid('coarse', 'fine').required(),
    
    description: Joi.string().max(500).optional()
  }).or('coffee_type', 'coffeeType')
    .or('grind_size', 'grindSize')
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  schemas
};