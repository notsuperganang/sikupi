# Sikupi Backend API

Sikupi is a smart coffee waste marketplace platform backend API built with Express.js and Supabase. This API provides endpoints for managing coffee waste products, transactions, AI quality assessments, and more.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations for coffee waste products
- **Transaction System**: Complete purchase flow with status tracking
- **Payment Integration**: Midtrans payment gateway integration
- **Shipping Integration**: Biteship shipping rates and tracking
- **AI Quality Assessment**: Simulated AI quality grading for coffee waste
- **File Upload**: Supabase Storage integration for images
- **Dashboard Analytics**: Real-time metrics and statistics
- **Notification System**: In-app notifications for users
- **Educational Content**: Articles management system

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js (JavaScript)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Authentication**: JWT tokens
- **Payment**: Midtrans
- **Shipping**: Biteship API
- **AI**: Simulated quality assessment
- **Image Processing**: Sharp

## Project Structure

```
sikupi-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── supabase.js   # Supabase client setup
│   │   ├── jwt.js        # JWT utilities
│   │   ├── storage.js    # File storage utilities
│   │   └── database.js   # Database utilities
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # Authentication middleware
│   │   └── validation.js # Request validation
│   ├── routes/          # API route handlers
│   │   ├── auth.js      # Authentication routes
│   │   ├── products.js  # Product management
│   │   ├── transactions.js # Transaction handling
│   │   ├── payments.js  # Payment processing
│   │   ├── shipping.js  # Shipping integration
│   │   ├── ai.js        # AI assessment
│   │   ├── uploads.js   # File uploads
│   │   ├── cart.js      # Shopping cart
│   │   ├── dashboard.js # Analytics
│   │   ├── users.js     # User profiles
│   │   ├── notifications.js # Notifications
│   │   └── articles.js  # Educational content
│   ├── database/        # Database files
│   │   ├── database_schema.sql
│   │   └── database_seeder.sql
│   └── index.js         # Main application file
├── package.json
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Midtrans account (for payments)
- Biteship account (for shipping)
- Google Cloud account (for AI features)

### 2. Installation

```bash
# Clone the repository
cd sikupi-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Environment Configuration

Edit the `.env` file with your actual credentials:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Google Cloud (untuk Vertex AI)
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Midtrans Configuration (SANDBOX MODE)
MIDTRANS_SERVER_KEY=your_midtrans_sandbox_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_sandbox_client_key
MIDTRANS_IS_PRODUCTION=false

# Biteship Configuration (TESTING MODE)
BITESHIP_API_KEY=your_biteship_testing_api_key
```

#### 🧪 **Testing Mode Configuration**

**Midtrans Sandbox:**
- Set `MIDTRANS_IS_PRODUCTION=false` for sandbox mode
- Use **Sandbox** Server Key and Client Key from Midtrans Dashboard
- Access: [Midtrans Sandbox Dashboard](https://dashboard.sandbox.midtrans.com/)

**Biteship Testing:**
- Biteship uses the same API for testing and production
- Use your testing API key from Biteship Dashboard
- No separate sandbox environment needed

### 4. Database Setup

1. Create a new Supabase project
2. Run the database schema in Supabase SQL Editor:
   ```sql
   -- Copy and paste contents of src/database/database_schema.sql
   ```
3. Run the seeder to populate sample data:
   ```sql
   -- Copy and paste contents of src/database/database_seeder.sql
   ```

### 5. Supabase Storage Setup

1. Go to Supabase Storage in your dashboard
2. Create a new bucket named `sikupi-uploads`
3. Set the bucket to be public or configure RLS policies as needed

### 6. Running the Application

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - List products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (sellers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/images` - Upload product images
- `POST /api/products/:id/favorite` - Toggle favorite

### Transactions
- `GET /api/transactions` - List user transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id/status` - Update status
- `POST /api/transactions/:id/cancel` - Cancel transaction

### Payments
- `POST /api/payments/midtrans/token` - Get payment token
- `POST /api/payments/midtrans/notification` - Webhook handler
- `GET /api/payments/methods` - List payment methods

### Shipping
- `POST /api/shipping/rates` - Get shipping rates
- `POST /api/shipping/create-order` - Create shipping order
- `GET /api/shipping/track/:tracking_number` - Track shipment
- `GET /api/shipping/areas` - Get location areas

### AI Assessment
- `POST /api/ai/assess` - Submit for AI assessment
- `GET /api/ai/assessments` - Get assessment history
- `POST /api/ai/assess-batch` - Batch assessment

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove from cart

### File Uploads
- `POST /api/uploads/image` - Upload single image
- `POST /api/uploads/images` - Upload multiple images
- `POST /api/uploads/profile-image` - Upload profile image

### Dashboard
- `GET /api/dashboard/metrics` - Platform metrics
- `GET /api/dashboard/user-stats` - User statistics
- `GET /api/dashboard/admin-stats` - Admin statistics (admin only)

### Users & Reviews
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/products` - Get user products
- `GET /api/users/:id/reviews` - Get user reviews
- `POST /api/users/:id/reviews` - Create review

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Articles
- `GET /api/articles` - List published articles
- `GET /api/articles/:slug` - Get article by slug
- `POST /api/articles` - Create article (admin only)
- `PUT /api/articles/:id` - Update article (admin only)

## Development

### Adding New Routes

1. Create route file in `src/routes/`
2. Implement route handlers with proper validation
3. Add route to main application in `src/index.js`
4. Update this README with new endpoints

### Database Changes

1. Update `src/database/database_schema.sql`
2. Run the updated schema in Supabase
3. Update seeder if needed

### Environment Variables

All environment variables are documented in `.env.example`. Never commit actual credentials to the repository.

## Testing

### 🧪 **Sandbox/Testing Verification**

Check if your testing configuration is correct:

```bash
# Test Midtrans configuration
curl http://localhost:8000/api/payments/test-config

# Test Biteship configuration  
curl http://localhost:8000/api/shipping/test-config

# Get payment methods with test cards
curl http://localhost:8000/api/payments/methods
```

### 💳 **Midtrans Test Cards (Sandbox)**

**Successful Payment:**
- Card: `4811 1111 1111 1114`
- CVV: `123`
- Expiry: `12/25`

**Failed Payment:**
- Card: `4911 1111 1111 1113`
- CVV: `123`
- Expiry: `12/25`

### 🚚 **Biteship Testing**

Use real area IDs for testing shipping rates:
- Jakarta Pusat: `IDNP2PIDNC148IDND1`
- Bandung: `IDNP2PIDNC76IDND4`
- Surabaya: `IDNP2PIDNC39IDND22`

### 📡 **Basic API Testing**

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Test payment configuration
curl http://localhost:8000/api/payments/test-config
```

### 🛠 **Testing Tools**
- Postman
- Insomnia
- curl commands
- Midtrans Simulator: https://simulator.sandbox.midtrans.com/

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production database and storage
3. Set up proper CORS origins
4. Enable HTTPS
5. Set up process manager (PM2)
6. Configure monitoring and logging

## Contributing

1. Follow JavaScript coding standards
2. Add proper error handling
3. Include request validation
4. Update documentation
5. Test all endpoints

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please refer to the project documentation or create an issue in the repository.