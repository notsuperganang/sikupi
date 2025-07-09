require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payments');
const shippingRoutes = require('./routes/shipping');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/uploads');
const cartRoutes = require('./routes/cart');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration FIRST - before other middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Security middleware (after CORS)
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// RELAXED Rate limiting for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (reduced from 15 minutes)
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Much higher limit for development
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check and static assets
    return req.path === '/health' || req.path.startsWith('/static');
  }
});

// Apply rate limiting only in production or specific endpoints
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', limiter);
} else {
  // In development, use very relaxed rate limiting
  const devLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Very high limit for development
    message: 'Development rate limit exceeded',
  });
  app.use('/api/', devLimiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware (only log errors in development to reduce noise)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sikupi Coffee Waste Marketplace API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: '/api/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
  
  // Default error response
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sikupi Backend API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 CORS enabled for: ${process.env.NODE_ENV === 'production' ? 'production domains' : 'localhost:3000'}`);
});

module.exports = app;