// Application Configuration

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    webhookSecret: process.env.MIDTRANS_WEBHOOK_SECRET!,
    isProduction: false, // Sandbox mode for MVP
    apiUrl: 'https://app.sandbox.midtrans.com/snap/v1', // Sandbox URL
  },
  
  biteship: {
    apiKey: process.env.BITESHIP_API_KEY!,
    webhookSecret: process.env.BITESHIP_WEBHOOK_SECRET!,
    baseUrl: 'https://api.biteship.com/v1',
  },
  
  warehouse: {
    originCityId: process.env.NEXT_PUBLIC_WAREHOUSE_ORIGIN_CITY_ID!,
    contact: {
      name: 'Sikupi Warehouse',
      phone: '+62-XXX-XXXX-XXXX',
      email: 'warehouse@sikupi.com',
      organization: 'Sikupi',
      address: 'Banda Aceh, Aceh, Indonesia',
      postalCode: 23111,
    }
  },
  
  app: {
    name: 'Sikupi',
    description: 'Coffee grounds marketplace',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Business rules
  business: {
    minOrderAmount: 50000, // Minimum order amount in IDR
    maxOrderWeight: 50, // Maximum order weight in kg
    reviewAllowedStatuses: ['completed'] as const,
    ratingRange: { min: 1, max: 5 },
    
    // Product filtering rules
    ampasCategories: ['ampas_kopi'] as const,
    turunanCategories: ['briket', 'pulp', 'scrub', 'pupuk', 'pakan_ternak', 'lainnya'] as const,
  }
} as const

// Validation helper
export const validateConfig = () => {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'MIDTRANS_SERVER_KEY',
    'MIDTRANS_CLIENT_KEY',
    'BITESHIP_API_KEY',
    'NEXT_PUBLIC_WAREHOUSE_ORIGIN_CITY_ID',
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export default config