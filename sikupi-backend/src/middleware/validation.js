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

// Common validation schemas
const schemas = {
  // User schemas
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().min(2).max(255).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s]+$/).optional(),
    user_type: Joi.string().valid('seller', 'buyer').default('buyer'),
    business_name: Joi.string().max(255).optional(),
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    province: Joi.string().max(100).optional(),
    postal_code: Joi.string().max(10).optional()
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  userUpdate: Joi.object({
    full_name: Joi.string().min(2).max(255).optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s]+$/).optional(),
    business_name: Joi.string().max(255).optional(),
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    province: Joi.string().max(100).optional(),
    postal_code: Joi.string().max(10).optional()
  }),

  // Product schemas
  productCreate: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).optional(),
    waste_type: Joi.string().valid('coffee_grounds', 'coffee_pulp', 'coffee_husks', 'coffee_chaff').required(),
    quantity_kg: Joi.number().positive().required(),
    price_per_kg: Joi.number().positive().required(),
    quality_grade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    processing_method: Joi.string().max(255).optional(),
    origin_location: Joi.string().max(255).optional(),
    harvest_date: Joi.date().optional(),
    expiry_date: Joi.date().optional(),
    moisture_content: Joi.number().min(0).max(100).optional(),
    organic_certified: Joi.boolean().default(false),
    fair_trade_certified: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }),

  productUpdate: Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    quantity_kg: Joi.number().positive().optional(),
    price_per_kg: Joi.number().positive().optional(),
    quality_grade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    processing_method: Joi.string().max(255).optional(),
    origin_location: Joi.string().max(255).optional(),
    harvest_date: Joi.date().optional(),
    expiry_date: Joi.date().optional(),
    moisture_content: Joi.number().min(0).max(100).optional(),
    organic_certified: Joi.boolean().optional(),
    fair_trade_certified: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive', 'sold_out').optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional()
  }),

  // Transaction schemas
  transactionCreate: Joi.object({
    product_id: Joi.string().uuid().required(),
    quantity_kg: Joi.number().positive().required(),
    shipping_address: Joi.string().max(500).required(),
    notes: Joi.string().max(500).optional()
  }),

  transactionStatusUpdate: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').required(),
    tracking_number: Joi.string().max(100).optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Cart schemas
  cartItemAdd: Joi.object({
    product_id: Joi.string().uuid().required(),
    quantity_kg: Joi.number().positive().required()
  }),

  cartItemUpdate: Joi.object({
    quantity_kg: Joi.number().positive().required()
  }),

  // Query schemas
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).optional(),
    sort_by: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  productQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).optional(),
    waste_type: Joi.string().valid('coffee_grounds', 'coffee_pulp', 'coffee_husks', 'coffee_chaff').optional(),
    quality_grade: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    min_price: Joi.number().min(0).optional(),
    max_price: Joi.number().min(0).optional(),
    city: Joi.string().max(100).optional(),
    province: Joi.string().max(100).optional(),
    organic_certified: Joi.boolean().optional(),
    fair_trade_certified: Joi.boolean().optional(),
    sort_by: Joi.string().valid('created_at', 'price_per_kg', 'title', 'rating').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Review schema
  reviewCreate: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    review_text: Joi.string().max(1000).optional()
  }),

  // UUID parameter
  uuidParam: Joi.object({
    id: Joi.string().uuid().required()
  })
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  schemas
};