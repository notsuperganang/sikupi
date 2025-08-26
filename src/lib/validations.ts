import { z } from 'zod'

// Enums for validation
export const ProductKindEnum = z.enum(['ampas', 'turunan'])
export const ProductCategoryEnum = z.enum(['ampas_kopi', 'briket', 'pulp', 'scrub', 'pupuk', 'pakan_ternak', 'lainnya'])
export const CoffeeTypeEnum = z.enum(['arabika', 'robusta', 'mix', 'unknown'])
export const GrindLevelEnum = z.enum(['halus', 'sedang', 'kasar', 'unknown'])
export const ConditionEnum = z.enum(['basah', 'kering', 'unknown'])
export const OrderStatusEnum = z.enum(['new', 'pending_payment', 'paid', 'packed', 'shipped', 'completed', 'cancelled'])
export const UserRoleEnum = z.enum(['admin', 'buyer'])

// Product schemas
export const ProductFilterSchema = z.object({
  kind: ProductKindEnum.optional(),
  category: ProductCategoryEnum.optional(),
  coffee_type: CoffeeTypeEnum.optional(),
  grind_level: GrindLevelEnum.optional(),
  condition: ConditionEnum.optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  search: z.string().optional(),
})

export const CreateProductSchema = z.object({
  kind: ProductKindEnum,
  category: ProductCategoryEnum,
  sku: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  coffee_type: CoffeeTypeEnum.default('unknown'),
  grind_level: GrindLevelEnum.default('unknown'),
  condition: ConditionEnum.default('unknown'),
  price_idr: z.number().positive('Price must be positive'),
  stock_qty: z.number().nonnegative('Stock must be non-negative'),
  unit: z.string().default('kg'),
  image_urls: z.array(z.string().url()).optional(),
  published: z.boolean().default(false),
})

export const UpdateProductSchema = CreateProductSchema.partial()

// Order schemas  
export const ShippingAddressSchema = z.object({
  recipient_name: z.string().min(1, 'Recipient name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().min(5, 'Valid postal code is required'),
  area_id: z.string().min(1, 'Area ID is required'),
})

export const CartItemSchema = z.object({
  product_id: z.number().positive(),
  quantity: z.number().positive('Quantity must be positive'),
})

export const CheckoutSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'At least one item is required'),
  shipping_address: ShippingAddressSchema,
  courier_company: z.string().min(1, 'Courier selection is required'),
  courier_service: z.string().min(1, 'Courier service is required'),
  notes: z.string().optional(),
})

// Review schema
export const CreateReviewSchema = z.object({
  order_item_id: z.number().positive(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
})

// Magazine schemas
export const CreateMagazinePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content_md: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(false),
})

export const UpdateMagazinePostSchema = CreateMagazinePostSchema.partial()

// AI schemas
export const AIAnalyzeSchema = z.object({
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(3, 'Maximum 3 images allowed'),
})

export const SiKupiBotSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  conversation_history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
})

// Auth schemas
export const SignUpSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
})

export const SignInSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
})

// Export types
export type ProductFilter = z.infer<typeof ProductFilterSchema>
export type CreateProduct = z.infer<typeof CreateProductSchema>
export type UpdateProduct = z.infer<typeof UpdateProductSchema>
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>
export type CartItem = z.infer<typeof CartItemSchema>
export type Checkout = z.infer<typeof CheckoutSchema>
export type CreateReview = z.infer<typeof CreateReviewSchema>
export type CreateMagazinePost = z.infer<typeof CreateMagazinePostSchema>
export type UpdateMagazinePost = z.infer<typeof UpdateMagazinePostSchema>
export type AIAnalyze = z.infer<typeof AIAnalyzeSchema>
export type SiKupiBot = z.infer<typeof SiKupiBotSchema>
export type SignUp = z.infer<typeof SignUpSchema>
export type SignIn = z.infer<typeof SignInSchema>