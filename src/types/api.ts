// External API Types

// Midtrans Types
export interface MidtransSnapRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    email: string;
    phone: string;
  };
  item_details: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export interface MidtransWebhookPayload {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  gross_amount: string;
  fraud_status: string;
  currency: string;
}

// Biteship Types
export interface BiteshipsRatesRequest {
  origin_area_id: string;
  destination_area_id: string;
  couriers: string;
  items: Array<{
    name: string;
    value: number;
    weight: number;
    quantity: number;
  }>;
}

export interface BiteshipsRatesResponse {
  success: boolean;
  message: string;
  origin: any;
  destination: any;
  pricing: Array<{
    company: string;
    courier_name: string;
    courier_code: string;
    courier_service_name: string;
    courier_service_code: string;
    type: string;
    duration: string;
    price: number;
    available_for_cash_on_delivery: boolean;
    available_for_proof_of_delivery: boolean;
    available_for_instant_waybill_id: boolean;
    available_for_insurance: boolean;
  }>;
}

export interface BiteshipsOrderRequest {
  shipper_contact_name: string;
  shipper_contact_phone: string;
  shipper_contact_email: string;
  shipper_organization: string;
  origin_contact_name: string;
  origin_contact_phone: string;
  origin_address: string;
  origin_postal_code: number;
  origin_area_id: string;
  destination_contact_name: string;
  destination_contact_phone: string;
  destination_contact_email: string;
  destination_address: string;
  destination_postal_code: number;
  destination_area_id: string;
  courier_company: string;
  courier_type: string;
  courier_insurance?: number;
  delivery_type: string;
  order_note?: string;
  items: Array<{
    name: string;
    description: string;
    value: number;
    quantity: number;
    height: number;
    length: number;
    weight: number;
    width: number;
  }>;
}

export interface BiteshipsOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    waybill_id: string;
    courier: {
      company: string;
      name: string;
      phone: string;
    };
    delivery_fee: number;
    insurance_fee: number;
  };
}

export interface BiteshipsWebhookPayload {
  courier_waybill_id: string;
  courier_company: string;
  courier_driver_name: string;
  courier_driver_phone: string;
  order_id: string;
  status: string;
}

// AI Types
export interface AIAnalyzeRequest {
  images: string[];
}

export interface AIAnalyzeResponse {
  coffee_type: string;
  grind_level: string;
  condition: string;
  price_min_idr: number;
  confidence_score: number;
  model_version: string;
}

export interface SiKupiBotRequest {
  message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface SiKupiBotResponse {
  message: string;
  model_version: string;
}

// Cart Types
export interface CartItem {
  product_id: number;
  product: {
    title: string;
    price_idr: number;
    image_urls: string[] | null;
    coffee_type?: string;
    grind_level?: string;
    condition?: string;
  };
  quantity: number;
}

export interface ShippingAddress {
  recipient_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  area_id: string;
}

// Payment Flow Types
export interface CreatePaymentRequest {
  buyer_id: string;
  items: Array<{
    product_id: number;
    quantity: number;
    coffee_type?: string;
    grind_level?: string;
    condition?: string;
  }>;
  shipping_address: ShippingAddress;
  shipping_fee_idr: number;
  courier_company?: string;
  courier_service?: string;
  notes?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  data?: {
    order_id: number;
    midtrans_order_id: string;
    snap_token: string;
    redirect_url: string;
    total_amount: number;
    formatted_amount: string;
    expires_at: string;
  };
  error?: string;
  details?: string | string[];
}

export interface PaymentResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  merchant_id?: string;
  gross_amount: string;
  currency: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  fraud_status?: string;
  masked_card?: string;
  bank?: string;
}

export interface PaymentCallbacks {
  onSuccess?: (result: PaymentResult) => void;
  onPending?: (result: PaymentResult) => void;
  onError?: (result: PaymentResult) => void;
  onClose?: () => void;
}

export interface OrderDetails {
  id: number;
  midtrans_order_id: string;
  total_idr: number;
  status: 'new' | 'pending_payment' | 'paid' | 'packed' | 'shipped' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  expires_at?: string;
  shipping_address?: ShippingAddress;
  order_items: Array<{
    id: number;
    product_id: number;
    product_title: string;
    qty: number;
    price_idr: number;
    coffee_type?: string;
    grind_level?: string;
    condition?: string;
  }>;
}